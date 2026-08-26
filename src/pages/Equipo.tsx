import React, { useState } from "react";
import Sigeva from "../assets/sena-sigeva.svg";
import { GrGithub } from "react-icons/gr";
import { useNavigate } from "react-router-dom";
import { Button, Modal } from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";

type Grupo = "Manejo" | "Desarrolladores";

type Miembro = {
  nombre: string;
  rol: string;
  github?: string;
  avatar: string;
  grupo: Grupo;
};

const avatarFallback = (nombre: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    nombre
  )}&background=1a1a1a&color=fff&size=176&bold=true&format=png`;

const equipoActual: Miembro[] = [
  {
    nombre: "Henry Bastidas",
    rol: "Product Owner",
    avatar: "/avatars/henry.png",
    grupo: "Manejo",
  },
  {
    nombre: "Alex Jhoan Chaguendo",
    rol: "Full Stack  · Scrum Master",
    github: "ALexjh117",
    avatar: "/avatars/alex.jpg",
    grupo: "Desarrolladores",
  },
  {
    nombre: "Maikol Estiven Daza",
    rol: "Backend",
    avatar: "",
    github: "maiKol269",
    grupo: "Desarrolladores",
  },
  {
    nombre: "Yusti Mebel Campo ",
    rol: "Backend",
    avatar: "/avatars/mebel-sg.jpeg",
    github: "mebelcampo",
    grupo: "Desarrolladores",
  },
  {
    nombre: "María Paula Santacruz",
    rol: "Frontend",
    avatar: "/avatars/paula-sg.jpeg",
    github: "Paulasantacruz",
    grupo: "Desarrolladores",
  },
  {
    nombre: "Sofia Bonilla Gallego ",
    rol: "Frontend",
    avatar: "",
    github: "sofiaboni06",
    grupo: "Desarrolladores",
  },
];

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
  const size = compacto ? 64 : 88;
  const src = m.avatar || avatarFallback(m.nombre);
  const sePuedeAmpliar = ampliables && Boolean(m.avatar);

  const foto = (
    <img
      src={src}
      alt={m.nombre}
      onError={(e) => {
        e.currentTarget.src = avatarFallback(m.nombre);
      }}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        objectFit: "cover",
        flexShrink: 0,
        background: "#f0f0f0",
        display: "block",
      }}
    />
  );

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        minWidth: 0,
        width: "100%",
      }}
    >
      {sePuedeAmpliar ? (
        <button
          type="button"
          onClick={() => onVerFoto?.(m)}
          aria-label={`Ver foto de ${m.nombre}`}
          style={{
            padding: 0,
            border: "none",
            background: "none",
            borderRadius: "50%",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          {foto}
        </button>
      ) : (
        foto
      )}
      <div style={{ minWidth: 0 }}>
        <strong style={{ wordBreak: "break-word" }}>{m.nombre}</strong>
        <p style={{ margin: 0, fontSize: compacto ? "0.9rem" : "1rem", color: "#555" }}>
          {m.rol}
        </p>
        {m.github ? (
          <p style={{ margin: "0.15rem 0 0", fontSize: "0.9rem" }}>
            <a
              href={`https://github.com/${m.github}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none", color: "#000" }}
            >
              <GrGithub /> {m.github}
            </a>
          </p>
        ) : null}
      </div>
    </div>
  );
}

function BloqueEquipo({
  titulo,
  miembros,
  compacto,
  ampliables,
  onVerFoto,
}: {
  titulo: string;
  miembros: Miembro[];
  compacto?: boolean;
  ampliables?: boolean;
  onVerFoto?: (m: Miembro) => void;
}) {
  const grupos: Grupo[] = ["Manejo", "Desarrolladores"];
  return (
    <section style={{ marginBottom: "3rem" }}>
      <h2 style={{ fontSize: "clamp(1.2rem, 4vw, 1.45rem)", marginBottom: "1.25rem" }}>
        {titulo}
      </h2>
      {grupos.map((grupo) => {
        const lista = miembros.filter((m) => m.grupo === grupo);
        if (lista.length === 0) return null;
        return (
          <div key={grupo} style={{ marginBottom: "2rem" }}>
            <h3 style={{ fontSize: "1.05rem", marginBottom: "1rem", color: "#444" }}>
              {grupo === "Manejo" ? "Manejo del proyecto" : "Desarrolladores"}
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: compacto
                  ? "repeat(auto-fit, minmax(min(100%, 240px), 1fr))"
                  : "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
                gap: compacto ? "1.25rem" : "1.5rem",
              }}
            >
              {lista.map((m) => (
                <TarjetaMiembro
                  key={`${titulo}-${m.nombre}-${m.rol}`}
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

const Equipo: React.FC = () => {
  const navigate = useNavigate();
  const [fotoGrande, setFotoGrande] = useState<Miembro | null>(null);

  return (
    <main
      style={{
        padding: "clamp(1rem, 4vw, 2rem)",
        maxWidth: 1100,
        margin: "0 auto",
      }}
    >
      <div className="mb-3">
        <Button
          variant="light"
          size="sm"
          onClick={() => navigate(-1)}
          className="d-flex align-items-center gap-2"
        >
          <FaArrowLeft /> Volver
        </Button>
      </div>
      <div className="d-flex justify-content-center justify-content-md-start align-items-center gap-2 mb-3">
        <img src={Sigeva} alt="Logo SIGEVA" height={40} />
      </div>

      <p style={{ color: "#555", fontWeight: 700, marginBottom: "0.35rem", letterSpacing: "0.02em" }}>
        SOBRE NOSOTROS
      </p>
      <h1 style={{ fontSize: "clamp(1.5rem, 5vw, 2rem)", marginBottom: "0.5rem" }}>
        Nuestro equipo
      </h1>
      <p style={{ color: "#555", marginBottom: "2.5rem", maxWidth: 720 }}>
        Detrás de cada voto hay un equipo que cree que elegir en el SENA puede ser más
        cercano, más claro y más justo. Esto lo hacemos juntos.
      </p>

      <BloqueEquipo
        titulo="Esta versión"
        miembros={equipoActual}
        ampliables
        onVerFoto={setFotoGrande}
      />

      <hr style={{ border: "none", borderTop: "1px solid #e5e5e5", margin: "1rem 0 2.5rem" }} />

      <p style={{ color: "#666", marginBottom: "1.25rem", maxWidth: 720 }}>
        Gracias a quienes abrieron el camino.
      </p>
      <BloqueEquipo titulo="Versión anterior" miembros={equipoAnterior} compacto />

      <Modal
        show={Boolean(fotoGrande)}
        onHide={() => setFotoGrande(null)}
        centered
        backdropClassName="foto-equipo-backdrop"
        contentClassName="bg-transparent border-0 shadow-none"
      >
        <Modal.Header closeButton closeVariant="white" className="border-0 bg-transparent">
          <Modal.Title className="text-white" style={{ fontSize: "1.1rem" }}>
            {fotoGrande?.nombre}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-flex justify-content-center align-items-center p-2 p-md-3 bg-transparent">
          {fotoGrande?.avatar ? (
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
          ) : null}
        </Modal.Body>
      </Modal>
      <style>{`
        .foto-equipo-backdrop {
          background-color: rgba(0, 0, 0, 0.72) !important;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
      `}</style>
    </main>
  );
};

export default Equipo;
