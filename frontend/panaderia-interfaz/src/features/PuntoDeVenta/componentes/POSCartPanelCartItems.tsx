import { CartItem } from "./POSCartItem";
import { ShoppingBag } from "lucide-react";
import { usePOSContext } from "@/context/POSContext";
import type { WatchSetValue } from "../types/types";
import { useEffect } from "react";
import { EmptyState } from "./shared/components/EmptyState";
import { SectionHeader } from "./shared/components/SectionHeader";
import { RoundToTwo } from "@/utils/utils";

export const POSCartPanelCartItems = ({ watch, setValue }: WatchSetValue) => {

  const { carrito, setCarrito } = usePOSContext();

  const itemCount = carrito.reduce((total, item) => total + item.cantidad, 0);

  const updateQuantity = (id: number, quantity: number) => {
    const updatedCart = carrito.map((item) =>
      item.id === id ? { ...item, cantidad: quantity, subtotal: RoundToTwo(item.precio * quantity) } : item
    );
    setCarrito(updatedCart);
  };

  const removeFromCart = (id: number) => {
    const updatedCart = carrito.filter((item) => item.id !== id);
    setCarrito(updatedCart);
  };

  const handleCarritoUpdate = () => {
    const venta_detalles = carrito.map((item) => {
      return {
        producto_elaborado_id: item.tipo === 'final' ? item.variante_id : null,
        producto_reventa_id: item.tipo === 'reventa' ? item.variante_id : null,
        cantidad: item.cantidad,
        precio_unitario_usd: item.precio,
        subtotal_linea_usd: RoundToTwo(item.subtotal),
        precio_unitario_ves: RoundToTwo(item.precio * watch!('tasa_cambio_aplicada')),
        subtotal_linea_ves: RoundToTwo(item.subtotal * watch!('tasa_cambio_aplicada')),
      }
    })

    setValue!('venta_detalles', venta_detalles);
  }

  useEffect(() => {
    handleCarritoUpdate();
  }, [carrito])

  return (
    <div className="basis-6/9 overflow-auto p-4 scrollbar-thin">
      <SectionHeader
        icon={ShoppingBag}
        title="Productos"
        count={itemCount}
      />

      {carrito.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="El carrito está vacío"
          description="Selecciona productos para agregar"
        />
      ) : (
        <div className="space-y-2">
          {carrito.map((item, index) => (
            <CartItem
              key={index}
              item={item}
              onUpdateQuantity={(id, quantity) => updateQuantity(id, quantity)}
              onRemove={(id) => removeFromCart(id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}