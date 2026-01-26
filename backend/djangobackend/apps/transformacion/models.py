from django.db import models
from apps.users.models import User
from django.db.models import Q
from apps.inventario.models import LotesProductosElaborados

# Create your models here.
class Transformacion(models.Model):
    id = models.AutoField(primary_key=True)
    nombre_transformacion = models.CharField(max_length=255, null=False, blank=False)
    cantidad_origen = models.DecimalField(max_digits=10, decimal_places=3, null=False, blank=False)
    cantidad_destino = models.DecimalField(max_digits=10, decimal_places=3, null=False, blank=False)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    activo = models.BooleanField(default=True)

    def __str__(self):
        return f"Transformación {self.id}: {self.nombre_transformacion}"

class EjecutarTransformacion(models.Model):
    transformacion = models.ForeignKey(Transformacion, on_delete=models.CASCADE, related_name='ejecuciones')
    producto_origen = models.ForeignKey('inventario.ProductosElaboradosVariante', on_delete=models.CASCADE, related_name='ejecutar_transformacion_producto_origen')
    producto_destino = models.ForeignKey('inventario.ProductosElaboradosVariante', on_delete=models.CASCADE, related_name='ejecutar_transformacion_producto_destino')
    fecha_ejecucion = models.DateTimeField(auto_now_add=True)

# Create your models here.
class LotesConsumidosTransformacion(models.Model):
    transformacion = models.ForeignKey(Transformacion, on_delete=models.CASCADE, related_name="lotes_consumidos")
    # Using consistent names makes life easier
    lote_producto_elaborado_consumido = models.ForeignKey(LotesProductosElaborados, on_delete=models.PROTECT, null=False, blank=False, related_name="lotes_consumidos_transformacion")
    lote_producto_elaborado_creado = models.ForeignKey(LotesProductosElaborados, on_delete=models.PROTECT, null=False, blank=False, related_name="lotes_creados_transformacion")
    cantidad_consumida = models.DecimalField(max_digits=10, decimal_places=3)
    cantidad_creada = models.DecimalField(max_digits=10, decimal_places=3)
    
    def __str__(self):
        return f"Transformación #{self.transformacion.nombre_transformacion} - Lote #{self.lote_producto_elaborado.id}"