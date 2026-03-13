from django.db import models
from apps.core.models import UnidadesDeMedida, CategoriasMateriaPrima, CategoriasProductosReventa, CategoriasProductosElaborados, AtributosProductos, Grupos
from django.core.cache import cache
from django.db.models import Q, Sum
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from django.core.exceptions import ValidationError
from decimal import Decimal
from django.db import transaction

# Create your models here.
class LotesStatus(models.TextChoices):
    DISPONIBLE = 'DISPONIBLE', 'Disponible para uso'
    EXPIRADO = 'EXPIRADO', 'Expirado'
    AGOTADO = 'AGOTADO', 'Agotado'
    INACTIVO = 'INACTIVO', 'Inactivo'


class MedidasFisicas(models.TextChoices):
    UNIDAD = 'UNIDAD', 'Unidad'
    PESO = 'PESO', 'Peso'
    VOLUMEN = 'VOLUMEN', 'Volumen'

class VariantesProductos(models.TextChoices):
    CANTIDAD = 'CANTIDAD', 'Cantidad'
    TIPO = 'TIPO', 'Tipo'
    

class ComponentesStockManagement(models.Model):
    class Meta:
        abstract = True

    def actualizar_stock(self):
        if isinstance(self, MateriasPrimas):
            lote_total = LotesMateriasPrimas.objects.filter(
                variante_materia_prima__materia_prima=self, 
                fecha_caducidad__gt=timezone.now().date(), 
                estado=LotesStatus.DISPONIBLE
            ).aggregate(total=Sum('stock_actual_lote'))
            stock_total = lote_total.get('total') or 0

            self.__class__.objects.filter(id=self.id).update(stock_actual=stock_total)
            return stock_total
    
        elif isinstance(self, ProductosElaborados):

            lote_total = LotesProductosElaborados.objects.filter(
                producto_elaborado_variante__producto_elaborado=self, 
                fecha_caducidad__gt=timezone.now().date(), 
                estado=LotesStatus.DISPONIBLE
            ).aggregate(total=Sum('stock_actual_lote'))
    
            stock_total = lote_total.get('total') or 0
            self.__class__.objects.filter(id=self.id).update(stock_actual=stock_total)
            return stock_total

    def checkAvailability(self, cantidad):
        return self.stock_actual >= cantidad

    def _get_display_name(self):
        """Helper method to get display name for different product types"""
        if hasattr(self, 'nombre'):
            return self.nombre
        elif hasattr(self, 'nombre_producto'):
            return self.nombre_producto
        return str(self)

    def get_closest_expire_lot(self, exclude_id=None):
        if isinstance(self, MateriasPrimas):
            queryset = LotesMateriasPrimas.objects.filter(
                variante_materia_prima__materia_prima=self, 
                estado=LotesStatus.DISPONIBLE
            )
            if exclude_id:
                queryset = queryset.exclude(id=exclude_id)
            return queryset.order_by('fecha_caducidad').first()

        elif isinstance(self, ProductosElaborados):
            queryset = LotesProductosElaborados.objects.filter(
                producto_elaborado_variante__producto_elaborado=self, 
                estado=LotesStatus.DISPONIBLE
            )
            if exclude_id:
                queryset = queryset.exclude(id=exclude_id)

            return queryset.order_by('fecha_caducidad').first()

    def calculate_price(self, precio, cantidad):
        return precio * cantidad

    def consumeStock(self, cantidad):
        if not self.checkAvailability(cantidad):
            raise ValidationError(f"Stock insuficiente. Disponible: {self.stock_actual}, Requerido: {cantidad}")

        cantidad_restante = cantidad
        precio_consumo = Decimal('0')
        detalle_lotes_consumidos = []

        while cantidad_restante > 0:
            lote_consume = self.get_closest_expire_lot()

            if not lote_consume:
                raise ValidationError(f"No hay lotes disponibles para {self._get_display_name()}")

            # Calculate consumption from this lot
            cantidad_del_lote = min(cantidad_restante, lote_consume.stock_actual_lote)
            
            # Update lot stock
            lote_consume.stock_actual_lote -= cantidad_del_lote
            if lote_consume.stock_actual_lote <= 0:
                lote_consume.estado = LotesStatus.AGOTADO
            lote_consume.save()
            
            # Calculate cost
            precio_calculado = self.calculate_price(lote_consume.costo_unitario_usd, cantidad_del_lote)
            precio_consumo += precio_calculado

            # Return data instead of model instances
            detalle_lotes_consumidos.append({
                'lote_id': lote_consume.id,
                'cantidad_consumida': cantidad_del_lote,
                'costo_parcial_usd': precio_calculado,
                'es_materia_prima': isinstance(self, MateriasPrimas)
            })
            cantidad_restante -= cantidad_del_lote

        # Update main stock
        self.stock_actual -= cantidad
        self.save(update_fields=['stock_actual'])

        return {
            "detalle_lotes_consumidos": detalle_lotes_consumidos,
            "costo_consumo_lote": precio_consumo,
        }

    @classmethod
    def expirar_todos_lotes_viejos(cls, force=False):
        hoy = timezone.now().date()
        cache_key = f"expirar_todos_lotes_viejos_{hoy}"

        if not force and cache.get(cache_key):
            return {"resumen": [], "count": 0, "cached": True}

        cache.set(cache_key, True, 86400)  # Cache for 24 hours

        # Get expired lots for all types
        expired_mp_lots = LotesMateriasPrimas.objects.filter(
            fecha_caducidad__lte=hoy,
            estado=LotesStatus.DISPONIBLE,
        ).select_related('materia_prima')

        expired_pe_lots = LotesProductosElaborados.objects.filter(
            fecha_caducidad__lte=hoy,
            estado=LotesStatus.DISPONIBLE,
        ).select_related('producto_elaborado')

        expired_pr_lots = LotesProductosReventa.objects.filter(
            fecha_caducidad__lte=hoy,
            estado=LotesStatus.DISPONIBLE,
        ).select_related('producto_reventa')

        # Build summary before updating
        resumen = []
        
        # Process raw materials lots
        for lote in expired_mp_lots:
            if lote.stock_actual_lote > 0:
                resumen.append({
                    'lote_id': lote.id,
                    'tipo': 'Materia Prima',
                    'componente': lote.materia_prima.nombre,
                    'fecha_caducidad': lote.fecha_caducidad,
                    'stock_expirado': lote.stock_actual_lote
                })

        # Process elaborated products lots
        for lote in expired_pe_lots:
            if lote.stock_actual_lote > 0:
                resumen.append({
                    'lote_id': lote.id,
                    'tipo': 'Producto Elaborado',
                    'componente': lote.producto_elaborado.nombre_producto,
                    'fecha_caducidad': lote.fecha_caducidad,
                    'stock_expirado': lote.stock_actual_lote
                })

        # Process productos reventa lots
        for lote in expired_pr_lots:
            if lote.stock_actual_lote > 0:
                resumen.append({
                    'lote_id': lote.id,
                    'tipo': 'Producto Reventa',
                    'componente': lote.producto_reventa.nombre_producto,
                    'fecha_caducidad': lote.fecha_caducidad,
                    'stock_expirado': lote.stock_actual_lote
                })

        # Update stock for affected materials (get unique materials from expired lots)
        affected_mp_ids = list(expired_mp_lots.values_list('materia_prima_id', flat=True).distinct())
        affected_pe_ids = list(expired_pe_lots.values_list('producto_elaborado_id', flat=True).distinct())
        affected_pr_ids = list(expired_pr_lots.values_list('producto_reventa_id', flat=True).distinct())

        # Update lot statuses
        with transaction.atomic():
            mp_count = expired_mp_lots.update(estado=LotesStatus.EXPIRADO)
            pe_count = expired_pe_lots.update(estado=LotesStatus.EXPIRADO)
            pr_count = expired_pr_lots.update(estado=LotesStatus.EXPIRADO)
            total_count = mp_count + pe_count + pr_count

            # Update stock for affected raw materials
            for mp_id in affected_mp_ids:
                mp = MateriasPrimas.objects.get(id=mp_id)
                mp.actualizar_stock()

            # Update stock for affected elaborated products
            for pe_id in affected_pe_ids:
                pe = ProductosElaborados.objects.get(id=pe_id)
                pe.actualizar_product_stock()

            # Update stock for affected productos reventa
            for pr_id in affected_pr_ids:
                pr = ProductosReventa.objects.get(id=pr_id)
                pr.actualizar_product_stock()

        return {
            "resumen": resumen, 
            "count": total_count,
            "materias_primas_afectadas": len(affected_mp_ids),
            "productos_elaborados_afectados": len(affected_pe_ids),
            "productos_reventa_afectados": len(affected_pr_ids)
        }


