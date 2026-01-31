import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type {
  TMateriaPrimaSchema,
  TLoteMateriaPrimaSchema,
} from "@/features/MateriaPrima/schemas/schemas";

import type { ReactNode, MouseEvent } from "react";
import type { TMateriaPrimaList } from "../schemas/zod-types";


export interface SidebarCardProps {
  children: ReactNode;
  icon: string;
  onclick: (e: MouseEvent<HTMLDivElement>) => void;
  link?: string;
  id?: string;
  dropdownContained?: boolean;
}

export type childrenProp = {
  children: ReactNode;
};


export type InputType = "text" | "number" | "textarea";

export type MateriaPrimaFormInputContainerProps = {
  inputType: InputType;
  title: string;
  name: keyof TMateriaPrimaSchema;
  register: UseFormRegister<TMateriaPrimaSchema>;
  errors: FieldErrors<TMateriaPrimaSchema>;
  optional?: boolean;
};

export type MateriaPrimaFormSelectContainerProps = {
  title: string;
  name: keyof TMateriaPrimaSchema;
  register: UseFormRegister<TMateriaPrimaSchema>;
  errors: FieldErrors<TMateriaPrimaSchema>;
  children: ReactNode;
  optional?: boolean;
};

type LotesStatus = "DISPONIBLE" | "INACTIVO" | "EXPIRADO" | "AGOTADO";

export type LoteMateriaPrima = {
  id: number;
  fecha_recepcion: string;
  fecha_caducidad: string;
  cantidad_recibida: number;
  stock_actual_lote: number;
  costo_unitario_usd: number;
  proveedor: string;
  estado: LotesStatus;
};

export type Proveedor = {
  id?: number;
  nombre_proveedor: string;
  apellido_proveedor: string;
  nombre_comercial: string;
  email_contacto: string;
  telefono_contacto: string;
  fecha_creacion_registro: string;
  usuario_registro: number | null;
  notas: string | null;
};

export type LotesMateriaPrimaFormInputContainerProps = {
  inputType: InputType;
  title: string;
  name: keyof TLoteMateriaPrimaSchema;
  register: UseFormRegister<TLoteMateriaPrimaSchema>;
  errors: FieldErrors<TLoteMateriaPrimaSchema>;
  optional?: boolean;
};

export type LotesMateriaPrimaFormSelectContainerProps = {
  title: string;
  name: keyof TLoteMateriaPrimaSchema;
  register: UseFormRegister<TLoteMateriaPrimaSchema>;
  errors: FieldErrors<TLoteMateriaPrimaSchema>;
  children: ReactNode;
};

export type LoteMateriaPrimaFormResponse = {
  id?: number;
  materia_prima: number;
  proveedor: Proveedor;
  fecha_recepcion: Date;
  fecha_caducidad: Date;
  cantidad_recibida: number;
  stock_actual_lote: number;
  costo_unitario_usd: number;
  detalle_oc: number | null;
  estado: LotesStatus;
};

export type emptyLoteMateriaPrima = {
  materia_prima: number;
  empty: true;
};

export type LoteMateriaPrimaFormSumit = {
  id?: number;
  materia_prima: number;
  proveedor_id: number;
  fecha_recepcion: Date;
  fecha_caducidad: Date;
  cantidad_recibida: number;
  stock_actual_lote: number;
  costo_unitario_usd: number;
  detalle_oc: number | null;
};

export type LotesMateriaPrimaFormSharedProps = {
  isUpdate?: boolean;
  initialData?: LoteMateriaPrimaFormResponse;
  onClose: () => void;
  onSubmitSuccess: () => void;
  title: string;
};

export type LoteMateriaPrimaPagination = {
  count: number;
  next: string | null;
  previous: string | null;
  results: LoteMateriaPrimaFormResponse[];
};

export type MateriaPrimaList = TMateriaPrimaList;

export type MateriaPrimaPagination = {
  count: number;
  next: string | null;
  previous: string | null;
  results: TMateriaPrimaList[];
};
