import { POSCartPanelClientSelect } from "./POSCartPanelClientSelect";
import { POSCartPanelCartItems } from "./POSCartPanelCartItems";
import { POSCartItemPanelTotals } from "./POSCartItemPanelTotals";
import type { WatchSetValue } from "../types/types";
import { RoundToTwo } from "@/utils/utils";
export const POSCartPanel = ({watch, setValue}: WatchSetValue) => {

    const handleSetCliente = (clienteId: number) => {
      if (setValue) setValue('cliente', clienteId)
    }

    const handleSetTotals = (total_usd: number, tasa_cambio: number) => {
      const iva = (1 + 0.16)
      if (setValue) {
        setValue('monto_total_usd', RoundToTwo(total_usd * iva));
        setValue('monto_total_ves', RoundToTwo(total_usd * tasa_cambio * iva))
        setValue('tasa_cambio_aplicada', RoundToTwo(tasa_cambio))
      }
    }
    return (
        <div className="flex w-80 flex-col border-r border-border bg-card">
          {/* Client selector */}
          <POSCartPanelClientSelect onSetCliente={handleSetCliente}/>

          {/* Cart items */}
          <POSCartPanelCartItems watch={watch} setValue={setValue}/>

          {/* Total and actions */}
          <POSCartItemPanelTotals onSetTotals={handleSetTotals}/>
        </div>
    )
}