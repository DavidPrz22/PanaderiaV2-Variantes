from django.db import models
from apps.users.models import User
from apps.core.models import EstadosOrdenCompra, MetodosDePago
from apps.core.models import UnidadesDeMedida, EmpaquetadoProductos
from django.db.models import Q

# Create your models here.
class Proveedores(models.Model):
    nombre_proveedor = models.CharField(max_length=100, null=False, blank=False)
    apellido_proveedor = models.CharField(max_length=100, null=True, blank=True)
    nombre_comercial = models.CharField(max_length=100, null=True, blank=True)
    email_contacto = models.EmailField(max_length=100, null=True, blank=True)
    telefono_contacto = models.CharField(max_length=100, null=True, blank=True)
    fecha_creacion_registro = models.DateField(auto_now_add=True)
    usuario_registro = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True) # cambiar a false
    notas = models.TextField(max_length=255, null=True, blank=True)

    def __str__(self):
        return self.nombre_proveedor


class OrdenesCompra(models.Model):
    proveedor = models.ForeignKey(Proveedores, on_delete=models.CASCADE, null=False, blank=False)
    usuario_creador = models.ForeignKey(User, on_delete=models.CASCADE, null=False, blank=False)
    fecha_emision_oc = models.DateField(null=False, blank=False)
    fecha_entrega_esperada = models.DateField(null=False, blank=False)
    fecha_entrega_real = models.DateField(null=True, blank=True)
    estado_oc = models.ForeignKey(EstadosOrdenCompra, on_delete=models.CASCADE, null=False, blank=False)
    monto_total_oc_usd = models.DecimalField(max_digits=15, decimal_places=3, default=0)
    monto_total_oc_ves = models.DecimalField(max_digits=15, decimal_places=3, default=0)
    metodo_pago = models.ForeignKey(MetodosDePago, on_delete=models.CASCADE, null=False, blank=False)
    tasa_cambio_aplicada = models.DecimalField(max_digits=15, decimal_places=3, default=0)
    direccion_envio = models.TextField(max_length=255, null=True, blank=True)
    fecha_envio_oc = models.DateField(null=True, blank=True)
    email_enviado = models.BooleanField(default=False)
    fecha_email_enviado = models.DateTimeField(null=True, blank=True)
    terminos_pago = models.CharField(max_length=100, null=True, blank=True)
    notas = models.TextField(max_length=255, null=True, blank=True)


    def __str__(self):
        return f"OC {self.id} - {self.proveedor.nombre_proveedor}"


class DetalleOrdenesCompra(models.Model):
    orden_compra = models.ForeignKey(OrdenesCompra, on_delete=models.CASCADE, null=False, blank=False, related_name='detalles')
    variante_materia_prima = models.ForeignKey('inventario.MateriasPrimasVariantes', on_delete=models.CASCADE, null=True)
    variante_producto_reventa = models.ForeignKey('inventario.ProductosReventaVariantes', on_delete=models.CASCADE, null=True)
    cantidad_solicitada = models.DecimalField(max_digits=15, decimal_places=3, default=0)
    cantidad_recibida = models.DecimalField(max_digits=15, decimal_places=3, default=0)
    unidad_medida_compra = models.ForeignKey(UnidadesDeMedida, on_delete=models.CASCADE, null=False, blank=False)
    unidad_empaquetado = models.ForeignKey(EmpaquetadoProductos, on_delete=models.CASCADE, null=True)
    costo_unitario_usd = models.DecimalField(max_digits=15, decimal_places=3, default=0)
    costo_unitario_ves = models.DecimalField(max_digits=15, decimal_places=3, default=0)
    subtotal_linea_usd = models.DecimalField(max_digits=15, decimal_places=3, default=0)
    subtotal_linea_ves = models.DecimalField(max_digits=15, decimal_places=3, default=0)
    
    @property
    def cantidad_pendiente(self):
        """Returns remaining quantity to be received"""
        return self.cantidad_solicitada - self.cantidad_recibida

    def __str__(self):
        if self.variante_materia_prima:
            return f"Detalle OC {self.id} - {self.variante_materia_prima.nombre_variante}"
        return f"Detalle OC {self.id} - {self.variante_producto_reventa.nombre_variante}"

    
    class Meta:
        constraints = [
            models.CheckConstraint(
                check=(Q(variante_materia_prima__isnull=False) & Q(variante_producto_reventa__isnull=True)) | (Q(variante_materia_prima__isnull=True) & Q(variante_producto_reventa__isnull=False)),
                name='detalle_orden_compra_un_solo_tipo_de_producto'
            )
        ]


