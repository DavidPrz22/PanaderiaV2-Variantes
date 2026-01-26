from django.db import models
from django.db.models import Q
from django.core.exceptions import ValidationError
from apps.users.models import User
from apps.inventario.models import UnidadesDeMedida, ProductosElaborados, ProductosReventa, LotesProductosElaborados, LotesProductosReventa, ProductosElaboradosVariantes, ProductosReventaVariantes
from apps.core.models import MetodosDePago, EstadosOrdenVenta


# Create your models here.
class Clientes(models.Model):
    nombre_cliente = models.CharField(max_length=100, null=False, blank=False)
    apellido_cliente = models.CharField(max_length=100, null=False, blank=False)
    telefono = models.CharField(max_length=100, null=True, blank=False)
    email = models.CharField(max_length=100, null=True, blank=True)
    rif_cedula = models.CharField(max_length=100, null=True, blank=True)
    fecha_registro = models.DateField(auto_now_add=True)
    notas = models.TextField(max_length=255, null=True, blank=True)
    
    def __str__(self):
        return self.nombre_cliente


class AperturaCierreCaja(models.Model):
    """
    Tracks POS (Point of Sale) opening and closing sessions.
    Only users with proper authorization (managers) can open/close the register.
    """
    # Who opened the register
    usuario_apertura = models.ForeignKey(User, on_delete=models.PROTECT, related_name='aperturas_realizadas')
    
    # Cash amount registered at opening
    monto_inicial_usd = models.DecimalField(max_digits=10, decimal_places=2)
    monto_inicial_ves = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Timing
    fecha_apertura = models.DateTimeField(auto_now_add=True)
    fecha_cierre = models.DateTimeField(null=True, blank=True)
    
    # Who closed the register (can be different from who opened it)
    usuario_cierre = models.ForeignKey(User, on_delete=models.PROTECT, null=True, blank=True, related_name='cierres_realizados')
    
    # Final amounts at closing
    monto_final_usd = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    monto_final_ves = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # === CALCULATED TOTALS BY PAYMENT METHOD (from sales during this session) ===
    # These are automatically calculated from Pagos records
    
    # 1. Cash (Affects physical drawer balance)
    total_efectivo_usd = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, default=0)
    total_efectivo_ves = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, default=0)
    
    # 2. Non-Cash (Goes directly to bank)
    total_tarjeta_usd = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, default=0)
    total_tarjeta_ves = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, default=0)
    
    total_transferencia_usd = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, default=0)
    total_transferencia_ves = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, default=0)
    
    total_pago_movil_usd = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, default=0)
    total_pago_movil_ves = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, default=0)
    
    # 3. Change Given
    # We separate cash vs Pago Móvil for better auditing.
    total_cambio_efectivo_usd = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, default=0)
    total_cambio_efectivo_ves = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, default=0)
    total_cambio_pago_movil_usd = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, default=0)
    total_cambio_pago_movil_ves = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, default=0)

    # Legacy aggregated change (all methods combined)
    total_cambio_usd = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, default=0)
    total_cambio_ves = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, default=0)
    
    # === TOTAL REVENUE (All methods combined) ===
    # Used for reporting total sales performance
    total_ventas_usd = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, default=0)
    total_ventas_ves = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, default=0)
    
    # === RECONCILIATION ===
    diferencia_usd = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, default=0)
    diferencia_ves = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, default=0)
    
    # Notes
    notas_apertura = models.TextField(blank=True, null=True)
    notas_cierre = models.TextField(blank=True, null=True)
    
    # State tracking
    esta_activa = models.BooleanField(default=True)

    def __str__(self):
        return f"Apertura Cierre Caja {self.id}"

    @property
    def efectivo_en_caja_usd(self):
        """Initial Cash + All Cash Payments - Cash Change Given"""
        from decimal import Decimal
        return (self.monto_inicial_usd or Decimal('0')) + \
               (self.total_efectivo_usd or Decimal('0')) - \
               (self.total_cambio_efectivo_usd or Decimal('0'))

    @classmethod
    def obtener_caja_activa(cls):
        """Get the currently active POS session"""
        return cls.objects.filter(esta_activa=True).first()

    def calcular_totales_por_metodo_pago(self):
        """
        Calculate payment totals by payment method from all sales during this session.
        This should be called before closing the register.
        """
        from django.db.models import Sum
        from decimal import Decimal
        
        # Get all payments from sales in this session
        pagos = Pagos.objects.filter(venta_asociada__apertura_caja=self)
        
        # Initialize totals dictionary
        totales = {
            'efectivo_usd': Decimal('0'), 'efectivo_ves': Decimal('0'),
            'tarjeta_usd': Decimal('0'), 'tarjeta_ves': Decimal('0'),
            'transferencia_usd': Decimal('0'), 'transferencia_ves': Decimal('0'),
            'pago_movil_usd': Decimal('0'), 'pago_movil_ves': Decimal('0'),
            # Change breakdown by method
            'cambio_efectivo_usd': Decimal('0'), 'cambio_efectivo_ves': Decimal('0'),
            'cambio_pago_movil_usd': Decimal('0'), 'cambio_pago_movil_ves': Decimal('0'),
            # Aggregated change (all methods)
            'cambio_usd': Decimal('0'), 'cambio_ves': Decimal('0'),
            'total_ventas_usd': Decimal('0'), 'total_ventas_ves': Decimal('0')
        }
        
        # Calculate totals per method
        metodos_map = {
            'efectivo': ('efectivo_usd', 'efectivo_ves'),
            'tarjeta': ('tarjeta_usd', 'tarjeta_ves'),
            'transferencia': ('transferencia_usd', 'transferencia_ves'),
            'pago_movil': ('pago_movil_usd', 'pago_movil_ves'),
        }
        
        for metodo_nombre, (key_usd, key_ves) in metodos_map.items():
            result = pagos.filter(metodo_pago__nombre_metodo__iexact=metodo_nombre).aggregate(
                total_usd=Sum('monto_pago_usd'),
                total_ves=Sum('monto_pago_ves')
            )
            totales[key_usd] = result['total_usd'] or Decimal('0')
            totales[key_ves] = result['total_ves'] or Decimal('0')

        # Calculate Change breakdown
        # Cash change (sum from all payments that might have generated change in cash)
        cambio_efectivo = pagos.aggregate(
            total_cambio_efectivo_usd=Sum('cambio_efectivo_usd'),
            total_cambio_efectivo_ves=Sum('cambio_efectivo_ves'),
        )

        # Pago Móvil change (stored on the payment record)
        cambio_pago_movil = pagos.aggregate(
            total_cambio_pago_movil_usd=Sum('cambio_pago_movil_usd'),
            total_cambio_pago_movil_ves=Sum('cambio_pago_movil_ves'),
        )

        totales['cambio_efectivo_usd'] = cambio_efectivo['total_cambio_efectivo_usd'] or Decimal('0')
        totales['cambio_efectivo_ves'] = cambio_efectivo['total_cambio_efectivo_ves'] or Decimal('0')
        totales['cambio_pago_movil_usd'] = cambio_pago_movil['total_cambio_pago_movil_usd'] or Decimal('0')
        totales['cambio_pago_movil_ves'] = cambio_pago_movil['total_cambio_pago_movil_ves'] or Decimal('0')

        # Aggregate total change (all methods)
        totales['cambio_usd'] = totales['cambio_efectivo_usd'] + totales['cambio_pago_movil_usd']
        totales['cambio_ves'] = totales['cambio_efectivo_ves'] + totales['cambio_pago_movil_ves']
        
        # Calculate Total Sales Revenue (Sum of all payments - change)
        # Note: We subtract change because the payment amount includes the change given back
        # Example: Sale $15. Payment $20. Change $5. Revenue is $15 ($20 - $5).
        
        total_pagos_usd = sum([totales[k] for k in totales if k.endswith('_usd') and 'cambio' not in k and 'total' not in k])
        total_pagos_ves = sum([totales[k] for k in totales if k.endswith('_ves') and 'cambio' not in k and 'total' not in k])
        
        totales['total_ventas_usd'] = total_pagos_usd - totales['cambio_usd']
        totales['total_ventas_ves'] = total_pagos_ves - totales['cambio_ves']

        # Update Model Fields
        self.total_efectivo_usd = totales['efectivo_usd']
        self.total_efectivo_ves = totales['efectivo_ves']
        self.total_tarjeta_usd = totales['tarjeta_usd']
        self.total_tarjeta_ves = totales['tarjeta_ves']
        self.total_transferencia_usd = totales['transferencia_usd']
        self.total_transferencia_ves = totales['transferencia_ves']
        self.total_pago_movil_usd = totales['pago_movil_usd']
        self.total_pago_movil_ves = totales['pago_movil_ves']
        
        # Update detailed change totals
        self.total_cambio_efectivo_usd = totales['cambio_efectivo_usd']
        self.total_cambio_efectivo_ves = totales['cambio_efectivo_ves']
        self.total_cambio_pago_movil_usd = totales['cambio_pago_movil_usd']
        self.total_cambio_pago_movil_ves = totales['cambio_pago_movil_ves']
        
        self.total_cambio_usd = totales['cambio_usd']
        self.total_cambio_ves = totales['cambio_ves']
        self.total_ventas_usd = totales['total_ventas_usd']
        self.total_ventas_ves = totales['total_ventas_ves']
        
        return totales

    def calcular_efectivo_esperado(self):
        """
        Calculate expected cash in drawer.
        Formula: Initial + Cash Sales - Change Given
        """
        from decimal import Decimal
        # Only cash change reduces expected cash in drawer. Change delivered via Pago Móvil
        # is tracked separately and does not affect the physical cash balance.
        expected_usd = (self.monto_inicial_usd or Decimal('0')) + (self.total_efectivo_usd or Decimal('0')) - (self.total_cambio_efectivo_usd or Decimal('0'))
        expected_ves = (self.monto_inicial_ves or Decimal('0')) + (self.total_efectivo_ves or Decimal('0')) - (self.total_cambio_efectivo_ves or Decimal('0'))
        return expected_usd, expected_ves

    def calcular_diferencia_efectivo(self):
        """
        Calculate difference between expected and counted cash.
        """
        from decimal import Decimal
        expected_usd, expected_ves = self.calcular_efectivo_esperado()
        
        self.diferencia_usd = (self.monto_final_usd or Decimal('0')) - expected_usd
        self.diferencia_ves = (self.monto_final_ves or Decimal('0')) - expected_ves
        
        return self.diferencia_usd, self.diferencia_ves


    class Meta:
        ordering = ['-fecha_apertura']
        verbose_name = "Apertura/Cierre de Caja"
        verbose_name_plural = "Aperturas/Cierres de Caja"

        constraints = [
            models.UniqueConstraint(
                fields=['esta_activa'],
                condition=models.Q(esta_activa=True),
                name='solo_una_caja_activa'
            )
        ]


