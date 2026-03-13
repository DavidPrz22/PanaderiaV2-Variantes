from rest_framework import viewsets, status
from apps.inventario.models import ( 
    MateriasPrimas, MateriasPrimasVariantes, LotesMateriasPrimas, 
    ProductosIntermedios,
    ProductosFinales, 
    ProductosElaborados, ProductosElaboradosVariantes, LotesProductosElaborados, 
    ProductosReventa, ProductosReventaVariantes, LotesProductosReventa, 
    ComponentesStockManagement
    )
from apps.produccion.models import Recetas, RecetasDetalles, RelacionesRecetas
from apps.inventario.serializers import (
    ComponentesSearchSerializer, MateriaPrimaDetailsSerializer, MateriaPrimaListSerializer, MateriaPrimaSerializer, 
    MateriaPrimaVariantesDetallesSerializer, LotesMateriaPrimaSerializer, 
    ProductosIntermediosSerializer, ProductosIntermediosListSerializer, ProductosFinalesSerializer, ProductosIntermediosDetallesSerializer, 
    ProductosElaboradosSerializer, ProductosFinalesSearchSerializer, ProductosFinalesListSerializer,
    ProductosIntermediosSearchSerializer, ProductosFinalesListaTransformacionSerializer, LotesProductosElaboradosSerializer, 
    ProductosReventaSerializer, ProductosReventaListSerializer, LotesProductosReventaSerializer, RegisterCSVSerializer, ProductosReventaDetallesSerializer
)
from rest_framework.response import Response
from rest_framework.decorators import action
from apps.compras.models import Proveedores
from apps.core.services.services import NotificationService
from apps.core.models import CategoriasMateriaPrima, CategoriasProductosReventa, UnidadesDeMedida
from datetime import datetime
from collections import defaultdict
from apps.inventario.models import LotesStatus
from djangobackend.permissions import IsStaffOrVendedorReadOnly
from djangobackend.pagination import StandardResultsSetPagination

from django.db import transaction