class ProductosStockManagement(models.Model):
    class Meta:
        abstract = True
    
    def actualizar_product_stock(self):
        if isinstance(self, ProductosReventa):
            lote_total = LotesProductosReventa.objects.filter(
                producto_reventa=self, 
                fecha_caducidad__gt=timezone.now().date(), 
                estado=LotesStatus.DISPONIBLE
            ).aggregate(total=Sum('stock_actual_lote'))
            stock_total = lote_total.get('total') or 0

            self.__class__.objects.filter(id=self.id).update(stock_actual=stock_total)
            return stock_total
    
        elif isinstance(self, ProductosElaborados):
            # For base products, aggregate stock from all lots (old behavior, may be deprecated)
            lote_total = LotesProductosElaborados.objects.filter(
                producto_elaborado_variante__producto_elaborado=self, 
                fecha_caducidad__gt=timezone.now().date(), 
                estado=LotesStatus.DISPONIBLE
            ).aggregate(total=Sum('stock_actual_lote'))
    
            stock_total = lote_total.get('total') or 0
            self.__class__.objects.filter(id=self.id).update(stock_actual=stock_total)
            return stock_total
        
        # Import here to avoid circular dependency
        from apps.inventario.models import ProductosElaboradosVariantes
        if isinstance(self, ProductosElaboradosVariantes):
            # For variants, sum stock from lots of this specific variant
            lote_total = LotesProductosElaborados.objects.filter(
                producto_elaborado_variante=self, 
                fecha_caducidad__gt=timezone.now().date(), 
                estado=LotesStatus.DISPONIBLE
            ).aggregate(total=Sum('stock_actual_lote'))
    
            stock_total = lote_total.get('total') or 0
            self.__class__.objects.filter(id=self.id).update(stock_actual=stock_total)
            return stock_total

    def check_product_availability(self, cantidad):
        return self.stock_actual >= cantidad

    def _get_display_name(self):
        """Helper method to get display name for different product types"""
        if hasattr(self, 'nombre'):
            return self.nombre
        elif hasattr(self, 'nombre_producto'):
            return self.nombre_producto
        elif hasattr(self, 'nombre_variante'):
            return f"{self.producto_elaborado.nombre_producto} - {self.nombre_variante}"
        return str(self)
    
    def get_closest_expire_lot_producto(self, exclude_id=None): 
        if isinstance(self, ProductosReventa):
            queryset = LotesProductosReventa.objects.filter(
                producto_reventa=self, 
                estado=LotesStatus.DISPONIBLE
            )
            if exclude_id:
                queryset = queryset.exclude(id=exclude_id)
            return queryset.order_by('fecha_caducidad').first()

        elif isinstance(self, ProductosElaborados):
            # For base products, get earliest expiring lot from any variant (old behavior)
            queryset = LotesProductosElaborados.objects.filter(
                producto_elaborado_variante__producto_elaborado=self, 
                estado=LotesStatus.DISPONIBLE
            )
            if exclude_id:
                queryset = queryset.exclude(id=exclude_id)
            return queryset.order_by('fecha_caducidad').first()
        
        # Import here to avoid circular dependency
        from apps.inventario.models import ProductosElaboradosVariantes
        if isinstance(self, ProductosElaboradosVariantes):
            # For variants, get earliest expiring lot of this specific variant
            queryset = LotesProductosElaborados.objects.filter(
                producto_elaborado_variante=self, 
                estado=LotesStatus.DISPONIBLE
            )
            if exclude_id:
                queryset = queryset.exclude(id=exclude_id)
            return queryset.order_by('fecha_caducidad').first()


    def consume_product_stock(self, cantidad, price = 0):
        if not self.check_product_availability(cantidad):
            raise ValidationError(f"Stock insuficiente. Disponible: {self.stock_actual}, Requerido: {cantidad}")

        cantidad_restante = cantidad
        lotes_consumidos = []

        while cantidad_restante > 0:
            lote_consume = self.get_closest_expire_lot_producto()
            if not lote_consume:
                raise ValidationError(f"No hay lotes disponibles para {self._get_display_name()}")

            cantidad_del_lote = min(cantidad_restante, lote_consume.stock_actual_lote)
            
            lote_consume.stock_actual_lote -= cantidad_del_lote
            if lote_consume.stock_actual_lote <= 0:
                lote_consume.estado = LotesStatus.AGOTADO
            lote_consume.save()

            detalle_consumo = {
                'lote_producto_reventa': lote_consume if isinstance(lote_consume, LotesProductosReventa) else None,
                'lote_producto_elaborado': lote_consume if isinstance(lote_consume, LotesProductosElaborados) else None,
                'cantidad_consumida': cantidad_del_lote,
                'costo_parcial_usd': cantidad_del_lote * price
            }
            lotes_consumidos.append(detalle_consumo)
            cantidad_restante -= cantidad_del_lote

        self.stock_actual -= cantidad
        self.save(update_fields=['stock_actual'])

        return lotes_consumidos


