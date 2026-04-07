import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import type { Producto, ProductoVariante, CarritoItem } from '../types/types'
import { usePOSContext } from "@/context/POSContext";
import { useBCVRateQuery } from "@/features/PuntoDeVenta/hooks/queries/queries";
import { useState } from "react";
import { VariantSelectDialog } from "./POSVariantSelect";

interface ProductCardProps {
  product: Producto;
}

function ProductCardVariantContent({ variante }: { variante: ProductoVariante }) {
  const { data: bcvRate } = useBCVRateQuery();
  const isLowStock = variante.stock <= 5;
  
  return (
    <div className="flex flex-col">
          <p className="text-lg font-bold text-card-foreground">
            Bs. {((variante.precio * (bcvRate?.promedio || 1))).toFixed(2)}
          </p>
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold text-muted-foreground">
              ${(variante.precio).toFixed(2)}
            </p>
            <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-md font-mono text-muted-foreground">
              {variante.atributo}
            </span>
          </div>
          
          <p className="mt-0.5 text-xs text-muted-foreground font-mono">
            SKU: {variante.sku}
          </p>

          <p
            className={cn(
              "text-sm font-semibold",
              isLowStock ? "text-red-600" : "text-green-600"
            )}
          >
            {variante.stock} en stock
          </p>
        </div>

  )
}

export function ProductCard({ product }: ProductCardProps) {
  const { carrito, setCarrito } = usePOSContext();
  const [open, setOpen] = useState<boolean>(false);

  const handleAddProduct = (producto: Producto, variante: ProductoVariante, hasVariants: boolean) => {
    if (hasVariants) {
      setOpen(true);
      return;
    }

    const varianteId = variante?.id;
    const productoEnCarrito = carrito.find(
      (item) => item.producto_id === producto.id && item.variante_id === varianteId
    );

    if (productoEnCarrito) {
      const newCarrito = carrito.map((item) => {
        if (item.producto_id === producto.id && item.variante_id === varianteId) {
          return {
            ...item,
            cantidad: item.cantidad + 1,
            subtotal: item.subtotal + (variante?.precio || 0),
          };
        }
        return item;
      });
      setCarrito(newCarrito);
    } else {
      const nuevoItem: CarritoItem = { 
        id: Date.now(),
        producto_id: producto.id, 
        variante_id: varianteId,
        variante_nombre: variante?.nombre,
        nombre: producto.nombre,
        cantidad: 1, 
        subtotal: variante?.precio || 0, 
        tipo: producto.tipo, 
        precio: variante?.precio || 0 
      };
      setCarrito([...carrito, nuevoItem]);
    }
  }

  const variantesPRoducto = product.variantes || []
  const variantesCount = variantesPRoducto.length
  const singleVariant = variantesCount === 1 ? variantesPRoducto?.[0] : null
  const hasVariants = variantesCount > 1

  return (
    <>
      <div
        className="group font-[Roboto] relative flex flex-col rounded-xl border border-border p-4 gap-4 transition-all duration-200 hover:shadow-lg hover:border-blue-500/30 cursor-pointer animate-fade-in bg-card"
        onClick={() => handleAddProduct(product, singleVariant!, hasVariants)}
      >
        {/* Type badge */}
        <div
          className={cn(
            "absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
            product.tipo === "final"
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
              : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
          )}
        >
          {product.tipo === "final" ? "Final" : "Reventa"}
        </div>

        {/* Product info */}
        <div className="flex flex-col">
          <h3 className="mt-1 font-bold text-card-foreground line-clamp-2 pr-16 group-hover:text-blue-600 transition-colors">
            {product.nombre}
          </h3>
          <p className="mt-1 text-[10px] font-medium text-muted-foreground uppercase tracking-tight">{product.categoria}</p>
        </div>


        {singleVariant ? (
          <ProductCardVariantContent variante={singleVariant} />
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-muted-foreground">
              Stock Total: {product.stock}
            </p>
            <p className="text-xs text-white font-medium bg-blue-900 rounded-full px-3 py-1 w-fit shadow-sm">
              {variantesCount} variantes disponibles
            </p>
          </div>
        )}

      

        <div className="mt-auto pt-3 flex items-end justify-between">
          <div className="h-9 w-9 flex items-center justify-center rounded-full bg-blue-900/10 text-blue-900 group-hover:bg-blue-900 group-hover:text-white transition-all duration-300 scale-90 group-hover:scale-100 shadow-sm">
            <Plus className="h-5 w-5" />
          </div>
        </div>
      </div>

      <VariantSelectDialog
        product={product}
        open={open}
        onOpenChange={setOpen}
        onSelectVariant={handleAddProduct}
      />
    </>
  );
}
