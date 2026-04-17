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

export const CategoriaProductoReventaSchema = z.object({
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

export const ClienteSchema = z.object({
    id: z.number(),
    nombre_cliente: z.string(),
    apellido_cliente: z.string().nullable(),
    email: z.string().nullable(),
    telefono: z.string().nullable(),
    fecha_registro: z.string(),
    notas: z.string().nullable(),
});

export const MetodoDePagoSchema = z.object({
    id: z.number(),
    nombre_metodo: z.string(),
    requiere_referencia: z.boolean(),
});

export const EmpaquetadoProductosSchema = z.object({
    id: z.number(),
    empaque: z.number(),
    empaque_nombre: z.string(),
    cantidad_por_contenedor: z.coerce.number(),
    unidad_medida: z.number(),
    unidad_medida_abreviatura: z.string(),
    cantidad_unidad_medida: z.coerce.number(),
});

export type TUnidadMedida = z.infer<typeof UnidadMedidaSchema>;
export type TCategoriaMateriaPrima = z.infer<typeof CategoriaMateriaPrimaSchema>;
export type TCategoriaProductoIntermedio = z.infer<typeof CategoriaProductoIntermedioSchema>;
export type TCategoriaProductoFinal = z.infer<typeof CategoriaProductoFinalSchema>;
export type TCategoriaProductoReventa = z.infer<typeof CategoriaProductoReventaSchema>;
export type TProveedor = z.infer<typeof ProveedorSchema>;
export type TAtributosProductos = z.infer<typeof AtributosProductosSchema>;
export type TCliente = z.infer<typeof ClienteSchema>;
export type TMetodoDePago = z.infer<typeof MetodoDePagoSchema>;
export type TEmpaquetadoProducto = z.infer<typeof EmpaquetadoProductosSchema>;