# Plan de Refactorización: Materia Prima

Este plan detalla la migración de la funcionalidad de Materia Prima para utilizar los nuevos componentes y adaptarse al nuevo modelo de datos.

## Ubicación de Componentes y Recursos

- **Formulario de Creación/Edición**: `src/features/MateriaPrima/components/MateriaPrimaCreateForm.tsx` (Componente: `CreateMateriaPrimaPanel`)
- **Panel de Detalles**: `src/features/MateriaPrima/components/MateriaPrimaDetailsPanel.tsx` (Componente: `MateriaPrimaDetailsPanel`)
- **Tabla de Lotes**: `src/features/MateriaPrima/components/Lotes/LotesTableMP.tsx` (Componente: `LotesTableMP`)
- **Esquemas de Validación**: `src/features/MateriaPrima/schemas/schemas.ts`
- **Tipos TypeScript**: `src/features/MateriaPrima/types/types.ts`

## Pasos de Implementación

1. **Actualizar la Página Principal de Materias Primas**
   - Modificar el contenedor principal para integrar los nuevos componentes.
   - Reemplazar el uso actual del formulario por `CreateMateriaPrimaPanel`.
   - Reemplazar el panel de detalles actual por `MateriaPrimaDetailsPanel`.

2. **Configuración de Rutas**
   - Implementar la ruta `/new` para abrir directamente el formulario de creación.
   - Asegurar que la navegación sea fluida entre la lista, los detalles y el formulario.

3. **Migración de Funcionalidad de Edición**
   - Adaptar `CreateMateriaPrimaPanel` para manejar el estado de edición.
   - Cargar los datos existentes de la materia prima en el formulario al editar.
   - Asegurar que las variantes se carguen y puedan ser modificadas correctamente.

4. **Integración de la Tabla de Lotes**
   - Reemplazar la tabla de lotes genérica en el panel de detalles por `LotesTableMP`.
   - Asegurar que `LotesTableMP` reciba los props correctos desde el panel de detalles.

5. **Vinculación de Datos (API & React Query)**
   - Utilizar los hooks de React Query existentes para alimentar los componentes.
   - Mapear la respuesta de la API al formato esperado por los nuevos componentes.
   - Implementar las mutaciones necesarias para crear y actualizar (POST/PATCH).

6. **Validación y Tipado**
   - Validar que todos los componentes utilicen los tipos definidos en `types/types.ts`.
   - Aplicar las validaciones de Zod definidas en `schemas/schemas.ts` en los formularios.

7. **Limpieza y Pulido**
   - Eliminar cualquier uso de datos mock (`lotesMateriasPrimasMock`, etc.) dentro de los componentes.
   - Verificar la consistencia visual y la responsividad del nuevo diseño.

## Criterios de Aceptación

1. La página de materias primas utiliza exclusivamente los nuevos componentes.
2. Es posible crear, ver detalles y editar una materia prima con éxito.
3. La tabla de lotes muestra la información correcta y actualizada desde la API.
4. No hay errores de TypeScript ni de validación en los formularios.
5. Se ha eliminado por completo el uso de datos estáticos/mock.

## Restricciones

- **No modificar** la estructura actual de los endpoints de la API ni los hooks base de React Query a menos que sea estrictamente necesario para la compatibilidad con el nuevo modelo.
- Seguir las guías de diseño establecidas en el proyecto.
