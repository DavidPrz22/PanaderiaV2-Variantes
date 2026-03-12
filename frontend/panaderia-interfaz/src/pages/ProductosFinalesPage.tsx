import { ProductosFinalesProvider, useProductosFinalesContext } from "@/context/ProductosFinalesContext";
import Sidebar from "@/components/Layout/Sidebar/Sidebar";
import HeaderBar from "@/components/Layout/HeaderBar/HeaderBar";
import ProductosFinalesPanel from "@/features/ProductosFinales/components/ProductosFinalesPanel";
import { ProductosFinalesForm } from "@/features/ProductosFinales/components/ProductosFinalesForm";
import { ProductosFinalesDetails } from "@/features/ProductosFinales/components/ProductosFinalesDetails";

const ProductosFinalesContent = () => {
  const { showProductoForm, showProductoDetalles } = useProductosFinalesContext();

  return (
    <main className="pt-7 pb-3 h-full">
      {!showProductoForm && !showProductoDetalles && <ProductosFinalesPanel />}
      {showProductoForm && <ProductosFinalesForm />}
      {showProductoDetalles && <ProductosFinalesDetails />}
    </main>
  );
};

export default function ProductosFinalesPage() {
  return (
    <ProductosFinalesProvider>
      <Sidebar />
      <HeaderBar />
      <div className="flex min-h-screen">
        <div className={`flex-1 ml-(--sidebar-width) pt-(--header-height)`}>
          <ProductosFinalesContent />
        </div>
      </div>
    </ProductosFinalesProvider>
  );
}