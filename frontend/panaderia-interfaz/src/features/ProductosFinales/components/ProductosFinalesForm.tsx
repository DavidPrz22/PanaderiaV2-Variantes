import { useForm } from "react-hook-form";
import { productoFinalSchema, type TProductoFinalSchema, type TProductosFinalesVariantesSchema } from "../schemas/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormHeader } from "./form-sections/FormHeader";
import { GeneralInformation } from "./form-sections/GeneralInformation";
import { VariantesSection } from "./form-sections/VariantesSection";
import { useCreateUpdateProductoFinalMutation } from "../hooks/mutations/productosFinalesMutations";
import { ActionBar } from "./form-sections/ActionBar";
import { useProductosFinalesContext } from "@/context/ProductosFinalesContext";
import { useQuery } from "@tanstack/react-query";
import { productoFinalDetallesQueryOptions } from "../hooks/queries/productosFinalesQueryOptions";
import type { ProductoFinalDetalles } from "../types/types";

const createEmptyVariante = (): TProductosFinalesVariantesSchema => ({
    nombre_variante: "",
    SKU: "",
    descripcion: "",
    precio_venta_divisa: 0,
    precio_venta_local: 0,
    punto_reorden: 0,
    atributo: "CANTIDAD",
});

const initialFormState: TProductoFinalSchema = {
    nombre_producto: "",
    tipo_medida_fisica: "UNIDAD",
    categoria: 0,
    unidad_venta: 0,
    unidad_produccion: 0,
    descripcion: "",
    vendible_por_medida_real: false,
    usado_en_transformaciones: false,
    variantes: [createEmptyVariante()],
} as unknown as TProductoFinalSchema;

export const ProductosFinalesForm = () => {

    const getDefaultValuesUpdate = (producto: ProductoFinalDetalles): TProductoFinalSchema => {
        return {
            nombre_producto: producto.nombre_producto,
            tipo_medida_fisica: producto.tipo_medida_fisica.toUpperCase() as "UNIDAD" | "PESO" | "VOLUMEN",
            categoria: producto.categoria_producto.id,
            unidad_venta: producto.unidad_venta_producto?.id || 0,
            unidad_produccion: producto.unidad_produccion_producto.id,
            descripcion: producto.descripcion,
            vendible_por_medida_real: producto.vendible_por_medida_real,
            usado_en_transformaciones: producto.usado_en_transformaciones,
            variantes: producto.variantes.map(v => ({
                id: v.id,
                nombre_variante: v.nombre_variante,
                SKU: v.SKU || "",
                descripcion: v.descripcion || "",
                precio_venta_divisa: Number(v.precio_venta_divisa) || 0,
                precio_venta_local: Number(v.precio_venta_local) || 0,
                punto_reorden: v.punto_reorden || 0,
                atributo: v.atributo || "CANTIDAD",
            }))
        }
    };
    const { showProductoForm, updateProducto, productoId, setShowProductoForm, setUpdateProducto, setProductoId } = useProductosFinalesContext();
    
    const { mutate: createUpdateProducto, isPending } = useCreateUpdateProductoFinalMutation();

    const { data: producto } = useQuery({
        ...productoFinalDetallesQueryOptions(productoId!),
        enabled: !!(updateProducto && productoId)
    });

    const { handleSubmit, control, register, formState: { errors }, setValue, watch, reset } = useForm<TProductoFinalSchema>({
        resolver: zodResolver(productoFinalSchema),
        defaultValues: updateProducto && producto && productoId ? getDefaultValuesUpdate(producto) : initialFormState,
    });

    if (!showProductoForm) return <></>;

    const handleOnClose = () => {
        setShowProductoForm(false);
        setUpdateProducto(false);
        setProductoId(null);
        reset();
    };

    const onSubmit = (data: TProductoFinalSchema) => {
        if (updateProducto && productoId) {
            createUpdateProducto({ data, id: productoId }, {
                onSuccess: () => {
                    handleOnClose();
                }
            });
        } else {
            createUpdateProducto({ data }, {
                onSuccess: () => {
                    handleOnClose();
                }
            });
        }
    };

    const formId = "producto-final-form";

    return (
        <div className={`mx-auto bg-background flex flex-col`}>
            <FormHeader
                onClose={handleOnClose}
                title={updateProducto ? "Editar Producto Final" : "Nuevo Producto Final"}
                description={updateProducto ? "Modifique los campos del producto final" : "Complete los campos para registrar un nuevo producto final"}
            />

            <div className="flex-1 overflow-y-auto">
                <form
                    id={formId}
                    onSubmit={handleSubmit(onSubmit)}
                    className="p-8 space-y-6 max-w-4xl mx-auto flex flex-col min-h-full"
                >
                    <GeneralInformation
                        control={control}
                        register={register}
                        errors={errors}
                        setValue={setValue}
                        watch={watch}
                    />
                    <VariantesSection control={control} register={register} errors={errors} />
                </form>
            </div>
            <ActionBar onCancel={handleOnClose} isSubmitting={isPending} formId={formId} />
        </div>
    );
};