class Compras(models.Model):
    """
    Representa la recepción física de mercancía de una Orden de Compra.
    Una OC puede tener múltiples recepciones (compras) en caso de entregas parciales.
    """
    orden_compra = models.ForeignKey(
        OrdenesCompra, 
        on_delete=models.CASCADE, 
        related_name='recepciones',
        help_text="Orden de compra asociada a esta recepción"
    )

    proveedor = models.ForeignKey(
        Proveedores, 
        on_delete=models.CASCADE,
        help_text="Proveedor que realizó la entrega"
    )

    usuario_recepcionador = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        help_text="Usuario que registró la recepción de mercancía"
    )

    # Control de pagos
    pagado = models.BooleanField(
        default=False,
        help_text="Indica si esta recepción ha sido pagada completamente"
    )

    monto_pendiente_pago_usd = models.DecimalField(
        max_digits=15, 
        decimal_places=3, 
        default=0,
        help_text="Monto pendiente de pago en USD"
    )

    # Información de la recepción
    fecha_recepcion = models.DateField(
        null=False, 
        blank=False,
        help_text="Fecha en que se recibió la mercancía"
    )

    numero_factura_proveedor = models.CharField(
        max_length=100, 
        null=True, 
        blank=True,
        help_text="Número de factura del proveedor para esta entrega"
    )

    numero_remision = models.CharField(
        max_length=100, 
        null=True, 
        blank=True,
        help_text="Número de guía de remisión o nota de entrega"
    )

    # Montos de esta recepción específica
    monto_recepcion_usd = models.DecimalField(
        max_digits=15, 
        decimal_places=3, 
        default=0,
        help_text="Monto total de esta recepción en USD"
    )

    monto_recepcion_ves = models.DecimalField(
        max_digits=15, 
        decimal_places=3, 
        default=0,
        help_text="Monto total de esta recepción en VES"
    )

    tasa_cambio_aplicada = models.DecimalField(
        max_digits=15, 
        decimal_places=3, 
        default=0,
        help_text="Tasa de cambio USD/VES al momento de la recepción"
    )

    # Metadatos
    notas = models.TextField(
        max_length=255, 
        null=True, 
        blank=True,
        help_text="Observaciones sobre la recepción"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Compra/Recepción"
        verbose_name_plural = "Compras/Recepciones"
        ordering = ['-fecha_recepcion', '-created_at']

    def __str__(self):
        return f"Compra #{self.id} - OC #{self.orden_compra.id} - {self.proveedor.nombre_proveedor}"

    def save(self, *args, **kwargs):
        # Inicializar monto_pendiente con el total si es nueva
        if not self.pk:
            self.monto_pendiente_pago_usd = self.monto_recepcion_usd
        super().save(*args, **kwargs)


class DetalleCompras(models.Model):
    """
    Detalle de cada item recibido en una compra/recepción.
    Se crea un registro por cada línea de producto recibido.
    """
    compra = models.ForeignKey(
        Compras, 
        on_delete=models.CASCADE, 
        related_name='detalles',
        help_text="Compra/recepción a la que pertenece este detalle"
    )
    
    detalle_oc = models.ForeignKey(
        DetalleOrdenesCompra, 
        on_delete=models.CASCADE,
        help_text="Línea de la OC correspondiente a este producto"
    )
    
    # Tipo de producto (solo uno debe tener valor)
    variante_materia_prima = models.ForeignKey(
        'inventario.MateriasPrimasVariantes', 
        on_delete=models.CASCADE, 
        null=True,
        blank=True,
        help_text="Materia prima recibida"
    )
    
    variante_producto_reventa = models.ForeignKey(
        'inventario.ProductosReventaVariantes', 
        on_delete=models.CASCADE, 
        null=True,
        blank=True,
        help_text="Producto de reventa recibido"
    )
    
    # Cantidades
    cantidad_recibida = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        help_text="Cantidad recibida en esta entrega"
    )
    
    unidad_medida = models.ForeignKey(
        UnidadesDeMedida, 
        on_delete=models.CASCADE,
        help_text="Unidad de medida de la cantidad recibida"
    )
    
    # Costos
    costo_unitario_usd = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        help_text="Costo unitario en USD"
    )
    
    subtotal_usd = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        help_text="Subtotal de esta línea (cantidad * costo_unitario)"
    )
    
    notas = models.TextField(
        max_length=255, 
        null=True, 
        blank=True,
        help_text="Observaciones sobre este producto recibido"
    )
    
    class Meta:
        verbose_name = "Detalle de Compra"
        verbose_name_plural = "Detalles de Compra"
        constraints = [
            models.CheckConstraint(
                check=(
                    Q(variante_materia_prima__isnull=False, variante_producto_reventa__isnull=True) | 
                    Q(variante_materia_prima__isnull=True, variante_producto_reventa__isnull=False)
                ),
                name='detalle_compra_un_solo_tipo_de_producto'
            )
        ]
    
    def __str__(self):
        producto = self.variante_materia_prima or self.variante_producto_reventa
        return f"Detalle Compra #{self.compra.id} - {producto}"
    
    def save(self, *args, **kwargs):
        # Calcular subtotal automáticamente
        self.subtotal_usd = self.cantidad_recibida * self.costo_unitario_usd
        super().save(*args, **kwargs)


