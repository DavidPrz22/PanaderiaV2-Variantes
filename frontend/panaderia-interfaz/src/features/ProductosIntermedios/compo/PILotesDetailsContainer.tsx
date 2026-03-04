import { TitleDetails } from "@/components/TitleDetails";
import { PILotesDetails } from "./PILotesDetails";
import { CerrarIcon } from "@/assets/DashboardAssets";
import Button from "@/components/Button";
import { useProductosIntermediosContext } from "@/context/ProductosIntermediosContext";

export const PILotesDetailsContainer = () => {
    const { setShowLotesDetalles } = useProductosIntermediosContext();
    return (
        <div className="flex flex-col gap-5 mx-8 border border-gray-200 p-5 pt-8 rounded-lg shadow-md h-full relative">
            <div className="absolute top-5 right-5">
              <Button type="close" onClick={() => setShowLotesDetalles(false)}>
                <img src={CerrarIcon} alt="Cerrar" />
              </Button>
            </div>
            <TitleDetails>INFORMACIÓN DEL LOTE</TitleDetails>
            <PILotesDetails />
        </div>
      );
};