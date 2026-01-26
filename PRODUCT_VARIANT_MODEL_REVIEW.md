# Product Variant Model - Database Design Review & Implementation

## Date: 2026-01-25

## Overview
Successfully refactored the database design to support a **Product Variant Model** for the Bakery System. The design now properly supports variants at the stock management level while maintaining backward compatibility.

---

## ✅ Critical Issues Fixed

### 1. **Removed Duplicate Model Definitions**
- **Problem**: Two identical `ProductosElaborados` models (lines 425-497 and 500-561)
- **Problem**: Two identical `LotesProductosElaborados` models (lines 581-636 and 638-692)
- **Solution**: Removed the duplicate definitions, keeping only the variant-aware versions

### 2. **Stock Management at Variant Level**
- **Problem**: `ProductosElaboradosVariantes` didn't inherit stock management capabilities
- **Solution**: Made `ProductosElaboradosVariantes` inherit from `ProductosStockManagement`
- **Result**: Variants now have full stock tracking, FEFO lot management, and availability checking

### 3. **Lot-Variant Relationship**
- **Problem**: `LotesProductosElaborados` referenced `producto_elaborado` instead of variants
- **Solution**: Updated to reference `producto_elaborado_variante` exclusively
- **Result**: Each lot is now properly associated with a specific variant

---

## 🎯 Design Decisions (Based on User Requirements)

1. **Stock at Variant Level**: ✅ Implemented
   - Each variant manages its own stock independently
   - Base products aggregate stock from all their variants
   - Products with only one variant simply have one record

2. **Optional Variants**: ✅ Supported
   - Products can have one or multiple variants
   - Single-variant products work seamlessly

3. **No Variants for Intermediates**: ✅ Enforced
   - Validation prevents intermediate products from having sellable variants
   - Constraint in `ProductosElaboradosVariantes.clean()`

4. **Mixed Bundles**: ✅ Enabled
   - `GruposProductosElaborados` can contain variants from different base products
   - Example: "Breakfast Combo" with bread, juice, and pastry variants

---

## 📊 Updated Models

### **ProductosElaborados** (Base Product)
```python
class ProductosElaborados(ComponentesStockManagement, ProductosStockManagement):
    # Template/configuration for products
    # NO stock fields (moved to variants)
    # NO pricing fields (moved to variants)
    # Defines production settings shared by all variants
```

**Key Fields**:
- `nombre_producto`: Product name
- `unidad_produccion`: Production unit
- `tipo_medida_fisica`: PESO/VOLUMEN/UNIDAD
- `es_intermediario`: Boolean flag
- `categoria`: Product category

**Removed Fields** (now in variants):
- ~~`SKU`~~ → Moved to variant
- ~~`precio_venta_usd`~~ → Moved to variant
- ~~`stock_actual`~~ → Moved to variant
- ~~`punto_reorden`~~ → Moved to variant

---

### **ProductosElaboradosVariantes** (Sellable SKUs)
```python
class ProductosElaboradosVariantes(ProductosStockManagement):
    # Inherits: actualizar_product_stock(), check_product_availability(), 
    #           get_closest_expire_lot_producto(), consume_product_stock()
```

**Key Features**:
- ✅ Inherits `ProductosStockManagement` for full stock capabilities
- ✅ Unique constraint on `(producto_elaborado, nombre_variante)`
- ✅ Can override base product's `unidad_venta` and `vendible_por_medida_real`
- ✅ Validates intermediate products can't have pricing
- ✅ Validates final products must have pricing

**New Fields**:
- `cantidad_variante`: Defines the variant (e.g., 6 for 6-pack, 500 for 500g)
- `atributo`: Type of differentiation (CANTIDAD, TAMAÑO, SABOR, COLOR)
- `unidad_venta`: Optional override of base product's sales unit
- `vendible_por_medida_real`: Optional override of pricing method

**Helper Methods**:
- `get_effective_unidad_venta()`: Returns variant's or base product's unit
- `get_effective_vendible_por_medida_real()`: Returns variant's or base product's pricing method

---

### **GruposProductosElaborados** (Bundles)
```python
class GruposProductosElaborados(models.Model):
    # Junction table for product bundles
```

**Key Features**:
- ✅ References `producto_elaborado_variante` (not base product)
- ✅ Unique constraint on `(producto_elaborado_variante, grupo)`
- ✅ `cantidad` field: How many of this variant in the bundle
- ✅ Supports mixed variants from different base products

**Use Case Example**:
```
Grupo: "Breakfast Combo"
├── Pan Integral (variant: Grande) × 1
├── Jugo Naranja (variant: 500ml) × 1
└── Croissant (variant: Chocolate) × 2
```

---

### **LotesProductosElaborados** (Batch Tracking)
```python
class LotesProductosElaborados(models.Model):
    # Tracks production batches for specific variants
```

**Key Changes**:
- ✅ References `producto_elaborado_variante` (not base product)
- ✅ `related_name='lotes'` on variant FK
- ✅ Updated `clean()` to access `tipo_medida_fisica` through variant
- ✅ Improved `__str__()` to show variant information
- ✅ Added Meta class with ordering by expiration date

---

## 🔄 Updated Stock Management

### **ProductosStockManagement** (Abstract Base)

**Enhanced Methods**:

1. **`actualizar_product_stock()`**
   ```python
   # Now supports three types:
   - ProductosReventa → queries LotesProductosReventa
   - ProductosElaborados → aggregates from all variant lots
   - ProductosElaboradosVariantes → queries lots for specific variant
   ```

