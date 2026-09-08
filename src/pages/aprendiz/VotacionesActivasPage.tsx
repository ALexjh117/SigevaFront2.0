import { useEffect, useState } from "react";
import { api } from "../../api";
import { useAuth } from "../../context/auth/auth.context";
import { jornadaDelAprendiz } from "../../utils/jornadaAprendiz";
import { nombreDeUsuario } from "../../utils/usuario";
import { comoLista, etiquetaAnidada } from "../../utils/comoLista";
import { VotacionCard } from "../../components/aprendiz/VotacionCard";
import {
  candidatosYaVotados,
  eleccionYaVotada,
  idDeEleccion,
} from "../../utils/votoAprendiz";
import { esJornada } from "../../constants/jornada";
import { PertenenciaUsuario } from "../../components/dashboard/PertenenciaUsuario";

type Votacion = {
  ideleccion: number;
  titulo: string;
  centro: string;
  hayCandidatos: boolean;
  fechaInicio?: string;
  fechaFin?: string;
  yaVoto: boolean;
};

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
        const [eleccionesRes, idsCandidatosVotados] = await Promise.all([
          api.get(`/api/eleccionPorCentro/${user.CentroFormacion}`).then(
            (res) => comoLista<Record<string, unknown>>(res.data),
            () => [] as Record<string, unknown>[]
          ),
          candidatosYaVotados(Number(user.id)),
        ]);

        const elecciones = eleccionesRes;

        const conCandidatos: Votacion[] = await Promise.all(
          elecciones.map(async (vote) => {
            const ideleccion = idDeEleccion(vote);
            const titulo = String(vote.titulo || "Elección");
            const centro = etiquetaAnidada(vote.centro) || "Tu centro";
            try {
              const cand = await api.get(`/api/candidatos/listar/${ideleccion}`);
              const todos = comoLista<Record<string, unknown>>(cand.data);
              const deJornada = todos.filter((c) => esJornada(c.jornada) ? c.jornada === jornada : true);
              const listaJornada = todos.some((c) => esJornada(c.jornada))
                ? deJornada
                : todos;
              return {
                ideleccion,
                titulo,
                centro,
                hayCandidatos: listaJornada.length > 0,
                fechaInicio: vote.fechaInicio ? String(vote.fechaInicio) : undefined,
                fechaFin: vote.fechaFin ? String(vote.fechaFin) : undefined,
                yaVoto: eleccionYaVotada(todos, idsCandidatosVotados),
              };
            } catch {
              return {
                ideleccion,
                titulo,
                centro,
                hayCandidatos: false,
                fechaInicio: vote.fechaInicio ? String(vote.fechaInicio) : undefined,
                fechaFin: vote.fechaFin ? String(vote.fechaFin) : undefined,
                yaVoto: false,
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

  return (
    <div className="admin-dash">
      <header className="admin-dash-hero">
        <p className="admin-dash-eyebrow">Votos</p>
        <h1>
          Bienvenido, <span>{nombreVisible}</span>
        </h1>
        <PertenenciaUsuario />
        <p className="admin-dash-lead">Elige una elección y vota.</p>
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
