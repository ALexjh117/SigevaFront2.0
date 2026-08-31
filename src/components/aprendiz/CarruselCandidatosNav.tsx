import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import { useAuth } from "../../context/auth/auth.context";
import { jornadaDelAprendiz } from "../../utils/jornadaAprendiz";
import { comoLista } from "../../utils/comoLista";

type Slide = {
  key: string;
  nombre: string;
  foto: string;
  tarjeton: string;
  ideleccion: number;
};

function nombreDe(c: Record<string, unknown>) {
  const aprendiz = c.aprendiz as Record<string, unknown> | undefined;
  const compuesto = [aprendiz?.nombres, aprendiz?.apellidos].filter(Boolean).join(" ").trim();
  return compuesto || String(c.nombre || c.nombres || "Candidato");
}

export function CarruselCandidatosSidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const jornada = jornadaDelAprendiz(user);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [indice, setIndice] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [fotoOk, setFotoOk] = useState(true);

  useEffect(() => {
    const centro = user?.CentroFormacion;
    if (!centro || !jornada) return;
    let vivo = true;

    const cargar = async () => {
      try {
        const res = await api.get(`/api/eleccionPorCentro/${centro}`);
        const elecciones = comoLista<Record<string, unknown>>(res.data);
        const grupos = await Promise.all(
          elecciones.map(async (el) => {
            const ideleccion = Number(el.ideleccion ?? el.idEleccion);
            if (!ideleccion) return [] as Slide[];
            try {
              const cand = await api.get(`/api/candidatos/listar/${ideleccion}`, {
                params: { jornada },
              });
              return comoLista<Record<string, unknown>>(cand.data).map((c, i) => ({
                key: `${ideleccion}-${String(c.idcandidatos ?? i)}`,
                nombre: nombreDe(c),
                foto: String(c.foto || "").trim(),
                tarjeton: String(c.numeroTarjeton || ""),
                ideleccion,
              }));
            } catch {
              return [] as Slide[];
            }
          })
        );
        if (vivo) setSlides(grupos.flat());
      } catch {
        if (vivo) setSlides([]);
      }
    };

    void cargar();
    return () => {
      vivo = false;
    };
  }, [user?.CentroFormacion, jornada]);

  useEffect(() => {
    if (slides.length < 2 || pausado) return;
    const t = window.setInterval(() => {
      setIndice((n) => (n + 1) % slides.length);
    }, 4200);
    return () => window.clearInterval(t);
  }, [slides.length, pausado]);

  useEffect(() => {
    setFotoOk(true);
  }, [indice]);

  if (slides.length === 0) return null;

  const actual = slides[indice];
  const iniciales = (actual.tarjeton || actual.nombre).slice(0, 2);

  return (
    <div className="side-cand">
      <button
        type="button"
        className="side-cand-card"
        onMouseEnter={() => setPausado(true)}
        onMouseLeave={() => setPausado(false)}
        onClick={() => navigate(`/seleccion/${actual.ideleccion}`)}
      >
        <p className="side-cand-kicker">Candidatos</p>
        <div className="side-cand-foto" key={actual.key}>
          {actual.foto && fotoOk ? (
            <img
              src={actual.foto}
              alt=""
              onError={() => setFotoOk(false)}
            />
          ) : (
            <span>{iniciales}</span>
          )}
        </div>
        {actual.tarjeton ? (
          <em className="side-cand-tarjeton">Tarjetón {actual.tarjeton}</em>
        ) : null}
        <strong>{actual.nombre}</strong>
        <small>Toca para votar</small>
      </button>
    </div>
  );
}
