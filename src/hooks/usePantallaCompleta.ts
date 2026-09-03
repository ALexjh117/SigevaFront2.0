import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

function elementoFullscreen() {
  const doc = document as Document & { webkitFullscreenElement?: Element };
  return document.fullscreenElement || doc.webkitFullscreenElement || null;
}

async function pedirFullscreen(el: HTMLElement) {
  const extra = el as HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void> | void;
  };
  if (el.requestFullscreen) return el.requestFullscreen();
  if (extra.webkitRequestFullscreen) return extra.webkitRequestFullscreen();
}

async function salirFullscreenNativo() {
  const doc = document as Document & {
    webkitExitFullscreen?: () => Promise<void> | void;
  };
  if (!elementoFullscreen()) return;
  if (document.exitFullscreen) return document.exitFullscreen();
  if (doc.webkitExitFullscreen) return doc.webkitExitFullscreen();
}

/** Cubre el viewport y pide fullscreen nativo para televisores. */
export function usePantallaCompleta(ref: RefObject<HTMLElement | null>) {
  const [activa, setActiva] = useState(false);
  const nativo = useRef(false);

  const entrar = useCallback(async () => {
    setActiva(true);
    const el = ref.current;
    if (!el) return;
    try {
      await pedirFullscreen(el);
      nativo.current = Boolean(elementoFullscreen());
    } catch {
      nativo.current = false;
    }
  }, [ref]);

  const salir = useCallback(async () => {
    nativo.current = false;
    setActiva(false);
    try {
      await salirFullscreenNativo();
    } catch {
      /* ignore */
    }
  }, []);

  const alternar = useCallback(() => {
    if (activa) void salir();
    else void entrar();
  }, [activa, entrar, salir]);

  useEffect(() => {
    const sync = () => {
      const fs = elementoFullscreen();
      const nuestro = Boolean(fs && ref.current && (fs === ref.current || ref.current.contains(fs)));
      if (nuestro) {
        nativo.current = true;
        setActiva(true);
        return;
      }
      if (nativo.current) {
        nativo.current = false;
        setActiva(false);
      }
    };
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
    };
  }, [ref]);

  useEffect(() => {
    if (!activa) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") void salir();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activa, salir]);

  useEffect(() => {
    document.body.classList.toggle("tv-full-open", activa);
    return () => document.body.classList.remove("tv-full-open");
  }, [activa]);

  return { activa, entrar, salir, alternar };
}
