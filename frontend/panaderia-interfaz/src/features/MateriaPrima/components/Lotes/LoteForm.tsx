import { useMemo } from "react";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { useMateriaPrimaContext } from "@/context/MateriaPrimaContext";
import { loteMateriaPrimaSchema, type TLoteMateriaPrimaSchema } from "../../schemas/schemas";
import { useCreateUpdateLoteMateriaPrimaMutation } from "../../hooks/mutations/materiaPrimaMutations";
import { useMateriaPrimaDetallesQuery } from "../../hooks/queries/materiaPrimaqueries";
import { useProveedoresQuery } from "@/hooks/useQueryHooks";
import { FormInput, FormSelect, FormDatePicker } from "@/components/shared";
import type { TLoteMateriaPrima } from "../../schemas/zod-types";

interface LoteFormProps {
    initialData?: TLoteMateriaPrima;
    onClose: () => void;
    onSuccess: () => void;
}

export const LoteForm = ({ initialData, onClose, onSuccess }: LoteFormProps) => {

    const { materiaprimaId } = useMateriaPrimaContext();
    const { data: materiaprimaDetalles } = useMateriaPrimaDetallesQuery(materiaprimaId!);


    const { data: proveedores = [], isLoading: isLoadingProveedores } = useProveedoresQuery();

    const formValues = useMemo(() => {
        if (initialData) {
            return {
                proveedor_id: initialData.proveedor.id ?? 0,
                variante_materia_prima: initialData.variante_materia_prima.id,
                fecha_recepcion: new Date(initialData.fecha_recepcion),
                fecha_caducidad: new Date(initialData.fecha_caducidad),
                cantidad_recibida: initialData.cantidad_recibida,
                costo_unitario_local: initialData.costo_unitario_local, // Mocking local cost with usd as API doesn't seem to have both
                costo_unitario_divisa: initialData.costo_unitario_divisa,
            };
        }
        return {
            proveedor_id: 0,
            variante_materia_prima: 0,
            fecha_recepcion: new Date(),
            fecha_caducidad: new Date(),
            cantidad_recibida: 0,
            costo_unitario_local: 0,
            costo_unitario_divisa: 0,
        };
    }, [initialData]);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<TLoteMateriaPrimaSchema>({
        resolver: zodResolver(loteMateriaPrimaSchema),
        values: formValues,
    });

    const isUpdate = !!initialData;

    const { mutateAsync: createUpdateLoteMateriaPrima, isPending: isSubmitting } = useCreateUpdateLoteMateriaPrimaMutation(materiaprimaId!);


    const onSubmit = async (data: TLoteMateriaPrimaSchema) => {
        if (isUpdate) {
            await createUpdateLoteMateriaPrima({ data, id: initialData?.id });
        } else {
            await createUpdateLoteMateriaPrima({ data });
        }
        onSuccess();
        reset();
    };

    const unidadBase = materiaprimaDetalles?.unidad_medida_base?.abreviatura || "";

    const proveedorOptions = useMemo(() => proveedores.map((p) => ({
        value: p.id || 0,
        label: p.nombre_comercial || `${p.nombre_proveedor} ${p.apellido_proveedor}`,
    })), [proveedores]);

    const varianteOptions = useMemo(() => materiaprimaDetalles?.variantes?.map((v) => ({
        value: v.id || 0,
        label: v.nombre_variante,
    })) || [], [materiaprimaDetalles]);

    return (
        <div className="h-full bg-background flex flex-col">
            {/* Header */}
            <div className="border-b">
                <div className="flex items-center gap-4 w-4xl max-w-4xl mx-auto p-6">
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">
                            {isUpdate ? "Editar Lote" : "Nuevo Lote de Compra"}
                        </h2>
                        <p className="text-sm text-muted-foreground font-medium">
                            {materiaprimaDetalles?.nombre}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 w-4xl max-w-4xl mx-auto overflow-y-auto">
                <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Proveedor */}
                        {isLoadingProveedores ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 border rounded-xl bg-muted/20 animate-pulse">
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                Cargando proveedores...
                            </div>
                        ) : (
                            <FormSelect
                                label="Proveedor"
                                required
                                value={watch("proveedor_id")}
                                onValueChange={(value) => setValue("proveedor_id", parseInt(value), { shouldValidate: true })}
                                options={proveedorOptions}
                                triggerClassName="w-full"
                                placeholder="Seleccionar proveedor"
                                error={errors.proveedor_id?.message}
                            />
                        )}

                        {/* Variante */}
                        <FormSelect
                            label="Presentación / Variante"
                            required
                            value={watch("variante_materia_prima")}
                            onValueChange={(value) => setValue("variante_materia_prima", parseInt(value), { shouldValidate: true })}
                            options={varianteOptions}
                            triggerClassName="w-full"
                            placeholder="Seleccionar variante"
                            error={errors.variante_materia_prima?.message}
                        />
                    </div>

                    <div className="h-px bg-border/60" />

                    {/* Dates Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Fecha Recepción */}
                        <FormDatePicker
                            label="Fecha de Recepción"
                            required
                            selected={watch("fecha_recepcion")}
                            onSelect={(date) => date && setValue("fecha_recepcion", date, { shouldValidate: true })}
                            error={errors.fecha_recepcion?.message}
                        />


                        {/* Fecha Caducidad */}
                        <FormDatePicker
                            label="Fecha de Caducidad"
                            required
                            selected={watch("fecha_caducidad")}
                            onSelect={(date) => date && setValue("fecha_caducidad", date, { shouldValidate: true })}
                            error={errors.fecha_caducidad?.message}
                        />
                    </div>

                    <div className="h-px bg-border/60" />

                    {/* Cantidad Recibida */}
                    <FormInput
                        label={`Cantidad Recibida (${unidadBase.toUpperCase()})`}
                        required
                        error={errors.cantidad_recibida?.message}
                        type="number"
                        step="0.01"
                        min="0"
                        {...register("cantidad_recibida", { valueAsNumber: true })}
                        placeholder="0.00"
                    />

                    {/* Costs Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Costo Unitario Divisa */}
                        <FormInput
                            label={`Costo Unitario Divisa (${unidadBase.toUpperCase()})`}
                            required
                            error={errors.costo_unitario_divisa?.message}
                            type="number"
                            step="0.01"
                            min="0"
                            {...register("costo_unitario_divisa", { valueAsNumber: true })}
                            placeholder="0.00"
                        />

                        {/* Costo Unitario Local */}
                        <FormInput
                            label={`Costo Unitario Local (${unidadBase.toUpperCase()})`}
                            required
                            type="number"
                            step="0.01"
                            min="0"
                            {...register("costo_unitario_local", { valueAsNumber: true })}
                            placeholder="0.00"
                            error={errors.costo_unitario_local?.message}
                        />
                    </div>

                    {/* Submit */}
                    <div className="pt-8 pb-4">
                        <Button type="submit" className="w-full h-12 text-base bg-(--button-primary-color) hover:bg-(--button-primary-hover-color) cursor-pointer font-bold shadow-xl " disabled={isSubmitting}>
                            {isSubmitting ? (
                                <Loader2 className="h-5 w-5 mr-3 animate-spin border-primary-foreground" />
                            ) : (
                                <Save className="h-5 w-5 mr-3" />
                            )}
                            {isSubmitting ? "Guardando..." : isUpdate ? "Actualizar Lote" : "Registrar Entrada de Lote"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};


