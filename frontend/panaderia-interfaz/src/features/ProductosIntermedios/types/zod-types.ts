import { z } from "zod";

export const productoIntermedioSchema = z.object({
    id: z.number().min(0),
    nombre_producto: z.string().min(3),
    unidad_produccion_nombre: z.string(),
    stock_actual: z.number().min(0),
    categoria_nombre: z.string().min(3),
    fecha_creacion_registro: z.string()
});

export const productosIntermediosPaginationSchema = z.object({
    count: z.number(),
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(productoIntermedioSchema)
});

export type TproductoIntermedio = z.infer<typeof productoIntermedioSchema>;
export type TproductosIntermediosPagination = z.infer<typeof productosIntermediosPaginationSchema>;

export const productoIntermedioDetallesSchema = z.object({
    id: z.number().min(0),
    nombre_producto: z.string().min(3),
    SKU: z.string().nullable().optional(),
    stock_actual: z.number().min(0),
    punto_reorden: z.number().min(0),
    categoria_producto: z.object({
        id: z.number(),
        nombre_categoria: z.string(),
    }),
    unidad_produccion_producto: z.object({
        id: z.number(),
        nombre_completo: z.string(),
    }),
    fecha_creacion_registro: z.string(),
    tipo_medida_fisica: z.enum(["UNIDAD", "PESO", "VOLUMEN"]),
    descripcion: z.string().nullable().optional(),
    receta_relacionada: z.object({
        id: z.number(),
        nombre: z.string(),
    }).nullable(),
});

export type TproductoIntermedioDetalles = z.infer<typeof productoIntermedioDetallesSchema>;

export const loteProductoIntermedioSchema = z.object({
    id: z.number(),
    producto_elaborado_variante: z.object({
        id: z.number(),
        nombre_variante: z.string(),
    }),
    fecha_produccion: z.string(),
    fecha_caducidad: z.string(),
    cantidad_inicial_lote: z.number(),
    stock_actual_lote: z.number(),
    coste_total_lote_usd: z.number(),
    estado: z.enum(["DISPONIBLE", "EXPIRADO", "AGOTADO", "INACTIVO"]),
    produccion_origen: z.number(),
    peso_total_lote_gramos: z.string().nullable(),
    volumen_total_lote_ml: z.string().nullable(),
    peso_promedio_por_unidad: z.number().nullable(),
    volumen_promedio_por_unidad: z.number().nullable(),
    costo_unitario_usd: z.number(),
});

export const loteProductoIntermedioPaginationSchema = z.object({
    count: z.number(),
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(loteProductoIntermedioSchema),
});

export type TloteProductoIntermedio = z.infer<typeof loteProductoIntermedioSchema>;
export type TloteProductoIntermedioPagination = z.infer<typeof loteProductoIntermedioPaginationSchema>;

