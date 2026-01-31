import { createContext, useContext, useState, useRef, useEffect } from "react";
import {
  type childrenProp,
  type LoteMateriaPrimaFormResponse,
} from "../features/MateriaPrima/types/types";

type MateriaPrimaContextType = {
  showMateriaprimaForm: boolean;
  setShowMateriaprimaForm: (value: boolean) => void;
  showMateriaprimaDetalles: boolean;
  setShowMateriaprimaDetalles: (value: boolean) => void;
  materiaprimaId: number | null;
  setMateriaprimaId: (value: number | null) => void;
  registroDelete: boolean | null;
  setRegistroDelete: (value: boolean | null) => void;
  updateRegistro: boolean | null;
  setUpdateRegistro: (value: boolean | null) => void;
  lotesForm: LoteMateriaPrimaFormResponse[];
  setLotesForm: (value: LoteMateriaPrimaFormResponse[]) => void;
  showLotesForm: boolean;
  setShowLotesForm: (value: boolean) => void;
  lotesMateriaPrimaDetalles: LoteMateriaPrimaFormResponse | null;
  setLotesMateriaPrimaDetalles: (
    value: LoteMateriaPrimaFormResponse | null,
  ) => void;
  showLotesMateriaPrimaDetalles: boolean;
  setShowLotesMateriaPrimaDetalles: (value: boolean) => void;
  filteredApplied: boolean;
  setFilteredApplied: (value: boolean) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  MPFilteredInputSearchApplied: boolean;
  setMPFilteredInputSearchApplied: (value: boolean) => void;
  inputfilterDoubleApplied: boolean | null;
  setInputfilterDoubleApplied: (value: boolean | null) => void;
  isLoadingDetalles: boolean;
  setIsLoadingDetalles: (value: boolean) => void;
  isLoadingList: boolean;
  setIsLoadingList: (value: boolean) => void;
  shouldRefreshList: boolean;
  setShouldRefreshList: (value: boolean) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
};

const MateriaPrimaContextProvider =
  createContext<MateriaPrimaContextType | null>(null);

export function MateriaPrimaProvider({ children }: childrenProp) {

  const [showMateriaprimaForm, setShowMateriaprimaForm] = useState(false);
  const [showMateriaprimaDetalles, setShowMateriaprimaDetalles] =
    useState(false);
  const [showLotesForm, setShowLotesForm] = useState(false);
  const [showLotesMateriaPrimaDetalles, setShowLotesMateriaPrimaDetalles] =
    useState(false);

  const [filteredApplied, setFilteredApplied] = useState<boolean>(false);

  const [MPFilteredInputSearchApplied, setMPFilteredInputSearchApplied] =
    useState<boolean>(false);

  const [inputfilterDoubleApplied, setInputfilterDoubleApplied] = useState<
    boolean | null
  >(null);


  const [materiaprimaId, setMateriaprimaId] = useState<number | null>(null);

  const [registroDelete, setRegistroDelete] = useState<boolean | null>(null);
  const [updateRegistro, setUpdateRegistro] = useState<boolean | null>(null);

  const [lotesForm, setLotesForm] = useState<LoteMateriaPrimaFormResponse[]>(
    [],
  );

  const [lotesMateriaPrimaDetalles, setLotesMateriaPrimaDetalles] =
    useState<LoteMateriaPrimaFormResponse | null>(null);

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const [isLoadingDetalles, setIsLoadingDetalles] = useState<boolean>(false);
  const [isLoadingList, setIsLoadingList] = useState<boolean>(false);

  const [shouldRefreshList, setShouldRefreshList] = useState<boolean>(false);
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
        showMateriaprimaForm,
        setShowMateriaprimaForm,
        showMateriaprimaDetalles,
        setShowMateriaprimaDetalles,
        materiaprimaId,
        setMateriaprimaId,
        registroDelete,
        setRegistroDelete,
        updateRegistro,
        setUpdateRegistro,
        showLotesForm,
        setShowLotesForm,
        lotesForm,
        setLotesForm,
        lotesMateriaPrimaDetalles,
        setLotesMateriaPrimaDetalles,
        showLotesMateriaPrimaDetalles,
        setShowLotesMateriaPrimaDetalles,
        filteredApplied,
        setFilteredApplied,
        searchInputRef,
        MPFilteredInputSearchApplied,
        setMPFilteredInputSearchApplied,
        inputfilterDoubleApplied,
        setInputfilterDoubleApplied,
        isLoadingDetalles,
        setIsLoadingDetalles,
        isLoadingList,
        setIsLoadingList,
        shouldRefreshList,
        setShouldRefreshList,
        currentPage,
        setCurrentPage,
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
