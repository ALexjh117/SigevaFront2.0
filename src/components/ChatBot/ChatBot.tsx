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
  // SALUDO
  {
    palabras: [
      "hola",
      "buenas",
      "buenos dias",
      "buenas tardes",
      "saludos"
    ],
    respuesta:
      "¡Hola! 👋 Soy SIGI, el asistente virtual de SIGEVA 🤖. Estoy aquí para ayudarte con todo lo relacionado con las elecciones del SENA. ¿Qué deseas consultar?"
  },

  // ¿QUÉ ES SIGEVA?
  {
    palabras: [
      "que es sigeva",
      "para que sirve sigeva",
      "sigeva"
    ],
    respuesta:
      "SIGEVA es una plataforma del SENA diseñada para gestionar y participar en procesos electorales de manera fácil, segura y transparente. 🗳️ Desde aquí puedes consultar elecciones, conocer candidatos y participar en los procesos electorales."
  },

  // ¿CÓMO FUNCIONA?
  {
    palabras: [
      "como funciona",
      "funcionamiento",
      "como se usa"
    ],
    respuesta:
      "Es muy sencillo 😊. Ingresa a SIGEVA, consulta las elecciones disponibles, revisa la información de los candidatos y, cuando haya una elección activa, podrás participar siguiendo los pasos indicados por la plataforma."
  },

  // CÓMO INGRESAR
  {
    palabras: [
      "como ingresar",
      "como entro",
      "como acceder",
      "ingresar a la plataforma",
      "entrar a la plataforma",
      "acceder a sigeva",
      "como inicio sesion",
      "inicio sesion"
    ],
    respuesta:
      "🔐 Para ingresar a SIGEVA, primero necesito saber qué tipo de usuario eres. Selecciona una de las siguientes opciones: 🎓 Aprendiz, 👨‍💼 Funcionario o ⚙️ Administrador."
  },

  // VOTAR
  {
    palabras: [
      "como votar",
      "quiero votar",
      "votar",
      "voto",
      "votacion"
    ],
    respuesta:
      "🗳️ Para votar en SIGEVA debes ingresar a una elección activa, revisar los candidatos disponibles, seleccionar la opción de tu preferencia y confirmar tu participación. El sistema te indicará los pasos que debes seguir."
  },

  // DÓNDE VOTAR
  {
    palabras: [
      "donde votar",
      "lugar para votar",
      "donde puedo votar"
    ],
    respuesta:
      "📍 En SIGEVA puedes consultar las elecciones disponibles directamente desde la plataforma. Si tienes una elección activa, allí encontrarás la opción correspondiente para participar."
  },

  // CANDIDATOS
  {
    palabras: [
      "candidatos",
      "candidato",
      "ver candidatos",
      "donde veo los candidatos",
      "conocer candidatos"
    ],
    respuesta:
      "👥 Puedes consultar los candidatos desde el proceso electoral correspondiente. Allí podrás conocer las opciones disponibles antes de realizar tu voto."
  },

  // INFORMACIÓN DE CANDIDATOS
  {
    palabras: [
      "informacion de candidatos",
      "propuestas",
      "propuestas de candidatos"
    ],
    respuesta:
      "📋 SIGEVA permite consultar la información disponible de los candidatos para que puedas conocer sus propuestas antes de participar en la elección."
  },

  // FECHAS
  {
    palabras: [
      "cuando son las elecciones",
      "fecha de elecciones",
      "fechas de elecciones",
      "fecha eleccion"
    ],
    respuesta:
      "📅 Las fechas dependen de cada proceso electoral. Puedes consultar en SIGEVA las elecciones disponibles y revisar la fecha de inicio y finalización de cada proceso."
  },

  // ELECCIONES
  {
    palabras: [
      "elecciones",
      "eleccion",
      "proceso electoral",
      "procesos electorales"
    ],
    respuesta:
      "🗳️ En SIGEVA puedes consultar los procesos electorales disponibles, conocer sus fechas, revisar los candidatos y participar cuando una elección se encuentre activa."
  },

  // RESULTADOS
  {
    palabras: [
      "resultados",
      "resultado",
      "ver resultados",
      "donde veo los resultados"
    ],
    respuesta:
      "📊 Los resultados de una elección pueden consultarse una vez finalizado el proceso electoral y cuando estos hayan sido publicados en SIGEVA."
  },

  // SEGURIDAD
  {
    palabras: [
      "seguro",
      "seguridad",
      "es seguro",
      "voto seguro"
    ],
    respuesta:
      "🔐 SIGEVA está pensado para facilitar procesos electorales de manera segura y transparente, permitiendo gestionar la participación de los usuarios y consultar la información correspondiente a cada elección."
  },

  // USUARIOS
  {
    palabras: [
      "quien puede usarlo",
      "quienes pueden votar",
      "usuarios"
    ],
    respuesta:
      "👤 El acceso y las funciones disponibles dependen del tipo de usuario y de los permisos asignados dentro de SIGEVA. Los usuarios habilitados podrán participar en los procesos electorales correspondientes."
  },

  // APRENDICES
  {
    palabras: [
      "aprendices",
      "aprendiz"
    ],
    respuesta:
      "🎓 Los aprendices habilitados pueden participar en los procesos electorales correspondientes y acceder a las funciones disponibles en SIGEVA."
  },

  // FUNCIONARIOS
  {
    palabras: [
      "funcionarios",
      "funcionario"
    ],
    respuesta:
      "👨‍💼 Los funcionarios habilitados pueden acceder a las funciones correspondientes dentro de SIGEVA. Si necesitas información sobre tu acceso, puedes acercarte a Bienestar al Aprendiz."
  },

  // ADMINISTRADORES
  {
    palabras: [
      "administrador",
      "administradores",
      "admin"
    ],
    respuesta:
      "⚙️ Los administradores cuentan con funciones especiales para gestionar los procesos electorales de acuerdo con los permisos establecidos en SIGEVA."
  },

  // DISPOSITIVOS
  {
    palabras: [
      "desde celular",
      "celular",
      "telefono",
      "computador",
      "computadora",
      "dispositivo"
    ],
    respuesta:
      "📱 SIGEVA está pensado para facilitar la participación desde diferentes dispositivos. Puedes acceder a la plataforma desde el dispositivo que tengas disponible y consultar las opciones habilitadas."
  },

  // AYUDA
  {
    palabras: [
      "ayuda",
      "ayudame",
      "necesito ayuda"
    ],
    respuesta:
      "😊 ¡Claro que sí! Puedo ayudarte con preguntas como: ¿Qué es SIGEVA?, ¿Cómo puedo votar?, ¿Cómo ingreso a la plataforma?, ¿Dónde veo los candidatos?, ¿Cuándo son las elecciones? o ¿Dónde veo los resultados?"
  },

  // GRACIAS
  {
    palabras: [
      "gracias",
      "muchas gracias",
      "te agradezco"
    ],
    respuesta:
      "¡Con mucho gusto! 💚 Me alegra poder ayudarte. Si tienes otra pregunta sobre SIGEVA, aquí estaré. 🤖"
  },

  // DESPEDIDA
  {
    palabras: [
      "adios",
      "chao",
      "hasta luego"
    ],
    respuesta:
      "¡Hasta luego! 👋 Recuerda que SIGEVA está para facilitar tu participación en los procesos electorales del SENA. 🗳️"
  }
];


