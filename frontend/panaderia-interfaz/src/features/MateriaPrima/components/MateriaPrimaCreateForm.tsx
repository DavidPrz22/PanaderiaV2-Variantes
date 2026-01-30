import { useState } from "react";
import { ArrowLeft, Plus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { unidadesMedida, categoriasMateriaPrima } from "@/types/materiaPrima";
import { VarianteForm, VarianteFormData } from "./VarianteForm";

interface CreateMateriaPrimaPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: MateriaPrimaFormData) => void;
  fullScreen?: boolean;
}

export interface MateriaPrimaFormData {
  nombre: string;
  unidadMedidaBase: string;
  puntoReorden: string;
  categoria: string;
  descripcion: string;
  variantes: VarianteFormData[];
}

const createEmptyVariante = (): VarianteFormData => ({
  id: crypto.randomUUID(),
  nombreVariante: "",
  unidadCompra: "",
  precioCompraDivisa: "",
  precioCompraLocal: "",
  nombreEmpaqueEstandar: "",
  cantidadEmpaqueEstandar: "",
  unidadMedidaEmpaqueEstandar: "",
});

const initialFormState: MateriaPrimaFormData = {
  nombre: "",
  unidadMedidaBase: "",
  puntoReorden: "",
  categoria: "",
  descripcion: "",
  variantes: [createEmptyVariante()],
};

export const CreateMateriaPrimaPanel = ({
  isOpen,
  onClose,
  onSave,
  fullScreen = false,
}: CreateMateriaPrimaPanelProps) => {
  const { toast } = useToast();
  const [formData, setFormData] =
    useState<MateriaPrimaFormData>(initialFormState);

  const handleInputChange = (
    field: keyof Omit<MateriaPrimaFormData, "variantes">,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleVarianteUpdate = (index: number, data: VarianteFormData) => {
    setFormData((prev) => ({
      ...prev,
      variantes: prev.variantes.map((v, i) => (i === index ? data : v)),
    }));
  };

  const handleVarianteRemove = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variantes: prev.variantes.filter((_, i) => i !== index),
    }));
  };

  const handleAddVariante = () => {
    setFormData((prev) => ({
      ...prev,
      variantes: [...prev.variantes, createEmptyVariante()],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      toast({
        title: "Error",
        description: "El nombre es requerido",
        variant: "destructive",
      });
      return;
    }

    if (!formData.unidadMedidaBase) {
      toast({
        title: "Error",
        description: "La unidad de medida base es requerida",
        variant: "destructive",
      });
      return;
    }

    if (!formData.categoria) {
      toast({
        title: "Error",
        description: "La categoría es requerida",
        variant: "destructive",
      });
      return;
    }

    const hasValidVariante = formData.variantes.some(
      (v) => v.nombreVariante.trim() && v.unidadCompra
    );

    if (!hasValidVariante) {
      toast({
        title: "Error",
        description:
          "Debe agregar al menos una variante con nombre y unidad de compra",
        variant: "destructive",
      });
      return;
    }

    onSave(formData);
    setFormData(initialFormState);
    toast({
      title: "Éxito",
      description: "Materia prima creada correctamente",
    });
    onClose();
  };

  const handleClose = () => {
    setFormData(initialFormState);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={`${fullScreen ? "h-full" : "w-[480px] border-l"} bg-background flex flex-col`}>
      {/* Header */}
      <div className="flex items-center gap-4 p-6 border-b">
        <Button variant="ghost" size="icon" onClick={handleClose}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-xl font-semibold">Nueva Materia Prima</h2>
          <p className="text-sm text-muted-foreground">
            Complete los campos para registrar una nueva materia prima
          </p>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-w-4xl mx-auto">
          {/* Main Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleInputChange("nombre", e.target.value)}
                placeholder="Nombre de la materia prima"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unidadMedidaBase">Unidad Medida Base *</Label>
                <Select
                  value={formData.unidadMedidaBase}
                  onValueChange={(value) =>
                    handleInputChange("unidadMedidaBase", value)
                  }
                >
                  <SelectTrigger id="unidadMedidaBase">
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
                <Label htmlFor="puntoReorden">Punto de Reorden</Label>
                <Input
                  id="puntoReorden"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.puntoReorden}
                  onChange={(e) =>
                    handleInputChange("puntoReorden", e.target.value)
                  }
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria">Categoría *</Label>
              <Select
                value={formData.categoria}
                onValueChange={(value) =>
                  handleInputChange("categoria", value)
                }
              >
                <SelectTrigger id="categoria">
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categoriasMateriaPrima.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) =>
                  handleInputChange("descripcion", e.target.value)
                }
                placeholder="Descripción opcional"
                rows={3}
              />
            </div>
          </div>

          <Separator />

          {/* Variantes Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Variantes de Compra</h3>
                <p className="text-sm text-muted-foreground">
                  Define las presentaciones de compra
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddVariante}
              >
                <Plus className="h-4 w-4 mr-1" />
                Agregar
              </Button>
            </div>

            <div className="space-y-4">
              {formData.variantes.map((variante, index) => (
                <VarianteForm
                  key={variante.id}
                  variante={variante}
                  index={index}
                  onUpdate={handleVarianteUpdate}
                  onRemove={handleVarianteRemove}
                  canRemove={formData.variantes.length > 1}
                />
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button type="submit" className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Guardar Materia Prima
            </Button>
          </div>
        </form>
      </ScrollArea>
    </div>
  );
};
