from rest_framework import serializers
from .models import (
    UnidadesDeMedida, 
    CategoriasMateriaPrima, 
    CategoriasProductosElaborados, 
    CategoriasProductosReventa, 
    MetodosDePago, 
    EstadosOrdenVenta, 
    EstadosOrdenCompra, 
    Notificaciones, 
    ConversionesUnidades,
    EmpaquetadoProductos
    )

from .models import TiposProductosNotificaciones

from apps.inventario.models import (
    ProductosReventaVariantes,
    ProductosElaboradosVariantes,
    MateriasPrimasVariantes,
)

class UnidadMedidaSerializer(serializers.ModelSerializer):
    class Meta:
        model = UnidadesDeMedida
        fields = ['id', 'nombre_completo', 'abreviatura', 'tipo_medida']


class ConversionUnidadSerializer(serializers.ModelSerializer):
    unidad_origen_nombre = serializers.CharField(source='unidad_origen.nombre_completo', read_only=True)
    unidad_destino_nombre = serializers.CharField(source='unidad_destino.nombre_completo', read_only=True)
    
    class Meta:
        model = ConversionesUnidades
        fields = ['id', 'unidad_origen', 'unidad_origen_nombre', 'unidad_destino', 'unidad_destino_nombre', 'factor_conversion']

class EmpaquetadoProductosSerializer(serializers.ModelSerializer):
    empaque_nombre = serializers.CharField(source='empaque.nombre_empaque', read_only=True)
    unidad_medida_abreviatura = serializers.CharField(source='unidad_medida.abreviatura', read_only=True)

    class Meta:
        model = EmpaquetadoProductos
        fields = ['id', 'empaque', 'empaque_nombre', 'cantidad_por_contenedor', 'unidad_medida', 'unidad_medida_abreviatura', 'cantidad_unidad_medida']

class CategoriaMateriaPrimaSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoriasMateriaPrima
        fields = ['id', 'nombre_categoria']

class CategoriaProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoriasProductosElaborados
        fields = ['id', 'nombre_categoria', 'es_intermediario']

class CategoriaProductosReventaSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoriasProductosReventa
        fields = ['id', 'nombre_categoria']

class MetodosDePagoSerializer(serializers.ModelSerializer):
    class Meta:
        model = MetodosDePago
        fields = ['id', 'nombre_metodo', 'requiere_referencia']

class EstadosOrdenVentaSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstadosOrdenVenta
        fields = ['id', 'nombre_estado']

class EstadosOrdenCompraSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstadosOrdenCompra
        fields = ['id', 'nombre_estado']

class VarianteNotificacionesSerializer(serializers.Serializer):
    def to_representation(self, instance):
        # Handle variations in field names across models
        sku = getattr(instance, 'SKU', getattr(instance, 'SKU_variante', None))
        return {
            'id': instance.id,
            'nombre': instance.nombre_variante,
            'sku': sku,
        }

class NotificacionesSerializer(serializers.ModelSerializer):
    tiempo = serializers.SerializerMethodField()
    variante = serializers.SerializerMethodField()
    
    class Meta:
        model = Notificaciones
        fields = [
            'id', 
            'tipo_notificacion', 
            'tipo_producto', 
            'producto_id', 
            'variante', 
            'descripcion', 
            'tiempo', 
            'leida', 
            'prioridad'
        ]
    
    def get_variante(self, obj):
        if not obj.variante_id:
            return None
            
        variante = None
        if obj.tipo_producto == TiposProductosNotificaciones.PRODUCTOS_REVENTA:
            variante = ProductosReventaVariantes.objects.filter(id=obj.variante_id).first()
        elif obj.tipo_producto == TiposProductosNotificaciones.PRODUCTOS_INTERMEDIOS or obj.tipo_producto == TiposProductosNotificaciones.PRODUCTOS_FINALES:
            variante = ProductosElaboradosVariantes.objects.filter(id=obj.variante_id).first()
        elif obj.tipo_producto == TiposProductosNotificaciones.MATERIA_PRIMA:
            variante = MateriasPrimasVariantes.objects.filter(id=obj.variante_id).first()
            
        if variante:
            return VarianteNotificacionesSerializer(variante).data
        return None

    def get_tiempo(self, obj):
        from django.utils import timezone
        if obj.fecha_notificacion:
            delta = timezone.now() - obj.fecha_notificacion
            total_seconds = int(delta.total_seconds())
            
            if total_seconds < 60:
                return f"hace {total_seconds} segundos"
            elif total_seconds < 3600:
                minutes = total_seconds // 60
                return f"hace {minutes} minutos"
            elif total_seconds < 86400:
                hours = total_seconds // 3600
                return f"hace {hours} horas"
            else:
                days = total_seconds // 86400
                return f"hace {days} días"
        return "hace poco"