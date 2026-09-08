import { Link } from "react-router-dom";
import { TbLogout } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth/auth.context";
import { jornadaDelAprendiz } from "../../utils/jornadaAprendiz";
import { SigevaWordmark } from "../landing/SigevaMark";

const Navbar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const jornada = jornadaDelAprendiz(user);

  return (
    <nav className="navbar navbar-light bg-light shadow mb-3" >
      <div className="container-fluid d-flex justify-content-between align-items-center">
        {/* Logo */}
        <Link className="navbar-brand fw-bold text-primary m-0 logo-text" to="/votaciones">
          <SigevaWordmark />
        </Link>

        {/* Navegación central */}
        <div className="d-flex align-items-center">
          <Link to="/votaciones" className="nav-link text-decoration-none me-4">
            <span className="fw-semibold text-primary">¡ Votaciones Activas !</span>
          </Link>
        </div>

        {/* Usuario y logout */}
        <div className="d-flex align-items-center">
          {jornada ? (
            <span className="text-muted me-3">Jornada {jornada}</span>
          ) : null}
          <Link to="/" className="nav-link" onClick={(e) => {
              e.preventDefault();
              logout();
              navigate('/');
            }}>
            <TbLogout size={24} className="text-danger" />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;