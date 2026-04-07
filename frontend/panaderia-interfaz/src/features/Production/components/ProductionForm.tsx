import { ProductionRegisterCard } from "./ProductionRegisterCard";
import { ProductionComponents } from "./ProductionComponents";
import { useForm } from "react-hook-form";
import { productionSchema, type TProductionFormData } from "../schemas/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductionNewComponentModal } from "@/features/Production/components/ProductionNewComponentModal";
import { Toast } from "@/components/Toast";
import { useProductionContext } from "@/context/ProductionContext";
import { useEffect } from "react";



export const ProductionForm = () => {
  const { watch, setValue, handleSubmit, setError, clearErrors, reset } = useForm<TProductionFormData>({
    resolver: zodResolver(productionSchema),
  });

  const { showToast, setShowToast, toastMessage, insufficientStock, setComponentesBaseProduccion, setInsufficientStock } = useProductionContext();

  // Reset function to clear form and production components
  const resetProduction = () => {
    reset();
    setComponentesBaseProduccion([]);
    setInsufficientStock(null);
  };
  console.log(watch())
  // Custom validation: check if any component quantity exceeds its stock
  useEffect(() => {
    const componentes = watch("componentes");
    if (!componentes || !insufficientStock) return;

    // Clear any previous stock-related errors
    componentes.forEach((_, index) => {
      clearErrors(`componentes.${index}.cantidad`);
    });

    // Set errors for components with insufficient stock
    if (insufficientStock.length > 0) {
      insufficientStock.forEach((insufficientComponent) => {
        const componentIndex = componentes.findIndex(c => c.componente_id === insufficientComponent.componente_id);
        if (componentIndex !== -1) {
          setError(`componentes.${componentIndex}.cantidad`, {
            type: "custom",
            message: `Stock insuficiente. Disponible: ${insufficientComponent.stock} ${insufficientComponent.unidad_medida}`
          });
        }
      });
    }
  }, [insufficientStock, watch, setError, clearErrors]);

  return (
    <>
      <ProductionRegisterCard setValue={setValue} watch={watch} />
      <ProductionComponents
        setValue={setValue}
        watch={watch}
        onSubmit={handleSubmit}
        resetProduction={resetProduction}
      />
      <ProductionNewComponentModal setValue={setValue} watch={watch} />
      <Toast
        open={showToast}
        message={toastMessage}
        severity="success"
        onClose={() => setShowToast(false)}
      />
    </>
  );
};
