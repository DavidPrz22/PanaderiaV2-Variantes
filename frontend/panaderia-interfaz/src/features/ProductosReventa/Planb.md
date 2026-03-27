# 🥖 Recipe Management Module: Premium Implementation Plan

## 🌟 Overview
Create a high-end, intuitive module for recipe creation and management. This module will serve as the "brain" of the production process, linking raw materials (Materia Prima) and intermediate products (Productos Intermedios) to final product variants through precise formulations.

## 🎨 Design Vision (Premium & Modern)
- **Aesthetics**: Sleek dark mode support, glassmorphism effects for cards, and a vibrant color palette (Emerald for ingredients, Amber for intermediate products).
- **Typography**: Using `Outfit` or `Inter` for maximum readability and a premium tech feel.
- **Micro-animations**: Smooth layout transitions using Framer Motion when adding/removing ingredients.
- **Feedback**: Real-time validation and progress indicators.

---

## 🏗️ Module Architecture

### 1. Core Structure
- **Container**: `RecipeFormContainer.tsx` (Handles TanStack Query state and shell).
- **Sections**:
  - `GeneralInfoSection`: Focus on Recipe Name, Target Product/Variant, and Notes.
  - `YieldSection`: Dynamic "Rendimiento" calculator with unit synchronization.
  - `IngredientsModule`: Advanced component selection and list management.
  - `RelationsModule`: Semantic linking to other recipes.

---

## 📝 Functional Components Breakdown

### A. Dynamic General Information
- **Linked Product Picker**: A searchable dropdown that allows selecting a Product + Specific Variant.
- **Smart Notes**: Rich-text support for preparation steps.

### B. The "Smart" Yield Field (Rendimiento)
- **Logic**: When a Product is selected, the unit for Yield is automatically pulled from the product's Base Unit.
- **Design**: A numeric input paired with a Styled Badge for the unit.

### C. Advanced Ingredients Module (Components)
- **Selection Engine**:
  - Combined search for `Materia Prima` and `Producto Intermedio`.
  - Results grouped by category with visual badges (e.g., [MP] for Raw Material, [PI] for Intermediate).
  - Multi-select capability.
- **Ingredient Card**:
  - Dynamic Unit display based on the selected component.
  - Quick-edit amount field with inline validation.
  - "Cost Impact" indicator (visual representation of ingredient weight in the recipe).

### D. Related Recipes & Dependency Graph
- **Inter-recipe Connectivity**: Ability to link "Sub-recipes" (Intermediate products) directly.
- **Visual Feedback**: A list of selected relations with quick-access links to view those recipes.

---

## 🛠️ Technical implementation

### 1. Data Schema (Zod)
```typescript
const IngredientSchema = z.object({
  id: z.string(),
  type: z.enum(['MateriaPrima', 'ProductoIntermedio']),
  variantId: z.string().optional(),
  cantidad: z.number().positive(),
  unidad: z.string(),
});

const RecipeSchema = z.object({
  nombre: z.string().min(3),
  productoTargetId: z.string(),
  varianteTargetId: z.string().optional(),
  rendimiento: z.number().positive(),
  unidadRendimiento: z.string(),
  ingredientes: z.array(IngredientSchema),
  recetasRelacionadas: z.array(z.string()),
  notas: z.string().optional(),
});
```

### 2. State & Persistence
- **Form Engine**: `react-hook-form` for complex array management.
- **API Cache**: `TanStack Query` for instant lookups and optimistic updates.
- **UX Polish**: Implementation of `react-beautiful-dnd` for reordering ingredients.

---

## 🚀 Development Phases

1. **Phase 1: Foundation**: Setup Zod schema and basic form layout with `GeneralInfo`.
2. **Phase 2: Selection Engine**: Build the unified Search/Dropdown for components with variant support.
3. **Phase 3: The List Manager**: Implement the ingredients list with amount fields and unit badges.
4. **Phase 4: Relations**: Add the related recipes search and list.
5. **Phase 5: Polish & Wow**: Add Framer Motion animations, tooltips, and final visual adjustments for a "Lovable" experience.
