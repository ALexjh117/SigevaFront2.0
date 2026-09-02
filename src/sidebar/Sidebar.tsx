import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FaHome,
  FaUserTie,
  FaUsers,
  FaSignOutAlt,
  FaClipboardList,
  FaUserGraduate,
  FaUserPlus,
  FaChevronDown,
  FaChartBar,
  FaVoteYea
} from 'react-icons/fa';
import { Button, Dropdown } from 'react-bootstrap';
import { BsList } from 'react-icons/bs';
import "./sidebar.css";
import { useAuth } from '../context/auth/auth.context';
import {
  esAdministradorRed,
  esAprendiz,
  esRolDeCentro,
  usaTemaAdmin
} from '../utils/roles';
import { jornadaDelAprendiz } from '../utils/jornadaAprendiz';
import { CarruselCandidatosSidebar } from '../components/aprendiz/CarruselCandidatosNav';
import { SigevaWordmark } from '../components/landing/SigevaMark';

interface SidebarProps {
  onNavigate?: () => void;
}

type LinkItem = {
  to: string;
  icon: React.ReactNode;
  text: string;
  type: 'link';
};

type DropdownChild = {
  to: string;
  icon: React.ReactNode;
  text: string;
};

type DropdownItem = {
  type: 'dropdown';
  text: string;
  icon: React.ReactNode;
  items: DropdownChild[];
};

type NavItem = LinkItem | DropdownItem;

