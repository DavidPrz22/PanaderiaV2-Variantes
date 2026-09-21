from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field, inline_serializer

from .models import (
    MateriasPrimas, LotesMateriasPrimas, 
    ProductosIntermedios, ProductosFinales,
    ProductosElaborados, LotesProductosElaborados, 
    ProductosReventa, LotesProductosReventa, ProductosReventaVariantes,
    MateriasPrimasVariantes, ProductosElaboradosVariantes,
)

from apps.core.models import UnidadesDeMedida, CategoriasMateriaPrima, CategoriasProductosElaborados, CategoriasProductosReventa
from apps.compras.serializers import ProveedoresSerializer
from apps.compras.models import Proveedores
from apps.produccion.models import Recetas
from apps.core.serializers import UnidadMedidaSerializer, CategoriaMateriaPrimaSerializer


class ComponentesSearchSerializer(serializers.Serializer):
    componente_id = serializers.IntegerField()
    nombre = serializers.CharField()
    tipo = serializers.CharField()
    stock = serializers.DecimalField(required=False, max_digits=10, decimal_places=2)
    unidad_medida = serializers.CharField()


class VarianteSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductosElaboradosVariantes
        fields = [
            'id',
            'nombre_variante',
            'SKU',
        ]



class LotesMateriaPrimaSerializer(serializers.ModelSerializer):
    proveedor_id = serializers.PrimaryKeyRelatedField(
        source='proveedor',
        queryset=Proveedores.objects.all(),
        write_only=True
    )
    fecha_recepcion = serializers.DateField(format="%Y-%m-%d", input_formats=["%Y-%m-%d", "iso-8601"])
    fecha_caducidad = serializers.DateField(format="%Y-%m-%d", input_formats=["%Y-%m-%d", "iso-8601"])

    class Meta:
        model = LotesMateriasPrimas
        fields = [
            'id',
            'variante_materia_prima', 
            'proveedor_id',
            'fecha_recepcion',
            'fecha_caducidad', 
            'cantidad_recibida', 
            'costo_unitario_divisa',
            'costo_unitario_local',
            'detalle_oc',
        ]
    

    def validate(self, data):
        """Validate dates for lot registration."""
        fecha_recepcion = data.get('fecha_recepcion')
        fecha_caducidad = data.get('fecha_caducidad')

        # Import datetime here to avoid circular imports
        from datetime import date

        # Validate that fecha_recepcion is not in the future
        if fecha_recepcion and fecha_recepcion > date.today():
            raise serializers.ValidationError({
                'fecha_recepcion': 'La fecha de recepción no puede ser una fecha futura.'
            })

        # Validate that fecha_caducidad is after fecha_recepcion
        if fecha_recepcion and fecha_caducidad:
            if fecha_caducidad <= fecha_recepcion:
                raise serializers.ValidationError({
                    'fecha_caducidad': 'La fecha de caducidad debe ser posterior a la fecha de recepción.'
                })

            # Optional: Warn if dates are too close (less than 1 day apart)
            if (fecha_caducidad - fecha_recepcion).days < 1:
                raise serializers.ValidationError({
                    'fecha_caducidad': 'La fecha de caducidad debe ser al menos 1 día después de la fecha de recepción.'
                })
        
        # Validate that cantidad_recibida is greater than 0
        cantidad_recibida = data.get('cantidad_recibida')
        if cantidad_recibida is not None and cantidad_recibida <= 0:
            raise serializers.ValidationError({
                'cantidad_recibida': 'La cantidad recibida debe ser mayor a 0.'
            })

        # Validate that costo_unitario_divisa is greater than 0
        costo_unitario_divisa = data.get('costo_unitario_divisa')
        if costo_unitario_divisa is not None and costo_unitario_divisa <= 0:
            raise serializers.ValidationError({
                'costo_unitario_divisa': 'El costo unitario en divisa debe ser mayor a 0.'
            })

        # Validate that costo_unitario_local is greater than 0
        costo_unitario_local = data.get('costo_unitario_local')
        if costo_unitario_local is not None and costo_unitario_local <= 0:
            raise serializers.ValidationError({
                'costo_unitario_local': 'El costo unitario en moneda local debe ser mayor a 0.'
            })


        return data


