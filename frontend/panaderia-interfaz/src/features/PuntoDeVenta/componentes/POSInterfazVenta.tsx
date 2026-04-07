import { useState } from "react";
import { POSProductPanel } from "./POSProductPanel";
import { POSCartPanel } from "./POSCartPanel";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ventaSchema, type TVenta } from "../schemas/schemas";
import { usePOSContext } from "@/context/POSContext";
import { CheckoutScreen } from "./POSCheckout/CheckoutScreen";
import { useCreateVentaMutation } from "../hooks/mutations/mutations";
import { ClosePOSButton } from "./ClosePOSButton";
import { useAuth } from "@/context/AuthContext"
import { userHasPermission } from "@/features/Authentication/lib/utils"

export default function POSInterfazVenta() {
    const [isProcessing, setIsProcessing] = useState(false);
    const { user } = useAuth();
    const hasPermission = userHasPermission(user!, "punto_venta", "edit");

    const { watch, setValue, handleSubmit } = useForm({
        resolver: zodResolver(ventaSchema),
        defaultValues: {
            pagos: [{
                metodo_pago: 'efectivo',
                monto_pago_usd: 0,
                monto_pago_ves: 0,
                referencia_pago: undefined,
                cambio_efectivo_usd: undefined,
                cambio_efectivo_ves: undefined,
            }]
        }
    });

    console.log(watch());
    const { showCheckout, setShowCheckout, setCarrito, setSelectedPaymentMethod } = usePOSContext();
    const { mutateAsync: createVenta } = useCreateVentaMutation();

    const handleBackToCart = () => {
        setShowCheckout(false);
    };

    const handleCompleteCheckout = async (data: TVenta) => {
        setIsProcessing(true);
        try {
            await createVenta(data);
            setShowCheckout(false);
            setCarrito([]); // Clear cart after successful checkout
            setSelectedPaymentMethod('efectivo');
        } catch (error) {
            console.error('Error al crear la venta:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSubmitForm = () => {
        handleSubmit(handleCompleteCheckout, (errors) => console.log("Validation Errors:", errors))();
    }

    return (
        <div className="flex min-h-screen w-full bg-background">

            {hasPermission && !showCheckout && <ClosePOSButton />}

            {showCheckout ? (
                <CheckoutScreen
                    watch={watch}
                    setValue={setValue}
                    onBack={handleBackToCart}
                    onComplete={handleSubmitForm}
                    isProcessing={isProcessing}
                />
            ) :
                <div className="flex flex-1">
                    <POSCartPanel watch={watch} setValue={setValue} />
                    <POSProductPanel />
                </div>
            }
        </div>
    )
}