class MateriasPrimas(ComponentesStockManagement):
    nombre = models.CharField(max_length=100, null=False, blank=False, unique=True)
    unidad_medida_base = models.ForeignKey(UnidadesDeMedida, on_delete=models.CASCADE, null=False, blank=False, related_name='materias_primas_unidad_base')
    stock_actual = models.DecimalField(max_digits=20, decimal_places=2, default=0)
    SKU = models.CharField(max_length=100, null=True, blank=True, unique=True)
    punto_reorden = models.DecimalField(max_digits=20, decimal_places=2, default=0, null=False, blank=False)

    categoria = models.ForeignKey(CategoriasMateriaPrima, on_delete=models.CASCADE)
    descripcion = models.TextField(max_length=255, null=True, blank=True)
    fecha_creacion_registro = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.nombre


class MateriasPrimasVariantes(models.Model):
    materia_prima = models.ForeignKey(MateriasPrimas, on_delete=models.CASCADE, null=False, blank=False, related_name='variantes')
    nombre_variante = models.CharField(max_length=100, null=False, blank=False)
    unidad_compra = models.ForeignKey(UnidadesDeMedida, on_delete=models.CASCADE, null=False, blank=False)
    SKU_variante = models.CharField(max_length=100, null=True, blank=True, unique=True)
    precio_compra_divisa = models.DecimalField(max_digits=20, decimal_places=2, default=0, null=True, blank=True)
    precio_compra_local = models.DecimalField(max_digits=20, decimal_places=2, default=0, null=True, blank=True)
    nombre_empaque_estandar = models.CharField(max_length=100, null=True, blank=True)
    cantidad_empaque_estandar = models.DecimalField(max_digits=20, decimal_places=2, null=True, blank=True)
    unidad_medida_empaque_estandar = models.ForeignKey(UnidadesDeMedida, on_delete=models.CASCADE, related_name='materias_primas_empaque', null=True, blank=True)
    
    def __str__(self):
        return self.nombre_variante 