class MateriaPrimaVariantesDetallesSerializer(serializers.ModelSerializer):
    unidad_medida_empaque_estandar = UnidadMedidaSerializer(read_only=True)
    unidad_compra = UnidadMedidaSerializer(read_only=True)

    class Meta:
        model = MateriasPrimasVariantes
        fields = [
            'id',
            'nombre_variante',
            'unidad_compra',
            'SKU_variante',
            'precio_compra_divisa',
            'precio_compra_local',
            'nombre_empaque_estandar',
            'cantidad_empaque_estandar',
            'unidad_medida_empaque_estandar',
        ]


class LotesMateriaPrimaDetailsSerializer(serializers.ModelSerializer):
    proveedor = ProveedoresSerializer(read_only=True)
    fecha_recepcion = serializers.DateField(format="%Y-%m-%d")
    fecha_caducidad = serializers.DateField(format="%Y-%m-%d")
    variante_materia_prima = MateriaPrimaVariantesDetallesSerializer(read_only=True)
    
    class Meta:
        model = LotesMateriasPrimas
        fields = [
            'id',
            'variante_materia_prima', 
            'proveedor',
            'fecha_recepcion',
            'fecha_caducidad', 
            'cantidad_recibida', 
            'costo_unitario_divisa',
            'stock_actual_lote',
            'costo_unitario_local',
            'estado',
            'activo',
            'detalle_oc',
        ]


class MateriaPrimaVariantesSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    SKU_variante = serializers.CharField(required=False, allow_blank=True, allow_null=True, validators=[])

    class Meta:
        model = MateriasPrimasVariantes
        fields = [
            'id',
            'nombre_variante',
            'unidad_compra',
            'SKU_variante',
            'precio_compra_divisa',
            'precio_compra_local',
            'nombre_empaque_estandar',
            'cantidad_empaque_estandar',
            'unidad_medida_empaque_estandar',
        ]
        extra_kwargs = {
            'SKU_variante': {'validators': []}
        }


class MateriaPrimaSerializer(serializers.ModelSerializer):
    variantes = MateriaPrimaVariantesSerializer(many=True, required=False)

    class Meta:
        model = MateriasPrimas
        fields = [
            'nombre',
            'SKU',
            'punto_reorden',
            'unidad_medida_base',
            'categoria',
            'descripcion',
            'variantes',
            'stock_actual',
            'fecha_creacion_registro'
        ]


class MateriaPrimaListSerializer(serializers.ModelSerializer):
    """Lighter serializer for table/list views."""
    categoria = CategoriaMateriaPrimaSerializer(read_only=True)
    unidad_medida_base = UnidadMedidaSerializer(read_only=True)

    class Meta:
        model = MateriasPrimas
        fields = [
            'id',
            'nombre',
            'unidad_medida_base',
            'categoria',
            'stock_actual',
            'punto_reorden',
            'fecha_creacion_registro'
        ]


class MateriaPrimaDetailsSerializer(MateriaPrimaListSerializer):
    """Full serializer for detail view, including variants and full descriptions."""
    variantes = MateriaPrimaVariantesDetallesSerializer(many=True, required=False)
    
    class Meta(MateriaPrimaListSerializer.Meta):
        fields = MateriaPrimaListSerializer.Meta.fields + [
            'SKU',
            'descripcion',
            'variantes',
        ]


class VariantesProductionSearchSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = ProductosElaboradosVariantes
        fields = [
            'id',
            'nombre_variante',
            'SKU',
            'atributo'
        ]


class ProductionSearchSerializer(serializers.ModelSerializer):
    variantes = VariantesProductionSearchSerializer(many=True, required=False)
    producto_id = serializers.IntegerField(source='id', read_only=True)
    categoria = serializers.CharField(source='categoria.nombre_categoria', read_only=True)
    unidad_produccion = UnidadMedidaSerializer(read_only=True)
    
    class Meta:
        model = ProductosElaborados
        fields = [
            'producto_id',
            'nombre_producto',
            'unidad_produccion',
            'categoria',
            'variantes',
        ]


class ProductosIntermediosListSerializer(serializers.ModelSerializer):
    """Lighter serializer for table/list views."""
    categoria_nombre = serializers.CharField(source='categoria.nombre_categoria', read_only=True)
    unidad_produccion_nombre = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductosIntermedios
        fields = [
            'id',
            'nombre_producto',
            'unidad_produccion_nombre',
            'stock_actual',
            'categoria_nombre',
            'fecha_creacion_registro'
        ]


    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_unidad_produccion_nombre(self, obj):
        return obj.unidad_produccion.nombre_completo if obj.unidad_produccion else None


class ProductosIntermediosVariantesSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    SKU = serializers.CharField(validators=[])

    class Meta:
        model = ProductosElaboradosVariantes
        fields = [
            'id',
            'nombre_variante',
            'SKU',
            'descripcion',
            'stock_actual',
            'punto_reorden',
            'atributo'
        ]

class ProductosIntermediosSerializer(serializers.ModelSerializer):
    variantes = ProductosIntermediosVariantesSerializer(many=True, required=False)
    producto_id = serializers.IntegerField(required=False)

    class Meta:
        model = ProductosIntermedios
        fields = [
            'producto_id',
            'nombre_producto', 
            'categoria',
            'unidad_produccion',
            'descripcion',
            'variantes',
        ]

    def get_producto_id(self, obj):
        return obj.id

class ProductosIntermediosDetallesSerializer(serializers.ModelSerializer):
    categoria_producto = serializers.SerializerMethodField()
    receta_relacionada = serializers.SerializerMethodField()
    unidad_produccion_producto = serializers.SerializerMethodField()
    punto_reorden = serializers.SerializerMethodField()
    variantes = ProductosIntermediosVariantesSerializer(many=True, required=False)
    class Meta:
        model = ProductosIntermedios
        fields = [
            'id',
            'nombre_producto',
            'stock_actual',
            'punto_reorden',
            'categoria_producto',
            'unidad_produccion_producto',
            'fecha_creacion_registro',
            'tipo_medida_fisica',
            'descripcion',
            'receta_relacionada',
            'variantes'
        ]

    @extend_schema_field(inline_serializer(
        name='IntermedioCategoriaProductoResponse',
        fields={
            'id': serializers.IntegerField(),
            'nombre_categoria': serializers.CharField(),
        }
    ))
    def get_categoria_producto(self, obj):
        if not obj.categoria:
            return None
        return {
            'id': obj.categoria.id,
            'nombre_categoria': obj.categoria.nombre_categoria,
        }

    @extend_schema_field(inline_serializer(
        name='IntermedioUnidadProduccionProductoResponse',
        fields={
            'id': serializers.IntegerField(),
            'nombre_completo': serializers.CharField(),
        }
    ))
    def get_unidad_produccion_producto(self, obj):
        if not obj.unidad_produccion:
            return None
        return {
            'id': obj.unidad_produccion.id,
            'nombre_completo': obj.unidad_produccion.nombre_completo,
        }


    @extend_schema_field(serializers.IntegerField())
    def get_punto_reorden(self, obj):
        return 0

    @extend_schema_field(inline_serializer(
        name='IntermedioRecetaRelacionadaResponse',
        fields={
            'id': serializers.IntegerField(),
            'nombre': serializers.CharField(),
        }
    ))
    def get_receta_relacionada(self, obj):
        """Get the related recipe for a product."""
        receta_relacionada = Recetas.objects.filter(producto_elaborado_variante__producto_elaborado=obj).first()
        if receta_relacionada:
            return {
                'id': receta_relacionada.id,
                'nombre': receta_relacionada.nombre,
            }
        return None


class ProductosFinalesVariantesSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    SKU = serializers.CharField(validators=[])

    class Meta:
        model = ProductosElaboradosVariantes
        fields = [
            'id',
            'nombre_variante',
            'SKU',
            'descripcion',
            'stock_actual',
            'punto_reorden',
            'atributo',
            'precio_venta_divisa',
            'precio_venta_local',
        ]


class ProductosFinalesListSerializer(serializers.ModelSerializer):
    """Lighter serializer for table/list views."""
    categoria_nombre = serializers.CharField(source='categoria.nombre_categoria', read_only=True)
    unidad_venta_nombre = serializers.CharField(source='unidad_venta.nombre_completo', read_only=True)
    unidad_produccion_nombre = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductosFinales
        fields = [
            'id',
            'nombre_producto',
            'categoria_nombre',
            'unidad_venta_nombre',
            'unidad_produccion_nombre',
            'fecha_creacion_registro',
            'stock_actual',
        ]


    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_unidad_produccion_nombre(self, obj):
        return obj.unidad_produccion.nombre_completo if obj.unidad_produccion else None


class ProductosFinalesSerializer(serializers.ModelSerializer):
    variantes = ProductosFinalesVariantesSerializer(many=True, required=False)
    class Meta:
        model = ProductosFinales
        fields = [
            'id',
            'nombre_producto',
            'vendible_por_medida_real',
            'categoria',
            'unidad_venta',
            'unidad_produccion',
            'tipo_medida_fisica',
            'descripcion',
            'usado_en_transformaciones',
            'variantes',
        ]


