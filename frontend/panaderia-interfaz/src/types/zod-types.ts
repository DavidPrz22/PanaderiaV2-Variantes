import { z } from 'zod';

export const UnidadMedidaSchema = z.object({
    id: z.number(),
    nombre_completo: z.string(),
    abreviatura: z.string(),
    descripcion: z.string().optional().nullable(),
    tipo_medida: z.enum(['Peso', 'Volumen', 'Unidad', 'Longitud', 'Otro']),
});

export const CategoriaMateriaPrimaSchema = z.object({
    id: z.number(),
    nombre_categoria: z.string(),
    descripcion: z.string().optional().nullable(),
});

export const CategoriaProductoIntermedioSchema = z.object({
    id: z.number(),
    nombre_categoria: z.string(),
    descripcion: z.string().optional().nullable(),
});

export const CategoriaProductoFinalSchema = z.object({
    id: z.number(),
    nombre_categoria: z.string(),
    descripcion: z.string().optional().nullable(),
});


export const ProveedorSchema = z.object({
    id: z.number(),
    nombre_proveedor: z.string(),
    apellido_proveedor: z.string().nullable(),
    nombre_comercial: z.string().nullable(),
    email_contacto: z.string().nullable(),
    telefono_contacto: z.string().nullable(),
    fecha_creacion_registro: z.string(),
    usuario_registro: z.number().nullable(),
    notas: z.string().nullable(),
});

export const AtributosProductosSchema = z.object({
    atributos: z.array(z.string()),
});


export type TUnidadMedida = z.infer<typeof UnidadMedidaSchema>;
export type TCategoriaMateriaPrima = z.infer<typeof CategoriaMateriaPrimaSchema>;
export type TCategoriaProductoIntermedio = z.infer<typeof CategoriaProductoIntermedioSchema>;
export type TCategoriaProductoFinal = z.infer<typeof CategoriaProductoFinalSchema>;
export type TProveedor = z.infer<typeof ProveedorSchema>;
export type TAtributosProductos = z.infer<typeof AtributosProductosSchema>;
