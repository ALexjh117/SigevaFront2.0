import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { GrGithub } from "react-icons/gr";
import { FaLaptopCode, FaMobileAlt } from "react-icons/fa";

import LandingHeader from "../components/landing/LandingHeader";
import LandingFooter from "../components/landing/LandingFooter";

import "./Inicio.css";
import "./Equipo.css";

// ======================================================
// TIPOS
// ======================================================

type Grupo = "Manejo" | "Desarrolladores";

type Miembro = {
  nombre: string;
  rol: string;
  github?: string;
  avatar: string;
  grupo: Grupo;
  destacado?: boolean;
  lider?: boolean;
  cinta?: string;
  tono?: 1 | 2 | 3 | 4 | 5 | 6;
  etiquetas?: string[];
};

// ======================================================
// AVATAR DE RESPALDO
// ======================================================

const avatarFallback = (nombre: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    nombre,
  )}&background=0B3D2E&color=fff&size=176&bold=true&format=png`;

// ======================================================
// EQUIPO ACTUAL
// ======================================================

const equipoActual: Miembro[] = [
  {
    nombre: "Henry Bastidas",
    rol: "Product Owner",
    avatar: "/avatars/henry.png",
    grupo: "Manejo",
    etiquetas: ["Product Owner"],
  },

  {
    nombre: "Alex Jhoan Chaguendo",
    rol: "Full Stack Developer · Web y Móvil",
    github: "ALexjh117",
    avatar: "/avatars/alex.jpg",
    grupo: "Desarrolladores",
    etiquetas: ["Web", "Móvil", "Scrum Master"],
  },

  {
    nombre: "Maikol Estiven Daza",
    rol: "Backend Developer",
    github: "maiKol269",
    avatar: "/avatars/maikol-sg.jpeg",
    grupo: "Desarrolladores",
    tono: 1,
    etiquetas: ["Backend", "APIs"],
  },

  {
    nombre: "Yusti Mebel Campo",
    rol: "Full Stack Developer",
    github: "mebelcampo",
    avatar: "/avatars/mebel-sg.jpeg",
    grupo: "Desarrolladores",
    tono: 2,
    etiquetas: ["Full Stack", "Web"],
  },

  {
    nombre: "María Paula Santacruz",
    rol: "Frontend Developer · Web y Móvil · UI/UX",
    github: "Paulasantacruz",
    avatar: "/avatars/paula-sg.jpeg",
    grupo: "Desarrolladores",
    tono: 3,
    etiquetas: ["Web", "Móvil", "UI/UX"],
  },

  {
    nombre: "Sofia Bonilla Gallego",
    rol: "Frontend Developer · UI/UX",
    github: "sofiaboni06",
    avatar: "/avatars/sofia-sg.jpeg",
    grupo: "Desarrolladores",
    tono: 4,
    etiquetas: ["Frontend", "UI/UX"],
  },
];

// ======================================================
// EQUIPO ANTERIOR
// ======================================================

const equipoAnterior: Miembro[] = [
  {
    nombre: "Henry Bastidas",
    rol: "Product Owner",
    avatar: "/avatars/henry.png",
    grupo: "Manejo",
    etiquetas: ["Product Owner"],
  },

  {
    nombre: "Alexandra Guevara Muñoz",
    rol: "Supervisora",
    avatar: "/avatars/alexa.jpeg",
    grupo: "Manejo",
    tono: 5,
  },

  {
    nombre: "Jorge Enrique Porras",
    rol: "Scrum Master",
    github: "IngAlim2023",
    avatar: "/avatars/jorge.jpeg",
    grupo: "Manejo",
    etiquetas: ["Scrum Master"],
  },

  {
    nombre: "Fernanda Gonzalez",
    rol: "Back End Developer",
    github: "feeer-28",
    avatar: "/avatars/Fernanda.jpeg",
    grupo: "Desarrolladores",
    tono: 1,
  },

  {
    nombre: "Alex Jhoan Chaguendo",
    rol: "Full Stack Developer",
    github: "ALexjh117",
    avatar: "/avatars/alex.jpg",
    grupo: "Desarrolladores",
    etiquetas: ["Full Stack", "Web"],
  },

  {
    nombre: "Dovin Richard Hoyos",
    rol: "Full Stack Developer",
    github: "dovinhoyos",
    avatar: "/avatars/dovin.jpeg",
    grupo: "Desarrolladores",
  },

  {
    nombre: "Brayan Andrés Hurtado",
    rol: "Front End & Mobile Developer",
    github: "Bryanhurtado0006",
    avatar: "/avatars/brayan.jpeg",
    grupo: "Desarrolladores",
  },

  {
    nombre: "Mariana Cifuentes Zuñiga",
    rol: "Diseñadora UI / UX",
    github: "macarorn",
    avatar: "/avatars/mariana.png",
    grupo: "Desarrolladores",
  },

  {
    nombre: "Víctor Manuel Mosquera",
    rol: "Mobile Developer",
    github: "victormosqueraconejo",
    avatar: "/avatars/victor.jpeg",
    grupo: "Desarrolladores",
  },

  {
    nombre: "Andrés Santiago Arias",
    rol: "Full Stack Developer",
    github: "AndresArias28",
    avatar: "/avatars/arias.jpeg",
    grupo: "Desarrolladores",
  },

  {
    nombre: "Jeison Reyes Ruiz",
    rol: "Back End Developer",
    github: "JEISON101",
    avatar: "/avatars/jeison.jpeg",
    grupo: "Desarrolladores",
  },

  {
    nombre: "Camilo Hurtado",
    rol: "Full Stack Developer",
    github: "oKCam04",
    avatar: "/avatars/na.png",
    grupo: "Desarrolladores",
  },

  {
    nombre: "Daniela Paredes",
    rol: "Back End Developer",
    github: "renteria08P",
    avatar: "/avatars/daniela.jpeg",
    grupo: "Desarrolladores",
  },

  {
    nombre: "David Santiago Rengifo",
    rol: "Front End & Mobile Developer",
    github: "DavidRengifo12",
    avatar: "/avatars/santiagor.jpeg",
    grupo: "Desarrolladores",
  },
];

const codistasNuevos: Miembro[] = [
  {
    nombre: "Lucero Valencia Bohórquez",
    rol: "En formación",
    avatar: "/avatars/na.png",
    grupo: "Desarrolladores",
  },
  {
    nombre: "Adriana Julieth Eraso Montero",
    rol: "En formación",
    avatar: "/avatars/adri.jpeg",
    grupo: "Desarrolladores",
  },
];

// ======================================================
// TARJETA DE MIEMBRO
// ======================================================

function TarjetaMiembro({
  m,
  compacto = false,
  ampliables = false,
  onVerFoto,
}: {
  m: Miembro;
  compacto?: boolean;
  ampliables?: boolean;
  onVerFoto?: (m: Miembro) => void;
}) {
  const src = m.avatar || avatarFallback(m.nombre);
  const sePuedeAmpliar = ampliables && Boolean(m.avatar);

  const clases = [
    "eq-card",
    compacto ? "compact-card" : "",
    m.destacado ? "is-featured" : "",
    m.lider ? "is-leader" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={clases}>
      <span className="eq-card-sheen" aria-hidden="true" />

      <div className="eq-card-content">
        <div className="eq-copy">
          {m.lider || m.destacado ? (
            <span className="eq-ribbon">
              {m.cinta ?? (m.lider ? "Liderazgo" : "Destacado")}
            </span>
          ) : null}

          <strong>{m.nombre}</strong>

          <p>{m.rol}</p>

          {m.etiquetas && m.etiquetas.length > 0 ? (
            <div className="eq-tags">
              {m.etiquetas.map((etiqueta) => (
                <span
                  key={etiqueta}
                  className={`eq-tag${
                    etiqueta.toLowerCase().includes("móvil") ||
                    etiqueta.toLowerCase().includes("movil")
                      ? " eq-tag--movil"
                      : etiqueta.toLowerCase().includes("web")
                        ? " eq-tag--web"
                        : ""
                  }`}
                >
                  {etiqueta.toLowerCase().includes("móvil") ||
                  etiqueta.toLowerCase().includes("movil") ? (
                    <FaMobileAlt aria-hidden />
                  ) : etiqueta.toLowerCase().includes("web") ? (
                    <FaLaptopCode aria-hidden />
                  ) : null}
                  {etiqueta}
                </span>
              ))}
            </div>
          ) : null}

          {/* ======================================
              GITHUB
          ====================================== */}

          {m.github && (
            <a
              className="eq-github"
              href={`https://github.com/${m.github}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`GitHub de ${m.nombre}`}
            >
              <GrGithub />

              <span>{m.github}</span>
            </a>
          )}
        </div>
      </div>

      {/* ==========================================
          ÚNICA FOTO A LA DERECHA
      ========================================== */}

      {sePuedeAmpliar ? (
        <button
          type="button"
          className="eq-person-photo-button"
          onClick={() => onVerFoto?.(m)}
          aria-label={`Ver foto de ${m.nombre}`}
        >
          <img
            src={src}
            alt={m.nombre}
            className="eq-person-photo"
            onError={(e) => {
              e.currentTarget.src = avatarFallback(m.nombre);
            }}
          />
        </button>
      ) : (
        <div className="eq-person-photo-container">
          <img
            src={src}
            alt={m.nombre}
            className="eq-person-photo"
            onError={(e) => {
              e.currentTarget.src = avatarFallback(m.nombre);
            }}
          />
        </div>
      )}
    </article>
  );
}

