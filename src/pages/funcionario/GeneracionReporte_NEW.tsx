import React, { useState, useEffect, useMemo } from "react";
import { Button } from "react-bootstrap";
import { FaFilePdf } from "react-icons/fa6";
import { generarReporte } from "../../utils/generarReporte";
import { GraficaBarras } from "../../components/graficas/GraficaBarras";
import { GraficaDona } from "../../components/graficas/GraficaDona";
import { JORNADAS, type Jornada } from "../../constants/jornada";
import { bloquesPorJornada } from "../../utils/resultadosJornada";

interface Candidato {
  id: number;
  nombre: string;
  apellido: string;
  votos: number;
  porcentaje: number;
  jornada?: string;
  numeroTarjeton?: string;
  propuesta?: string;
}

interface Eleccion {
  id: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
  centro: string;
  jornada: string;
  totalVotos: number;
  candidatos?: Candidato[];
}

interface GeneracionReporteProps {
  eleccion?: Eleccion;
}

const GeneracionReporte: React.FC<GeneracionReporteProps> = ({ eleccion: eleccionProp }) => {
  const [eleccion, setEleccion] = useState<Eleccion | null>(null);
  const [cargando, setCargando] = useState<Jornada | "todas" | "">("");

  useEffect(() => {
    setEleccion(eleccionProp || null);
  }, [eleccionProp]);

  const bloques = useMemo(
    () => bloquesPorJornada(eleccion?.candidatos ?? [], true),
    [eleccion]
  );

  const pdfDeJornada = async (jornada: Jornada) => {
    if (!eleccion) return;
    const bloque = bloques.find((b) => b.jornada === jornada);
    if (!bloque?.lista.length) return;
    setCargando(jornada);
    try {
      await generarReporte({
        ...eleccion,
        jornada,
        totalVotos: bloque.totalVotos,
        candidatos: bloque.lista,
      });
    } catch (error) {
      console.error("Error al generar el PDF:", error);
    } finally {
      setCargando("");
    }
  };

  const pdfDeLasTres = async () => {
    if (!eleccion?.candidatos?.length) return;
    setCargando("todas");
    try {
      await generarReporte({
        ...eleccion,
        jornada: "Mañana, Tarde y Noche",
        candidatos: eleccion.candidatos,
      });
    } catch (error) {
      console.error("Error al generar el PDF:", error);
    } finally {
      setCargando("");
    }
  };

  return (
    <div>
      <h2 className="h4 fw-bold mb-2">Quién va ganando por jornada</h2>
      <p className="text-muted mb-4">
        Mira Mañana, Tarde y Noche por separado: ganador, ventaja y votos.
        Cada sección tiene su PDF.
      </p>

      {eleccion && (
        <p className="small mb-3">
          <strong>{eleccion.nombre}</strong>
          {eleccion.centro ? ` · ${eleccion.centro}` : ""}
        </p>
      )}

      <div className="row g-3 mb-4">
        {JORNADAS.map((jornada) => {
          const bloque = bloques.find((b) => b.jornada === jornada);
          const ganador = bloque?.ganador;
          return (
            <div key={`resumen-${jornada}`} className="col-md-4">
              <div
                className="h-100 p-3"
                style={{
                  border: "1px solid #e4e9e5",
                  borderRadius: 12,
                  background: "#f7faf7",
                }}
              >
                <p className="admin-dash-eyebrow mb-1">{jornada}</p>
                {ganador ? (
                  <>
                    <p className="fw-bold mb-1">
                      {ganador.nombre} {ganador.apellido}
                    </p>
                    <p className="mb-0 small">
                      {ganador.votos} votos ({ganador.porcentaje.toFixed(1)}%)
                      {bloque?.ventaja != null
                        ? ` · +${bloque.ventaja} vs 2°`
                        : ""}
                    </p>
                  </>
                ) : (
                  <p className="text-muted mb-0 small">Sin candidatos</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="d-flex justify-content-end mb-4">
        <Button
          variant="outline-success"
          disabled={!!cargando || !eleccion?.candidatos?.length}
          onClick={() => void pdfDeLasTres()}
        >
          <FaFilePdf className="me-2" />
          {cargando === "todas" ? "Generando…" : "PDF de las 3 jornadas"}
        </Button>
      </div>

      {JORNADAS.map((jornada) => {
        const bloque = bloques.find((b) => b.jornada === jornada);
        const ganador = bloque?.ganador;
        const segundo = bloque?.segundo;
        return (
          <section
            key={jornada}
            className="mb-4 p-3 p-md-4"
            style={{
              border: "1px solid #e4e9e5",
              borderRadius: 12,
              background: "#fff",
            }}
          >
            <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
              <div>
                <p className="admin-dash-eyebrow mb-1">Sección PDF</p>
                <h3 className="h5 fw-bold mb-1">Jornada {jornada}</h3>
                {ganador ? (
                  <>
                    <p className="mb-1">
                      Va ganando{" "}
                      <strong>
                        {ganador.nombre} {ganador.apellido}
                      </strong>{" "}
                      con {ganador.votos} votos ({ganador.porcentaje.toFixed(1)}
                      %).
                    </p>
                    {segundo && bloque?.ventaja != null ? (
                      <p className="text-muted mb-0 small">
                        Le saca {bloque.ventaja} voto{bloque.ventaja === 1 ? "" : "s"} a{" "}
                        {segundo.nombre} {segundo.apellido} ({segundo.votos} votos).
                      </p>
                    ) : (
                      <p className="text-muted mb-0 small">Único candidato de esta jornada.</p>
                    )}
                  </>
                ) : (
                  <p className="text-muted mb-0">Todavía no hay candidatos en esta jornada.</p>
                )}
              </div>
              <Button
                variant="success"
                disabled={!!cargando || !ganador}
                onClick={() => void pdfDeJornada(jornada)}
              >
                <FaFilePdf className="me-2" />
                {cargando === jornada
                  ? "Generando…"
                  : `Generar PDF · ${jornada}`}
              </Button>
            </div>

            {bloque && bloque.lista.length > 0 && (
              <>
                <div className="grafica-grid grafica-grid--2 mb-3">
                  <GraficaBarras
                    titulo={`Votos · ${jornada}`}
                    datos={bloque.lista.map((c) => ({
                      etiqueta: `${c.nombre} ${c.apellido}`.trim(),
                      valor: c.votos,
                    }))}
                    horizontal
                    unidad="votos"
                    alto="sm"
                  />
                  <GraficaDona
                    titulo={`Distribución · ${jornada}`}
                    datos={bloque.lista.map((c) => ({
                      etiqueta: `${c.nombre} ${c.apellido}`.trim(),
                      valor: c.votos,
                    }))}
                    alto="sm"
                  />
                </div>
                <div className="table-responsive">
                  <table className="table table-sm mb-0">
                    <thead>
                      <tr>
                        <th>Candidato</th>
                        <th>Votos</th>
                        <th>%</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bloque.lista.map((c, i) => (
                        <tr key={`${jornada}-${c.id}`}>
                          <td>
                            {c.nombre} {c.apellido}
                          </td>
                          <td className="fw-bold">{c.votos}</td>
                          <td>{c.porcentaje.toFixed(1)}%</td>
                          <td>
                            {i === 0 ? (
                              <span className="badge text-bg-success">Va ganando</span>
                            ) : i === 1 ? (
                              <span className="text-muted">Segundo</span>
                            ) : (
                              <span className="text-muted">Candidato</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        );
      })}
    </div>
  );
};

export default GeneracionReporte;
