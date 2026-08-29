import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaArrowRight,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaHome,
  FaUser,
  FaCalendarCheck,
  FaUsers,
  FaBullhorn,
  FaChartBar,
  FaCheck,
  FaCogs,
  FaShieldAlt,
  FaVoteYea,
} from "react-icons/fa";
import LandingHeader from "../components/landing/LandingHeader";
import LandingFooter from "../components/landing/LandingFooter";
import { SigevaMark, SigevaWordmark, SigevaName } from "../components/landing/SigevaMark";
import "./Inicio.css";

function Marca() {
  return <SigevaName />;
}

const infoCards = [
  {
    id: "que-es",
    titulo: <>¿Qué es <Marca />?</>,
    aria: "¿Qué es SIGEVA?",
    texto:
      "Es la plataforma oficial del SENA para gestionar y participar en los procesos electorales de forma digital, clara y segura.",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M12 3 20 7.5v9L12 21 4 16.5v-9L12 3Z" />
        <path d="M12 12 20 7.5M12 12v9M12 12 4 7.5" />
      </svg>
    ),
  },
  {
    id: "para-que",
    titulo: "¿Para qué sirve?",
    aria: "¿Para qué sirve?",
    texto:
      "Consulta elecciones, conoce candidatos, emite tu voto y revisa resultados desde un solo lugar, con tu cuenta institucional.",
    icon: <FaCheck />,
  },
  {
    id: "como",
    titulo: "¿Cómo funciona?",
    aria: "¿Cómo funciona?",
    texto:
      "Ingresas, eliges tu jornada y participas en los procesos activos de tu centro. El sistema organiza cada etapa del proceso.",
    icon: <FaCogs />,
  },
  {
    id: "quien",
    titulo: "¿Quién puede usarlo?",
    aria: "¿Quién puede usarlo?",
    texto:
      "Aprendices, funcionarios y administradores del SENA, cada uno con las acciones que le corresponden dentro de la plataforma.",
    icon: <FaUsers />,
  },
  {
    id: "por-que",
    titulo: <>¿Por qué usar <Marca />?</>,
    aria: "¿Por qué usar SIGEVA?",
    texto:
      "Porque hace el proceso más simple, seguro y transparente, y te permite participar desde cualquier dispositivo, cuando lo necesites.",
    icon: <FaShieldAlt />,
  },
];

const acciones = [
  {
    titulo: "Elecciones",
    texto: "Consulta y participa en los procesos electorales disponibles.",
    cta: "Ver elecciones",
    to: "/login-aprendiz",
    img: "/landing/login-voto.png",
    alt: "Aprendiz depositando su voto",
    icon: <FaCalendarCheck />,
  },
  {
    titulo: "Candidatos",
    texto: "Conoce los candidatos y consulta información de sus postulaciones.",
    cta: "Ver candidatos",
    to: "/login-aprendiz",
    img: "/landing/hero-equipo.jpg",
    alt: "Aprendices trabajando en equipo",
    icon: <FaUsers />,
  },
  {
    titulo: "Convocatorias",
    texto: "Consulta las convocatorias disponibles y conoce cómo participar en los procesos.",
    cta: "Ver convocatorias",
    to: "/login-aprendiz",
    img: "/landing/convocatorias.jpg",
    alt: "Aprendices en una convocatoria",
    icon: <FaBullhorn />,
  },
  {
    titulo: "Resultados",
    texto: "Consulta información y estadísticas relacionadas con los procesos electorales.",
    cta: "Ver resultados",
    to: "/login",
    img: "/landing/resultados.svg",
    alt: "Consulta de resultados y métricas",
    icon: <FaChartBar />,
  },
];