class ProductosFinalesDetallesSerializer(serializers.ModelSerializer):
    categoria_producto = serializers.SerializerMethodField()
    receta_relacionada = serializers.SerializerMethodField()
    unidad_produccion_producto = serializers.SerializerMethodField()
    unidad_venta_producto = serializers.SerializerMethodField()
    variantes = ProductosFinalesVariantesSerializer(many=True, required=False)
    punto_reorden = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductosFinales
        fields = [
            'id',
            'nombre_producto',
            'categoria_producto',
            'unidad_produccion_producto',
            'unidad_venta_producto',
            'tipo_medida_fisica',
            'vendible_por_medida_real',
            'fecha_creacion_registro',
            'descripcion',
            'receta_relacionada',
            'usado_en_transformaciones',
            'variantes',
            'stock_actual',
            'punto_reorden',
        ]

    @extend_schema_field(inline_serializer(
        name='FinalCategoriaProductoResponse',
        fields={
            'id': serializers.IntegerField(),
            'nombre_categoria': serializers.CharField(),
        }
    ))
    def get_categoria_producto(self, obj):
        if not obj.categoria:
            return None
        return {
            'id': obj.categoria.id,
            'nombre_categoria': obj.categoria.nombre_categoria,
        }

    @extend_schema_field(inline_serializer(
        name='FinalUnidadProduccionProductoResponse',
        fields={
            'id': serializers.IntegerField(),
            'nombre_completo': serializers.CharField(),
        }
    ))
    def get_unidad_produccion_producto(self, obj):
        if not obj.unidad_produccion:
            return None
        return {
            'id': obj.unidad_produccion.id,
            'nombre_completo': obj.unidad_produccion.nombre_completo,
        }

    @extend_schema_field(inline_serializer(
        name='FinalUnidadVentaProductoResponse',
        fields={
            'id': serializers.IntegerField(),
            'nombre_completo': serializers.CharField(),
        }
    ))
    def get_unidad_venta_producto(self, obj):
        if not obj.unidad_venta:
            return None
        return {
            'id': obj.unidad_venta.id,
            'nombre_completo': obj.unidad_venta.nombre_completo,
        }


    @extend_schema_field(serializers.IntegerField())
    def get_punto_reorden(self, obj):
        # Can return 0 here, it's mostly handled per variant
        return 0

    @extend_schema_field(inline_serializer(
        name='FinalRecetaRelacionadaResponse',
        fields={
            'id': serializers.IntegerField(),
            'nombre': serializers.CharField(),
        }
    ))
    def get_receta_relacionada(self, obj):
        """Get the related recipe for a product."""
        receta_relacionada = Recetas.objects.filter(producto_elaborado_variante__producto_elaborado=obj).first()
        if receta_relacionada:
            return {
                'id': receta_relacionada.id,
                'nombre': receta_relacionada.nombre,
            }
        return None


class ProductosFinalesListaTransformacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductosFinales
        fields = ['id', 'nombre_producto']


