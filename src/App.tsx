import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  Outlet,
} from "react-router-dom";
import "./App.css";
import VotacionesActivasPage from "./pages/aprendiz/VotacionesActivasPage";
import Login from "./pages/Login";
import ElegirJornadaPage from "./pages/aprendiz/ElegirJornadaPage";
import CandidateSelectionPage from "./pages/aprendiz/SeleccionarCandidatoPage";
import ConfirmarVoto from "./pages/aprendiz/ConfirmarVoto";
import GestionCandidatos from "./pages/funcionario/GestionCandidatos";
import CargarAprendices from "./pages/funcionario/CargarAprendices";
import PanelMetricas from "./pages/funcionario/PanelMetricas";
import EleccionesActivasPage from "./pages/funcionario/EleccionesActivasPage";
import AgregarCandidato from "./pages/funcionario/AgregarCandidato";
import FormEleccion from "./pages/funcionario/FormEleccion";
import MainLayout from "./layouts/MainLayout";
import { useAuth } from "./context/auth/auth.context";
import Inicio from "./pages/Inicio";
import Aprendices from "./pages/administrador/Aprendices";
import AprendizForm from "./pages/administrador/AprendizForm";
import Funcionarios from "./pages/administrador/Funcionarios";
import { DashboardAdmin } from "./pages/administrador/DashboardAdmin";
import { Toaster } from "react-hot-toast";
import CargarAprendicesAdmin from "./pages/administrador/CargarAprendicesAdmin";
import Equipo from "./pages/Equipo";
import { esRolDeCentro } from "./utils/roles";


function PublicLayout() {
  return <Outlet />;
}

function PrivateLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

function GestionLayout() {
  const { user } = useAuth();
  if (user?.perfil === "Aprendiz") {
    return <Navigate to="/votaciones" replace />;
  }
  return (
    <MainLayout showSidebar={true}>
      <Outlet />
    </MainLayout>
  );
}

function RedSenaLayout() {
  const { user } = useAuth();
  if (user?.perfil === "Aprendiz") {
    return <Navigate to="/votaciones" replace />;
  }
  if (esRolDeCentro(user?.perfil)) {
    return <Navigate to="/dashboard" replace />;
  }
  return (
    <MainLayout showSidebar={true}>
      <Outlet />
    </MainLayout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Inicio />} />
          <Route path="/login" element={<Login perfil="gestor" />} />
          <Route path="/login-aprendiz" element={<Login perfil="aprendiz" />} />
          <Route path="/equipo" element={<Equipo />} />
        </Route>

        {/* Rutas de Aprendiz */}
        <Route element={<PrivateLayout />}>
          <Route path="/elegir-jornada" element={<ElegirJornadaPage />} />
          <Route path="/votaciones" element={<VotacionesActivasPage />} />
          <Route path="/seleccion/:id" element={<CandidateSelectionPage />} />
          <Route path="/confirmar-voto" element={<ConfirmarVoto />} />

          {/* Gestión de centro: funcionario y admin_sistema */}
          <Route element={<GestionLayout />}>
            <Route path="/dashboard" element={<DashboardAdmin />} />
            <Route path="/gestion-candidatos/:idEleccion" element={<GestionCandidatos />} />
            <Route path="/cargar-aprendices" element={<CargarAprendices />} />
            <Route path="/panel-metricas" element={<PanelMetricas />} />
            <Route path="/elecciones" element={<EleccionesActivasPage />} />
            <Route path="/agregar-candidato" element={<AgregarCandidato />} />
            <Route path="/nueva-eleccion" element={<FormEleccion />} />
            <Route path="/aprendices" element={<Aprendices />} />
            <Route path="/aprendiz-form" element={<AprendizForm />} />
          </Route>

          {/* Torre de red: solo Administrador */}
          <Route element={<RedSenaLayout />}>
            <Route path="/dashboard-admin" element={<DashboardAdmin />} />
            <Route path="/funcionarios" element={<Funcionarios />} />
            <Route path="/cargar-aprendices-admin" element={<CargarAprendicesAdmin/>} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" reverseOrder={false} />
    </BrowserRouter>
  );
}

export default App;
