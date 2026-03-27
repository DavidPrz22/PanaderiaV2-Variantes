import type { ReactNode } from "react";
import type { TRecetaSchema } from "../schemas/schemas";
import type {
  FieldErrors,
  Path,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";

export type childrenType = {
  children: ReactNode;
};

export type RecetasFormInputProps = {
  register?: UseFormRegister<TRecetaSchema>;
  name?: Path<TRecetaSchema>;
  typeInput: string;
  placeholder?: string;
};

export type RecetasFormSearchInputProps = {
  typeInput: string;
  placeholder?: string;
  onChange?: (search: string) => void;
};

export type RecetasFormInputContainerProps = {
  register?: UseFormRegister<TRecetaSchema>;
  title: string;
  name?: Path<TRecetaSchema>;
  errors: FieldErrors<TRecetaSchema>;
  inputType: string;
  optional?: boolean;
  componenteBusqueda?: boolean;
  recetaBusqueda?: boolean;
  onChange?: (search: string) => void;
  placeholder?: string;
};


export type ComponentesListaPorCategoria = {
  [categoria: string]: componenteRecetaItem[];
}

export type componenteRecetaItem = {
  id: number;
  nombre: string;
  tipo: "MateriaPrima" | "ProductoIntermedio";
  unidad_medida: string;
};

export type componenteRecetaItemConCantidad = {
  id: number;
  nombre: string;
  tipo: "MateriaPrima" | "ProductoIntermedio";
  unidad_medida: string;
  cantidad: number;
};

export type RecetasSearchListContentProps = {
  category: string;
  items: componenteRecetaItem[];
};

export type productoElaboradoVariante = {
  id: number;
  nombre_variante: string;
  SKU: string;
};

export type productoElaboradoItem = {
  producto_id: number;
  nombre_producto: string;
  tipo: "ProductoIntermedio" | "ProductoFinal";
  unidad_produccion: string;
  variantes: productoElaboradoVariante[];
};

export type componenteListadosReceta = {
  id: number;
  componente_tipo: "MateriaPrima" | "ProductoIntermedio";
  nombre: string;
  unidad_medida: string;
  cantidad: number;
};

export type componenteListadosRecetaProps = {
  id_componente: number;
  componente_tipo: "MateriaPrima" | "ProductoIntermedio";
  nombre: string;
};

export type recetasComponentListProps = {
  nombre: string;
  type: "MateriaPrima" | "ProductoIntermedio";
  unidad_medida: string;
  id: number;
  cantidad: number;
  last?: boolean;
};

export type watchSetValueProps = {
  watch: UseFormWatch<TRecetaSchema>;
  setValue: UseFormSetValue<TRecetaSchema>;
};

export type RecetaInfo = {
  id: number;
  nombre: string;
  fecha_creacion: string;
  notas: string | null;
  esCompuesta: boolean;
  rendimiento?: number | null;
  producto_elaborado?: {
    id: number;
    nombre: string;
    unidad_medida: string;
  };
};

export type RecetaDetallesItemComponente = {
  id: number;
  nombre: string;
  tipo: "MateriaPrima" | "ProductoIntermedio";
  cantidad: number;
  unidad_medida: string;
};

export type RecetaDetalles = {
  receta: RecetaInfo;
  componentes: RecetaDetallesItemComponente[];
  relaciones_recetas: RecetaRelacionada[];
};

export type RecetaRelacionada = {
  id: number;
  nombre: string;
};

export type RecetaComponentsContainerProps = {
  watch: UseFormWatch<TRecetaSchema>;
  setValue: UseFormSetValue<TRecetaSchema>;
  errors: FieldErrors<TRecetaSchema>;
};

export type recetaListItemProps = {
  nombre: string;
  id: number;
  last?: boolean;
};

export type RecetaItem = {
  id: number;
  nombre: string;
  fecha_creacion: string;
};

export type RecetasPagination = {
  count: number;
  next: string | null;
  previous: string | null;
  results: RecetaItem[];
};

export type fechaSeleccionadaFiltro = {
  from: string;
  to: string;
};
