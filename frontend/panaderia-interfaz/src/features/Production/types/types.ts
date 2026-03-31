import type { UseFormHandleSubmit, UseFormWatch } from "react-hook-form";
import type { UseFormSetValue } from "react-hook-form";
import type { TProductionFormData } from "../schemas/schemas";

export type childrenProp = {
  children: React.ReactNode;
};

export type ProductionType = "producto-final" | "producto-intermedio";

export type searchItemVariante = {
  id: number;
  nombre_variante: string;
  SKU: string;
  atributo: string;
}

export type searchItem = { 
  producto_id: number; 
  nombre_producto: string; 
  unidad_produccion: {
    id: number;
    nombre_completo: string;
  }, 
  categoria: string,
  variantes: searchItemVariante[]
};

export type RecetaComponenteProduccion = {
  id: number;
  nombre: string;
  unidad_medida: string;
  stock: number;
  cantidad: number;
  tipo?: "MateriaPrima" | "ProductoIntermedio";
  isAdditional?: boolean; // Flag to identify additional components
};

export type ComponentesLista = RecetaComponenteProduccion[];

export type subreceta = {
  nombre: string;
  componentes: ComponentesLista;
};

export type subrecetasLista = subreceta[];

export type componentesRecetaProducto = {
  componentes: ComponentesLista;
  subrecetas: subrecetasLista;
  rendimiento?: number;
  // Optional flags from backend to determine how to scale production quantities
  // If "es_por_unidad" is true OR "medida_produccion" equals "Unidad" (case-insensitive),
  // the UI will scale component quantities by the production amount. Otherwise, it won't.
  medida_produccion?: string; // e.g., "Unidad", "Kg", etc.
  es_por_unidad?: boolean;
  tipo_medida_fisica?: "UNIDAD" | "PESO" | "VOLUMEN";
};

export type watchSetvalueTypeProduction = {
  watch?: UseFormWatch<TProductionFormData>;
  setValue?: UseFormSetValue<TProductionFormData>;
  onSubmit?: UseFormHandleSubmit<TProductionFormData>;
};

export type watchSetvalueTypeProductionWithSubmit = watchSetvalueTypeProduction & {
  onSubmit: UseFormHandleSubmit<TProductionFormData>;
};

export type componentesSearchItem = {
  id: number;
  nombre: string;
  tipo: "MateriaPrima" | "ProductoIntermedio";
  stock: number;
  unidad_medida: string;
};

export type newComponentItem = {
  id: number;
  nombre: string;
  tipo: "MateriaPrima" | "ProductoIntermedio";
  cantidad: number;
  stock: number;
  unidad_medida: string;
  invalid?: boolean;
};

export type componentesSearchList = {
  [categoria: string]: componentesSearchItem[];
};


export type ProductionComponentDetail = {
  materia_prima_consumida: string | null;
  producto_intermedio_consumido: string | null;
  cantidad_consumida: string;
  unidad_medida: string;
};

export type ProductionDetails = {
  id: number;
  producto_produccion: string;
  cantidad_producida: string;
  unidad_medida_produccion: string;
  fecha_produccion: string;
  fecha_expiracion: string;
  costo_total_componentes_usd: string;
  componentes_produccion: ProductionComponentDetail[];
  usuario_produccion: string;
};
