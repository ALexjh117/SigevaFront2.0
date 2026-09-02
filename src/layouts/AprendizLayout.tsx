import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/auth/auth.context";
import { jornadaDelAprendiz } from "../utils/jornadaAprendiz";
import { esAdministradorRed, esAprendiz } from "../utils/roles";
import MainLayout from "./MainLayout";
import "../theme/aprendiz.css";
import "../components/graficas/graficas.css";

export default function AprendizLayout() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const jornada = jornadaDelAprendiz(user);

  if (!esAprendiz(user?.perfil)) {
    return (
      <Navigate
        to={esAdministradorRed(user?.perfil) ? "/dashboard-admin" : "/dashboard"}
        replace
      />
    );
  }

  if (!jornada && pathname !== "/elegir-jornada") {
    return <Navigate to="/elegir-jornada" replace />;
  }

  return (
    <MainLayout showSidebar>
      <Outlet />
    </MainLayout>
  );
}
