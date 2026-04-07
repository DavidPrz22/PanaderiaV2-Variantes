import { Plus, Xmark } from "../../../assets/GeneralIcons/Index";
import { useProductionContext } from "@/context/ProductionContext";
import Button from "@/components/Button";
import { useEffect } from "react";
import { ProductionNewComponentDetails } from "./ProductionNewComponentDetails.tsx";
import { ProductionNewComponentSearch } from "./ProductionNewComponentSearch.tsx";
import type { RecetaComponenteProduccion, watchSetvalueTypeProduction } from "../types/types";

import "@/styles/animations.css";

export const ProductionNewComponentModal = ({setValue, watch}: watchSetvalueTypeProduction) => {
  const {
    showNewComponentModal,
    setShowNewComponentModal,
    isClosingModal,
    setIsClosingModal,
    invalidCantidadError,
    newComponentSelected,
    setComponentesBaseProduccion,
    componentesBaseProduccion,
    setNewComponentSelected,
    setShowToast,
    setToastMessage,
  } = useProductionContext();

  const handleClose = () => {
    setIsClosingModal(true);
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);


  if (!showNewComponentModal) return <></>;

  // handleClose defined above with useCallback

  const handleAnimationEnd = () => {
    if (isClosingModal) {
      setIsClosingModal(false);
      setShowNewComponentModal(false);
    }
  };

  const handleBackdropClick = (element: React.MouseEvent<HTMLDivElement>) => {
    if (element.target === element.currentTarget) handleClose();
  };

  const handleAddComponent = () => {
    // Logic to add the component
    if (!newComponentSelected) return;

    const componente: RecetaComponenteProduccion = {
      componente_id: newComponentSelected.componente_id,
      nombre: newComponentSelected.nombre,
      unidad_medida: newComponentSelected.unidad_medida,
      stock: newComponentSelected.stock,
      cantidad: newComponentSelected.cantidad,
      tipo: newComponentSelected.tipo,
      isAdditional: true, // Mark as additional component
    };
    setComponentesBaseProduccion([...componentesBaseProduccion, componente]);

    const componenteForma = {
      componente_id: newComponentSelected.componente_id,
      cantidad: newComponentSelected.cantidad,
      tipo: newComponentSelected.tipo,
    };

    const currentComponentes = watch && watch("componentes") || [] ;
    const registered = currentComponentes.findIndex(c => c.componente_id === componenteForma.componente_id)
    if (registered !== -1) {
      currentComponentes[registered].cantidad += componenteForma.cantidad
    } else {
      setValue?.("componentes", [...currentComponentes, componenteForma], {
      shouldValidate: true,
    });
    }
    
    // Show success toast
    setToastMessage(`${newComponentSelected.nombre} agregado exitosamente a la producción`);
    setShowToast(true);
    
    setNewComponentSelected(null);
    
    // Use the smooth animation system to close the modal
    handleClose();
  }

  return (
    <div
      className={`fixed top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-(--z-index-over-header-bar) ${isClosingModal ? "animate-fadeOutModal" : "animate-fadeInModal"}`}
      onClick={handleBackdropClick}
      onAnimationEnd={handleAnimationEnd}
    >
      <div
        className={`space-y-6 px-8 py-10 border border-gray-200 rounded-lg bg-white mt-6 shadow-md relative w-7/12 font-[Roboto] ${isClosingModal ? "animate-fadeOut" : "animate-fadeIn"}`}
      >
        <button
          className="absolute cursor-pointer top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors  duration-150"
          onClick={() => handleClose()}
        >
          <Xmark />
        </button>

        <div className="text-gray-800 font-bold">
          <Plus className="inline-block mr-2" />
          Selecciona un producto para ver sus componentes
        </div>

        <ProductionNewComponentSearch />

        <ProductionNewComponentDetails />

        <div className="flex justify-end gap-3">
          <Button type="cancel" onClick={() => setShowNewComponentModal(false)}>
            Cancelar
          </Button>
          <Button disabled={(invalidCantidadError === null || newComponentSelected?.invalid) ? true : invalidCantidadError} type="submit" onClick={handleAddComponent}>
            Agregar a Producción
          </Button>
        </div>
      </div>
    </div>
  );
};
