import { Clock, Package, TruckIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Notificacion } from "../types/types";
import { NOTIFICACIONES_TIPOS, PRIORIDAD_TIPOS } from "../utils/constants";

const iconMap = {
  [NOTIFICACIONES_TIPOS.STOCK]: Package,
  [NOTIFICACIONES_TIPOS.SIN_STOCK]: Clock,
  [NOTIFICACIONES_TIPOS.VENCIMIENTO]: TruckIcon,
  [NOTIFICACIONES_TIPOS.ENTREGAS]: TruckIcon,
  TODOS: Package, // Default icon for 'TODOS' case
} as const;

const priorityColors = {
  [PRIORIDAD_TIPOS.CRITICO]:
    "bg-destructive text-destructive-foreground text-white",
  [PRIORIDAD_TIPOS.ALTO]:
    "bg-destructive text-destructive-foreground text-white",
  [PRIORIDAD_TIPOS.MEDIO]: "bg-warning bg-amber-500 text-white",
  [PRIORIDAD_TIPOS.BAJO]: "bg-secondary bg-green-600 text-white",
};

const priorityIconColor = {
  [PRIORIDAD_TIPOS.CRITICO]: "bg-destructive/10",
  [PRIORIDAD_TIPOS.ALTO]: "bg-destructive/10",
  [PRIORIDAD_TIPOS.MEDIO]: "bg-amber-500/10",
  [PRIORIDAD_TIPOS.BAJO]: "bg-green-600/10",
};

export const NotificationCard = ({
  id,
  prioridad,
  tipo_notificacion,
  tipo_producto,
  descripcion,
  tiempo,
  leida,
  variante,
}: Notificacion) => {
  const Icon = iconMap[tipo_notificacion];

  return (
    <div
      key={id}
      className={`font-[Roboto] flex gap-3 p-4 rounded-lg border hover:bg-secondary ${leida ? "" : "bg-gray-50"} transition-colors`}
    >
      <div className={`p-2 rounded-lg h-fit ${priorityIconColor[prioridad]}`}>
        <Icon
          className={`h-4 w-4 ${prioridad === PRIORIDAD_TIPOS.ALTO || prioridad === PRIORIDAD_TIPOS.CRITICO ? "text-destructive" : "text-primary"} `}
        />
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <p className="text-md font-semibold text-foreground">{`Notificación de ${tipo_producto.toLocaleLowerCase()} de ${tipo_notificacion.toLocaleLowerCase()}`}</p>
            <Badge className={priorityColors[prioridad]} variant="secondary">
              {prioridad}
            </Badge>
          </div>
          {!leida && (
            <div className="text-xs text-muted-foreground">sin leer</div>
          )}
        </div>
        {variante && (
          <p className="text-sm font-semibold text-gray-800 ">Variante: {variante.nombre}</p>
        )}
        <div className="space-y-2 mt-2">
          <p className="text-sm text-muted-foreground">{descripcion}</p>
          <p className="text-xs text-muted-foreground">{tiempo}</p>
        </div>
      </div>
    </div>
  );
};
