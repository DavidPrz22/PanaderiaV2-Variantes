import { createContext, useContext, useState } from "react";
import type { CarritoItem, TipoProducto } from "../features/PuntoDeVenta/types/types";
import type { PaymentMethod, SplitPayment } from "@/features/PuntoDeVenta/componentes/POSCheckout/shared/checkout-types";

type POSContextType = {
    POSEnabled: boolean;
    setPOSEnabled: (value: boolean) => void;
    openPOS: boolean;
    setOpenPOS: (value: boolean) => void;
    carrito: CarritoItem[];
    setCarrito: (value: CarritoItem[]) => void;
    search: string;
    setSearch: (value: string) => void;
    categoriaSeleccionada: string | null;
    setCategoriaSeleccionada: (value: string | null) => void;
    tipoProductoSeleccionado: TipoProducto;
    setTipoProductoSeleccionado: (value: TipoProducto) => void;
    showCheckout: boolean;
    setShowCheckout: (value: boolean ) => void;
    selectedPaymentMethod: PaymentMethod | null;
    setSelectedPaymentMethod: (value: PaymentMethod | null) => void;
    calculatorInputValue: string;
    setCalculatorInputValue: (value: string) => void;
    splitPayments: SplitPayment[];
    setSplitPayments: (value: SplitPayment[]) => void;
};

const POSContextProvider = createContext<POSContextType | null>(null);

export function POSProvider({ children }: { children: React.ReactNode }) {

  const [POSEnabled, setPOSEnabled] = useState<boolean>(false);
  const [openPOS, setOpenPOS] = useState<boolean>(false);
  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const [search, setSearch] = useState<string>("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);
  const [tipoProductoSeleccionado, setTipoProductoSeleccionado] = useState<TipoProducto>("todos");
  const [showCheckout, setShowCheckout] = useState<boolean>(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>('efectivo');
  const [calculatorInputValue, setCalculatorInputValue ] = useState<string>('');
  const [splitPayments, setSplitPayments] = useState<SplitPayment[]>([]);

  return (
    <POSContextProvider.Provider value={{
      POSEnabled,
      setPOSEnabled,
      openPOS,
      setOpenPOS,
      carrito,
      setCarrito,
      search,
      setSearch,
      categoriaSeleccionada,
      setCategoriaSeleccionada,
      tipoProductoSeleccionado,
      setTipoProductoSeleccionado,
      showCheckout,
      setShowCheckout,
      selectedPaymentMethod,
      setSelectedPaymentMethod,
      calculatorInputValue,
      setCalculatorInputValue,
      splitPayments,
      setSplitPayments,
      }}>
        {children}
    </POSContextProvider.Provider>
    );
}

export function usePOSContext() {
  const context = useContext(POSContextProvider);
  if (!context)
    throw new Error("Component must be within POSProvider");
  return context;
}
