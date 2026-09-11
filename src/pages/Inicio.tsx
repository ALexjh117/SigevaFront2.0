import { useEffect, useRef, useState } from "react";
import { FaShieldAlt } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import ChatBot from "../components/ChatBot/ChatBot";
import {
  FaArrowRight,
  FaSearch,
  FaHome,
  FaUser,
  FaCalendarCheck,
  FaUsers,
   FaBullseye, 
   FaEye,
  FaChartBar,
  FaCheck,
  FaCogs,
  FaPuzzlePiece,
  FaVoteYea,
} from "react-icons/fa";
import LandingHeader from "../components/landing/LandingHeader";
import LandingFooter from "../components/landing/LandingFooter";
import { SigevaWordmark, SigevaName } from "../components/landing/SigevaMark";
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
      "SIGEVA es el Sistema de Gestión de Votación del SENA, una plataforma digital que permite a los aprendices participar de manera clara, fácil y segura en los procesos electorales de su centro de formación.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      >
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
      "Permite consultar elecciones, conocer candidatos y sus propuestas, emitir el voto y consultar los resultados de los procesos electorales desde un solo lugar.",
    icon: <FaCheck />,
  },
  {
    id: "como",
    titulo: "¿Cómo funciona?",
    aria: "¿Cómo funciona?",
    texto:
      "Ingresa de acuerdo con tu perfil. Como aprendiz podrás consultar los procesos activos de tu centro, seleccionar tu jornada y participar en las elecciones habilitadas.",
    icon: <FaCogs />,
  },
  {
    id: "quien",
    titulo: "¿Quién puede usarlo?",
    aria: "¿Quién puede usarlo?",
    texto:
      "Aprendices y funcionarios del SENA acceden a la plataforma según su perfil y las funciones habilitadas para cada usuario. La participación en las votaciones corresponde a los aprendices.",
    icon: <FaUsers />,
  },
  {
    id: "por-que",
    titulo: <>¿Por qué usar <Marca />?</>,
    aria: "¿Por qué usar SIGEVA?",
    texto:
      "Porque facilita procesos electorales más simples, seguros y transparentes, permitiendo acceder a la información desde diferentes dispositivos.",
    icon: <FaShieldAlt />,
  },
];
const acciones = [
  {
    titulo: "Elecciones",
    texto:
      "Consulta como aprendiz las elecciones activas y ejerce tu derecho al voto de forma fácil y segura.",
    img: "/landing/login-voto.png",
    alt: "Aprendiz depositando su voto",
    icon: <FaCalendarCheck />,
  },
  {
    titulo: "Candidatos",
    texto:
      "Conoce a los candidatos, descubre sus propuestas. Participa en las elecciones y haz que tu voz cuente con tu voto.",
    img: "/landing/hero-equipo.jpg",
    alt: "Aprendices trabajando en equipo",
    icon: <FaUsers />,
  },
  {
    titulo: "Resultados",
    texto:
      "Consulta el avance del escrutinio en tiempo real y conoce los resultados de los procesos electorales.",
    img: "/landing/resultados.svg",
    alt: "Consulta de resultados y métricas",
    icon: <FaChartBar />,
  },
];