class Ventas(models.Model):
    cliente = models.ForeignKey(Clientes, on_delete=models.PROTECT, null=False, blank=False)
    usuario_cajero = models.ForeignKey(User, on_delete=models.PROTECT, null=False, blank=False)
    fecha_venta = models.DateField(null=False, blank=False)
    monto_total_usd = models.DecimalField(max_digits=10, decimal_places=2, null=False, blank=False)
    monto_total_ves = models.DecimalField(max_digits=10, decimal_places=2, null=False, blank=False)
    tasa_cambio_aplicada = models.DecimalField(max_digits=10, decimal_places=2, null=False, blank=False)
    notas = models.TextField(max_length=255, null=True, blank=True)
    apertura_caja = models.ForeignKey('AperturaCierreCaja', on_delete=models.PROTECT, null=True, blank=True)

    def __str__(self):
        return self.cliente.nombre_cliente

    def clean(self):

        if not self.apertura_caja:
            caja_activa = AperturaCierreCaja.objects.filter(esta_activa=True).first()
            if not caja_activa:
                raise ValidationError("No hay una caja activa. Un gerente debe abrir la caja antes de realizar ventas.")
            self.apertura_caja = caja_activa


class DetalleVenta(models.Model):
    """
    Representa una línea individual dentro de una Venta.
    """
    # --- Campos de Relación ---
    venta = models.ForeignKey(Ventas, on_delete=models.CASCADE, related_name='detalles')
    
    # Un detalle debe estar asociado a un producto, pero solo a uno de los dos tipos.
    producto_elaborado = models.ForeignKey(ProductosElaboradosVariantes, on_delete=models.PROTECT, null=True, blank=True)
    producto_reventa = models.ForeignKey(ProductosReventaVariantes, on_delete=models.PROTECT, null=True, blank=True)

    # --- Campos de la Venta ---
    unidad_medida_venta = models.ForeignKey(UnidadesDeMedida, on_delete=models.PROTECT)
    
    cantidad_vendida = models.DecimalField(max_digits=10, decimal_places=2) # Decimal por si vendes fracciones (ej. 1.5 kg)
    
    precio_unitario_usd = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    precio_unitario_ves = models.DecimalField(max_digits=10, decimal_places=2, editable=False, default=0.00)

    subtotal_linea_usd = models.DecimalField(max_digits=10, decimal_places=2, editable=False, default=0.00)
    subtotal_linea_ves = models.DecimalField(max_digits=10, decimal_places=2, editable=False, default=0.00)

    def __str__(self):
        producto_nombre = ""
        if self.producto_elaborado:
            producto_nombre = self.producto_elaborado.nombre_variante
        elif self.producto_reventa:
            producto_nombre = self.producto_reventa.nombre_variante
        return f"Venta #{self.venta.id} - {self.cantidad_vendida} x {producto_nombre}"

    def clean(self):
        super().clean()
        
        # --- Regla: Debe haber un producto, y solo uno. ---
        if self.producto_elaborado and self.producto_reventa:
            raise ValidationError("Un detalle de venta no puede tener un producto elaborado y un producto de reventa al mismo tiempo.")
        
        if not self.producto_elaborado and not self.producto_reventa:
            raise ValidationError("Un detalle de venta debe estar asociado a un producto elaborado o a un producto de reventa.")
            
    def save(self, *args, **kwargs):
        # Calcula el subtotal antes de guardar
        self.subtotal_linea_usd = self.cantidad_vendida * self.precio_unitario_usd
        
        # Llama al método clean() para ejecutar las validaciones antes de intentar guardar en la BD.
        # Esto es una buena práctica para asegurar que los datos son válidos a nivel de aplicación.
        self.clean()
        
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Detalle de Venta"
        verbose_name_plural = "Detalles de Venta"
        
        constraints = [
            # Restricción 1: Asegura que solo uno de los dos campos de producto tiene valor.
            models.CheckConstraint(
                check=(
                    Q(producto_elaborado__isnull=False, producto_reventa__isnull=True) |
                    Q(producto_elaborado__isnull=True, producto_reventa__isnull=False)
                ),
                name='detalle_venta_un_solo_tipo_de_producto'
            ),
        ]