class LotesMateriasPrimas(models.Model):
    variante_materia_prima = models.ForeignKey(MateriasPrimasVariantes, on_delete=models.CASCADE, null=True, blank=True)
    proveedor = models.ForeignKey('compras.Proveedores', on_delete=models.CASCADE, null=True, blank=True)
    fecha_recepcion = models.DateField(null=False, blank=False)
    fecha_caducidad = models.DateField(null=False, blank=False)
    cantidad_recibida = models.DecimalField(max_digits=10, decimal_places=2, default=0, null=False, blank=False)
    stock_actual_lote = models.DecimalField(max_digits=10, decimal_places=2, default=0, null=False, blank=False)
    costo_unitario_divisa = models.DecimalField(max_digits=10, decimal_places=2, default=0, null=False, blank=False)
    costo_unitario_local = models.DecimalField(max_digits=10, decimal_places=2, default=0, null=False, blank=False)
    detalle_oc = models.ForeignKey('compras.DetalleOrdenesCompra', on_delete=models.CASCADE, null=True, blank=True)
    estado = models.CharField(
        max_length=10, 
        choices=LotesStatus.choices, 
        default=LotesStatus.DISPONIBLE
    )
    activo = models.BooleanField(default=True)

    @property
    def materia_prima(self):
        if self.variante_materia_prima:
            return self.variante_materia_prima.materia_prima
        return None

    def __str__(self):
        return f"Lote {self.id} - {self.materia_prima.nombre} - {self.stock_actual_lote}"

    def determinar_estado(self):
        """Determine lot status based on expiration and FEFO rules"""
        hoy = timezone.now().date()
        
        if self.fecha_caducidad <= hoy:
            return LotesStatus.EXPIRADO
        elif self.stock_actual_lote <= 0:
            return LotesStatus.AGOTADO
        else:
            # Check if this is the earliest expiring lot
            lotes_activos = LotesMateriasPrimas.objects.filter(
                variante_materia_prima__materia_prima=self.materia_prima,
                fecha_caducidad__gt=hoy,
                stock_actual_lote__gt=0
            ).order_by('fecha_caducidad')

            if lotes_activos.first() == self:
                return LotesStatus.DISPONIBLE
            else:
                return LotesStatus.INACTIVO # Este lote no es el más antiguo, por lo que no está disponible para uso inmediato

    @classmethod
    def actualizar_estados(cls, materia_prima_id):
        """Update FEFO status for all lots of a material"""
        lotes = cls.objects.filter(variante_materia_prima__materia_prima_id=materia_prima_id)

        for lote in lotes:
            nuevo_estado = lote.determinar_estado()
            if lote.estado != nuevo_estado:
                lote.estado = nuevo_estado
                lote.save(update_fields=['estado'])


class ProductosElaborados(ComponentesStockManagement, ProductosStockManagement):
    nombre_producto = models.CharField(max_length=100, null=False, blank=False, unique=True)
    descripcion = models.TextField(max_length=255, null=True, blank=True)
    unidad_produccion = models.ForeignKey(
        UnidadesDeMedida, on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='productos_elaborados_unidad_produccion',
        help_text="Unidad en la que se produce y se gestiona el stock (e.g., Unidades, uGramos).")
    unidad_venta = models.ForeignKey(
        UnidadesDeMedida, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='productos_elaborados_unidad_venta', 
        help_text="Unidad en la que se vende el producto (e.g., Unidades, Kilogramos, Litros).")
    categoria = models.ForeignKey(CategoriasProductosElaborados, on_delete=models.CASCADE)
    fecha_creacion_registro = models.DateField(auto_now_add=True)
    vendible_por_medida_real  = models.BooleanField(
        null=True,
        blank=True,
        help_text="Si es True, el precio final se calcula midiendo peso/volumen en la venta."
    )
    tipo_medida_fisica = models.CharField(
        choices=MedidasFisicas.choices,
        max_length=10, null=False, blank=False, default=MedidasFisicas.PESO
    )
    es_intermediario = models.BooleanField(default=False, null=False)
    usado_en_transformaciones = models.BooleanField(default=False, null=False)
    
    def checkAvailability(self, cantidad):
        return self.stock_actual >= cantidad

    def clean(self):
        """
        Custom validation to enforce business logic for products.
        """
        super().clean()

        if self.vendible_por_medida_real  and self.unidad_venta.nombre_completo == 'Unidad':
            raise ValidationError(
                "Si el precio se calcula en la venta, la unidad de venta no puede ser 'Unidad'. Debe ser KG, GR, LT, etc."
            )

        if not self.vendible_por_medida_real  and self.unidad_venta.nombre_completo != 'Unidad':
            raise ValidationError(
                "Si el precio es fijo (no calculado en venta), la unidad de venta debe ser 'Unidad'."
            )

    def __str__(self):
        return f"Producto {self.id} - {self.nombre_producto}"
    
    
    class Meta:
        constraints = [
            models.CheckConstraint(
                check=(Q(es_intermediario=True) & Q(unidad_venta__isnull=True) & Q(vendible_por_medida_real__isnull=True))|
                    (Q(es_intermediario=False) & Q(unidad_venta__isnull=False) & Q(vendible_por_medida_real__isnull=False)),
                name='intermedio_o_producto'
            )
        ]


