import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { LandingPage } from "./pages/LandingPage";
import MateriaPrimaPage from "./pages/MateriaPrimaPage";
import { AuthProvider, useAuth, withAuth } from "./context/AuthContext";
import ProductosIntermediosPage from "./pages/ProductosIntermediosPage";
import ProductosReventaPage from "./pages/ProductosReventaPage";
import RecetasPage from "./pages/RecetasPage";
import ProductosFinalesPage from "./pages/ProductosFinalesPage";
import ProductionPage from "./pages/ProductionPage";
import OrdenesPage from "./pages/OrdenesPage";
import ComprasPage from "./pages/ComprasPage";
import TransformacionPage from "./pages/TransformacionPage";
import ClientesPage from "./pages/ClientesPage";
import POSPage from "./pages/POSPage";
import ProfileSettingsPage from "./pages/ProfileSettingsPage";
import ReportsPage from "./pages/ReportsPage";
import ApiDocsPage from "./pages/ApiDocsPage";


const ProtectedLandingPage = withAuth(LandingPage);
const ProtectedMateriaPrimaPage = withAuth(MateriaPrimaPage);
const ProtectedProductosIntermediosPage = withAuth(ProductosIntermediosPage);
const ProtectedProductosFinalesPage = withAuth(ProductosFinalesPage);
const ProtectedProductionPage = withAuth(ProductionPage, 'produccion');
const ProtectedRecetasPage = withAuth(RecetasPage, 'recetas');
const ProtectedProductosReventaPage = withAuth(ProductosReventaPage);
const ProtectedComprasPage = withAuth(ComprasPage, 'compras');
const ProtectedOrdenesPage = withAuth(OrdenesPage);
const ProtectedTransformacionPage = withAuth(TransformacionPage, 'transformacion');
const ProtectedClientesPage = withAuth(ClientesPage);
const ProtectedPOSPage = withAuth(POSPage);
const ProtectedProfileSettingsPage = withAuth(ProfileSettingsPage);
const ProtectedReportsPage = withAuth(ReportsPage, 'reportes');


function Logout() {
  const { logout } = useAuth();
  logout();
  return <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/register" />} />
          <Route path="/dashboard" element={<ProtectedLandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/logout" element={<Logout />} />
          <Route
            path="/dashboard/materia-prima"
            element={<ProtectedMateriaPrimaPage />}
          />
          <Route
            path="/dashboard/productos-intermedios"
            element={<ProtectedProductosIntermediosPage />}
          />
          <Route
            path="/dashboard/productos-reventa"
            element={<ProtectedProductosReventaPage />}
          />
          <Route
            path="/dashboard/recetas"
            element={<ProtectedRecetasPage />}
          />
          <Route
            path="/dashboard/productos-finales"
            element={<ProtectedProductosFinalesPage />}
          />
          <Route
            path="/dashboard/produccion"
            element={<ProtectedProductionPage />}
          />
          <Route
            path="/dashboard/pedidos"
            element={<ProtectedOrdenesPage />}
          />
          <Route
            path="/dashboard/compras"
            element={<ProtectedComprasPage />}
          />
          <Route
            path="/dashboard/transformacion"
            element={<ProtectedTransformacionPage />}
          />
          <Route
            path="/dashboard/clientes"
            element={<ProtectedClientesPage />}
          />
          <Route
            path="/dashboard/punto-de-venta"
            element={<ProtectedPOSPage />}
          />
          <Route
            path="/dashboard/perfil"
            element={<ProtectedProfileSettingsPage />}
          />
          <Route
            path="/dashboard/reportes"
            element={<ProtectedReportsPage />}
          />
          <Route path="/api-docs" element={<ApiDocsPage />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
