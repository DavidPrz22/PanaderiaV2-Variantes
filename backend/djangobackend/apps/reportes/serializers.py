from rest_framework import serializers
from apps.inventario.models import (
    MateriasPrimas, 
    ProductosElaborados, 
    ProductosReventa,
    LotesMateriasPrimas,
    LotesProductosElaborados,
    LotesProductosReventa,
    LotesStatus
)
from apps.ventas.models import AperturaCierreCaja, Ventas, DetalleVenta
from django.db.models import Count, Sum, Q
from django.utils import timezone
from drf_spectacular.utils import extend_schema_field


class InventoryItemSerializer(serializers.Serializer):
    """Serializer for inventory items with stock status"""
    id = serializers.IntegerField()
    nombre = serializers.CharField()
    unidad_medida = serializers.CharField()
    stock_actual = serializers.DecimalField(max_digits=10, decimal_places=2)
    punto_reorden = serializers.DecimalField(max_digits=10, decimal_places=2)
    lotes_disponibles = serializers.IntegerField()
    precio_venta_usd = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)
    fecha_ultima_actualizacion = serializers.DateField(required=False, allow_null=True)
    categoria = serializers.CharField()
    estado = serializers.CharField()


class SessionReportSerializer(serializers.ModelSerializer):
    """Serializer for sales session reports"""
    cajero_nombre = serializers.CharField(source='usuario_apertura.get_full_name', read_only=True)
    numero_transacciones = serializers.SerializerMethodField()
    
    class Meta:
        model = AperturaCierreCaja
        fields = [
            'id',
            'fecha_apertura',
            'fecha_cierre',
            'cajero_nombre',
            'monto_inicial_usd',
            'monto_inicial_ves',
            'monto_final_usd',
            'monto_final_ves',
            'total_efectivo_usd',
            'total_efectivo_ves',
            'total_tarjeta_usd',
            'total_tarjeta_ves',
            'total_transferencia_usd',
            'total_transferencia_ves',
            'total_pago_movil_usd',
            'total_pago_movil_ves',
            'total_ventas_usd',
            'total_ventas_ves',
            'diferencia_usd',
            'diferencia_ves',
            'numero_transacciones',
            'esta_activa',
            'notas_apertura',
            'notas_cierre'
        ]
    
    @extend_schema_field(serializers.IntegerField())
    def get_numero_transacciones(self, obj):
        return Ventas.objects.filter(apertura_caja=obj).count()


class ItemVendidoSerializer(serializers.Serializer):
    """Serializer for items sold summary"""
    producto_id = serializers.IntegerField()
    producto_nombre = serializers.CharField()
    tipo_producto = serializers.CharField()
    cantidad_total = serializers.DecimalField(max_digits=10, decimal_places=2)
    subtotal_usd = serializers.DecimalField(max_digits=10, decimal_places=2)
    subtotal_ves = serializers.DecimalField(max_digits=10, decimal_places=2)


class TransaccionVentaSerializer(serializers.ModelSerializer):
    """Serializer for individual sale transactions"""
    cliente_nombre = serializers.CharField(source='cliente.nombre_cliente', read_only=True)
    numero_items = serializers.SerializerMethodField()
    
    class Meta:
        model = Ventas
        fields = [
            'id',
            'fecha_venta',
            'cliente_nombre',
            'monto_total_usd',
            'monto_total_ves',
            'numero_items',
            'notas'
        ]
    
    @extend_schema_field(serializers.IntegerField())
    def get_numero_items(self, obj):
        return DetalleVenta.objects.filter(venta=obj).count()


class SessionDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for a specific session with all related data"""
    cajero_nombre = serializers.CharField(source='usuario_apertura.get_full_name', read_only=True)
    transacciones = serializers.SerializerMethodField()
    items_vendidos = serializers.SerializerMethodField()
    
    class Meta:
        model = AperturaCierreCaja
        fields = [
            'id',
            'fecha_apertura',
            'fecha_cierre',
            'cajero_nombre',
            'monto_inicial_usd',
            'monto_inicial_ves',
            'monto_final_usd',
            'monto_final_ves',
            'total_efectivo_usd',
            'total_efectivo_ves',
            'total_tarjeta_usd',
            'total_tarjeta_ves',
            'total_transferencia_usd',
            'total_transferencia_ves',
            'total_pago_movil_usd',
            'total_pago_movil_ves',
            'total_cambio_usd',
            'total_cambio_ves',
            'total_cambio_efectivo_ves',
            'total_cambio_pago_movil_ves',
            'total_ventas_usd',
            'total_ventas_ves',
            'diferencia_usd',
            'diferencia_ves',
            'esta_activa',
            'notas_apertura',
            'notas_cierre',
            'transacciones',
            'items_vendidos'
        ]
    
    @extend_schema_field(TransaccionVentaSerializer(many=True))
    def get_transacciones(self, obj):
        ventas = Ventas.objects.filter(apertura_caja=obj).order_by('-fecha_venta')
        return TransaccionVentaSerializer(ventas, many=True).data
    
    @extend_schema_field(ItemVendidoSerializer(many=True))
    def get_items_vendidos(self, obj):
        # Get all sale details for this session
        detalles = DetalleVenta.objects.filter(
            venta__apertura_caja=obj
        ).select_related('producto_elaborado', 'producto_reventa')
        
        # Aggregate by product
        items_map = {}
        
        for detalle in detalles:
            if detalle.producto_elaborado:
                key = f"elaborado_{detalle.producto_elaborado.id}"
                if key not in items_map:
                    items_map[key] = {
                        'producto_id': detalle.producto_elaborado.id,
                        'producto_nombre': detalle.producto_elaborado.nombre_producto,
                        'tipo_producto': 'Producto Elaborado',
                        'cantidad_total': 0,
                        'subtotal_usd': 0,
                        'subtotal_ves': 0
                    }
                items_map[key]['cantidad_total'] += detalle.cantidad_vendida
                items_map[key]['subtotal_usd'] += detalle.subtotal_linea_usd
                items_map[key]['subtotal_ves'] += detalle.subtotal_linea_ves
            
            elif detalle.producto_reventa:
                key = f"reventa_{detalle.producto_reventa.id}"
                if key not in items_map:
                    items_map[key] = {
                        'producto_id': detalle.producto_reventa.id,
                        'producto_nombre': detalle.producto_reventa.nombre_producto,
                        'tipo_producto': 'Producto Reventa',
                        'cantidad_total': 0,
                        'subtotal_usd': 0,
                        'subtotal_ves': 0
                    }
                items_map[key]['cantidad_total'] += detalle.cantidad_vendida
                items_map[key]['subtotal_usd'] += detalle.subtotal_linea_usd
                items_map[key]['subtotal_ves'] += detalle.subtotal_linea_ves
        
        return ItemVendidoSerializer(list(items_map.values()), many=True).data
