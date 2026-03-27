import { useState, useMemo } from "react";
import type {  Control, UseFormWatch, UseFormSetValue, FieldErrors } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, ChevronsUpDown, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TRecetaSchema } from "@/features/Recetas/schemas/schemas";
import { useGetProductosElaboradosQuery } from "@/features/Recetas/hooks/queries/queries";
import type { productoElaboradoItem } from "../types/types";
import { useUnidadesMedidaQuery } from "@/hooks/useQueryHooks";
import { useRecetasContext } from "@/context/RecetasContext";
import { useDebounce } from "@/hooks/useDebounce";

interface ProductSelectorSectionProps {
  control: Control<TRecetaSchema>;
  watch: UseFormWatch<TRecetaSchema>;
  setValue: UseFormSetValue<TRecetaSchema>;
  errors: FieldErrors<TRecetaSchema>;
}


export function ProductSelectorSection({ control, watch, setValue, errors }: ProductSelectorSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 400);
  const { data: productosElaborados } = useGetProductosElaboradosQuery(debouncedSearchTerm);
  const { data: unidadesMedida } = useUnidadesMedidaQuery();
  const [open, setOpen] = useState(false);
  const { selectedItemProducto, setSelectedItemProducto } = useRecetasContext();
  
  const selectedVarianteId = watch("producto_elaborado_variante");

  const selectedVariante = useMemo(() => {
    return selectedItemProducto?.variantes.find((v) => v.id === selectedVarianteId);
  }, [selectedVarianteId, selectedItemProducto]);

  const handleSelect = (variant: number, producto: productoElaboradoItem) => {
    setValue("producto_elaborado_variante", variant);
    setSelectedItemProducto(producto);
    setOpen(false);
  };  

  const handleClear = () => {
    setValue("producto_elaborado_variante", "");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Producto Destino</h2>
        <p className="text-sm text-muted-foreground">
          Seleccione el producto y variante que produce esta receta
        </p>
      </div>

      <div className="bg-card border rounded-lg p-6">
        <FormField
          control={control}
          name="producto_elaborado_variante"
          render={() => (
            <FormItem className="flex flex-col">
              <FormLabel className="flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Producto / Variante
              </FormLabel>
              <FormControl>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between h-auto min-h-10 font-normal"
                    >
                      {selectedItemProducto ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-xs font-medium",
                              selectedItemProducto.tipo === "ProductoIntermedio"
                                ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                                : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                            )}
                          >
                            {selectedItemProducto.tipo === "ProductoIntermedio" ? "PI" : "PF"}
                          </Badge>
                          <span className="font-medium text-foreground">{selectedItemProducto.nombre_producto}</span>
                          <span className="text-muted-foreground">—</span>
                          <span className="text-foreground">{selectedVariante?.nombre_variante}</span>
                          {selectedVariante?.SKU && (
                            <span className="text-xs text-muted-foreground">({selectedVariante.SKU})</span>
                          )}
                          {(() => {
                            const unit = unidadesMedida?.find((u) => u.id === Number(selectedItemProducto.unidad_produccion));
                            return unit ? (
                              <Badge variant="outline" className="text-xs font-normal ml-1">
                                {unit.abreviatura}
                              </Badge>
                            ) : null;
                          })()}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Buscar producto o variante...</span>
                      )}
                      <div className="flex items-center gap-1 ml-2 shrink-0">
                        {selectedItemProducto && (
                          <span
                            role="button"
                            className="h-4 w-4 opacity-50 hover:opacity-100 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClear();
                            }}
                          >
                            <X className="h-4 w-4" />
                          </span>
                        )}
                        <ChevronsUpDown className="h-4 w-4 opacity-50" />
                      </div>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar producto o variante..." onValueChange={setSearchTerm} />
                      <CommandList>
                        <CommandEmpty className="w-[500px] p-5">No se encontraron productos.</CommandEmpty>
                        {productosElaborados?.map((producto) => (
                          <CommandGroup className="w-[500px]"
                            key={producto.producto_id}
                            heading={
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="secondary"
                                  className={cn(
                                    "text-md font-semibold px-1.5 py-0",
                                    producto.tipo === "ProductoIntermedio"
                                      ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                                      : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                                  )}
                                >
                                  {producto.tipo === "ProductoIntermedio" ? "PI" : "PF"}
                                </Badge>
                                <span className="font-bold text-foreground text-md">{producto.nombre_producto.toUpperCase()}</span>
                              </div>
                            }
                          >
                            {producto.variantes?.map((v) => (
                              <CommandItem
                                key={v.id}
                                value={`${producto.nombre_producto} ${v.nombre_variante} ${v.SKU || ""}`}
                                onSelect={() => handleSelect(v.id, producto)}
                                className="pl-8 cursor-pointer"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4 shrink-0",
                                    selectedVarianteId === v.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <span className="text-lg">{v.nombre_variante}</span>
                                {v.SKU && (
                                  <span className="ml-2 text-muted-foreground">({v.SKU})</span>
                                )}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        ))}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {errors.producto_elaborado_variante?.message && (
          <p className="text-sm font-medium text-destructive mt-2">
            {errors.producto_elaborado_variante.message}
          </p>
        )}
      </div>
    </div>
  );
}
