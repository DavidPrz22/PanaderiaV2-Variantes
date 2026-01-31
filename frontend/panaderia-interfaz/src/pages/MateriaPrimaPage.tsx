import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Sidebar from "../components/Layout/Sidebar/Sidebar";
import HeaderBar from "@/components/Layout/HeaderBar/HeaderBar";
import MateriaPrimaPanel from "@/features/MateriaPrima/components/MateriaPrimaPanel";
import { CreateMateriaPrimaPanel } from "@/features/MateriaPrima/components/MateriaPrimaCreateForm";
import { MateriaPrimaDetailsPanel } from "@/features/MateriaPrima/components/MateriaPrimaDetailsPanel";

import { MateriaPrimaProvider, useMateriaPrimaContext } from "@/context/MateriaPrimaContext";

function MateriaPrimaPageContent() {
  const location = useLocation();
  const {
    showMateriaprimaForm,
    setShowMateriaprimaForm,
    showMateriaprimaDetalles,
    setShowMateriaprimaDetalles,
  } = useMateriaPrimaContext();

  useEffect(() => {
    if (location.pathname.endsWith("/new")) {
      setShowMateriaprimaForm(true);
    }
  }, [location.pathname, setShowMateriaprimaForm]);

  return (
    <div className="flex min-h-screen">
      <div className={`flex-1 ml-(--sidebar-width) pt-(--header-height)`}>
        <main className=" pb-3 h-full">
          {!showMateriaprimaForm && !showMateriaprimaDetalles && (
            <MateriaPrimaPanel />
          )}

          {showMateriaprimaForm && (
            <CreateMateriaPrimaPanel
              isOpen={showMateriaprimaForm}
              onClose={() => setShowMateriaprimaForm(false)}
              onSave={(data) => {
                console.log("Saving...", data);
                setShowMateriaprimaForm(false);
              }}
              fullScreen={true}
            />
          )}

          {showMateriaprimaDetalles && (
            <MateriaPrimaDetailsPanel
              onClose={() => {
                setShowMateriaprimaDetalles(false);
              }}
              fullScreen={true}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default function MateriaPrimaPage() {
  return (
    <MateriaPrimaProvider>
      <Sidebar />
      <HeaderBar />
      <MateriaPrimaPageContent />
    </MateriaPrimaProvider>
  );
}
