import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { GrGithub } from "react-icons/gr";

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
};


// ======================================================
// AVATAR DE RESPALDO
// ======================================================

const avatarFallback = (nombre: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    nombre
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
  },

  {
    nombre: "Alex Jhoan Chaguendo",
    rol: "Full Stack Developer/ Scrum Master",
    github: "ALexjh117",
    avatar: "/avatars/alex.jpg",
    grupo: "Desarrolladores",
  },

  {
    nombre: "Maikol Estiven Daza",
    rol: "Backend Developer",
    github: "maiKol269",
    avatar: "/avatars/maikol-sg.jpeg",
    grupo: "Desarrolladores",
  },

  {
    nombre: "Yusti Mebel Campo",
    rol: "Full Stack Developer",
    github: "mebelcampo",
    avatar: "/avatars/mebel-sg.jpeg",
    grupo: "Desarrolladores",
  },

  {
    nombre: "María Paula Santacruz",
    rol: "Frontend Developer/Diseño ui/ux",
    github: "Paulasantacruz",
    avatar: "/avatars/paula-sg.jpeg",
    grupo: "Desarrolladores",
  },

  {
    nombre: "Sofia Bonilla Gallego",
    rol: "Frontend Developer/Diseño ui/ux",
    github: "sofiaboni06",
    avatar: "/avatars/sofia-sg.jpeg",
    grupo: "Desarrolladores",
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
  },

  {
    nombre: "Alexandra Guevara Muñoz",
    rol: "Supervisora",
    avatar: "/avatars/alexandra.png",
    grupo: "Manejo",
  },

  {
    nombre: "Jorge Enrique Porras",
    rol: "Scrum Master",
    github: "IngAlim2023",
    avatar: "/avatars/jorge.png",
    grupo: "Manejo",
  },

  {
    nombre: "Fernanda Gonzalez",
    rol: "Back End Developer",
    github: "feeer-28",
    avatar: "/avatars/na.png",
    grupo: "Desarrolladores",
  },

  {
    nombre: "Alex Jhoan Chaguendo",
    rol: "Full Stack Developer",
    github: "ALexjh117",
    avatar: "/avatars/alex.jpg",
    grupo: "Desarrolladores",
  },

  {
    nombre: "Dovin Richard Hoyos",
    rol: "Full Stack Developer",
    github: "dovinhoyos",
    avatar: "/avatars/dovin.jpeg",
    grupo: "Desarrolladores",
  },

  {
    nombre: "Bryan Andrés Hurtado",
    rol: "Front End & Mobile Developer",
    github: "Bryanhurtado0006",
    avatar: "/avatars/bryan.jpg",
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
    avatar: "/avatars/victor.jpg",
    grupo: "Desarrolladores",
  },

  {
    nombre: "Andrés Santiago Arias",
    rol: "Full Stack Developer",
    github: "AndresArias28",
    avatar: "/avatars/ariasavatar.jpg",
    grupo: "Desarrolladores",
  },

  {
    nombre: "Jeison Reyes Ruiz",
    rol: "Back End Developer",
    github: "JEISON101",
    avatar: "/avatars/jeison.jpg",
    grupo: "Desarrolladores",
  },

  {
    nombre: "Camilo Hurtado",
    rol: "Full Stack Developer",
    github: "oKCam04",
    avatar: "/avatars/camilo.png",
    grupo: "Desarrolladores",
  },

  {
    nombre: "Daniela Paredes",
    rol: "Back End Developer",
    github: "renteria08P",
    avatar: "/avatars/dani.jpeg",
    grupo: "Desarrolladores",
  },

  {
    nombre: "David Santiago Rengifo",
    rol: "Front End & Mobile Developer",
    github: "DavidRengifo12",
    avatar: "/avatars/na.png",
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

  const sePuedeAmpliar =
    ampliables && Boolean(m.avatar);

  return (
    <article
      className={`eq-card${
        compacto ? " compact-card" : ""
      }`}
    >

      {/* ==========================================
          CONTENIDO DE TEXTO
          SIN FOTO A LA IZQUIERDA
      ========================================== */}

      <div className="eq-card-content">

        <div className="eq-copy">

          <strong>
            {m.nombre}
          </strong>

          <p>
            {m.rol}
          </p>

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

              <span>
                {m.github}
              </span>
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
              e.currentTarget.src =
                avatarFallback(m.nombre);
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
              e.currentTarget.src =
                avatarFallback(m.nombre);
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

  const grupos: Grupo[] = [
    "Manejo",
    "Desarrolladores",
  ];

  return (
    <section className="eq-block">

      {/* TÍTULO */}

      {titulo && (
        <h2>
          {titulo}
        </h2>
      )}


      {/* GRUPOS */}

      {grupos.map((grupo) => {

        const lista =
          miembros.filter(
            (m) => m.grupo === grupo
          );

        if (lista.length === 0) {
          return null;
        }

        return (
          <div key={grupo}>

            <p className="eq-label">
              {grupo === "Manejo"
                ? "Manejo del proyecto"
                : "Desarrolladores"}
            </p>


            <div
              className={`eq-grid${
                compacto ? " compact" : ""
              }`}
            >

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

  const [fotoGrande, setFotoGrande] =
    useState<Miembro | null>(null);


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

          <p className="eq-kicker">
            Fábrica de Software
          </p>

          <h1>
            Nuestro equipo
          </h1>

          <p>
            Detrás de cada voto hay un equipo que
            cree que elegir puede ser más cercano,
            más claro y más justo. Esto lo hacemos
            juntos.
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


        {/* ========================================
            VERSIÓN ANTERIOR
        ======================================== */}

        <div className="eq-archive">

          <p className="eq-kicker">
            Archivo
          </p>

          <h2>
            Versión anterior
          </h2>

          <p className="eq-archive-lead">
            Gracias a quienes abrieron el camino.
          </p>


          <BloqueEquipo
            miembros={equipoAnterior}
            compacto
          />

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
                maxWidth:
                  "min(92vw, 520px)",
                maxHeight:
                  "min(75vh, 520px)",
                objectFit: "contain",
                borderRadius: 12,
                boxShadow:
                  "0 18px 50px rgba(0, 0, 0, 0.85)",
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