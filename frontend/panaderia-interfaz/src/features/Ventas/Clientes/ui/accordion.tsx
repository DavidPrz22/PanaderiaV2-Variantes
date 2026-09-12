import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { clientesListOptions } from "../hooks/ClientesQueryOptions";
import { useDeleteCliente } from "../hooks/mutations";
import { useClientContext } from "@/context/ClientContext";

function Accordion({
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b last:border-b-0", className)}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
      {...props}
    >
      <div className={cn("pt-0 pb-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }

// Higher-level component: muestra la lista de clientes y sus detalles
export function ClientesAccordion() {
  const { data, isLoading, error } = clientesListOptions();
  const { setOpen, setClientToEdit } = useClientContext();
  const deleteClienteMutation = useDeleteCliente();

  const handleEdit = (client: any) => {
    setClientToEdit(client);
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este cliente?")) {
      deleteClienteMutation.mutate(id);
    }
  };

  // Normalizar posible forma de respuesta: array o { results: [] }
  const clients: any[] = React.useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    // verificar que data es un objeto y contiene results antes de acceder
    if (typeof data === "object" && data !== null && "results" in data && Array.isArray((data as any).results)) {
      return (data as any).results;
    }
    return [];
  }, [data]);

  if (isLoading) return <div className="p-4">Cargando clientes...</div>;
  if (error) return <div className="p-4 text-red-600">Error cargando clientes</div>;

  if (clients.length === 0) {
    return <div className="p-4 text-gray-600">No hay clientes registrados.</div>;
  }

  return (
    <AccordionPrimitive.Root type="single" collapsible className="w-full">
      {clients.map((c: any) => (
        <AccordionItem key={c.id} value={`cliente-${c.id}`}>
          <AccordionTrigger>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full">
              <div className="font-medium text-gray-900">{c.nombre_cliente} {c.apellido_cliente}</div>
              <div className="text-sm text-gray-500 mt-1 md:mt-0">{c.email ?? c.telefono}</div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
              <div><span className="font-semibold">Teléfono: </span>{c.telefono || '—'}</div>
              <div><span className="font-semibold">Email: </span>{c.email || '—'}</div>
              <div><span className="font-semibold">Rif/Cédula: </span>{c.rif_cedula || '—'}</div>
              <div><span className="font-semibold">Fecha registro: </span>{c.fecha_registro ? new Date(c.fecha_registro).toLocaleDateString('es-ES') : '—'}</div>
              <div className="md:col-span-2"><span className="font-semibold">Notas: </span>{c.notas || '—'}</div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => handleEdit(c)}
                className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(c.id)}
                className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </AccordionPrimitive.Root>
  );
}