const Inicio: React.FC = () => {
  const scroller = useRef<HTMLDivElement>(null);
  const { hash } = useLocation();
  const [tarjetaActiva, setTarjetaActiva] = useState<string | null>(null);

  useEffect(() => {
    const id = hash.replace("#", "");
    if (!id) return;
    const t = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }, 50);
    return () => window.clearTimeout(t);
  }, [hash]);

  return (
    <div className="landing">
      <LandingHeader />

      <section className="lp-hero">
        <picture>
          <img
            className="lp-hero-photo"
            src="/landing/imagenlanding.jpg"
            alt="Aprendices consultando información en un celular y una tableta"
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
                  <img src="/landing/logosigeva.jpg" alt="" width={26} height={26} aria-hidden="true" />
                  <FaSearch />
                </header>
                <p className="lp-app-hi">¡Hola, Aprendiz! 👋</p>
                <article className="lp-app-election">
                  <strong>Elección Representantes Aprendices 2026</strong>
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
              <p>Descarga SIGEVA o accede desde la versión web móvil.</p>
              <img src="/landing/qr.png" alt="Código QR de SIGEVA" />
              <div className="lp-qr-status">
                <i /> O Vota sin descargar 
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="lp-section lp-info" id="informacion">
        
        <div className="lp-carousel">
          <div
            className="lp-info-track"
            ref={scroller}
            onScroll={() => {
              const el = scroller.current;
              if (!el) return;

              // sin puntos ni flechas: solo mantenemos el seguimiento visual del scroll
              void el.querySelector("article")?.clientWidth;
            }}
          >
            {infoCards.map((c) => {
              const activa = tarjetaActiva === c.id;

              return (
                <article
                  key={c.id}
                  className={`lp-info-card ${activa ? "is-flipped" : ""}`}
                  onClick={() =>
                    setTarjetaActiva((actual) => (actual === c.id ? null : c.id))
                  }
                  tabIndex={0}
                  role="button"
                  aria-label={c.aria}
                >
                  <div className="lp-info-card-inner">
                    <div className="lp-info-card-face lp-info-card-front">
                      <span className="lp-info-icon">{c.icon}</span>
                      <h3>{c.titulo}</h3>
                    </div>

                    <div className="lp-info-card-face lp-info-card-back">
                      <p>{c.texto}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

  <section className="lp-section" id="acciones">
  <h2>
    ¿Qué puedes hacer en <Marca />?
  </h2>

  <p className="lp-lead">
    Todo lo que necesitas para participar en los procesos electorales.
  </p>

  <div className="lp-actions">
    {acciones.map((a) => (
      <article key={a.titulo} className="lp-action">
        <div className="lp-action-media">
          <img src={a.img} alt={a.alt} />

          <span className="lp-action-icon">
            {a.icon}
          </span>
        </div>

        <div className="lp-action-body">
          <h3>{a.titulo}</h3>
          <p>{a.texto}</p>
        </div>
      </article>
    ))}
  </div>
</section>

      <section className="lp-section" id="elecciones">
  <h2>Acceso a la plataforma</h2>

  <p className="lp-lead">
    Selecciona tu rol para acceder a las funciones disponibles como Aprendiz o Funcionario.
  </p>

  <div className="lp-duos">

    {/* MISIÓN */}
    <article className="lp-duo">
      <img
        src="/landing/login-voto.png"
        alt="Participación electoral en SIGEVA"
      />

      <div className="lp-duo-copy">
        <span className="lp-duo-icon" aria-hidden="true">
          <FaBullseye />
        </span>

        <h3>Misión</h3>

        <p>
          Promover una participación electoral activa, informada y transparente
          dentro de la comunidad SENA mediante herramientas digitales
          accesibles y confiables.
        </p>
      </div>
    </article>

    {/* VISIÓN */}
    <article className="lp-duo">
      <img
        src="/landing/convocatorias.jpg"
        alt="Comunidad SENA participando en procesos electorales"
      />

      <div className="lp-duo-copy">
        <span className="lp-duo-icon lp-duo-icon-vision" aria-hidden="true">
          <FaEye />
        </span>

        <h3>Visión</h3>

        <p>
          Ser una plataforma líder en la transformación digital de los procesos
          electorales del SENA, impulsando la participación y fortaleciendo
          la democracia institucional.
        </p>
      </div>
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
            <img
              src="/logo_fabrica.png"
              alt="Fábrica de Software"
              className="lp-logo-fab"
            />
            <span>FÁBRICA DE SOFTWARE</span>
          </div>

          <span className="lp-logo-sep" />

          <div className="lp-logo-item">
            <SigevaWordmark />
          </div>
        </div>

      </section>

      <LandingFooter />
         <ChatBot />
    </div>
  );
};

export default Inicio;
