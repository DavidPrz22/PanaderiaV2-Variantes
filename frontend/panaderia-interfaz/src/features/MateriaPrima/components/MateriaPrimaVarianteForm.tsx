import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { unidadesMedida } from "@/types/materiaPrima";

export interface VarianteFormData {
  id: string;
  nombreVariante: string;
  unidadCompra: string;
  precioCompraDivisa: string;
  precioCompraLocal: string;
  nombreEmpaqueEstandar: string;
  cantidadEmpaqueEstandar: string;
  unidadMedidaEmpaqueEstandar: string;
}

interface VarianteFormProps {
  variante: VarianteFormData;
  index: number;
  onUpdate: (index: number, data: VarianteFormData) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}

export const VarianteForm = ({
  variante,
  index,
  onUpdate,
  onRemove,
  canRemove,
}: VarianteFormProps) => {
  const handleChange = (field: keyof VarianteFormData, value: string) => {
    onUpdate(index, { ...variante, [field]: value });
  };

  return (
    <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">Variante {index + 1}</h4>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onRemove(index)}
            className="h-8 w-8 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-2">
          <Label htmlFor={`nombreVariante-${index}`}>Nombre Variante *</Label>
          <Input
            id={`nombreVariante-${index}`}
            value={variante.nombreVariante}
            onChange={(e) => handleChange("nombreVariante", e.target.value)}
            placeholder="Ej: Saco 50kg"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`unidadCompra-${index}`}>Unidad de Compra *</Label>
          <Select
            value={variante.unidadCompra}
            onValueChange={(value) => handleChange("unidadCompra", value)}
          >
            <SelectTrigger id={`unidadCompra-${index}`}>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              {unidadesMedida.map((unidad) => (
                <SelectItem key={unidad.id} value={unidad.id}>
                  {unidad.nombre} ({unidad.abreviatura})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`precioCompraDivisa-${index}`}>
            Precio Divisa ($)
          </Label>
          <Input
            id={`precioCompraDivisa-${index}`}
            type="number"
            step="0.01"
            min="0"
            value={variante.precioCompraDivisa}
            onChange={(e) => handleChange("precioCompraDivisa", e.target.value)}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`precioCompraLocal-${index}`}>Precio Local</Label>
          <Input
            id={`precioCompraLocal-${index}`}
            type="number"
            step="0.01"
            min="0"
            value={variante.precioCompraLocal}
            onChange={(e) => handleChange("precioCompraLocal", e.target.value)}
            placeholder="0.00"
          />
        </div>

        <div className="col-span-2 border-t pt-4 mt-2">
          <p className="text-xs text-muted-foreground mb-3">
            Empaque Estándar (Opcional)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`nombreEmpaqueEstandar-${index}`}>
            Nombre Empaque
          </Label>
          <Input
            id={`nombreEmpaqueEstandar-${index}`}
            value={variante.nombreEmpaqueEstandar}
            onChange={(e) =>
              handleChange("nombreEmpaqueEstandar", e.target.value)
            }
            placeholder="Ej: Saco, Bolsa, Caja"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`cantidadEmpaqueEstandar-${index}`}>Cantidad</Label>
          <Input
            id={`cantidadEmpaqueEstandar-${index}`}
            type="number"
            step="0.01"
            min="0"
            value={variante.cantidadEmpaqueEstandar}
            onChange={(e) =>
              handleChange("cantidadEmpaqueEstandar", e.target.value)
            }
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`unidadMedidaEmpaqueEstandar-${index}`}>
            Unidad Empaque
          </Label>
          <Select
            value={variante.unidadMedidaEmpaqueEstandar}
            onValueChange={(value) =>
              handleChange("unidadMedidaEmpaqueEstandar", value)
            }
          >
            <SelectTrigger id={`unidadMedidaEmpaqueEstandar-${index}`}>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              {unidadesMedida.map((unidad) => (
                <SelectItem key={unidad.id} value={unidad.id}>
                  {unidad.nombre} ({unidad.abreviatura})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