// NORMALIZAR TEXTO
const normalizarTexto = (texto: string): string => {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};


// BUSCAR RESPUESTA
const buscarRespuesta = (mensaje: string): string => {
  const texto = normalizarTexto(mensaje);

  let mejorRespuesta = "";
  let mayorPuntaje = 0;

  for (const item of respuestas) {
    let puntaje = 0;

    for (const palabra of item.palabras) {
      const palabraNormalizada = normalizarTexto(palabra);

      if (texto.includes(palabraNormalizada)) {
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

  return "🤔 No estoy seguro de cómo responder a esa pregunta. Puedes preguntarme sobre elecciones, candidatos, votaciones, resultados, acceso o sobre cómo funciona SIGEVA.";
};


export default function ChatBot() {

  // ABRIR / CERRAR CHAT
  const [abierto, setAbierto] = useState(false);

  // MENSAJES
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      texto:
        "¡Hola! 👋 Soy SIGI, el asistente virtual de SIGEVA 🤖. Estoy aquí para ayudarte con los procesos electorales del SENA. ¿Qué deseas consultar?",
      usuario: false
    }
  ]);

  // INPUT
  const [entrada, setEntrada] = useState("");

  // INDICADOR DE ESCRITURA
  const [escribiendo, setEscribiendo] = useState(false);

  // MOSTRAR OPCIONES DE TIPO DE USUARIO
  const [mostrarTiposUsuario, setMostrarTiposUsuario] =
    useState(false);

  // REFERENCIA PARA SCROLL
  const mensajesEndRef = useRef<HTMLDivElement>(null);


  // SCROLL AUTOMÁTICO
  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [mensajes, escribiendo, mostrarTiposUsuario]);


  // SELECCIONAR TIPO DE USUARIO
  const seleccionarTipoUsuario = (tipo: string) => {

    let respuesta = "";

    let textoUsuario = "";

    if (tipo === "aprendiz") {

      textoUsuario = "🎓 Soy aprendiz";

      respuesta =
        "🎓 Como aprendiz, puedes ingresar a SIGEVA utilizando tu correo institucional del SENA y tu contraseña, que corresponde a tu número de cédula.";

    }

    if (tipo === "funcionario") {

      textoUsuario = "👨‍💼 Soy funcionario";

      respuesta =
        "👨‍💼 Si eres funcionario, acércate a Bienestar al Aprendiz, donde podrán ayudarte con la información necesaria para ingresar a SIGEVA. También puedes escribir al correo fabricaswctpicauca@gmail.com.";

    }

    if (tipo === "administrador") {

      textoUsuario = "⚙️ Soy administrador";

      respuesta =
        "⚙️ Si eres administrador, acércate a Bienestar al Aprendiz, donde podrán brindarte la información necesaria para ingresar a SIGEVA. También puedes escribir al correo fabricaswctpicauca@gmail.com.";

    }

    const mensajeUsuario: Mensaje = {
      texto: textoUsuario,
      usuario: true
    };

    const respuestaBot: Mensaje = {
      texto: respuesta,
      usuario: false
    };

    setMensajes((mensajesAnteriores) => [
      ...mensajesAnteriores,
      mensajeUsuario,
      respuestaBot
    ]);

    setMostrarTiposUsuario(false);
  };


  // ENVIAR PREGUNTA
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

    setMostrarTiposUsuario(false);


    setTimeout(() => {

      const respuestaBot: Mensaje = {
        texto: buscarRespuesta(pregunta),
        usuario: false
      };

      setMensajes((mensajesAnteriores) => [
        ...mensajesAnteriores,
        respuestaBot
      ]);


      const textoNormalizado =
        normalizarTexto(pregunta);


      // DETECTAR PREGUNTA DE INGRESO
      const esPreguntaIngreso =
        textoNormalizado.includes("como ingresar") ||
        textoNormalizado.includes("como acceder") ||
        textoNormalizado.includes("como entro") ||
        textoNormalizado.includes(
          "ingresar a la plataforma"
        ) ||
        textoNormalizado.includes(
          "entrar a la plataforma"
        ) ||
        textoNormalizado.includes(
          "acceder a sigeva"
        ) ||
        textoNormalizado.includes(
          "inicio sesion"
        );


      if (esPreguntaIngreso) {
        setMostrarTiposUsuario(true);
      }

      setEscribiendo(false);

    }, 800);
  };


  // PREGUNTA RÁPIDA
  const enviarPreguntaRapida = (
    pregunta: string
  ) => {
    enviarPregunta(pregunta);
  };


  // ENTER
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


      {/* VENTANA */}
      {abierto && (

        <div className="chatbot-window">

          {/* HEADER */}
          <div className="chatbot-header">

            <div className="chatbot-header-info">

              <div className="chatbot-avatar">
                🤖
              </div>

              <div>

                <strong>
                  SIGI
                </strong>

                <span className="chatbot-status">

                  <span className="status-dot"></span>

                  Asistente SIGEVA

                </span>

              </div>

            </div>


            {/* CERRAR */}
            <button
              className="chatbot-close"
              onClick={() =>
                setAbierto(false)
              }
              aria-label="Cerrar chatbot"
            >
              ×
            </button>

          </div>


          {/* MENSAJES */}
          <div className="chatbot-messages">

            {mensajes.map(
              (mensaje, index) => (

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

              )
            )}


            {/* SIGI ESCRIBIENDO */}
            {escribiendo && (

              <div className="mensaje bot">

                <div className="mensaje-avatar">
                  🤖
                </div>

                <div className="mensaje-texto escribiendo">

                  <span>
                    SIGI está escribiendo
                  </span>

                  <span className="puntos">
                    •••
                  </span>

                </div>

              </div>

            )}


            {/* PREGUNTAS INICIALES */}
            {mensajes.length === 1 &&
              !escribiendo && (
                <div className="preguntas-rapidas">

                  <p>
                    ✨ También puedes preguntarme:
                  </p>

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

                </div>
              )}


            {/* OPCIONES DE USUARIO */}
            {mostrarTiposUsuario &&
              !escribiendo && (

                <div className="preguntas-rapidas">

                  <p>
                    👤 ¿Qué tipo de usuario eres?
                  </p>

                  <button
                    onClick={() =>
                      seleccionarTipoUsuario(
                        "aprendiz"
                      )
                    }
                  >
                    🎓 Aprendiz
                  </button>

                  <button
                    onClick={() =>
                      seleccionarTipoUsuario(
                        "funcionario"
                      )
                    }
                  >
                    👨‍💼 Funcionario
                  </button>

                  <button
                    onClick={() =>
                      seleccionarTipoUsuario(
                        "administrador"
                      )
                    }
                  >
                    ⚙️ Administrador
                  </button>

                </div>

              )}


            {/* REFERENCIA SCROLL */}
            <div ref={mensajesEndRef}></div>

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
                escribiendo ||
                !entrada.trim()
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