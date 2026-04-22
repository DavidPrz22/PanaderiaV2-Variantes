from rest_framework import serializers
from apps.compras.models import Proveedores
from apps.compras.models import OrdenesCompra, PagosProveedores, DetalleOrdenesCompra, Compras
from apps.core.serializers import (
    EstadosOrdenCompraSerializer, 
    MetodosDePagoSerializer,
    UnidadMedidaSerializer,
    EmpaquetadoProductosSerializer
)
from apps.inventario.models import MateriasPrimasVariantes, ProductosReventaVariantes
from django.db.models import Sum
from apps.core.models import UnidadesDeMedida, EmpaquetadoProductos


class ProveedoresSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proveedores
        fields = [
                    'id', 
                    'nombre_proveedor', 
                    'apellido_proveedor', 
                    'nombre_comercial',   
                    'email_contacto', 
                    'telefono_contacto', 
                    'fecha_creacion_registro', 
                    'usuario_registro', 
                    'notas'
                ]


class CompraRegistroProveedoresSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proveedores
        fields = [
                    'id', 
                    'nombre_proveedor'
                ]


class DetallesSerializer(serializers.ModelSerializer):
    # Map frontend generic names to variant models
    materia_prima = serializers.PrimaryKeyRelatedField(
        queryset=MateriasPrimasVariantes.objects.all(), 
        required=False, 
        allow_null=True
    )
    producto_reventa = serializers.PrimaryKeyRelatedField(
        queryset=ProductosReventaVariantes.objects.all(), 
        required=False, 
        allow_null=True
    )
    
    cantidad_solicitada = serializers.DecimalField(max_digits=15, decimal_places=3, allow_null=True, required=False)
    unidad_medida_compra = serializers.PrimaryKeyRelatedField(
        queryset=UnidadesDeMedida.objects.all(), 
        allow_null=True, 
        required=False
    )
    unidad_empaquetado = serializers.PrimaryKeyRelatedField(
        queryset=EmpaquetadoProductos.objects.all(), 
        allow_null=True, 
        required=False
    )
    modo_compra = serializers.ChoiceField(
        choices=[('unidad', 'Unidad'), ('contenedor', 'Contenedor')], 
        required=False, 
        write_only=True
    )

    class Meta:
        model = DetalleOrdenesCompra
        fields = [
            'id',
            'materia_prima',
            'producto_reventa',
            'cantidad_solicitada',
            'unidad_medida_compra',
            'unidad_empaquetado',
            'modo_compra',
            'costo_unitario_usd',
            'costo_unitario_ves',
            'subtotal_linea_usd',
            'subtotal_linea_ves',
        ]
    
    def validate(self, data):
        """
        Validate that purchase unit tipo_medida matches product's base unit tipo_medida.
        This ensures unit conversions are valid.
        """
        from apps.core.models import UnidadesDeMedida
        from apps.inventario.models import MateriasPrimasVariantes, ProductosReventaVariantes
        
        unidad_compra_id = data.get('unidad_medida_compra')
        unidad_empaquetado = data.get('unidad_empaquetado')

        if not unidad_compra_id and not unidad_empaquetado:
            raise serializers.ValidationError(
                "Debe proporcionar sea la unidad de medida o la unidad de empaquetado."
            )

        if not unidad_compra_id:
            return data
        
        materia_prima_variante = data.get('materia_prima')
        producto_reventa_variante = data.get('producto_reventa')
        
        if isinstance(unidad_compra_id, UnidadesDeMedida):
            unidad_compra = unidad_compra_id
        else:
            unidad_compra = UnidadesDeMedida.objects.get(id=unidad_compra_id)
        
        # Check materia prima
        if materia_prima_variante:
            if isinstance(materia_prima_variante, MateriasPrimasVariantes):
                base_unit = materia_prima_variante.materia_prima.unidad_medida_base
            else:
                mp_var = MateriasPrimasVariantes.objects.get(id=materia_prima_variante)
                base_unit = mp_var.materia_prima.unidad_medida_base
            
            if unidad_compra.tipo_medida != base_unit.tipo_medida:
                raise serializers.ValidationError(
                    f"La unidad de compra '{unidad_compra.nombre_completo}' (tipo: {unidad_compra.tipo_medida}) "
                    f"no es compatible con la unidad base '{base_unit.nombre_completo}' (tipo: {base_unit.tipo_medida}) "
                    f"de la materia prima."
                )
        
        # Check producto reventa
        if producto_reventa_variante:
            if isinstance(producto_reventa_variante, ProductosReventaVariantes):
                base_unit = producto_reventa_variante.producto_reventa.unidad_medida_base
            else:
                pr_var = ProductosReventaVariantes.objects.get(id=producto_reventa_variante)
                base_unit = pr_var.producto_reventa.unidad_medida_base
            
            if base_unit and unidad_compra.tipo_medida != base_unit.tipo_medida:
                raise serializers.ValidationError(
                    f"La unidad de compra '{unidad_compra.nombre_completo}' (tipo: {unidad_compra.tipo_medida}) "
                    f"no es compatible con la unidad base '{base_unit.nombre_completo}' (tipo: {base_unit.tipo_medida}) "
                    f"del producto de reventa."
                )
        
        return data





