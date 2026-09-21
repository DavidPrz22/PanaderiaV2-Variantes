 Set up this Neon project in the current working directory.

1. `npm i -g neon@latest && neon login`
2. `neon skills -y`
3. `neon mcp -y`
4. `neon link --project-id red-bonus-93414306 --branch production -y`
5. `neon config init`
6. Update `neon.ts`:

```ts
import { defineConfig } from "@neon/config/v1";

export default defineConfig({});
```

7. `neon deploy`


# Product Variant Model - Quick Reference Guide

## Common Operations & Code Examples

### 1. Creating a Product with Variants

```python
from apps.inventario.models import ProductosElaborados, ProductosElaboradosVariantes
from apps.core.models import UnidadesDeMedida, CategoriasProductosElaborados

# Create base product (template)
pan_integral = ProductosElaborados.objects.create(
    nombre_producto="Pan Integral",
    descripcion="Pan integral artesanal",
    unidad_produccion=UnidadesDeMedida.objects.get(nombre_completo="Unidad"),
    categoria=CategoriasProductosElaborados.objects.get(nombre_categoria="Panadería"),
    tipo_medida_fisica="PESO",
    es_intermediario=False,
    usado_en_transformaciones=False
)

# Create variants
variante_pequeno = ProductosElaboradosVariantes.objects.create(
    producto_elaborado=pan_integral,
    nombre_variante="Pequeño",
    SKU="PAN-INT-PEQ",
    precio_venta_usd=2.50,
    cantidad_variante=250,  # 250g
    atributo="Tamaño",
    unidad_venta=UnidadesDeMedida.objects.get(nombre_completo="Unidad"),
    vendible_por_medida_real=False,
    punto_reorden=10
)

variante_grande = ProductosElaboradosVariantes.objects.create(
    producto_elaborado=pan_integral,
    nombre_variante="Grande",
    SKU="PAN-INT-GRA",
    precio_venta_usd=4.00,
    cantidad_variante=500,  # 500g
    atributo="Tamaño",
    unidad_venta=UnidadesDeMedida.objects.get(nombre_completo="Unidad"),
    vendible_por_medida_real=False,
    punto_reorden=15
)
```

---

### 2. Creating Production Lots for Variants

```python
from apps.inventario.models import LotesProductosElaborados
from datetime import date, timedelta

# Create a lot for the "Grande" variant
lote = LotesProductosElaborados.objects.create(
    produccion_origen=produccion_instance,  # Your Produccion object
    producto_elaborado_variante=variante_grande,
    cantidad_inicial_lote=50,  # 50 units produced
    stock_actual_lote=50,
    fecha_caducidad=date.today() + timedelta(days=7),
    coste_total_lote_usd=100.00,
    peso_total_lote_gramos=25000,  # 50 units × 500g = 25kg
    estado="DISPONIBLE"
)

# Stock is automatically updated via signal!
# variante_grande.stock_actual will now be 50
```

---

### 3. Querying Variants and Their Stock

```python
# Get all variants of a product
pan_integral = ProductosElaborados.objects.get(nombre_producto="Pan Integral")
variantes = pan_integral.variantes.all()

for variante in variantes:
    print(f"{variante.nombre_variante}: {variante.stock_actual} units")

# Get variant with specific SKU
variante = ProductosElaboradosVariantes.objects.get(SKU="PAN-INT-GRA")

# Check availability
if variante.check_product_availability(10):
    print("Stock available!")

# Get total stock across all variants
total_stock = sum(v.stock_actual for v in pan_integral.variantes.all())
```

---

### 4. Creating Product Bundles

```python
from apps.inventario.models import GruposProductosElaborados
from apps.core.models import Grupos

# Create a bundle/group
desayuno_combo = Grupos.objects.create(
    nombre_grupo="Combo Desayuno",
    descripcion="Pan, jugo y croissant",
    cantidad=1,
    unidad=UnidadesDeMedida.objects.get(nombre_completo="Unidad")
)

# Add variants to the bundle
GruposProductosElaborados.objects.create(
    producto_elaborado_variante=variante_grande,  # Pan Integral Grande
    grupo=desayuno_combo,
    cantidad=1,
    descripcion="1 pan integral grande"
)

GruposProductosElaborados.objects.create(
    producto_elaborado_variante=jugo_naranja_500ml,  # Different product!
    grupo=desayuno_combo,
    cantidad=1,
    descripcion="1 jugo de naranja 500ml"
)

GruposProductosElaborados.objects.create(
    producto_elaborado_variante=croissant_chocolate,  # Another product!
    grupo=desayuno_combo,
    cantidad=2,
    descripcion="2 croissants de chocolate"
)
```

---

### 5. Consuming Stock (FEFO - First Expired First Out)

```python
# Consume stock from a variant
variante = ProductosElaboradosVariantes.objects.get(SKU="PAN-INT-GRA")

try:
    lotes_consumidos = variante.consume_product_stock(
        cantidad=10,
        price=variante.precio_venta_usd
    )
    
    # Returns list of consumed lots
    for detalle in lotes_consumidos:
        print(f"Consumed {detalle['cantidad_consumida']} from lot {detalle['lote_producto_elaborado'].id}")
        
except ValidationError as e:
    print(f"Error: {e}")
```

