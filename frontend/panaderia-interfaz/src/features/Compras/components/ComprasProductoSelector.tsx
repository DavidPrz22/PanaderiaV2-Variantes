import { useState } from "react";
import { Check, ChevronsUpDown, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import { useSearchProductosOC } from "../hooks/queries/queries";
import type { Producto, VarianteProducto } from "../types/types";

interface Props {
  selectedVarianteId?: number;
  currentName?: string;
  onSelect: (producto: Producto, variante: VarianteProducto) => void;
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function ComprasProductoSelector({
  selectedVarianteId,
  currentName,
  onSelect,
  className,
  placeholder = "Buscar producto...",
  autoFocus = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data, isLoading } = useSearchProductosOC(debouncedSearch);
  const productos = data?.productos || [];

  const handleSelect = (producto: Producto, variante: VarianteProducto) => {
    onSelect(producto, variante);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-10 font-normal px-3",
            !selectedVarianteId && "text-muted-foreground",
            className
          )}
          autoFocus={autoFocus}
        >
          <div className="flex items-center gap-2 truncate">
            {selectedVarianteId ? (
              <>
                <Package className="h-4 w-4 shrink-0 opacity-70" />
                <span className="truncate">{currentName || "Producto seleccionado"}</span>
              </>
            ) : (
              <span>{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Escribe para buscar..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList className="max-h-[300px]">
            {isLoading && (
              <div className="p-4 flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Buscando productos...</span>
              </div>
            )}
            {!isLoading && productos.length === 0 && searchTerm.length > 0 && (
              <CommandEmpty>No se encontraron productos.</CommandEmpty>
            )}
            {!isLoading && searchTerm.length === 0 && productos.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Comienza a escribir para buscar productos...
              </div>
            )}
            {productos.map((producto) => (
              <CommandGroup
                key={producto.id}
                heading={
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-[10px] uppercase font-bold px-1 py-0",
                        producto.tipo === "MateriaPrima"
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          : "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                      )}
                    >
                      {producto.tipo === "MateriaPrima" ? "MP" : "RV"}
                    </Badge>
                    <span className="text-foreground font-semibold">
                      {producto.nombre}
                    </span>
                  </div>
                }
              >
                {producto.variantes.map((v) => (
                  <CommandItem
                    key={v.id}
                    value={`${producto.nombre} ${v.nombre} ${v.SKU}`}
                    onSelect={() => handleSelect(producto, v)}
                    className="pl-8 cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedVarianteId === v.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{v.nombre}</span>
                      {v.SKU && (
                        <span className="text-xs text-muted-foreground">
                          SKU: {v.SKU}
                        </span>
                      )}
                    </div>
                    {v.unidad_compra && (
                      <Badge variant="outline" className="ml-auto text-[10px] font-normal">
                        {v.unidad_compra.abreviatura}
                      </Badge>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
