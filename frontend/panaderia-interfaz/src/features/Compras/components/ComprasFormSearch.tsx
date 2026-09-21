import { useState } from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { useProductosSearchMutation } from "../hooks/mutations/mutations";
import type { Producto } from "../types/types";

export function ComprasFormSearch({
  value,
  onChange,
}: {
  value?: string;
  onChange: (producto: Producto) => void;
}) {
  const [open, setOpen] = useState(false);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const { data: dataProductosOC, mutate: searchProductosOC } =
    useProductosSearchMutation();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[300px] justify-between overflow-hidden"
        >
          {value ? value : "Seleccionar producto..."}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput
            placeholder="Buscar producto..."
            onValueChange={(e: string) => {
              const searchTerm = e.trim();
              if (searchTerm === "") return;
              if (timer) clearTimeout(timer);
              const timerRef = setTimeout(() => {
                searchProductosOC(searchTerm);
              }, 1000);
              setTimer(timerRef);
            }}
          />
          <CommandList>
            {dataProductosOC?.productos.length === 0 ? (
              <CommandEmpty className="p-2 text-sm">
                No se encontraron resultados
              </CommandEmpty>
            ) : (
              <CommandEmpty className="p-2 text-sm">
                Resultados de busqueda...
              </CommandEmpty>
            )}
            <CommandGroup>
              {dataProductosOC?.productos.map((dataValue) => (
                <CommandItem
                  key={`${dataValue.tipo}-${dataValue.id}`}
                  value={dataValue.nombre}
                  onSelect={() => {
                    onChange(dataValue);
                    setOpen(false);
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === dataValue.nombre ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {dataValue.nombre}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
