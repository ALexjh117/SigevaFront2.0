import { useEffect, useRef, useState } from "react";
import "./ChatBot.css";

interface Mensaje {
  texto: string;
  usuario: boolean;
}

interface Respuesta {
  palabras: string[];
  respuesta: string;
}

const respuestas: Respuesta[] = [
  {
    palabras: ["hola", "buenas", "buenos dias", "buenas tardes", "saludos"],
    respuesta:
      "¡Hola! 👋 Soy SIGI, el asistente virtual de SIGEVA 🤖. Estoy aquí para ayudarte con todo lo relacionado con las elecciones del SENA. ¿Qué deseas consultar?"
  },

  {
    palabras: ["que es sigeva", "qué es sigeva", "para que sirve sigeva", "sigeva"],
    respuesta:
      "SIGEVA es una plataforma del SENA diseñada para gestionar y participar en procesos electorales de manera fácil, segura y transparente. 🗳️ Desde aquí puedes consultar elecciones, conocer candidatos y participar en los procesos electorales."
  },

  {
    palabras: [
      "como funciona",
      "cómo funciona",
      "funcionamiento",
      "como se usa",
      "cómo se usa"
    ],
    respuesta:
      "Es muy sencillo 😊. Ingresa a SIGEVA, consulta las elecciones disponibles, revisa la información de los candidatos y, cuando haya una elección activa, podrás participar siguiendo los pasos indicados por la plataforma."
  },

  {
    palabras: [
      "como votar",
      "cómo votar",
      "quiero votar",
      "votar",
      "voto",
      "votacion",
      "votación"
    ],
    respuesta:
      "🗳️ Para votar en SIGEVA debes ingresar a una elección activa, revisar los candidatos disponibles, seleccionar la opción de tu preferencia y confirmar tu participación. El sistema te indicará los pasos que debes seguir."
  },

  {
    palabras: [
      "donde votar",
      "dónde votar",
      "lugar para votar",
      "donde puedo votar"
    ],
    respuesta:
      "📍 En SIGEVA puedes consultar las elecciones disponibles directamente desde la plataforma. Si tienes una elección activa, allí encontrarás la opción correspondiente para participar."
  },

  {
    palabras: [
      "candidatos",
      "candidato",
      "ver candidatos",
      "donde veo los candidatos",
      "dónde veo los candidatos",
      "conocer candidatos"
    ],
    respuesta:
      "👥 Puedes consultar los candidatos desde el proceso electoral correspondiente. Allí podrás conocer las opciones disponibles antes de realizar tu voto."
  },

  {
    palabras: [
      "informacion de candidatos",
      "información de candidatos",
      "propuestas",
      "propuestas de candidatos"
    ],
    respuesta:
      "📋 SIGEVA permite consultar la información disponible de los candidatos para que puedas conocer sus propuestas antes de participar en la elección."
  },

  {
    palabras: [
      "cuando son las elecciones",
      "cuándo son las elecciones",
      "fecha de elecciones",
      "fechas de elecciones",
      "fecha eleccion",
      "fecha elección"
    ],
    respuesta:
      "📅 Las fechas dependen de cada proceso electoral. Puedes consultar en SIGEVA las elecciones disponibles y revisar la fecha de inicio y finalización de cada proceso."
  },

  {
    palabras: [
      "elecciones",
      "eleccion",
      "elección",
      "proceso electoral",
      "procesos electorales"
    ],
    respuesta:
      "🗳️ En SIGEVA puedes consultar los procesos electorales disponibles, conocer sus fechas, revisar los candidatos y participar cuando una elección se encuentre activa."
  },

  {
    palabras: [
      "resultados",
      "resultado",
      "ver resultados",
      "donde veo los resultados",
      "dónde veo los resultados"
    ],
    respuesta:
      "📊 Los resultados de una elección pueden consultarse una vez finalizado el proceso electoral y cuando estos hayan sido publicados en SIGEVA."
  },

  {
    palabras: [
      "seguro",
      "seguridad",
      "es seguro",
      "es segura",
      "voto seguro"
    ],
    respuesta:
      "🔐 SIGEVA está pensado para facilitar procesos electorales de manera segura y transparente, permitiendo gestionar la participación de los usuarios y consultar la información correspondiente a cada elección."
  },

  {
    palabras: [
      "quien puede usarlo",
      "quién puede usarlo",
      "usuarios",
      "quienes pueden votar",
      "quiénes pueden votar"
    ],
    respuesta:
      "👤 El acceso y las funciones disponibles dependen del tipo de usuario y de los permisos asignados dentro de SIGEVA. Los usuarios habilitados podrán participar en los procesos electorales correspondientes."
  },

  {
    palabras: [
      "aprendices",
      "aprendiz",
      "funcionarios",
      "funcionario"
    ],
    respuesta:
      "🎓 SIGEVA puede ser utilizado por los usuarios del SENA que estén habilitados para participar en los procesos electorales correspondientes, según las reglas y permisos establecidos."
  },

  {
    palabras: [
      "administrador",
      "administradores",
      "admin"
    ],
    respuesta:
      "⚙️ Los administradores cuentan con funciones especiales para gestionar los procesos electorales de acuerdo con los permisos establecidos en SIGEVA."
  },

  {
    palabras: [
      "desde celular",
      "celular",
      "telefono",
      "teléfono",
      "computador",
      "computadora",
      "dispositivo"
    ],
    respuesta:
      "📱 SIGEVA está pensado para facilitar la participación desde diferentes dispositivos. Puedes acceder a la plataforma desde el dispositivo que tengas disponible y consultar las opciones habilitadas."
  },

  {
    palabras: [
      "ayuda",
      "ayudame",
      "ayúdame",
      "necesito ayuda",
      "como puedo ayudarte"
    ],
    respuesta:
      "😊 ¡Claro que sí! Puedo ayudarte con preguntas como: ¿Qué es SIGEVA?, ¿Cómo puedo votar?, ¿Dónde veo los candidatos?, ¿Cuándo son las elecciones?, ¿Dónde veo los resultados? o ¿Es seguro votar?"
  },

  {
    palabras: [
      "gracias",
      "muchas gracias",
      "te agradezco"
    ],
    respuesta:
      "¡Con mucho gusto! 💚 Me alegra poder ayudarte. Si tienes otra pregunta sobre SIGEVA, aquí estaré. 🤖"
  },

  {
    palabras: [
      "adios",
      "adiós",
      "chao",
      "hasta luego"
    ],
    respuesta:
      "¡Hasta luego! 👋 Recuerda que SIGEVA está para facilitar tu participación en los procesos electorales del SENA. 🗳️"
  }
];

