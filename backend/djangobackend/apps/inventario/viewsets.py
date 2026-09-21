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
    MateriaPrimaVariantesDetallesSerializer, LotesMateriaPrimaSerializer, LotesMateriaPrimaDetailsSerializer,
    ProductosIntermediosSerializer, ProductosIntermediosListSerializer, ProductosFinalesSerializer, ProductosIntermediosDetallesSerializer, 
    ProductosElaboradosSerializer, ProductosFinalesListSerializer, ProductosFinalesDetallesSerializer,
    ProductosFinalesListaTransformacionSerializer, LotesProductosElaboradosSerializer, 
    ProductosReventaSerializer, ProductionSearchSerializer, ProductosReventaListSerializer, LotesProductosReventaSerializer, RegisterYAMLSerializer, ProductosReventaDetallesSerializer,
    VarianteSearchSerializer
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

    @action(detail=False, methods=['post'], url_path='register-yaml',)
    def register_yaml(self, request):
        import base64
        import yaml

        serializer = RegisterYAMLSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        file = serializer.validated_data['file']
        decoded_file = base64.b64decode(file)
        yaml_data = yaml.safe_load(decoded_file.decode('utf-8'))

        materias_primas = []
        variantes_data_map = []
        for mp in yaml_data:
            mp_created = MateriasPrimas(
                nombre=mp['nombre'],
                SKU=mp.get('SKU'),
                punto_reorden=mp['punto_reorden'],
                unidad_medida_base_id=mp.get('unidad_medida_base_id'),
                categoria_id=mp.get('categoria_id'),
                descripcion=mp.get('descripcion')
            )
            materias_primas.append(mp_created)
            variantes_data_map.append(mp.get('variantes', []))

        materias_primas_creadas = MateriasPrimas.objects.bulk_create(materias_primas)
        
        variantes_bucket = []
        for idx, mp_created in enumerate(materias_primas_creadas):
            variantes_data = variantes_data_map[idx]
            if variantes_data:
                for variante in variantes_data:
                    variantes_bucket.append(
                        MateriasPrimasVariantes(
                            materia_prima=mp_created,
                            nombre_variante=variante.get('nombre_variante'),
                            unidad_compra_id=variante.get('unidad_compra'),
                            SKU_variante=variante.get('SKU_variante'),
                            precio_compra_divisa=variante.get('precio_compra_divisa'),
                            precio_compra_local=variante.get('precio_compra_local'),
                            nombre_empaque_estandar=variante.get('nombre_empaque_estandar'),
                            cantidad_empaque_estandar=variante.get('cantidad_empaque_estandar'),
                            unidad_medida_empaque_estandar_id=variante.get('unidad_medida_empaque_estandar'),
                        )
                    )
        
        if variantes_bucket:
            MateriasPrimasVariantes.objects.bulk_create(variantes_bucket)
        
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
            rows = list(reader)
            
            productos_elaborados = []
            for pe in rows:
                es_intermediario = pe.get('es_intermediario', 'False').upper() == 'TRUE'
                
                producto = ProductosElaborados(
                    nombre_producto=pe['nombre_producto'],
                    descripcion=pe.get('descripcion') or None,
                    unidad_produccion_id=pe.get('unidad_produccion_id') or None,
                    unidad_venta_id=pe.get('unidad_venta_id') or None,
                    categoria_id=pe.get('categoria_id') or None,
                    es_intermediario=es_intermediario,
                    tipo_medida_fisica=pe.get('tipo_medida_fisica', 'PESO'),
                    vendible_por_medida_real=pe.get('vendible_por_medida_real', 'False').upper() == 'TRUE',
                )
                productos_elaborados.append(producto)

            productos_creados = ProductosElaborados.objects.bulk_create(productos_elaborados)
            
            variantes = []
            for idx, pe in enumerate(rows):
                producto = productos_creados[idx]
                variante = ProductosElaboradosVariantes(
                    producto_elaborado=producto,
                    nombre_variante=producto.nombre_producto,
                    SKU=pe.get('SKU') or None,
                    precio_venta_divisa=pe.get('precio_venta_usd') or None,
                    punto_reorden=pe.get('punto_reorden') or None,
                    atributo='UNIDAD',
                    is_vendible=True,
                )
                variantes.append(variante)

            ProductosElaboradosVariantes.objects.bulk_create(variantes)

            return Response({'message': "Productos elaborados registrados exitosamente"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
                "componente_id": component.id,
                "nombre": component.nombre,
                "unidad_medida": unit.abreviatura,
                "stock": component.stock_actual,
                "cantidad": cantidad,
                'tipo': 'MateriaPrima'
            }
        elif detalle.componente_producto_intermedio:
            component = detalle.componente_producto_intermedio
            cantidad = detalle.cantidad
            unit = component.producto_elaborado.unidad_produccion
            return {
                "componente_id": component.id,
                "nombre": component.producto_elaborado.nombre_producto,
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
            'componente_producto_intermedio__producto_elaborado__unidad_produccion'
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
            receta_principal = Recetas.objects.select_related(
                'producto_elaborado_variante__producto_elaborado__unidad_produccion'
            ).get(producto_elaborado_variante_id=producto_id)
        except Recetas.DoesNotExist:
            return Response({"message": "No se encontró la receta asociada"}, status=status.HTTP_404_NOT_FOUND)

        detalles_receta_principal = RecetasDetalles.objects.filter(
            receta_id=receta_principal.id
        ).select_related(
            'componente_materia_prima__unidad_medida_base',
            'componente_producto_intermedio__producto_elaborado__unidad_produccion'
        )

        subrecetas = []
        self._get_all_sub_recetas(receta_principal.id, subrecetas)
        # Derive unit-based production flags from product's unidad_produccion
        producto_elaborado = receta_principal.producto_elaborado_variante.producto_elaborado
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

    @action(detail=False, methods=['get'], url_path='search')
    def search(self, request):
        search_term = request.query_params.get('search', '')
        
        if len(search_term) < 2:
            return Response({"error": "El término de búsqueda debe tener al menos 2 caracteres"}, status=status.HTTP_400_BAD_REQUEST)

        if not search_term:
            return Response({"error": "El término de búsqueda no puede estar vacío"}, status=status.HTTP_400_BAD_REQUEST)

        productos_variantes = ProductosElaboradosVariantes.objects.filter(
            receta_producto_elaborado_variante__isnull=True,
            producto_elaborado__nombre_producto__icontains=search_term
        ).select_related('producto_elaborado__unidad_produccion')

        productos_elaborados_ids = productos_variantes.values_list('producto_elaborado_id', flat=True)
        
        pe_map = defaultdict(list)
        for variante in productos_variantes:
            pe_map[variante.producto_elaborado_id].append(variante)
        
        productos_data = []
        for variante in productos_variantes:
            
            if variante.producto_elaborado_id in [p['producto_id'] for p in productos_data]:
                continue
            
            productos_data.append({
                'producto_id': variante.producto_elaborado.id,
                'nombre_producto': variante.producto_elaborado.nombre_producto,
                'tipo': 'ProductoIntermedio' if variante.producto_elaborado.es_intermediario else 'ProductoFinal',
                'unidad_produccion': variante.producto_elaborado.unidad_produccion.nombre_completo,
                'variantes': VarianteSearchSerializer(pe_map[variante.producto_elaborado_id], many=True).data
            })

        return Response(productos_data, status=status.HTTP_200_OK)


    @action(detail=False, methods=['get'], url_path='production-search')
    def production_search(self, request):
        tipo = request.query_params.get('tipo', '')

        if tipo == 'producto-intermedio':
            productos_intermedios = ProductosIntermedios.objects.filter(variantes__receta_producto_elaborado_variante__isnull=False)
            serializer = ProductionSearchSerializer(productos_intermedios, many=True)
        elif tipo == 'producto-final':
            productos_finales = ProductosFinales.objects.filter(variantes__receta_producto_elaborado_variante__isnull=False)
            serializer = ProductionSearchSerializer(productos_finales, many=True)
        else:
            return Response({"error": "Tipo de producto no válido"}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'productos': serializer.data, 'tipo': tipo}, status=status.HTTP_200_OK)


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
                    if variantes_to_create:
                        ProductosReventaVariantes.objects.bulk_create(variantes_to_create)
                    
                    if variantes_to_update:
                        ProductosReventaVariantes.objects.bulk_update(variantes_to_update, fields=[
                            'nombre_variante', 'precio_venta_divisa', 'precio_venta_local', 
                            'costo_divisa', 'costo_local', 'SKU', 'descripcion', 
                            'punto_reorden', 'atributo', 'is_vendible'
                        ])
                    
                    if variantes_to_delete:
                        ProductosReventaVariantes.objects.filter(id__in=[v.id for v in variantes_to_delete]).delete()
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

    def get_queryset(self, product_id=None):
        queryset = super().get_queryset()
        producto_reventa = self.request.query_params.get('producto_reventa')
        if producto_reventa or product_id:
            queryset = queryset.filter(producto_reventa_variante__producto_reventa=producto_reventa or product_id)
        return queryset


    # def destroy(self, request, *args, **kwargs):
    #     from django.db import transaction
    #     try:
    #         instance = self.get_object()
    #         producto = instance.producto_reventa_variante.producto_reventa
            
    #         with transaction.atomic():
    #             self.perform_destroy(instance)
                
    #             # Check stock notifications after lot deletion
    #             try:
    #                 NotificationService.check_low_stock(ProductosReventa)
    #                 NotificationService.check_sin_stock(ProductosReventa)
    #             except Exception as notif_error:
    #                 import logging
    #                 logger = logging.getLogger(__name__)
    #                 logger.error(f"Failed to create notifications: {str(notif_error)}")
            
    #         return Response(status=status.HTTP_204_NO_CONTENT)
    #     except Exception as e:
    #         return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Set stock_actual_lote equal to cantidad_recibida on creation
        serializer.validated_data['stock_actual_lote'] = serializer.validated_data['cantidad_recibida']

        # Save through perform_create
        self.perform_create(serializer)
        
        # Get all lots for the product
        # Get the variant instance (already in memory from validation)
        variante = serializer.validated_data['producto_reventa_variante']

        # Access the product ID directly (it's a field on the variant)
        producto_reventa_id = variante.producto_reventa_id

        # Pass it to your queryset filter
        lotes = self.get_queryset(product_id=producto_reventa_id)

        serializer = self.get_serializer(lotes, many=True)
        
        return Response({'message': 'Lote creado exitosamente', 'lotes': serializer.data}, status=status.HTTP_201_CREATED)
    

    @action(detail=True, methods=['get'], url_path='change-estado-lote')
    def change_estado_lote(self, request, *args, **kwargs):
        try:
            lote_id = kwargs.get('pk')
            lote = LotesProductosReventa.objects.get(id=lote_id)
            es_perecedero = lote.producto_reventa_variante.producto_reventa.es_perecedero
            
            if lote.estado == 'DISPONIBLE':
                if es_perecedero:
                    if lote.fecha_caducidad < datetime.now().date():
                        return Response(
                        status=status.HTTP_400_BAD_REQUEST, 
                        data={"error": "Este Lote ya caducó"}
                    )
                lote.estado = LotesStatus.INACTIVO
                lote.save(update_fields=['estado'])

            elif lote.estado == 'INACTIVO':
                if es_perecedero:
                    if lote.fecha_caducidad < datetime.now().date():
                        return Response(
                            status=status.HTTP_400_BAD_REQUEST, 
                            data={"error": "Este Lote ya caducó"}
                        )
                lote.estado = LotesStatus.DISPONIBLE
                lote.save(update_fields=['estado'])
                # Stock will be automatically updated by the signal
            
            return Response({"message": "Estado del lote cambiado correctamente"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)