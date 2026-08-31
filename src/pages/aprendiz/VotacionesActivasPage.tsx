import { useEffect, useState } from "react";
import { api } from "../../api";
import { useAuth } from "../../context/auth/auth.context";
import { jornadaDelAprendiz } from "../../utils/jornadaAprendiz";
import { nombreDeUsuario } from "../../utils/usuario";
import { comoLista, etiquetaAnidada } from "../../utils/comoLista";
import { VotacionCard } from "../../components/aprendiz/VotacionCard";

type Votacion = {
  ideleccion: number;
  titulo: string;
  centro: string;
  hayCandidatos: boolean;
  fechaInicio?: string;
  fechaFin?: string;
  yaVoto: boolean;
};

function idDeEleccion(v: Record<string, unknown>) {
  const n = Number(v.ideleccion ?? v.idEleccion ?? v.eleccionId);
  return n || 0;
}

function idDeAprendiz(v: Record<string, unknown>) {
  const anidado =
    v.aprendiz && typeof v.aprendiz === "object"
      ? Number((v.aprendiz as Record<string, unknown>).idaprendiz)
      : 0;
  return Number(v.idaprendiz ?? v.aprendiz_idaprendiz ?? v.idAprendiz) || anidado || 0;
}

const VotacionesActivasPage = () => {
  const [votaciones, setVotaciones] = useState<Votacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const { user } = useAuth();
  const jornada = jornadaDelAprendiz(user);
  const nombreVisible = nombreDeUsuario(user);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.CentroFormacion || !jornada) {
        setCargando(false);
        return;
      }
      try {
        const [eleccionesRes, votosRes] = await Promise.allSettled([
          api.get(`/api/eleccionPorCentro/${user.CentroFormacion}`),
          api.get("/api/votoXCandidato/traer"),
        ]);

        const elecciones =
          eleccionesRes.status === "fulfilled"
            ? comoLista<Record<string, unknown>>(eleccionesRes.value.data)
            : [];

        const votosPropios =
          votosRes.status === "fulfilled"
            ? comoLista<Record<string, unknown>>(votosRes.value.data).filter(
                (v) => idDeAprendiz(v) === Number(user.id)
              )
            : [];

        const idsVotadas = new Set(votosPropios.map(idDeEleccion).filter(Boolean));

        const conCandidatos: Votacion[] = await Promise.all(
          elecciones.map(async (vote) => {
            const ideleccion = idDeEleccion(vote);
            const titulo = String(vote.titulo || "Elección");
            const centro = etiquetaAnidada(vote.centro) || "Tu centro";
            try {
              const cand = await api.get(`/api/candidatos/listar/${ideleccion}`, {
                params: { jornada },
              });
              const lista = comoLista(cand.data);
              return {
                ideleccion,
                titulo,
                centro,
                hayCandidatos: lista.length > 0,
                fechaInicio: vote.fechaInicio ? String(vote.fechaInicio) : undefined,
                fechaFin: vote.fechaFin ? String(vote.fechaFin) : undefined,
                yaVoto: idsVotadas.has(ideleccion),
              };
            } catch {
              return {
                ideleccion,
                titulo,
                centro,
                hayCandidatos: false,
                fechaInicio: vote.fechaInicio ? String(vote.fechaInicio) : undefined,
                fechaFin: vote.fechaFin ? String(vote.fechaFin) : undefined,
                yaVoto: idsVotadas.has(ideleccion),
              };
            }
          })
        );

        setVotaciones(conCandidatos.filter((v) => v.ideleccion));
      } catch (error) {
        console.error("Error al cargar las votaciones:", error);
      } finally {
        setCargando(false);
      }
    };
    loadData();
  }, [user?.CentroFormacion, user?.id, jornada]);

  const centro = votaciones[0]?.centro;

  return (
    <div className="admin-dash">
      <header className="admin-dash-hero">
        <p className="admin-dash-eyebrow">Votos</p>
        <h1>
          Bienvenido, <span>{nombreVisible}</span>
        </h1>
        <p className="admin-dash-lead">
          {centro ? `${centro}. ` : ""}
          Elige una elección y vota.
        </p>
      </header>

      <section className="grafica-panel" style={{ marginTop: "1.1rem" }} id="elecciones">
        {cargando ? (
          <p className="apz-muted">Cargando las elecciones de tu centro…</p>
        ) : votaciones.length === 0 ? (
          <div className="grafica-card">
            <h3>Aún no hay votaciones abiertas</h3>
            <small>
              Cuando tu centro publique una elección, aparecerá aquí.
            </small>
          </div>
        ) : (
          <div className="admin-election-grid">
            {votaciones.map((vote) => (
              <VotacionCard
                key={vote.ideleccion}
                titulo={vote.titulo}
                centro={vote.centro}
                ideleccion={vote.ideleccion}
                hayCandidatos={vote.hayCandidatos}
                fechaInicio={vote.fechaInicio}
                fechaFin={vote.fechaFin}
                yaVoto={vote.yaVoto}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default VotacionesActivasPage;
