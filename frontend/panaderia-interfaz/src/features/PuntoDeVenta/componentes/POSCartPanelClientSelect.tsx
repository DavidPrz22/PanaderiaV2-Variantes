import { User } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClientesPOSQuery } from "@/hooks/useQueryHooks";
import { useState, useEffect } from "react";


type props = {
  onSetCliente: (clienteId: number) => void
}
export const POSCartPanelClientSelect = ({ onSetCliente }: props) => {
  const { data: clientes } = useClientesPOSQuery();
  const [selectedClient, setSelectedClient] = useState<string>('13');
  
  useEffect(() => {
    if (selectedClient) {
      onSetCliente(Number(selectedClient))
    }
  }, [selectedClient])

  const handleChangeClient = (client: string) => {
    setSelectedClient(client);
  }

  return (
    <div className="basis-1/9 border-b border-border p-4">
      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <User className="h-4 w-4" />
        Cliente
      </label>
      <Select value={selectedClient} onValueChange={handleChangeClient}>
        <SelectTrigger className="w-full bg-background focus-visible:ring-blue-200">
          <SelectValue placeholder="Seleccionar cliente" />
        </SelectTrigger>
        <SelectContent>
          {clientes?.map((client) => (
            <SelectItem key={client.id} value={client.id.toString()}>
              {client.nombre_cliente}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}