2. **`get_closest_expire_lot_producto()`**
   ```python
   # FEFO (First Expired, First Out) logic:
   - ProductosReventa → earliest expiring lot
   - ProductosElaborados → earliest from any variant
   - ProductosElaboradosVariantes → earliest for this variant only
   ```

3. **`_get_display_name()`**
   ```python
   # Enhanced to show variant info:
   "Pan Integral - Grande" (for variants)
   ```

---

## 📡 Signal Handlers

### **New: `update_producto_elaborado_variante_stock`**
```python
@receiver([post_save, post_delete], sender=LotesProductosElaborados)
def update_producto_elaborado_variante_stock(sender, instance, **kwargs):
    # Automatically updates variant stock when lots change
    # Expires old lots
    # Triggers low-stock notifications
```

**Triggers**:
- When a lot is created (production)
- When a lot is updated (stock consumption)
- When a lot is deleted

**Actions**:
1. Expires lots past their expiration date
2. Recalculates variant's `stock_actual` from available lots
3. Checks for low-stock and out-of-stock notifications

---

## 🏗️ Database Schema Summary

```
ProductosElaborados (Base Product - Template)
    ├── ProductosElaboradosVariantes (Sellable SKUs)
    │   ├── LotesProductosElaborados (Batch tracking)
    │   └── GruposProductosElaborados (Bundle membership)
    │       └── Grupos (Bundle definition)
```

**Relationships**:
- `ProductosElaborados` 1:N `ProductosElaboradosVariantes`
- `ProductosElaboradosVariantes` 1:N `LotesProductosElaborados`
- `ProductosElaboradosVariantes` N:M `Grupos` (through `GruposProductosElaborados`)

---

## 🎨 Design Patterns Used

1. **Template Pattern**: Base product as template, variants as implementations
2. **Inheritance**: Variants inherit stock management from abstract base
3. **Signal-Driven Updates**: Automatic stock synchronization
4. **FEFO Inventory**: First-Expired-First-Out lot consumption
5. **Flexible Overrides**: Variants can override base product settings

---

## 📋 Next Steps / Recommendations

### **Immediate Actions Required**:

1. **Create Django Migration**
   ```bash
   python manage.py makemigrations inventario
   python manage.py migrate inventario
   ```

2. **Update Serializers** (if using DRF)
   - Create `ProductosElaboradosVariantesSerializer`
   - Update `ProductosElaboradosSerializer` to include `variantes` nested field
   - Update `LotesProductosElaboradosSerializer` to use `producto_elaborado_variante`

3. **Update Views/ViewSets**
   - Add CRUD endpoints for variants
   - Update production views to create lots with variant reference
   - Update sales views to consume stock from variants

4. **Update Admin Interface**
   - Register `ProductosElaboradosVariantes` in admin
   - Add inline variant editor in `ProductosElaborados` admin
   - Update `LotesProductosElaborados` admin to show variant

5. **Data Migration** (if existing data)
   ```python
   # Create default variant for each existing product
   for producto in ProductosElaborados.objects.all():
       ProductosElaboradosVariantes.objects.create(
           producto_elaborado=producto,
           nombre_variante="Estándar",
           precio_venta_usd=producto.precio_venta_usd,  # if exists
           SKU=producto.SKU,  # if exists
           stock_actual=producto.stock_actual,  # if exists
           punto_reorden=producto.punto_reorden,  # if exists
       )
   ```

### **Testing Checklist**:

- [ ] Create product with single variant
- [ ] Create product with multiple variants
- [ ] Create production lot for specific variant
- [ ] Verify stock updates automatically
- [ ] Test FEFO consumption from variant
- [ ] Create bundle with mixed variants
- [ ] Test lot expiration handling
- [ ] Verify notifications for low stock
- [ ] Test intermediate product validation
- [ ] Test final product pricing validation

### **Performance Considerations**:

1. **Add Database Indexes**:
   ```python
   class Meta:
       indexes = [
           models.Index(fields=['producto_elaborado', 'nombre_variante']),
           models.Index(fields=['SKU']),
           models.Index(fields=['stock_actual']),
       ]
   ```

2. **Optimize Queries**:
   - Use `select_related('producto_elaborado')` when querying variants
   - Use `prefetch_related('variantes')` when querying base products
   - Use `prefetch_related('lotes')` for stock calculations

---

## ✨ Benefits of This Design

1. **Flexibility**: Supports both single and multi-variant products
2. **Scalability**: Easy to add new variant types
3. **Accuracy**: Stock tracked at the most granular level
4. **Traceability**: Each lot tied to specific variant
5. **Business Logic**: Enforces intermediate vs final product rules
6. **Bundles**: Flexible grouping across product lines
7. **Maintainability**: Clean separation of concerns
8. **Performance**: Automatic stock updates via signals

---

## 🚨 Breaking Changes

**APIs/Views that need updates**:
- Production creation (must specify variant)
- Sales/consumption (must specify variant)
- Stock queries (query variants, not base products)
- Reporting (aggregate from variants)

**Frontend Changes Required**:
- Product selection UI (show variants)
- Production forms (variant selector)
- Sales forms (variant selector)
- Inventory displays (show per-variant stock)

---

## 📞 Support

For questions or issues with this implementation:
1. Check the model docstrings for detailed field explanations
2. Review the signal handlers for automatic behavior
3. Test with sample data before production deployment
4. Consider gradual rollout with feature flags

---

**Status**: ✅ **READY FOR MIGRATION**

All critical issues resolved. The design is sound and follows Django best practices.
