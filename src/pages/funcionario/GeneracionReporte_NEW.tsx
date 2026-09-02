import React, { useState, useEffect, useMemo } from "react";
import { generarReporte } from "../../utils/generarReporte";
import { type Jornada } from "../../constants/jornada";
import { bloquesPorJornada } from "../../utils/resultadosJornada";
import { PanelResultadosJornada } from "../../components/resultados/PanelResultadosJornada";
import type { CandidatoResultado } from "../../hooks/useResultadosEnVivo";

interface Eleccion {
  id: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
  centro: string;
  jornada: string;
  totalVotos: number;
  candidatos?: CandidatoResultado[];
}

interface GeneracionReporteProps {
  eleccion?: Eleccion;
  actualizado?: Date | null;
  cargando?: boolean;
}

const GeneracionReporte: React.FC<GeneracionReporteProps> = ({
  eleccion: eleccionProp,
  actualizado,
  cargando,
}) => {
  const [eleccion, setEleccion] = useState<Eleccion | null>(null);
  const [exportando, setExportando] = useState<Jornada | "todas" | "">("");

  useEffect(() => {
    setEleccion(eleccionProp || null);
  }, [eleccionProp]);

  const candidatos = eleccion?.candidatos ?? [];
  const bloques = useMemo(() => bloquesPorJornada(candidatos, true), [candidatos]);

  const pdfDeJornada = async (jornada: Jornada) => {
    if (!eleccion) return;
    const bloque = bloques.find((b) => b.jornada === jornada);
    if (!bloque?.lista.length) return;
    setExportando(jornada);
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
      setExportando("");
    }
  };

  const pdfDeLasTres = async () => {
    if (!eleccion?.candidatos?.length) return;
    setExportando("todas");
    try {
      await generarReporte({
        ...eleccion,
        jornada: "Mañana, Tarde y Noche",
        candidatos: eleccion.candidatos,
      });
    } catch (error) {
      console.error("Error al generar el PDF:", error);
    } finally {
      setExportando("");
    }
  };

  if (!eleccion) return null;

  return (
    <PanelResultadosJornada
      candidatos={candidatos}
      nombreEleccion={eleccion.nombre}
      centro={eleccion.centro}
      cargando={cargando}
      actualizado={actualizado}
      exportando={exportando}
      onPdfJornada={pdfDeJornada}
      onPdfTodas={pdfDeLasTres}
    />
  );
};

export default GeneracionReporte;