class VentasLotesVendidos(models.Model):
    detalle_venta_asociada = models.ForeignKey(DetalleVenta, on_delete=models.CASCADE, related_name="lotes_vendidos")
    # Using consistent names makes life easier
    lote_producto_elaborado = models.ForeignKey(LotesProductosElaborados, on_delete=models.PROTECT, null=True, blank=True)
    lote_producto_reventa = models.ForeignKey(LotesProductosReventa, on_delete=models.PROTECT, null=True, blank=True)
    cantidad_consumida = models.DecimalField(max_digits=10, decimal_places=3)
    fecha_consumo = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Consumo #{self.id} - {self.detalle_venta_asociada.id}"
    
    class Meta:
        constraints = [
            models.CheckConstraint(
                # FIX: Field names must match the model definitions above
                check=(Q(lote_producto_elaborado__isnull=False) & Q(lote_producto_reventa__isnull=True)) | 
                      (Q(lote_producto_elaborado__isnull=True) & Q(lote_producto_reventa__isnull=False)),
                name='venta_lotes_vendidos_un_solo_tipo'
            )
        ]


class OrdenVenta(models.Model):
    cliente = models.ForeignKey(Clientes, on_delete=models.CASCADE, null=False, blank=False)
    fecha_creacion_orden = models.DateField(null=False, blank=False)
    fecha_entrega_solicitada = models.DateField(null=False, blank=False)
    fecha_entrega_definitiva = models.DateField(null=True, blank=True)
    usuario_creador = models.ForeignKey(User, on_delete=models.CASCADE, null=False, blank=False)
    notas_generales = models.TextField(max_length=255, null=True, blank=True)
    monto_descuento_usd = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True, default=0)
    monto_descuento_ves = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True, default=0)
    monto_impuestos_usd = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True, default=0)
    monto_impuestos_ves = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True, default=0)
    monto_total_usd = models.DecimalField(max_digits=10, decimal_places=3, null=False, blank=False)
    monto_total_ves = models.DecimalField(max_digits=10, decimal_places=3, null=False, blank=False)
    tasa_cambio_aplicada = models.DecimalField(max_digits=10, decimal_places=3, null=False, blank=False)
    estado_orden = models.ForeignKey(EstadosOrdenVenta, on_delete=models.CASCADE, null=False, blank=False)
    metodo_pago = models.ForeignKey(MetodosDePago, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return f"Orden de Venta #{self.id} - {self.cliente.nombre_cliente}"


class DetallesOrdenVenta(models.Model):
    orden_venta_asociada = models.ForeignKey(OrdenVenta, on_delete=models.CASCADE, null=False, blank=False, related_name='productos')
    producto_elaborado = models.ForeignKey(ProductosElaboradosVariantes, on_delete=models.CASCADE, null=True, blank=True)
    producto_reventa = models.ForeignKey(ProductosReventaVariantes, on_delete=models.CASCADE, null=True, blank=True)
    cantidad_solicitada = models.DecimalField(max_digits=10, decimal_places=3, null=False, blank=False)
    unidad_medida = models.ForeignKey(UnidadesDeMedida, on_delete=models.CASCADE, null=False, blank=False)
    precio_unitario_usd = models.DecimalField(max_digits=10, decimal_places=3, null=False, blank=False)
    precio_unitario_ves = models.DecimalField(max_digits=10, decimal_places=3, null=False, blank=False)
    subtotal_linea_usd = models.DecimalField(max_digits=10, decimal_places=3, null=False, blank=False)
    subtotal_linea_ves = models.DecimalField(max_digits=10, decimal_places=3, null=False, blank=False)
    descuento_porcentaje = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)
    impuesto_porcentaje = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)

    def __str__(self):
        return f"Detalle de Orden de Venta #{self.id} - {self.producto_elaborado.nombre if self.producto_elaborado else self.producto_reventa.nombre}"

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=(Q(producto_elaborado__isnull=False) & Q(producto_reventa__isnull=True)) | (Q(producto_elaborado__isnull=True) & Q(producto_reventa__isnull=False)),
                name='detalle_orden_venta_un_solo_tipo_de_producto'
            )
        ]


