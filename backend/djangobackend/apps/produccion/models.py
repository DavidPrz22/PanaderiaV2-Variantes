from decimal import Decimal

from django.db import models
from apps.inventario.models import ProductosElaborados, MateriasPrimas, LotesMateriasPrimas, LotesProductosElaborados, ProductosElaboradosVariantes
from apps.core.models import UnidadesDeMedida
from django.db.models import Q
from apps.users.models import User

# Create your models here.

class Recetas(models.Model):
    nombre = models.CharField(max_length=255, null=True, blank=True)
    producto_elaborado_variante = models.OneToOneField(ProductosElaboradosVariantes, on_delete=models.CASCADE, related_name='receta_producto_elaborado_variante', null=True, blank=True, unique=True)
    rendimiento = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True, help_text="Cantidad de producto que genera esta receta")
    fecha_creacion = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    fecha_modificacion = models.DateTimeField(auto_now=True, null=True, blank=True)
    notas = models.TextField(max_length=250, null=True, blank=True)

    def __str__(self):
        return f"{self.nombre}"


class RecetasDetalles(models.Model):
    receta = models.ForeignKey(Recetas, on_delete=models.CASCADE, null=True, blank=True, related_name='componentes')
    componente_materia_prima = models.ForeignKey(MateriasPrimas, on_delete=models.CASCADE, null=True, blank=True)
    componente_producto_intermedio = models.ForeignKey(ProductosElaboradosVariantes, on_delete=models.CASCADE, related_name='receta_componente_producto_intermedio', null=True, blank=True)
    cantidad = models.DecimalField(max_digits=10, decimal_places=3, default=Decimal('0.00'))

    def __str__(self):
        if self.componente_materia_prima:
            return f"{self.receta.nombre} - {self.componente_materia_prima.nombre} - {self.componente_materia_prima.id}"
        else:
            return f"{self.receta.nombre} - {self.componente_producto_intermedio.producto_elaborado_variante.nombre_variante} - {self.componente_producto_intermedio.id}"

    class Meta:
        unique_together = [
            ('receta', 'componente_materia_prima'), 
            ('receta', 'componente_producto_intermedio')
        ]
        constraints = [
            models.CheckConstraint(
                check=(
                    Q(componente_materia_prima__isnull=False) & Q(componente_producto_intermedio__isnull=True)) |
                    (Q(componente_materia_prima__isnull=True) & Q(componente_producto_intermedio__isnull=False)),
                name="receta_un_solo_tipo_componente"
            )
        ]


class RelacionesRecetas(models.Model):
    receta_principal = models.ForeignKey(Recetas, on_delete=models.CASCADE, null=False, blank=False, related_name='receta_principal')
    subreceta = models.ForeignKey(Recetas, on_delete=models.CASCADE, null=False, blank=False, related_name='subreceta')

    def __str__(self):
        return f"Master: {self.receta_principal.producto_elaborado_variante.nombre_variante} - Sub: {self.subreceta.producto_elaborado_variante.nombre_variante}"


class Produccion(models.Model):
    producto_elaborado = models.ForeignKey(ProductosElaborados, on_delete=models.CASCADE, null=False, blank=False)
    producto_elaborado_variante = models.ForeignKey(ProductosElaboradosVariantes, on_delete=models.CASCADE, null=False, blank=False)
    cantidad_producida = models.DecimalField(max_digits=10, decimal_places=3, null=False, blank=False)
    fecha_produccion = models.DateField(null=False, blank=False, auto_now_add=True)
    fecha_expiracion = models.DateField(null=True, blank=True)
    costo_total_componentes_divisa = models.DecimalField(max_digits=10, decimal_places=3)
    costo_total_componentes_local = models.DecimalField(max_digits=10, decimal_places=3)
    usuario_creacion = models.ForeignKey(User, on_delete=models.CASCADE)
    unidad_medida = models.ForeignKey(UnidadesDeMedida, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return f"{self.producto_elaborado_variante.nombre_variante} - {self.fecha_produccion}"


class DetalleProduccionConsumos(models.Model):
    produccion = models.ForeignKey(Produccion, on_delete=models.CASCADE, null=False, blank=False)
    materia_prima_consumida = models.ForeignKey(MateriasPrimas, on_delete=models.CASCADE, null=True, blank=True)
    producto_intermedio_consumido = models.ForeignKey(ProductosElaboradosVariantes, on_delete=models.CASCADE, null=True, blank=True)
    cantidad_consumida = models.DecimalField(max_digits=10, decimal_places=3, null=False, blank=False)
    costo_consumo_divisa = models.DecimalField(max_digits=10, decimal_places=3, null=False, blank=False, default=Decimal('0.00'))
    costo_consumo_local = models.DecimalField(max_digits=10, decimal_places=3, null=False, blank=False, default=Decimal('0.00'))


    def __str__(self):
        return f"{self.produccion.producto_elaborado_variante.nombre_variante} - {self.materia_prima_consumida.nombre if self.materia_prima_consumida else self.producto_intermedio_consumido.nombre_variante} - {self.cantidad_consumida}"

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=(Q(materia_prima_consumida__isnull=False) & Q(producto_intermedio_consumido__isnull=True)) |
                        (Q(materia_prima_consumida__isnull=True) & Q(producto_intermedio_consumido__isnull=False)),
                name="mp_o_pi_en_detalle"
            )
        ]


