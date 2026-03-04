import type { ReactNode } from "react";
import type {
  FieldErrors,
  Path,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";
import type { TProductosIntermediosSchema } from "../schemas/schema";
import type { LotesEstados } from "@/types/types";

export type childrenProp = {
  children: ReactNode;
};

export type ProductosIntermediosFormSharedProps = {
  title: string;
  isUpdate?: boolean;
  initialData?: ProductosIntermediosDetalles;
  onClose: () => void;
  onSubmitSuccess: () => void;
};

export type InputType = "text" | "number" | "textarea";

export type PIFormInputContainerProps = {
  inputType: InputType;
  title: string;
  name: Path<TProductosIntermediosSchema>;
  register: UseFormRegister<TProductosIntermediosSchema>;
  errors: FieldErrors<TProductosIntermediosSchema>;
  optional?: boolean;
  search?: boolean;
};

export type PIFormInputProps = {
  register: UseFormRegister<TProductosIntermediosSchema>;
  name: Path<TProductosIntermediosSchema>;
  typeInput: InputType;
  placeholder?: string;
};

export type PIFormSelectContainerProps = {
  title: string;
  name: Path<TProductosIntermediosSchema>;
  register: UseFormRegister<TProductosIntermediosSchema>;
  errors: FieldErrors<TProductosIntermediosSchema>;
  children: ReactNode;
  optional?: boolean;
};

export type setValueProps = {
  setValue?: UseFormSetValue<TProductosIntermediosSchema>;
};

export type ProductosIntermedios = {
  id: number;
  nombre_producto: string;
  SKU: string;
  stock_actual: number;
  punto_reorden: number;
  categoria_nombre: string;
  unidad_produccion_nombre: string;
  fecha_creacion_registro: string;
};

export type VariantesIntermedio = {
  id: number;
  nombre_variante: string;
  SKU: string;
  stock_actual: number;
  punto_reorden: number;
  atributo: string;
  descripcion: string
}

export type ProductosIntermediosDetalles = {
  id: number;
  nombre_producto: string;
  stock_actual: number;
  punto_reorden: number;
  categoria_producto: {
    id: number;
    nombre_categoria: string
  };
  unidad_produccion_producto: {
    id: number;
    nombre_completo: string
  };
  variantes: VariantesIntermedio[];
  fecha_creacion_registro: string;
  descripcion: string;
  receta_relacionada?: {
    id: number;
    nombre: string;
  };
  tipo_medida_fisica: "UNIDAD" | "PESO" | "VOLUMEN";
};

export type LoteProductoIntermedio = {
  id: number;
  producto_elaborado_variante: {
    id: number;
    nombre_variante: string;
  };
  fecha_produccion: string;
  fecha_caducidad: string;
  cantidad_inicial_lote: number;
  stock_actual_lote: number;
  coste_total_lote_usd: number;
  estado: LotesEstados;
  produccion_origen: number;
  peso_total_lote_gramos: string | null;
  volumen_total_lote_ml: string | null;
  peso_promedio_por_unidad: number | null;
  volumen_promedio_por_unidad: number | null;
  costo_unitario_usd: number;
};

export type ProductosIntermediosPagination = {
  count: number;
  next: string | null;
  previous: string | null;
  results: ProductosIntermedios[];
};

export type LoteProductoIntermedioPagination = {
  count: number;
  next: string | null;
  previous: string | null;
  results: LoteProductoIntermedio[];
};

