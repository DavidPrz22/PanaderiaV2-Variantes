import { Search, X } from "lucide-react";
import { ProductSelectorModal } from "./ProductSelectorModal";
import type { searchItemVariante, watchSetvalueTypeProduction } from "../types/types";
import { Label } from "@/components/ui/label";
import { useProductionContext } from "@/context/ProductionContext";
import { Dialog, DialogTrigger } from "@/components/ui/dialog"; // Import DialogTrigger

import { useComponentsProductionQuery } from "../hooks/queries/ProductionQueries";
import { useToast } from "@/utils/use-toast";
import { useEffect,  } from "react";

type ProductSelectorModalTriggerProps = {
  openModal: boolean;
  setOpenModal: (open: boolean) => void;
  selectedProduct: searchItemVariante;
}

export const ProductSelectorModalTrigger = ({
  openModal,
  setOpenModal,
  selectedProduct,
  setValue,
}: ProductSelectorModalTriggerProps & watchSetvalueTypeProduction) => {

  const { setSelectedProduct, setProductoId } = useProductionContext();

      const { toast } = useToast();
      const { isError, error, isFetching } = useComponentsProductionQuery();

  
      useEffect(() => {
          if (isError && !isFetching && error ) {
              const errorMessage = (error as any)?.response?.data?.message || error?.message || "Error al cargar los componentes";
              toast({
                  title: "Error al cargar los componentes",
                  description: errorMessage,
                  variant: "destructive",
              });
          }
      }, [isError, error, toast, isFetching]);

  const handleSelectProduct = (variant: searchItemVariante) => {
    
    if (setValue) setValue('producto_variante_id', variant.id);
    
    setSelectedProduct(variant);
    setProductoId(variant.id);
    setOpenModal(false);
  
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (setValue) setValue('producto_variante_id', null);
    setSelectedProduct(null);
    setProductoId(null);
  }

  return (
    <div className="flex flex-1 flex-col gap-2 w-full relative">
      <Label className="text-md font-semibold">Producto a Producir</Label>

      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogTrigger asChild>
          <div className="flex items-center h-14 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm cursor-pointer hover:bg-accent/50 transition-colors pr-10">
            <Search className="h-4 w-4 text-muted-foreground mr-2" />
            {selectedProduct ? (
              <span className="text-foreground">{selectedProduct.nombre_variante}</span>
            ) : (
              <span className="text-muted-foreground">Busca un producto...</span>
            )}
          </div>
        </DialogTrigger>

        {selectedProduct && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-4/6 -translate-y-1/2 z-10 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        <ProductSelectorModal
          onSelectProduct={handleSelectProduct}
        />
      </Dialog>
    </div>
  );
};