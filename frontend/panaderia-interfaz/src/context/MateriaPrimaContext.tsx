import { createContext, useContext, useState, useRef, useEffect } from "react";
import {
  type childrenProp,
  type DetailsViewMode
} from "../features/MateriaPrima/types/types";

type MateriaPrimaContextType = {
  materiaprimaId: number | null;
  setMateriaprimaId: (value: number | null) => void;
  registroDelete: boolean | null;
  setRegistroDelete: (value: boolean | null) => void;
  updateRegistro: boolean | null;
  setUpdateRegistro: (value: boolean | null) => void;
  filteredApplied: boolean;
  setFilteredApplied: (value: boolean) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  MPFilteredInputSearchApplied: boolean;
  setMPFilteredInputSearchApplied: (value: boolean) => void;
  inputfilterDoubleApplied: boolean | null;
  setInputfilterDoubleApplied: (value: boolean | null) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  showMateriaprimaForm: boolean;
  setShowMateriaprimaForm: (value: boolean) => void;
  viewMode: DetailsViewMode;
  setViewMode: (value: DetailsViewMode) => void;
  showMateriaprimaDetalles: boolean;
  setShowMateriaprimaDetalles: (value: boolean) => void;
};

const MateriaPrimaContextProvider =
  createContext<MateriaPrimaContextType | null>(null);

export function MateriaPrimaProvider({ children }: childrenProp) {
  const [viewMode, setViewMode] = useState<DetailsViewMode>("details");
  const [filteredApplied, setFilteredApplied] = useState<boolean>(false);
  const [MPFilteredInputSearchApplied, setMPFilteredInputSearchApplied] =
    useState<boolean>(false);
  
    const [inputfilterDoubleApplied, setInputfilterDoubleApplied] = useState<
    boolean | null
  >(null);

  const [materiaprimaId, setMateriaprimaId] = useState<number | null>(null);
  const [showMateriaprimaForm, setShowMateriaprimaForm] = useState(false);
  const [registroDelete, setRegistroDelete] = useState<boolean | null>(null);
  const [updateRegistro, setUpdateRegistro] = useState<boolean | null>(null);
  const [showMateriaprimaDetalles, setShowMateriaprimaDetalles] = useState(false);

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(0);

  // Reset page to 0 when filters change
  useEffect(() => {
    if (filteredApplied || MPFilteredInputSearchApplied || inputfilterDoubleApplied) {
      setCurrentPage(0);
    }
  }, [filteredApplied, MPFilteredInputSearchApplied, inputfilterDoubleApplied]);

  return (
    <MateriaPrimaContextProvider.Provider
      value={{
        materiaprimaId,
        setMateriaprimaId,
        registroDelete,
        setRegistroDelete,
        updateRegistro,
        setUpdateRegistro,
        filteredApplied,
        setFilteredApplied,
        searchInputRef,
        MPFilteredInputSearchApplied,
        setMPFilteredInputSearchApplied,
        inputfilterDoubleApplied,
        setInputfilterDoubleApplied,
        currentPage,
        setCurrentPage,
        showMateriaprimaForm,
        setShowMateriaprimaForm,
        showMateriaprimaDetalles,
        setShowMateriaprimaDetalles,
        viewMode,
        setViewMode,
      }}
    >
      {children}
    </MateriaPrimaContextProvider.Provider>
  );
}

export function useMateriaPrimaContext() {
  const context = useContext(MateriaPrimaContextProvider);
  if (!context)
    throw new Error("Component must be within MateriaPrimaProvider");
  return context;
}
