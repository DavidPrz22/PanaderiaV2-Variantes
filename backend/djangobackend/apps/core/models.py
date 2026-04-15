from django.db import models
from django.core.exceptions import ValidationError
from decimal import Decimal

# Create your models here.

# Unidades de Medida Registradas (Referencia):
# ID | Nombre Completo | Abreviatura | Tipo
# -------------------------------------------
# 1  | Kilogramo       | kg          | peso
# 2  | Gramo           | g           | peso
# 3  | Litro           | L           | volumen
# 4  | Miligramo       | mg          | peso
# 5  | Mililitro       | ml          | volumen
# 6  | Unidad          | ud          | unidad

class UnidadesDeMedida(models.Model):
    nombre_completo = models.CharField(max_length=50, null=False, blank=False, unique=True)
    abreviatura = models.CharField(max_length=10, null=False, blank=False)
    descripcion = models.TextField(max_length=255, null=True, blank=True)
    tipo_medida = models.CharField(max_length=10, choices=[('peso', 'Peso'), ('volumen', 'Volumen'), ('unidad', 'Unidad'), ('longitud', 'Longitud'), ('otro', 'Otro')])

    def __str__(self):
        return self.nombre_completo
    
    @classmethod
    def convertir_cantidad(cls, cantidad, unidad_origen_id, unidad_destino_id):
        """
        Convert quantity from one unit to another.
        Returns the converted quantity in the destination unit.
        If units are the same, returns the original quantity.
        """
        if unidad_origen_id == unidad_destino_id:
            return Decimal(str(cantidad))
        
        try:
            conversion = ConversionesUnidades.objects.get(
                unidad_origen_id=unidad_origen_id,
                unidad_destino_id=unidad_destino_id
            )
            return Decimal(str(cantidad)) * conversion.factor_conversion
        except ConversionesUnidades.DoesNotExist:
            raise ValidationError(
                f"No existe una conversión definida entre las unidades {unidad_origen_id} y {unidad_destino_id}"
            )
    
    @classmethod
    def obtener_unidades_compatibles(cls, unidad_id):
        """
        Get all units compatible for conversion with the given unit.
        Returns units with the same tipo_medida.
        """
        unidad = cls.objects.get(id=unidad_id)
        return cls.objects.filter(tipo_medida=unidad.tipo_medida)


class CategoriasMateriaPrima(models.Model):
    nombre_categoria = models.CharField(max_length=100, null=False, blank=False)
    descripcion = models.TextField(max_length=255, null=True, blank=True)

    def __str__(self):
        return self.nombre_categoria


class CategoriasProductosElaborados(models.Model):
    nombre_categoria = models.CharField(max_length=100, null=False, blank=False)
    descripcion = models.TextField(max_length=255, null=True, blank=True)
    es_intermediario = models.BooleanField(default=False)

    def __str__(self):
        return self.nombre_categoria


class CategoriasProductosReventa(models.Model):
    nombre_categoria = models.CharField(max_length=100, null=False, blank=False)
    descripcion = models.TextField(max_length=255, null=True, blank=True)

    def __str__(self):
        return self.nombre_categoria


class TiposMetodosDePago(models.TextChoices):
    EFECTIVO = 'efectivo', 'Efectivo'
    TARJETA = 'tarjeta', 'Tarjeta'
    TRANSFERENCIA = 'transferencia', 'Transferencia'
    PAGO_MOVIL = 'pago_movil', 'Pago Móvil'


class MetodosDePago(models.Model):
    nombre_metodo = models.CharField(max_length=100, null=False, blank=False)
    requiere_referencia = models.BooleanField(default=False)

    def __str__(self):
        return self.nombre_metodo


class TiposOrdenVenta(models.TextChoices):
    PENDIENTE = 'Pendiente', 'Pendiente'
    EN_PROCESO = 'En Proceso', 'En Proceso'
    ENVIADA = 'Enviada', 'Enviada'
    CANCELADA = 'Cancelada', 'Cancelada'


class EstadosOrdenVenta(models.Model):
    nombre_estado = models.CharField(max_length=100, null=False, blank=False)
    descripcion = models.TextField(max_length=255, null=True, blank=True)

    def __str__(self):
        return self.nombre_estado


class EstadosOrdenCompra(models.Model): # Ej: "Borrador", "Emitida", "Recibida Parcialmente", "Recibida Completa", "Cancelada"
    nombre_estado = models.CharField(max_length=100, null=False, blank=False)
    descripcion = models.TextField(max_length=255, null=True, blank=True)

    def __str__(self):
        return self.nombre_estado


