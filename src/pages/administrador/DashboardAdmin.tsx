import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth/auth.context";
import { nombreDeUsuario } from "../../utils/usuario";
import { esAdminSistema } from "../../utils/roles";
import { DiosBulb, DiosChip, DiosLeaf, DiosTarget } from "../../theme/DiosIcons";
import { useDatosDashboard } from "../../hooks/useDatosDashboard";
import { PanelGraficasApp } from "../../components/graficas/PanelGraficasApp";
import type { AprendizGrafica, VotoGrafica } from "../../components/graficas/PanelGraficasApp";
import { PertenenciaUsuario } from "../../components/dashboard/PertenenciaUsuario";
import { FiltroCentroRed } from "../../components/dashboard/FiltroCentroRed";
import { useFiltroCentroRed } from "../../hooks/useCatalogoCentros";
import { etiquetaAnidada } from "../../utils/comoLista";

function idCentroDeAprendiz(a: AprendizGrafica): number {
  const o = a as AprendizGrafica & Record<string, unknown>;
  const nested = o.centro_formacion ?? o.centroFormacion;
  const nestedId =
    nested && typeof nested === "object"
      ? Number(
          (nested as Record<string, unknown>).idcentroFormacion ??
            (nested as Record<string, unknown>).idcentro_formacion
        )
      : 0;
  return (
    Number(
      o.centroFormacionIdcentroFormacion ??
        o.idcentroFormacion ??
        o.centro_formacion_idcentro_formacion
    ) ||
    nestedId ||
    0
  );
}

function idEleccionDeVoto(v: VotoGrafica): number {
  const extra = v as VotoGrafica & Record<string, unknown>;
  const anidado = extra.eleccion as Record<string, unknown> | undefined;
  return (
    Number(
      extra.ideleccion ??
        extra.idEleccion ??
        extra.eleccionId ??
        anidado?.ideleccion ??
        anidado?.id
    ) || 0
  );
}

