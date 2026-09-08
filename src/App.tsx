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
import RecuperarContrasena from "./pages/RecuperarContrasena";
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
import AprendizLayout from "./layouts/AprendizLayout";
import { useAuth } from "./context/auth/auth.context";
import Inicio from "./pages/Inicio";
import Aprendices from "./pages/administrador/Aprendices";
import AprendizForm from "./pages/administrador/AprendizForm";
import Funcionarios from "./pages/administrador/Funcionarios";
import { DashboardAdmin } from "./pages/administrador/DashboardAdmin";
import { Toaster } from "react-hot-toast";
import CargarAprendicesAdmin from "./pages/administrador/CargarAprendicesAdmin";
import Equipo from "./pages/Equipo";
import PoliticaPrivacidad from "./pages/PoliticaPrivacidad";
import ResultadosDemoPage from "./pages/funcionario/ResultadosDemoPage";
import AdminsCentro from "./pages/administrador/AdminsCentro";
import {
  esAdminSistema,
  esAdministradorRed,
  esAprendiz,
  esFuncionario,
  esRolDeCentro,
} from "./utils/roles";


function PublicLayout() {
  return <Outlet />;
}

function PrivateLayout() {
  const { isAuthenticated, sesionLista } = useAuth();

  if (!sesionLista) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Cargando sesión…</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

function GestionLayout() {
  const { user } = useAuth();
  if (esAprendiz(user?.perfil)) {
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
  if (esAprendiz(user?.perfil)) {
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

function AltaPersonalLayout() {
  const { user } = useAuth();
  if (esFuncionario(user?.perfil)) {
    return <Navigate to="/dashboard" replace />;
  }
  if (!esAdministradorRed(user?.perfil) && !esAdminSistema(user?.perfil)) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
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
          <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
          <Route path="/equipo" element={<Equipo />} />
          <Route path="/politica-privacidad" element={<PoliticaPrivacidad />} />
          {import.meta.env.DEV ? (
            <Route path="/resultados-demo" element={<ResultadosDemoPage />} />
          ) : null}
        </Route>

        {/* Rutas de Aprendiz */}
        <Route element={<PrivateLayout />}>
          <Route element={<AprendizLayout />}>
            <Route path="/elegir-jornada" element={<ElegirJornadaPage />} />
            <Route path="/votaciones" element={<VotacionesActivasPage />} />
            <Route path="/seleccion/:id" element={<CandidateSelectionPage />} />
            <Route path="/confirmar-voto" element={<ConfirmarVoto />} />
          </Route>

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
            <Route element={<AltaPersonalLayout />}>
              <Route path="/funcionarios" element={<Funcionarios />} />
            </Route>
          </Route>

          {/* Torre de red: solo Administrador */}
          <Route element={<RedSenaLayout />}>
            <Route path="/dashboard-admin" element={<DashboardAdmin />} />
            <Route path="/admins-centro" element={<AdminsCentro />} />
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