---

### 6. Checking Low Stock

```python
# Get all variants with low stock
low_stock_variants = ProductosElaboradosVariantes.objects.filter(
    stock_actual__lte=models.F('punto_reorden'),
    stock_actual__gt=0
)

for variante in low_stock_variants:
    print(f"⚠️ {variante} - Stock: {variante.stock_actual}, Reorder Point: {variante.punto_reorden}")

# Get out-of-stock variants
out_of_stock = ProductosElaboradosVariantes.objects.filter(stock_actual=0)
```

---

### 7. Getting Lot Information

```python
# Get all lots for a variant
variante = ProductosElaboradosVariantes.objects.get(SKU="PAN-INT-GRA")
lotes = variante.lotes.filter(estado="DISPONIBLE").order_by('fecha_caducidad')

for lote in lotes:
    print(f"Lot {lote.id}:")
    print(f"  Stock: {lote.stock_actual_lote}")
    print(f"  Expires: {lote.fecha_caducidad}")
    print(f"  Unit Cost: ${lote.costo_unitario_usd}")
    print(f"  Avg Weight: {lote.peso_promedio_por_unidad}g")

# Get next lot to expire (FEFO)
next_lot = variante.get_closest_expire_lot_producto()
```

---

### 8. Updating Stock Manually (Triggers Signal)

```python
# Update lot stock (signal will update variant stock automatically)
lote = LotesProductosElaborados.objects.get(id=123)
lote.stock_actual_lote = 30  # Reduced from 50
lote.save()

# Variant stock is automatically recalculated!
# No need to manually update variante.stock_actual
```

---

### 9. Querying with Optimization

```python
# Efficient query with related data
variantes = ProductosElaboradosVariantes.objects.select_related(
    'producto_elaborado',
    'producto_elaborado__categoria',
    'unidad_venta'
).prefetch_related(
    'lotes'
).filter(
    producto_elaborado__es_intermediario=False
)

# Get products with their variants
productos = ProductosElaborados.objects.prefetch_related(
    'variantes',
    'variantes__lotes'
).filter(
    es_intermediario=False
)

for producto in productos:
    print(f"\n{producto.nombre_producto}:")
    for variante in producto.variantes.all():
        print(f"  - {variante.nombre_variante}: {variante.stock_actual} units")
```

---

### 10. Handling Variant Overrides

```python
# Variant can override base product settings
variante = ProductosElaboradosVariantes.objects.get(SKU="PAN-INT-GRA")

# Get effective sales unit (variant's or base product's)
unidad_venta = variante.get_effective_unidad_venta()

# Get effective pricing method
vendible_por_medida = variante.get_effective_vendible_por_medida_real()

# Example: Variant with different sales unit
variante_especial = ProductosElaboradosVariantes.objects.create(
    producto_elaborado=pan_integral,
    nombre_variante="Por Peso",
    SKU="PAN-INT-PESO",
    precio_venta_usd=8.00,  # per kg
    cantidad_variante=1000,  # 1kg
    atributo="Cantidad",
    # Override base product settings
    unidad_venta=UnidadesDeMedida.objects.get(nombre_completo="Kilogramo"),
    vendible_por_medida_real=True,  # Price calculated at sale
    punto_reorden=5
)
```

---

### 11. Validation Examples

```python
# This will FAIL - intermediate products can't have pricing
try:
    masa_base = ProductosElaborados.objects.create(
        nombre_producto="Masa Base",
        es_intermediario=True,
        # ... other fields
    )
    
    variante = ProductosElaboradosVariantes.objects.create(
        producto_elaborado=masa_base,
        nombre_variante="Estándar",
        precio_venta_usd=5.00,  # ❌ This will raise ValidationError
    )
    variante.full_clean()
except ValidationError as e:
    print(f"Error: {e}")

# This will FAIL - final products must have pricing
try:
    variante = ProductosElaboradosVariantes.objects.create(
        producto_elaborado=pan_integral,  # es_intermediario=False
        nombre_variante="Sin Precio",
        precio_venta_usd=None,  # ❌ This will raise ValidationError
    )
    variante.full_clean()
except ValidationError as e:
    print(f"Error: {e}")
```

---

### 12. Reporting Queries

