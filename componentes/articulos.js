(function() {
    const mount = document.getElementById("site-articulos");
    if (!mount) return;

    const ARTICULOS = [{
            key: "bucaramanga",
            video: "audio-video/bucara.mp4",
            badge: "Popular",
            titulo: "Bucaramanga",
            subtitulo: "La Ciudad Bonita te espera con los brazos abiertos",
            datos: [
                { label: "Altitud", val: "959 m.s.n.m." },
                { label: "Clima", val: "24°C promedio" },
                { label: "Aeropuerto", val: "Palonegro (BGA)" },
                { label: "Mejor época", val: "Dic – Mar" },
            ],
            intro: "Bucaramanga, capital de Santander, es una ciudad vibrante rodeada de montañas, con más de 165 parques y una oferta gastronómica y hotelera en pleno crecimiento. La Ciudad Bonita combina naturaleza, cultura y buena mesa a solo minutos del centro.",
            secciones: [
                { titulo: "🚌 Cómo moverte", texto: "El sistema de transporte Metrolínea conecta los principales puntos de la ciudad con rutas frecuentes. Los taxis del área metropolitana están disponibles 24/7 y también puedes pedirlos por app." },
                { titulo: "🏨 Dónde alojarte", texto: "El Hotel Dann Carlton Bucaramanga y el Hotel Chicamocha son opciones reconocidas en el centro de la ciudad, con buena ubicación para moverte a pie o en transporte público. El Hotel Tamacá ofrece un ambiente más tranquilo, ideal para estadías largas." },
                { titulo: "🌿 Parques y naturaleza", texto: "El Parque Santander y el Parque García Rovira son puntos de encuentro tradicionales en el corazón de la ciudad. El Jardín Botánico Eloy Valenzuela ofrece senderos entre la vegetación nativa de la región, ideal para una tarde tranquila." },
                { titulo: "🍽️ Gastronomía local", texto: "El Mercado del Río y el Restaurante La Carreta son buenas opciones para probar el cabro y la carne oreada, platos típicos santandereanos. El centro histórico reúne varios restaurantes tradicionales a pocas cuadras entre sí." },
                { titulo: "💡 Consejo TourismEasy", texto: "Reserva con anticipación en temporada alta (diciembre a marzo) para asegurar disponibilidad en los hoteles del centro. Bucaramanga es un excelente punto de partida para explorar el resto de Santander." },
            ],
            ctaTexto: "¿Listo para explorar Bucaramanga?",
        },
        {
            key: "sangil",
            video: "audio-video/sangil.mp4",
            badge: "Nuevo",
            titulo: "San Gil",
            subtitulo: "La capital de los deportes extremos de Colombia",
            datos: [
                { label: "Altitud", val: "1.114 m.s.n.m." },
                { label: "Clima", val: "23°C promedio" },
                { label: "Distancia BGA", val: "98 km" },
                { label: "Mejor época", val: "Dic – Feb" },
            ],
            intro: "San Gil es conocida como la capital de los deportes extremos de Colombia. Aquí encuentras rafting, parapente y espeleología entre paisajes de montaña, todo a pocos minutos del casco urbano.",
            secciones: [
                { titulo: "🛶 Rafting en el río Fonce", texto: "La empresa Aventura Colombia ofrece descensos en balsa por el río Fonce, aptos para principiantes y expertos. Los guías están certificados en primeros auxilios y seguridad en agua." },
                { titulo: "🪂 Parapente", texto: "Colombia Paragliding realiza vuelos biplaza sobre el valle del Fonce, con despegue en plataforma y aterrizaje en campo abierto. Una experiencia recomendada para quienes buscan una vista distinta de la región." },
                { titulo: "🌊 Parque Nacional del Chicamocha cercano", texto: "A 30 minutos de San Gil, el Panachi ofrece teleférico y senderos con vistas al cañón, ideal como excursión de medio día." },
                { titulo: "🏡 Hospedaje ecológico", texto: "La Posada del Río ofrece cabañas en medio de la naturaleza. El Hotel Campestre La Colina cuenta con piscina y zonas verdes, perfecto para descansar después de un día de aventura." },
                { titulo: "💡 Consejo TourismEasy", texto: "San Gil tiene calles empedradas en el centro histórico, así que unos buenos zapatos cerrados ayudan bastante. Reserva las actividades de aventura con al menos 48 horas de anticipación." },
            ],
            ctaTexto: "¿Listo para explorar San Gil?",
        },
        {
            key: "barichara",
            video: "audio-video/barichara.mp4",
            badge: "Destacado",
            titulo: "Barichara",
            subtitulo: "El pueblo más lindo de Colombia",
            datos: [
                { label: "Altitud", val: "1.300 m.s.n.m." },
                { label: "Clima", val: "22°C promedio" },
                { label: "Distancia SG", val: "22 km" },
                { label: "Mejor época", val: "Todo el año" },
            ],
            intro: "Barichara, declarado Monumento Nacional, es posiblemente el pueblo más fotografiado de Colombia. Sus calles empedradas de piedra caliza blanca y sus fachadas coloniales enamoran a cualquiera.",
            secciones: [
                { titulo: "🗺️ Recorriendo el pueblo", texto: "Los principales atractivos —la Catedral de la Inmaculada Concepción, el Parque Principal, la Casa de la Cultura y el mirador— están a pocos minutos caminando entre sí." },
                { titulo: "🏛️ Catedral de la Inmaculada Concepción", texto: "Ubicada en la plaza principal, es uno de los edificios religiosos más representativos de la arquitectura colonial santandereana." },
                { titulo: "🥾 Camino Real hacia Guane", texto: "Este sendero histórico de piedra conecta Barichara con el vecino pueblo de Guane en una caminata de cerca de dos horas, con vistas al cañón del río Suárez." },
                { titulo: "🎨 Talleres culturales", texto: "La Escuela Taller de Barichara ofrece talleres de trabajo en piedra y tejeduría, una buena forma de conocer los oficios tradicionales del pueblo." },
                { titulo: "💡 Consejo TourismEasy", texto: "Camina con calzado cómodo por las calles empedradas y aprovecha el atardecer desde el mirador, uno de los mejores momentos del día para fotografiar el pueblo." },
            ],
            ctaTexto: "¿Listo para explorar Barichara?",
        },
        {
            key: "chicamocha",
            video: "audio-video/cañon.mp4",
            badge: "Natural",
            titulo: "Cañón del Chicamocha",
            subtitulo: "Una de las maravillas naturales de Colombia",
            datos: [
                { label: "Altitud", val: "2.000 m profundidad" },
                { label: "Temperatura", val: "18–28°C" },
                { label: "Distancia BGA", val: "56 km" },
                { label: "Horario", val: "9am – 6pm" },
            ],
            intro: "El Cañón del Chicamocha es uno de los paisajes más impresionantes de Sudamérica, con más de 2.000 metros de profundidad. El Parque Nacional del Chicamocha (Panachi) es la puerta de entrada para vivirlo de cerca.",
            secciones: [
                { titulo: "🚡 Teleférico de Panachi", texto: "Con 6.3 km de longitud, es uno de los más largos de América y ofrece vistas panorámicas del cañón durante todo el recorrido." },
                { titulo: "🦅 Senderos y miradores", texto: "El Sendero de los Ancestros recorre 1.2 km con varios puntos de interés en el camino. El mirador principal ofrece una de las mejores vistas del cañón." },
                { titulo: "🦁 Zona de fauna", texto: "El área de fauna silvestre del parque reúne distintas especies de la región, incluyendo un show de aves rapaces con horarios programados." },
                { titulo: "🎢 Zona de entretenimiento", texto: "El parque cuenta con atracciones como Go-Kart y una piscina de olas, ideales para complementar la visita con toda la familia." },
                { titulo: "💡 Consejo TourismEasy", texto: "Compra las entradas en línea para evitar filas, y llega temprano para aprovechar el día completo, ya que el parque es bastante extenso." },
            ],
            ctaTexto: "¿Listo para explorar el Cañón del Chicamocha?",
        },
        {
            key: "socorro",
            video: "audio-video/socorro.mp4",
            badge: "Histórico",
            titulo: "Socorro",
            subtitulo: "Cuna de la independencia colombiana",
            datos: [
                { label: "Altitud", val: "1.225 m.s.n.m." },
                { label: "Clima", val: "24°C promedio" },
                { label: "Distancia BGA", val: "120 km" },
                { label: "Mejor época", val: "Jun – Ago" },
            ],
            intro: "Socorro, conocida como la Ciudad Cívica de Colombia y cuna de la Revolución Comunera de 1781, es un destino de gran valor histórico y cultural en el corazón de Santander.",
            secciones: [
                { titulo: "🏛️ Museos y casas históricas", texto: "La Casa de la Cultura y el Museo de la Revolución Comunera reúnen piezas y relatos sobre uno de los episodios más importantes de la historia colombiana." },
                { titulo: "⛪ Catedral de Nuestra Señora del Socorro", texto: "La catedral principal del municipio es uno de los puntos de referencia del centro histórico." },
                { titulo: "🌳 Parque Principal", texto: "El Parque Francisco de Paula Santander es el punto de encuentro tradicional de los socorranos, rodeado de casas coloniales." },
                { titulo: "🚌 Transporte intermunicipal", texto: "Las empresas Cotrasangil y Copetrán conectan Socorro con Bucaramanga con salidas frecuentes durante el día." },
                { titulo: "💡 Consejo TourismEasy", texto: "El recorrido histórico oficial dura cerca de 3 horas y cubre los principales sitios del centro. Ideal para combinar con una visita a San Gil, a solo 45 minutos." },
            ],
            ctaTexto: "¿Listo para explorar Socorro?",
        },
        {
            key: "giron",
            video: "audio-video/giron.mp4",
            badge: "Patrimonio",
            titulo: "Girón",
            subtitulo: "Villa de Girón, patrimonio histórico de Santander",
            datos: [
                { label: "Altitud", val: "780 m.s.n.m." },
                { label: "Clima", val: "28°C promedio" },
                { label: "Distancia BGA", val: "9 km" },
                { label: "Mejor época", val: "Todo el año" },
            ],
            intro: "Girón, a solo 9 km de Bucaramanga, es uno de los pueblos coloniales mejor conservados de Colombia. Declarado Monumento Nacional, su arquitectura blanca y sus calles de piedra son inconfundibles.",
            secciones: [
                { titulo: "🌉 Puentes coloniales", texto: "Los puentes sobre el río de Oro son de los símbolos más reconocidos de Girón y un punto infaltable para fotografiar el pueblo." },
                { titulo: "🍽️ Gastronomía local", texto: "El Restaurante La Casona y el Café Colonial son buenas opciones para probar la cocina santandereana en un ambiente colonial." },
                { titulo: "🏘️ Centro histórico", texto: "La Plaza Principal, la Capilla de las Nieves, el Parque de las Madres y el Malecón del Río de Oro se pueden recorrer fácilmente a pie en una tarde." },
                { titulo: "🎭 Cultura y festividades", texto: "La Feria de Girón, en agosto, es uno de los eventos culturales más importantes del municipio, con actividades para toda la familia." },
                { titulo: "💡 Consejo TourismEasy", texto: "Girón se puede combinar perfectamente con Bucaramanga en un solo día. Los buses del sistema Metrolínea llegan hasta el centro del pueblo." },
            ],
            ctaTexto: "¿Listo para explorar Girón?",
        },
        {
            key: "velez",
            video: "audio-video/velez.mp4",
            badge: "Cultural",
            titulo: "Vélez",
            subtitulo: "Tierra de la guabina y el tiple",
            datos: [
                { label: "Altitud", val: "2.130 m.s.n.m." },
                { label: "Clima", val: "17°C promedio" },
                { label: "Distancia BGA", val: "220 km" },
                { label: "Mejor época", val: "Jul – Ago" },
            ],
            intro: "Vélez, en la provincia del mismo nombre, es famosa por sus festivales de música andina colombiana, su gastronomía única y sus paisajes de montaña. Un destino menos conocido pero con mucho por descubrir.",
            secciones: [
                { titulo: "🎵 Festival Nacional de la Guabina", texto: "El festival más importante de Vélez, en julio-agosto, reúne a los mejores exponentes de la música andina colombiana en varios días de actividades culturales." },
                { titulo: "🏨 Dónde alojarte", texto: "El Hotel Zaguán Real y el Hotel Turístico Vélez son las opciones más recomendadas del municipio para hospedarte." },
                { titulo: "🌄 Mirador La Cruz", texto: "El mirador más visitado de Vélez ofrece una de las mejores vistas panorámicas de la región, ideal para el atardecer." },
                { titulo: "🍲 Gastronomía local", texto: "La Fonda Típica El Zaguán y el Restaurante Doña Rosalba son parada obligada para probar el mute santandereano y la pepitoria, platos típicos de la región." },
                { titulo: "💡 Consejo TourismEasy", texto: "Vélez queda a unas 4 horas de Bucaramanga por carretera. La mejor época para visitar coincide con el festival, en julio-agosto." },
            ],
            ctaTexto: "¿Listo para explorar Vélez?",
        },
        {
            key: "lossantos",
            video: "audio-video/lossantos.mp4",
            badge: "Natural",
            titulo: "Los Santos",
            subtitulo: "El mirador del cóndor en Santander",
            datos: [
                { label: "Altitud", val: "1.850 m.s.n.m." },
                { label: "Clima", val: "18°C promedio" },
                { label: "Distancia BGA", val: "62 km" },
                { label: "Mejor época", val: "Dic – Mar" },
            ],
            intro: "Los Santos, enclavado sobre el Cañón del Chicamocha, es uno de los municipios con paisajes más impresionantes de Santander. Conocido por el avistamiento de cóndores y su imponente mesa, es un destino imperdible para los amantes de la naturaleza.",
            secciones: [
                { titulo: "🦅 Avistamiento de cóndores", texto: "El mirador principal del municipio es uno de los mejores lugares de Colombia para observar cóndores en su hábitat natural, especialmente en las horas de la mañana." },
                { titulo: "🌄 Senderos naturales", texto: "Los Santos cuenta con varios senderos cortos, de 500 metros a 1 kilómetro, con vistas privilegiadas al cañón del Chicamocha." },
                { titulo: "🏡 Hospedaje rural", texto: "Varias fincas y posadas del municipio ofrecen alojamiento con terrazas panorámicas hacia el cañón, ideales para desconectarse." },
                { titulo: "🚌 Transporte desde Bucaramanga", texto: "Existen rutas intermunicipales con salida desde el Terminal de Transportes de Bucaramanga con frecuencia diaria." },
                { titulo: "💡 Consejo TourismEasy", texto: "La mejor hora para el avistamiento de cóndores es entre las 7:00 y las 10:00 a.m. Te recomendamos el paquete \"Vuelo del Cóndor\", que incluye transporte, guía especializado y desayuno típico santandereano." },
            ],
            ctaTexto: "¿Listo para explorar Los Santos?",
        },
    ];
    const datoHTML = (d) =>
        `<div class="art-dato"><span class="art-dato-label">${d.label}</span><span class="art-dato-val">${d.val}</span></div>`;

    const seccionHTML = (s) =>
        `<div class="art-seccion">
      <h3 class="art-seccion-titulo">${s.titulo}</h3>
      <p>${s.texto}</p>
    </div>`;

    const overlayHTML = (a) => `
    <div class="art-overlay" id="art-${a.key}" role="dialog" aria-modal="true">
      <div class="art-modal">
        <button class="art-close" data-close="${a.key}" aria-label="Cerrar artículo">&times;</button>
        <div class="art-hero">
          <video class="art-video-bg" muted loop playsinline preload="metadata">
            <source src="${a.video}" type="video/mp4" />
          </video>
          <button class="art-btn-sound" onclick="toggleArtSound(this)">🔇</button>
          <div class="art-hero-overlay">
            <span class="art-badge">${a.badge}</span>
            <h2 class="art-titulo">${a.titulo}</h2>
            <p class="art-subtitulo">${a.subtitulo}</p>
          </div>
        </div>
        <div class="art-body">
          <div class="art-datos-rapidos">
            ${a.datos.map(datoHTML).join("")}
          </div>
          <p class="art-intro">${a.intro}</p>
          ${a.secciones.map(seccionHTML).join("")}
          <div class="art-cta">
            <p>${a.ctaTexto}</p>
            <a href="html/planes_turisticos.html" class="art-btn-reservar">
              <i class="fa-solid fa-calendar-check"></i> Ver planes disponibles
            </a>
          </div>
        </div>
      </div>
    </div>
  `;

    mount.innerHTML = ARTICULOS.map(overlayHTML).join("");

    // ---- Abrir / cerrar artículos (delegación de eventos) ----
    function pauseArtVideo(overlay) {
        const video = overlay.querySelector(".art-video-bg");
        const btn = overlay.querySelector(".art-btn-sound");
        if (video) {
            video.pause();
            video.muted = true;
        }
        if (btn) btn.innerText = "🔇";
    }

    function closeOverlay(overlay) {
        overlay.classList.remove("open");
        document.body.style.overflow = "";
        pauseArtVideo(overlay);
    }

    // Delegación en document: funciona sin importar si las tarjetas
    // [data-article] viven en este componente, en destinos.js, o en
    // cualquier otra parte de la página.
    document.addEventListener("click", (e) => {
        const openTrigger = e.target.closest("[data-article]");
        if (openTrigger) {
            e.preventDefault();
            const overlay = document.getElementById("art-" + openTrigger.getAttribute("data-article"));
            if (!overlay) return;
            overlay.classList.add("open");
            document.body.style.overflow = "hidden";
            const modal = overlay.querySelector(".art-modal");
            if (modal) modal.scrollTop = 0;
            const video = overlay.querySelector(".art-video-bg");
            if (video) {
                video.currentTime = 0;
                video.play().catch(() => {});
            }
            return;
        }

        const closeBtn = e.target.closest(".art-close");
        if (closeBtn) {
            const overlay = document.getElementById("art-" + closeBtn.getAttribute("data-close"));
            if (overlay) closeOverlay(overlay);
            return;
        }

        if (e.target.classList.contains("art-overlay")) {
            closeOverlay(e.target);
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            document.querySelectorAll(".art-overlay.open").forEach(closeOverlay);
        }
    });

    // Sonido del video dentro del modal (usada por el onclick inline arriba)
    window.toggleArtSound = function(btn) {
        const video = btn.parentElement.querySelector(".art-video-bg");
        if (!video) return;
        video.muted = !video.muted;
        btn.innerText = video.muted ? "🔇" : "🔊";
    };
})();