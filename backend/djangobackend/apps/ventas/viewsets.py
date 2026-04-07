from decimal import Decimal
from apps.core.models import EstadosOrdenVenta
from rest_framework import viewsets
from django.core.exceptions import ValidationError, PermissionDenied

from .models import (
    Clientes, 
    OrdenConsumoLoteDetalle,
    OrdenVenta,
    DetallesOrdenVenta, 
    OrdenConsumoLote, 
    Pagos, 
    AperturaCierreCaja, 
    Ventas,
    DetalleVenta,
    VentasLotesVendidos
    )

from .serializers import (
    ClientesSerializer, 
    OrdenesSerializer, 
    OrdenesDetallesSerializer, 
    AperturaCierreCajaSerializer, 
    AperturaCajaSerializer, 
    CierreCajaSerializer,
    VentasSerializer
    )

from apps.inventario.models import( ProductosElaborados, ProductosReventa, ProductosFinales, ProductosElaboradosVariantes, ProductosReventaVariantes)
from django.db import transaction
from rest_framework.response import Response
from rest_framework import status
from apps.ventas.serializers import OrdenesTableSerializer

from rest_framework.decorators import action
from datetime import datetime
from django.utils import timezone
from apps.inventario.models import LotesStatus
from apps.core.services.services import NotificationService
from djangobackend.pagination import StandardResultsSetPagination
from djangobackend.permissions import IsAllUsersCRUD, IsStaffLevel, IsStafforVendedorReadandCreate

from apps.core.models import TiposMetodosDePago, MetodosDePago
import logging

logger = logging.getLogger(__name__)

class ClientesViewSet(viewsets.ModelViewSet):
    queryset = Clientes.objects.all()
    serializer_class = ClientesSerializer
    permission_classes = [IsAllUsersCRUD]

