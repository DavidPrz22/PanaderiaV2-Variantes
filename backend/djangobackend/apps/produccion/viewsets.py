from apps.users.models import User
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.core.management import call_command
from apps.produccion.models import Produccion, DetalleProduccionConsumos
from apps.produccion.models import Recetas, RecetasDetalles, RelacionesRecetas
from apps.inventario.models import (
    MateriasPrimas, 
    ProductosElaborados, 
    ProductosIntermedios, 
    ProductosFinales, 
    LotesProductosElaborados, 
    LotesStatus, 
    ProductosElaboradosVariantes
)
from apps.inventario.services import ExpirarLotesService
from apps.produccion.serializers import (RecetasSerializer, RecetasListSerializer, RecetasDetallesSerializer, RecetasSearchSerializer, ProduccionSerializer, ProduccionDetallesSerializer)
from django.db.models import Q
from django.core.exceptions import ValidationError
from apps.produccion.services import ProductionValidationService, StockConsumptionService, ProductionService
from apps.core.services.services import NotificationService
from decimal import Decimal
from django.utils import timezone
from djangobackend.permissions import IsStaffLevelOnly
from djangobackend.pagination import StandardResultsSetPagination
import logging
logger = logging.getLogger(__name__)


class RecetasViewSet(viewsets.ModelViewSet):
    queryset = Recetas.objects.all().order_by('id')
    serializer_class = RecetasSerializer
    permission_classes = [IsStaffLevelOnly]
    pagination_class = StandardResultsSetPagination

    def get_serializer_class(self):
        if self.action == 'list':
            return RecetasListSerializer
        if self.action == 'retrieve':
            return RecetasDetallesSerializer
        return self.serializer_class

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            with transaction.atomic():
                # Extract non-model data
                componentes_data = serializer.validated_data.pop('componentes', [])
                relacionadas_data = serializer.validated_data.pop('recetas_relacionadas', [])
                
                # Save the main recipe instance
                # Using Recetas.objects.create since serializer.save() might still try to use popped data 
                # if not careful, but actually serializer.save() would work too now.
                receta = Recetas.objects.create(**serializer.validated_data)

                # Create recipe components
                recetas_detalles = []
                for comp in componentes_data:
                    tipo = comp.get('tipo')
                    comp_id = comp.get('componente_id')
                    cantidad = comp.get('cantidad', 0)
                    
                    if tipo == 'MateriaPrima':
                        recetas_detalles.append(RecetasDetalles(
                            receta=receta,
                            componente_materia_prima_id=comp_id,
                            cantidad=cantidad
                        ))
                    elif tipo == 'ProductoIntermedio':
                        recetas_detalles.append(RecetasDetalles(
                            receta=receta,
                            componente_producto_intermedio_id=comp_id,
                            cantidad=cantidad
                        ))
                
                if recetas_detalles:
                    RecetasDetalles.objects.bulk_create(recetas_detalles)

                # Create recipe relationships
                if relacionadas_data:
                    relaciones = [
                        RelacionesRecetas(
                            receta_principal=receta,
                            subreceta_id=rel.get('receta_id')
                        )
                        for rel in relacionadas_data
                    ]
                    RelacionesRecetas.objects.bulk_create(relaciones)

                return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, *args, **kwargs):
        try:
            receta_id = kwargs.get('pk')
            receta_componentes = RecetasDetalles.objects.filter(receta=receta_id)
            receta_instance = self.get_queryset().get(id=receta_id)
            # Serialize the main recipe instance
            receta_serializer = self.get_serializer(receta_instance)

            lista_componentes = []
            for receta_componente in receta_componentes:
                if receta_componente.componente_materia_prima:
                    lista_componentes.append({
                        'id': receta_componente.componente_materia_prima.id,
                        'nombre': receta_componente.componente_materia_prima.nombre,
                        'tipo': 'MateriaPrima',
                        'cantidad': receta_componente.cantidad ,
                        'unidad_medida': receta_componente.componente_materia_prima.unidad_medida_base.abreviatura
                        })
                elif receta_componente.componente_producto_intermedio:
                    lista_componentes.append({
                        'id': receta_componente.componente_producto_intermedio.id,
                        'nombre': receta_componente.componente_producto_intermedio.nombre_producto,
                        'tipo': 'ProductoIntermedio',
                        'cantidad': receta_componente.cantidad,
                        'unidad_medida': receta_componente.componente_producto_intermedio.unidad_produccion.abreviatura
                        })

            relaciones_recetas = RelacionesRecetas.objects.filter(receta_principal=receta_id)
            lista_relaciones_recetas = []
            for relacion in relaciones_recetas:
                lista_relaciones_recetas.append({
                    'id': relacion.subreceta.id,
                    'nombre': relacion.subreceta.nombre
                })

            return Response({
                'receta': receta_serializer.data,
                'componentes': lista_componentes,
                'relaciones_recetas': lista_relaciones_recetas
                    })
        except Recetas.DoesNotExist:
            return Response({'error': 'Receta not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


        
    @action(detail=True, methods=['put'])
    def update_receta(self, request, *args, **kwargs):
        receta_id = kwargs.get('pk')
        
        try:
            with transaction.atomic():
                # Update the main recipe
                receta_instance = Recetas.objects.get(id=receta_id)
                serializer = self.get_serializer(receta_instance, data=request.data)
                serializer.is_valid(raise_exception=True)
                
                # Extract non-model data
                componentes_data = serializer.validated_data.pop('componentes', [])
                relacionadas_data = serializer.validated_data.pop('recetas_relacionadas', [])
                
                # Update main recipe
                serializer.save()

                # --- Componentes Update Logic ---
                existing_details = RecetasDetalles.objects.filter(receta=receta_instance)
                existing_mp_map = {det.componente_materia_prima_id: det for det in existing_details if det.componente_materia_prima_id}
                existing_pi_map = {det.componente_producto_intermedio_id: det for det in existing_details if det.componente_producto_intermedio_id}

                incoming_mp_ids = set()
                incoming_pi_ids = set()
                details_to_update = []
                details_to_create = []

                for comp_data in componentes_data:
                    cantidad = comp_data.get('cantidad', 0)
                    componente_id = comp_data.get('componente_id')
                    tipo = comp_data.get('tipo')

                    if tipo == 'MateriaPrima':
                        incoming_mp_ids.add(componente_id)
                        if componente_id in existing_mp_map:
                            detail = existing_mp_map[componente_id]
                            if detail.cantidad != cantidad:
                                detail.cantidad = cantidad
                                details_to_update.append(detail)
                        else:
                            details_to_create.append(RecetasDetalles(
                                receta=receta_instance,
                                componente_materia_prima_id=componente_id,
                                cantidad=cantidad
                            ))
                    
                    elif tipo == 'ProductoIntermedio':
                        incoming_pi_ids.add(componente_id)
                        if componente_id in existing_pi_map:
                            detail = existing_pi_map[componente_id]
                            if detail.cantidad != cantidad:
                                detail.cantidad = cantidad
                                details_to_update.append(detail)
                        else:
                            details_to_create.append(RecetasDetalles(
                                receta=receta_instance,
                                componente_producto_intermedio_id=componente_id,
                                cantidad=cantidad
                            ))

                # Delete components not in incoming data
                mp_ids_to_delete = set(existing_mp_map.keys()) - incoming_mp_ids
                if mp_ids_to_delete:
                    RecetasDetalles.objects.filter(receta=receta_instance, componente_materia_prima_id__in=mp_ids_to_delete).delete()
                
                pi_ids_to_delete = set(existing_pi_map.keys()) - incoming_pi_ids
                if pi_ids_to_delete:
                    RecetasDetalles.objects.filter(receta=receta_instance, componente_producto_intermedio_id__in=pi_ids_to_delete).delete()

                if details_to_update:
                    RecetasDetalles.objects.bulk_update(details_to_update, ['cantidad'])
                
                if details_to_create:
                    RecetasDetalles.objects.bulk_create(details_to_create)

                # --- Relaciones Update Logic ---
                receta_relacionadas_registradas = RelacionesRecetas.objects.filter(receta_principal=receta_instance)
                current_related_ids = set(receta_relacionadas_registradas.values_list('subreceta_id', flat=True))
                new_related_ids = {rel.get('receta_id') for rel in relacionadas_data}

                relationships_to_delete = receta_relacionadas_registradas.filter(
                    subreceta_id__in=current_related_ids - new_related_ids
                )
                relationships_to_delete.delete()

                ids_to_create = new_related_ids - current_related_ids
                if ids_to_create:
                    new_relationships = [
                        RelacionesRecetas(
                            receta_principal=receta_instance,
                            subreceta_id=receta_id
                        )
                        for receta_id in ids_to_create
                    ]
                    RelacionesRecetas.objects.bulk_create(new_relationships)

                return Response(serializer.data, status=status.HTTP_200_OK)
                
        except Recetas.DoesNotExist:
            return Response({'error': 'Receta not found'}, status=status.HTTP_404_NOT_FOUND)
        except (MateriasPrimas.DoesNotExist, ProductosElaborados.DoesNotExist):
            return Response({'error': 'Component not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], serializer_class=RecetasSearchSerializer, pagination_class=None)
    def search(self, request):
        search_query = request.query_params.get('search')
        recetaId = request.query_params.get('recetaId', None)
        search_on_receta = request.query_params.get('searchOnReceta', None)

        if not search_query:
            return Response(status=status.HTTP_400_BAD_REQUEST, data={"error": "El parámetro 'search' es requerido"})

        filters = Q(nombre__icontains=search_query)

        if not search_on_receta:
            filters &= Q(producto_elaborado__isnull=True)

        if recetaId:
            filters &= ~Q(id=recetaId)
        recetas = Recetas.objects.filter(filters)
        
        serializer = self.get_serializer(recetas, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='generar-recetas')
    def generar_recetas(self, request):
        try:
            call_command('register_recetas')
            return Response(
                {'message': 'Recetas generadas exitosamente'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            logger.error(f"Error generating recipes: {str(e)}")
            return Response(
                {'error': f'Error al generar recetas: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ProduccionesViewSet(viewsets.ModelViewSet):
    queryset = Produccion.objects.all()
    serializer_class = ProduccionSerializer
    permission_classes = [IsStaffLevelOnly]


    def create(self, request, *args, **kwargs):

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        print(serializer.validated_data)
        try:
            with transaction.atomic():
                # Expire old lots before processing
                ExpirarLotesService.expirar_todos_lotes_viejos(True)
                
                producto_variante = ProductionValidationService.validate_production_data(serializer.validated_data)
                # Extract validated data
                componentes = serializer.validated_data.get('componentes', [])

                # Separate components by type
                mp_componentes = [c for c in componentes if c['tipo'] == 'MateriaPrima']
                pi_componentes = [c for c in componentes if c['tipo'] == 'ProductoIntermedio']

                # Get component instances
                materias_primas_produccion = MateriasPrimas.objects.filter(
                    id__in=[c['componente_id'] for c in mp_componentes]
                ).select_related('unidad_medida_base', 'categoria')

                productos_intermedios_produccion = ProductosElaboradosVariantes.objects.filter(
                    id__in=[c['componente_id'] for c in pi_componentes]
                ).select_related('producto_elaborado', 'producto_elaborado__unidad_produccion', 'producto_elaborado__categoria')

                # Create quantity maps
                map_mp_cantidad = {c['componente_id']: Decimal(str(c['cantidad']))for c in mp_componentes}
                map_pi_cantidad = {c['componente_id']: Decimal(str(c['cantidad'])) for c in pi_componentes}

                ProductionValidationService.validate_component_availability(
                    materias_primas_produccion, 
                    productos_intermedios_produccion, 
                    map_mp_cantidad, 
                    map_pi_cantidad
                )

                # Create production record using service
                produccion = ProductionService.create_production_record(
                    producto_variante=producto_variante,
                    cantidad_produccion=serializer.validated_data.get('cantidadProduction'),
                    fecha_expiracion=serializer.validated_data.get('fechaExpiracion'),
                    user=User.objects.get(id=1), # TODO: Change this to the current user
                )

                costo_total_divisa, costo_total_local = StockConsumptionService.consume_materials_and_intermediates(
                    materias_primas_produccion, 
                    productos_intermedios_produccion, 
                    map_mp_cantidad, 
                    map_pi_cantidad,
                    produccion
                )

                # Update total cost
                produccion.costo_total_componentes_divisa = costo_total_divisa
                produccion.costo_total_componentes_local = costo_total_local
                produccion.save(update_fields=['costo_total_componentes_divisa', 'costo_total_componentes_local'])

                # Create product lot using service
                lote = ProductionService.create_product_lot(
                    produccion=produccion,
                    producto_variante=producto_variante,
                    cantidad=serializer.validated_data.get('cantidadProduction'),
                    fecha_expiracion=serializer.validated_data.get('fechaExpiracion'),
                    costo_total_divisa=costo_total_divisa,
                    costo_total_local=costo_total_local,
                    peso=serializer.validated_data.get('peso', None),
                    volumen=serializer.validated_data.get('volumen', None)
                )

                # update components stock
                product_id = serializer.validated_data.get('producto_variante_id')
                StockConsumptionService.update_components_stock(product_id)

                # Check for stock and expiration notifications after production
                
                # try:
                #     # Check stock levels for consumed materials
                #     NotificationService.check_low_stock(MateriasPrimas)
                #     NotificationService.check_sin_stock(MateriasPrimas)
                #     NotificationService.check_low_stock(ProductosIntermedios)
                #     NotificationService.check_sin_stock(ProductosIntermedios)
                    
                #     # Check expiration of new lot created
                #     NotificationService.check_expiration_date(ProductosElaborados, LotesProductosElaborados)
                # except Exception as notif_error:
                #     # Log but don't fail the request
                #     logger.error(f"Failed to create notifications: {str(notif_error)}")

                return Response({
                    "message": "Producción registrada exitosamente",
                    "produccion_id": produccion.id,
                    "lote_id": lote.id,
                    "costo_total_divisa": costo_total_divisa,
                    "costo_total_local": costo_total_local
                }, status=status.HTTP_201_CREATED)

        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": f"Error interno: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get_serializer_class(self):
        if self.action == 'list':
            return ProduccionDetallesSerializer
        return self.serializer_class

    def list(self, request, *args, **kwargs):
        
        offset = 10
        page = int(request.query_params.get('page', 1))
        start = (page - 1) * offset
        end = start + offset

        queryset = Produccion.objects.order_by('-fecha_produccion', '-id')[start:end]
        serializer = self.get_serializer(queryset, many=True)
        
        total_count = Produccion.objects.count()
        
        return Response({
            "data": serializer.data, 
            "page": page,
            "total_count": total_count,
            "total_pages": (total_count + offset - 1) // offset
        })