class MateriaPrimaViewSet(viewsets.ModelViewSet):
    queryset = MateriasPrimas.objects.all().order_by('id')
    serializer_class = MateriaPrimaSerializer
    permission_classes = [IsStaffOrVendedorReadOnly]
    pagination_class = StandardResultsSetPagination

    def get_serializer_class(self):
        if self.action == 'list':
            return MateriaPrimaListSerializer
        if self.action == 'retrieve':
            return MateriaPrimaDetailsSerializer
        return MateriaPrimaSerializer

    @action(detail=False, methods=['post'], url_path='register-csv',)
    def register_csv(self, request):
        import base64
        import csv
        import io

        serializer = RegisterCSVSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        file = serializer.validated_data['file']
        decoded_file = base64.b64decode(file)
        text_stream = io.TextIOWrapper(io.BytesIO(decoded_file), encoding='utf-8')

        reader = csv.DictReader(text_stream)
        materias_primas = []
        for mp in reader:
            mp_created = MateriasPrimas(
                nombre=mp['nombre'],
                SKU=mp['SKU'],
                precio_compra_usd=mp['precio_compra_usd'],
                nombre_empaque_estandar=mp.get('nombre_empaque_estandar') or None,
                cantidad_empaque_estandar=mp.get('cantidad_empaque_estandar') or None,
                unidad_medida_empaque_estandar_id=mp.get('unidad_medida_empaque_estandar_id') or None,
                punto_reorden=mp['punto_reorden'],
                unidad_medida_base_id=mp.get('unidad_medida_base_id'),
                categoria_id=mp.get('categoria_id'),
                descripcion=mp.get('descripcion')
            )
            materias_primas.append(mp_created)

        MateriasPrimas.objects.bulk_create(materias_primas)
        return Response({'message': "Materias primas registradas exitosamente"}, status=status.HTTP_200_OK)


    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data
    
        variantes = validated_data.get('variantes', None)

        mp_created = MateriasPrimas(
            nombre=validated_data.get('nombre'),
            unidad_medida_base=validated_data.get('unidad_medida_base'),
            SKU=validated_data.get('SKU'),
            punto_reorden=validated_data.get('punto_reorden'),
            categoria=validated_data.get('categoria'),
            descripcion=validated_data.get('descripcion')
        )
        mp_created.save()
        
        variantes_bucket = []
        if variantes:
            for variante in variantes:
                variantes_bucket.append(
                    MateriasPrimasVariantes(
                        materia_prima=mp_created,
                        nombre_variante=variante.get('nombre_variante'),
                        unidad_compra=variante.get('unidad_compra'),
                        SKU_variante=variante.get('SKU_variante'),
                        precio_compra_divisa=variante.get('precio_compra_divisa'),
                        precio_compra_local=variante.get('precio_compra_local'),
                        nombre_empaque_estandar=variante.get('nombre_empaque_estandar'),
                        cantidad_empaque_estandar=variante.get('cantidad_empaque_estandar'),
                        unidad_medida_empaque_estandar=variante.get('unidad_medida_empaque_estandar'),
                    )
                )

            MateriasPrimasVariantes.objects.bulk_create(variantes_bucket)

        mp_object = MateriaPrimaDetailsSerializer(mp_created).data
        
        return Response({
            'message': "Materia prima creada exitosamente", 
            'data': mp_object
        }, status=status.HTTP_200_OK)


    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data
        
        # Extract variantes data
        variantes_data = validated_data.pop('variantes', None)
        
        try:
            with transaction.atomic():
                # Update main Materia Prima fields
                for attr, value in validated_data.items():
                    setattr(instance, attr, value)
                instance.save()
                
                if variantes_data is not None:
                    # Sync variants
                    existing_variantes = {v.id: v for v in instance.variantes.all()}
                    existing_ids = set(existing_variantes.keys())
                    
                    variantes_to_create = []
                    incoming_ids = set()
                    
                    for v_data in variantes_data:
                        v_id = v_data.get('id')
                        
                        if v_id and v_id in existing_ids:
                            # Update existing variant
                            incoming_ids.add(v_id)
                            variante_obj = existing_variantes[v_id]
                            for key, val in v_data.items():
                                if key != 'id':
                                    setattr(variante_obj, key, val)
                            variante_obj.save() 
                        
                        elif not v_id:
                            # Create new variant
                            if 'id' in v_data:
                                del v_data['id']
                            variantes_to_create.append(MateriasPrimasVariantes(materia_prima=instance, **v_data))
                    
                    # Bulk create new ones
                    if variantes_to_create:
                        MateriasPrimasVariantes.objects.bulk_create(variantes_to_create)
                    
                    # Delete removed variants
                    ids_to_delete = existing_ids - incoming_ids
                    if ids_to_delete:
                        MateriasPrimasVariantes.objects.filter(id__in=ids_to_delete).delete()

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # Refetch to return full data
        instance.refresh_from_db()
        return Response(MateriaPrimaDetailsSerializer(instance).data)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            
            # Check notifications globally
            try:
                NotificationService.check_low_stock(MateriasPrimas)
                NotificationService.check_sin_stock(MateriasPrimas)
            except Exception:
                pass 
                
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ComponenteSearchViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = MateriasPrimas.objects.none()
    serializer_class = ComponentesSearchSerializer
    
    def list(self, request, *args, **kwargs):
        search_query = request.query_params.get('search')
        stock_requested = request.query_params.get('stock')

        if not search_query:
            return Response(status=status.HTTP_400_BAD_REQUEST, data={"error": "El parámetro 'search' es requerido"})

        materia_primas = MateriasPrimas.objects.filter(
            nombre__icontains=search_query
        ).select_related('categoria')

        productos_intermedios = ProductosIntermedios.objects.filter(
            nombre_producto__icontains=search_query
        ).select_related('categoria')

        categorias_dict = defaultdict(list)
        for materia_prima in materia_primas:
            categoria = materia_prima.categoria.nombre_categoria
            componente_data = {
                'id': materia_prima.id, 
                'nombre': materia_prima.nombre,
                'tipo': 'MateriaPrima',
                'unidad_medida': materia_prima.unidad_medida_base.abreviatura
            }
            if stock_requested: 
                componente_data['stock'] = materia_prima.stock_actual

            categorias_dict[categoria].append(componente_data)

        for intermedio in productos_intermedios:
            categoria = intermedio.categoria.nombre_categoria
            componente_data = {
                'id': intermedio.id,
                'nombre': intermedio.nombre_producto,
                'tipo': 'ProductoIntermedio',
                'unidad_medida': intermedio.unidad_produccion.abreviatura
            }
            if stock_requested:
                componente_data['stock'] = intermedio.stock_actual

            categorias_dict[categoria].append(componente_data)

        # Use the serializer to format the data
        componentes_por_categoria = []
        for categoria, items in categorias_dict.items():
            serializer = self.get_serializer(items, many=True)
            componentes_por_categoria.append({categoria: serializer.data})

        return Response(componentes_por_categoria)