class ComprasSerializer(serializers.ModelSerializer):
    class Meta:
        model = Compras
        fields = [
            'id',
            'orden_compra',
            'fecha_recepcion',
            'monto_pendiente_pago_usd',
            'tasa_cambio_aplicada',
            'pagado',
        ]



class OrdenesCompraSerializer(serializers.ModelSerializer):
    detalles = DetallesSerializer(many=True)
    class Meta:
        model = OrdenesCompra
        fields = [
            'proveedor',
            'fecha_emision_oc',
            'fecha_entrega_esperada',
            'fecha_entrega_real',
            'estado_oc',
            'monto_total_oc_usd',
            'monto_total_oc_ves',   
            'tasa_cambio_aplicada',
            'direccion_envio',
            'notas',
            'detalles',
            'terminos_pago',
            'metodo_pago',
        ]


class OrdenesCompraTableSerializer(serializers.ModelSerializer):
    proveedor = serializers.CharField(source='proveedor.nombre_proveedor')
    estado_oc = serializers.CharField(source='estado_oc.nombre_estado')
    metodo_pago = serializers.CharField(source='metodo_pago.nombre_metodo')


    class Meta:
        model = OrdenesCompra
        fields = [
            'id',
            'proveedor',
            'fecha_emision_oc',
            'fecha_entrega_esperada',
            'fecha_entrega_real',
            'estado_oc',
            'metodo_pago',
            'monto_total_oc_usd',
        ]


## SERIALIZERS PARA LA RECEPCION DE COMPRA

class LoteRecepcionSerializer(serializers.Serializer):
    """Para recibir datos de lotes en la recepción"""
    id = serializers.IntegerField()
    cantidad = serializers.DecimalField(max_digits=10, decimal_places=2)
    fecha_caducidad = serializers.DateField()


class DetalleRecepcionSerializer(serializers.Serializer):
    detalle_oc_id = serializers.IntegerField()
    lotes = LoteRecepcionSerializer(many=True)
    cantidad_total_recibida = serializers.DecimalField(max_digits=10, decimal_places=2)


class RecepcionCompraSerializer(serializers.Serializer):
    orden_compra_id = serializers.IntegerField()
    detalles = DetalleRecepcionSerializer(many=True)
    recibido_parcialmente = serializers.BooleanField()


