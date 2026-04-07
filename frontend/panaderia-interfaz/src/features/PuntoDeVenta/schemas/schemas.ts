import { z } from "zod";
import { PAYMENT_METHODS } from "../utils/constants";

export const aperturaCajaSchema = z.object({
    monto_inicial_usd: z.number().min(1, "El monto debe ser mayor a 0").max(1000000, "El monto debe ser menor a 1000000"),
    monto_inicial_ves: z.number().min(1, "El monto debe ser mayor a 0").max(1000000, "El monto debe ser menor a 1000000"),
    notas_apertura: z.string().refine((value) => !value || value.length >= 3, "Por favor, ingresa notas").optional(),
});

export const cierreCajaSchema = z.object({
    notas_cierre: z.string().optional(),
});


// Ventas SCHEMA

const detalles = z.object({
    producto_elaborado_id: z.number().min(0, "Por favor, selecciona un producto").nullable(),
    producto_reventa_id: z.number().min(0, "Por favor, selecciona un producto").nullable(),
    cantidad: z.number().min(1, "La cantidad debe ser mayor a 0").max(1000000, "La cantidad debe ser menor a 1000000"),
    precio_unitario_usd: z.number().min(0, "El precio debe ser mayor a 0").max(1000000, "El precio debe ser menor a 1000000"),
    precio_unitario_ves: z.number().min(0, "El precio debe ser mayor a 0").max(1000000, "El precio debe ser menor a 1000000"),
    subtotal_linea_usd: z.number().min(0, "El subtotal debe ser mayor a 0").max(1000000, "El subtotal debe ser menor a 1000000"),
    subtotal_linea_ves: z.number().min(0, "El subtotal debe ser mayor a 0").max(1000000, "El subtotal debe ser menor a 1000000"),
})

const pagoSchema = z.object({
    metodo_pago: z.enum(PAYMENT_METHODS as [string, ...string[]]),
    monto_pago_usd: z.number().min(1, "El monto debe ser mayor a 0").max(1000000, "El monto debe ser menor a 1000000"),
    monto_pago_ves: z.number().min(1, "El monto debe ser mayor a 0").max(1000000, "El monto debe ser menor a 1000000"),
    referencia_pago: z.string().min(1, "Por favor, ingresa una referencia").optional(),
    cambio_efectivo_usd: z.number().min(0, "El cambio debe ser mayor a 0").max(1000000, "El cambio debe ser menor a 1000000").optional(),
    cambio_efectivo_ves: z.number().min(0, "El cambio debe ser mayor a 0").max(1000000, "El cambio debe ser menor a 1000000").optional(),
    cambio_pago_movil_usd: z.number().min(0, "El cambio debe ser mayor a 0").max(1000000, "El cambio debe ser menor a 1000000").optional(),
    cambio_pago_movil_ves: z.number().min(0, "El cambio debe ser mayor a 0").max(1000000, "El cambio debe ser menor a 1000000").optional(),
})

export const ventaSchema = z.object({
    cliente: z.number().min(1, "Por favor, selecciona un cliente"),
    monto_total_usd: z.number().min(1, "El monto debe ser mayor a 0").max(1000000, "El monto debe ser menor a 1000000"),
    monto_total_ves: z.number().min(1, "El monto debe ser mayor a 0").max(1000000, "El monto debe ser menor a 1000000"),
    tasa_cambio_aplicada: z.number().min(1, "La tasa debe ser mayor a 0").max(1000000, "La tasa debe ser menor a 1000000"),
    venta_detalles: z.array(detalles),
    pagos: z.array(pagoSchema),
})

export type TAperturaCaja = z.infer<typeof aperturaCajaSchema>;
export type TCierreCaja = z.infer<typeof cierreCajaSchema>;
export type TVenta = z.infer<typeof ventaSchema>