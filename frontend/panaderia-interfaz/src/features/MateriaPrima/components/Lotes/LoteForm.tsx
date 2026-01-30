import { useState, useEffect } from "react";
import { ArrowLeft, CalendarIcon, Save } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { LoteMateriaPrima, proveedoresMock } from "@/types/lotes";
import { MateriaPrima, unidadesMedida } from "@/types/materiaPrima";

export interface LoteFormData {
  proveedorId: string;
  varianteId: string;
  fechaRecepcion: Date | undefined;
  fechaCaducidad: Date | undefined;
  cantidadRecibida: string;
  costoUnitarioDivisa: string;
  costoUnitarioLocal: string;
}

interface LoteFormProps {
  materiaPrima: MateriaPrima;
  lote?: LoteMateriaPrima | null;
  onClose: () => void;
  onSave: (data: LoteFormData) => void;
}

const getUnidadAbreviatura = (unidadId: string) => {
  const unidad = unidadesMedida.find((u) => u.id === unidadId);
  return unidad?.abreviatura || "";
};

export const LoteForm = ({ materiaPrima, lote, onClose, onSave }: LoteFormProps) => {
  const [formData, setFormData] = useState<LoteFormData>({
    proveedorId: "",
    varianteId: "",
    fechaRecepcion: undefined,
    fechaCaducidad: undefined,
    cantidadRecibida: "",
    costoUnitarioDivisa: "",
    costoUnitarioLocal: "",
  });

  const isEditing = !!lote;

  useEffect(() => {
    if (lote) {
      setFormData({
        proveedorId: lote.proveedorId,
        varianteId: lote.varianteId || "",
        fechaRecepcion: lote.fechaRecepcion ? new Date(lote.fechaRecepcion) : undefined,
        fechaCaducidad: lote.fechaCaducidad ? new Date(lote.fechaCaducidad) : undefined,
        cantidadRecibida: lote.cantidadRecibida.toString(),
        costoUnitarioDivisa: lote.costoUnitarioDivisa.toString(),
        costoUnitarioLocal: lote.costoUnitarioLocal.toString(),
      });
    }
  }, [lote]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const unidadBase = getUnidadAbreviatura(materiaPrima.unidadMedidaBase);

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 p-6 border-b">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-xl font-semibold">
            {isEditing ? "Editar Lote" : "Nuevo Lote"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {materiaPrima.nombre}
          </p>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-w-4xl mx-auto">
          {/* Proveedor */}
          <div className="space-y-2">
            <Label>Proveedor *</Label>
            <Select
              value={formData.proveedorId}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, proveedorId: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar proveedor" />
              </SelectTrigger>
              <SelectContent>
                {proveedoresMock.map((proveedor) => (
                  <SelectItem key={proveedor.id} value={proveedor.id}>
                    {proveedor.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Variante (optional) */}
          {materiaPrima.variantes.length > 0 && (
            <div className="space-y-2">
              <Label>Variante</Label>
              <Select
                value={formData.varianteId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, varianteId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar variante (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {materiaPrima.variantes.map((variante) => (
                    <SelectItem key={variante.id} value={variante.id}>
                      {variante.nombreVariante}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Dates Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Fecha Recepción */}
            <div className="space-y-2">
              <Label>Fecha de Recepción *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.fechaRecepcion && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.fechaRecepcion ? (
                      format(formData.fechaRecepcion, "dd/MM/yyyy", { locale: es })
                    ) : (
                      <span>Seleccionar fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.fechaRecepcion}
                    onSelect={(date) =>
                      setFormData((prev) => ({ ...prev, fechaRecepcion: date }))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Fecha Caducidad */}
            <div className="space-y-2">
              <Label>Fecha de Caducidad *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.fechaCaducidad && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.fechaCaducidad ? (
                      format(formData.fechaCaducidad, "dd/MM/yyyy", { locale: es })
                    ) : (
                      <span>Seleccionar fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.fechaCaducidad}
                    onSelect={(date) =>
                      setFormData((prev) => ({ ...prev, fechaCaducidad: date }))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Cantidad Recibida */}
          <div className="space-y-2">
            <Label>Cantidad Recibida *</Label>
            <div className="relative">
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.cantidadRecibida}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, cantidadRecibida: e.target.value }))
                }
                placeholder="0.00"
                className="pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                {unidadBase}
              </span>
            </div>
          </div>

          {/* Costs Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Costo Unitario Divisa */}
            <div className="space-y-2">
              <Label>Costo Unitario ($) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.costoUnitarioDivisa}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, costoUnitarioDivisa: e.target.value }))
                  }
                  placeholder="0.00"
                  className="pl-7"
                />
              </div>
            </div>

            {/* Costo Unitario Local */}
            <div className="space-y-2">
              <Label>Costo Unitario Local *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.costoUnitarioLocal}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, costoUnitarioLocal: e.target.value }))
                }
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <Button type="submit" className="w-full">
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? "Actualizar Lote" : "Guardar Lote"}
            </Button>
          </div>
        </form>
      </ScrollArea>
    </div>
  );
};
