import { TitleDetails } from "@/components/TitleDetails";
import { ProductosReventaLoteDetails } from "./ProductosReventaLoteDetails";
import { CerrarIcon } from "@/assets/DashboardAssets";
import Button from "@/components/Button";
import { useProductosReventaContext } from "@/context/ProductosReventaContext";

export const ProductosReventaLoteDetailsContainer = () => {
  const { setShowPRLotesDetalles } = useProductosReventaContext();
  return (
    <div className="flex flex-col gap-6 mx-8 border border-gray-200 p-8 rounded-lg shadow-md h-full relative bg-white">
      <div className="absolute top-6 right-6">
        <Button type="close" onClick={() => setShowPRLotesDetalles(false)}>
          <img src={CerrarIcon} alt="Cerrar" className="size-5" />
        </Button>
      </div>
      <TitleDetails>INFORMACIÓN DEL LOTE</TitleDetails>
      <ProductosReventaLoteDetails />
    </div>
  );
};
