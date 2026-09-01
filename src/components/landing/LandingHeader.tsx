import { useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaArrowRight, FaBars } from "react-icons/fa";
import { SigevaWordmark, SigevaName } from "./SigevaMark";

type NavKey = "inicio" | "elecciones" | "informacion" | "sobre" | "equipo";

const links: { id: NavKey; label: ReactNode; to: string }[] = [
  { id: "inicio", label: "Inicio", to: "/" },
  { id: "elecciones", label: "Elecciones", to: "/#elecciones" },
  { id: "informacion", label: "Información", to: "/#informacion" },
  { id: "sobre", label: <>Sobre <SigevaName /></>, to: "/#sobre" },
  { id: "equipo", label: <>Equipo <SigevaName /></>, to: "/equipo" },
];

export default function LandingHeader() {
  const [abierto, setAbierto] = useState(false);
  const { pathname, hash } = useLocation();

  const activo: NavKey =
    pathname === "/equipo"
      ? "equipo"
      : hash === "#sobre"
        ? "sobre"
        : hash === "#elecciones" || hash === "#acciones"
          ? "elecciones"
          : hash === "#informacion"
            ? "informacion"
            : "inicio";

  return (
    <header className="lp-nav">
      <div className="lp-nav-inner">
        <Link to="/" className="lp-nav-brand" aria-label="SIGEVA inicio" onClick={() => setAbierto(false)}>
          <img src="/logo_fabrica.png" alt="Fábrica de Software SENA" className="lp-nav-fabrica" />
          <span className="lp-nav-sep" aria-hidden />
          <img src="/sena.png" alt="SENA" className="lp-nav-sena" />
          <span className="lp-nav-sep" aria-hidden />
          <SigevaWordmark />
        </Link>

        <button
          type="button"
          className="lp-burger"
          aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={abierto}
          onClick={() => setAbierto((v) => !v)}
        >
          <FaBars />
        </button>

        <ul className={`lp-menu${abierto ? " open" : ""}`}>
          {links.map((l) => (
            <li key={l.id}>
              <Link
                to={l.to}
                className={activo === l.id ? "active" : undefined}
                onClick={() => setAbierto(false)}
              >
                {l.label}
              </Link>
            </li>
          ))}
          <li className="lp-menu-cta">
            <Link to="/login-aprendiz" className="lp-btn lp-btn-dark" onClick={() => setAbierto(false)}>
              Ingresar <FaArrowRight />
            </Link>
          </li>
        </ul>

        <Link to="/login-aprendiz" className="lp-btn lp-btn-dark lp-nav-cta">
          Ingresar <FaArrowRight />
        </Link>
      </div>
    </header>
  );
}