class OrdenConsumoLote(models.Model):
    orden_venta_asociada = models.ForeignKey(OrdenVenta, on_delete=models.CASCADE, related_name="consumos_lotes_orden_venta")
    detalle_orden_venta = models.ForeignKey(DetallesOrdenVenta, on_delete=models.CASCADE)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Consumo de Lote en Orden de Venta #{self.id}"


class OrdenConsumoLoteDetalle(models.Model):
    orden_consumo_lote = models.ForeignKey(OrdenConsumoLote, on_delete=models.CASCADE, related_name="detalle_lotes")
    lote_producto_elaborado = models.ForeignKey(LotesProductosElaborados, null=True, blank=True, on_delete=models.PROTECT)
    lote_producto_reventa = models.ForeignKey(LotesProductosReventa, null=True, blank=True, on_delete=models.PROTECT)
    cantidad_consumida = models.DecimalField(max_digits=10, decimal_places=3)
    costo_parcial_usd = models.DecimalField(max_digits=10, decimal_places=3, default=0)
    costo_parcial_ves = models.DecimalField(max_digits=10, decimal_places=3, default=0)

    def __str__(self):
        return f"Lote Usado en Orden de Venta #{self.id}"

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=(Q(lote_producto_elaborado__isnull=False) & Q(lote_producto_reventa__isnull=True)) | (Q(lote_producto_elaborado__isnull=True) & Q(lote_producto_reventa__isnull=False)),
                name='detalle_orden_consumo_lote_un_solo_tipo_de_producto'
            )
        ]


