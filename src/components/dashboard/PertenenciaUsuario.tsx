import { useUbicacionUsuario } from "../../hooks/useUbicacionUsuario";

export function PertenenciaUsuario() {
  const { nombreCentro, nombreRegional, esRed, cargando } = useUbicacionUsuario();

  if (esRed) {
    return (
      <div className="admin-dash-place">
        <span className="admin-dash-chip">
          <small>Ámbito</small>
          <strong>Toda la red SENA</strong>
        </span>
      </div>
    );
  }

  if (cargando) {
    return (
      <p className="admin-dash-place admin-dash-place--muted">
        Consultando tu centro de formación y regional…
      </p>
    );
  }

  if (!nombreCentro && !nombreRegional) return null;

  return (
    <div className="admin-dash-place">
      {nombreCentro ? (
        <span className="admin-dash-chip">
          <small>Centro de formación</small>
          <strong>{nombreCentro}</strong>
        </span>
      ) : null}
      {nombreRegional ? (
        <span className="admin-dash-chip">
          <small>Regional</small>
          <strong>{nombreRegional}</strong>
        </span>
      ) : null}
    </div>
  );
}