class ProductosElaboradosVariantes(ProductosStockManagement):
    """
    Variants of elaborated products. Each variant represents a sellable SKU.
    Stock is managed at the variant level, not at the base product level.
    """
    producto_elaborado = models.ForeignKey(
        ProductosElaborados, 
        on_delete=models.CASCADE, 
        null=False, 
        blank=False,
        related_name='variantes'
    )
    nombre_variante = models.CharField(
        max_length=100, 
        null=False, 
        blank=False,
        help_text="Nombre descriptivo de la variante (ej: '6 unidades', 'Grande', 'Chocolate')"
    )
    
    # Pricing
    precio_venta_divisa = models.DecimalField(max_digits=20, decimal_places=2, null=True, blank=True)
    precio_venta_local = models.DecimalField(max_digits=20, decimal_places=2, null=True, blank=True)
    costo_divisa = models.DecimalField(max_digits=20, decimal_places=2, null=True, blank=True)
    costo_local = models.DecimalField(max_digits=20, decimal_places=2, null=True, blank=True)
    
    # Identification
    SKU = models.CharField(max_length=50, null=True, blank=True, unique=True)
    descripcion = models.TextField(max_length=255, null=True, blank=True)
    
    
    # Stock management (inherited from ProductosStockManagement)
    stock_actual = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    punto_reorden = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Variant attribute (what makes this variant different)
    atributo = models.CharField(
        max_length=100, 
        choices=AtributosProductos.choices, 
        default=AtributosProductos.CANTIDAD,
        help_text="Tipo de atributo que diferencia esta variante"
    )
    
    is_vendible = models.BooleanField(
        default=True,
        help_text="Si es True, esta variante puede ser vendida"
    )
    
    fecha_creacion = models.DateField(auto_now_add=True)
    
    class Meta:
        unique_together = [('producto_elaborado', 'nombre_variante')]
        verbose_name = "Variante de Producto Elaborado"
        verbose_name_plural = "Variantes de Productos Elaborados"
    
    def __str__(self):
        return f"{self.producto_elaborado.nombre_producto} - {self.nombre_variante}"
    
    def clean(self):
        """Validate variant business logic"""
        super().clean()
        
        # Ensure intermediate products don't have sellable variants
        if self.producto_elaborado.es_intermediario and self.precio_venta_divisa:
            raise ValidationError(
                "Las variantes de productos intermediarios no pueden tener precio de venta"
            )
        
        # Ensure final products have pricing
        if not self.producto_elaborado.es_intermediario and not self.precio_venta_divisa:
            raise ValidationError(
                "Las variantes de productos finales deben tener precio de venta"
            )


class GruposProductosElaborados(models.Model):
    """
    Junction table for product bundles/groups.
    Allows creating bundles that can contain variants from different base products.
    Example: A "Breakfast Combo" group could contain variants of bread, juice, and pastries.
    """
    producto_elaborado_variante = models.ForeignKey(
        ProductosElaboradosVariantes, 
        on_delete=models.CASCADE, 
        null=False, 
        blank=False,
        related_name='grupos'
    )
    cantidad = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=1,
        help_text="Cantidad de esta variante incluida en el grupo"
    )
    grupo = models.ForeignKey(
        Grupos, 
        on_delete=models.CASCADE, 
        null=False, 
        blank=False,
        related_name='productos_elaborados'
    )
    descripcion = models.TextField(max_length=255, null=True, blank=True)
    
    class Meta:
        unique_together = [('producto_elaborado_variante', 'grupo')]
        verbose_name = "Producto en Grupo"
        verbose_name_plural = "Productos en Grupos"
    
    def clean(self):
        super().clean()
        
        max_cantidad = self.grupo.cantidad

        entire_group = GruposProductosElaborados.objects.filter(grupo=self.grupo)
        total_cantidad = sum(entire_group.values_list('cantidad', flat=True))
        
        if total_cantidad > max_cantidad:
            raise ValidationError(
                "La cantidad total del grupo excede la cantidad máxima"
            )

    def __str__(self):
        return f"{self.grupo.nombre_grupo} - {self.producto_elaborado_variante}"


class LotesProductosElaborados(models.Model):
    """
    Batch/lot tracking for elaborated product variants.
    Each lot is associated with a specific variant and production run.
    """
    produccion_origen = models.ForeignKey(
        'produccion.Produccion', 
        on_delete=models.CASCADE,
        null=False, 
        blank=False,
        related_name='lotes_productos_elaborados'
    )
    producto_elaborado_variante = models.ForeignKey(
        ProductosElaboradosVariantes, 
        on_delete=models.CASCADE, 
        null=False, 
        blank=False,
        related_name='lotes'
    )
    cantidad_inicial_lote = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0,
        help_text="Cantidad original producida en este lote (copiado de Produccion.cantidad_producida)"
    )
    stock_actual_lote = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    fecha_produccion = models.DateField(null=False, blank=False, auto_now_add=True)
    fecha_caducidad = models.DateField(null=False, blank=False)

    estado = models.CharField(
        max_length=10,
        choices=LotesStatus.choices,
        default=LotesStatus.DISPONIBLE
    )
    coste_total_lote_usd = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    peso_total_lote_gramos = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text="Actual measured weight of entire batch in grams"
    )

    volumen_total_lote_ml = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text="Actual measured volume of entire batch in milliliters"
    )

    @property
    def peso_promedio_por_unidad(self):
        if self.cantidad_inicial_lote > 0 and self.peso_total_lote_gramos:
            return self.peso_total_lote_gramos / self.cantidad_inicial_lote
        return None

    @property
    def volumen_promedio_por_unidad(self):
        if self.cantidad_inicial_lote > 0 and self.volumen_total_lote_ml:
            return self.volumen_total_lote_ml / self.cantidad_inicial_lote
        return None

    @property
    def costo_unitario_usd(self):
        if self.cantidad_inicial_lote == 0:
            return Decimal('0')
        return self.coste_total_lote_usd / self.cantidad_inicial_lote

    def __str__(self):
        return f"Lote {self.id} - {self.producto_elaborado_variante} - Stock: {self.stock_actual_lote}"

    def clean(self):
        super().clean()
        
        # Access the base product through the variant
        producto_base = self.producto_elaborado_variante.producto_elaborado

        if producto_base.tipo_medida_fisica == MedidasFisicas.PESO and self.volumen_total_lote_ml:
            raise ValidationError("No puede especificar volumen para un producto medido por peso.")
        
        if producto_base.tipo_medida_fisica == MedidasFisicas.VOLUMEN and self.peso_total_lote_gramos:
            raise ValidationError("No puede especificar peso para un producto medido por volumen.")
    
    class Meta:
        verbose_name = "Lote de Producto Elaborado"
        verbose_name_plural = "Lotes de Productos Elaborados"
        ordering = ['fecha_caducidad', '-fecha_produccion']


class ProductosIntermediosManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(es_intermediario=True)


class ProductosFinalesManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(es_intermediario=False)


class ProductosIntermedios(ProductosElaborados):
    objects = ProductosIntermediosManager()

    class Meta:
        proxy = True
        verbose_name = "Producto Intermedio"
        verbose_name_plural = "Productos Intermedios"

    def clean(self):
        if self.precio_venta_divisa:
            raise ValidationError("Productos intermedios no pueden tener precio de venta")


class ProductosFinales(ProductosElaborados):
    objects = ProductosFinalesManager()

    class Meta:
        proxy = True
        verbose_name = "Producto Final"
        verbose_name_plural = "Productos Finales"

    def clean(self):
        if not self.precio_venta_divisa:
            raise ValidationError("Productos finales deben tener precio de venta")


class ProductosReventa(ProductosStockManagement):
    nombre_producto = models.CharField(max_length=100, null=False, blank=False, unique=True)
    descripcion = models.TextField(max_length=255, null=True, blank=True)
    categoria = models.ForeignKey(CategoriasProductosReventa, on_delete=models.CASCADE)
    marca = models.CharField(max_length=100, null=True, blank=True)
    proveedor_preferido = models.ForeignKey('compras.Proveedores', on_delete=models.CASCADE, null=True, blank=True)
    
    # Replace tipo_manejo_venta with separate units
    unidad_base_inventario = models.ForeignKey(
        UnidadesDeMedida, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='productos_reventa_inventario',
        help_text="Unidad en la que se gestiona el stock (ej: Unidad para latas, Gramos para jamón)"
    )

    unidad_venta = models.ForeignKey(
        UnidadesDeMedida,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='productos_reventa_venta',
        help_text="Unidad en la que se vende el producto (ej: Unidad para bolsa de 1kg)"
    )

    # Conversion factor: how many inventory units = 1 sale unit
    # Example: 1 bag (sale unit) = 1000 grams (inventory unit), factor = 1000
    factor_conversion = models.DecimalField(
        max_digits=10, 
        decimal_places=4, 
        default=1,
        help_text="Cuántas unidades de inventario equivalen a 1 unidad de venta"
    )
    
    es_perecedero = models.BooleanField(
        default=False,
        help_text="Si es True, esta variante es un perecedero"
    )
    fecha_creacion_registro = models.DateField(auto_now_add=True)

    def expirar_lotes_viejos(self, force=False):
        """Expire old lots for this specific product"""
        ahora = timezone.now().date()
        cache_key = f"expirar_lotes_productos_reventa_{self.id}_{ahora}"

        if not force and cache.get(cache_key):
            return {"resumen": [], "cached": True}

        cache.set(cache_key, True, 86400)  # Cache for 24 hours
        lotes_expirados = LotesProductosReventa.objects.filter(
            producto_reventa=self, 
            fecha_caducidad__lte=ahora, 
            estado=LotesStatus.DISPONIBLE
        )

        resumen = []
        for lote in lotes_expirados:
            if lote.stock_actual_lote > 0:
                resumen.append({
                    'lote_id': lote.id,
                    'producto_reventa': self.nombre_producto,
                    'stock_expirado': lote.stock_actual_lote,
                    'fecha_caducidad': lote.fecha_caducidad
                })

        # Update expired lots
        count = lotes_expirados.update(estado=LotesStatus.EXPIRADO)
        
        # Update stock for this product
        if count > 0:
            self.actualizar_product_stock()

        return {"resumen": resumen, "count": count}

    @classmethod
    def expirar_todos_lotes_viejos(cls, force=False):
        """Expire all old lots for all ProductosReventa"""
        hoy = timezone.now().date()
        cache_key = f"expirar_todos_lotes_productos_reventa_{hoy}"

        if not force and cache.get(cache_key):
            return {"resumen": [], "count": 0, "cached": True}

        cache.set(cache_key, True, 86400)  # Cache for 24 hours

        # Get expired lots
        expired_pr_lots = LotesProductosReventa.objects.filter(
            fecha_caducidad__lte=hoy,
            estado=LotesStatus.DISPONIBLE,
        ).select_related('producto_reventa')

        # Build summary before updating
        resumen = []
        for lote in expired_pr_lots:
            if lote.stock_actual_lote > 0:
                resumen.append({
                    'lote_id': lote.id,
                    'tipo': 'Producto Reventa',
                    'producto': lote.producto_reventa.nombre_producto,
                    'fecha_caducidad': lote.fecha_caducidad,
                    'stock_expirado': lote.stock_actual_lote
                })

        # Get unique product IDs
        affected_pr_ids = list(expired_pr_lots.values_list('producto_reventa_id', flat=True).distinct())

        # Update lot statuses
        count = expired_pr_lots.update(estado=LotesStatus.EXPIRADO)

        # Update stock for affected products
        for pr_id in affected_pr_ids:
            pr = cls.objects.get(id=pr_id)
            pr.actualizar_product_stock()

        return {
            "resumen": resumen, 
            "count": count,
            "productos_reventa_afectados": len(affected_pr_ids)
        }

    def convert_inventory_to_sale_units(self, cantidad_inventario):
        """Convert inventory units to sale units"""
        return cantidad_inventario / self.factor_conversion

    def convert_sale_to_inventory_units(self, cantidad_venta):
        """Convert sale units to inventory units"""
        return cantidad_venta * self.factor_conversion

    def __str__(self):
        return f"Producto {self.id} - {self.nombre_producto}"

    