class Pagos(models.Model):
    venta_asociada = models.ForeignKey(Ventas, on_delete=models.CASCADE, null=True, blank=True)
    orden_venta_asociada = models.ForeignKey(OrdenVenta, on_delete=models.CASCADE, null=True, blank=True)
    metodo_pago = models.ForeignKey(MetodosDePago, on_delete=models.CASCADE, null=False, blank=False)
    monto_pago_usd = models.DecimalField(max_digits=10, decimal_places=2, null=False, blank=False)
    monto_pago_ves = models.DecimalField(max_digits=10, decimal_places=2, null=False, blank=False)
    fecha_pago = models.DateField(null=False, blank=False)
    referencia_pago = models.CharField(max_length=100, null=True, blank=True)
    cambio_efectivo_usd = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    cambio_efectivo_ves = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    # Optional: change given via Pago Móvil, even when the original payment is in cash.
    cambio_pago_movil_usd = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    cambio_pago_movil_ves = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    usuario_registrador = models.ForeignKey(User, on_delete=models.CASCADE, null=False, blank=False)
    tasa_cambio_aplicada = models.DecimalField(max_digits=10, decimal_places=2, null=False, blank=False)
    notas = models.TextField(max_length=255, null=True, blank=True)
    
    def __str__(self):
        return f"Pago #{self.id} - {self.metodo_pago.nombre}"
    
    class Meta:
        constraints = [
            models.CheckConstraint(
                check=(Q(venta_asociada__isnull=False) & Q(orden_venta_asociada__isnull=True)) | (Q(venta_asociada__isnull=True) & Q(orden_venta_asociada__isnull=False)),
                name='un_solo_tipo_de_venta_por_pago'
            )
        ]