class LotesProductosElaboradosSerializer(serializers.ModelSerializer):
    fecha_produccion = serializers.DateField(format="%Y-%m-%d", input_formats=["%Y-%m-%d", "iso-8601"])
    fecha_caducidad = serializers.DateField(format="%Y-%m-%d", input_formats=["%Y-%m-%d", "iso-8601"])
    peso_promedio_por_unidad = serializers.SerializerMethodField()
    volumen_promedio_por_unidad = serializers.SerializerMethodField()
    costo_unitario_divisa = serializers.SerializerMethodField()
    producto_elaborado_variante = serializers.SerializerMethodField()

    class Meta: 
        model = LotesProductosElaborados
        fields = [
            "id",
            "cantidad_inicial_lote",
            "stock_actual_lote",
            "producto_elaborado_variante",
            "fecha_produccion",
            "fecha_caducidad",
            "estado",
            "coste_total_lote_divisa",
            'coste_total_lote_local',
            "peso_total_lote_gramos",
            "volumen_total_lote_ml",
            "produccion_origen",
            "peso_promedio_por_unidad",
            "volumen_promedio_por_unidad",
            "costo_unitario_divisa",
        ]

    @extend_schema_field(inline_serializer(
        name='ProductoElaboradoVarianteResponse',
        fields={
            'id': serializers.IntegerField(),
            'nombre_variante': serializers.CharField(),
        }
    ))
    def get_producto_elaborado_variante(self, obj):
        return {
            'id': obj.producto_elaborado_variante.id,
            'nombre_variante': obj.producto_elaborado_variante.nombre_variante,
        }

    def validate(self, data):
        """Validate dates for lot registration."""
        fecha_produccion = data.get('fecha_produccion')
        fecha_caducidad = data.get('fecha_caducidad')

        # Import datetime here to avoid circular imports
        from datetime import date

        # Validate that fecha_produccion is not in the future
        if fecha_produccion and fecha_produccion > date.today():
            raise serializers.ValidationError({
                'fecha_produccion': 'La fecha de producción no puede ser una fecha futura.'
            })

        # Validate that fecha_caducidad is after fecha_produccion
        if fecha_produccion and fecha_caducidad:
            if fecha_caducidad <= fecha_produccion:
                raise serializers.ValidationError({
                    'fecha_caducidad': 'La fecha de caducidad debe ser posterior a la fecha de producción.'
                })

            # Optional: Warn if dates are too close (less than 1 day apart)
            if (fecha_caducidad - fecha_produccion).days < 1:
                raise serializers.ValidationError({
                    'fecha_caducidad': 'La fecha de caducidad debe ser al menos 1 día después de la fecha de producción.'
                })

        return data

    @extend_schema_field(serializers.DecimalField(max_digits=10, decimal_places=2))
    def get_peso_promedio_por_unidad(self, obj):
        return obj.peso_promedio_por_unidad

    @extend_schema_field(serializers.DecimalField(max_digits=10, decimal_places=2))
    def get_volumen_promedio_por_unidad(self, obj):
        return obj.volumen_promedio_por_unidad

    @extend_schema_field(serializers.DecimalField(max_digits=10, decimal_places=2))
    def get_costo_unitario_divisa(self, obj):
        return obj.costo_unitario_divisa


class ProductosElaboradosSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductosElaborados
        fields = "__all__"

class ProductosReventaVariantesSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    SKU = serializers.CharField(validators=[])

    class Meta:
        model = ProductosReventaVariantes
        fields = [
            'id',
            'nombre_variante',
            'SKU',
            'descripcion',
            'stock_actual',
            'punto_reorden',
            'atributo',
            'precio_venta_divisa',
            'precio_venta_local',
            'costo_divisa',
            'costo_local'
        ]


class ProductosReventaListSerializer(serializers.ModelSerializer):
    unidad_venta_nombre = serializers.CharField(source='unidad_venta.nombre_completo', read_only=True)
    unidad_base_inventario_nombre = serializers.CharField(source='unidad_base_inventario.nombre_completo', read_only=True)
    categoria_nombre = serializers.CharField(source='categoria.nombre_categoria', read_only=True)

    class Meta:
        model = ProductosReventa
        fields = [
            'id', 
            'nombre_producto',
            'unidad_base_inventario_nombre', 
            'categoria_nombre', 
            'stock_actual',
            'unidad_venta_nombre',
            'fecha_creacion_registro',
        ]