class LotesMateriaPrimaViewSet(viewsets.ModelViewSet):
    queryset = LotesMateriasPrimas.objects.all()
    serializer_class = LotesMateriaPrimaSerializer
    permission_classes = [IsStaffOrVendedorReadOnly]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        queryset = super().get_queryset()
        materia_prima = self.request.query_params.get('materia_prima')
        if materia_prima:
            variantes_id = MateriasPrimasVariantes.objects.filter(materia_prima=materia_prima).values_list('id', flat=True)
            queryset = queryset.filter(variante_materia_prima__in=variantes_id)
        return queryset

    def get_serializer_class(self):
        if self.action == 'list' or self.action == 'retrieve':
            return LotesMateriaPrimaDetailsSerializer
        return LotesMateriaPrimaSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({"results": serializer.data})

    def destroy(self, request, *args, **kwargs):
        from django.db import transaction
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            # with transaction.atomic():
            #     try:
            #         NotificationService.check_low_stock(MateriasPrimas)
            #         NotificationService.check_sin_stock(MateriasPrimas)
            #     except Exception as notif_error:
            #         import logging
            #         logger = logging.getLogger(__name__)
            #         logger.error(f"Failed to create notifications: {str(notif_error)}")
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        serializer.validated_data['stock_actual_lote'] = serializer.validated_data['cantidad_recibida']
        
        # Save only once through perform_create
        self.perform_create(serializer)

        # Check expiration notifications for newly created lot
        try:
            NotificationService.check_expiration_date(MateriasPrimas, LotesMateriasPrimas)
        except Exception as notif_error:
            # Log but don't fail the request
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to create notifications: {str(notif_error)}")
        
        return Response(status=status.HTTP_201_CREATED)


    def update(self, request, *args, **kwargs):
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            
            # Store old cantidad_recibida to calculate delta
            old_cantidad_recibida = instance.cantidad_recibida
            
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            
            # If quantity received changed, adjust the current stock in the lot
            if 'cantidad_recibida' in serializer.validated_data:
                new_cantidad_recibida = serializer.validated_data['cantidad_recibida']
                delta = new_cantidad_recibida - old_cantidad_recibida
                instance.stock_actual_lote += delta
                if instance.stock_actual_lote < 0:
                    instance.stock_actual_lote = 0
            
            self.perform_update(serializer)
            
            # Save the adjusted stock
            instance.save(update_fields=['stock_actual_lote'])
            
            # Update the main material stock
            if instance.materia_prima:
                instance.materia_prima.actualizar_stock()
                
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    
    @action(detail=True, methods=['post'], url_path='update-status')
    def update_status(self, request, pk=None):
        try:
            lote = LotesMateriasPrimas.objects.get(id=pk)
            action = request.data.get('action')
            
            if lote.fecha_caducidad > datetime.now().date():
                
                if action == 'INACTIVAR':
                    lote.estado = LotesStatus.INACTIVO
                elif action == 'ACTIVAR':
                    lote.estado = LotesStatus.DISPONIBLE
                
                materia_prima = lote.materia_prima
                lote.save(update_fields=['estado'])
                materia_prima.actualizar_stock()
                return Response(status=status.HTTP_200_OK)
            else:
                return Response(
                    status=status.HTTP_400_BAD_REQUEST, 
                data={"error": "Este Lote ya caducó"}
            )
                
        except LotesMateriasPrimas.DoesNotExist:
            return Response(
                status=status.HTTP_404_NOT_FOUND, 
                data={"error": "Lote no encontrado"}
            )


