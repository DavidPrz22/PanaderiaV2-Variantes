import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUnidadesMedidaQuery } from "@/hooks/useQueryHooks";
import { FormInput, FormSelect } from "@/components/shared";

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

  const { data: unidadesMedida } = useUnidadesMedidaQuery();

  const unidadOptions = unidadesMedida?.map((u) => ({
    value: u.id,
    label: `${u.nombre_completo} (${u.abreviatura})`,
  })) || [];

  return (
    <div className="p-6 border rounded-xl space-y-6 relative bg-card shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-base tracking-tight">Variante {index + 1}</h4>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onRemove(index)}
            className="h-9 w-9 text-muted-foreground hover:text-destructive transition-colors rounded-full"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-1 md:col-span-2">
          <FormInput
            label="Nombre Variante"
            required
            value={variante.nombreVariante}
            onChange={(e) => handleChange("nombreVariante", e.target.value)}
            placeholder="Ej: Saco 50kg"
          />
        </div>

        <FormSelect
          label="Unidad de Compra"
          required
          value={variante.unidadCompra}
          onValueChange={(value) => handleChange("unidadCompra", value)}
          options={unidadOptions}
          placeholder="Seleccionar unidad"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-1 md:col-span-1">
          <FormInput
            label="Precio Divisa ($)"
            type="number"
            step="0.01"
            min="0"
            value={variante.precioCompraDivisa}
            onChange={(e) => handleChange("precioCompraDivisa", e.target.value)}
            placeholder="0.00"
          />

          <FormInput
            label="Precio Local"
            type="number"
            step="0.01"
            min="0"
            value={variante.precioCompraLocal}
            onChange={(e) => handleChange("precioCompraLocal", e.target.value)}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="pt-6 border-t space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          Empaque Estándar <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-muted rounded font-bold">Opcional</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormInput
            label="Nombre Empaque"
            value={variante.nombreEmpaqueEstandar}
            onChange={(e) => handleChange("nombreEmpaqueEstandar", e.target.value)}
            placeholder="Ej: Saco, Bolsa, Caja"
          />

          <FormInput
            label="Cantidad"
            type="number"
            step="0.01"
            min="0"
            value={variante.cantidadEmpaqueEstandar}
            onChange={(e) => handleChange("cantidadEmpaqueEstandar", e.target.value)}
            placeholder="0.00"
          />

          <FormSelect
            label="Unidad Empaque"
            value={variante.unidadMedidaEmpaqueEstandar}
            onValueChange={(value) => handleChange("unidadMedidaEmpaqueEstandar", value)}
            options={unidadOptions}
            placeholder="Seleccionar"
          />
        </div>
      </div>
    </div>
  );
};
