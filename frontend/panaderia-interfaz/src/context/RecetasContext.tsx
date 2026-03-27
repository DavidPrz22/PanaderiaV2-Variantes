import type {
  productoElaboradoItem,
  recetaDetallesItem,
  recetaRelacionada,
} from "@/features/Recetas/types/types";
import { createContext, useContext, useState, useRef, useEffect } from "react";
import type { componenteListadosReceta, fechaSeleccionadaFiltro } from "@/features/Recetas/types/types";

type RecetasContextType = {
  showRecetasDetalles: boolean;
  setShowRecetasDetalles: (show: boolean) => void;
  recetaId: number | null;
  setRecetaId: (id: number | null) => void;
  showRecetasForm: boolean;
  setShowRecetasForm: (show: boolean) => void;
  updateRegistro: boolean;
  setUpdateRegistro: (update: boolean) => void;
  registroDelete: boolean | null;
  setRegistroDelete: (registroDelete: boolean | null) => void;
  searchListComponentesRef: React.RefObject<HTMLInputElement | null>;
  searchListActiveComponentes: boolean;
  setSearchListActiveComponentes: (active: boolean) => void;
  timer: NodeJS.Timeout | null;
  setTimer: (timer: NodeJS.Timeout | null) => void;
  componentesListadosReceta: componenteListadosReceta[];
  setComponentesListadosReceta: (
    componentes: componenteListadosReceta[],
  ) => void;
  recetaDetalles: recetaDetallesItem | null;
  setRecetaDetalles: (recetaDetalles: recetaDetallesItem | null) => void;
  recetaDetallesLoading: boolean;
  setRecetaDetallesLoading: (loading: boolean) => void;
  enabledRecetaDetalles: boolean;
  setEnabledRecetaDetalles: (enable: boolean) => void;
  searchListRecetaListRef: React.RefObject<HTMLInputElement | null>;
  searchListActiveRecetaList: boolean;
  setSearchListActiveRecetaList: (active: boolean) => void;
  searchListRecetaList: recetaRelacionada[];
  setSearchListRecetaList: (recetaList: recetaRelacionada[]) => void;
  recetasListadas: recetaRelacionada[];
  setRecetasListadas: (recetasListadas: recetaRelacionada[]) => void;
  recetaUnicaFiltro: boolean;
  setRecetaUnicaFiltro: (recetaUnicaFiltro: boolean) => void;
  recetaCompuestaFiltro: boolean;
  setRecetaCompuestaFiltro: (recetaCompuestaFiltro: boolean) => void;
  fechaSeleccionadaFiltro: fechaSeleccionadaFiltro | undefined;
  setFechaSeleccionadaFiltro: (fechaSeleccionadaFiltro: fechaSeleccionadaFiltro | undefined) => void;
  searchTermFilter: string | null;
  setSeachTermFilter: (searchTermFilter: string | null) => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  selectedItemProducto: productoElaboradoItem | null;
  setSelectedItemProducto: (selectedItemProducto: productoElaboradoItem | null) => void;
};

const RecetasContext = createContext<RecetasContextType | null>(null);

export const useRecetasContext = () => {
  const context = useContext(RecetasContext);
  if (!context) {
    throw new Error("useRecetasContext must be used within a RecetasProvider");
  }
  return context;
};

export const RecetasProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [showRecetasDetalles, setShowRecetasDetalles] = useState(false);
  const [showRecetasForm, setShowRecetasForm] = useState(false);
  const [recetaId, setRecetaId] = useState<number | null>(null);
  const [updateRegistro, setUpdateRegistro] = useState(false);
  const [registroDelete, setRegistroDelete] = useState<boolean | null>(null);

  const searchListComponentesRef = useRef<HTMLInputElement | null>(null);
  const [searchListActiveComponentes, setSearchListActiveComponentes] = useState(false);
  const [componentesListadosReceta, setComponentesListadosReceta] = useState<
    componenteListadosReceta[]
  >([]);

  const [selectedItemProducto, setSelectedItemProducto] = useState<productoElaboradoItem | null>(null);

  const searchListRecetaListRef = useRef<HTMLInputElement | null>(null);
  const [searchListActiveRecetaList, setSearchListActiveRecetaList] = useState(false);
  const [searchListRecetaList, setSearchListRecetaList] = useState<recetaRelacionada[]>(
    [],
  );

  const [recetasListadas, setRecetasListadas] = useState<recetaRelacionada[]>([]);

  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const [recetaDetalles, setRecetaDetalles] =
    useState<recetaDetallesItem | null>(null);

  const [recetaDetallesLoading, setRecetaDetallesLoading] =
    useState<boolean>(false);

  const [enabledRecetaDetalles, setEnabledRecetaDetalles] =
    useState<boolean>(false);

  const [recetaUnicaFiltro, setRecetaUnicaFiltro] = useState<boolean>(false);

  const [recetaCompuestaFiltro, setRecetaCompuestaFiltro] = useState<boolean>(false);

  const [fechaSeleccionadaFiltro, setFechaSeleccionadaFiltro] = useState<fechaSeleccionadaFiltro | undefined>(undefined);

  const [searchTermFilter, setSeachTermFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);

  // Reset page to 0 when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [searchTermFilter, recetaUnicaFiltro, recetaCompuestaFiltro, fechaSeleccionadaFiltro]);

  return (
    <RecetasContext.Provider
      value={{
        selectedItemProducto,
        setSelectedItemProducto,
        showRecetasDetalles,
        setShowRecetasDetalles,
        recetaId,
        setRecetaId,
        showRecetasForm,
        setShowRecetasForm,
        updateRegistro,
        setUpdateRegistro,
        registroDelete,
        setRegistroDelete,
        searchListComponentesRef,
        searchListActiveComponentes,
        setSearchListActiveComponentes,
        timer,
        setTimer,
        componentesListadosReceta,
        setComponentesListadosReceta,
        recetaDetalles,
        setRecetaDetalles,
        recetaDetallesLoading,
        setRecetaDetallesLoading,
        enabledRecetaDetalles,
        setEnabledRecetaDetalles,
        searchListRecetaListRef,
        searchListActiveRecetaList,
        setSearchListActiveRecetaList,
        searchListRecetaList,
        setSearchListRecetaList,
        recetasListadas,
        setRecetasListadas,
        recetaUnicaFiltro,
        setRecetaUnicaFiltro,
        recetaCompuestaFiltro,
        setRecetaCompuestaFiltro,
        fechaSeleccionadaFiltro,
        setFechaSeleccionadaFiltro,
        searchTermFilter,
        setSeachTermFilter,
        currentPage,
        setCurrentPage
      }}
    >
      {children}
    </RecetasContext.Provider>
  );
};