class PagosProveedores(models.Model):
    """
    Registra pagos realizados a proveedores por compras de mercancía.
    Permite manejar pagos totales, parciales y pagos a cuenta.
    """
    compra_asociada = models.ForeignKey(
        Compras, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='pagos',
        help_text="Compra/recepción específica a la que se aplica este pago"
    )
    
    orden_compra_asociada = models.ForeignKey(
        OrdenesCompra, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='pagos',
        help_text="Orden de compra a la que se aplica este pago"
    )
    
    proveedor = models.ForeignKey(
        Proveedores, 
        on_delete=models.CASCADE,
        help_text="Proveedor al que se realiza el pago"
    )
    
    # Información del pago
    fecha_pago = models.DateField(
        null=False, 
        blank=False,
        help_text="Fecha en que se realizó el pago"
    )
    
    metodo_pago = models.ForeignKey(
        MetodosDePago, 
        on_delete=models.CASCADE,
        help_text="Método utilizado para el pago"
    )
    
    # Montos
    monto_pago_usd = models.DecimalField(
        max_digits=10, 
        decimal_places=3,
        help_text="Monto pagado en USD"
    )
    
    monto_pago_ves = models.DecimalField(
        max_digits=10, 
        decimal_places=3,
        help_text="Monto pagado en VES"
    )
    
    tasa_cambio_aplicada = models.DecimalField(
        max_digits=10, 
        decimal_places=3,
        help_text="Tasa de cambio USD/VES al momento del pago"
    )
    
    # Referencias
    referencia_pago = models.CharField(
        max_length=100, 
        null=True, 
        blank=True,
        help_text="Número de referencia de transferencia/transacción"
    )
    
    numero_comprobante = models.CharField(
        max_length=100, 
        null=True, 
        blank=True,
        help_text="Número de comprobante de pago"
    )
    
    # Control
    usuario_registrador = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        help_text="Usuario que registró el pago"
    )
    
    notas = models.TextField(
        max_length=255, 
        null=True, 
        blank=True,
        help_text="Observaciones sobre el pago"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Pago a Proveedor"
        verbose_name_plural = "Pagos a Proveedores"
        ordering = ['-fecha_pago', '-created_at']
    
    def __str__(self):
        return f"Pago #{self.id} - {self.proveedor.nombre_proveedor} - ${self.monto_pago_usd}"