class DetalleProduccionLote(models.Model):
    detalle_produccion = models.ForeignKey(DetalleProduccionConsumos, on_delete=models.CASCADE, related_name='lotes')
    lote_materia_prima = models.ForeignKey(LotesMateriasPrimas, on_delete=models.CASCADE, null=True, blank=True)
    lote_producto_intermedio = models.ForeignKey(LotesProductosElaborados, on_delete=models.CASCADE, null=True, blank=True)
    cantidad_consumida = models.DecimalField(max_digits=10, decimal_places=3)
    costo_parcial_divisa = models.DecimalField(max_digits=10, decimal_places=3, default=Decimal('0.00'))
    costo_parcial_local = models.DecimalField(max_digits=10, decimal_places=3, default=Decimal('0.00'))

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=(Q(lote_materia_prima__isnull=False) & Q(lote_producto_intermedio__isnull=True)) |
                        (Q(lote_materia_prima__isnull=True) & Q(lote_producto_intermedio__isnull=False)),
                name="un_solo_tipo_lote_en_detalle"
            )
        ]

    def __str__(self):
        return f"{self.detalle_produccion.produccion.producto_elaborado_variante.nombre_variante} - {self.lote_materia_prima.id or self.lote_producto_intermedio.id} - {self.cantidad_consumida}"

class DefinicionTransformacion(models.Model):
    nombre = models.CharField(max_length=255, null=False, blank=False)
    producto_elaborado_entrada = models.ForeignKey(ProductosElaboradosVariantes, on_delete=models.CASCADE, null=False, blank=False, related_name='transformaciones_como_entrada')
    cantidad_entrada = models.DecimalField(max_digits=10, decimal_places=2, null=False, blank=False, default=Decimal('0.00'))
    unidad_medida_entrada = models.ForeignKey(UnidadesDeMedida, on_delete=models.CASCADE, null=False, blank=False, related_name='transformaciones_unidad_entrada')
    producto_elaborado_salida = models.ForeignKey(ProductosElaboradosVariantes, on_delete=models.CASCADE, null=False, blank=False, related_name='transformaciones_como_salida')
    unidad_medida_salida = models.ForeignKey(UnidadesDeMedida, on_delete=models.CASCADE, null=False, blank=False, related_name='transformaciones_unidad_salida')
    cantidad_salida = models.DecimalField(max_digits=10, decimal_places=2, null=False, blank=False, default=Decimal('0.00'))
    usuario_creacion = models.ForeignKey(User, on_delete=models.CASCADE)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    activo = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.nombre} - {self.producto_elaborado_entrada.nombre_variante} - {self.producto_elaborado_salida.nombre_variante}"

class LogTransformacion(models.Model):
    definicion_transformacion = models.ForeignKey(DefinicionTransformacion, on_delete=models.CASCADE)
    cantidad_producto_entrada_efectiva = models.DecimalField(max_digits=10, decimal_places=2, null=False, blank=False, default=Decimal('0.00')) # Cantidad del producto de entrada que realmente se transformó en este evento (ej: se transformaron 2 tortas enteras).
    cantidad_producto_salida_total_generado = models.DecimalField(max_digits=10, decimal_places=2, null=False, blank=False, default=Decimal('0.00')) # Cantidad total del producto de salida generada en este evento (ej: si se transformaron 2 tortas y cada una produce 8 porciones, aquí sería 16)
    costo_unitario_entrada_usd = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    costo_total_entrada_calculado_usd = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00')) # Calculado: cantidad_producto_entrada_efectiva * costo_unitario_entrada_al_momento.
    costo_unitario_salida_calculado_usd = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00')) # - Calculado: costo_total_entrada_calculado / cantidad_producto_salida_total_generado. Este es el costo de cada unidad de porción generada.
    usuario_creacion = models.ForeignKey(User, on_delete=models.CASCADE)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    notas = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.definicion_transformacion.nombre} - {self.cantidad_producto_entrada_efectiva} - {self.cantidad_producto_salida_total_generado}"