const Inicio: React.FC = () => {
  const scroller = useRef<HTMLDivElement>(null);
  const [punto, setPunto] = useState(0);
  const { hash } = useLocation();

  useEffect(() => {
    const id = hash.replace("#", "");
    if (!id) return;
    const t = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }, 50);
    return () => window.clearTimeout(t);
  }, [hash]);

  const mover = (dir: number) => {
    const el = scroller.current;
    if (!el) return;
    const w = el.querySelector("article")?.clientWidth ?? 220;
    el.scrollBy({ left: dir * (w + 16), behavior: "smooth" });
    setPunto((p) => Math.min(infoCards.length - 1, Math.max(0, p + dir)));
  };

  const irA = (i: number) => {
    const el = scroller.current;
    if (!el) return;
    const card = el.querySelectorAll("article")[i] as HTMLElement | undefined;
    card?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
    setPunto(i);
  };

  return (
    <div className="landing">
      <LandingHeader />

      <section className="lp-hero">
        <picture>
          <source srcSet="/landing/hero-votacion.webp" type="image/webp" />
          <img
            className="lp-hero-photo"
            src="/landing/hero-votacion.jpg"
            alt=""
            aria-hidden
            fetchPriority="high"
          />
        </picture>
        <div className="lp-hero-veil" />
        <div className="lp-hero-inner">
          <div className="lp-hero-copy">
            <h1>
              ¿Ya conoces
              <em>
                <SigevaName />?
              </em>
            </h1>
            <p>
              Gestiona y participa en los procesos electorales del SENA de manera fácil, segura y
              transparente.
            </p>
            <p>Consulta elecciones, conoce candidatos y participa desde cualquier dispositivo.</p>
            <Link to="/login-aprendiz" className="lp-btn lp-btn-dark lp-btn-hero">
              Ingresa aquí <FaArrowRight />
            </Link>
          </div>

          <div className="lp-hero-visual">
            <div className="lp-phone" aria-hidden>
              <div className="lp-phone-notch" />
              <div className="lp-phone-screen">
                <div className="lp-app-status">
                  <span>9:41</span>
                  <b />
                </div>
                <header className="lp-app-head">
                  <SigevaMark size={26} />
                  <FaSearch />
                </header>
                <p className="lp-app-hi">¡Hola, Aprendiz! 👋</p>
                <article className="lp-app-election">
                  <strong>Elección Representantes Aprendices 2023</strong>
                  <span>Votación abierta</span>
                </article>
                <p className="lp-app-label">Acciones rápidas</p>
                <div className="lp-app-quick">
                  <span>
                    <FaCalendarCheck />
                  </span>
                  <span>
                    <FaUsers />
                  </span>
                </div>
                <nav className="lp-app-bar">
                  <span className="on">
                    <FaHome />
                  </span>
                  <span>
                    <FaVoteYea />
                  </span>
                  <span>
                    <FaUsers />
                  </span>
                  <span>
                    <FaUser />
                  </span>
                </nav>
              </div>
            </div>

            <aside className="lp-qr">
              <h4>
                Lleva <Marca /> contigo
              </h4>
              <p>Escanea el código QR y accede a SIGEVA desde tu dispositivo móvil.</p>
              <img src="/landing/qr.png" alt="Código QR de SIGEVA" />
              <div className="lp-qr-status">
                <i /> Disponible para móviles
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="lp-section lp-info" id="informacion">
        <h2>
          ¿Qué es <Marca />?
        </h2>
        <p className="lp-lead">
          <Marca /> es la plataforma del SENA para la gestión y participación en los procesos
          electorales de aprendices. Aquí encuentras lo esencial para entender cómo funciona.
        </p>
        <div className="lp-carousel">
          <button type="button" className="lp-caro-btn" aria-label="Anterior" onClick={() => mover(-1)}>
            <FaChevronLeft />
          </button>
          <div
            className="lp-info-track"
            ref={scroller}
            onScroll={() => {
              const el = scroller.current;
              if (!el) return;
              const w = el.querySelector("article")?.clientWidth ?? 1;
              setPunto(Math.round(el.scrollLeft / (w + 16)));
            }}
          >
            {infoCards.map((c) => (
              <article key={c.id} className="lp-info-card">
                <span className="lp-info-icon">{c.icon}</span>
                <h3>{c.titulo}</h3>
                <p>{c.texto}</p>
              </article>
            ))}
          </div>
          <button type="button" className="lp-caro-btn" aria-label="Siguiente" onClick={() => mover(1)}>
            <FaChevronRight />
          </button>
        </div>
        <div className="lp-dots" role="tablist" aria-label="Tarjetas de información">
          {infoCards.map((c, i) => (
            <button
              key={c.id}
              type="button"
              className={i === punto ? "on" : undefined}
              aria-label={c.aria}
              onClick={() => irA(i)}
            />
          ))}
        </div>
      </section>

      <section className="lp-section" id="acciones">
        <h2>
          ¿Qué puedes hacer en <Marca />?
        </h2>
        <p className="lp-lead">Explora las principales acciones que puedes realizar en la plataforma.</p>
        <div className="lp-actions">
          {acciones.map((a) => (
            <article key={a.titulo} className="lp-action">
              <div className="lp-action-media">
                <img src={a.img} alt={a.alt} />
                <span className="lp-action-icon">{a.icon}</span>
              </div>
              <div className="lp-action-body">
                <h3>{a.titulo}</h3>
                <p>{a.texto}</p>
                <Link to={a.to} className="lp-btn lp-btn-green">
                  {a.cta} <FaArrowRight />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="lp-section" id="elecciones">
        <h2>Elecciones y convocatorias</h2>
        <p className="lp-lead">
          Conoce las elecciones y convocatorias disponibles y encuentra toda la información necesaria
          para participar.
        </p>
        <div className="lp-duos">
          <article className="lp-duo">
            <div className="lp-duo-copy">
              <h3>Elecciones</h3>
              <p>Consulta las elecciones disponibles y participa activamente.</p>
              <Link to="/login-aprendiz" className="lp-btn lp-btn-dark">
                Ver elecciones <FaArrowRight />
              </Link>
            </div>
            <img src="/landing/login-voto.png" alt="Aprendiz depositando su voto" />
          </article>
          <article className="lp-duo">
            <div className="lp-duo-copy">
              <h3>Convocatorias</h3>
              <p>Conoce las convocatorias y oportunidades para participar.</p>
              <Link to="/login-aprendiz" className="lp-btn lp-btn-dark">
                Ver convocatorias <FaArrowRight />
              </Link>
            </div>
            <img src="/landing/convocatorias.jpg" alt="Aprendices revisando una convocatoria" />
          </article>
        </div>
      </section>

      <section className="lp-section lp-cta-wrap">
        <div className="lp-cta">
          <span className="lp-cta-icon" aria-hidden>
            <svg viewBox="0 0 48 48" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M10 20h28v18a3 3 0 0 1-3 3H13a3 3 0 0 1-3-3V20Z" />
              <path d="M8 20h32l-4-10H12L8 20Z" />
              <path d="M24 8v8" />
              <path d="M19 30.5 22.2 34l7-8" />
            </svg>
          </span>
          <div>
            <h2>Tu participación hace la diferencia</h2>
            <p>
              Forma parte de los procesos electorales del SENA de manera sencilla, segura y
              transparente.
            </p>
          </div>
          <Link to="/login-aprendiz" className="lp-btn lp-btn-white">
            Ingresar a <Marca /> <FaArrowRight />
          </Link>
        </div>
      </section>

      <section className="lp-section lp-backers" id="sobre">
        <h2>Una plataforma respaldada por nuestra comunidad</h2>
        <div className="lp-logos">
          <div className="lp-logo-item">
            <img src="/sena.png" alt="SENA" className="lp-logo-sena" />
            <span>SENA</span>
          </div>
          <span className="lp-logo-sep" />
          <div className="lp-logo-item">
            <img src="/logo_fabrica.png" alt="Fábrica de Software" className="lp-logo-fab" />
            <span>Fábrica de Software</span>
          </div>
          <span className="lp-logo-sep" />
          <div className="lp-logo-item">
            <SigevaWordmark />
          </div>
        </div>
        <p className="lp-backers-link">
          <Link to="/equipo">
            Conoce al equipo que construye <Marca />
          </Link>
        </p>
      </section>

      <LandingFooter />
    </div>
  );
};

export default Inicio;
