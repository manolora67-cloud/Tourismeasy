(function () {
    "use strict";

    const scriptUrl = document.currentScript && document.currentScript.src;
    if (!scriptUrl) {
        console.error("[TourismEasy] No se pudo determinar la ubicación del traductor.");
        return;
    }

    const endpoint = new URL("../api/traducir.php", scriptUrl).href;
    const storageKey = "te-language";
    const cacheStorageKey = "te-translation-cache-mymemory-es-en-v1";
    const languageButtons = document.querySelectorAll("[data-te-language]");
    const textRecords = new WeakMap();
    const attributeRecords = new WeakMap();
    const pendingTranslations = new Map();
    const translationCache = new Map();
    const maxBatchItems = 5;
    const maxBatchBytes = 2000;
    const maxTextCharacters = 10000;
    const maxSegmentBytes = 450;
    const textEncoder = new TextEncoder();
    let batchTimer = null;
    let languageVersion = 0;

    try {
        const savedCache = JSON.parse(localStorage.getItem(cacheStorageKey) || "[]");
        if (Array.isArray(savedCache)) {
            savedCache.slice(-2000).forEach((entry) => {
                if (Array.isArray(entry) && typeof entry[0] === "string" && typeof entry[1] === "string") {
                    translationCache.set(entry[0], entry[1]);
                }
            });
        }
    } catch (error) {
        console.warn("[TourismEasy] No se pudo leer la caché local de traducciones.", error);
    }

    function getRecord(records, element, key) {
        let record = records.get(element);
        if (!record) {
            record = new Map();
            records.set(element, record);
        }
        return record.get(key);
    }

    function setRecord(records, element, key, value) {
        let record = records.get(element);
        if (!record) {
            record = new Map();
            records.set(element, record);
        }
        record.set(key, value);
    }

    function saveTranslationCache() {
        try {
            localStorage.setItem(
                cacheStorageKey,
                JSON.stringify(Array.from(translationCache.entries()).slice(-2000))
            );
        } catch (error) {
            console.warn("[TourismEasy] No se pudo guardar la caché local de traducciones.", error);
        }
    }

    function splitText(text) {
        const words = text.match(/\S+\s*/gu) || [text];
        const segments = [];
        let current = "";

        words.forEach((word) => {
            if (textEncoder.encode(word).length <= maxSegmentBytes) {
                if (current && textEncoder.encode(current + word).length > maxSegmentBytes) {
                    segments.push(current);
                    current = "";
                }
                current += word;
                return;
            }

            if (current) {
                segments.push(current);
                current = "";
            }

            let fragment = "";
            for (const character of word) {
                if (fragment && textEncoder.encode(fragment + character).length > maxSegmentBytes) {
                    segments.push(fragment);
                    fragment = "";
                }
                fragment += character;
            }
            if (fragment) current = fragment;
        });

        if (current) segments.push(current);
        return segments;
    }

    function queueTextTranslation(text, callback) {
        const segments = splitText(text);
        if (segments.length === 0) {
            callback("");
            return;
        }

        const translatedSegments = new Array(segments.length);
        let completedSegments = 0;
        segments.forEach((segment, index) => {
            queueTranslation(segment, (translated) => {
                translatedSegments[index] = translated;
                completedSegments += 1;
                if (completedSegments === segments.length) callback(translatedSegments.join(""));
            });
        });
    }

    function showTranslationError(error) {
        console.error("[TourismEasy] No se pudo traducir el contenido.", error);
        const status = document.querySelector(".te-accessibility-status");
        if (status) {
            status.textContent = error instanceof Error
                ? error.message
                : "No se pudo traducir el contenido. Inténtalo de nuevo más tarde.";
        }
    }

    function scheduleBatch() {
        if (batchTimer !== null) return;
        batchTimer = window.setTimeout(() => {
            batchTimer = null;
            flushTranslations();
        }, 100);
    }

    function queueTranslation(text, callback) {
        if (translationCache.has(text)) {
            callback(translationCache.get(text));
            return;
        }

        const callbacks = pendingTranslations.get(text) || [];
        callbacks.push(callback);
        pendingTranslations.set(text, callbacks);
        scheduleBatch();
    }

    async function flushTranslations() {
        const entries = Array.from(pendingTranslations.entries());
        pendingTranslations.clear();

        while (entries.length > 0) {
            const batch = [];
            let byteCount = 0;
            while (entries.length > 0 && batch.length < maxBatchItems) {
                const next = entries[0];
                const nextBytes = textEncoder.encode(next[0]).length;
                if (batch.length > 0 && byteCount + nextBytes > maxBatchBytes) break;
                entries.shift();
                batch.push(next);
                byteCount += nextBytes;
            }

            try {
                const response = await fetch(endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ texts: batch.map(([text]) => text) }),
                });
                const result = await response.json();
                if (!response.ok || !Array.isArray(result.translations)
                    || result.translations.length !== batch.length
                    || !result.translations.every((text) => typeof text === "string")) {
                    const error = new Error(result.error || "Respuesta inválida del servicio de traducción.");
                    error.status = response.status;
                    throw error;
                }

                batch.forEach(([text, callbacks], index) => {
                    const translated = result.translations[index];
                    if (translationCache.size >= 2000 && !translationCache.has(text)) {
                        translationCache.delete(translationCache.keys().next().value);
                    }
                    translationCache.set(text, translated);
                    callbacks.forEach((callback) => callback(translated));
                });
                saveTranslationCache();
            } catch (error) {
                showTranslationError(error);
                pendingTranslations.clear();
                break;
            }
        }

        if (pendingTranslations.size > 0) scheduleBatch();
    }

    function isTranslatable(element) {
        return !element.closest(
            "script, style, noscript, [data-no-translate], [hidden], [aria-hidden='true'], [inert]"
        );
    }

    function updateTextNode(node, language, version) {
        const raw = node.nodeValue;
        if (!raw || !raw.trim()) return;

        const record = getRecord(textRecords, node, "text");
        const source = record && raw === record.output ? record.source : raw;
        if (language === "es") {
            if (record && raw === record.output) node.nodeValue = record.source;
            return;
        }
        if (record && raw === record.output) return;

        const text = source.trim();
        if (!text || text.length > maxTextCharacters || !/[A-Za-zÀ-ÖØ-öø-ÿ]/.test(text)) return;
        const leading = source.match(/^\s*/)[0];
        const trailing = source.match(/\s*$/)[0];

        queueTextTranslation(text, (translated) => {
            if (version !== languageVersion || document.documentElement.lang !== "en"
                || !node.isConnected || node.nodeValue !== source) return;
            const output = leading + translated + trailing;
            setRecord(textRecords, node, "text", { source, output });
            if (node.nodeValue !== output) node.nodeValue = output;
        });
    }

    function updateAttribute(element, attribute, language, version) {
        if (!isTranslatable(element)) return;
        const raw = element.getAttribute(attribute);
        if (!raw) return;

        const record = getRecord(attributeRecords, element, attribute);
        const source = record && raw === record.output ? record.source : raw;
        if (language === "es") {
            if (record && raw === record.output) element.setAttribute(attribute, record.source);
            return;
        }
        if (record && raw === record.output) return;

        const text = source.trim();
        if (!text || text.length > maxTextCharacters || !/[A-Za-zÀ-ÖØ-öø-ÿ]/.test(text)) return;
        const leading = source.match(/^\s*/)[0];
        const trailing = source.match(/\s*$/)[0];

        queueTextTranslation(text, (translated) => {
            if (version !== languageVersion || document.documentElement.lang !== "en"
                || !element.isConnected || element.getAttribute(attribute) !== source) return;
            const output = leading + translated + trailing;
            setRecord(attributeRecords, element, attribute, { source, output });
            if (element.getAttribute(attribute) !== output) element.setAttribute(attribute, output);
        });
    }

    function translateElement(element, language, version) {
        if (element.nodeType === Node.TEXT_NODE) {
            if (isTranslatable(element.parentElement)) updateTextNode(element, language, version);
            return;
        }
        if (element.nodeType !== Node.ELEMENT_NODE || !isTranslatable(element)) return;

        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        let textNode;
        while ((textNode = walker.nextNode())) updateTextNode(textNode, language, version);

        const elements = [element, ...element.querySelectorAll("*")];
        elements.forEach((child) => {
            ["aria-label", "placeholder", "title", "alt"].forEach((attribute) => {
                updateAttribute(child, attribute, language, version);
            });
        });
    }

    function applyLanguage(language) {
        const selectedLanguage = language === "en" ? "en" : "es";
        languageVersion += 1;
        document.documentElement.lang = selectedLanguage;
        translateElement(document.body, selectedLanguage, languageVersion);
        languageButtons.forEach((button) => {
            button.setAttribute("aria-pressed", String(button.dataset.teLanguage === selectedLanguage));
        });
        try {
            localStorage.setItem(storageKey, selectedLanguage);
        } catch (error) {
            console.warn("[TourismEasy] No se pudo guardar el idioma seleccionado.", error);
        }
    }

    languageButtons.forEach((button) => {
        button.addEventListener("click", () => applyLanguage(button.dataset.teLanguage));
    });

    const observer = new MutationObserver((mutations) => {
        const language = document.documentElement.lang === "en" ? "en" : "es";
        const version = languageVersion;
        mutations.forEach((mutation) => {
            if (mutation.type === "characterData") {
                updateTextNode(mutation.target, language, version);
                return;
            }
            if (mutation.type === "attributes") {
                if (mutation.attributeName === "hidden") {
                    if (!mutation.target.hasAttribute("hidden")) {
                        translateElement(mutation.target, language, version);
                    }
                    return;
                }
                updateAttribute(mutation.target, mutation.attributeName, language, version);
                return;
            }
            mutation.addedNodes.forEach((node) => translateElement(node, language, version));
        });
    });
    observer.observe(document.body, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: ["aria-label", "placeholder", "title", "alt", "hidden"],
    });

    let initialLanguage = "es";
    try {
        initialLanguage = localStorage.getItem(storageKey) === "en" ? "en" : "es";
    } catch (error) {
        console.warn("[TourismEasy] No se pudo leer el idioma guardado.", error);
    }
    applyLanguage(initialLanguage);
})();
