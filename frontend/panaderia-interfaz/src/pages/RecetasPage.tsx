import HeaderBar from "@/components/Layout/HeaderBar/HeaderBar";
import Sidebar from "@/components/Layout/Sidebar/Sidebar";
import RecetasPanel from "@/features/Recetas/components/RecetasPanel";
import { RecetaForma } from "@/features/Recetas/components/RecetasFormContainer";
import { RecetasProvider, useRecetasContext } from "@/context/RecetasContext";
import { RecipeDetailsPanel } from "@/features/Recetas/components/RecetasDetalles";

const RecetasContent = () => {
  const { 
    showRecetasForm, 
    setShowRecetasForm, 
    showRecetasDetalles, 
    setShowRecetasDetalles 
  } = useRecetasContext();

  return (
    <div className="flex min-h-screen">
      <div className={`flex-1 ml-(--sidebar-width) pt-(--header-height)`}>
        <main className="pt-7 pb-3 h-full">
          <RecetasPanel />
          {showRecetasForm && (
            <RecetaForma onClose={() => setShowRecetasForm(false)} />
          )}
          {showRecetasDetalles && (
            <RecipeDetailsPanel onClose={() => setShowRecetasDetalles(false)} />
          )}
        </main>
      </div>
    </div>
  );
};

export default function RecetasPage() {
  return (
    <RecetasProvider>
      <Sidebar />
      <HeaderBar />
      <RecetasContent />
    </RecetasProvider>
  );
}
