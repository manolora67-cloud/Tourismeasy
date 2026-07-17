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
- Si no sabes algo específico de TourismEasy, recomienda al usuario ir a la sección del menú correspondiente.`,
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

    async function llamarClaudeAPI(mensajeUsuario) { //por el momento solo responde eso, pero aqui es donde la api daria las respuestas de la ia
        return "🤖 Lo sentimos, Agente IA en proceso...";
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