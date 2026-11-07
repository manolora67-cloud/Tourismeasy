(function () {
    "use strict";

    if (document.querySelector("[data-te-accessibility]")) return;

    const scriptUrl = document.currentScript && document.currentScript.src;
    if (!scriptUrl) {
        console.error("[TourismEasy] No se pudo determinar la ubicación del menú de accesibilidad.");
        return;
    }

    const style = document.createElement("link");
    style.rel = "stylesheet";
    style.href = new URL("menu.css?v=a11y-v15", scriptUrl).href;
    document.head.appendChild(style);

    const minScale = 80;
    const maxScale = 150;
    const step = 10;
    const defaultScale = 100;
    const storageKey = "te-accessibility-font-scale";
    const contrastStorageKey = "te-accessibility-high-contrast";
    const hoverReaderStorageKey = "te-accessibility-hover-reading";
    let scale = defaultScale;
    let highContrast = false;

    try {
        const savedScale = Number(localStorage.getItem(storageKey));
        if (Number.isFinite(savedScale) && savedScale >= minScale && savedScale <= maxScale) {
            scale = savedScale;
        }
    } catch (error) {
        console.warn("[TourismEasy] No se pudo leer el tamaño de texto guardado.", error);
    }

    try {
        highContrast = localStorage.getItem(contrastStorageKey) === "true";
    } catch (error) {
        console.warn("[TourismEasy] No se pudo leer la preferencia de contraste guardada.", error);
    }

    const root = document.createElement("div");
    root.className = "te-accessibility";
    root.dataset.teAccessibility = "";
    root.innerHTML = `
        <button class="te-accessibility-toggle" type="button" aria-label="Abrir menú de accesibilidad" title="Accesibilidad" aria-expanded="false" aria-controls="te-accessibility-panel">
            <span aria-hidden="true">♿</span>
        </button>
        <section class="te-accessibility-panel" id="te-accessibility-panel" aria-labelledby="te-accessibility-title" hidden>
            <div class="te-accessibility-heading">
                <h2 id="te-accessibility-title">Accesibilidad</h2>
                <button class="te-accessibility-close" type="button" aria-label="Cerrar menú de accesibilidad">×</button>
            </div>
            <div class="te-accessibility-language" role="group" aria-label="Idioma de la página">
                <span>Idioma</span>
                <div>
                    <button type="button" data-te-language="es" aria-pressed="true">Español</button>
                    <button type="button" data-te-language="en" aria-pressed="false">English</button>
                </div>
            </div>
            <div class="te-accessibility-size" role="group" aria-labelledby="te-accessibility-size-label">
                <span id="te-accessibility-size-label">Tamaño del texto</span>
                <div class="te-accessibility-size-controls">
                    <button class="te-accessibility-decrease" type="button" aria-label="Disminuir tamaño del texto">A−</button>
                    <output class="te-accessibility-scale" aria-live="polite"></output>
                    <button class="te-accessibility-increase" type="button" aria-label="Aumentar tamaño del texto">A+</button>
                </div>
                <button class="te-accessibility-reset-size" type="button">Restablecer tamaño</button>
            </div>
            <button class="te-accessibility-contrast" type="button" aria-pressed="false">Aumentar contraste</button>
            <div class="te-accessibility-reader" role="group" aria-label="Lectura en voz alta">
                <button class="te-accessibility-hover-read" type="button" aria-pressed="false">Leer al pasar el cursor</button>
                <div class="te-accessibility-reader-actions">
                    <button class="te-accessibility-read" type="button">Leer página</button>
                    <button class="te-accessibility-stop" type="button" disabled>Detener voz actual</button>
                </div>
            </div>
            <p class="te-accessibility-status" role="status" aria-live="polite"></p>
        </section>
    `;
    document.body.appendChild(root);

    const toggle = root.querySelector(".te-accessibility-toggle");
    const panel = root.querySelector(".te-accessibility-panel");
    const close = root.querySelector(".te-accessibility-close");
    const scaleOutput = root.querySelector(".te-accessibility-scale");
    const resetScaleButton = root.querySelector(".te-accessibility-reset-size");
    const status = root.querySelector(".te-accessibility-status");
    const readButton = root.querySelector(".te-accessibility-read");
    const hoverReadButton = root.querySelector(".te-accessibility-hover-read");
    const stopButton = root.querySelector(".te-accessibility-stop");
    const contrastButton = root.querySelector(".te-accessibility-contrast");
    const speechAvailable = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
    let hoverReading = false;
    let hoverTimer;
    let lastHoverText = "";
    let speechRequestId = 0;
    try {
        hoverReading = speechAvailable && localStorage.getItem(hoverReaderStorageKey) === "true";
    } catch (error) {
        console.warn("[TourismEasy] No se pudo leer el estado del lector al pasar el cursor.", error);
    }

    hoverReadButton.setAttribute("aria-pressed", String(hoverReading));
    hoverReadButton.textContent = hoverReading
        ? "Desactivar lectura al pasar el cursor"
        : "Leer al pasar el cursor";
    document.body.classList.toggle("te-accessibility-high-contrast", highContrast);
    contrastButton.setAttribute("aria-pressed", String(highContrast));
    if (highContrast) contrastButton.textContent = "Desactivar alto contraste";

    function applyScale(nextScale, announce) {
        scale = Math.max(minScale, Math.min(maxScale, nextScale));
        document.documentElement.style.fontSize = scale + "%";
        scaleOutput.textContent = scale + "%";

        try {
            localStorage.setItem(storageKey, String(scale));
        } catch (error) {
            console.warn("[TourismEasy] No se pudo guardar el tamaño de texto.", error);
        }

        if (announce) status.textContent = "Tamaño del texto: " + scale + "%.";
    }

    function setPanelOpen(open, restoreFocus) {
        panel.hidden = !open;
        toggle.setAttribute("aria-expanded", String(open));
        if (open) close.focus();
        else if (restoreFocus) toggle.focus();
    }

    function stopReading() {
        window.clearTimeout(hoverTimer);
        speechRequestId += 1;
        if (speechAvailable) window.speechSynthesis.cancel();
        readButton.disabled = false;
        stopButton.disabled = true;
        status.textContent = "Lectura detenida.";
    }

    function formatCurrencyForSpeech(text, language) {
        return text.replace(/\bCOP\s*\$?\s*([\d.,]+)|\$\s*([\d.,]+)/gi, (match, copAmount, dollarAmount) => {
            const amount = (copAmount || dollarAmount).replace(/[.,]/g, "");
            return language === "en"
                ? amount + " Colombian pesos"
                : amount + " pesos colombianos";
        });
    }

    function speakText(text) {
        if (!speechAvailable || !text) return;

        window.speechSynthesis.cancel();
        const requestId = ++speechRequestId;
        const language = document.documentElement.lang === "en" ? "en" : "es";
        const voiceLanguage = language === "en" ? "en-US" : "es-CO";
        const utterance = new SpeechSynthesisUtterance(formatCurrencyForSpeech(text, language));
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find((item) => item.lang.toLowerCase() === voiceLanguage.toLowerCase())
            || voices.find((item) => item.lang.toLowerCase().startsWith(voiceLanguage.slice(0, 2).toLowerCase()))
            || null;
        utterance.voice = voice;
        utterance.lang = voice ? voice.lang : voiceLanguage;
        utterance.onstart = () => {
            if (requestId !== speechRequestId) return;
            readButton.disabled = false;
            stopButton.disabled = false;
            status.textContent = "Leyendo en voz alta.";
        };
        utterance.onend = () => {
            if (requestId !== speechRequestId) return;
            stopButton.disabled = true;
            status.textContent = "Lectura finalizada.";
        };
        utterance.onerror = (event) => {
            if (requestId !== speechRequestId) return;
            stopButton.disabled = true;
            status.textContent = event.error === "canceled"
                ? "Lectura detenida."
                : "No se pudo leer el texto en este dispositivo.";
        };
        window.speechSynthesis.speak(utterance);
    }

    function getHoverText(target) {
        if (!(target instanceof Element) || target.closest("[hidden], [inert], [aria-hidden='true']")) return "";
        const readable = target.closest(
            "h1, h2, h3, h4, h5, h6, p, li, a, button, label, td, th, blockquote, summary, figcaption, dt, dd, legend, [role='button'], [aria-label], input, select, textarea, img"
        ) || target;
        if (root.contains(readable)) {
            return (readable.getAttribute("aria-label") || readable.innerText || readable.textContent || "")
                .replace(/\s+/g, " ")
                .trim();
        }
        if (readable.matches("input, select, textarea")) {
            return (readable.getAttribute("aria-label")
                || readable.labels?.[0]?.innerText
                || readable.getAttribute("placeholder")
                || readable.selectedOptions?.[0]?.text
                || readable.value
                || "").replace(/\s+/g, " ").trim();
        }
        if (readable.matches("img")) return (readable.alt || "").trim();

        const text = String(readable.innerText || readable.textContent || "").replace(/\s+/g, " ").trim();
        if (text.length <= 240) return text;
        const ownText = Array.from(readable.childNodes)
            .filter((node) => node.nodeType === Node.TEXT_NODE)
            .map((node) => node.nodeValue.trim())
            .filter(Boolean)
            .join(" ");
        return ownText.length <= 240 ? ownText : "";
    }

    function getTextToRead() {
        const selection = window.getSelection ? window.getSelection().toString().trim() : "";
        if (selection) return selection;

        const chatPanel = document.getElementById("teChatPanel");
        if (chatPanel && chatPanel.classList.contains("open")) {
            const userLabel = document.documentElement.lang === "en" ? "You: " : "Tú: ";
            const messages = Array.from(chatPanel.querySelectorAll(".te-msg"))
                .map((message) => {
                    const text = String(message.innerText || message.textContent || "")
                        .replace(/\s+/g, " ")
                        .trim()
                        .replace(/[.!?…]+$/u, "");
                    if (!text) return "";
                    return (message.classList.contains("user") ? userLabel : "Sue: ") + text;
                })
                .filter(Boolean);

            if (messages.length) return messages.join(". ");
        }

        const content = document.querySelector("main")
            || document.getElementById("site-content")
            || document.body;
        const copy = content.cloneNode(true);
        copy.querySelectorAll(
            "[data-te-accessibility], script, style, nav, footer, [hidden], [aria-hidden='true'], [inert]"
        ).forEach((element) => element.remove());
        return String(copy.innerText || copy.textContent || "").replace(/\s+/g, " ").trim();
    }

    toggle.addEventListener("click", () => {
        setPanelOpen(panel.hidden);
    });
    close.addEventListener("click", () => setPanelOpen(false, true));
    root.querySelector(".te-accessibility-decrease").addEventListener("click", () => {
        applyScale(scale - step, true);
    });
    root.querySelector(".te-accessibility-increase").addEventListener("click", () => {
        applyScale(scale + step, true);
    });
    resetScaleButton.addEventListener("click", () => {
        applyScale(defaultScale, true);
    });
    contrastButton.addEventListener("click", () => {
        const enabled = contrastButton.getAttribute("aria-pressed") !== "true";
        document.body.classList.toggle("te-accessibility-high-contrast", enabled);
        contrastButton.setAttribute("aria-pressed", String(enabled));
        contrastButton.textContent = enabled ? "Desactivar alto contraste" : "Aumentar contraste";
        try {
            localStorage.setItem(contrastStorageKey, String(enabled));
        } catch (error) {
            console.warn("[TourismEasy] No se pudo guardar la preferencia de contraste.", error);
        }
        status.textContent = enabled ? "Contraste aumentado." : "Contraste normal.";
    });

    if (speechAvailable) {
        readButton.addEventListener("click", () => {
            const text = getTextToRead();
            if (!text) {
                status.textContent = "No se encontró texto para leer.";
                return;
            }

            speakText(text);
        });
        hoverReadButton.addEventListener("click", () => {
            hoverReading = !hoverReading;
            hoverReadButton.setAttribute("aria-pressed", String(hoverReading));
            hoverReadButton.textContent = hoverReading
                ? "Desactivar lectura al pasar el cursor"
                : "Leer al pasar el cursor";
            lastHoverText = "";
            try {
                localStorage.setItem(hoverReaderStorageKey, String(hoverReading));
            } catch (error) {
                console.warn("[TourismEasy] No se pudo guardar el estado del lector al pasar el cursor.", error);
            }
            if (!hoverReading) {
                stopReading();
                return;
            }
            status.textContent = "Pasa el cursor o enfoca un texto para escucharlo.";
        });
        document.addEventListener("pointerover", (event) => {
            if (!hoverReading) return;
            const text = getHoverText(event.target);
            if (!text || text === lastHoverText) return;
            lastHoverText = text;
            window.clearTimeout(hoverTimer);
            hoverTimer = window.setTimeout(() => speakText(text), 350);
        });
        document.addEventListener("pointerout", (event) => {
            if (!hoverReading || !(event.target instanceof Element)) return;
            const readable = event.target.closest(
                "h1, h2, h3, h4, p, li, a, button, label, td, th, blockquote, span, output, .welcome-eyebrow, .welcome-description"
            );
            if (readable && !readable.contains(event.relatedTarget)) lastHoverText = "";
        });
        document.addEventListener("focusin", (event) => {
            if (!hoverReading) return;
            const text = getHoverText(event.target);
            if (text) speakText(text);
        });
        stopButton.addEventListener("click", stopReading);
    } else {
        readButton.disabled = true;
        hoverReadButton.disabled = true;
        status.textContent = "La lectura en voz alta no está disponible en este navegador.";
    }

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !panel.hidden) setPanelOpen(false, true);
    });
    document.addEventListener("click", (event) => {
        if (!panel.hidden && !root.contains(event.target)) setPanelOpen(false);
    });

    const translatorScript = document.createElement("script");
    translatorScript.src = new URL("../translate/traductor.js?v=i18n-v20", scriptUrl).href;
    translatorScript.onerror = () => {
        console.error("[TourismEasy] No se pudo cargar el traductor del sitio.");
    };
    document.body.appendChild(translatorScript);

    applyScale(scale, false);
})();
