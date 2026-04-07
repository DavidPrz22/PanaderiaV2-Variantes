import { cn } from "@/lib/utils";
import { Package, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Producto, ProductoVariante } from "../types/types";
import { useBCVRateQuery } from "../hooks/queries/queries";

interface VariantSelectDialogProps {
  product: Producto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectVariant: (product: Producto, variant: ProductoVariante, hasVariants: boolean) => void;
}

export function VariantSelectDialog({
  product,
  open,
  onOpenChange,
  onSelectVariant,
}: VariantSelectDialogProps) {
  if (!product || !product.variantes) return null;

  const { data: bcvRate } = useBCVRateQuery();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[50%] max-w-[800px] font-[Roboto]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary font-mono group-hover:rotate-12 transition-transform" />
            {product.nombre}
          </DialogTitle>
          <DialogDescription>
            Selecciona una variante para agregar al carrito
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 mt-2 max-h-[60vh] overflow-auto scrollbar-thin pr-1">
          {product.variantes.map((variant) => {
            const isLowStock = variant.stock <= 5;
            const outOfStock = variant.stock === 0;

            return (
              <button
                key={variant.id}
                disabled={outOfStock}
                onClick={() => {
                  onSelectVariant(product, variant, false);
                  onOpenChange(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between rounded-xl border border-border p-4 text-left transition-all duration-200",
                  outOfStock
                    ? "opacity-60 cursor-not-allowed bg-muted/50"
                    : "bg-card hover:border-blue-500/50 hover:bg-blue-50/10 hover:shadow-md cursor-pointer group"
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-card-foreground">
                      {variant.nombre}
                    </p>
                    <span className="bg-gray-200 px-1.5 py-0.5 rounded-md text-xs">
                      {variant.atributo}
                    </span>
                  </div>
                  <p
                    className={cn(
                      "text-xs font-medium mt-1 uppercase tracking-wider",
                      outOfStock
                        ? "text-destructive"
                        : isLowStock
                        ? "text-red-500"
                        : "text-emerald-500"
                    )}
                  >
                    {outOfStock ? "Agotado" : `${variant.stock} disponibles`}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-md font-semibold text-card-foreground">
                      Bs. {((variant.precio * (bcvRate?.promedio || 1))).toFixed(2)}
                    </p>
                    <p className="text-sm font-medium text-card-foreground">
                      ${variant.precio.toFixed(2)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      SKU: {variant.sku}
                    </p>
                  </div>
                  {!outOfStock && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-900/10 text-blue-900 group-hover:bg-blue-900 group-hover:text-white transition-colors">
                      <Plus className="h-4 w-4" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