const normalizarTexto = (texto: string): string => {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

const buscarRespuesta = (mensaje: string): string => {
  const texto = normalizarTexto(mensaje);

  let mejorRespuesta = "";
  let mayorPuntaje = 0;

  for (const item of respuestas) {
    let puntaje = 0;

    for (const palabra of item.palabras) {
      const palabraNormalizada = normalizarTexto(palabra);

      if (texto.includes(palabraNormalizada)) {
        // Las frases completas tienen mayor prioridad
        puntaje += palabraNormalizada.split(" ").length * 2;
      }
    }

    if (puntaje > mayorPuntaje) {
      mayorPuntaje = puntaje;
      mejorRespuesta = item.respuesta;
    }
  }

  if (mejorRespuesta) {
    return mejorRespuesta;
  }

  return "🤔 No estoy seguro de cómo responder a esa pregunta. Puedes preguntarme sobre elecciones, candidatos, votaciones, resultados o sobre cómo funciona SIGEVA.";
};

export default function ChatBot() {
  const [abierto, setAbierto] = useState(false);

  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      texto:
        "¡Hola! 👋 Soy SIGI, el asistente virtual de SIGEVA 🤖. Estoy aquí para ayudarte con los procesos electorales del SENA. ¿Qué deseas consultar?",
      usuario: false
    }
  ]);

  const [entrada, setEntrada] = useState("");
  const [escribiendo, setEscribiendo] = useState(false);

  const mensajesEndRef = useRef<HTMLDivElement>(null);

  // Scroll automático al último mensaje
  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [mensajes, escribiendo]);

  // Enviar cualquier pregunta
  const enviarPregunta = (pregunta: string) => {
    if (!pregunta.trim() || escribiendo) return;

    const mensajeUsuario: Mensaje = {
      texto: pregunta,
      usuario: true
    };

    setMensajes((mensajesAnteriores) => [
      ...mensajesAnteriores,
      mensajeUsuario
    ]);

    setEntrada("");
    setEscribiendo(true);

    // Simulamos que SIGI está escribiendo
    setTimeout(() => {
      const respuestaBot: Mensaje = {
        texto: buscarRespuesta(pregunta),
        usuario: false
      };

      setMensajes((mensajesAnteriores) => [
        ...mensajesAnteriores,
        respuestaBot
      ]);

      setEscribiendo(false);
    }, 800);
  };

  // Preguntas rápidas
  const enviarPreguntaRapida = (pregunta: string) => {
    enviarPregunta(pregunta);
  };

  // Detectar Enter
  const manejarEnter = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      enviarPregunta(entrada);
    }
  };

  return (
    <div className="chatbot-container">

      {/* BOTÓN PARA ABRIR */}
      {!abierto && (
        <button
          className="chatbot-button"
          onClick={() => setAbierto(true)}
          aria-label="Abrir asistente SIGEVA"
        >
          🤖
        </button>
      )}

      {/* VENTANA DEL CHAT */}
      {abierto && (
        <div className="chatbot-window">

          {/* HEADER */}
          <div className="chatbot-header">

            <div className="chatbot-header-info">

              <div className="chatbot-avatar">
                🤖
              </div>

              <div>
                <strong>SIGI</strong>

                <span className="chatbot-status">
                  <span className="status-dot"></span>
                  Asistente SIGEVA
                </span>
              </div>

            </div>

            <button
              className="chatbot-close"
              onClick={() => setAbierto(false)}
              aria-label="Cerrar chatbot"
            >
              ×
            </button>

          </div>

          {/* MENSAJES */}
          <div className="chatbot-messages">

            {mensajes.map((mensaje, index) => (
              <div
                key={index}
                className={
                  mensaje.usuario
                    ? "mensaje usuario"
                    : "mensaje bot"
                }
              >
                {!mensaje.usuario && (
                  <div className="mensaje-avatar">
                    🤖
                  </div>
                )}

                <div className="mensaje-texto">
                  {mensaje.texto}
                </div>
              </div>
            ))}

            {/* INDICADOR DE ESCRITURA */}
            {escribiendo && (
              <div className="mensaje bot">

                <div className="mensaje-avatar">
                  🤖
                </div>

                <div className="mensaje-texto escribiendo">
                  <span>SIGI está escribiendo</span>
                  <span className="puntos">•••</span>
                </div>

              </div>
            )}

            {/* PREGUNTAS RÁPIDAS */}
            {mensajes.length === 1 && !escribiendo && (
              <div className="preguntas-rapidas">

                <p>✨ También puedes preguntarme:</p>

                <button
                  onClick={() =>
                    enviarPreguntaRapida(
                      "¿Cómo puedo votar?"
                    )
                  }
                >
                  🗳️ ¿Cómo puedo votar?
                </button>

                <button
                  onClick={() =>
                    enviarPreguntaRapida(
                      "¿Dónde veo los candidatos?"
                    )
                  }
                >
                  👥 Ver candidatos
                </button>

                <button
                  onClick={() =>
                    enviarPreguntaRapida(
                      "¿Cuándo son las elecciones?"
                    )
                  }
                >
                  📅 Fechas de elecciones
                </button>

                <button
                  onClick={() =>
                    enviarPreguntaRapida(
                      "¿Dónde veo los resultados?"
                    )
                  }
                >
                  📊 Ver resultados
                </button>

                <button
                  onClick={() =>
                    enviarPreguntaRapida(
                      "¿Qué es SIGEVA?"
                    )
                  }
                >
                  ℹ️ ¿Qué es SIGEVA?
                </button>

              </div>
            )}

            {/* REFERENCIA PARA EL SCROLL */}
            <div ref={mensajesEndRef} />

          </div>

          {/* INPUT */}
          <div className="chatbot-input-container">

            <input
              type="text"
              placeholder={
                escribiendo
                  ? "SIGI está escribiendo..."
                  : "Escribe tu pregunta..."
              }
              value={entrada}
              onChange={(e) =>
                setEntrada(e.target.value)
              }
              onKeyDown={manejarEnter}
              disabled={escribiendo}
            />

            <button
              onClick={() =>
                enviarPregunta(entrada)
              }
              disabled={
                escribiendo || !entrada.trim()
              }
              aria-label="Enviar mensaje"
            >
              ➤
            </button>

          </div>

        </div>
      )}

    </div>
  );
}