from rest_framework import serializers
from .models import Recetas, RecetasDetalles, RelacionesRecetas
from apps.produccion.models import Produccion, DetalleProduccionConsumos


class componentsSerializer(serializers.Serializer):
    componente_id = serializers.IntegerField()
    cantidad = serializers.DecimalField(max_digits=10, decimal_places=3)
    tipo = serializers.CharField()


class RecetasSerializer(serializers.ModelSerializer):

    recetas_relacionadas = serializers.ListField(write_only=True, required=False)
    componentes = serializers.ListField(child=componentsSerializer(), write_only=True, required=False)
    class Meta:
        model = Recetas
        fields = [
            'nombre',
            'rendimiento',
            'notas',
            'componentes',
            'producto_elaborado_variante',
            'recetas_relacionadas'
        ]


class RecetasDetallesSerializer(serializers.ModelSerializer):
    componentes = serializers.ListField(write_only=True, required=False)
    receta_relacionada = serializers.ListField(write_only=True, required=False)
    esCompuesta = serializers.SerializerMethodField(read_only=True)
    unidad_medida_producto = serializers.CharField(source='producto_elaborado_variante.producto_elaborado.unidad_produccion.nombre_completo', read_only=True)
    producto_elaborado = serializers.SerializerMethodField()

    class Meta:
        model = Recetas
        fields = [
                    'id',
                    'producto_elaborado', 
                    'unidad_medida_producto',
                    'nombre',
                    'rendimiento',
                    'fecha_creacion',
                    'notas',
                    'componentes',
                    'receta_relacionada',
                    'esCompuesta'
                ]

    def get_producto_elaborado(self, obj):
        variante = obj.producto_elaborado_variante
        if not variante:
            return None
        return {
            'id': variante.id,
            'nombre': f"{variante.producto_elaborado.nombre_producto} - {variante.nombre_variante}",
            'unidad_medida': variante.producto_elaborado.unidad_produccion.nombre_completo if variante.producto_elaborado.unidad_produccion else None
        }
    

    def get_esCompuesta(self, obj):
        return RelacionesRecetas.objects.filter(receta_principal=obj).exists()

    def validate_rendimiento(self, value):
        if value is not None and value <= 0:
            raise serializers.ValidationError(
                "El rendimiento debe ser mayor que 0"
            )
        return value


class RecetasSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recetas
        fields = ['id', 'nombre']


class RecetasListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recetas
        fields = ['id', 'nombre', 'fecha_creacion']


class RecetaDetalleItemSerializer(serializers.ModelSerializer):

    class Meta:
        model = RecetasDetalles
        fields = [
            'id',
            'receta',
            'componente_materia_prima',
            'componente_producto_intermedio',
            'cantidad'
        ]


class ProduccionSerializer(serializers.Serializer):
    producto_variante_id = serializers.IntegerField()
    cantidadProduction = serializers.IntegerField()
    peso = serializers.DecimalField(max_digits=10, decimal_places=3, required=False)
    volumen = serializers.DecimalField(max_digits=10, decimal_places=3, required=False)
    componentes = serializers.ListField(child=componentsSerializer())
    fechaExpiracion = serializers.DateField()
    tipoProducto = serializers.CharField()


class ComponentesProduccionSerializer(serializers.ModelSerializer):
    materia_prima_consumida = serializers.CharField(source='materia_prima_consumida.nombre', read_only=True, allow_null=True)
    producto_intermedio_consumido = serializers.CharField(source='producto_intermedio_consumido.nombre_producto', read_only=True, allow_null=True)
    unidad_medida = serializers.SerializerMethodField()

    class Meta:
        model = DetalleProduccionConsumos
        fields = ['materia_prima_consumida', 'producto_intermedio_consumido', 'cantidad_consumida', 'unidad_medida']

    def get_unidad_medida(self, obj):
        if obj.materia_prima_consumida:
            return obj.materia_prima_consumida.unidad_medida_base.abreviatura
        elif obj.producto_intermedio_consumido:
            return obj.producto_intermedio_consumido.unidad_produccion.abreviatura


class ProduccionDetallesSerializer(serializers.ModelSerializer):
    producto_produccion = serializers.CharField(source='producto_elaborado.nombre_producto', read_only=True)
    unidad_medida_produccion = serializers.CharField(source='unidad_medida.nombre_completo', read_only=True)
    usuario_produccion = serializers.CharField(source='usuario_creacion.username', read_only=True)
    componentes_produccion = serializers.SerializerMethodField()

    class Meta:
        model = Produccion
        fields = [
            'id',
            'producto_produccion',
            'cantidad_producida',
            'unidad_medida_produccion',
            'fecha_produccion',
            'fecha_expiracion',
            'costo_total_componentes_divisa',
            'costo_total_componentes_local',
            'usuario_produccion',
            'componentes_produccion',
        ]

    def get_componentes_produccion(self, obj):

        componentes = DetalleProduccionConsumos.objects.filter(produccion=obj)
        return ComponentesProduccionSerializer(componentes, many=True).data
