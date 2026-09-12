from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from .models import Clientes, OrdenVenta, DetallesOrdenVenta, Pagos, AperturaCierreCaja, Ventas
from apps.core.serializers import MetodosDePagoSerializer, EstadosOrdenVentaSerializer
from apps.inventario.serializers import ProductosElaboradosSerializer, ProductosReventaSerializer

class ClientesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Clientes
        fields = '__all__'


class AperturaCierreCajaSerializer(serializers.ModelSerializer):
    class Meta:
        model = AperturaCierreCaja
        fields = '__all__'


class AperturaCajaSerializer(serializers.ModelSerializer):
    class Meta:
        model = AperturaCierreCaja
        fields = [
            'monto_inicial_usd',
            'monto_inicial_ves',
            'notas_apertura'
        ]


class CierreCajaSerializer(serializers.ModelSerializer):
    monto_final_usd = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)
    monto_final_ves = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)
    notas_cierre = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = AperturaCierreCaja
        fields = [
            'monto_final_usd',
            'monto_final_ves',
            'notas_cierre'
        ]


class ProductoSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    nombre_producto = serializers.CharField(required=False)
    stock = serializers.IntegerField(required=False)
    tipo_producto = serializers.CharField()


class ProductosOrdenesSerializer(serializers.Serializer):
    producto = ProductoSerializer()
    cantidad_solicitada = serializers.DecimalField(max_digits=10, decimal_places=3)
    unidad_medida = serializers.IntegerField()
    precio_unitario_usd = serializers.DecimalField(max_digits=10, decimal_places=3)
    subtotal_linea_usd = serializers.DecimalField(max_digits=10, decimal_places=3)
    descuento_porcentaje = serializers.DecimalField(max_digits=10, decimal_places=3)
    impuesto_porcentaje = serializers.DecimalField(max_digits=10, decimal_places=3)

    def to_representation(self, instance):
        """
        Convert DetallesOrdenVenta instance to the expected format.
        Handles the producto field which doesn't exist directly on the model.
        """
        # Extract producto from either producto_elaborado or producto_reventa
        if instance.producto_elaborado:
            producto_data = {
                'id': instance.producto_elaborado.id,
                'stock': instance.producto_elaborado.stock_actual,
                'nombre_producto': instance.producto_elaborado.nombre_producto,
                'tipo_producto': 'producto-final'
            }
        elif instance.producto_reventa:
            producto_data = {
                'id': instance.producto_reventa.id,
                'stock': instance.producto_reventa.stock_actual,
                'nombre_producto': instance.producto_reventa.nombre_producto,
                'tipo_producto': 'producto-reventa'
            }
        else:
            producto_data = None

        # Get unidad_medida data with full name
        unidad_medida_data = {
            'id': instance.unidad_medida.id,
            'abreviatura': instance.unidad_medida.abreviatura,
            'nombre_completo': instance.unidad_medida.nombre_completo
        } if instance.unidad_medida else None

        return {
            'producto': producto_data,
            'cantidad_solicitada': instance.cantidad_solicitada,
            'unidad_medida': unidad_medida_data,
            'precio_unitario_usd': instance.precio_unitario_usd,
            'subtotal_linea_usd': instance.subtotal_linea_usd,
            'descuento_porcentaje': instance.descuento_porcentaje,
            'impuesto_porcentaje': instance.impuesto_porcentaje,
        }


class OrdenesSerializer(serializers.ModelSerializer):
    productos = ProductosOrdenesSerializer(many=True)
    referencia_pago = serializers.CharField(
        required=False,
        allow_blank=True
    )

    class Meta:
        model = OrdenVenta
        fields = [
            'cliente', 
            'fecha_creacion_orden', 
            'fecha_entrega_solicitada', 
            'fecha_entrega_definitiva', 
            'estado_orden', 
            'notas_generales',
            'metodo_pago', 
            'monto_total_usd', 
            'monto_total_ves', 
            'tasa_cambio_aplicada',
            'monto_descuento_usd', 
            'monto_impuestos_usd',
            'productos',
            'referencia_pago',
        ]
     

class OrdenesDetallesSerializer(serializers.ModelSerializer):
    cliente = ClientesSerializer()
    estado_orden = EstadosOrdenVentaSerializer()
    metodo_pago = MetodosDePagoSerializer()
    productos = ProductosOrdenesSerializer(many=True)
    referencia_pago = serializers.SerializerMethodField()

    class Meta:
        model = OrdenVenta
        fields = [
            'id',
            'cliente', 
            'fecha_creacion_orden', 
            'fecha_entrega_solicitada', 
            'fecha_entrega_definitiva', 
            'estado_orden', 
            'notas_generales',
            'metodo_pago', 
            'monto_total_usd', 
            'monto_total_ves', 
            'tasa_cambio_aplicada',
            'monto_descuento_usd', 
            'monto_impuestos_usd',
            'productos',
            'referencia_pago',
        ]
        extra_kwargs = {
            'referencia_pago': {'read_only': True},
        }

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_referencia_pago(self, instance):
        return Pagos.objects.filter(orden_venta_asociada=instance).values_list('referencia_pago', flat=True).first()


class OrdenesTableSerializer(serializers.ModelSerializer):
    cliente = serializers.CharField(source='cliente.nombre_cliente', read_only=True)
    estado_orden = serializers.CharField(source='estado_orden.nombre_estado', read_only=True)
    metodo_pago = serializers.CharField(source='metodo_pago.nombre_metodo', read_only=True)
    total = serializers.DecimalField(source='monto_total_usd', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrdenVenta
        fields = [
            'id',
            'cliente',
            'fecha_creacion_orden',
            'fecha_entrega_solicitada',
            'fecha_entrega_definitiva',
            'estado_orden',
            'metodo_pago',
            'total',
        ]


class VentasDetallesSerializer(serializers.Serializer):
    producto_elaborado_id = serializers.IntegerField(allow_null=True, required=False)
    producto_reventa_id = serializers.IntegerField(allow_null=True, required=False)
    cantidad = serializers.DecimalField(max_digits=10, decimal_places=2)
    precio_unitario_usd = serializers.DecimalField(max_digits=10, decimal_places=2)
    precio_unitario_ves = serializers.DecimalField(max_digits=10, decimal_places=2)
    subtotal_linea_usd = serializers.DecimalField(max_digits=10, decimal_places=2)
    subtotal_linea_ves = serializers.DecimalField(max_digits=10, decimal_places=2)

class VentasPagosSerializer(serializers.Serializer):
    metodo_pago = serializers.CharField()
    monto_pago_usd = serializers.DecimalField(max_digits=10, decimal_places=2)
    monto_pago_ves = serializers.DecimalField(max_digits=10, decimal_places=2)
    referencia_pago = serializers.CharField(required=False)
    cambio_efectivo_usd = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    cambio_efectivo_ves = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    cambio_pago_movil_usd = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    cambio_pago_movil_ves = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)


class VentasSerializer(serializers.Serializer):
    cliente = serializers.IntegerField()
    monto_total_usd = serializers.DecimalField(max_digits=10, decimal_places=2)
    monto_total_ves = serializers.DecimalField(max_digits=10, decimal_places=2)
    tasa_cambio_aplicada = serializers.DecimalField(max_digits=10, decimal_places=2)
    venta_detalles = VentasDetallesSerializer(many=True)
    pagos = VentasPagosSerializer(many=True)
