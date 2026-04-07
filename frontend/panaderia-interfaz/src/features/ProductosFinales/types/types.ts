import type {
  FieldErrors,
  Path,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import type { TProductoFinalSchema } from "../schemas/schemas";

export type ProductoFinal = {
  id: number;
  nombre_producto: string;
  categoria_nombre: string;
  unidad_venta_nombre: string;
  unidad_produccion_nombre: string;
  fecha_creacion_registro: string;
  stock_actual: number;
};

export type ProductosFinalesList = ProductoFinal[];

export type receta_relacionada =
  | {
    id: number;
    nombre: string;
  }
  | false;

export type VariantesProductoFinal = {
  id: number;
  nombre_variante: string;
  SKU: string;
  precio_venta_divisa: string;
  precio_venta_local: string;
  stock_actual: number;
  punto_reorden: number;
  atributo: string;
  descripcion: string;
};

export type ProductoFinalDetalles = {
  id: number;
  nombre_producto: string;
  categoria_producto: { id: number; nombre_categoria: string };
  unidad_produccion_producto: { id: number; nombre_completo: string };
  unidad_venta_producto: { id: number; nombre_completo: string } | null;
  tipo_medida_fisica: "UNIDAD" | "PESO" | "VOLUMEN";
  descripcion: string;
  fecha_creacion_registro: string;
  receta_relacionada: receta_relacionada | null;
  vendible_por_medida_real: boolean;
  usado_en_transformaciones: boolean;
  variantes: VariantesProductoFinal[];
  stock_actual: number;
  punto_reorden: number;
};

export type InputType = "text" | "number" | "textarea";

export type PFFormInputContainerProps = {
  inputType: InputType;
  title: string;
  name: Path<TProductoFinalSchema>;
  register: UseFormRegister<TProductoFinalSchema>;
  errors: FieldErrors;
  optional?: boolean;
  search?: boolean;
  initialData?: receta_relacionada;
};

export type setValueProps = {
  setValue?: UseFormSetValue<TProductoFinalSchema>;
};

export type ProductosFinalesFormSharedProps = {
  title: string;
  isUpdate?: boolean;
  initialData?: ProductoFinalDetalles;
  onClose: () => void;
  onSubmitSuccess: () => void;
};

export type PFFormSelectContainerProps = {
  title: string;
  name: Path<TProductoFinalSchema>;
  register: UseFormRegister<TProductoFinalSchema>;
  errors: FieldErrors;
  optional?: boolean;
  children: React.ReactNode;
};

export type CategoriaProductoFinal = {
  id: number;
  nombre_categoria: string;
};

export type UnidadesDeMedida = {
  id: number;
  nombre_completo: string;
  abreviatura?: string;
  tipo_medida?: string;
};

export type recetasSearchItem = {
  id: number;
  nombre: string;
};

export type PFFormInputProps = {
  typeInput: InputType;
  name: Path<TProductoFinalSchema>;
  placeholder?: string;
  register: UseFormRegister<TProductoFinalSchema>;
};


export type watchSetValueProps = {
  watch?: UseFormWatch<TProductoFinalSchema>;
  setValue?: UseFormSetValue<TProductoFinalSchema>;
};

export type LotesProductosFinales = {
  id: number;
  fecha_produccion: string;
  fecha_caducidad: string;
  cantidad_inicial_lote: string;
  stock_actual_lote: string;
  coste_total_lote_divisa: string;
  coste_total_lote_local: string;
  estado: "DISPONIBLE" | "INACTIVO" | "EXPIRADO" | "AGOTADO";
  produccion_origen: number;
  peso_total_lote_gramos: string | null;
  volumen_total_lote_ml: string | null;
  peso_promedio_por_unidad: number | null;
  volumen_promedio_por_unidad: number | null;
  costo_unitario_divisa: number;
};

export type ProductosFinalesPagination = {
  count: number;
  next: string | null;
  previous: string | null;
  results: ProductoFinal[];
};

export type LoteProductoFinalPagination = {
  count: number;
  next: string | null;
  previous: string | null;
  results: LotesProductosFinales[];
};