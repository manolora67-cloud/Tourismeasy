(function () {
    "use strict";

    const translations = {
        "Accesibilidad": "Accessibility",
        "Idioma": "Language",
        "Idioma de la página": "Page language",
        "Tamaño del texto": "Text size",
        "Disminuir tamaño del texto": "Decrease text size",
        "Aumentar tamaño del texto": "Increase text size",
        "Aumentar contraste": "Increase contrast",
        "Leer página": "Read page",
        "Leer al pasar el cursor": "Read on hover",
        "Desactivar lectura al pasar el cursor": "Turn off hover reading",
        "Detener voz actual": "Stop current speech",
        "Desactivar alto contraste": "Turn off high contrast",
        "Abrir asistente turístico Sue": "Open Sue, your tourism assistant",
        "Lectura en voz alta": "Read aloud",
        "Pasa el cursor o enfoca un texto para escucharlo.": "Hover over or focus text to hear it.",
        "No se pudo leer el texto en este dispositivo.": "This device could not read the text aloud.",
        "Cerrar menú de accesibilidad": "Close accessibility menu",
        "La lectura en voz alta no está disponible en este navegador.": "Read-aloud is not available in this browser.",
        "No se encontró texto para leer.": "No text was found to read.",
        "Lectura detenida.": "Reading stopped.",
        "Leyendo en voz alta.": "Reading aloud.",
        "Lectura finalizada.": "Reading finished.",
        "Contraste aumentado.": "Contrast increased.",
        "Contraste normal.": "Normal contrast.",
        "Transporte": "Transportation",
        "Hospedaje": "Accommodation",
        "Planes Turísticos": "Tour Packages",
        "E-Commerce": "Shop",
        "Acceso artesanos": "Artisan sign in",
        "Turismo inclusivo · Santander, Colombia": "Inclusive tourism · Santander, Colombia",
        "¡Hola, bienvenido a TourismEasy!": "Hello, welcome to TourismEasy!",
        "Explora Santander a tu ritmo. Descubre destinos, experiencias y servicios turísticos accesibles para todos.": "Explore Santander at your own pace. Discover destinations, experiences, and accessible tourism services for everyone.",
        "Comenzar a explorar": "Start exploring",
        "Un destino para todos": "A destination for everyone",
        "Activar sonido": "Turn sound on",
        "Turismo Inclusivo,": "Inclusive Tourism,",
        "Ojos, Oídos y": "Eyes, Ears, and",
        "Pasos Libres": "Open Paths",
        "La plataforma que conecta a las empresas turísticas de Santander con viajeros que necesitan experiencias accesibles e inclusivas.": "The platform connecting tourism businesses in Santander with travelers seeking accessible and inclusive experiences.",
        "Explorar destinos": "Explore destinations",
        "Lo que dicen nuestros viajeros": "What our travelers say",
        "Miles de viajeros han confiado en TourismEasy para vivir experiencias únicas e inclusivas.": "Thousands of travelers have trusted TourismEasy for unique and inclusive experiences.",
        "Deja tu reseña": "Leave a review",
        "Tu nombre": "Your name",
        "¿Cómo te llamas?": "What is your name?",
        "Publica tu reseña con tu nombre. No necesitas crear una cuenta.": "Post your review with your name. No account is needed.",
        "Cuéntanos tu experiencia con TourismEasy...": "Tell us about your experience with TourismEasy...",
        "Publicar reseña": "Post review",
        "¡Gracias por tu reseña,": "Thank you for your review,",
        "Tu opinión ya aparece en el carrusel.": "Your review now appears in the carousel.",
        "Transporte Disponible": "Available Transportation",
        "Encuentra las mejores rutas terrestres para moverte por Santander.": "Find the best ground routes to get around Santander.",
        "Origen": "Origin",
        "Cualquier origen": "Any origin",
        "Destino": "Destination",
        "Cualquier destino": "Any destination",
        "Fecha": "Date",
        "Clase de servicio": "Service class",
        "Todas las clases": "All classes",
        "Buscar Transporte": "Search transportation",
        "Limpiar filtros": "Clear filters",
        "No encontramos rutas": "No routes found",
        "No hay transporte disponible para la ruta seleccionada. Intenta con otro origen o destino.": "No transportation is available for this route. Try a different origin or destination.",
        "Ver todo el transporte": "View all transportation",
        "Página anterior": "Previous page",
        "Página siguiente": "Next page",
        "Anterior": "Previous",
        "Siguiente": "Next",
        "Cerrar": "Close",
        "Reserva de Hospedaje": "Book accommodation",
        "Hoteles y residencias con accesibilidad garantizada.": "Hotels and residences with accessibility features.",
        "Todos los destinos publicados": "All listed destinations",
        "Todas las opciones publicadas": "All listed options",
        "Adultos": "Adults",
        "Niños": "Children",
        "La capacidad debe cubrir el total de adultos y niños.": "Capacity must cover the total number of adults and children.",
        "Buscar Hotel": "Search accommodation",
        "Los resultados se filtran con datos publicados: municipio, accesibilidad y capacidad.": "Results are filtered using published data: destination, accessibility, and capacity.",
        "Intenta con otro municipio.": "Try a different destination.",
        "Categoría": "Category",
        "Tipo": "Type",
        "Ubicación": "Location",
        "Duración": "Duration",
        "Incluye": "Includes",
        "Capacidad": "Capacity",
        "Servicios": "Services",
        "Escribir por WhatsApp": "Message on WhatsApp",
        "Experiencias diseñadas para todos en Santander.": "Experiences designed for everyone in Santander.",
        "Lugar": "Destination",
        "Todos los destinos": "All destinations",
        "Tipo de Plan": "Package type",
        "Todos los tipos": "All types",
        "Explorar Planes": "Explore packages",
        "No encontramos planes con esos filtros. ¡Intenta otra combinación!": "No packages match those filters. Try another combination!",
        "Descubre Santander": "Discover Santander",
        "Explora la riqueza cultural y los productos de nuestros artesanos locales.": "Explore the cultural heritage and products of our local artisans.",
        "Buscar artesanos, productos o categorías…": "Search artisans, products, or categories…",
        "Municipio": "Town",
        "Todos los municipios": "All towns",
        "Todos": "All",
        "Talleres": "Workshops",
        "Bisutería": "Jewelry",
        "Alfarería": "Pottery",
        "Explorar": "Explore",
        "Destinos artesanales": "Artisan destinations",
        "Nosotros": "About us",
        "Sobre Nosotros": "About Us",
        "Nuestros Artesanos": "Our artisans",
        "Registra tu Taller": "Register your workshop",
        "Información": "Information",
        "Contacto": "Contact",
        "Preguntas Frecuentes": "Frequently Asked Questions",
        "Política de Privacidad": "Privacy policy",
        "Todos los derechos reservados.": "All rights reserved.",
        "Potenciado por IA · TourismEasy": "Powered by AI · TourismEasy",
        "Descubre la riqueza artesanal de Santander y conecta con sus creadores.": "Discover Santander's artisan heritage and connect with its creators.",
        "Ver más info": "More details",
        "Buscar rutas...": "Searching routes...",
        "Buscando rutas...": "Searching routes...",
        "Buscando hospedajes…": "Searching accommodation…",
        "Buscando planes turísticos…": "Searching tour packages…",
        "Buscando productos publicados…": "Loading published products…",
        "No se pudieron cargar los productos. Intenta recargar la página.": "Could not load products. Please reload the page.",
        "No se encontraron productos para los filtros seleccionados.": "No products match the selected filters.",
        "No se encontraron resultados para tu búsqueda.": "No results found for your search.",
        "No se pudo buscar el transporte. Intenta de nuevo.": "Could not search transportation. Please try again.",
        "Error al buscar. Intenta de nuevo.": "Search failed. Please try again.",
        "No se pudieron cargar las rutas. Intenta recargar la página.": "Could not load routes. Please reload the page.",
        "No se pudieron buscar los planes turísticos.": "Could not search tour packages.",
        "Error al buscar planes turísticos.": "Error searching tour packages.",
        "No se pudo buscar hospedajes.": "Could not search accommodation.",
        "Ver detalles": "View details",
        "Consultar": "Contact for price",
        "Sin clase": "No class specified",
        "Tienda": "Shop",
    };

    const textRecords = new WeakMap();
    const attributeRecords = new WeakMap();
    const storageKey = "te-language";
    const languageButtons = document.querySelectorAll("[data-te-language]");
    const translatablePhrases = Object.keys(translations)
        .filter((phrase) => phrase.length >= 4 && phrase.includes(" "))
        .sort((left, right) => right.length - left.length)
        .map((phrase) => phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const phrasePattern = new RegExp(
        "(^|[^A-Za-z0-9À-ÖØ-öø-ÿ])(" + translatablePhrases.join("|") + ")(?=$|[^A-Za-z0-9À-ÖØ-öø-ÿ])",
        "g"
    );

    function translateValue(source, language) {
        if (language === "es") return source;
        const normalizedSource = source.replace(/\s+/g, " ").trim();
        if (Object.prototype.hasOwnProperty.call(translations, normalizedSource)) {
            return translations[normalizedSource];
        }

        let match = source.match(/^Mostrando (\d+)–(\d+) de (\d+) rutas · Página (\d+) de (\d+)$/);
        if (match) return `Showing ${match[1]}–${match[2]} of ${match[3]} routes · Page ${match[4]} of ${match[5]}`;

        match = source.match(/^Mostrando (\d+)–(\d+) de (\d+) hospedajes · Página (\d+) de (\d+)$/);
        if (match) return `Showing ${match[1]}–${match[2]} of ${match[3]} stays · Page ${match[4]} of ${match[5]}`;

        match = source.match(/^Mostrando (\d+)–(\d+) de (\d+) planes · Página (\d+) de (\d+)$/);
        if (match) return `Showing ${match[1]}–${match[2]} of ${match[3]} packages · Page ${match[4]} of ${match[5]}`;

        match = source.match(/^Mostrando (\d+)–(\d+) de (\d+) productos · Página (\d+) de (\d+)$/);
        if (match) return `Showing ${match[1]}–${match[2]} of ${match[3]} products · Page ${match[4]} of ${match[5]}`;

        match = source.match(/^Se encontraron (\d+) rutas?$/);
        if (match) return `${match[1]} ${Number(match[1]) === 1 ? "route" : "routes"} found`;

        match = source.match(/^(\d+) hospedaje coincide\.$/);
        if (match) return `${match[1]} stay matches.`;

        match = source.match(/^(\d+) hospedajes coinciden\.$/);
        if (match) return `${match[1]} stays match.`;

        match = source.match(/^(\d+) hospedaje publicado\.$/);
        if (match) return `${match[1]} stay published.`;

        match = source.match(/^(\d+) hospedajes publicados\.$/);
        if (match) return `${match[1]} stays published.`;

        match = source.match(/^(\d+) (plan publicado|planes publicados)\.$/);
        if (match) return `${match[1]} ${Number(match[1]) === 1 ? "package published." : "packages published."}`;

        match = source.match(/^(\d+) (producto encontrado|productos encontrados)\.$/);
        if (match) return `${match[1]} ${Number(match[1]) === 1 ? "product found." : "products found."}`;

        match = source.match(/^Tamaño del texto: (\d+)%\.$/);
        if (match) return `Text size: ${match[1]}%.`;

        return normalizedSource.replace(phrasePattern, (fullMatch, prefix, phrase) => {
            return prefix + translations[phrase];
        });
    }

    function updateTextNode(node, language) {
        const raw = node.nodeValue;
        if (!raw || !raw.trim()) return;

        const record = textRecords.get(node);
        const source = record && raw === record.output ? record.source : raw.trim();
        const translated = translateValue(source, language);
        const leading = raw.match(/^\s*/)[0];
        const trailing = raw.match(/\s*$/)[0];
        const output = leading + translated + trailing;

        textRecords.set(node, { source, output });
        if (raw !== output) node.nodeValue = output;
    }

    function updateAttribute(element, attribute, language) {
        const raw = element.getAttribute(attribute);
        if (!raw) return;

        let records = attributeRecords.get(element);
        if (!records) {
            records = new Map();
            attributeRecords.set(element, records);
        }
        const record = records.get(attribute);
        const source = record && raw === record.output ? record.source : raw;
        const output = translateValue(source, language);
        records.set(attribute, { source, output });
        if (raw !== output) element.setAttribute(attribute, output);
    }

    function translateElement(element, language) {
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        let textNode;
        while ((textNode = walker.nextNode())) updateTextNode(textNode, language);

        element.querySelectorAll("*").forEach((child) => {
            ["aria-label", "placeholder", "title", "alt"].forEach((attribute) => {
                updateAttribute(child, attribute, language);
            });
        });

        if (element.nodeType === Node.ELEMENT_NODE) {
            ["aria-label", "placeholder", "title", "alt"].forEach((attribute) => {
                updateAttribute(element, attribute, language);
            });
        }
    }

    function applyLanguage(language) {
        const selectedLanguage = language === "en" ? "en" : "es";
        document.documentElement.lang = selectedLanguage;
        translateElement(document.documentElement, selectedLanguage);
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
        mutations.forEach((mutation) => {
            if (mutation.type === "characterData") {
                updateTextNode(mutation.target, language);
                return;
            }
            if (mutation.type === "attributes") {
                updateAttribute(mutation.target, mutation.attributeName, language);
                return;
            }
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.TEXT_NODE) updateTextNode(node, language);
                else if (node.nodeType === Node.ELEMENT_NODE) translateElement(node, language);
            });
        });
    });
    observer.observe(document.body, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: ["aria-label", "placeholder", "title", "alt"],
    });

    let initialLanguage = "es";
    try {
        initialLanguage = localStorage.getItem(storageKey) === "en" ? "en" : "es";
    } catch (error) {
        console.warn("[TourismEasy] No se pudo leer el idioma guardado.", error);
    }
    applyLanguage(initialLanguage);
})();