class ConversionesUnidades(models.Model):
    """
    Store conversion factors between units of measure.
    Example: 1 kg = 1000 g (factor_conversion = 1000)
    """
    unidad_origen = models.ForeignKey(
        UnidadesDeMedida, 
        on_delete=models.CASCADE, 
        related_name='conversiones_origen',
        help_text="Unidad desde la cual se convierte"
    )
    unidad_destino = models.ForeignKey(
        UnidadesDeMedida, 
        on_delete=models.CASCADE, 
        related_name='conversiones_destino',
        help_text="Unidad a la cual se convierte"
    )
    factor_conversion = models.DecimalField(
        max_digits=15, 
        decimal_places=6,
        help_text="Factor de conversión: 1 unidad_origen = X unidad_destino"
    )
    
    class Meta:
        unique_together = ('unidad_origen', 'unidad_destino')
        verbose_name = "Conversión de Unidad"
        verbose_name_plural = "Conversiones de Unidades"
    
    def clean(self):
        """Validate that both units have the same tipo_medida"""
        if self.unidad_origen.tipo_medida != self.unidad_destino.tipo_medida:
            raise ValidationError(
                f"No se puede crear una conversión entre unidades de diferentes tipos: "
                f"{self.unidad_origen.tipo_medida} y {self.unidad_destino.tipo_medida}"
            )
        
        if self.factor_conversion <= 0:
            raise ValidationError("El factor de conversión debe ser mayor a cero")
    
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"1 {self.unidad_origen.abreviatura} = {self.factor_conversion} {self.unidad_destino.abreviatura}"


class Empaques(models.Model):
    nombre_empaque = models.CharField(max_length=100, null=False, blank=False)
    es_contenedor = models.BooleanField(default=False)

    def __str__(self):
        return self.nombre_empaque


class EmpaquetadoProductos(models.Model):
    empaque = models.ForeignKey(Empaques, on_delete=models.CASCADE, null=False, blank=False)
    cantidad_por_contenedor = models.DecimalField(max_digits=10, decimal_places=2, default=1)
    unidad_medida = models.ForeignKey(UnidadesDeMedida, on_delete=models.CASCADE, null=False, blank=False)
    cantidad_unidad_medida = models.DecimalField(max_digits=10, decimal_places=2, default=1)

    def __str__(self):
        return f"{self.empaque.nombre_empaque} - {self.cantidad_unidad_medida} {self.unidad_medida.abreviatura}"

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=models.Q(cantidad_por_contenedor__gt=0),
                name='check_cantidad_por_contenedor_gt_0'
            ),
            models.CheckConstraint(
                check=models.Q(cantidad_unidad_medida__gt=0),
                name='check_cantidad_unidad_medida_gt_0'
            ),
        ]

class AtributosProductos(models.TextChoices):
    CANTIDAD = 'Cantidad', 'Cantidad'
    TAMAÑO = 'Tamaño', 'Tamaño'
    SABOR = 'Sabor', 'Sabor'
    COLOR = 'Color', 'Color'


class Grupos(models.Model):
    nombre_grupo = models.CharField(max_length=100, null=False, blank=False)
    descripcion = models.TextField(max_length=255, null=True, blank=True)
    cantidad = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    unidad = models.ForeignKey(UnidadesDeMedida, on_delete=models.CASCADE, null=False, blank=False)


class TiposPrioridades(models.TextChoices):
    BAJO = 'Bajo', 'Bajo'
    MEDIO = 'Medio', 'Medio'
    ALTO = 'Alto', 'Alto'
    CRITICO = 'Crítico', 'Crítico'


class TiposNotificaciones(models.TextChoices):
    BAJO_STOCK = 'Bajo stock', 'Bajo stock'
    SIN_STOCK = 'Sin stock', 'Sin stock'
    EXPIRACION = 'Expiración', 'Expiración'
    ENTREGA_CERCANA = 'Entrega cercana', 'Entrega cercana'


class TiposProductosNotificaciones(models.TextChoices):
    MATERIA_PRIMA = 'Materia prima', 'Materia prima'
    PRODUCTOS_FINALES = 'Productos finales', 'Productos finales'
    PRODUCTOS_INTERMEDIOS = 'Productos intermedios', 'Productos intermedios'
    PRODUCTOS_REVENTA = 'Productos de reventa', 'Productos de reventa'
    ORDENES_VENTA = 'Ordenes de venta', 'Ordenes de venta'


class Notificaciones(models.Model):
    tipo_notificacion = models.CharField(max_length=50, choices=TiposNotificaciones.choices, null=False, blank=False)
    tipo_producto = models.CharField(max_length=50, choices=TiposProductosNotificaciones.choices, null=False, blank=False)
    producto_id = models.IntegerField(null=True, blank=True)
    variante_id = models.IntegerField(null=True, blank=True)
    descripcion = models.TextField(max_length=255, null=True, blank=True)
    fecha_notificacion = models.DateTimeField(auto_now_add=True)
    leida = models.BooleanField(default=False)
    prioridad = models.CharField(max_length=50, choices=TiposPrioridades.choices, null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['tipo_notificacion', 'tipo_producto', 'producto_id', 'prioridad'],
                condition=models.Q(leida=False),
                name='unique_unread_notification'
            )
        ]