import Sidebar from "../components/Layout/Sidebar/Sidebar";
import HeaderBar from "@/components/Layout/HeaderBar/HeaderBar";
import ProductosIntermediosPanel from "@/features/ProductosIntermedios/components/ProductosIntermediosPanel";
import { ProductosIntermediosProvider, useProductosIntermediosContext } from "@/context/ProductosIntermediosContext";
import { ProductosIntermediosForm } from "@/features/ProductosIntermedios/components/ProductosIntermediosForm";
import { ProductosIntermediosDetalles } from "@/features/ProductosIntermedios/components/ProductosIntermediosDetails";

function ProductosIntermediosPageContent() {
  const { showProductosIntermediosForm, showProductosIntermediosDetalles } = useProductosIntermediosContext();
  return (
    <>
      {showProductosIntermediosForm && <ProductosIntermediosForm onClose={() => { }} />}
      {showProductosIntermediosDetalles && <ProductosIntermediosDetalles/>}
      <ProductosIntermediosPanel />
    </>
  );
}

export default function ProductosIntermediosPage() {
  return (
    <ProductosIntermediosProvider>
      <Sidebar />
      <HeaderBar />
      <div className="flex min-h-screen">
        <div className={`flex-1 ml-(--sidebar-width) pt-(--header-height)`}>
          <main className="pt-7 pb-3 h-full">
            <ProductosIntermediosPageContent />
          </main>
        </div>
      </div>
    </ProductosIntermediosProvider>
  );
}
