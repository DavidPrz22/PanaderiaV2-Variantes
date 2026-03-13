import { TitleDetails } from "@/components/TitleDetails";
import { PRLotesDetails } from "./PRLotesDetails";
import { CerrarIcon } from "@/assets/DashboardAssets";
import Button from "@/components/Button";
import { useProductosReventaContext } from "@/context/ProductosReventaContext";

export const PRLotesDetailsContainer = () => {
  const { setShowPRLotesDetalles } = useProductosReventaContext();
  return (
    <div className="flex flex-col gap-5 mx-8 border border-gray-200 p-5 pt-8 rounded-lg shadow-md h-full relative">
      <div className="absolute top-5 right-5">
        <Button type="close" onClick={() => setShowPRLotesDetalles(false)}>
          <img src={CerrarIcon} alt="Cerrar" />
        </Button>
      </div>
      <TitleDetails>INFORMACIÓN DEL LOTE</TitleDetails>
      <PRLotesDetails />
    </div>
  );
};