class ProductosElaboradosViewSet(viewsets.ModelViewSet):
    queryset = ProductosElaborados.objects.all()
    serializer_class = ProductosElaboradosSerializer
    permission_classes = [IsStaffOrVendedorReadOnly]

    @action(detail=True, methods=['post'], url_path='clear-receta-relacionada')
    def clear_receta_relacionada(self, request, *args, **kwargs):
        producto_id = kwargs.get('pk')
        receta = Recetas.objects.filter(producto_elaborado=producto_id)
        if receta.exists():
            receta.update(producto_elaborado=None)
        return Response(status=status.HTTP_200_OK)

    def _get_component_data(self, detalle):
        """Helper function to extract component data from a RecetasDetalles instance."""
        if detalle.componente_materia_prima:
            component = detalle.componente_materia_prima
            cantidad = detalle.cantidad
            unit = component.unidad_medida_base
            return {
                "id": component.id,
                "nombre": component.nombre,
                "unidad_medida": unit.abreviatura,
                "stock": component.stock_actual,
                "cantidad": cantidad,
                'tipo': 'MateriaPrima'
            }
        elif detalle.componente_producto_intermedio:
            component = detalle.componente_producto_intermedio
            cantidad = detalle.cantidad
            unit = component.unidad_produccion
            return {
                "id": component.id,
                "nombre": component.nombre_producto,
                "unidad_medida": unit.abreviatura,
                "stock": component.stock_actual,
                "cantidad": cantidad,
                'tipo': 'ProductoIntermedio'
            }
        return None

    def _get_all_sub_recetas(self, receta_principal_id, subrecetas_lista: list):
        """Recursively fetches all sub-recipes and their components."""

        sub_relaciones = RelacionesRecetas.objects.filter(receta_principal_id=receta_principal_id).select_related('subreceta')
        
        if not sub_relaciones.exists():
            return []

        sub_recetas_ids = [rel.subreceta_id for rel in sub_relaciones]
        
        # Fetch all details for all sub-recipes in one go to avoid N+1 queries
        all_detalles = RecetasDetalles.objects.filter(
            receta_id__in=sub_recetas_ids
        ).select_related(
            'componente_materia_prima__unidad_medida_base',
            'componente_producto_intermedio__unidad_produccion'
        )

        # Group details by recipe id for efficient lookup
        detalles_map = defaultdict(list)
        for detalle in all_detalles:
            detalles_map[detalle.receta_id].append(detalle)

        for relacion in sub_relaciones:
            subreceta = relacion.subreceta
            componentes = [self._get_component_data(d) for d in detalles_map.get(subreceta.id, []) if d is not None]
            
            # Recursively find children of the current sub-recipe

            subrecetas_lista.append({
                'nombre': subreceta.nombre,
                'componentes': componentes,
            })

            self._get_all_sub_recetas(subreceta.id, subrecetas_lista)

    @action(detail=True, methods=['get'], url_path='get-receta-producto')
    def get_receta_producto(self, request, *args, **kwargs):
        producto_id = kwargs.get('pk')
        try:
            receta_principal = Recetas.objects.get(producto_elaborado=producto_id)
        except Recetas.DoesNotExist:
            return Response({"error": "No se encontró la receta asociada"}, status=status.HTTP_404_NOT_FOUND)

        # Expire all old lots before getting recipe data
        ComponentesStockManagement.expirar_todos_lotes_viejos()

        detalles_receta_principal = RecetasDetalles.objects.filter(
            receta_id=receta_principal.id
        ).select_related(
            'componente_materia_prima__unidad_medida_base',
            'componente_producto_intermedio__unidad_produccion'
        )

        subrecetas = []
        self._get_all_sub_recetas(receta_principal.id, subrecetas)
        # Derive unit-based production flags from product's unidad_produccion
        producto_elaborado = receta_principal.producto_elaborado
        unidad_prod = getattr(producto_elaborado, 'unidad_produccion', None)
        medida_produccion = getattr(unidad_prod, 'nombre_completo', None)
        es_por_unidad = False
        try:
            # Normalize and compare
            es_por_unidad = (str(medida_produccion).strip().lower() == 'unidad') if medida_produccion else False
        except Exception:
            es_por_unidad = False

        producto_data = {
            'componentes': [self._get_component_data(d) for d in detalles_receta_principal if d is not None],
            'rendimiento': receta_principal.rendimiento,
            'subrecetas': subrecetas,
            'medida_produccion': medida_produccion,
            'es_por_unidad': es_por_unidad,
            'tipo_medida_fisica': producto_elaborado.tipo_medida_fisica,
        }

        return Response(producto_data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'], url_path='lotes')
    def lotes(self, request, *args, **kwargs):
        producto_id = kwargs.get('pk')
        
        lotes = LotesProductosElaborados.objects.filter(producto_elaborado=producto_id)
        serializer = LotesProductosElaboradosSerializer(lotes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class LotesProductosElaboradosViewSet(viewsets.ModelViewSet):
    queryset = LotesProductosElaborados.objects.order_by('fecha_caducidad')
    permission_classes = [IsStaffOrVendedorReadOnly]
    serializer_class = LotesProductosElaboradosSerializer
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        queryset = super().get_queryset()
        producto_elaborado = self.request.query_params.get('producto_elaborado')
        if producto_elaborado:
            producto_variantes = ProductosElaboradosVariantes.objects.filter(producto_elaborado=producto_elaborado).values_list('id', flat=True)
            queryset = queryset.filter(producto_elaborado_variante_id__in=producto_variantes)
        return queryset

    def destroy(self, request, *args, **kwargs):
        from django.db import transaction
        try:
            instance = self.get_object()
            producto = instance.producto_elaborado
            
            with transaction.atomic():
                self.perform_destroy(instance)

                # Check stock notifications after lot deletion
                try:
                    NotificationService.check_low_stock(ProductosElaborados)
                    NotificationService.check_sin_stock(ProductosElaborados)
                except Exception as notif_error:
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.error(f"Failed to create notifications: {str(notif_error)}")
                
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    

    @action(detail=True, methods=['get'], url_path='change-estado-lote')
    def change_estado_lote(self, request, *args, **kwargs):
        try:
            lote_id = kwargs.get('pk')
            lote = LotesProductosElaborados.objects.get(id=lote_id)
            producto = lote.producto_elaborado
            if lote.estado == 'DISPONIBLE':
                if lote.fecha_caducidad > datetime.now().date():
                    lote.estado = LotesStatus.INACTIVO
                    lote.save(update_fields=['estado'])
                    producto.actualizar_stock()
                else:
                    return Response(
                        status=status.HTTP_400_BAD_REQUEST, 
                        data={"error": "Este Lote ya caducó"}
                    )
            elif lote.estado == 'INACTIVO':

                if lote.fecha_caducidad > datetime.now().date():
                    lote.estado = LotesStatus.DISPONIBLE
                    lote.save(update_fields=['estado'])
                    producto.actualizar_stock()
                else:
                    return Response(
                        status=status.HTTP_400_BAD_REQUEST, 
                        data={"error": "Este Lote ya caducó"}
                    )
            
            # Check stock notifications after lot state change
            try:
                NotificationService.check_low_stock(ProductosElaborados)
                NotificationService.check_sin_stock(ProductosElaborados)
            except Exception as notif_error:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Failed to create notifications: {str(notif_error)}")
            
            return Response({"message": "Estado del lote cambiado correctamente"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ProductosIntermediosViewSet(viewsets.ModelViewSet):
    queryset = ProductosIntermedios.objects.all().order_by('id')
    serializer_class = ProductosIntermediosSerializer
    permission_classes = [IsStaffOrVendedorReadOnly]
    pagination_class = StandardResultsSetPagination


    def get_serializer_class(self):
        if self.action == 'list':
            return ProductosIntermediosListSerializer
        if self.action == 'retrieve':
            return ProductosIntermediosDetallesSerializer
        return ProductosIntermediosSerializer


    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        variantes = serializer.validated_data.pop('variantes', [])
        
        try:
            with transaction.atomic():
                producto_intermedio = ProductosIntermedios.objects.create(
                    **serializer.validated_data, 
                    es_intermediario=True, 
                )
                variantes_create = []
                for variant in variantes:
                    variantes_create.append(
                        ProductosElaboradosVariantes(
                            producto_elaborado=producto_intermedio,
                            **variant
                        )
                    )
                ProductosElaboradosVariantes.objects.bulk_create(variantes_create)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        producto_data = ProductosIntermediosSerializer(producto_intermedio).data
        return Response({
            'message': 'Producto intermedio creado correctamente', 
            'producto_intermedio': producto_data
        }, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data
        
        # Extract variants data
        variantes_data = validated_data.pop('variantes', None)
        
        try:
            with transaction.atomic():
                # Update main product fields
                for attr, value in validated_data.items():
                    setattr(instance, attr, value)
                instance.save()
                
                if variantes_data is not None:
                    # Sync variants
                    variantes_in_mp = instance.variantes.all()
                    print(variantes_data)
                    existing_variantes = {v.id: v for v in variantes_in_mp}
                    existing_ids = set(existing_variantes.keys())
                    
                    variantes_to_create = []
                    incoming_ids = set()
                    
                    for v_data in variantes_data:
                        v_id = v_data.get('id')
                        
                        if v_id and v_id in existing_ids:
                            # Update existing variant
                            incoming_ids.add(v_id)
                            variante_obj = existing_variantes[v_id]
                            for key, val in v_data.items():
                                if key != 'id':
                                    setattr(variante_obj, key, val)
                            variante_obj.save() 
                        
                        elif not v_id:
                            # Create new variant
                            if 'id' in v_data:
                                del v_data['id']
                            variantes_to_create.append(
                                ProductosElaboradosVariantes(
                                    producto_elaborado=instance, 
                                    **v_data
                                )
                            )
                    
                    # Bulk create new ones
                    if variantes_to_create:
                        ProductosElaboradosVariantes.objects.bulk_create(variantes_to_create)
                    
                    # Delete removed variants
                    ids_to_delete = existing_ids - incoming_ids
                    if ids_to_delete:
                        # Before deleting, check if they have lots or other relations
                        ProductosElaboradosVariantes.objects.filter(id__in=ids_to_delete).delete()

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # Refetch and return full data
        instance.refresh_from_db()
        return Response(ProductosIntermediosDetallesSerializer(instance).data)


class ProductosFinalesViewSet(viewsets.ModelViewSet):
    queryset = ProductosFinales.objects.all().order_by('id')
    serializer_class = ProductosFinalesSerializer
    permission_classes = [IsStaffOrVendedorReadOnly]
    pagination_class = StandardResultsSetPagination

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductosFinalesListSerializer
        if self.action == 'retrieve':
            return ProductosFinalesDetallesSerializer
        return ProductosFinalesSerializer

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        variantes = serializer.validated_data.pop('variantes', [])
        
        try:
            with transaction.atomic():
                producto_final = ProductosFinales.objects.create(
                    **serializer.validated_data, 
                    es_intermediario=False, 
                )
                variantes_create = []
                for variant in variantes:
                    variantes_create.append(
                        ProductosElaboradosVariantes(
                            producto_elaborado=producto_final,
                            **variant
                        )
                    )
                ProductosElaboradosVariantes.objects.bulk_create(variantes_create)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        producto_data = ProductosFinalesSerializer(producto_final).data
        return Response({
            'message': 'Producto final creado correctamente', 
            'producto_final': producto_data
        }, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data
        
        variantes_data = validated_data.pop('variantes', None)
        
        try:
            with transaction.atomic():
                # Update main product fields
                for attr, value in validated_data.items():
                    setattr(instance, attr, value)
                instance.save()
                
                if variantes_data is not None:
                    # Sync variants
                    variantes_in_mp = instance.variantes.all()
                    existing_variantes = {v.id: v for v in variantes_in_mp}
                    existing_ids = set(existing_variantes.keys())
                    
                    variantes_to_create = []
                    incoming_ids = set()
                    
                    for v_data in variantes_data:
                        v_id = v_data.get('id')
                        
                        if v_id and v_id in existing_ids:
                            # Update existing variant
                            incoming_ids.add(v_id)
                            variante_obj = existing_variantes[v_id]
                            for key, val in v_data.items():
                                if key != 'id':
                                    setattr(variante_obj, key, val)
                            variante_obj.save() 
                        
                        elif not v_id:
                            # Create new variant
                            if 'id' in v_data:
                                del v_data['id']
                            variantes_to_create.append(
                                ProductosElaboradosVariantes(
                                    producto_elaborado=instance, 
                                    **v_data
                                )
                            )
                    
                    if variantes_to_create:
                        ProductosElaboradosVariantes.objects.bulk_create(variantes_to_create)
                    
                    ids_to_delete = existing_ids - incoming_ids
                    if ids_to_delete:
                        ProductosElaboradosVariantes.objects.filter(id__in=ids_to_delete).delete()

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        instance.refresh_from_db()
        return Response(ProductosFinalesDetallesSerializer(instance).data)

    @action(detail=False, methods=['get'])
    def search(self, request):
        query = request.query_params.get('q', '').strip()
        search_type = request.query_params.get('type', 'origen')
        
        queryset = self.get_queryset()
        
        # Filtrar según el uso en transformaciones
        if search_type == 'destino':
            queryset = queryset.filter(usado_en_transformaciones=True)
        else:
            queryset = queryset.filter(usado_en_transformaciones=False)
            
        # Filtrar por nombre si hay query
        if query:
            queryset = queryset.filter(nombre_producto__icontains=query)
            
        serializer = ProductosFinalesSearchSerializer(queryset, many=True)
        return Response(serializer.data)


class ProductosFinalesSearchViewset(viewsets.ReadOnlyModelViewSet):
    queryset = ProductosFinales.objects.all()
    serializer_class = ProductosFinalesSearchSerializer

    def list(self, request, *args, **kwargs):

        productos = self.get_queryset()
        
        productos_con_recetas_ids = Recetas.objects.filter(
            producto_elaborado__in=productos
        ).values_list('producto_elaborado_id', flat=True).distinct()
        
        productos = productos.filter(id__in=productos_con_recetas_ids)
        
        page = self.paginate_queryset(productos)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
            
        serializer = self.get_serializer(productos, many=True)
        return Response(serializer.data)


class ProductosFinalesListaTransformacionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ProductosFinalesListaTransformacionSerializer
    queryset = ProductosFinales.objects.all()

    def get_queryset(self):
        queryset = ProductosFinales.objects.all()
        q = self.request.query_params.get('q')
        if q:
            print(f"ProductosFinalesListaTransformacionViewSet.get_queryset q=<{q}>")
            queryset = queryset.filter(nombre_producto__icontains=q)
            print(f"Filtered count: {queryset.count()}")
        else:
            print("ProductosFinalesListaTransformacionViewSet.get_queryset no q param")
        return queryset


class ProductosIntermediosSearchViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ProductosIntermedios.objects.all()
    serializer_class = ProductosIntermediosSearchSerializer


class ProductosReventaViewSet(viewsets.ModelViewSet):
    queryset = ProductosReventa.objects.all().order_by('id')
    serializer_class = ProductosReventaSerializer
    permission_classes = [IsStaffOrVendedorReadOnly]
    pagination_class = StandardResultsSetPagination

    @action(detail=False, methods=['post'], url_path='register-csv')
    def register_csv(self, request):
        import base64
        import csv
        import io

        try:
            serializer = RegisterCSVSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            file = serializer.validated_data['file']
            decoded_file = base64.b64decode(file)
            text_stream = io.TextIOWrapper(io.BytesIO(decoded_file), encoding='utf-8')

            reader = csv.DictReader(text_stream)
            productos_reventa = []
            for pr in reader:
                pr_created = ProductosReventa(
                    nombre_producto=pr['nombre_producto'],
                    SKU=pr['SKU'],
                    precio_compra_usd=pr.get('precio_compra_usd') or None,
                    precio_venta_usd=pr['precio_venta_usd'],
                    punto_reorden=pr.get('punto_reorden'),
                    unidad_base_inventario_id=pr.get('unidad_base_inventario_id'),
                    unidad_venta_id=pr.get('unidad_venta_id'),
                    categoria_id=pr.get('categoria_id'),
                    factor_conversion=pr.get('factor_conversion', 1.0),
                    marca=pr.get('marca') or None,
                    perecedero=pr.get('perecedero', 'FALSE').upper() == 'TRUE',
                    descripcion=pr.get('descripcion')
                )
                productos_reventa.append(pr_created)

            ProductosReventa.objects.bulk_create(productos_reventa)
            return Response({'message': "Productos de Reventa registrados exitosamente"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductosReventaListSerializer
        elif self.action == 'retrieve':
            return ProductosReventaDetallesSerializer
        return super().get_serializer_class()

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        variantes = serializer.validated_data.pop('variantes', [])
        
        try:
            with transaction.atomic():
                producto_reventa = ProductosReventa.objects.create(
                    **serializer.validated_data, 
                )
                variantes_create = []
                for variant in variantes:
                    variantes_create.append(
                        ProductosReventaVariantes(
                            producto_reventa=producto_reventa,
                            **variant
                        )
                    )
                ProductosReventaVariantes.objects.bulk_create(variantes_create)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'message': "Producto de reventa creado exitosamente", 
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data
        
        # Extract variantes data
        variantes_data = validated_data.pop('variantes', None)
        
        try:
            with transaction.atomic():
                # Update main Productos Reventa fields
                for attr, value in validated_data.items():
                    setattr(instance, attr, value)
                instance.save()
                
                if variantes_data is not None:
                    # Sync variants
                    existing_variantes = {v.id: v for v in instance.variantes.all()}
                    existing_ids = set(existing_variantes.keys())
                    
                    variantes_to_create = []
                    variantes_to_update = []
                    variantes_to_delete = []
                    
                    for variant in variantes_data:
                        variant_id = variant.get('id')
                        if variant_id in existing_ids:
                            # Update existing variant
                            existing_variant = existing_variantes.pop(variant_id)
                            for attr, value in variant.items():
                                setattr(existing_variant, attr, value)
                            variantes_to_update.append(existing_variant)
                        else:
                            # Create new variant
                            variantes_to_create.append(
                                ProductosReventaVariantes(
                                    producto_reventa=instance,
                                    **variant
                                )
                            )
                    
                    # Delete variants that are no longer in the request
                    for variant in existing_variantes.values():
                        variantes_to_delete.append(variant)
                    
                    # Save changes
                    ProductosReventaVariantes.objects.bulk_create(variantes_to_create)
                    ProductosReventaVariantes.objects.bulk_update(variantes_to_update, fields=variantes_to_update[0].get_fields())
                    ProductosReventaVariantes.objects.bulk_delete(variantes_to_delete)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'message': "Producto de reventa actualizado exitosamente", 
            'data': serializer.data
        }, status=status.HTTP_200_OK)


class LotesProductosReventaViewSet(viewsets.ModelViewSet):
    queryset = LotesProductosReventa.objects.order_by('fecha_caducidad')
    serializer_class = LotesProductosReventaSerializer
    permission_classes = [IsStaffOrVendedorReadOnly]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        queryset = super().get_queryset()
        producto_reventa = self.request.query_params.get('producto_reventa')
        if producto_reventa:
            queryset = queryset.filter(producto_reventa=producto_reventa)
        return queryset

    def list(self, request, *args, **kwargs):
        """List lots after expiring old ones"""
        # Get producto_reventa parameter
        producto_reventa_id = request.query_params.get('producto_reventa')
        
        # If filtering by product, expire lots for that product
        if producto_reventa_id:
            try:
                producto = ProductosReventa.objects.get(id=producto_reventa_id)
                producto.expirar_lotes_viejos()
            except ProductosReventa.DoesNotExist:
                pass
        else:
            ProductosReventa.expirar_todos_lotes_viejos()
        
        return super().list(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        from django.db import transaction
        try:
            instance = self.get_object()
            producto = instance.producto_reventa
            
            with transaction.atomic():
                self.perform_destroy(instance)
                
                # Check stock notifications after lot deletion
                try:
                    NotificationService.check_low_stock(ProductosReventa)
                    NotificationService.check_sin_stock(ProductosReventa)
                except Exception as notif_error:
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.error(f"Failed to create notifications: {str(notif_error)}")
            
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Set stock_actual_lote equal to cantidad_recibida on creation
        serializer.validated_data['stock_actual_lote'] = serializer.validated_data['cantidad_recibida']

        # Save through perform_create
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        
        # Check expiration notifications for newly created lot
        try:
            NotificationService.check_expiration_date(ProductosReventa, LotesProductosReventa)
        except Exception as notif_error:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to create notifications: {str(notif_error)}")
        
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    

    @action(detail=True, methods=['get'], url_path='change-estado-lote')
    def change_estado_lote(self, request, *args, **kwargs):
        try:
            lote_id = kwargs.get('pk')
            lote = LotesProductosReventa.objects.get(id=lote_id)
            if lote.estado == 'DISPONIBLE':
                if lote.fecha_caducidad > datetime.now().date():
                    lote.estado = LotesStatus.INACTIVO
                    lote.save(update_fields=['estado'])
                    # Stock will be automatically updated by the signal
                else:
                    return Response(
                        status=status.HTTP_400_BAD_REQUEST, 
                        data={"error": "Este Lote ya caducó"}
                    )
            elif lote.estado == 'INACTIVO':
                if lote.fecha_caducidad > datetime.now().date():
                    lote.estado = LotesStatus.DISPONIBLE
                    lote.save(update_fields=['estado'])
                    # Stock will be automatically updated by the signal
                else:
                    return Response(
                        status=status.HTTP_400_BAD_REQUEST, 
                        data={"error": "Este Lote ya caducó"}
                    )
            
            return Response({"message": "Estado del lote cambiado correctamente"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)