class ProductosReventaSerializer(serializers.ModelSerializer):
    variantes = ProductosReventaVariantesSerializer(many=True, required=False)
    unidad_base_inventario = serializers.PrimaryKeyRelatedField(
        source='unidad_medida_base',
        queryset=UnidadesDeMedida.objects.all(),
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = ProductosReventa
        fields = [
            'id',
            'nombre_producto',
            'descripcion',
            'categoria',
            'marca',
            'proveedor_preferido',
            'unidad_base_inventario',
            'unidad_venta',
            'factor_conversion',
            'es_perecedero',
            'variantes',
        ]


class LotesProductosReventaSerializer(serializers.ModelSerializer):
    fecha_recepcion = serializers.DateField(format="%Y-%m-%d", input_formats=["%Y-%m-%d", "iso-8601"])
    fecha_caducidad = serializers.DateField(format="%Y-%m-%d", input_formats=["%Y-%m-%d", "iso-8601"])
    
    class Meta:
        model = LotesProductosReventa
        fields = [
            'id',
            'producto_reventa_variante',
            'fecha_recepcion',
            'fecha_caducidad',
            'cantidad_recibida',
            'stock_actual_lote',
            'coste_unitario_lote_divisa',
            'coste_unitario_lote_local',
            'detalle_oc',
            'proveedor',
            'estado'
        ]


    def validate(self, data):
        """Validate dates for lot registration."""
        fecha_recepcion = data.get('fecha_recepcion')
        fecha_caducidad = data.get('fecha_caducidad')

        # Import datetime here to avoid circular imports
        from datetime import date


        # Validate that fecha_caducidad is after fecha_recepcion
        if fecha_recepcion and fecha_caducidad:
            if fecha_caducidad <= fecha_recepcion:
                raise serializers.ValidationError({
                    'fecha_caducidad': 'La fecha de caducidad debe ser posterior a la fecha de recepción.'
                })

            # Optional: Warn if dates are too close (less than 1 day apart)
            if (fecha_caducidad - fecha_recepcion).days < 1:
                raise serializers.ValidationError({
                    'fecha_caducidad': 'La fecha de caducidad debe ser al menos 1 día después de la fecha de recepción.'
                })

        return data


class ProductosReventaDetallesSerializer(serializers.ModelSerializer):
    categoria = serializers.SerializerMethodField()
    proveedor_preferido = serializers.SerializerMethodField()
    unidad_base_inventario = serializers.SerializerMethodField()
    unidad_venta = serializers.SerializerMethodField()
    variantes = ProductosReventaVariantesSerializer(many=True, read_only=True)

    class Meta:
        model = ProductosReventa
        fields = [
            'id',
            'nombre_producto',
            'descripcion',
            'categoria',
            'marca',
            'proveedor_preferido',
            'unidad_base_inventario',
            'unidad_venta',
            'factor_conversion',
            'es_perecedero',
            'variantes',
            'fecha_creacion_registro',
        ]

    @extend_schema_field(inline_serializer(
        name='ReventaCategoriaResponse',
        fields={
            'id': serializers.IntegerField(),
            'nombre_categoria': serializers.CharField(),
        }
    ))
    def get_categoria(self, obj):
        if not obj.categoria:
            return None
        return {
            'id': obj.categoria.id,
            'nombre_categoria': obj.categoria.nombre_categoria,
        }

    @extend_schema_field(inline_serializer(
        name='ProveedorPreferidoResponse',
        fields={
            'id': serializers.IntegerField(),
            'nombre_proveedor': serializers.CharField(),
        }
    ))
    def get_proveedor_preferido(self, obj):
        if obj.proveedor_preferido:
            return {
                'id': obj.proveedor_preferido.id,
                'nombre_proveedor': obj.proveedor_preferido.nombre_proveedor,
            }
        return None

    @extend_schema_field(inline_serializer(
        name='UnidadBaseInventarioResponse',
        fields={
            'id': serializers.IntegerField(),
            'nombre_completo': serializers.CharField(),
            'abreviatura': serializers.CharField(),
        }
    ))
    def get_unidad_base_inventario(self, obj):
        if not obj.unidad_base_inventario:
            return None
        return {
            'id': obj.unidad_base_inventario.id,
            'nombre_completo': obj.unidad_base_inventario.nombre_completo,
            'abreviatura': obj.unidad_base_inventario.abreviatura,
        }

    @extend_schema_field(inline_serializer(
        name='ReventaUnidadVentaResponse',
        fields={
            'id': serializers.IntegerField(),
            'nombre_completo': serializers.CharField(),
            'abreviatura': serializers.CharField(),
        }
    ))
    def get_unidad_venta(self, obj):
        if not obj.unidad_venta:
            return None
        return {
            'id': obj.unidad_venta.id,
            'nombre_completo': obj.unidad_venta.nombre_completo,
            'abreviatura': obj.unidad_venta.abreviatura,
        }

class CajaProductosVariantesSerializer(serializers.Serializer):
    def to_representation(self, instance):
        return {
            'id': instance.id,
            'nombre': instance.nombre_variante,
            'stock': instance.stock_actual,
            'precio': instance.precio_venta_divisa,
            'atributo': instance.atributo if instance.atributo else None,
            'sku': instance.SKU,
        }

class CajaProductosSerializer(serializers.Serializer):
    def to_representation(self, instance):
        tipo_producto = 'reventa' if isinstance(instance, ProductosReventa) else 'final'
        
        return {
            'id': instance.id,
            'nombre': instance.nombre_producto,
            'categoria': instance.categoria.nombre_categoria if instance.categoria else None,
            'unidadVenta': instance.unidad_venta.abreviatura if instance.unidad_venta else None,
            'stock': instance.stock_actual,
            'tipo': tipo_producto,
            'variantes': CajaProductosVariantesSerializer(instance.variantes, many=True).data if instance.variantes else []
        }

class RegisterYAMLSerializer(serializers.Serializer):
    file = serializers.CharField(min_length=2)
