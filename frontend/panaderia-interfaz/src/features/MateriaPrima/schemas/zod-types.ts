import { z } from 'zod';
import {
    UnidadMedidaSchema,
    CategoriaMateriaPrimaSchema,
    ProveedorSchema
} from '@/types/zod-types';


export const MateriaPrimaVarianteSchema = z.object({
    id: z.number(),
    nombre_variante: z.string(),
    unidad_compra: UnidadMedidaSchema,
    precio_compra_divisa: z.coerce.number().nullable().optional(),
    precio_compra_local: z.coerce.number().nullable().optional(),
    SKU_variante: z.string().nullable().optional(),
    nombre_empaque_estandar: z.string().nullable().optional(),
    cantidad_empaque_estandar: z.coerce.number().nullable().optional(),
    unidad_medida_empaque_estandar: UnidadMedidaSchema.nullable().optional(),
});

// Lighter schema for tables
export const MateriaPrimaListSchema = z.object({
    id: z.number(),
    nombre: z.string(),
    unidad_medida_base: UnidadMedidaSchema,
    categoria: CategoriaMateriaPrimaSchema,
    stock_actual: z.coerce.number(),
    punto_reorden: z.coerce.number(),
    fecha_creacion_registro: z.string(),
});

// Full schema for details
export const MateriaPrimaSchema = MateriaPrimaListSchema.extend({
    SKU: z.string().nullable().optional(),
    descripcion: z.string().nullable().optional(),
    variantes: z.array(MateriaPrimaVarianteSchema),
});

export const MateriaPrimaPaginationSchema = z.object({
    count: z.number(),
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(MateriaPrimaListSchema),
});

export const LoteMateriaPrimaSchema = z.object({
    id: z.number(),
    variante_materia_prima: MateriaPrimaVarianteSchema,
    proveedor: ProveedorSchema,
    fecha_recepcion: z.string(),
    fecha_caducidad: z.string(),
    cantidad_recibida: z.coerce.number(),
    costo_unitario_divisa: z.coerce.number(),
    stock_actual_lote: z.coerce.number(),
    costo_unitario_local: z.coerce.number(),
    estado: z.string(),
    activo: z.boolean(),
    detalle_oc: z.number().nullable().optional(),
});

export type TLoteMateriaPrima = z.infer<typeof LoteMateriaPrimaSchema>;

export type TMateriaPrimaVariante = z.infer<typeof MateriaPrimaVarianteSchema>;
export type TMateriaPrimaList = z.infer<typeof MateriaPrimaListSchema>;
export type TMateriaPrima = z.infer<typeof MateriaPrimaSchema>;
export type TMateriaPrimaPagination = z.infer<typeof MateriaPrimaPaginationSchema>;
