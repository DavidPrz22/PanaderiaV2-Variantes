import { createContext, useContext, useRef, useState, useEffect } from "react";
import type {
  childrenProp,
} from "@/features/ProductosIntermedios/types/types";

type ProductosIntermediosContextType = {
  showProductosIntermediosForm: boolean;
  setShowProductosIntermediosForm: (value: boolean) => void;
  showProductosIntermediosDetalles: boolean;
  setShowProductosIntermediosDetalles: (value: boolean) => void;
  updateRegistro: boolean;
  setUpdateRegistro: (value: boolean) => void;
  registroDelete: boolean;
  setRegistroDelete: (value: boolean) => void;
  productoIntermedioId: number | null;
  setProductoIntermedioId: (value: number | null) => void;
  searchTimer: NodeJS.Timeout | null;
  setSearchTimer: (value: NodeJS.Timeout | null) => void;
  recetaSearchInputRef: React.RefObject<HTMLInputElement | null>;
  isLoadingDetalles: boolean;
  setIsLoadingDetalles: (value: boolean) => void;
  enabledDetalles: boolean;
  setEnabledDetalles: (value: boolean) => void;
  deleteRecetaRelacionada: boolean;
  setDeleteRecetaRelacionada: (value: boolean) => void;
  // Search & filters for productos intermedios list
  productosIntermediosSearchTerm: string;
  setProductosIntermediosSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  selectedUnidadesProduccion: string[];
  setSelectedUnidadesProduccion: React.Dispatch<React.SetStateAction<string[]>>;
  selectedCategoriasIntermedio: string[];
  setSelectedCategoriasIntermedio: React.Dispatch<React.SetStateAction<string[]>>;
  showPIFiltersPanel: boolean;
  setShowPIFiltersPanel: React.Dispatch<React.SetStateAction<boolean>>;
  bajoStockFilter: boolean;
  setBajoStockFilter: (value: boolean) => void;
  agotadosFilter: boolean;
  setAgotadosFilter: (value: boolean) => void;
  showLotesDetalles: boolean;
  setShowLotesDetalles: (value: boolean) => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  showRecipeModal: boolean;
  setShowRecipeModal: (value: boolean) => void;
  selectedRecipeId: number | null;
  setSelectedRecipeId: (value: number | null) => void;
};

const ProductosIntermediosContext =
  createContext<ProductosIntermediosContextType | null>(null);

export const ProductosIntermediosProvider = ({ children }: childrenProp) => {
  const [showProductosIntermediosForm, setShowProductosIntermediosForm] =
    useState(false);
  const [
    showProductosIntermediosDetalles,
    setShowProductosIntermediosDetalles,
  ] = useState(false);
  const [updateRegistro, setUpdateRegistro] = useState(false);
  const [registroDelete, setRegistroDelete] = useState(false);

  const [productoIntermedioId, setProductoIntermedioId] = useState<
    number | null
  >(null);
  const [enabledDetalles, setEnabledDetalles] = useState(false);
  const [searchTimer, setSearchTimer] = useState<NodeJS.Timeout | null>(null);

  const recetaSearchInputRef = useRef<HTMLInputElement | null>(null);

  const [isLoadingDetalles, setIsLoadingDetalles] = useState(false);

  const [deleteRecetaRelacionada, setDeleteRecetaRelacionada] =
    useState<boolean>(false);

  // Search & filters state
  const [productosIntermediosSearchTerm, setProductosIntermediosSearchTerm] = useState("");
  const [selectedUnidadesProduccion, setSelectedUnidadesProduccion] = useState<string[]>([]);
  const [selectedCategoriasIntermedio, setSelectedCategoriasIntermedio] = useState<string[]>([]);
  const [showPIFiltersPanel, setShowPIFiltersPanel] = useState(false);
  const [bajoStockFilter, setBajoStockFilter] = useState(false);
  const [agotadosFilter, setAgotadosFilter] = useState(false);

  const [showLotesDetalles, setShowLotesDetalles] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(0);

  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);

  // Reset page to 0 when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [productosIntermediosSearchTerm, selectedUnidadesProduccion, selectedCategoriasIntermedio, bajoStockFilter, agotadosFilter]);

  return (
    <ProductosIntermediosContext.Provider
      value={{
        showProductosIntermediosForm,
        setShowProductosIntermediosForm,
        showProductosIntermediosDetalles,
        setShowProductosIntermediosDetalles,
        updateRegistro,
        setUpdateRegistro,
        registroDelete,
        setRegistroDelete,
        productoIntermedioId,
        setProductoIntermedioId,
        searchTimer,
        setSearchTimer,
        recetaSearchInputRef,
        isLoadingDetalles,
        setIsLoadingDetalles,
        enabledDetalles,
        setEnabledDetalles,
        deleteRecetaRelacionada,
        setDeleteRecetaRelacionada,
        productosIntermediosSearchTerm,
        setProductosIntermediosSearchTerm,
        selectedUnidadesProduccion,
        setSelectedUnidadesProduccion,
        selectedCategoriasIntermedio,
        setSelectedCategoriasIntermedio,
        showPIFiltersPanel,
        setShowPIFiltersPanel,
        bajoStockFilter,
        setBajoStockFilter,
        agotadosFilter,
        setAgotadosFilter,
        showLotesDetalles,
        setShowLotesDetalles,
        currentPage,
        setCurrentPage,
        showRecipeModal,
        setShowRecipeModal,
        selectedRecipeId,
        setSelectedRecipeId,
      }}
    >
      {children}
    </ProductosIntermediosContext.Provider>
  );
};

export const useProductosIntermediosContext = () => {
  const context = useContext(ProductosIntermediosContext);
  if (!context)
    throw new Error("Component must be within ProductosIntermediosProvider");
  return context;
};