class ProductosReventaVariantes(models.Model):
    """
    Variants of resold products. Each variant represents a sellable SKU.
    Stock is managed at the variant level, not at the base product level.
    """
    producto_reventa = models.ForeignKey(
        ProductosReventa, 
        on_delete=models.CASCADE, 
        null=False, 
        blank=False,
        related_name='variantes'
    )
    nombre_variante = models.CharField(
        max_length=100, 
        null=False, 
        blank=False,
        help_text="Nombre descriptivo de la variante (ej: '6 unidades', 'Grande', 'Chocolate')"
    )
    # Pricing
    precio_venta_divisa = models.DecimalField(max_digits=20, decimal_places=2, null=True, blank=True)
    precio_venta_local = models.DecimalField(max_digits=20, decimal_places=2, null=True, blank=True)
    costo_divisa = models.DecimalField(max_digits=20, decimal_places=2, null=True, blank=True)
    costo_local = models.DecimalField(max_digits=20, decimal_places=2, null=True, blank=True)
    
    # Identification
    SKU = models.CharField(max_length=50, null=True, blank=True, unique=True)
    descripcion = models.TextField(max_length=255, null=True, blank=True)
    
    # Stock management (inherited from ProductosStockManagement)
    stock_actual = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    punto_reorden = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Variant attribute (what makes this variant different)
    atributo = models.CharField(
        max_length=100, 
        choices=AtributosProductos.choices, 
        default=AtributosProductos.CANTIDAD,
        help_text="Tipo de atributo que diferencia esta variante"
    )
    
    is_vendible = models.BooleanField(
        default=True,
        help_text="Si es True, esta variante puede ser vendida"
    )

    fecha_creacion = models.DateField(auto_now_add=True)
    fecha_modificacion = models.DateField(auto_now=True)
    
    class Meta:
        unique_together = [('producto_reventa', 'nombre_variante')]
        verbose_name = "Variante de Producto Reventa"
        verbose_name_plural = "Variantes de Productos Reventa"

    def __str__(self):
        return f"{self.producto_reventa.nombre_producto} - {self.nombre_variante}"
    
    def clean(self):
        """Validate variant business logic"""
        super().clean()


class GruposProductosReventa(models.Model):
    producto_reventa_variante = models.ForeignKey(ProductosReventaVariantes, on_delete=models.CASCADE, null=False, blank=False)
    grupo = models.ForeignKey(
        Grupos, 
        on_delete=models.CASCADE, 
        null=False, 
        blank=False,
        related_name='productos_reventa'
    )
    cantidad = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    fecha_creacion = models.DateField(auto_now_add=True)
    fecha_modificacion = models.DateField(auto_now=True)
    descripcion = models.TextField(max_length=255, null=True, blank=True)

    class Meta:
        unique_together = [('producto_reventa_variante', 'grupo')]
        verbose_name = "Grupo de Variantes de Productos Reventa"
        verbose_name_plural = "Grupos de Variantes de Productos Reventa"
    
    def __str__(self):
        return f"{self.producto_reventa_variante} - {self.grupo}"

    def clean(self):
        super().clean()
        
        max_cantidad = self.grupo.cantidad

        entire_group = GruposProductosReventa.objects.filter(grupo=self.grupo)
        total_cantidad = sum(entire_group.values_list('cantidad', flat=True))
        
        if total_cantidad > max_cantidad:
            raise ValidationError(
                "La cantidad total del grupo excede la cantidad máxima"
            )
        

class LotesProductosReventa(models.Model):
    producto_reventa_variante = models.ForeignKey(ProductosReventaVariantes, on_delete=models.CASCADE, null=False, blank=False)
    fecha_recepcion = models.DateField(null=False, blank=False)
    fecha_caducidad = models.DateField(null=False, blank=False)
    cantidad_recibida = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    stock_actual_lote = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    coste_unitario_lote_divisa = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    coste_unitario_lote_local = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    detalle_oc = models.ForeignKey('compras.DetalleOrdenesCompra', on_delete=models.CASCADE, null=True, blank=True)
    proveedor = models.ForeignKey('compras.Proveedores', on_delete=models.CASCADE, null=True, blank=True)
    estado = models.CharField(
        max_length=10,
        choices=LotesStatus.choices,
        default=LotesStatus.DISPONIBLE
    )

    def __str__(self):
        return f"Lote {self.id} - {self.producto_reventa.nombre_producto} - {self.stock_actual_lote}"