export const DashboardAdmin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const nombreVisible = nombreDeUsuario(user);
  const cifra = (n: number) => n.toLocaleString("es-CO");
  const {
    esRed,
    votacionesActivas,
    usuariosRegistrados,
    aprendizDisponible,
    votosHoy,
    aprendices,
    elecciones,
    funcionarios,
    votos,
  } = useDatosDashboard();
  const {
    regionales,
    centrosFiltrados,
    idRegional,
    idCentro,
    centroElegido,
    elegirRegional,
    elegirCentro,
  } = useFiltroCentroRed(esRed);

  const graficas = useMemo(() => {
    if (!esRed) {
      return { aprendices, elecciones, funcionarios, votos, mostrar: true };
    }
    if (!idCentro || !centroElegido) {
      return {
        aprendices: [],
        elecciones: [],
        funcionarios: [],
        votos: [],
        mostrar: false,
      };
    }
    const nombreCentro = centroElegido.nombre.toLowerCase();
    const eleccionesCentro = elecciones.filter((e) => {
      if (e.idcentroFormacion === idCentro) return true;
      return etiquetaAnidada(e.centro).toLowerCase() === nombreCentro;
    });
    const idsEleccion = new Set(
      eleccionesCentro.map((e) => e.ideleccion).filter((id): id is number => Boolean(id))
    );
    const aprendicesCentro = aprendices.filter((a) => {
      const id = idCentroDeAprendiz(a);
      if (id === idCentro) return true;
      if (id) return false;
      const nombre =
        etiquetaAnidada(a.centro_formacion) || etiquetaAnidada(a.centroFormacion);
      return nombre.toLowerCase() === nombreCentro;
    });
    const votosCentro = votos.filter((v) => idsEleccion.has(idEleccionDeVoto(v)));
    const funcionariosCentro = funcionarios.filter((f) => {
      const id = Number(f.centroFormacion && (f.centroFormacion as { idcentroFormacion?: number }).idcentroFormacion);
      if (id === idCentro) return true;
      const nombre = f.centroFormacion?.centroFormacioncol?.toLowerCase() || "";
      return nombre === nombreCentro;
    });
    return {
      aprendices: aprendicesCentro,
      elecciones: eleccionesCentro,
      funcionarios: funcionariosCentro,
      votos: votosCentro,
      mostrar: true,
    };
  }, [esRed, idCentro, centroElegido, aprendices, elecciones, funcionarios, votos]);

  const atajos = esRed
    ? [
        {
          clase: "admin-shortcut--digital",
          to: "/aprendices",
          titulo: "Aprendices de la red",
          pie: "Consultar el registro",
          icono: <DiosChip />,
        },
        {
          clase: "admin-shortcut--innovador",
          to: "/admins-centro",
          titulo: "Admin de centro",
          pie: "Uno por sede, eliges el centro",
          icono: <DiosBulb />,
        },
        {
          clase: "admin-shortcut--oferta",
          to: "/funcionarios",
          titulo: "Funcionarios",
          pie: "Eliges el centro al crearlos",
          icono: <DiosTarget />,
        },
        {
          clase: "admin-shortcut--sostenible",
          to: "/elecciones",
          titulo: "Elecciones de la red",
          pie: "Eliges el centro",
          icono: <DiosLeaf />,
        },
      ]
    : esAdminSistema(user?.perfil)
    ? [
        {
          clase: "admin-shortcut--digital",
          to: "/aprendices",
          titulo: "Aprendices del centro",
          pie: "Padrón de tu sede",
          icono: <DiosChip />,
        },
        {
          clase: "admin-shortcut--innovador",
          to: "/funcionarios",
          titulo: "Funcionarios",
          pie: "De tu centro de formación",
          icono: <DiosBulb />,
        },
        {
          clase: "admin-shortcut--oferta",
          to: "/cargar-aprendices",
          titulo: "Cargar aprendices",
          pie: "Excel de tu sede",
          icono: <DiosTarget />,
        },
        {
          clase: "admin-shortcut--sostenible",
          to: "/elecciones",
          titulo: "Elecciones del centro",
          pie: "Procesos de tu sede",
          icono: <DiosLeaf />,
        },
      ]
    : [
        {
          clase: "admin-shortcut--digital",
          to: "/aprendices",
          titulo: "Aprendices del centro",
          pie: "Padrón de tu sede",
          icono: <DiosChip />,
        },
        {
          clase: "admin-shortcut--innovador",
          to: "/aprendiz-form",
          titulo: "Añadir aprendiz",
          pie: "Registro individual",
          icono: <DiosBulb />,
        },
        {
          clase: "admin-shortcut--oferta",
          to: "/panel-metricas",
          titulo: "Resultados en vivo",
          pie: "Escrutinio por jornada",
          icono: <DiosTarget />,
        },
        {
          clase: "admin-shortcut--sostenible",
          to: "/elecciones",
          titulo: "Elecciones del centro",
          pie: "Procesos de tu sede",
          icono: <DiosLeaf />,
        },
      ];

  return (
    <div className="admin-dash">
      <header className="admin-dash-hero">
        <p className="admin-dash-eyebrow">Así va la votación</p>
        <h1>
          Bienvenido, <span>{nombreVisible}</span>
        </h1>
        <PertenenciaUsuario />
        <p className="admin-dash-lead">
          {esRed
            ? "Números clave y gráficas de barras, donas y tendencia de votos de toda la red: aprendices, elecciones, funcionarios y participación."
            : "Las mismas gráficas del panel, con la información de tu centro de formación: aprendices, elecciones y votos de esta sede."}
        </p>
      </header>

      <div className="admin-kpi-grid">
        <article
          className="admin-kpi admin-kpi--digital is-clickable"
          onClick={() => navigate("/aprendices")}
        >
          <h3 className="admin-kpi-pillar">Digital</h3>
          <div className="admin-kpi-icon">
            <DiosChip />
          </div>
          <p>{cifra(usuariosRegistrados)}</p>
          <strong className="admin-kpi-metric">
            {esRed ? "Aprendices en el sistema" : "Aprendices de tu centro"}
          </strong>
          <small>Quienes ya forman parte de esta votación.</small>
        </article>

        <article className="admin-kpi admin-kpi--innovador">
          <h3 className="admin-kpi-pillar">Innovador</h3>
          <div className="admin-kpi-icon">
            <DiosBulb />
          </div>
          <p>{cifra(votosHoy)}</p>
          <strong className="admin-kpi-metric">Votos registrados hoy</strong>
          <small>
            {esRed ? "Cada voto de hoy acerca una decisión." : "Votos de hoy en tu centro."}
          </small>
        </article>

        <article className="admin-kpi admin-kpi--oferta">
          <h3 className="admin-kpi-pillar">Oferta pertinente</h3>
          <div className="admin-kpi-icon">
            <DiosTarget />
          </div>
          <p>{cifra(votacionesActivas)}</p>
          <strong className="admin-kpi-metric">Elecciones abiertas ahora</strong>
          <small>
            {esRed ? "Las que puedes seguir en este momento." : "Procesos abiertos en tu sede."}
          </small>
        </article>

        <article className="admin-kpi admin-kpi--sostenible">
          <h3 className="admin-kpi-pillar">Sostenibilidad</h3>
          <div className="admin-kpi-icon">
            <DiosLeaf />
          </div>
          <p>{cifra(aprendizDisponible)}</p>
          <strong className="admin-kpi-metric">Habilitados para votar</strong>
          <small>Quienes ya pueden emitir su voto.</small>
        </article>
      </div>

      <p className="admin-dash-slogan">Cada voto cuenta. Cada idea también.</p>

      <div className="admin-shortcut-grid">
        {atajos.map((atajo) => (
          <button
            key={atajo.to}
            type="button"
            className={`admin-shortcut ${atajo.clase}`}
            onClick={() => navigate(atajo.to)}
          >
            <span className="admin-shortcut-icon">{atajo.icono}</span>
            <span>
              <strong>{atajo.titulo}</strong>
              <small>{atajo.pie}</small>
            </span>
          </button>
        ))}
      </div>

      {esRed ? (
        <>
          <FiltroCentroRed
            regionales={regionales}
            centros={centrosFiltrados}
            idRegional={idRegional}
            idCentro={idCentro}
            onRegional={elegirRegional}
            onCentro={elegirCentro}
          />
          {graficas.mostrar ? (
            <PanelGraficasApp
              aprendices={graficas.aprendices}
              elecciones={graficas.elecciones}
              funcionarios={graficas.funcionarios}
              votos={graficas.votos}
              esRed={false}
            />
          ) : (
            <p className="admin-dash-place admin-dash-place--muted">
              Elige la regional y el centro de formación para ver las gráficas de esa sede,
              sin recorrer todos los centros.
            </p>
          )}
        </>
      ) : (
        <PanelGraficasApp
          aprendices={graficas.aprendices}
          elecciones={graficas.elecciones}
          funcionarios={graficas.funcionarios}
          votos={graficas.votos}
          esRed={false}
        />
      )}
    </div>
  );
};
