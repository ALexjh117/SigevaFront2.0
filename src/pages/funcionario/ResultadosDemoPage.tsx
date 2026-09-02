import { useEffect, useMemo, useState } from "react";
import { generarReporte } from "../../utils/generarReporte";
import { esJornada, type Jornada } from "../../constants/jornada";
import { bloquesPorJornada } from "../../utils/resultadosJornada";
import type { CandidatoResultado } from "../../hooks/useResultadosEnVivo";
import { PanelResultadosJornada } from "../../components/resultados/PanelResultadosJornada";

const FOTOS = [
  "/demo-candidatos/1.jpg",
  "/demo-candidatos/2.jpg",
  "/demo-candidatos/3.jpg",
  "/demo-candidatos/4.jpg",
  "/demo-candidatos/5.jpg",
  "/demo-candidatos/6.jpg",
  "/demo-candidatos/7.jpg",
  "/demo-candidatos/8.jpg",
  "/demo-candidatos/9.jpg",
];

const SEMILLA: CandidatoResultado[] = [
  { id: 1, nombre: "Gustavo", apellido: "Petro", votos: 4039, porcentaje: 0, jornada: "Mañana", foto: FOTOS[0], numeroTarjeton: "01" },
  { id: 2, nombre: "Rodolfo", apellido: "Hernández", votos: 2799, porcentaje: 0, jornada: "Mañana", foto: FOTOS[1], numeroTarjeton: "02" },
  { id: 3, nombre: "Federico", apellido: "Gutiérrez", votos: 2398, porcentaje: 0, jornada: "Mañana", foto: FOTOS[2], numeroTarjeton: "03" },
  { id: 4, nombre: "Sergio", apellido: "Fajardo", votos: 422, porcentaje: 0, jornada: "Mañana", foto: FOTOS[3], numeroTarjeton: "04" },
  { id: 5, nombre: "Laura", apellido: "Restrepo", votos: 1810, porcentaje: 0, jornada: "Tarde", foto: FOTOS[4], numeroTarjeton: "05" },
  { id: 6, nombre: "Camilo", apellido: "Suárez", votos: 1540, porcentaje: 0, jornada: "Tarde", foto: FOTOS[5], numeroTarjeton: "06" },
  { id: 7, nombre: "Diana", apellido: "Pineda", votos: 890, porcentaje: 0, jornada: "Tarde", foto: FOTOS[6], numeroTarjeton: "07" },
  { id: 8, nombre: "Andrés", apellido: "Molina", votos: 2100, porcentaje: 0, jornada: "Noche", foto: FOTOS[8], numeroTarjeton: "08" },
  { id: 9, nombre: "Natalia", apellido: "Quintero", votos: 1760, porcentaje: 0, jornada: "Noche", foto: FOTOS[7], numeroTarjeton: "09" },
];

export default function ResultadosDemoPage() {
  const param = new URLSearchParams(window.location.search).get("j");
  const jornadaInicial = esJornada(param) ? param : undefined;
  const [candidatos, setCandidatos] = useState(SEMILLA);
  const [actualizado, setActualizado] = useState(() => new Date());
  const [exportando, setExportando] = useState<Jornada | "todas" | "">("");

  useEffect(() => {
    const t = window.setInterval(() => {
      setCandidatos((prev) =>
        prev.map((c) => ({
          ...c,
          votos: c.votos + Math.floor(Math.random() * 4),
        }))
      );
      setActualizado(new Date());
    }, 2500);
    return () => window.clearInterval(t);
  }, []);

  const bloques = useMemo(() => bloquesPorJornada(candidatos, true), [candidatos]);
  const totalVotos = candidatos.reduce((s, c) => s + c.votos, 0);

  const base = {
    id: "demo",
    nombre: "Elección de prueba · Representante de centro",
    fechaInicio: "2026-09-01",
    fechaFin: "2026-09-01",
    estado: "En curso",
    centro: "Centro de Formación Demo",
    totalParticipantes: 12000,
    participantes: [] as [],
  };

  const pdfJornada = async (jornada: Jornada) => {
    const bloque = bloques.find((b) => b.jornada === jornada);
    if (!bloque?.lista.length) return;
    setExportando(jornada);
    try {
      await generarReporte({
        ...base,
        jornada,
        totalVotos: bloque.totalVotos,
        candidatos: bloque.lista,
      });
    } finally {
      setExportando("");
    }
  };

  const pdfTodas = async () => {
    setExportando("todas");
    try {
      await generarReporte({
        ...base,
        jornada: "Mañana, Tarde y Noche",
        totalVotos,
        candidatos,
      });
    } finally {
      setExportando("");
    }
  };

  return (
    <div
      className="admin-page admin-page--resultados"
      style={{
        maxWidth: 1280,
        margin: "0 auto",
        padding: "1.5rem 1rem 3rem",
        minHeight: "100vh",
        background: "#e8eef4",
      }}
    >
      <p className="admin-dash-eyebrow mb-1">Vista de prueba</p>
      <h1 className="h3 fw-bold mb-2">Así se ve el escrutinio</h1>
      <p className="text-muted mb-4">
        Datos de ejemplo con fotos. Los votos suben solos para probar el tiempo real.
        En la app real, el funcionario y el admin de centro ven las elecciones de su
        sede; el admin global elige primero el centro.
      </p>
      <PanelResultadosJornada
        candidatos={candidatos}
        nombreEleccion={base.nombre}
        centro={base.centro}
        actualizado={actualizado}
        exportando={exportando}
        jornadaInicial={jornadaInicial}
        onPdfJornada={pdfJornada}
        onPdfTodas={pdfTodas}
      />
    </div>
  );
}
