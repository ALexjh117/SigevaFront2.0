import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth/auth.context";
import { nombreDeUsuario } from "../../utils/usuario";
import { esAdminSistema } from "../../utils/roles";
import { DiosBulb, DiosChip, DiosLeaf, DiosTarget } from "../../theme/DiosIcons";
import { useDatosDashboard } from "../../hooks/useDatosDashboard";
import { PanelGraficasApp } from "../../components/graficas/PanelGraficasApp";

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
          pie: "Todos los centros",
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

      <PanelGraficasApp
        aprendices={aprendices}
        elecciones={elecciones}
        funcionarios={funcionarios}
        votos={votos}
        esRed={esRed}
      />
    </div>
  );
};
