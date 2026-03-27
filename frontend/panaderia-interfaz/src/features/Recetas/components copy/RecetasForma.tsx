import { useRecetasContext } from "@/context/RecetasContext";
import RecetasFormShared from "./RecetasFormShared";

export default function RecetasForma() {
  const { showRecetasForm, setShowRecetasForm } = useRecetasContext();

  const handleSuccessClose = () => {
    setShowRecetasForm(false);
  };

  if (!showRecetasForm) return <></>;

  return (
    <RecetasFormShared
      title="Nueva Receta"
      onClose={handleSuccessClose}
      onSubmitSuccess={handleSuccessClose}
    />
  );
}
