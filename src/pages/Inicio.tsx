import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaArrowRight,
  FaVoteYea,
  FaClipboardList,
  FaIdCard,
  FaUserGraduate,
  FaUsers,
  FaAccessibleIcon,
  FaBars,
  FaUser,
  FaCheckSquare,
  FaFileAlt,
  FaHeartbeat,
  FaCalendarAlt,
  FaUserPlus,
  FaCheck,
  FaPercent,
} from "react-icons/fa";
import logoSigeva from "../assets/Sigeva white.svg";
import { api } from "../api";
import "./Inicio.css";

const slides = [
  {
    tituloAntes: "¿Ya conoces ",
    marca: "SIGEVA",
    tituloDespues: "?",
    texto:
      "Vota fácil, desde tu centro y en tu jornada. Elige a tu representante, sigue la elección y haz parte del cambio con una urna digital pensada para aprendices del SENA.",
    cta: "Conócelo aquí",
    to: "/login-aprendiz",
  },
  {
    tituloAntes: "Elige a tu ",
    marca: "representante",
    tituloDespues: "",
    texto:
      "Una convocatoria por centro, candidatos por jornada y un tarjetón claro. Funcionarios arman la elección; tú votas en la urna.",
    cta: "Entrar a votar",
    to: "/login-aprendiz",
  },
];

const atajos = [
  {
    titulo: "Urna",
    texto: "Entra como aprendiz y vota por los candidatos de tu jornada.",
    to: "/login-aprendiz",
    icon: <FaVoteYea />,
    color: "#e8f5e9",
    ink: "#2e7d32",
  },
  {
    titulo: "Elecciones",
    texto: "Crea y sigue las convocatorias de tu centro de formación.",
    to: "/login",
    icon: <FaClipboardList />,
    color: "#ede7f6",
    ink: "#5b2be0",
  },
  {
    titulo: "Candidatos",
    texto: "Arma el tarjetón con foto, propuesta, número y jornada.",
    to: "/login",
    icon: <FaIdCard />,
    color: "#e3f2fd",
    ink: "#1565c0",
  },
  {
    titulo: "Padrón",
    texto: "Consulta y actualiza los aprendices habilitados para votar.",
    to: "/login",
    icon: <FaUserGraduate />,
    color: "#fff8e1",
    ink: "#ef6c00",
  },
  {
    titulo: "Equipo",
    texto: "Conoce quién construye SIGEVA en la fábrica de software.",
    to: "/equipo",
    icon: <FaUsers />,
    color: "#fce4ec",
    ink: "#c2185b",
  },
];

const comoFunciona = [
  {
    n: "01",
    titulo: "Participa",
    texto:
      "Los aprendices pueden unirse fácilmente a los procesos electorales activos de su regional y centro.",
    icon: <FaUser />,
    ink: "#7c3aed",
    bg: "#f3e8ff",
  },
  {
    n: "02",
    titulo: "Elige",
    texto:
      "Consulta los candidatos registrados, revisa sus propuestas y emite tu voto de manera segura y transparente.",
    icon: <FaCheckSquare />,
    ink: "#3b82f6",
    bg: "#dbeafe",
  },
  {
    n: "03",
    titulo: "Gestiona",
    texto:
      "Los funcionarios administran elecciones, candidatos y padrones electorales desde un panel centralizado.",
    icon: <FaFileAlt />,
    ink: "#22c55e",
    bg: "#dcfce7",
  },
  {
    n: "04",
    titulo: "Consulta",
    texto:
      "Visualiza resultados actualizados, métricas de participación y estadísticas de cada proceso electoral.",
    icon: <FaHeartbeat />,
    ink: "#eab308",
    bg: "#fef9c3",
  },
];

const funciones = [
  {
    tag: "Gestión",
    titulo: "Elecciones",
    texto: "Crea, programa y administra procesos electorales para cualquier sede o centro.",
    to: "/login",
    icon: <FaCalendarAlt />,
    ink: "#7c3aed",
    bg: "#f3e8ff",
  },
  {
    tag: "Admin",
    titulo: "Candidatos",
    texto: "Registra candidatos, gestiona propuestas y controla postulaciones.",
    to: "/login",
    icon: <FaUserPlus />,
    ink: "#3b82f6",
    bg: "#dbeafe",
  },
  {
    tag: "Padrón",
    titulo: "Aprendices",
    texto: "Administra el padrón de aprendices habilitados para cada proceso electoral.",
    to: "/login",
    icon: <FaUsers />,
    ink: "#16a34a",
    bg: "#dcfce7",
  },
  {
    tag: "Reportes",
    titulo: "Estadísticas",
    texto: "Consulta resultados en tiempo real y reportes detallados de participación.",
    to: "/login",
    icon: <FaHeartbeat />,
    ink: "#d97706",
    bg: "#fef3c7",
  },
];

