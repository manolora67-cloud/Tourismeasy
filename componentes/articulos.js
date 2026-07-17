(function() {
    const mount = document.getElementById("site-articulos");
    if (!mount) return;

    const ARTICULOS = [{
            key: "bucaramanga",
            video: "audio-video/bucara.mp4",
            badge: "Popular",
            titulo: "Bucaramanga Accesible",
            subtitulo: "La Ciudad Bonita te espera sin barreras",
            datos: [
                { label: "Altitud", val: "959 m.s.n.m." },
                { label: "Clima", val: "24°C promedio" },
                { label: "Aeropuerto", val: "Palonegro (BGA)" },
                { label: "Mejor época", val: "Dic – Mar" },
            ],
            intro: "Bucaramanga, capital de Santander, es una ciudad vibrante rodeada de montañas que ha apostado fuertemente por el turismo inclusivo. Con más de 165 parques, una topografía desafiante que se ha ido adaptando progresivamente, y una oferta hotelera comprometida con la accesibilidad, la Ciudad Bonita tiene mucho que ofrecer a viajeros con cualquier tipo de necesidad.",
            secciones: [
                { titulo: "🚌 Transporte accesible", texto: "El sistema de transporte Metrolínea cuenta con vehículos de piso bajo y rampas desplegables en las rutas principales. Los taxis del área metropolitana están disponibles 24/7 con opción de vehículos adaptados para sillas de ruedas a través de la app TaxiAmigo Accesible." },
                { titulo: "🏨 Hospedaje certificado", texto: "El Hotel Dann Carlton Bucaramanga y el Hotel Chicamocha cuentan con habitaciones 100% adaptadas, baños con barras de apoyo, duchas tipo italiano y camas ajustables. El Hotel Tamacá ofrece servicio de asistente personal sin costo adicional." },
                { titulo: "🌿 Parques y naturaleza", texto: "El Parque Santander y el Parque García Rovira son totalmente planos y accesibles en silla de ruedas. El Jardín Botánico Eloy Valenzuela tiene senderos pavimentados con pendientes suaves y guías especializados en audiodescripción para personas con discapacidad visual." },
                { titulo: "🍽️ Gastronomía inclusiva", texto: "El Mercado del Río y el Restaurante La Carreta tienen acceso por rampa y menús en braille y con pictogramas. Varios restaurantes del centro histórico ofrecen servicio de intérprete de lengua de señas bajo reserva previa." },
                { titulo: "♿ Consejo TourismEasy", texto: "Reserva con al menos 48 horas de anticipación para garantizar la disponibilidad de personal auxiliar certificado y vehículos adaptados. El sello TourismEasy garantiza que el servicio cumple estándares reales de accesibilidad verificados por nuestro equipo." },
            ],
            ctaTexto: "¿Listo para explorar Bucaramanga?",
        },
        {
            key: "sangil",
            video: "audio-video/sangil.mp4",
            badge: "Nuevo",
            titulo: "San Gil Accesible",
            subtitulo: "Aventura extrema sin límites para todos",
            datos: [
                { label: "Altitud", val: "1.114 m.s.n.m." },
                { label: "Clima", val: "23°C promedio" },
                { label: "Distancia BGA", val: "98 km" },
                { label: "Mejor época", val: "Dic – Feb" },
            ],
            intro: "San Gil es conocida como la capital de los deportes extremos de Colombia, pero lo que pocos saben es que también es pionera en aventura adaptada. Empresas aliadas de TourismEasy han desarrollado versiones accesibles de rafting, parapente y espeleología para que ninguna condición física sea una barrera para la emoción.",
            secciones: [
                { titulo: "🛶 Rafting adaptado", texto: "La empresa Aventura Colombia ofrece rafting en el río Fonce con balsas especiales equipadas con asientos de apoyo lumbar y arneses adaptados. Los guías están certificados en primeros auxilios y atención a personas con discapacidad motriz. Apto para personas en silla de ruedas." },
                { titulo: "🪂 Parapente para todos", texto: "Colombia Paragliding realiza ch biplaza con equipo especial para personas con movilidad reducida. El despegue se realiza en plataforma elevada y el aterrizaje en campo abierto totalmente plano. Se requiere evaluación médica previa." },
                { titulo: "🌊 Parque Nacional del Chicamocha cercano", texto: "A 30 minutos, con teleférico accesible y senderos adaptados con piso firme, balaustradas y señalización en braille." },
                { titulo: "🏡 Hospedaje ecológico accesible", texto: "La Posada del Río ofrece cabañas con rampas externas, baños adaptados y servicio de guía especializado. El Hotel Campestre La Colina tiene piscina con elevador hidráulico." },
                { titulo: "♿ Consejo TourismEasy", texto: "Comunica con anticipación tu tipo de discapacidad al operador. San Gil tiene calles empedradas en el centro histórico — solicita el mapa de rutas pavimentadas accesibles que ofrecen nuestros aliados certificados." },
            ],
            ctaTexto: "¿Listo para explorar San Gil?",
        },
        {
            key: "barichara",
            video: "audio-video/barichara.mp4",
            badge: "Destacado",
            titulo: "Barichara Accesible",
            subtitulo: "El pueblo más lindo de Colombia te abre sus puertas",
            datos: [
                { label: "Altitud", val: "1.300 m.s.n.m." },
                { label: "Clima", val: "22°C promedio" },
                { label: "Distancia SG", val: "22 km" },
                { label: "Mejor época", val: "Todo el año" },
            ],
            intro: "Barichara, declarado Monumento Nacional, es posiblemente el pueblo más fotografiado de Colombia. Sus calles empedradas de piedra caliza blanca y sus fachadas coloniales enamoran a cualquiera. TourismEasy ha trabajado con la alcaldía y operadores locales para crear rutas alternativas pavimentadas que permiten disfrutar de su belleza sin barreras.",
            secciones: [
                { titulo: "🗺️ Rutas accesibles trazadas", texto: "Hemos mapeado 4 rutas alternativas a las calles empedradas que conectan los principales atractivos: la Catedral de la Inmaculada Concepción, el Parque Principal, la Casa de la Cultura y el mirador. Todas con superficie firme y pendientes suaves." },
                { titulo: "🏛️ Catedral accesible", texto: "La Catedral de la Inmaculada Concepción cuenta con rampa de acceso lateral y espacio reservado para sillas de ruedas en la nave central. El atrio fue recientemente remodelado con piso antideslizante." },
                { titulo: "🥾 Camino Real adaptado", texto: "El tramo inicial del Camino Real hacia Guane (primera sección de 2 km) tiene superficie compactada y puede realizarse en silla de ruedas todo terreno con guía especializado. TourismEasy ofrece este servicio con equipo incluido." },
                { titulo: "🎨 Talleres culturales inclusivos", texto: "La Escuela Taller de Barichara ofrece talleres de piedra y tejeduría adaptados con mesas regulables en altura, materiales en texturas diferenciadas para personas con discapacidad visual, e intérprete de señas bajo reserva." },
                { titulo: "♿ Consejo TourismEasy", texto: "Solicita el \"Kit Barichara Accesible\" al reservar: incluye mapa de rutas pavimentadas, listado de restaurantes con acceso y rampas portátiles disponibles en los principales puntos turísticos." },
            ],
            ctaTexto: "¿Listo para explorar Barichara?",
        },
        {
            key: "chicamocha",
            video: "audio-video/cañon.mp4",
            badge: "Natural",
            titulo: "Cañón del Chicamocha Accesible",
            subtitulo: "Una de las maravillas naturales de Colombia para todos",
            datos: [
                { label: "Altitud", val: "2.000 m profundidad" },
                { label: "Temperatura", val: "18–28°C" },
                { label: "Distancia BGA", val: "56 km" },
                { label: "Horario", val: "9am – 6pm" },
            ],
            intro: "El Cañón del Chicamocha es uno de los paisajes más impresionantes de Sudamérica, con más de 2.000 metros de profundidad. El Parque Nacional del Chicamocha (Panachi) ha implementado importantes mejoras de accesibilidad que lo convierten en un destino referente del turismo inclusivo en Colombia.",
            secciones: [
                { titulo: "🚡 Teleférico 100% accesible", texto: "El teleférico de Panachi, de 6.3 km (el más largo de América), cuenta con cabinas de acceso nivel para sillas de ruedas, sin escalón. El personal está capacitado en protocolos de embarque para personas con movilidad reducida. Capacidad: 2 sillas de ruedas por cabina." },
                { titulo: "🦅 Senderos adaptados", texto: "El Sendero de los Ancestros tiene 1.2 km con superficie compactada, señalización en braille y audiodescripción disponible mediante código QR en cada punto de interés. El mirador principal tiene plataforma elevada accesible." },
                { titulo: "🦁 Zona de animales", texto: "El área de fauna silvestre tiene caminos pavimentados entre las exhibiciones. El show de aves rapaces tiene zona reservada para sillas de ruedas con visibilidad óptima en primera fila." },
                { titulo: "🎢 Zona de entretenimiento", texto: "El Go-Kart adaptado permite a personas con movilidad reducida participar con sistema de manejo manual. La piscina de olas cuenta con silla hidráulica de acceso al agua." },
                { titulo: "♿ Consejo TourismEasy", texto: "Compra las entradas en línea y selecciona \"necesidades especiales\" para recibir orientación personalizada desde el ingreso. El parque ofrece sillas de ruedas de préstamo gratuito en la entrada." },
            ],
            ctaTexto: "¿Listo para explorar el Cañón del Chicamocha?",
        },
        {
            key: "socorro",
            video: "audio-video/socorro.mp4",
            badge: "Histórico",
            titulo: "Socorro Accesible",
            subtitulo: "Cuna de la independencia con acceso para todos",
            datos: [
                { label: "Altitud", val: "1.225 m.s.n.m." },
                { label: "Clima", val: "24°C promedio" },
                { label: "Distancia BGA", val: "120 km" },
                { label: "Mejor época", val: "Jun – Ago" },
            ],
            intro: "Socorro, conocida como la Ciudad Cívica de Colombia y cuna de la Revolución Comunera de 1781, es un destino de turismo histórico y cultural que ha avanzado significativamente en accesibilidad. Su centro histórico ha sido intervenido con rampas, señalización inclusiva y programas de guianza especializada.",
            secciones: [
                { titulo: "🏛️ Museos accesibles", texto: "La Casa de la Cultura y el Museo de la Revolución Comunera cuentan con rampa de acceso, ascensor interior y recorridos con audioguía disponible en español y lengua de señas colombiana (LSC) mediante tablet." },
                { titulo: "⛪ Catedral de Nuestra Señora del Socorro", texto: "La catedral principal tiene acceso lateral por rampa y espacio habilitado para sillas de ruedas. Los guías turísticos oficiales están certificados en turismo accesible por el SENA." },
                { titulo: "🌳 Parque Principal", texto: "El Parque Francisco de Paula Santander fue remodelado con pisos táctiles, bancas con apoya-brazos, fuentes de agua a altura accesible y luminarias con señalización auditiva en los cruces peatonales." },
                { titulo: "🚌 Transporte intermunicipal", texto: "Las empresas Cotrasangil y Copetrán tienen vehículos con espacio habilitado para sillas de ruedas en sus rutas Bucaramanga–Socorro. Reserva con 24 horas de anticipación." },
                { titulo: "♿ Consejo TourismEasy", texto: "El recorrido histórico oficial dura 3 horas y cubre todos los sitios en una ruta diseñada para sillas de ruedas. Solicita el guía certificado en accesibilidad al reservar a través de TourismEasy." },
            ],
            ctaTexto: "¿Listo para explorar Socorro?",
        },
        {
            key: "giron",
            video: "audio-video/giron.mp4",
            badge: "Patrimonio",
            titulo: "Girón Accesible",
            subtitulo: "Villa de Girón, patrimonio histórico sin barreras",
            datos: [
                { label: "Altitud", val: "780 m.s.n.m." },
                { label: "Clima", val: "28°C promedio" },
                { label: "Distancia BGA", val: "9 km" },
                { label: "Mejor época", val: "Todo el año" },
            ],
            intro: "Girón, a solo 9 km de Bucaramanga, es uno de los pueblos coloniales mejor conservados de Colombia. Declarado Monumento Nacional, su arquitectura blanca y sus calles de piedra son inconfundibles. La alcaldía y TourismEasy han colaborado para crear rutas de acceso alternativas que permiten disfrutar plenamente de este tesoro colonial.",
            secciones: [
                { titulo: "🌉 Puentes accesibles", texto: "Los puentes coloniales sobre el río de Oro han sido complementados con pasarelas paralelas de madera tratada, aptas para sillas de ruedas, que ofrecen la misma vista panorámica sin las escalinatas de los puentes originales." },
                { titulo: "🍽️ Gastronomía inclusiva", texto: "El Restaurante La Casona y el Café Colonial tienen acceso por rampa, sillas con apoyo lumbar y menú disponible en formato digital con descripción de ingredientes para personas con alergias. El servicio de intérprete de señas está disponible bajo reserva." },
                { titulo: "🏘️ Centro histórico adaptado", texto: "La Alcaldía de Girón mantiene un mapa actualizado de rutas sin escalones que conecta la Plaza Principal, la Capilla de las Nieves, el Parque de las Madres y el Malecón del Río de Oro." },
                { titulo: "🎭 Cultura y festividades", texto: "La Feria de Girón (agosto) ha implementado zonas exclusivas accesibles con tarima elevada para personas en silla de ruedas con visibilidad garantizada y acceso prioritario." },
                { titulo: "♿ Consejo TourismEasy", texto: "Girón se puede combinar perfectamente con Bucaramanga en un día completo. Los buses del sistema Metrolínea llegan hasta el centro de Girón en ruta accesible. Consulta el horario de rutas adaptadas al reservar." },
            ],
            ctaTexto: "¿Listo para explorar Girón?",
        },
        {
            key: "velez",
            video: "audio-video/velez.mp4",
            badge: "Cultural",
            titulo: "Vélez Accesible",
            subtitulo: "Tierra de la guabina y el tiple, abierta para todos",
            datos: [
                { label: "Altitud", val: "2.130 m.s.n.m." },
                { label: "Clima", val: "17°C promedio" },
                { label: "Distancia BGA", val: "220 km" },
                { label: "Mejor época", val: "Jul – Ago" },
            ],
            intro: "Vélez, en la provincia de Vélez, es famosa por sus festivales de música andina colombiana, su gastronomía única y sus paisajes de montaña. Aunque es un destino menos conocido, ha avanzado de manera notable en inclusión turística, siendo uno de los pioneros del departamento en accesibilidad cultural.",
            secciones: [
                { titulo: "🎵 Festival Nacional de la Guabina", texto: "El festival más importante de Vélez ha incorporado zonas accesibles con rampas de acceso a tarimas, área reservada para sillas de ruedas con óptima visibilidad e intérprete de LSC en los eventos principales." },
                { titulo: "🏨 Hoteles adaptados", texto: "El Hotel Zaguán Real y el Hotel Turístico Vélez cuentan con habitaciones adaptadas, baños con silla de ducha y barras de apoyo, y personal capacitado en asistencia a viajeros con discapacidad." },
                { titulo: "🌄 Mirador La Cruz", texto: "El mirador más visitado de Vélez tiene un camino pavimentado de 400 metros accesible en silla de ruedas. La plataforma de observación es completamente plana con balaustrada de seguridad." },
                { titulo: "🍲 Gastronomía local accesible", texto: "La Fonda Típica El Zaguán y el Restaurante Doña Rosalba tienen mesas a altura estándar, sillas con apoya-brazos y acceso sin escalón. Sus platos típicos como el mute santandereano y la pepitoria están disponibles con descripción detallada de ingredientes." },
                { titulo: "♿ Consejo TourismEasy", texto: "Vélez queda a 4 horas de Bucaramanga por carretera. Recomendamos reservar el transporte accesible con al menos 72 horas de anticipación. La mejor época para visitar coincide con el festival en julio–agosto." },
            ],
            ctaTexto: "¿Listo para explorar Vélez?",
        },
        {
            key: "lossantos",
            video: "audio-video/lossantos.mp4",
            badge: "Natural",
            titulo: "Los Santos Accesible",
            subtitulo: "El mirador del cóndor en Santander sin barreras",
            datos: [
                { label: "Altitud", val: "1.850 m.s.n.m." },
                { label: "Clima", val: "18°C promedio" },
                { label: "Distancia BGA", val: "62 km" },
                { label: "Mejor época", val: "Dic – Mar" },
            ],
            intro: "Los Santos, enclavado sobre el Cañón del Chicamocha, es uno de los municipios con paisajes más impresionantes de Santander. Conocido por el avistamiento de cóndores y su imponente mesa de Los Santos, TourismEasy ha trabajado con operadores locales para garantizar experiencias naturales accesibles e inclusivas.",
            secciones: [
                { titulo: "🦅 Avistamiento de cóndores accesible", texto: "El mirador principal cuenta con plataforma pavimentada, barandas de seguridad y área de descanso adaptada. Los guías especializados de TourismEasy facilitan la experiencia para personas con movilidad reducida o discapacidad visual, describiendo el vuelo y comportamiento de los cóndores." },
                { titulo: "🌄 Senderos naturales adaptados", texto: "Los senderos del municipio han sido acondicionados con superficies compactadas y señalización en braille. Los recorridos cortos de 500 m a 1 km permiten disfrutar de vistas al cañón con puntos de descanso cada 200 metros." },
                { titulo: "🏡 Hospedaje rural inclusivo", texto: "Varias fincas y posadas de Los Santos cuentan con certificación TourismEasy: habitaciones accesibles, rampas de ingreso, baños adaptados y terrazas con vistas panorámicas al Chicamocha." },
                { titulo: "🚌 Transporte desde Bucaramanga", texto: "Existen rutas intermunicipales con salida desde el Terminal de Transportes de Bucaramanga con frecuencia diaria. TourismEasy coordina transporte accesible con rampa para grupos que lo requieran con reserva previa." },
                { titulo: "♿ Consejo TourismEasy", texto: "La mejor hora para el avistamiento de cóndores es entre las 7:00 y las 10:00 a.m. Recomendamos el paquete \"Vuelo del Cóndor\" que incluye transporte accesible, guía especializado y desayuno típico santandereano." },
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