# serializers.py additions
class DetallesResponseSerializer(serializers.ModelSerializer):
    # IDs of variants mapped to generic names for frontend compatibility
    materia_prima = serializers.IntegerField(source='variante_materia_prima.id', read_only=True, allow_null=True)
    materia_prima_nombre = serializers.CharField(source='variante_materia_prima.nombre_variante', read_only=True, allow_null=True)
    
    producto_reventa = serializers.IntegerField(source='variante_producto_reventa.id', read_only=True, allow_null=True)
    producto_reventa_nombre = serializers.CharField(source='variante_producto_reventa.nombre_variante', read_only=True, allow_null=True)
    
    # Nested objects
    unidad_medida_compra = UnidadMedidaSerializer(read_only=True)
    empaquetado = EmpaquetadoProductosSerializer(source='unidad_empaquetado', read_only=True)
    
    # Computed fields from model properties
    cantidad_pendiente = serializers.ReadOnlyField()
    modo_compra = serializers.SerializerMethodField()
    
    class Meta:
        model = DetalleOrdenesCompra
        fields = [
            'id',
            'materia_prima',
            'materia_prima_nombre',
            'producto_reventa',
            'producto_reventa_nombre',
            'cantidad_solicitada',
            'modo_compra',
            'empaquetado',
            'unidad_medida_compra',
            'cantidad_recibida',
            'cantidad_pendiente',
            'costo_unitario_usd',
            'costo_unitario_ves',
            'subtotal_linea_usd',
            'subtotal_linea_ves'
        ]

    def get_modo_compra(self, obj):
        if obj.unidad_empaquetado:
            return 'contenedor'
        return 'unidad'


class RecepcionCompraSerializer(serializers.Serializer):
    orden_compra_id = serializers.IntegerField()
    fecha_recepcion = serializers.DateField()  # Add this field
    detalles = DetalleRecepcionSerializer(many=True)
    recibido_parcialmente = serializers.BooleanField()
    monto_total_recibido_usd = serializers.DecimalField(max_digits=15, decimal_places=3)
    monto_total_recibido_ves = serializers.DecimalField(max_digits=15, decimal_places=3)

    def validate(self, data):
        """Validate that received quantities don't exceed pending quantities"""
        try:
            orden_compra = OrdenesCompra.objects.get(id=data['orden_compra_id'])
        except OrdenesCompra.DoesNotExist:
            raise serializers.ValidationError("Orden de compra no encontrada")

        # Get all detalles at once to avoid N+1 queries
        detalles_oc_ids = [d['detalle_oc_id'] for d in data['detalles']]
        detalles_oc = DetalleOrdenesCompra.objects.filter(
            id__in=detalles_oc_ids
        ).select_related('materia_prima', 'producto_reventa')
        
        detalles_dict = {d.id: d for d in detalles_oc}

        for detalle_data in data['detalles']:
            oc_detalle = detalles_dict.get(detalle_data['detalle_oc_id'])
            if not oc_detalle:
                raise serializers.ValidationError(
                    f"Detalle de OC {detalle_data['detalle_oc_id']} no encontrado"
                )

            cantidad_pendiente = oc_detalle.cantidad_solicitada - oc_detalle.cantidad_recibida
            cantidad_recibida = detalle_data['cantidad_total_recibida']
            
            if cantidad_recibida > cantidad_pendiente:
                producto_nombre = (
                    oc_detalle.materia_prima.nombre if oc_detalle.materia_prima 
                    else oc_detalle.producto_reventa.nombre_producto
                )
                raise serializers.ValidationError(
                    f"La cantidad recibida de '{producto_nombre}' ({cantidad_recibida}) "
                    f"excede la cantidad pendiente ({cantidad_pendiente})"
                )

            # Validate that lotes sum equals cantidad_total_recibida
            suma_lotes = sum(lote['cantidad'] for lote in detalle_data['lotes'])
            if suma_lotes != cantidad_recibida:
                raise serializers.ValidationError(
                    f"La suma de lotes ({suma_lotes}) no coincide con "
                    f"la cantidad total recibida ({cantidad_recibida})"
                )

        return data