// ======================================================
// BLOQUE DE EQUIPO
// ======================================================

function BloqueEquipo({
  titulo,
  miembros,
  compacto = false,
  ampliables = false,
  onVerFoto,
}: {
  titulo?: string;
  miembros: Miembro[];
  compacto?: boolean;
  ampliables?: boolean;
  onVerFoto?: (m: Miembro) => void;
}) {
  const grupos: Grupo[] = ["Manejo", "Desarrolladores"];

  return (
    <section className="eq-block">
      {/* TÍTULO */}

      {titulo && <h2>{titulo}</h2>}

      {/* GRUPOS */}

      {grupos.map((grupo) => {
        const lista = miembros.filter((m) => m.grupo === grupo);

        if (lista.length === 0) {
          return null;
        }

        return (
          <div key={grupo}>
            <p className="eq-label">
              {grupo === "Manejo" ? "Manejo del proyecto" : "Desarrolladores"}
            </p>

            <div className={`eq-grid${compacto ? " compact" : ""}`}>
              {lista.map((m) => (
                <TarjetaMiembro
                  key={`${titulo ?? "archivo"}-${m.nombre}-${m.rol}`}
                  m={m}
                  compacto={compacto}
                  ampliables={ampliables}
                  onVerFoto={onVerFoto}
                />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}

// ======================================================
// COMPONENTE PRINCIPAL
// ======================================================

const Equipo: React.FC = () => {
  const [fotoGrande, setFotoGrande] = useState<Miembro | null>(null);

  return (
    <div className="landing">
      {/* HEADER */}

      <LandingHeader />

      {/* ==========================================
          CONTENIDO
      ========================================== */}

      <main className="eq-page">
        {/* ========================================
            INTRODUCCIÓN
        ======================================== */}

        <header className="eq-intro">
          <p className="eq-kicker">Fábrica de Software</p>

          <h1>Nuestro equipo</h1>

          <p>
            Detrás de cada voto hay un equipo que cree que elegir puede ser más
            cercano, más claro y más justo. Esto lo hacemos juntos.
          </p>
        </header>

        {/* ========================================
            ESTA VERSIÓN
        ======================================== */}

        <BloqueEquipo
          titulo="Esta versión"
          miembros={equipoActual}
          ampliables
          onVerFoto={setFotoGrande}
        />

        <section className="eq-starters">
          <p className="eq-kicker">Colaborades En formación</p>

          <h2>Quienes empiezan</h2>

          <p className="eq-archive-lead">
            Dos espacios para quienes apenas arrancan y nos ayudan a construir
            SIGEVA.
          </p>

          <div className="eq-grid">
            {codistasNuevos.map((m, i) => (
              <TarjetaMiembro key={`starter-${i}`} m={m} />
            ))}
          </div>
        </section>

        {/* ========================================
            VERSIÓN ANTERIOR
        ======================================== */}

        <div className="eq-archive">
          <p className="eq-kicker">Archivo</p>

          <h2>Versión anterior</h2>

          <p className="eq-archive-lead">
            Gracias a quienes abrieron el camino.
          </p>

          <BloqueEquipo miembros={equipoAnterior} compacto />
        </div>
      </main>

      {/* FOOTER */}

      <LandingFooter />

      {/* ==========================================
          MODAL PARA FOTO GRANDE
      ========================================== */}

      <Modal
        show={Boolean(fotoGrande)}
        onHide={() => setFotoGrande(null)}
        centered
        backdropClassName="foto-equipo-backdrop"
        contentClassName="
          bg-transparent
          border-0
          shadow-none
        "
      >
        <Modal.Header
          closeButton
          closeVariant="white"
          className="
            border-0
            bg-transparent
          "
        >
          <Modal.Title
            className="text-white"
            style={{
              fontSize: "1.1rem",
            }}
          >
            {fotoGrande?.nombre}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body
          className="
            d-flex
            justify-content-center
            align-items-center
            p-2
            p-md-3
            bg-transparent
          "
        >
          {fotoGrande?.avatar && (
            <img
              src={fotoGrande.avatar}
              alt={fotoGrande.nombre}
              style={{
                width: "100%",
                maxWidth: "min(92vw, 520px)",
                maxHeight: "min(75vh, 520px)",
                objectFit: "contain",
                borderRadius: 12,
                boxShadow: "0 18px 50px rgba(0, 0, 0, 0.85)",
              }}
            />
          )}
        </Modal.Body>
      </Modal>

      {/* ==========================================
          ESTILO DEL BACKDROP
      ========================================== */}

      <style>{`

        .foto-equipo-backdrop {
          background-color:
            rgba(0, 0, 0, 0.72) !important;

          backdrop-filter:
            blur(10px);

          -webkit-backdrop-filter:
            blur(10px);
        }

      `}</style>
    </div>
  );
};

export default Equipo;