const Sidebar: React.FC<SidebarProps> = ({ onNavigate }) => {

  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  const [showSidebar, setShowSidebar] = useState(!isMobile);

  // Estado para mostrar la ventana de confirmación
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const isAdmin = usaTemaAdmin(user?.perfil);
  const sidebarClass = isAdmin ? 'admin-sidebar' : '';
  const jornadaAprendiz = jornadaDelAprendiz(user);

  // Manejar redimensionamiento
  useEffect(() => {

    const handleResize = () => {

      const mobile = window.innerWidth < 992;

      setIsMobile(mobile);
      setShowSidebar(!mobile);

    };

    window.addEventListener('resize', handleResize);

    handleResize();

    return () => window.removeEventListener('resize', handleResize);

  }, []);

  // Obtener enlaces según el rol
  const getNavItems = useCallback((): NavItem[] => {

    if (!user) return [] as NavItem[];

    const commonItems: NavItem[] = [];

    // APRENDIZ
    if (esAprendiz(user.perfil)) {

      return [
        {
          to: '/votaciones',
          icon: <FaVoteYea />,
          text: 'Votos',
          type: 'link'
        },
      ];

    }

    // ROL DE CENTRO
    if (esRolDeCentro(user.perfil)) {

      return [
        {
          to: '/dashboard',
          icon: <FaHome />,
          text: 'Inicio',
          type: 'link'
        },

        {
          to: '/panel-metricas',
          icon: <FaChartBar />,
          text: 'Estadísticas',
          type: 'link'
        },

        {
          type: 'dropdown',
          text: 'Gestión de Usuarios',
          icon: <FaUsers />,
          items: [
            {
              to: '/aprendices',
              icon: <FaUserGraduate />,
              text: 'Aprendices'
            },
          ]
        },

        {
          to: '/cargar-aprendices',
          icon: <FaUserPlus />,
          text: 'Cargar Aprendices',
          type: 'link'
        },

        {
          to: '/elecciones',
          icon: <FaClipboardList />,
          text: 'Elecciones',
          type: 'link'
        },
      ];

    }

    // ADMINISTRADOR DE RED
    if (esAdministradorRed(user.perfil)) {

      return [
        {
          to: '/dashboard-admin',
          icon: <FaHome />,
          text: 'Dashboard',
          type: 'link'
        },

        {
          to: '/panel-metricas',
          icon: <FaChartBar />,
          text: 'Estadísticas',
          type: 'link'
        },

        {
          to: '/elecciones',
          icon: <FaClipboardList />,
          text: 'Elecciones de la red',
          type: 'link'
        },

        {
          to: '/aprendices',
          icon: <FaUserGraduate />,
          text: 'Aprendices',
          type: 'link'
        },

        {
          type: 'dropdown',
          text: 'Gestión de Usuarios',
          icon: <FaUsers />,
          items: [
            {
              to: '/funcionarios',
              icon: <FaUserTie />,
              text: 'Funcionarios'
            },

            {
              to: '/cargar-aprendices-admin',
              icon: <FaUserPlus />,
              text: 'Cargar aprendices'
            },
          ]
        },

        {
          to: '/aprendiz-form',
          icon: <FaUserPlus />,
          text: 'Añadir Aprendiz',
          type: 'link'
        },
      ];

    }

    return commonItems;

  }, [user]);

  // Manejar navegación
  const handleNavigation = (
    e: React.MouseEvent,
    to: string
  ) => {

    e.preventDefault();

    navigate(to);

    if (isMobile) {

      setShowSidebar(false);

      onNavigate?.();

    }

  };

  const navItems = getNavItems();

  // Saber qué opción está activa
  const isActive = (to: string) => {

    const path = to.split('?')[0].split('#')[0];

    if (path === '/votaciones') {

      return (
        location.pathname === '/votaciones' ||
        location.pathname.startsWith('/seleccion') ||
        location.pathname.startsWith('/confirmar-voto')
      );

    }

    return location.pathname === path;

  };

  // Confirmar cierre de sesión
  const confirmarCerrarSesion = () => {

    setMostrarConfirmacion(false);

    logout();

    navigate('/');

  };

  return (
    <>
      {/* =====================================
          BOTÓN DE MENÚ EN MÓVIL
          ===================================== */}

      {isMobile && (
        <Button
          variant="light"
          className="sidebar-toggle"
          onClick={() => setShowSidebar(true)}
        >
          <BsList size={24} />
        </Button>
      )}


      {/* =====================================
          OVERLAY DEL SIDEBAR EN MÓVIL
          ===================================== */}

      {isMobile && showSidebar && (
        <div
          className="sidebar-overlay"
          onClick={() => setShowSidebar(false)}
        />
      )}


      {/* =====================================
          SIDEBAR
          ===================================== */}

      <div
        className={`sidebar-container ${sidebarClass} ${
          showSidebar ? 'open' : ''
        }${esAprendiz(user?.perfil) ? ' has-carrusel' : ''}`}
      >

        {/* LOGO */}
        <div className="sidebar-logo">

          <img
            src="/sena.png"
            alt="SENA"
            className="logo-sena"
          />

          <span
            className="sidebar-logo-sep"
            aria-hidden
          />

          <SigevaWordmark />

        </div>


        {/* =====================================
            MENÚ
            ===================================== */}

        <nav className="sidebar-nav">

          {navItems.map(
            (item: NavItem, index: number) => {

              // DROPDOWN
              if (item.type === 'dropdown') {

                return (
                  <Dropdown
                    key={index}
                    className="sidebar-dropdown"
                  >

                    <Dropdown.Toggle
                      as="div"
                      className={`sidebar-link ${
                        item.items.some(
                          (i: DropdownChild) =>
                            isActive(i.to)
                        )
                          ? 'active'
                          : ''
                      }`}
                    >

                      <span className="sidebar-icon">
                        {item.icon}
                      </span>

                      <span className="sidebar-text">
                        {item.text}
                      </span>

                      <FaChevronDown className="ms-auto" />

                    </Dropdown.Toggle>


                    <Dropdown.Menu className="sidebar-submenu">

                      {item.items.map(
                        (
                          subItem: DropdownChild,
                          subIndex: number
                        ) => (

                          <Dropdown.Item
                            key={subIndex}
                            as={Link}
                            to={subItem.to}
                            className={`dropdown-item ${
                              isActive(subItem.to)
                                ? 'active'
                                : ''
                            }`}
                            onClick={(
                              e: React.MouseEvent
                            ) =>
                              handleNavigation(
                                e,
                                subItem.to
                              )
                            }
                          >

                            <span className="sidebar-icon">
                              {subItem.icon}
                            </span>

                            <span className="sidebar-text">
                              {subItem.text}
                            </span>

                          </Dropdown.Item>

                        )
                      )}

                    </Dropdown.Menu>

                  </Dropdown>
                );
              }


              // LINK NORMAL
              return (
                <Link
                  key={index}
                  to={item.to}
                  className={`sidebar-link ${
                    isActive(item.to)
                      ? 'active'
                      : ''
                  }`}
                  onClick={(e) =>
                    handleNavigation(
                      e,
                      item.to
                    )
                  }
                >

                  <span className="sidebar-icon">
                    {item.icon}
                  </span>

                  <span className="sidebar-text">
                    {item.text}
                  </span>

                </Link>
              );

            }
          )}

        </nav>


        {/* CARRUSEL PARA APRENDICES */}
        {esAprendiz(user?.perfil)
          ? <CarruselCandidatosSidebar />
          : null}


        {/* MENSAJE ADMIN */}
        {isAdmin &&
          !esAprendiz(user?.perfil) && (
            <blockquote className="sidebar-motto">

              <p>
                La inteligencia es un privilegio:
                cobra valor cuando se comparte
                y se usa para el bien de los demás.
              </p>

            </blockquote>
          )}


        {/* =====================================
            FOOTER
            ===================================== */}

        <div className="sidebar-footer">

          {esAprendiz(user?.perfil) &&
            jornadaAprendiz ? (

            <span className="sidebar-user">
              Jornada {jornadaAprendiz}
            </span>

          ) : isAdmin &&
            user?.email ? (

            <span className="sidebar-user">
              {user.email}
            </span>

          ) : null}


          {/* BOTÓN CERRAR SESIÓN */}
          <button
            className="sidebar-link"
            onClick={(e) => {

              e.preventDefault();

              // Mostrar ventana de confirmación
              setMostrarConfirmacion(true);

            }}
          >

            <FaSignOutAlt className="sidebar-icon" />

            <span className="sidebar-text">
              Cerrar Sesión
            </span>

          </button>

        </div>

      </div>


      {/* ==========================================
          MODAL DE CONFIRMACIÓN
          
          IMPORTANTE:
          Está FUERA del sidebar-container
          para que quede centrado en toda
          la pantalla.
          ========================================== */}

      {mostrarConfirmacion && (

        <div className="modal-overlay">

          <div className="modal-confirmacion">

            <div className="modal-icon">
              <FaSignOutAlt />
            </div>

            <h3>
              ¿Está seguro de cerrar sesión?
            </h3>

            <p>
              ¿Estás seguro de que quieres cerrar sesión? Si tienes cambios sin guardar, se perderan 
            </p>

            <div className="modal-botones">

              {/* CANCELAR */}
              <button
                className="btn-cancelar"
                onClick={() =>
                  setMostrarConfirmacion(false)
                }
              >
                Cancelar
              </button>


              {/* CERRAR SESIÓN */}
              <button
                className="btn-cerrar"
                onClick={confirmarCerrarSesion}
              >
                Sí, cerrar sesión
              </button>

            </div>

          </div>

        </div>

      )}

    </>
  );
};

export default Sidebar;