class PagosProveedoresSerializer(serializers.Serializer):
    """
    Serializer for registering payments to providers.
    Supports partial payments and tracks remaining balances.
    """
    compra_asociada = serializers.IntegerField(
        help_text="ID de la compra a la que se aplica el pago",
        required=False
    )
    orden_compra_asociada = serializers.IntegerField(
        help_text="ID de la orden de compra a la que se aplica el pago",
        required=False
    )
    metodo_pago = serializers.IntegerField(
        help_text="ID del método de pago utilizado"
    )
    monto_pago_usd = serializers.DecimalField(
        max_digits=10,
        decimal_places=3,
        help_text="Monto del pago en USD"
    )
    monto_pago_ves = serializers.DecimalField(
        max_digits=10,
        decimal_places=3,
        help_text="Monto del pago en VES"
    )
    tasa_cambio_aplicada = serializers.DecimalField(
        max_digits=10,
        decimal_places=3,
        help_text="Tasa de cambio USD/VES aplicada"
    )
    fecha_pago = serializers.DateField(
        help_text="Fecha en que se realizó el pago"
    )
    referencia_pago = serializers.CharField(
        max_length=10,
        help_text="Número de referencia bancaria",
        required=False,
        allow_blank=True,
    )
    notas = serializers.CharField(
        max_length=255,
        required=False,
        allow_blank=True,
        help_text="Observaciones adicionales sobre el pago"
    )

    def validate_monto_pago_usd(self, value):
        """Ensure payment amount is positive"""
        if value <= 0:
            raise serializers.ValidationError("El monto del pago debe ser mayor a cero")
        return value

    def validate(self, data):
        """Cross-field validation"""
        # Validate currency conversion
        expected_ves = data['monto_pago_usd'] * data['tasa_cambio_aplicada']
        tolerance = 0.01  # Allow 1 cent tolerance for rounding
        
        if abs(expected_ves - data['monto_pago_ves']) > tolerance:
            raise serializers.ValidationError(
                f"El monto en VES no coincide con la conversión. "
                f"Esperado: {expected_ves:.2f}, Recibido: {data['monto_pago_ves']}"
            )
        
        return data


class FormattedResponseOCSerializer(serializers.ModelSerializer):
    proveedor = ProveedoresSerializer()
    estado_oc = EstadosOrdenCompraSerializer()
    metodo_pago = MetodosDePagoSerializer()
    detalles = DetallesResponseSerializer(many=True)
    recepciones = ComprasSerializer(many=True, read_only=True)
    pagos_en_adelantado = serializers.SerializerMethodField(read_only=True)
    monto_pendiente_pago_usd = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = OrdenesCompra
        fields = [
            'id',
            'proveedor',
            'fecha_emision_oc',
            'fecha_entrega_esperada',
            'fecha_entrega_real',
            'estado_oc',
            'monto_total_oc_usd',
            'monto_total_oc_ves',
            'tasa_cambio_aplicada',
            'direccion_envio',
            'notas',
            'detalles',
            'terminos_pago',
            'metodo_pago',
            'recepciones',
            'pagos_en_adelantado',
            'monto_pendiente_pago_usd',
        ]
    
    def get_pagos_en_adelantado(self, obj):
        pagos = PagosProveedores.objects.filter(orden_compra_asociada=obj, compra_asociada__isnull=True)
        if not pagos.exists():
            return None

        return {
            "monto_pago_usd": pagos.aggregate(total=Sum('monto_pago_usd'))['total'] or 0, 
            "monto_pago_ves": pagos.aggregate(total=Sum('monto_pago_ves'))['total'] or 0,
        }

    def get_monto_pendiente_pago_usd(self, obj):
        pagos_adelantados_sin_registrar = PagosProveedores.objects.filter(orden_compra_asociada=obj, compra_asociada__isnull=True).aggregate(total=Sum('monto_pago_usd'))['total'] or 0

        compras_pagadas = Compras.objects.filter(orden_compra=obj, pagado=True)
        pagos_completos = PagosProveedores.objects.filter(orden_compra_asociada=obj, compra_asociada__in=compras_pagadas).aggregate(total=Sum('monto_pago_usd'))['total'] or 0

        compras_no_pagadas = Compras.objects.filter(orden_compra=obj, pagado=False)
        pago_adelantado_registrado = PagosProveedores.objects.filter(orden_compra_asociada=obj, compra_asociada__in=compras_no_pagadas).aggregate(total=Sum('monto_pago_usd'))['total'] or 0

        if not pagos_completos and not pagos_adelantados_sin_registrar and not pago_adelantado_registrado:
            return None

        return obj.monto_total_oc_usd - pagos_completos - pago_adelantado_registrado - pagos_adelantados_sin_registrar