@receiver([post_save, post_delete], sender=LotesMateriasPrimas)
def update_materia_prima_stock(sender, instance, **kwargs):
    materia_prima = instance.variante_materia_prima.materia_prima
    variantes = MateriasPrimasVariantes.objects.filter(materia_prima=materia_prima).values_list('id', flat=True)
    
    if getattr(instance, "id", None) and instance.fecha_caducidad <= timezone.now().date() and instance.estado == LotesStatus.DISPONIBLE:
        expired_lots = LotesMateriasPrimas.objects.filter(
            variante_materia_prima__in=variantes,
            fecha_caducidad__lte=timezone.now().date(),
            estado=LotesStatus.DISPONIBLE
        )
        expired_lots.update(estado=LotesStatus.EXPIRADO)

    total_stock = LotesMateriasPrimas.objects.filter(
        variante_materia_prima__in=variantes,
        fecha_caducidad__gt=timezone.now().date(),
        estado=LotesStatus.DISPONIBLE
    ).aggregate(total=Sum('stock_actual_lote'))['total'] or 0

    MateriasPrimas.objects.filter(id=materia_prima.id).update(stock_actual=total_stock)

@receiver([post_save, post_delete], sender=LotesProductosReventa)
def update_producto_reventa_variante_stock(sender, instance, **kwargs):
    producto_reventa_variante = instance.producto_reventa_variante
    producto_reventa = producto_reventa_variante.producto_reventa

    # Expire lots that have passed their expiration date
    if getattr(instance, "id", None) and instance.fecha_caducidad <= timezone.now().date() and instance.estado == LotesStatus.DISPONIBLE:
        expired_lots = LotesProductosReventa.objects.filter(
            producto_reventa_variante=producto_reventa_variante,
            fecha_caducidad__lte=timezone.now().date(),
            estado=LotesStatus.DISPONIBLE
        )
        expired_lots.update(estado=LotesStatus.EXPIRADO)

    # Calculate total stock from available, non-expired lots for this variant
    total_variant_stock = LotesProductosReventa.objects.filter(
        producto_reventa_variante=producto_reventa_variante,
        fecha_caducidad__gt=timezone.now().date(),
        estado=LotesStatus.DISPONIBLE
    ).aggregate(total=Sum('stock_actual_lote'))['total'] or 0

    # Update variant stock
    producto_reventa_variante.__class__.objects.filter(id=producto_reventa_variante.id).update(stock_actual=total_variant_stock)

    # Update base product stock (sum of all its variants)
    total_product_stock = ProductosReventaVariantes.objects.filter(
        producto_reventa=producto_reventa
    ).aggregate(total=Sum('stock_actual'))['total'] or 0
    
    producto_reventa.__class__.objects.filter(id=producto_reventa.id).update(stock_actual=total_product_stock)

    try:
        from apps.core.services.services import NotificationService
        NotificationService.check_low_stock(ProductosReventaVariantes)
        NotificationService.check_sin_stock(ProductosReventaVariantes)
    except ImportError:
        pass


@receiver([post_save, post_delete], sender=LotesProductosElaborados)
def update_producto_elaborado_variante_stock(sender, instance, **kwargs):
    """
    Update variant stock when lots are created, updated, or deleted.
    This ensures the variant's stock_actual reflects the sum of all available lots.
    """
    variante = instance.producto_elaborado_variante
    producto_elaborado = variante.producto_elaborado

    # Expire lots that have passed their expiration date
    if getattr(instance, "id", None) and instance.fecha_caducidad <= timezone.now().date() and instance.estado == LotesStatus.DISPONIBLE:
        expired_lots = LotesProductosElaborados.objects.filter(
            producto_elaborado_variante=variante,
            fecha_caducidad__lte=timezone.now().date(),
            estado=LotesStatus.DISPONIBLE
        )
        expired_lots.update(estado=LotesStatus.EXPIRADO)

    # Calculate total stock from available, non-expired lots for this variant
    total_variant_stock = LotesProductosElaborados.objects.filter(
        producto_elaborado_variante=variante,
        fecha_caducidad__gt=timezone.now().date(),
        estado=LotesStatus.DISPONIBLE
    ).aggregate(total=Sum('stock_actual_lote'))['total'] or 0

    # Update variant stock
    variante.__class__.objects.filter(id=variante.id).update(stock_actual=total_variant_stock)

    # Update base product stock (sum of all its variants)
    total_product_stock = ProductosElaboradosVariantes.objects.filter(
        producto_elaborado=producto_elaborado
    ).aggregate(total=Sum('stock_actual'))['total'] or 0

    producto_elaborado.__class__.objects.filter(id=producto_elaborado.id).update(stock_actual=total_product_stock)

    try:
        from apps.core.services.services import NotificationService
        # Check notifications for the variant
        NotificationService.check_low_stock(ProductosElaboradosVariantes)
        NotificationService.check_sin_stock(ProductosElaboradosVariantes)
    except ImportError:
        pass