```python
from django.db.models import Sum, Count, Avg, F

# Total stock value per product
productos_con_valor = ProductosElaborados.objects.annotate(
    total_stock=Sum('variantes__stock_actual'),
    total_value=Sum(F('variantes__stock_actual') * F('variantes__precio_venta_usd')),
    num_variantes=Count('variantes')
).filter(
    es_intermediario=False
)

for producto in productos_con_valor:
    print(f"{producto.nombre_producto}:")
    print(f"  Variants: {producto.num_variantes}")
    print(f"  Total Stock: {producto.total_stock}")
    print(f"  Total Value: ${producto.total_value}")

# Variants expiring soon
from datetime import date, timedelta
expiring_soon = LotesProductosElaborados.objects.filter(
    fecha_caducidad__lte=date.today() + timedelta(days=3),
    fecha_caducidad__gt=date.today(),
    estado="DISPONIBLE"
).select_related(
    'producto_elaborado_variante',
    'producto_elaborado_variante__producto_elaborado'
)

for lote in expiring_soon:
    print(f"⏰ {lote.producto_elaborado_variante} - Lot {lote.id}")
    print(f"   Expires: {lote.fecha_caducidad}, Stock: {lote.stock_actual_lote}")
```

---

### 13. Migration from Old Structure

```python
# If you have existing data, create default variants
from apps.inventario.models import ProductosElaborados, ProductosElaboradosVariantes

for producto in ProductosElaborados.objects.filter(es_intermediario=False):
    # Check if variant already exists
    if not producto.variantes.exists():
        ProductosElaboradosVariantes.objects.create(
            producto_elaborado=producto,
            nombre_variante="Estándar",
            SKU=producto.SKU if hasattr(producto, 'SKU') else None,
            precio_venta_usd=producto.precio_venta_usd if hasattr(producto, 'precio_venta_usd') else None,
            stock_actual=producto.stock_actual if hasattr(producto, 'stock_actual') else 0,
            punto_reorden=producto.punto_reorden if hasattr(producto, 'punto_reorden') else 0,
            cantidad_variante=1,
            atributo="Cantidad"
        )
        print(f"✅ Created default variant for {producto.nombre_producto}")
```

---

## Django Admin Integration

```python
# admin.py
from django.contrib import admin
from apps.inventario.models import (
    ProductosElaborados, 
    ProductosElaboradosVariantes,
    LotesProductosElaborados,
    GruposProductosElaborados
)

class VariantesInline(admin.TabularInline):
    model = ProductosElaboradosVariantes
    extra = 1
    fields = ['nombre_variante', 'SKU', 'precio_venta_usd', 'stock_actual', 'punto_reorden']
    readonly_fields = ['stock_actual']

@admin.register(ProductosElaborados)
class ProductosElaboradosAdmin(admin.ModelAdmin):
    list_display = ['nombre_producto', 'categoria', 'es_intermediario', 'get_total_stock']
    inlines = [VariantesInline]
    
    def get_total_stock(self, obj):
        return sum(v.stock_actual for v in obj.variantes.all())
    get_total_stock.short_description = 'Total Stock'

@admin.register(ProductosElaboradosVariantes)
class VariantesAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'SKU', 'precio_venta_usd', 'stock_actual', 'punto_reorden']
    list_filter = ['producto_elaborado', 'atributo']
    search_fields = ['nombre_variante', 'SKU', 'producto_elaborado__nombre_producto']
    readonly_fields = ['stock_actual']

@admin.register(LotesProductosElaborados)
class LotesAdmin(admin.ModelAdmin):
    list_display = ['id', 'producto_elaborado_variante', 'fecha_caducidad', 'stock_actual_lote', 'estado']
    list_filter = ['estado', 'fecha_caducidad']
    search_fields = ['producto_elaborado_variante__nombre_variante']
```

---

## REST API Serializers (Django REST Framework)

```python
# serializers.py
from rest_framework import serializers
from apps.inventario.models import ProductosElaborados, ProductosElaboradosVariantes

class VarianteSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto_elaborado.nombre_producto', read_only=True)
    unidad_venta_efectiva = serializers.CharField(source='get_effective_unidad_venta', read_only=True)
    
    class Meta:
        model = ProductosElaboradosVariantes
        fields = [
            'id', 'producto_elaborado', 'producto_nombre', 'nombre_variante',
            'SKU', 'precio_venta_usd', 'stock_actual', 'punto_reorden',
            'cantidad_variante', 'atributo', 'unidad_venta_efectiva'
        ]
        read_only_fields = ['stock_actual']

class ProductoConVariantesSerializer(serializers.ModelSerializer):
    variantes = VarianteSerializer(many=True, read_only=True)
    total_stock = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductosElaborados
        fields = [
            'id', 'nombre_producto', 'descripcion', 'categoria',
            'es_intermediario', 'variantes', 'total_stock'
        ]
    
    def get_total_stock(self, obj):
        return sum(v.stock_actual for v in obj.variantes.all())
```

---

## Tips & Best Practices

1. **Always use variants**: Even for products with a single variant, create one variant record
2. **Let signals handle stock**: Don't manually update `stock_actual` on variants
3. **Use transactions**: Wrap stock operations in `transaction.atomic()`
4. **Prefetch related data**: Use `select_related` and `prefetch_related` for performance
5. **Validate before save**: Always call `full_clean()` before saving
6. **Use FEFO**: Let the system handle lot selection automatically
7. **Monitor expiration**: Set up cron jobs to check expiring lots
8. **Index properly**: Add database indexes for frequently queried fields

---

**Last Updated**: 2026-01-25
