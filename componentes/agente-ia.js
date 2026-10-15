/* ============================================================
   COMPONENTE: Agente de IA (chat flotante "Sue")
   ------------------------------------------------------------
   No necesita placeholder <div> en el HTML: se auto-inyecta en
   el <body> como un widget flotante (position: fixed), así que
   basta con incluir el <script> en cualquier página.
   Detecta solo si está en /html/ para armar la ruta del avatar.
   ============================================================ */
(function() {
    "use strict"; //use strict para evitar errores comunes y malas prácticas en JavaScript

    // Detecta si la página actual está dentro de la carpeta /html/ (como ya
    // se hace en resenas.js y captcha.js) para armar la ruta correcta.
    const _enHtml = window.location.pathname.includes("/html/");

    const IA_API_PATH = _enHtml ? "../api/ia_sue.php" : "api/ia_sue.php";

    const TE_CONFIG = {
        nombre: "Sue",
        avatarImg: (_enHtml ? "../img/" : "img/") + "sarafoto.png",
        modelo: "llama-3.3-70b-versatile", //el modelo de IA
        burbujaDelay: 3000, // Milisegundos antes de mostrar la burbuja de atención
        burbulaAutoClose: 6000, // Milisegundos que dura visible la burbuja antes de ocultarse
        chips: [
            { emoji: "🚌", texto: "Transporte desde Bucaramanga" },
            { emoji: "🏨", texto: "Hospedaje accesible" },
            { emoji: "🗺️", texto: "Planes turísticos" },
            { emoji: "♿", texto: "Turismo inclusivo" },
            { emoji: "📍", texto: "Destinos en Santander" },
            { emoji: "🧭", texto: "Guías especializados" },
        ],
        //se envia a la api, para q la ia sepa como responder, que tono usar, que información dar, etc...
        systemPrompt: `Eres Sue, la asistente virtual de TourismEasy, la plataforma de turismo inclusivo y accesible de Santander, Colombia.

Tu función es ayudar a viajeros con:
- Información sobre destinos en Santander (Bucaramanga, San Gil, Barichara, Cañón del Chicamocha, Socorro, Girón, Vélez, Los Santos, etc.)
- Transporte hacia y desde Santander (terminal y rutas intermunicipales)
- Hospedaje accesible e inclusivo
- Planes turísticos adaptados
- Personal auxiliar y guías especializados
- Turismo para personas con discapacidad visual, auditiva o motriz
- E-commerce de la plataforma

Reglas:
- Responde SIEMPRE en español, de forma amable, concisa y empática.
- Si el usuario tiene una discapacidad, adapta tu tono con especial sensibilidad.
- Nunca inventes precios exactos; indícales que consulten la sección correspondiente.
- Máximo 3 párrafos cortos por respuesta.
- Usa emojis con moderación para hacer la conversación más cálida.
- Si no sabes algo específico de TourismEasy, recomienda al usuario ir a la sección del menú correspondiente.
- Puedes responder cualquier pregunta, tenga o no relación con turismo o TourismEasy (cultura general, dudas cotidianas, tareas, lo que sea). Contesta EXACTAMENTE lo que te preguntan, de forma directa y completa.
- NO agregues frases de cierre sobre turismo, viajes o TourismEasy si la pregunta no tiene relación con eso. No cierres cada respuesta invitando a planear un viaje ni menciones Santander a la fuerza. Solo habla de turismo cuando el usuario pregunte sobre turismo.`,
    };

    let conversacion = []; // Aquí se guardará el historial de la conversación (preguntas y respuestas)

    function inyectarHTML() {
        const chipsHTML = TE_CONFIG.chips //esta constante muestra los chips de sugerencias rápidas
            .map(
                (c) =>
                `<button class="te-chip" data-texto="${c.texto}"><span class="te-chip-emoji">${c.emoji}</span>${c.texto}</button>`,
            )
            .join("");

        const html = `
      <!-- Burbuja de atención que aparece sobre el botón flotante -->
      <div class="te-chat-bubble" id="teBubble">¿Planeas un viaje por Santander? 🌿</div>

      <!-- Botón flotante que abre/cierra el chat -->
      <button class="te-chat-fab" id="teFab" aria-label="Abrir chat con Sue de TourismEasy">
        <!-- Ícono de chat (visible cuando el chat está cerrado) -->
        <svg class="te-fab-open" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 10H6V10h12v2zm0-3H6V7h12v2z"/>
        </svg>
        <!-- Ícono de X (visible cuando el chat está abierto) -->
        <svg class="te-fab-close" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>

      <!-- Panel del chat (oculto por defecto, se abre al hacer clic en el FAB) -->
      <div class="te-chat-panel" id="teChatPanel" role="dialog" aria-label="Chat con Sue de TourismEasy">

        <!-- Encabezado del chat: avatar, nombre e indicador de "en línea" -->
        <div class="te-chat-header">
          <div class="te-avatar">
            <!-- Si la imagen no carga, muestra un emoji como fallback -->
            <img src="${TE_CONFIG.avatarImg}" alt="Sue, asistente de TourismEasy"
                 onerror="this.style.display='none'; this.parentElement.innerHTML='👩🏼&zwj;🦰';">
          </div>
          <div class="te-header-info">
            <strong>${TE_CONFIG.nombre} </strong>
            <span>Asistente de viajes inclusivos · Santander</span>
          </div>
          <div class="te-online-indicator">
            <div class="te-online-dot"></div>
            <span class="te-online-label">En línea</span>
          </div>
          <!-- Botón X para cerrar el chat en móvil (solo visible en pantallas pequeñas) -->
          <button class="te-close-mobile" id="teCloseMobile" aria-label="Cerrar chat">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <!-- Área donde aparecen los mensajes de la conversación -->
        <div class="te-chat-messages" id="teMensajes"></div>

        <!-- Chips de sugerencias rápidas (se ocultan tras el primer mensaje) -->
        <div class="te-chips" id="teChips">${chipsHTML}</div>

        <!-- Área de entrada de texto -->
        <div class="te-chat-input-area">
          <textarea
            class="te-chat-input"
            id="teInput"
            placeholder="Pregúntame sobre tu viaje…"
            rows="1"
          ></textarea>
          <!-- Botón de enviar (ícono de avión de papel) -->
          <button class="te-chat-send" id="teSend" aria-label="Enviar mensaje">
            <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>

        <div class="te-chat-footer">Potenciado por <span>IA · TourismEasy</span></div>
      </div>
    `;

        const wrapper = document.createElement("div"); //div para  inyectar el html del chat en el body
        wrapper.innerHTML = html;
        document.body.appendChild(wrapper);
    }

    function agregarMensaje(texto, tipo) {
        const container = document.getElementById("teMensajes"); //este contenedor es donde se muestran los mensajes del chat
        const msg = document.createElement("div");
        msg.className = `te-msg ${tipo}`;

        // Soporte básico de Markdown
        // **texto** → <strong>texto</strong> (negritas)
        // \n        → <br> (saltos de línea)
        msg.innerHTML = texto
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\n/g, "<br>");

        container.appendChild(msg);
        container.scrollTop = container.scrollHeight; // Hacemos scroll al último mensaje
        return msg;
    }

    // ── Muestra el indicador de "escribiendo..." (tres puntos animados) ──
    function mostrarTyping() {
        const container = document.getElementById("teMensajes");
        const typing = document.createElement("div");
        typing.className = "te-typing";
        typing.id = "teTyping";
        typing.innerHTML = "<span></span><span></span><span></span>"; // Los tres puntitos se animan con CSS
        container.appendChild(typing);
        container.scrollTop = container.scrollHeight;
    }


    function ocultarTyping() { // Oculta el indicador de "escribiendo..." y despues lo elimina del DOM
        const t = document.getElementById("teTyping");
        if (t) t.remove();
    }

    function normalizarTexto(texto) {
        return texto
            .toLowerCase()
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .replace(/[?.!¡¿\n]/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    const INTENCIONES = [
        {
            nombre: "transporte",
            patrones: [
                /\btransporte\b/, /\bterminal\b/, /\bbus\b/, /\bautobus\b/, /\bruta\b/, /\bmicro\b/, /\bboleto\b/, /\bviajar\b/, /\bllegar\b/, /\bsalida\b/, /\bmovi/,
            ],
            responder: (texto) => {
                const accesible = /\b(silla de ruedas|adaptad|accesibilidad|discapacidad|movilidad reducida|guia|auxiliar)\b/.test(texto);
                const base =
                    "En Santander tienes transporte intermunicipal desde la Terminal de Bucaramanga hacia San Gil, Barichara, Socorro, Giron y otros destinos. " +
                    "Puedes ver rutas y horarios en la sección de transporte de TourismEasy.";
                return accesible
                    ? base +
                          " Además, hay servicios con vehículos adaptados, acompañamiento para personas con movilidad reducida y ayuda de guías certificados." 
                    : base;
            },
        },
        {
            nombre: "hospedaje",
            patrones: [
                /\bhospedaje\b/, /\bhotel\b/, /\balojamiento\b/, /\bposada\b/, /\bhostal\b/, /\bhabitacion\b/, /\bcama\b/, /\breserva\b/, /\breservo\b/, /\breservar\b/, /\bquedarse\b/
            ],
            responder: (texto) => {
                const accesible = /\b(silla de ruedas|adaptad|accesibilidad|discapacidad|banos adaptad|baños adaptad|baño adaptad|baranda)\b/.test(texto);
                let respuesta =
                    "En TourismEasy encuentras hospedajes accesibles con rampas, baños adaptados y opciones inclusivas en Santander. " +
                    "Para elegir uno, entra a la sección de hospedaje y filtra por accesibilidad.";
                if (texto.includes("reservar") || texto.includes("reserva")) {
                    respuesta +=
                        " Para reservar, selecciona el hospedaje que te guste, elige fechas y completa el formulario en la misma página.";
                }
                if (accesible) {
                    respuesta +=
                        " También puedes pedir alojamiento con accesos amplios, camas especiales y asistencia en llegada y salida.";
                }
                return respuesta;
            },
        },
        {
            nombre: "destinos",
            patrones: [
                /\bdestino\b/, /\bdestinos\b/, /\bbarichara\b/, /\bca[nn]on\b/, /\bcanyon\b/, /\bsan gil\b/, /\bbucaramanga\b/, /\bsantander\b/, /\bgiron\b/, /\bvelez\b/, /\blos santos\b/, /\bsocorro\b/, /\bparque\b/, /\bmirador\b/, /\bplan\b/, /\bruta\b/
            ],
            responder: (texto) => {
                const escucha = /\b(visual|audio|audiencia|sonido|guia auditiva)\b/.test(texto);
                let respuesta =
                    "Santander ofrece destinos muy variados: Barichara para turismo colonial, San Gil para aventura adaptada y el Cañon del Chicamocha para vistas impresionantes y accesibles. " +
                    "También puedes visitar Giron, Socorro, Velez y lugares rurales con experiencias culturales inclusivas.";
                if (escucha) {
                    respuesta +=
                        " Si necesitas apoyo visual o una experiencia más sensible, pregunta por guías con audiodescripción y servicios para personas con discapacidad visual.";
                }
                return respuesta;
            },
        },
        {
            nombre: "planes",
            patrones: [
                /\bplan(es)?\b/, /\btour\b/, /\bactividad\b/, /\bpaquete\b/, /\bexcursion\b/, /\bexperiencia\b/, /\badventure\b/
            ],
            responder: (texto) => {
                const inclusivo = /\b(accesible|discapacidad|inclusivo|inclusiva|silla de ruedas|visual|auditiva)\b/.test(texto);
                return (
                    "TourismEasy tiene planes turísticos inclusivos con guías especializados y actividades adaptadas para distintos perfiles. " +
                    (inclusivo
                        ? "Puedes escoger experiencias con rutas suaves, apoyo para movilidad y actividades culturales accesibles. "
                        : "Encuentra planes para aventura, cultura y descanso según lo que quieras hacer.") +
                    " Si quieres, dime qué tipo de experiencia buscas y te orientaré mejor."
                );
            },
        },
        {
            nombre: "auxiliar",
            patrones: [
                /\b(auxiliar|asistente|guia|guia)\b/, /\bpersonal\b/, /\bacompañante\b/, /\bayuda\b/, /\bsoporte\b/, /\bapoyo\b/
            ],
            responder: (texto) => {
                const tipo = /\b(motriz|visual|auditiva|discapacidad|silla de ruedas)\b/.test(texto);
                return (
                    "En la plataforma puedes solicitar personal auxiliar y guías certificados para acompañarte en el viaje, transporte, hospedaje y actividades. " +
                    (tipo
                        ? "Hay apoyos específicos para discapacidad motriz, visual y auditiva, con atención personalizada y mayor seguridad."
                        : "Estas personas ayudan a que tu recorrido sea más cómodo y seguro.")
                );
            },
        },
        {
            nombre: "accesibilidad",
            patrones: [
                /\baccesibilidad\b/, /\binclusivo\b/, /\binclusiva\b/, /\bdiscapacidad\b/, /\bsilla de ruedas\b/, /\bauditiva\b/, /\bvisual\b/, /\badaptad\b/
            ],
            responder: (texto) => {
                const tipo = /\b(visual|auditiva|motric|rueda|silla de ruedas|motriz)\b/.exec(texto);
                const detalle = tipo ? `Para ${tipo[0]},` : "En general,";
                return (
                    `${detalle} TourismEasy ofrece servicios accesibles en transporte, hospedaje y experiencias. ` +
                    "Puedes buscar alojamiento con baños adaptados, transporte con rampas y guías que ayudan a las personas con discapacidad visual o auditiva. " +
                    "Si quieres, dime tu necesidad y te diré qué opciones son mejores para ti."
                );
            },
        },
        {
            nombre: "precios",
            patrones: [
                /\bprecio\b/, /\bcosto\b/, /\btarifa\b/, /\bvalor\b/, /\bcuesta\b/, /\bpresupuesto\b/, /\bprecio exacto\b/
            ],
            responder: () =>
                "No manejo precios exactos porque varían según la temporada y el servicio. " +
                "En TourismEasy, cada servicio muestra su tarifa actualizada; si necesitas, recomiendo contactar al proveedor o revisar la página del servicio para obtener el valor más preciso.",
        },
        {
            nombre: "horarios",
            patrones: [
                /\bhorario\b/, /\bhorarios\b/, /\ba que hora\b/, /\bcual es el horario\b/, /\bcuando sale\b/, /\bllega\b/, /\bpartida\b/, /\bsale\b/
            ],
            responder: () =>
                "Los horarios dependen del servicio y la ruta. " +
                "Para conocer salidas y llegadas exactas, revisa la sección de transporte o el detalle del plan en la plataforma. " +
                "Si me dices qué ruta quieres, puedo orientarte mejor.",
        },
        {
            nombre: "contacto",
            patrones: [
                /\bcontacto\b/, /\btelefono\b/, /\bwhatsapp\b/, /\bemail\b/, /\bcorreo\b/, /\bcontactar\b/, /\bconsigo\b/, /\bcontactar\b/
            ],
            responder: () =>
                "Para contacto directo, usa el formulario o el botón de contacto en la plataforma. " +
                "Si buscas atención rápida, también puedes revisar la información de la empresa o proveedor del servicio que te interesa.",
        },
        {
            nombre: "reserva",
            patrones: [
                /\breserva\b/, /\breservar\b/, /\bcomprar\b/, /\bquedarse\b/, /\bticket\b/, /\bpasaje\b/, /\bconfirmar\b/, /\bsolicitar\b/
            ],
            responder: () =>
                "Para reservar, selecciona el servicio que deseas (transporte, hospedaje o plan), elige la fecha y completa el formulario. " +
                "Si necesitas, dime qué quieres reservar y te guiaré paso a paso." ,
        },
        {
            nombre: "seguridad",
            patrones: [
                /\bseguridad\b/, /\bseguros\b/, /\bprotocolo\b/, /\bcovid\b/, /\bnormas\b/, /\bseguro\b/
            ],
            responder: () =>
                "TourismEasy promueve viajes seguros y accesibles. " +
                "Si tienes dudas sobre protocolos o requisitos especiales, revisa la información del servicio o escríbeme qué tipo de viaje planeas y te orientaré según tus necesidades.",
        },
        {
            nombre: "clima",
            patrones: [
                /\bclima\b/, /\btiempo\b/, /\btemperatura\b/, /\blluvia\b/, /\bestacion\b/
            ],
            responder: () =>
                "El clima en Santander puede variar entre días soleados y lluvias ligeras, especialmente en la región de San Gil y el Cañon del Chicamocha. " +
                "Te recomiendo revisar el pronóstico local antes de viajar y llevar ropa cómoda y adaptable.",
        },
    ];

    function obtenerPuntajeDeIntencion(intencion, texto) {
        return intencion.patrones.reduce((puntaje, patron) => {
            if (typeof patron === "string") {
                return texto.includes(patron) ? puntaje + 1 : puntaje;
            }
            return patron.test(texto) ? puntaje + 1 : puntaje;
        }, 0);
    }

    function detectarIntenciones(texto) {
        return INTENCIONES
            .map((intencion) => ({
                intencion,
                score: obtenerPuntajeDeIntencion(intencion, texto),
            }))
            .filter((item) => item.score > 0)
            .sort((a, b) => b.score - a.score);
    }

    function buscarRespuestaLocal(mensajeUsuario) {
        const texto = normalizarTexto(mensajeUsuario);

        if (!texto) {
            return "Escribe tu pregunta y te ayudaré con información sobre turismo inclusivo en Santander.";
        }

        if (/\b(hola|buenas|buenos dias|buenas tardes|buenas noches|hey|buenas|holi)\b/.test(texto)) {
            return "¡Hola! 👋 Soy Sue, tu asistente para viajes inclusivos en Santander. ¿En qué puedo ayudarte hoy?";
        }

        if (/\b(gracias|muchas gracias|perfecto|genial|vale|ok|buenisimo|gracias sue)\b/.test(texto)) {
            return "Con gusto. Si quieres, dime tu siguiente duda sobre transporte, hospedaje, destinos o accesibilidad.";
        }

        const intenciones = detectarIntenciones(texto);
        if (intenciones.length === 0) {
            return (
                "No tengo una respuesta exacta para eso, pero puedo ayudarte con transporte intermunicipal, hospedaje accesible, planes turísticos, personal auxiliar y accesibilidad. " +
                "Si quieres, dime si buscas transporte, hospedaje o un plan inclusivo."
            );
        }

        const mejor = intenciones[0];
        if (mejor.score === 1 && intenciones.length > 1 && intenciones[1].score === 1) {
            return (
                "Parece que tu pregunta puede estar relacionada con más de un tema. " +
                "¿Quieres que te hable primero de transporte, hospedaje o planes turísticos?"
            );
        }

        return mejor.intencion.responder(texto);
    }

    async function llamarClaudeAPI(mensajeUsuario) {
        try {
            const response = await fetch(IA_API_PATH, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    question: mensajeUsuario,
                    context: TE_CONFIG.systemPrompt,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            if (data.success && typeof data.response === "string") {
                return data.response;
            }

            console.warn("[TourismEasy IA] respuesta inesperada:", data);
        } catch (err) {
            console.warn("[TourismEasy IA] fallback local:", err);
        }

        return buscarRespuestaLocal(mensajeUsuario);
    }

    let enviando = false; //no permite enviar mas de un mjs a la vez

    async function enviarMensaje(texto) { //si ya se envio un mjs, no deja hacer nada hasta llegar la respuesta
        if (enviando || !texto.trim()) return;
        enviando = true;

        const chips = document.getElementById("teChips"); //los chips se ocultan tras el primer mjs del viajero
        if (chips) chips.style.display = "none";

        agregarMensaje(texto, "user");
        document.getElementById("teInput").value = "";
        autoResize(document.getElementById("teInput"));
        mostrarTyping();

        try {
            const respuesta = await llamarClaudeAPI(texto); // Esperamos la respuesta de la IA
            ocultarTyping();
            agregarMensaje(respuesta, "bot"); // se muestra la respuesta de Sue en el chat
        } catch (err) {
            ocultarTyping();
            agregarMensaje(
                "Lo siento, tuve un inconveniente conectándome. ¿Puedes intentarlo de nuevo? 🙏",
                "bot",
            );
            console.error("[TourismEasy IA]", err);
            conversacion.pop(); // Quitamos el mensaje que falló del historial
        }

        enviando = false;
    }

    // Ajusta la altura del textarea según su contenido
    // Crece al escribir y se reduce al borrar (máximo 100px)
    function autoResize(el) {
        el.style.height = "auto";
        el.style.height = Math.min(el.scrollHeight, 100) + "px";
    }

    function inicializar() {
        inyectarHTML();
        const fab = document.getElementById("teFab"); // el botón flotante para abrir/cerrar el chat
        const panel = document.getElementById("teChatPanel"); //panel del chat
        const input = document.getElementById("teInput"); //para q el usuario escriba su mensaje
        const send = document.getElementById("teSend");
        const bubble = document.getElementById("teBubble");
        const msgs = document.getElementById("teMensajes"); // Contenedor de los mensajes del chat
        const closeBtn = document.getElementById("teCloseMobile"); // Botón X para cerrar en móvil

        agregarMensaje(
            `¡Hola! 👋 Soy **Sue**, tu guía de viajes en **TourismEasy**.\n\nEstoy aquí para ayudarte a explorar los destinos más hermosos y accesibles de Santander, Colombia. Desde el Cañón del Chicamocha hasta las calles coloniales de Barichara. 🌿\n\n¿Sobre qué te puedo ayudar hoy?`,
            "bot",
        );

        // Botón X del header para cerrar en móvil
        if (closeBtn) {
            closeBtn.addEventListener("click", () => {
                panel.classList.remove("open");
                fab.classList.remove("open");
            });
        }

        setTimeout(() => {
            bubble.classList.remove("hidden"); //despues de segundsos se muestra la brubuja de la ia
            setTimeout(
                () => bubble.classList.add("hidden"), //despues de otros segundos se oculta la burbuja
                TE_CONFIG.burbulaAutoClose,
            );
        }, TE_CONFIG.burbujaDelay);

        fab.addEventListener("click", () => {
            const abierto = panel.classList.toggle("open");
            fab.classList.toggle("open", abierto); // cambia el ícono del chat por una X al abrirlo
            bubble.classList.add("hidden"); // ocultar la burbuja al abrir el chat

            if (abierto) {
                setTimeout(() => input.focus(), 300);
                msgs.scrollTop = msgs.scrollHeight; // el scroll se mantiene al último mensaje al abrir el chat
            }
        });

        document.querySelectorAll(".te-chip").forEach((chip) => { //un click en algun chip se envia a la ia
            chip.addEventListener("click", () => {
                const texto = chip.dataset.texto || chip.textContent.trim();
                enviarMensaje(texto);
            });
        });

        send.addEventListener("click", () => enviarMensaje(input.value));

        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey) { // shift+enter para salto de línea, Enter solo para enviar
                e.preventDefault(); // evitamos que el enter agregue una nueva línea
                enviarMensaje(input.value);
            }
        });

        // ── el textarea crece al escribir ──
        input.addEventListener("input", () => autoResize(input));

        // cerrar el chat con la tecla escape
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && panel.classList.contains("open")) {
                panel.classList.remove("open");
                fab.classList.remove("open");
            }
        });
    }


    if (document.readyState === "loading") { //esperamos a que el DOM esté listo para inicializar el chat
        document.addEventListener("DOMContentLoaded", inicializar);
    } else {
        inicializar(); // El DOM ya estaba listo, ejecutamos directamente
    }
})();