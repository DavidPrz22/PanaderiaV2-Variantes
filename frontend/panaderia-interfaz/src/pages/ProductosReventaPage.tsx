import Sidebar from "../components/Layout/Sidebar/Sidebar";
import HeaderBar from "@/components/Layout/HeaderBar/HeaderBar";
import ProductosReventaPanel from "@/features/ProductosReventa/components/ProductosReventaPanel";
import ProductosReventaForm from "@/features/ProductosReventa/components/ProductosReventaForm";
import ProductosReventaDetalles from "@/features/ProductosReventa/components/ProductosReventaDetalles";
import { ProductosReventaProvider, useProductosReventaContext } from "@/context/ProductosReventaContext";

const PageContent = () => {
  const { productoReventaId, updateRegistro } = useProductosReventaContext();
  
  return (
    <>
      <Sidebar />
      <HeaderBar />
      <div className="flex min-h-screen">
        <div className={`flex-1 ml-(--sidebar-width) pt-(--header-height)`}>
          <main className="pt-7 pb-3 h-full">
            <ProductosReventaPanel />
            <ProductosReventaForm key={`${productoReventaId}-${updateRegistro}`} />
            <ProductosReventaDetalles />
          </main>
        </div>
      </div>
    </>
  );
};

export default function ProductosReventaPage() {
  return (
    <ProductosReventaProvider>
      <PageContent />
    </ProductosReventaProvider>
  );
}