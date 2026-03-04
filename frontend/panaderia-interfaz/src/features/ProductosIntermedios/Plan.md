# Optimización y Estructuración de Productos Intermedios

Este plan detalla la reestructuración del módulo de Productos Intermedios para mejorar la mantenibilidad, reutilización de código y la experiencia de usuario, siguiendo los patrones establecidos en el módulo de Materia Prima.

## 1. Refactorización de Formularios (Frontend)

### Extraer Secciones de Formulario
Refactorizar `ProductosIntermediosForm.tsx` dividiéndolo en componentes más pequeños dentro de `components/form-sections/`:
- **`FormHeader.tsx`**: Título, descripción y botón de cierre.
- **`GeneralInformation.tsx`**: Campos de Nombre, Categoría, Unidad de Producción y Descripción.
- **`VariantesSection.tsx`**: Gestión del array de variantes (`useFieldArray`) y renderizado de ítems.
- **`ActionBar.tsx`**: Botones de acción (Guardar, Cancelar) con estados de carga.

### Estandarización de Componentes
- Sustituir todos los inputs manuales por componentes compartidos de `src/components/shared`:
  - `FormInput`
  - `FormSelect`
  - `FormTextarea`
- Asegurar que `ProductoIntermedioVarianteForm.tsx` también utilice estos componentes.

## 2. Capa de Datos y API (Frontend)

### Servicios API
- Crear `api/productoIntermedioApi.ts`:
  - `getProductosIntermedios`: Listado con filtros.
  - `getProductIntermedioById`: Detalles de un producto.
  - `createProductoIntermedio`: POST con variantes anidadas.
  - `updateProductoIntermedio`: PATCH/PUT con gestión de variantes.
  - `deleteProductoIntermedio`: Eliminación lógica o física.

### Hooks de Mutación y Consulta
- Crear en `hooks/mutations/`:
  - `useCreateProductoIntermedio`: Invalidar queries de lista al éxito.
  - `useUpdateProductoIntermedio`: Invalidar lista y detalles.
  - `useDeleteProductoIntermedio`: Manejar confirmación y navegación.
- Refinar queries en `hooks/queries/` para soportar búsqueda y filtrado dinámico.

## 3. Vistas de Lista y Detalles (Frontend)

### Componentes de Visualización
- **`ProductosIntermediosLista.tsx`**: Implementar tabla avanzada con:
  - Búsqueda por nombre/SKU.
  - Filtro por categoría.
  - Acciones rápidas (Ver detalles, Editar).
- **`ProductoIntermedioDetailsPanel.tsx`**: Panel lateral de detalles organizado en secciones:
  - Información general y estadísticas.
  - Tabla de Variantes.
  - Tabla de Lotes asociados (ordenados por caducidad).

## 4. Implementación del Backend (Django)

### Serializadores
- **`ProductoIntermedioVarianteSerializer`**: Manejo de datos de variantes.
- **`ProductoIntermedioSerializer`**: 
  - Soportar creación y actualización de variantes anidadas (`writable nested representation`).
  - Validación de lógica de negocio (ej: no permitir precios de venta en intermediarios).

### ViewSets y URLs
- **`ProductoIntermedioViewSet`**:
  - Filtrar por `es_intermediario=True`.
  - Implementar acciones para gestión de stock si es necesario.
- Registrar rutas en el sistema de URLs del inventario.

## 5. Validación y Tipado (Zod/TypeScript)

- Implementar validaciones personalizadas (ej: el SKU debe ser único, las cantidades deben ser positivas).
