import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../sidebar/Sidebar';
import '../Dashboard.css';
import '../theme/admin.css';
import { useAuth } from '../context/auth/auth.context';
import { esAdministradorRed } from '../utils/roles';
import {
  etiquetaPerfil,
  inicialesDeUsuario,
  nombreDeUsuario,
} from '../utils/usuario';

interface MainLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
  role?: 'funcionario' | 'aprendiz' | 'administrador';
}

function tituloDeRuta(pathname: string) {
  if (pathname.startsWith('/dashboard')) return 'Inicio';
  if (pathname.startsWith('/elecciones')) return 'Elecciones';
  if (pathname.startsWith('/funcionarios')) return 'Funcionarios';
  if (pathname.startsWith('/aprendices')) return 'Aprendices';
  if (pathname.startsWith('/aprendiz-form')) return 'Añadir aprendiz';
  if (pathname.startsWith('/cargar-aprendices')) return 'Cargar aprendices';
  if (pathname.startsWith('/gestion-candidatos')) return 'Candidatos';
  if (pathname.startsWith('/nueva-eleccion')) return 'Nueva elección';
  return 'Panel';
}

const MainLayout = ({ children, showSidebar = true, role = 'funcionario' }: MainLayoutProps) => {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const isAdminRed = esAdministradorRed(user?.perfil);

  return (
    <div className={`main-layout ${role}${isAdminRed ? ' theme-admin' : ''}`}>
      {showSidebar && role === 'funcionario' && <Sidebar />}
      
      <main className={`main-content ${showSidebar && role === 'funcionario' ? 'with-sidebar' : ''}`}>
        {isAdminRed && (
          <header className="admin-topbar">
            <div className="admin-topbar-brand">
              <img
                src="/logo_fabrica.png"
                alt="Fábrica de Software SENA"
                className="admin-topbar-fabrica"
              />
              <span className="admin-topbar-sep" aria-hidden />
              <div className="admin-topbar-product">
                <p className="admin-topbar-kicker">SIGEVA</p>
                <p className="admin-topbar-title">{tituloDeRuta(pathname)}</p>
              </div>
            </div>
            <div className="admin-topbar-trace" aria-hidden>
              <svg viewBox="0 0 720 48" preserveAspectRatio="none">
                <path
                  d="M0 24h72v-10h88v10h96v12h110v-12h84v-10h92v10h178"
                  fill="none"
                  stroke="#39A900"
                  strokeWidth="1.4"
                  strokeLinecap="square"
                />
                <path
                  d="M48 36h64v-12h76v12h128v-12h90v12h140"
                  fill="none"
                  stroke="#0E5C63"
                  strokeWidth="1.15"
                  strokeLinecap="square"
                />
                <path
                  d="M24 14h52v10h120"
                  fill="none"
                  stroke="#39A900"
                  strokeWidth="1.15"
                  strokeLinecap="square"
                />
                <circle cx="72" cy="24" r="2.4" fill="#39A900" />
                <circle cx="160" cy="14" r="2.2" fill="#E87A2A" />
                <circle cx="256" cy="24" r="2.4" fill="#39A900" />
                <circle cx="366" cy="36" r="2.2" fill="#0E5C63" />
                <circle cx="450" cy="24" r="2.4" fill="#39A900" />
                <circle cx="542" cy="14" r="2.2" fill="#4A90C8" />
                <circle cx="634" cy="24" r="2.4" fill="#39A900" />
              </svg>
            </div>
            <div className="admin-topbar-user">
              <span className="admin-topbar-avatar" aria-hidden>
                {inicialesDeUsuario(user)}
              </span>
              <span className="admin-topbar-user-meta">
                <strong>{nombreDeUsuario(user)}</strong>
                <small>{etiquetaPerfil(user?.perfil)}</small>
              </span>
            </div>
          </header>
        )}
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
