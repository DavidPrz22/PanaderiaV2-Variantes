# Optimización y Estructuración del Módulo de Productos Finales

Este plan detalla la implementación y reestructuración del módulo de Productos Finales para asegurar un CRUD completo, mejorar la mantenibilidad, reutilización de código y la experiencia de usuario, siguiendo la estructura y patrones establecidos en el módulo de Productos Intermedios.

## 1. Arquitectura del Frontend (Estructura de Carpetas)
Asegurar la siguiente estructura imitando a la carpeta `ProductosIntermedios`:
- **`api/`**: Peticiones al servidor.
- **`components/`**: Componentes de UI (formularios, paneles, tablas).
- **`hooks/`**: Custom hooks (queries y mutations).
- **`pages/`**: Componentes de nivel de página.
- **`routes/`**: Configuración de enrutamiento.
- **`types/`**: Tipados de TypeScript.
- **`utils/`**: Funciones utilitarias.

## 2. Refactorización y Creación de Formularios (Frontend)

### Componentes del Formulario
Crear formularios de creación y edición utilizando componentes globales compartidos (`FormInput`, `FormSelect`, modales, etc.):
- **Gestión de Campos Específicos**:
  - `vendible_por_medida_real` (Booleano): Lógica para marcar en `true` si la unidad de venta es peso o volumen, y `false` si es por unidad.
  - `tipo_medida_fisica`: Selector/Lógica para indicar si es unidad, peso o volumen.
  - `usado_en_transformaciones`: Checkbox para indicar su uso en procesos de fabricación.

## 3. Capa de Datos y API (Frontend)

### Servicios API y Hooks
- Crear servicios API completos para las peticiones HTTP al servidor (CRUD).
- Crear hooks de mutación (`useCreateProductoFinal`, `useUpdateProductoFinal`, `useDeleteProductoFinal`) y hooks de lectura (queries).
- Manejar los estados de éxito y error utilizando notificaciones tipo Toast.
- Integrar la validación de permisos de usuario para habilitar, deshabilitar o restringir acciones y vistas.

## 4. Vistas de Lista, Detalles y Lotes (Frontend)

### Componentes de Visualización
- **Vista de Tabla (Listado)**: 
  - Renderizar modelo basado en los siguientes campos: `id`, `nombre_producto`, `unidad_produccion`, `categoria`, `stock_actual`, `unidad_venta`, `fecha_creacion_registro`.
- **Panel Lateral de Detalles**: 
  - Mostrar todos los campos requeridos: `nombre_producto`, `descripcion`, `precio_venta_usd`, `unidad_venta`, `unidad_produccion`, `categoria`, `variantes`, `tipo_medida_fisica`, `estado`, `usado_en_transformaciones`, `fecha_creacion_registro`.
- **Gestión de Lotes**:
  - Crear un componente de tabla para lotes.
  - Incluir un panel de detalles de lote para acciones específicas: eliminar, activar e inactivar lote (respetando los niveles de permiso).

## 5. Implementación del Backend (Django)

### Serializadores y Campos
- **Separación de Contextos**: Crear serializadores diferentes para el listado básico y el detalle complejo.
  - **Campos para la Tabla (Listado)**: `['id', 'nombre_producto', 'unidad_produccion', 'categoria', 'stock_actual', 'unidad_venta', 'fecha_creacion_registro']`.
  - **Campos para Detalles**: `['nombre_producto', 'descripcion', 'precio_venta_usd', 'unidad_venta', 'unidad_produccion', 'categoria', 'variantes', 'tipo_medida_fisica', 'estado', 'usado_en_transformaciones', 'fecha_creacion_registro']`.

### ViewSets y Endpoints
- Construir los ViewSets necesarios para soportar creación, actualización y obtención de lista y detalle de Productos Finales.
- Determinar dinámicamente qué serializador retornar (dependiendo del tipo de solicitud `retrieve`, `list`, `create`).

## 6. Validación y Tipado (Zod/TypeScript)

- Emplear `zod` para asegurar que los datos de respuesta del servidor cumplan con las mismas reglas de validación utilizadas en Productos Intermedios.
- Establecer interfaces/tipos en TypeScript rigurosos para la data de los formularios y las respuestas del servidor.

---

## Criterios de Éxito
1. El módulo de Productos Finales está completamente funcional.
2. Cada operación del CRUD opera correctamente de un extremo al otro (Backend a Frontend).
3. Se respeta rígidamente la misma estructura arquitectónica y estándares visuales de `ProductsIntermedios`.
4. Extensa reutilización de hooks globales, tipos y componentes genéricos de UI.
5. Los casos de error están debidamente atajados e informados a través de notificaciones (Toasts).
6. Los permisos de usuario dictan las acciones permitidas a nivel granular (especialmente en gestión de productos y lotes).