const Inicio: React.FC = () => {
  const [slide, setSlide] = useState(0);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [stats, setStats] = useState({
    elecciones: 4,
    aprendices: 1250,
    votos: 856,
    participacion: 74,
  });
  const scroller = useRef<HTMLDivElement>(null);
  const actual = slides[slide];

  useEffect(() => {
    const cargar = async () => {
      try {
        const [resEle, resApr, resVotos] = await Promise.all([
          api.get("api/eleccion/activas"),
          api.get("api/aprendiz/listar"),
          api.get("/api/votoXCandidato/traer"),
        ]);
        const elecciones = resEle.data.eleccionesActivas?.length ?? 4;
        const aprendices = Array.isArray(resApr.data)
          ? resApr.data.length
          : 1250;
        const votos = (resVotos.data?.data || []).length;
        const participacion =
          aprendices > 0 ? Math.round((votos / aprendices) * 100) : 0;
        setStats({ elecciones, aprendices, votos, participacion });
      } catch {
        /* esqueleto: se quedan los números de referencia */
      }
    };
    cargar();
  }, []);

  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <Link to="/" className="landing-fabrica" aria-label="Fábrica de Software">
            <img src="/logo_fabrica.png" alt="Fábrica de Software SENA" />
          </Link>
          <div className="landing-brand">
            <Link to="/" className="landing-brand-sena">
              <img src="/sena.png" alt="SENA" />
            </Link>
            <span className="landing-brand-sep" aria-hidden />
            <Link to="/" className="landing-wordmark">
              SIGEVA
            </Link>
          </div>

          <button
            type="button"
            className="landing-burger"
            aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuAbierto}
            onClick={() => setMenuAbierto((v) => !v)}
          >
            <FaBars />
          </button>

          <ul className={`landing-menu${menuAbierto ? " open" : ""}`}>
            <li>
              <Link to="/" className="active" onClick={() => setMenuAbierto(false)}>
                Inicio
              </Link>
            </li>
            <li>
              <Link to="/login-aprendiz" onClick={() => setMenuAbierto(false)}>
                Urna
              </Link>
            </li>
            <li>
              <a href="#funcionalidades" onClick={() => setMenuAbierto(false)}>
                Elecciones
              </a>
            </li>
            <li>
              <a href="#candidatos" onClick={() => setMenuAbierto(false)}>
                Candidatos
              </a>
            </li>
            <li>
              <a href="#funcionalidades" onClick={() => setMenuAbierto(false)}>
                Padrón
              </a>
            </li>
            <li>
              <Link to="/equipo" onClick={() => setMenuAbierto(false)}>
                Equipo
              </Link>
            </li>
            <li>
              <Link to="/login" onClick={() => setMenuAbierto(false)}>
                Ingreso gestión
              </Link>
            </li>
          </ul>

          <div className="landing-nav-end">
            <button type="button" className="landing-search" aria-label="Buscar">
              <FaSearch />
            </button>
          </div>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-bg" />
        <button
          type="button"
          className="landing-arrow left"
          aria-label="Anterior"
          onClick={() => setSlide((s) => (s === 0 ? slides.length - 1 : s - 1))}
        >
          <FaChevronLeft />
        </button>
        <div className="landing-hero-inner">
          <div className="landing-hero-copy">
            <h1>
              {actual.tituloAntes}
              <em>{actual.marca}</em>
              {actual.tituloDespues}
            </h1>
            <div className="landing-dots" aria-hidden>
              <span style={{ background: "#5b2be0" }} />
              <span style={{ background: "#1e88e5" }} />
              <span style={{ background: "#fbc02d" }} />
              <span style={{ background: "#ef6c00" }} />
            </div>
            <p>{actual.texto}</p>
            <Link to={actual.to} className="landing-cta">
              {actual.cta} <FaArrowRight />
            </Link>
          </div>

          <div className="landing-phone-wrap">
            <div className="landing-phone">
              <div className="landing-phone-screen">
                <img src={logoSigeva} alt="SIGEVA" />
                <h3>SIGEVA</h3>
                <small>Sistema de gestión de votos</small>
                <Link to="/login-aprendiz" className="landing-phone-btn">
                  Iniciar sesión
                </Link>
                <Link to="/login" className="landing-phone-btn ghost">
                  Ingreso gestión
                </Link>
              </div>
            </div>
          </div>

          <aside className="landing-qr">
            <h4>¡Lleva SIGEVA contigo!</h4>
            <img className="qr" src="/landing/qr.png" alt="Código QR de SIGEVA" />
            <p>Escanea el código QR y entra a votar desde tu dispositivo.</p>
            <div className="landing-stores">
              <a className="landing-store" href="/login-aprendiz">
                Consíguelo en
                <span>Google Play</span>
              </a>
              <a className="landing-store" href="/login-aprendiz">
                Descargar en
                <span>App Store</span>
              </a>
            </div>
          </aside>
        </div>
        <button
          type="button"
          className="landing-arrow right"
          aria-label="Siguiente"
          onClick={() => setSlide((s) => (s === slides.length - 1 ? 0 : s + 1))}
        >
          <FaChevronRight />
        </button>
      </section>

      <section className="landing-cards">
        {atajos.map((t) => (
          <Link key={t.titulo} to={t.to} className="landing-card">
            <div className="landing-card-icon" style={{ background: t.color, color: t.ink }}>
              {t.icon}
            </div>
            <h3>{t.titulo}</h3>
            <p>{t.texto}</p>
            <span className="landing-card-go">
              <FaChevronRight size={12} />
            </span>
          </Link>
        ))}
      </section>

      <section className="lp-block lp-impulsado" id="impulsado">
        <p className="lp-badge">Impulsado por</p>
        <h2>Una plataforma construida para conectar participación, tecnología e institución</h2>
        <p className="lp-sub">Tres actores clave. Un solo sistema.</p>
        <div className="lp-actors">
          <article className="lp-actor">
            <div className="lp-actor-logo lp-actor-logo-sena">
              <img src="/sena.png" alt="SENA" />
            </div>
            <h3>SENA</h3>
            <p>Formación, participación y comunidad para toda Colombia.</p>
          </article>
          <article className="lp-actor">
            <div className="lp-actor-logo lp-actor-logo-wide">
              <img src="/logo_fabrica.png" alt="Fábrica de Software SENA" />
            </div>
            <h3>Fábrica de Software</h3>
            <p>Desarrollo e innovación tecnológica al servicio del aprendizaje.</p>
          </article>
          <article className="lp-actor">
            <div className="lp-actor-logo lp-actor-logo-dark">
              <FaCheck />
            </div>
            <h3>SIGEVA</h3>
            <p>Gestión y participación en procesos electorales del SENA.</p>
          </article>
        </div>
      </section>

      <section className="lp-block" id="como-funciona">
        <div className="lp-block-head">
          <div>
            <p className="lp-kicker">¿Cómo funciona?</p>
            <h2>¿Para qué sirve SIGEVA?</h2>
            <p className="lp-sub left">
              Una forma sencilla y organizada de participar en las elecciones del SENA.
            </p>
          </div>
          <div className="lp-carousel-nav">
            <button
              type="button"
              aria-label="Anterior"
              onClick={() => scroller.current?.scrollBy({ left: -280, behavior: "smooth" })}
            >
              <FaChevronLeft />
            </button>
            <button
              type="button"
              aria-label="Siguiente"
              onClick={() => scroller.current?.scrollBy({ left: 280, behavior: "smooth" })}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
        <div className="lp-steps" ref={scroller}>
          {comoFunciona.map((c) => (
            <article key={c.n} className="lp-step">
              <div className="lp-step-top">
                <span className="lp-icon" style={{ background: c.bg, color: c.ink }}>
                  {c.icon}
                </span>
                <span className="lp-num">{c.n}</span>
              </div>
              <h3>{c.titulo}</h3>
              <p>{c.texto}</p>
              <span className="lp-accent" style={{ background: c.ink }} />
            </article>
          ))}
        </div>
      </section>

      <section className="lp-block lp-align-left" id="funcionalidades">
        <p className="lp-kicker lp-kicker-blue">Funcionalidades</p>
        <h2>Todo lo que necesitas para gestionar las elecciones</h2>
        <p className="lp-sub left">Herramientas completas para cada etapa del proceso electoral.</p>
        <div className="lp-feats">
          {funciones.map((f) => (
            <article key={f.titulo} className="lp-feat">
              <div className="lp-feat-top">
                <span className="lp-icon" style={{ background: f.bg, color: f.ink }}>
                  {f.icon}
                </span>
                <span className="lp-pill" style={{ background: f.bg, color: f.ink }}>
                  {f.tag}
                </span>
              </div>
              <h3>{f.titulo}</h3>
              <p>{f.texto}</p>
              <Link to={f.to} className="lp-explore" style={{ color: f.ink }}>
                Explorar <FaArrowRight />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="lp-block lp-resumen" id="resumen">
        <p className="lp-kicker lp-kicker-blue">En tiempo real</p>
        <h2>Resumen de SIGEVA</h2>
        <p className="lp-sub">Datos actualizados sobre los procesos electorales del SENA.</p>
        <div className="lp-stats">
          <article className="lp-stat">
            <span className="lp-icon" style={{ background: "#f3e8ff", color: "#7c3aed" }}>
              <FaCalendarAlt />
            </span>
            <strong>{stats.elecciones}</strong>
            <h3>Elecciones activas</h3>
            <p>En este período</p>
            <span className="lp-accent" style={{ background: "#7c3aed" }} />
          </article>
          <article className="lp-stat">
            <span className="lp-icon" style={{ background: "#dbeafe", color: "#3b82f6" }}>
              <FaUsers />
            </span>
            <strong>{stats.aprendices.toLocaleString("es-CO")}</strong>
            <h3>Aprendices</h3>
            <p>En el padrón</p>
            <span className="lp-accent" style={{ background: "#3b82f6" }} />
          </article>
          <article className="lp-stat">
            <span className="lp-icon" style={{ background: "#dcfce7", color: "#16a34a" }}>
              <FaCheck />
            </span>
            <strong>{stats.votos.toLocaleString("es-CO")}</strong>
            <h3>Votos registrados</h3>
            <p>Esta jornada</p>
            <span className="lp-accent" style={{ background: "#22c55e" }} />
          </article>
          <article className="lp-stat">
            <span className="lp-icon" style={{ background: "#fef3c7", color: "#d97706" }}>
              <FaPercent />
            </span>
            <strong>{stats.participacion}%</strong>
            <h3>Participación</h3>
            <p>Promedio general</p>
            <span className="lp-accent" style={{ background: "#eab308" }} />
          </article>
        </div>
      </section>

      <section className="lp-split-wrap" id="candidatos">
        <article className="lp-split">
          <div className="lp-split-media">
            <img src="/landing/candidatos.jpg" alt="Aprendices revisando propuestas" />
          </div>
          <div>
            <p className="lp-kicker">Candidatos</p>
            <h2>Conoce a los candidatos y sus propuestas</h2>
            <p>
              Consulta los perfiles de quienes participan en los procesos electorales, conoce sus
              propuestas y ejerce tu voto de manera informada.
            </p>
            <Link to="/login-aprendiz" className="landing-cta landing-cta-rect">
              Ver candidatos <FaArrowRight />
            </Link>
          </div>
        </article>

        <article className="lp-split reverse" id="convocatorias">
          <div className="lp-split-media">
            <img src="/landing/convocatorias.jpg" alt="Convocatoria de elección" />
          </div>
          <div>
            <p className="lp-kicker lp-kicker-blue">Convocatorias</p>
            <h2>Participa en las convocatorias de tu centro</h2>
            <p>
              Cada centro tiene una elección. Entra con tu jornada y vota en la urna cuando el
              proceso esté activo.
            </p>
            <Link to="/login-aprendiz" className="landing-cta landing-cta-rect">
              Ver convocatorias <FaArrowRight />
            </Link>
          </div>
        </article>
      </section>

      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-foot-about">
            <div className="lp-foot-brand">
              <span className="lp-foot-mark">
                <FaCheck />
              </span>
              <div>
                <strong>SIGEVA</strong>
                <small>Sistema Electoral SENA</small>
              </div>
            </div>
            <p>
              Plataforma oficial del SENA para la gestión y participación en procesos electorales de
              aprendices.
            </p>
            <div className="lp-foot-partners">
              <div className="lp-partner">
                <img src="/sena.png" alt="SENA" />
              </div>
              <div className="lp-partner lp-partner-fabrica">
                <img src="/logo_fabrica.png" alt="Fábrica de Software SENA - Centro" />
              </div>
            </div>
          </div>
          <div>
            <h4>Plataforma</h4>
            <Link to="/login">Elecciones</Link>
            <Link to="/login">Candidatos</Link>
            <Link to="/login">Aprendices</Link>
            <a href="#resumen">Estadísticas</a>
          </div>
          <div>
            <h4>Información</h4>
            <a href="#impulsado">Sobre SIGEVA</a>
            <a href="#como-funciona">Manual de usuario</a>
            <a href="#impulsado">Política de privacidad</a>
            <a href="#como-funciona">Preguntas frecuentes</a>
          </div>
          <div>
            <h4>Soporte</h4>
            <a href="mailto:contacto@misena.edu.co">Centro de ayuda</a>
            <a href="mailto:contacto@misena.edu.co">Reportar problema</a>
            <a href="mailto:contacto@misena.edu.co">Contacto técnico</a>
          </div>
        </div>
        <div className="lp-footer-bar">
          <span>© 2026 SIGEVA · Sistema Electoral SENA</span>
          <span>Impulsado por la Fábrica de Software</span>
        </div>
      </footer>

      <button type="button" className="landing-a11y" aria-label="Accesibilidad">
        <FaAccessibleIcon />
      </button>
    </div>
  );
};

export default Inicio;