class AperturaCierreCajaViewSet(viewsets.ModelViewSet):
    queryset = AperturaCierreCaja.objects.all()
    serializer_class = AperturaCierreCajaSerializer
    permission_classes = [IsStaffLevel]

    def get_serializer_class(self):
        if self.action == 'create':
            return AperturaCajaSerializer
        if self.action == 'update':
            return CierreCajaSerializer
        return AperturaCierreCajaSerializer
    

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        with transaction.atomic():
            apertura = AperturaCierreCaja.objects.create(
                usuario_apertura=request.user,
                **serializer.validated_data
            )
            serializer = AperturaCierreCajaSerializer(apertura)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


    @action(detail=False, methods=['POST'], url_path='cerrar')
    def cerrar_caja(self, request):
        """Close the POS register"""
        try:
            # Get the currently active caja
            caja = AperturaCierreCaja.objects.filter(esta_activa=True).first()
            if not caja:
                return Response(
                    {'error': 'No hay una caja activa para cerrar.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            serializer = CierreCajaSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            with transaction.atomic():
                # 1. Calculate totals from sales in this session using the Model method
                # This updates all total_* fields on the instance
                caja.calcular_totales_por_metodo_pago()
                
                # 2. Update closure basics
                caja.fecha_cierre = timezone.now()
                caja.usuario_cierre = request.user
                caja.notas_cierre = serializer.validated_data.get('notas_cierre', '')
                
                # 3. Set Final Counts (Counted by cashier)
                # If not provided, assume valid (expected) amount to avoid massive "missing" money in reports
                esperado_usd, esperado_ves = caja.calcular_efectivo_esperado()
                
                final_usd = serializer.validated_data.get('monto_final_usd')
                final_ves = serializer.validated_data.get('monto_final_ves')
                
                caja.monto_final_usd = final_usd if final_usd is not None else esperado_usd
                caja.monto_final_ves = final_ves if final_ves is not None else esperado_ves

                # 4. Calculate Discrepancy (Expected vs Counted) using Model method
                caja.calcular_diferencia_efectivo()

                # 5. Deactivate and Save
                caja.esta_activa = False
                caja.save()
                
                response_serializer = AperturaCierreCajaSerializer(caja)
                return Response(response_serializer.data, status=status.HTTP_200_OK)
        except (ValidationError, PermissionDenied) as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    
    @action(
        detail=False, 
        methods=['get'], 
        url_path='is-active', 
        permission_classes=[IsAllUsersCRUD]
        )
    def is_active(self, request, pk=None):
        """Check if there's an active POS session"""
        caja_activa = AperturaCierreCaja.objects.filter(esta_activa=True).first()
        if caja_activa:
            serializer = AperturaCierreCajaSerializer(caja_activa)
            return Response({
                'is_active': True
            })
        return Response({'is_active': False})


class OrdenesTableViewset(viewsets.ModelViewSet):
    queryset = OrdenVenta.objects.order_by('-id')
    serializer_class = OrdenesTableSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [IsStafforVendedorReadandCreate]


class OrdenesViewSet(viewsets.ModelViewSet):

    queryset = OrdenVenta.objects.all()
    serializer_class = OrdenesSerializer
    permission_classes = [IsAllUsersCRUD]


    def create(self, request, *args, **kwargs):

        with transaction.atomic():
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            # Extract and remove productos from validated_data
            validated_data = serializer.validated_data.copy()
            productos_orden = validated_data.pop('productos')
            referencia_pago = validated_data.pop('referencia_pago', None)
            
            # Add user creator
            validated_data['usuario_creador_id'] = request.user.id if request.user.id else 2

            # Create the order
            orden_venta = OrdenVenta.objects.create(**validated_data)

            # Prefetch products to avoid N+1 queries
            elaborado_ids = [p['producto']['id'] for p in productos_orden 
                            if p['producto']['tipo_producto'] == 'producto-final']
            reventa_ids = [p['producto']['id'] for p in productos_orden 
                        if p['producto']['tipo_producto'] != 'producto-final']

            productos_elaborados_map = {
                p.id: p for p in ProductosElaborados.objects.filter(id__in=elaborado_ids)
            } if elaborado_ids else {}
            productos_reventa_map = {
                p.id: p for p in ProductosReventa.objects.filter(id__in=reventa_ids)
            } if reventa_ids else {}

            # Build detail objects without saving
            detalles_to_create = []
            for producto in productos_orden:
                producto_id = producto['producto']['id']
                
                if producto['producto']['tipo_producto'] == 'producto-final':
                    producto_elaborado = productos_elaborados_map.get(producto_id)
                    if not producto_elaborado:
                        raise ValueError(f"Product {producto_id} not found")
                    detalle = DetallesOrdenVenta(
                        orden_venta_asociada=orden_venta,
                        producto_elaborado=producto_elaborado,
                        producto_reventa=None,
                        cantidad_solicitada=producto['cantidad_solicitada'],
                        unidad_medida_id=producto['unidad_medida'],
                        precio_unitario_usd=producto['precio_unitario_usd'],
                        subtotal_linea_usd=producto['subtotal_linea_usd'],
                        descuento_porcentaje=producto['descuento_porcentaje'],
                        impuesto_porcentaje=producto['impuesto_porcentaje'],
                    )
                else:
                    producto_reventa = productos_reventa_map.get(producto_id)
                    if not producto_reventa:
                        raise ValueError(f"Product {producto_id} not found")
                    detalle = DetallesOrdenVenta(
                        orden_venta_asociada=orden_venta,
                        producto_elaborado=None,
                        producto_reventa=producto_reventa,
                        cantidad_solicitada=producto['cantidad_solicitada'],
                        unidad_medida_id=producto['unidad_medida'],
                        precio_unitario_usd=producto['precio_unitario_usd'],
                        subtotal_linea_usd=producto['subtotal_linea_usd'],
                        descuento_porcentaje=producto['descuento_porcentaje'],
                        impuesto_porcentaje=producto['impuesto_porcentaje'],
                    )
                detalles_to_create.append(detalle)

            # Single bulk insert
            DetallesOrdenVenta.objects.bulk_create(detalles_to_create)

            # Register payment if reference is provided
            if referencia_pago:
                self.register_payment(orden_venta, referencia_pago, request.user)

            # Return the created order data
            response_serializer = self.get_serializer(orden_venta)
            headers = self.get_success_headers(response_serializer.data)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED, headers=headers)


    @action(detail=True, methods=['get'])
    def get_orden_detalles(self, request, pk=None):
        orden = OrdenVenta.objects.get(id=pk)
        serializer = OrdenesDetallesSerializer(orden)
        return Response(serializer.data, status=status.HTTP_200_OK)


    def update(self, request, *args, **kwargs):
        
        with transaction.atomic():
            # Get the existing order
            instance = self.get_object()
            
            # Validate the incoming data
            serializer = self.get_serializer(instance, data=request.data, partial=False)
            serializer.is_valid(raise_exception=True)
            
            # Extract validated data
            validated_data = serializer.validated_data.copy()
            productos_orden = validated_data.pop('productos')
            
            # Update payment reference (allow clearing by setting to None/empty)
            if 'referencia_pago' in serializer.validated_data:
                referencia_pago = validated_data.pop('referencia_pago', None)
                self.update_payment(instance, referencia_pago, request.user)

            # Update the order fields
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()
            
            # Delete existing order details
            DetallesOrdenVenta.objects.filter(orden_venta_asociada=instance).delete()
            
            # Prefetch products to avoid N+1 queries
            elaborado_ids = [p['producto']['id'] for p in productos_orden 
                            if p['producto']['tipo_producto'] == 'producto-final']
            reventa_ids = [p['producto']['id'] for p in productos_orden 
                        if p['producto']['tipo_producto'] != 'producto-final']

            productos_elaborados_map = {
                p.id: p for p in ProductosElaborados.objects.filter(id__in=elaborado_ids)
            } if elaborado_ids else {}
            productos_reventa_map = {
                p.id: p for p in ProductosReventa.objects.filter(id__in=reventa_ids)
            } if reventa_ids else {}

            # Build detail objects without saving
            detalles_to_create = []
            for producto in productos_orden:
                producto_id = producto['producto']['id']
                
                if producto['producto']['tipo_producto'] == 'producto-final':
                    producto_elaborado = productos_elaborados_map.get(producto_id)
                    if not producto_elaborado:
                        raise ValueError(f"Product {producto_id} not found")
                    detalle = DetallesOrdenVenta(
                        orden_venta_asociada=instance,
                        producto_elaborado=producto_elaborado,
                        producto_reventa=None,
                        cantidad_solicitada=producto['cantidad_solicitada'],
                        unidad_medida_id=producto['unidad_medida'],
                        precio_unitario_usd=producto['precio_unitario_usd'],
                        subtotal_linea_usd=producto['subtotal_linea_usd'],
                        descuento_porcentaje=producto['descuento_porcentaje'],
                        impuesto_porcentaje=producto['impuesto_porcentaje'],
                    )
                else:
                    producto_reventa = productos_reventa_map.get(producto_id)
                    if not producto_reventa:
                        raise ValueError(f"Product {producto_id} not found")
                    detalle = DetallesOrdenVenta(
                        orden_venta_asociada=instance,
                        producto_elaborado=None,
                        producto_reventa=producto_reventa,
                        cantidad_solicitada=producto['cantidad_solicitada'],
                        unidad_medida_id=producto['unidad_medida'],
                        precio_unitario_usd=producto['precio_unitario_usd'],
                        subtotal_linea_usd=producto['subtotal_linea_usd'],
                        descuento_porcentaje=producto['descuento_porcentaje'],
                        impuesto_porcentaje=producto['impuesto_porcentaje'],
                    )
                detalles_to_create.append(detalle)

            # Single bulk insert
            DetallesOrdenVenta.objects.bulk_create(detalles_to_create)

            # Return the updated order data
            response_serializer = OrdenesDetallesSerializer(instance)
            return Response(response_serializer.data, status=status.HTTP_200_OK)
            
            
    @action(detail=True, methods=['put'])
    def update_status(self, request, pk=None):
        try:
            with transaction.atomic():
                param = request.GET.get('estado')
                orden = OrdenVenta.objects.get(id=pk)
    
                estado_id = EstadosOrdenVenta.objects.filter(nombre_estado=param).values_list('id', flat=True).first()
                if param == 'En Proceso' and orden.estado_orden.nombre_estado == 'Pendiente':
                    detallesOrdenVenta = DetallesOrdenVenta.objects.filter(orden_venta_asociada=orden)
                    lotes_detalles_consumo = []

                    for detalle in detallesOrdenVenta:
                        price = detalle.precio_unitario_usd
                        producto = detalle.producto_elaborado if detalle.producto_elaborado else detalle.producto_reventa
                            
                        if producto:
                            if isinstance(producto, ProductosReventa):
                                cantidad_consumir = detalle.cantidad_solicitada * producto.factor_conversion
                            else:
                                cantidad_consumir = detalle.cantidad_solicitada

                            detalles_consumo_lotes = producto.consume_product_stock(cantidad_consumir, price)
                            producto.actualizar_product_stock()
                            
                            orden_consumo_lote = OrdenConsumoLote.objects.create(
                                orden_venta_asociada=orden,
                                detalle_orden_venta=detalle
                            )
                            
                            for detalle_consumo_lote in detalles_consumo_lotes:
                                lotes_detalles_consumo.append(
                                    OrdenConsumoLoteDetalle(
                                        **detalle_consumo_lote,
                                        orden_consumo_lote=orden_consumo_lote
                                    )
                                )
                    OrdenConsumoLoteDetalle.objects.bulk_create(lotes_detalles_consumo)
            
                orden.estado_orden = EstadosOrdenVenta.objects.get(id=estado_id)
                orden.save()
                
                # Check for stock and delivery notifications after order processing
                try:
                    # Check stock for products sold
                    NotificationService.check_low_stock(ProductosElaborados)
                    NotificationService.check_sin_stock(ProductosElaborados)
                    NotificationService.check_low_stock(ProductosReventa)
                    NotificationService.check_sin_stock(ProductosReventa)
                    
                    # Check upcoming deliveries
                    NotificationService.check_order_date()
                except Exception as notif_error:
                    # Log but don't fail the request
                    logger.error(f"Failed to create notifications: {str(notif_error)}")
                
                return Response(status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


    @action(detail=True, methods=['put'])
    def cancel(self, request, pk=None):
        try:
            with transaction.atomic():
                orden = OrdenVenta.objects.get(id=pk)
                lotes_expirados = []
                if orden.estado_orden.nombre_estado == 'En Proceso':

                    consumo_lote = OrdenConsumoLote.objects.filter(orden_venta_asociada=orden)
                    consumo_lote_detalle = OrdenConsumoLoteDetalle.objects.filter(orden_consumo_lote__in=consumo_lote)

                    for lote in consumo_lote_detalle:
                        if lote.lote_producto_elaborado:
                            lote_expirado = self.actualizar_lote(lote.lote_producto_elaborado, lote.cantidad_consumida)
                            if lote_expirado:
                                lotes_expirados.append(lote_expirado)
                            
                            lote.lote_producto_elaborado.producto_elaborado.actualizar_product_stock()

                        elif lote.lote_producto_reventa:
                            lote_expirado = self.actualizar_lote(lote.lote_producto_reventa, lote.cantidad_consumida)
                            if lote_expirado:
                                lotes_expirados.append(lote_expirado)
                            lote.lote_producto_reventa.producto_reventa.actualizar_product_stock()
            
                    orden.estado_orden = EstadosOrdenVenta.objects.filter(nombre_estado='Cancelado').first()
                    orden.save()
                    
                    if lotes_expirados:
                        return Response({
                            "message": "Orden cancelada exitosamente",
                            "warning": "Algunos lotes no pudieron ser reabastecidos porque están vencidos",
                            "lotes_expirados": lotes_expirados
                        }, status=status.HTTP_200_OK)
                    
                    return Response({"message": "Orden cancelada exitosamente"}, status=status.HTTP_200_OK)
                
                elif orden.estado_orden.nombre_estado == 'Pendiente':
                    orden.estado_orden = EstadosOrdenVenta.objects.filter(nombre_estado='Cancelado').first()
                    orden.save()
                    return Response({"message": "Orden cancelada exitosamente"}, status=status.HTTP_200_OK)
                return Response({"error": "No se puede cancelar una orden que no está en proceso"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


    def actualizar_lote(self, lote, cantidad_consumida):
        # Restore the consumed quantity back to the lot
        if (lote.fecha_caducidad < timezone.now().date()):
            # Determine product name based on lot type
            if hasattr(lote, 'producto_elaborado') and lote.producto_elaborado:
                producto_nombre = lote.producto_elaborado.nombre_producto
            elif hasattr(lote, 'producto_reventa') and lote.producto_reventa:
                producto_nombre = lote.producto_reventa.nombre_producto
            else:
                producto_nombre = 'Producto desconocido'
            
            return {
                'lote_expirado': lote.id, 
                'producto': producto_nombre,
                'fecha_caducidad': lote.fecha_caducidad.strftime('%Y-%m-%d')
            }
        
        lote.stock_actual_lote += cantidad_consumida
        
        # If the lot was marked as depleted, make it available again
        if lote.estado == LotesStatus.AGOTADO:
            lote.estado = LotesStatus.DISPONIBLE
        
        lote.save()
    

    def register_payment(self, orden, ref, user):
        try:
            Pagos.objects.create(
                orden_venta_asociada=orden,
                metodo_pago=orden.metodo_pago,
                monto_pago_usd=orden.monto_total_usd,
                monto_pago_ves=orden.monto_total_ves,
                fecha_pago=datetime.now(),
                referencia_pago=ref,
                usuario_registrador=user,
                tasa_cambio_aplicada=orden.tasa_cambio_aplicada
            )
            return True
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


    def update_payment(self, orden, ref, user):
        try:
            existing_payment = Pagos.objects.filter(orden_venta_asociada=orden).first()
            if existing_payment:
                existing_payment.referencia_pago = ref
                existing_payment.usuario_registrador = user
                existing_payment.save()
            elif ref: 
                self.register_payment(orden, ref, user)
            return True
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    

    @action(detail=True, methods=['put'])
    def register_payment_reference(self, request, pk=None):
        orden = OrdenVenta.objects.get(id=pk)
        ref = request.data.get('referencia_pago')

        self.register_payment(orden, ref, request.user)
        return Response(status=status.HTTP_200_OK)


class VentasViewSet(viewsets.ModelViewSet):
    queryset = Ventas.objects.all()
    serializer_class = VentasSerializer
    permission_classes = [IsAllUsersCRUD]


    def create(self, request):
        data = request.data
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        
        detalles = serializer.validated_data.get('venta_detalles')
        pagos = serializer.validated_data.get('pagos')
        caja_activa = AperturaCierreCaja.obtener_caja_activa()

        if not caja_activa:
            return Response({'error': 'No hay una caja activa para registrar la venta'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():

            venta = Ventas.objects.create(
                cliente_id=data.get('cliente'),
                monto_total_usd=data.get('monto_total_usd'),
                monto_total_ves=data.get('monto_total_ves'),
                tasa_cambio_aplicada=data.get('tasa_cambio_aplicada'),
                usuario_cajero=request.user,
                apertura_caja=caja_activa,
                fecha_venta=timezone.now().date()
            )

            # --- 1. Process Stock & Details ---
            DetalleVentaRegistro = []
            LotesVendidosRegistro = []
            for detalle in detalles:
                elaborado_id = detalle.get('producto_elaborado_id')
                reventa_id = detalle.get('producto_reventa_id')
                cantidad_total = Decimal(str(detalle['cantidad']))
                
                producto = ProductosElaboradosVariantes.objects.filter(id=elaborado_id).first() if elaborado_id else ProductosReventaVariantes.objects.filter(id=reventa_id).first()
                unidad_venta = producto.producto_elaborado.unidad_venta if elaborado_id else producto.producto_reventa.unidad_venta
                if not producto:
                    raise ValidationError(f'El producto con ID {elaborado_id or reventa_id} no existe')
                
                # consume_product_stock returns a list of dictionaries with lot info
                lotes_consumidos = producto.consume_product_stock(detalle.get('cantidad'))

                venta_detalle = DetalleVenta(
                    venta=venta,
                    producto_elaborado_id=detalle.get('producto_elaborado_id'),
                    producto_reventa_id=detalle.get('producto_reventa_id'),
                    unidad_medida_venta=unidad_venta,
                    cantidad_vendida=detalle.get('cantidad'),
                    precio_unitario_usd=detalle.get('precio_unitario_usd'),
                    precio_unitario_ves=detalle.get('precio_unitario_ves'),
                    subtotal_linea_usd=detalle.get('subtotal_linea_usd'),
                    subtotal_linea_ves=detalle.get('subtotal_linea_ves')
                )

                for lote in lotes_consumidos:
                    venta_lote = VentasLotesVendidos(
                        detalle_venta_asociada=venta_detalle,
                        lote_producto_elaborado=lote.get('lote_producto_elaborado', None),
                        lote_producto_reventa=lote.get('lote_producto_reventa', None),
                        cantidad_consumida=lote.get('cantidad_consumida')
                    )
                LotesVendidosRegistro.append(venta_lote)
                DetalleVentaRegistro.append(venta_detalle)

            DetalleVenta.objects.bulk_create(DetalleVentaRegistro)
            VentasLotesVendidos.objects.bulk_create(LotesVendidosRegistro)

            # --- 2. Process Payments ---
            PagosRegistro = []

            for pago in pagos:
                try:
                    metodo_enum = TiposMetodosDePago(pago.get('metodo_pago'))
                except ValueError:
                     return Response({'error': f"Método de pago inválido: {pago.get('metodo_pago')}"}, status=status.HTTP_400_BAD_REQUEST)

                metodo_pago_obj = MetodosDePago.objects.filter(nombre_metodo__iexact=metodo_enum.label).first()
                if not metodo_pago_obj:
                    return Response({'error': f"El método '{metodo_enum.label}' no está configurado en el sistema."}, status=status.HTTP_400_BAD_REQUEST)
               
                pago_ref = Pagos(
                    venta_asociada=venta,
                    metodo_pago=metodo_pago_obj,
                    monto_pago_usd=pago.get('monto_pago_usd'),
                    monto_pago_ves=pago.get('monto_pago_ves'),
                    cambio_efectivo_usd=pago.get('cambio_efectivo_usd', 0),
                    cambio_efectivo_ves=pago.get('cambio_efectivo_ves', 0),
                    cambio_pago_movil_usd=pago.get('cambio_pago_movil_usd', 0),
                    cambio_pago_movil_ves=pago.get('cambio_pago_movil_ves', 0),
                    referencia_pago=pago.get('referencia_pago', ''),
                    usuario_registrador=request.user,
                    tasa_cambio_aplicada=data.get('tasa_cambio_aplicada'),
                    fecha_pago=timezone.now().date()
                )
                PagosRegistro.append(pago_ref)

            Pagos.objects.bulk_create(PagosRegistro)
            
            # --- 3. Recalculate Caja Totals ---
            caja_activa.calcular_totales_por_metodo_pago()
            caja_activa.save()
            
        return Response(serializer.data, status=status.HTTP_201_CREATED)