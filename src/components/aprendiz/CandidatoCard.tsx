import { useState } from "react";

type FichaCandidato = {
  nombre: string;
  programa: string;
  propuesta: string;
  foto: string;
  numeroTarjeton: string;
  idCandidato: string;
};

interface Props {
  idcandidatos: string;
  programa: string;
  propuesta: string;
  foto: string;
  seleccionado: boolean;
  numeroTarjeton: string;
  aprendiz: {
    nombres: string;
    apellidos: string;
  };
  onOpen: (data: FichaCandidato) => void;
}

export default function CandidateCard({
  programa,
  propuesta,
  foto,
  seleccionado,
  onOpen,
  aprendiz,
  numeroTarjeton,
  idcandidatos,
}: Props) {
  const [fotoOk, setFotoOk] = useState(Boolean(foto));
  const nombre = `${aprendiz.nombres} ${aprendiz.apellidos}`.trim();

  const abrir = () => {
    onOpen({
      nombre,
      programa,
      propuesta,
      foto,
      numeroTarjeton,
      idCandidato: idcandidatos,
    });
  };

  return (
    <article
      className={`grafica-card admin-cand${seleccionado ? " is-on" : ""}`}
      role="button"
      tabIndex={0}
      onClick={abrir}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          abrir();
        }
      }}
    >
      <div className="admin-cand-foto">
        {fotoOk ? (
          <img src={foto} alt="" onError={() => setFotoOk(false)} />
        ) : (
          <span aria-hidden>
            {(numeroTarjeton || nombre.slice(0, 1) || "?").toString().slice(0, 2)}
          </span>
        )}
        {numeroTarjeton ? <em>Tarjetón {numeroTarjeton}</em> : null}
      </div>
      <h3>{nombre}</h3>
      <small>{programa}</small>
      <p>{propuesta}</p>
    </article>
  );
}
