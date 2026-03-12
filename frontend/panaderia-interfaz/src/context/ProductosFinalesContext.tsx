import type { receta_relacionada, recetasSearchItem } from "@/features/ProductosFinales/types/types";
import { createContext, useContext, useState, useRef } from "react";

type ProductosFinalesContextType = {
  showProductoDetalles: boolean;
  setShowProductoDetalles: (show: boolean) => void;
  productoId: number | null;
  setProductoId: (id: number | null) => void;
  showProductoForm: boolean;
  setShowProductoForm: (show: boolean) => void;
  updateProducto: boolean;
  setUpdateProducto: (update: boolean) => void;
  registroDelete: boolean | null;
  setRegistroDelete: (registroDelete: boolean | null) => void;
  searchListRecetaListRef: React.RefObject<HTMLInputElement | null>;
  searchListRecetaList: receta_relacionada[];
  setSearchListRecetaList: (recetaList: receta_relacionada[]) => void;
  searchList: recetasSearchItem[];
  setSearchList: (searchList: recetasSearchItem[]) => void;
  recetaSearchInputRef: React.RefObject<HTMLInputElement | null>;
  searchTimer: NodeJS.Timeout | null;
  setSearchTimer: (timer: NodeJS.Timeout | null) => void;
  deleteRecetaRelacionada: boolean;
  setDeleteRecetaRelacionada: (deleteReceta: boolean) => void;
  // Search & filter state for productos finales list
  productosFinalesSearchTerm: string;
  setProductosFinalesSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  selectedUnidadesVenta: string[]; // store unidad_venta strings
  setSelectedUnidadesVenta: React.Dispatch<React.SetStateAction<string[]>>;
  selectedCategoriasProductoFinal: string[]; // store categoria strings
  setSelectedCategoriasProductoFinal: React.Dispatch<React.SetStateAction<string[]>>;
  showFiltersPanel: boolean;
  setShowFiltersPanel: React.Dispatch<React.SetStateAction<boolean>>;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  showRecipeModal: boolean;
  setShowRecipeModal: (value: boolean) => void;
  selectedRecipeId: number | null;
  setSelectedRecipeId: (value: number | null) => void;
  showLotesDetalles: boolean;
  setShowLotesDetalles: (show: boolean) => void;
  bajoStockFilter: boolean;
  setBajoStockFilter: (filter: boolean) => void;
  agotadosFilter: boolean;
  setAgotadosFilter: (filter: boolean) => void;
};

const ProductosFinalesContextProvider = createContext<ProductosFinalesContextType | null>(null);

export const useProductosFinalesContext = () => {
  const context = useContext(ProductosFinalesContextProvider);
  if (!context) {
    throw new Error("useProductosFinalesContext must be used within a ProductosFinalesProvider");
  }
  return context;
};

export const ProductosFinalesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [showProductoDetalles, setShowProductoDetalles] = useState(false);
  const [showProductoForm, setShowProductoForm] = useState(false);
  const [productoId, setProductoId] = useState<number | null>(null);
  const [updateProducto, setUpdateProducto] = useState(false);
  const [registroDelete, setRegistroDelete] = useState<boolean | null>(null);
  const [showLotesDetalles, setShowLotesDetalles] = useState(false);

  const searchListRecetaListRef = useRef<HTMLInputElement | null>(null);
  const [searchListRecetaList, setSearchListRecetaList] = useState<receta_relacionada[]>(
    [],
  );

  const [searchList, setSearchList] = useState<recetasSearchItem[]>([]);
  const [searchTimer, setSearchTimer] = useState<NodeJS.Timeout | null>(null);

  const recetaSearchInputRef = useRef<HTMLInputElement | null>(null);

  const [deleteRecetaRelacionada, setDeleteRecetaRelacionada] =
    useState<boolean>(false);

  // Search & filters state
  const [productosFinalesSearchTerm, setProductosFinalesSearchTerm] = useState<string>("");
  const [selectedUnidadesVenta, setSelectedUnidadesVenta] = useState<string[]>([]);
  const [selectedCategoriasProductoFinal, setSelectedCategoriasProductoFinal] = useState<string[]>([]);
  const [showFiltersPanel, setShowFiltersPanel] = useState<boolean>(false);

  const [bajoStockFilter, setBajoStockFilter] = useState<boolean>(false);
  const [agotadosFilter, setAgotadosFilter] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [showRecipeModal, setShowRecipeModal] = useState<boolean>(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);


  return (
    <ProductosFinalesContextProvider.Provider
      value={{
        showProductoDetalles,
        setShowProductoDetalles,
        productoId,
        setProductoId,
        showProductoForm,
        setShowProductoForm,
        updateProducto,
        setUpdateProducto,
        registroDelete,
        setRegistroDelete,
        searchListRecetaListRef,
        searchListRecetaList,
        setSearchListRecetaList,
        searchList,
        setSearchList,
        recetaSearchInputRef,
        searchTimer,
        setSearchTimer,
        deleteRecetaRelacionada,
        setDeleteRecetaRelacionada,
        productosFinalesSearchTerm,
        setProductosFinalesSearchTerm,
        selectedUnidadesVenta,
        setSelectedUnidadesVenta,
        selectedCategoriasProductoFinal,
        setSelectedCategoriasProductoFinal,
        showFiltersPanel,
        setShowFiltersPanel,
        showLotesDetalles,
        setShowLotesDetalles,
        bajoStockFilter,
        setBajoStockFilter,
        agotadosFilter,
        setAgotadosFilter,
        currentPage,
        setCurrentPage,
        showRecipeModal,
        setShowRecipeModal,
        selectedRecipeId,
        setSelectedRecipeId,
      }}
    >
      {children}
    </ProductosFinalesContextProvider.Provider>
  );
};
