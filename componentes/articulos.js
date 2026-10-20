(function() {
    const mount = document.getElementById("site-articulos");

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
                { titulo: "🏨 Dónde alojarte", texto: "El Hotel Dann Carlton Bucaramanga es una opción reconocida en el centro de la ciudad, con buena ubicación para moverte a pie o en transporte público. El Hotel Tamacá ofrece un ambiente más tranquilo, ideal para estadías largas." },
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
            intro: "Los Santos, enclavado sobre un imponente cañón, es uno de los municipios con paisajes más impresionantes de Santander. Conocido por el avistamiento de cóndores y su imponente mesa, es un destino imperdible para los amantes de la naturaleza.",
            secciones: [
                { titulo: "🦅 Avistamiento de cóndores", texto: "El mirador principal del municipio es uno de los mejores lugares de Colombia para observar cóndores en su hábitat natural, especialmente en las horas de la mañana." },
                { titulo: "🌄 Senderos naturales", texto: "Los Santos cuenta con varios senderos cortos, de 500 metros a 1 kilómetro, con vistas privilegiadas al cañón." },
                { titulo: "🏡 Hospedaje rural", texto: "Varias fincas y posadas del municipio ofrecen alojamiento con terrazas panorámicas hacia el cañón, ideales para desconectarse." },
                { titulo: "🚌 Transporte desde Bucaramanga", texto: "Existen rutas intermunicipales con salida desde el Terminal de Transportes de Bucaramanga con frecuencia diaria." },
                { titulo: "💡 Consejo TourismEasy", texto: "La mejor hora para el avistamiento de cóndores es entre las 7:00 y las 10:00 a.m. Te recomendamos el paquete \"Vuelo del Cóndor\", que incluye transporte, guía especializado y desayuno típico santandereano." },
            ],
            ctaTexto: "¿Listo para explorar Los Santos?",
        },
        {
            key: "aguada",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Aguada",
            subtitulo: "Tradición rural entre las montañas de Vélez",
            datos: [
                { label: "Altitud", val: "1.700 m.s.n.m." },
                { label: "Clima", val: "19°C promedio" },
                { label: "Distancia BGA", val: "190 km" },
                { label: "Mejor época", val: "Dic. a feb. y jun. a ago." },
            ],
            intro: "Aguada permite acercarse al paisaje campesino del sur de Santander, con caminos rurales, laderas y una vida local ligada al campo.",
            secciones: [
                { titulo: "🌄 Caminos entre cultivos", texto: "Los caminos veredales cruzan cañaduzales y pastos con vistas abiertas hacia los valles vecinos, especialmente al amanecer." },
                { titulo: "⛪ Parque y templo", texto: "El casco urbano es pequeño y tranquilo: la plaza, la iglesia y las tiendas concentran la vida diaria del pueblo." },
                { titulo: "🍯 Panela artesanal", texto: "La caña de azúcar marca la economía local; pregunta por visitas a trapiches familiares durante la molienda." },
                { titulo: "💡 Consejo TourismEasy", texto: "Lleva efectivo y confirma el transporte de regreso, porque los servicios en municipios pequeños son limitados." },
            ],
            ctaTexto: "¿Listo para explorar Aguada?",
        },
        {
            key: "albania",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Albania",
            subtitulo: "Un encuentro tranquilo con el campo santandereano",
            datos: [
                { label: "Altitud", val: "1.900 m.s.n.m." },
                { label: "Clima", val: "18°C promedio" },
                { label: "Distancia BGA", val: "215 km" },
                { label: "Mejor época", val: "Dic. a feb. y jun. a ago." },
            ],
            intro: "Albania es un municipio rural de la provincia de Vélez. Su atractivo está en descubrir con calma el paisaje, las labores agrícolas y las tradiciones de sus habitantes.",
            secciones: [
                { titulo: "🌿 Paisaje campesino", texto: "Fincas de caña y café se alternan con bosques de niebla, ideales para caminatas cortas por caminos rurales." },
                { titulo: "⛪ Plaza principal", texto: "Un parque sencillo rodeado de casas de colores donde se siente el ritmo pausado del campo vélezano." },
                { titulo: "🍯 Sabores de trapiche", texto: "Panela, melcochas y dulces caseros son los productos que mejor representan la región." },
                { titulo: "💡 Consejo TourismEasy", texto: "Visita en mañana: la neblina suele subir por la tarde y limita las vistas." },
            ],
            ctaTexto: "¿Listo para explorar Albania?",
        },
        {
            key: "aratoca",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Aratoca",
            subtitulo: "Paisajes abiertos de montaña y cañón",
            datos: [
                { label: "Altitud", val: "1.700 m.s.n.m." },
                { label: "Clima", val: "19°C promedio" },
                { label: "Distancia BGA", val: "57 km" },
                { label: "Mejor época", val: "Todo el año" },
            ],
            intro: "Aratoca se encuentra en un entorno de cañón y ofrece una perspectiva de las montañas y del paisaje seco característico de esta zona.",
            secciones: [
                { titulo: "🏞️ Miradores del cañón", texto: "Varios puntos del casco urbano y sus alrededores ofrecen vistas profundas del cañón, con el mejor color al atardecer." },
                { titulo: "🧗 Aventura al aire libre", texto: "Los alrededores permiten caminatas, cabalgatas y espeleología guiada en cuevas cercanas con operadores locales." },
                { titulo: "🍬 Dulces y tradición", texto: "La oferta de dulces, bocadillos y platos típicos acompaña el recorrido por la plaza y el templo." },
                { titulo: "💡 Consejo TourismEasy", texto: "Combina Aratoca con Barichara o Los Santos en una ruta de un día, saliendo temprano desde Bucaramanga." },
            ],
            ctaTexto: "¿Listo para explorar Aratoca?",
        },
        {
            key: "barbosa",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Barbosa",
            subtitulo: "Sabores de guayaba en el sur de Santander",
            datos: [
                { label: "Altitud", val: "1.600 m.s.n.m." },
                { label: "Clima", val: "21°C promedio" },
                { label: "Distancia BGA", val: "245 km" },
                { label: "Mejor época", val: "Todo el año" },
            ],
            intro: "Barbosa es un punto de encuentro del sur de Santander, reconocido por la producción de guayaba y el bocadillo veleño, además de su ambiente comercial.",
            secciones: [
                { titulo: "🍬 Capital del bocadillo", texto: "Barbosa es famosa por su bocadillo veleño y sus dulces de guayaba, que se compran frescos en tiendas del parque." },
                { titulo: "⛪ Parque principal", texto: "El parque central reúne el templo, comercio local y puestos de dulces, y es el mejor punto de partida a pie." },
                { titulo: "🌄 Paisaje de transición", texto: "Entre Santander y Boyacá, el paisaje combina cultivos de guayaba, pastizales y colinas verdes." },
                { titulo: "💡 Consejo TourismEasy", texto: "Compra el bocadillo en paquetes sellados y revisa la fecha de vencimiento antes de llevarlo de regalo." },
            ],
            ctaTexto: "¿Listo para explorar Barbosa?",
        },
        {
            key: "barrancabermeja",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Barrancabermeja",
            subtitulo: "Vida ribereña a orillas del río Magdalena",
            datos: [
                { label: "Altitud", val: "75 m.s.n.m." },
                { label: "Clima", val: "28°C promedio" },
                { label: "Distancia BGA", val: "115 km" },
                { label: "Mejor época", val: "Dic. a mar." },
            ],
            intro: "Barrancabermeja es una ciudad portuaria del Magdalena Medio santandereano. El río, la actividad petrolera y el clima cálido han marcado su historia y su vida cotidiana.",
            secciones: [
                { titulo: "🌅 Malecón del río Magdalena", texto: "El malecón es el espacio más animado de la ciudad: paseo, gastronomía y atardeceres sobre el gran río." },
                { titulo: "🛶 Ciénagas y humedales", texto: "Las ciénagas cercanas permiten paseos en lancha y avistamiento de aves, con operadores locales." },
                { titulo: "🏭 Ciudad petrolera", texto: "Su historia está ligada a la industria petrolera; el centro y los museos cuentan cómo cambió la región." },
                { titulo: "💡 Consejo TourismEasy", texto: "Usa repelente, ropa ligera y mucha agua: el calor y la humedad son constantes durante todo el año." },
            ],
            ctaTexto: "¿Listo para explorar Barrancabermeja?",
        },
        {
            key: "betulia",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Betulia",
            subtitulo: "Montañas y paisajes de agua en Topocoro",
            datos: [
                { label: "Altitud", val: "800 m.s.n.m." },
                { label: "Clima", val: "26°C promedio" },
                { label: "Distancia BGA", val: "70 km" },
                { label: "Mejor época", val: "Dic. a mar." },
            ],
            intro: "Betulia combina paisaje montañoso con el entorno del embalse Topocoro, un escenario de agua que ha transformado la zona y sus posibilidades de recreación.",
            secciones: [
                { titulo: "💧 Embalse de Topocoro", texto: "El embalse ofrece paisajes de agua y montaña, con paseos en lancha y miradores hacia la represa." },
                { titulo: "🥘 Pescado y comida del río", texto: "La cocina local gira en torno al pescado y los platos caseros de la región." },
                { titulo: "🌄 Clima cálido", texto: "Sus tardes templadas invitan a recorrer el pueblo despacio y conversar con la gente en la plaza." },
                { titulo: "💡 Consejo TourismEasy", texto: "Contrata paseos en lancha con operadores locales y verifica que entreguen chalecos salvavidas." },
            ],
            ctaTexto: "¿Listo para explorar Betulia?",
        },
        {
            key: "bolivar",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Bolívar",
            subtitulo: "Paisajes rurales en la provincia de Vélez",
            datos: [
                { label: "Altitud", val: "1.600 m.s.n.m." },
                { label: "Clima", val: "20°C promedio" },
                { label: "Distancia BGA", val: "225 km" },
                { label: "Mejor época", val: "Dic. a feb. y jun. a ago." },
            ],
            intro: "Bolívar es un municipio extenso de tradición campesina, con paisajes de montaña y caminos que conectan comunidades rurales del occidente santandereano.",
            secciones: [
                { titulo: "🍬 Dulces tradicionales", texto: "Las tiendas del parque venden bocadillo, arequipe y otros dulces de la región, perfectos para llevar." },
                { titulo: "⛪ Centro tradicional", texto: "El casco urbano conserva casas bajas, calles tranquilas y un templo que organiza buena parte de las fiestas locales." },
                { titulo: "🌿 Rutas veredales", texto: "Los caminos entre fincas ofrecen paisajes de montaña y la posibilidad de conocer cultivos de guayaba y caña." },
                { titulo: "💡 Consejo TourismEasy", texto: "Pregunta por rutas veredales antes de salir; en época de lluvias algunas vías se ponen difíciles." },
            ],
            ctaTexto: "¿Listo para explorar Bolívar?",
        },
        {
            key: "cabrera",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Cabrera",
            subtitulo: "Un pueblo sereno entre caminos de Guanentá",
            datos: [
                { label: "Altitud", val: "1.450 m.s.n.m." },
                { label: "Clima", val: "22°C promedio" },
                { label: "Distancia BGA", val: "120 km" },
                { label: "Mejor época", val: "Todo el año" },
            ],
            intro: "Cabrera conserva un ambiente apacible y una escala de pueblo que invita a recorrer el centro y apreciar el paisaje rural de la provincia Guanentá.",
            secciones: [
                { titulo: "🏞️ Paisaje del río Fonce", texto: "El municipio se asoma al cañón del río Fonce, con vistas amplias y senderos para caminatas tranquilas." },
                { titulo: "🐴 Cabalgatas", texto: "Los paseos a caballo por caminos rurales permiten ver cultivos y miradores con guías de la zona." },
                { titulo: "🍽️ Cocina campesina", texto: "Los restaurantes del pueblo sirven platos caseros con ingredientes de las fincas vecinas." },
                { titulo: "💡 Consejo TourismEasy", texto: "Aprovecha que está cerca de San Gil para combinarlo en una ruta de aventura y descanso." },
            ],
            ctaTexto: "¿Listo para explorar Cabrera?",
        },
        {
            key: "california",
            video: "",
            badge: "Municipio de Santander",
            titulo: "California",
            subtitulo: "Montaña y memoria minera en Soto Norte",
            datos: [
                { label: "Altitud", val: "2.300 m.s.n.m." },
                { label: "Clima", val: "14°C promedio" },
                { label: "Distancia BGA", val: "66 km" },
                { label: "Mejor época", val: "Dic. a feb." },
            ],
            intro: "California está enclavado en las montañas de Soto Norte, en el entorno del páramo de Santurbán. Su historia y su identidad están ligadas a la minería.",
            secciones: [
                { titulo: "⛏️ Tradición minera", texto: "California ha estado ligada a la minería de oro; conocer su historia ayuda a entender la identidad del pueblo." },
                { titulo: "🌫️ Clima fresco de páramo", texto: "El clima frío y las montañas cubiertas de niebla dan un ambiente tranquilo, ideal para caminar con abrigo." },
                { titulo: "🏞️ Caminos de montaña", texto: "Senderos y quebradas alrededor del casco urbano permiten disfrutar del paisaje alto andino." },
                { titulo: "💡 Consejo TourismEasy", texto: "Lleva chaqueta impermeable: el clima cambia rápido y las tardes son frías." },
            ],
            ctaTexto: "¿Listo para explorar California?",
        },
        {
            key: "capitanejo",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Capitanejo",
            subtitulo: "El paisaje cálido del cañón y del río",
            datos: [
                { label: "Altitud", val: "1.000 m.s.n.m." },
                { label: "Clima", val: "26°C promedio" },
                { label: "Distancia BGA", val: "215 km" },
                { label: "Mejor época", val: "Dic. a mar." },
            ],
            intro: "Capitanejo se asienta en un valle junto al río, en un entorno cálido de laderas y paisajes contrastantes con las montañas altas de García Rovira.",
            secciones: [
                { titulo: "🌵 Paisaje cálido del cañón", texto: "Laderas secas y vistas abiertas al río caracterizan un entorno poco común en Santander." },
                { titulo: "🌉 Puente sobre el río", texto: "El puente sobre el río es un punto de referencia para fotografiar el paisaje y el flujo de viajeros." },
                { titulo: "🍴 Sabores de frontera", texto: "La cercanía a Boyacá se nota en la mesa: platos sencillos, pan fresco y dulces tradicionales." },
                { titulo: "💡 Consejo TourismEasy", texto: "Lleva sombrero, protector solar y agua; el sol del cañón es intenso durante todo el día." },
            ],
            ctaTexto: "¿Listo para explorar Capitanejo?",
        },
        {
            key: "carcasi",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Carcasí",
            subtitulo: "Caminos de montaña en García Rovira",
            datos: [
                { label: "Altitud", val: "2.400 m.s.n.m." },
                { label: "Clima", val: "14°C promedio" },
                { label: "Distancia BGA", val: "225 km" },
                { label: "Mejor época", val: "Dic. a feb." },
            ],
            intro: "Carcasí ofrece un paisaje de montaña y un entorno de clima fresco, donde la vida rural y los caminos veredales definen el ritmo del municipio.",
            secciones: [
                { titulo: "⛪ Pueblo de montaña", texto: "Un casco urbano pequeño, de casas sencillas y calles quietas, rodeado de laderas verdes." },
                { titulo: "🥔 Cultivos de clima frío", texto: "Papa, arveja y maíz crecen en las parcelas de las veredas; algunos campesinos reciben visitantes." },
                { titulo: "🌫️ Neblina y senderos", texto: "Los caminos hacia las veredas altas ofrecen vistas despejadas cuando abre el día." },
                { titulo: "💡 Consejo TourismEasy", texto: "Viaja con ropa abrigada y confirma el estado de la vía antes de salir desde Málaga." },
            ],
            ctaTexto: "¿Listo para explorar Carcasí?",
        },
        {
            key: "cepita",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Cepitá",
            subtitulo: "Un rincón del cañón",
            datos: [
                { label: "Altitud", val: "1.500 m.s.n.m." },
                { label: "Clima", val: "22°C promedio" },
                { label: "Distancia BGA", val: "70 km" },
                { label: "Mejor época", val: "Todo el año" },
            ],
            intro: "Cepitá se ubica en un cañón, entre laderas secas y el curso del río. Su paisaje ofrece una perspectiva distinta de Santander.",
            secciones: [
                { titulo: "🏞️ Cañón y mirador", texto: "Los miradores del municipio abren la vista a laderas áridas y al cauce que recorre el cañón." },
                { titulo: "⛪ Parque y templo", texto: "El centro del pueblo es breve, ordenado y tranquilo; perfecto para una pausa en un recorrido más largo." },
                { titulo: "🥾 Caminos rurales", texto: "Los senderos entre fincas cuentan con tramos aptos para caminatas cortas y buena fotografía." },
                { titulo: "💡 Consejo TourismEasy", texto: "Combina Cepitá con Aratoca y Los Santos en una ruta cañonera de día completo." },
            ],
            ctaTexto: "¿Listo para explorar Cepitá?",
        },
        {
            key: "cerrito",
            video: "",
            badge: "Municipio de Santander",
            titulo: "El Cerrito",
            subtitulo: "Paisaje altoandino en la ruta del páramo",
            datos: [
                { label: "Altitud", val: "2.400 m.s.n.m." },
                { label: "Clima", val: "13°C promedio" },
                { label: "Distancia BGA", val: "240 km" },
                { label: "Mejor época", val: "Dic. a feb." },
            ],
            intro: "El Cerrito es conocido por sus paisajes fríos de alta montaña y por su cercanía al páramo del Almorzadero, un ecosistema clave para el agua de la región.",
            secciones: [
                { titulo: "🌄 Páramo del Almorzadero", texto: "Sus alrededores conectan con ecosistemas de páramo, de frailejones y lagunas, con senderos guiados." },
                { titulo: "🥔 Agricultura de montaña", texto: "La papa y los cultivos de clima frío dan identidad al municipio y a su mesa." },
                { titulo: "⛪ Centro tradicional", texto: "El casco urbano conserva la calma de los pueblos andinos, con parque, iglesia y comercio sencillo." },
                { titulo: "💡 Consejo TourismEasy", texto: "Lleva abrigo y botas impermeables; en el páramo la temperatura puede bajar de 5 °C por la noche." },
            ],
            ctaTexto: "¿Listo para explorar El Cerrito?",
        },
        {
            key: "charala",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Charalá",
            subtitulo: "Memoria comunera y paisajes del río Pienta",
            datos: [
                { label: "Altitud", val: "1.350 m.s.n.m." },
                { label: "Clima", val: "22°C promedio" },
                { label: "Distancia BGA", val: "140 km" },
                { label: "Mejor época", val: "Todo el año" },
            ],
            intro: "Charalá ocupa un lugar destacado en la historia de Santander y está ligada a la Revolución de los Comuneros y a la batalla del río Pienta.",
            secciones: [
                { titulo: "🏛️ Historia comunera", texto: "Charalá es cuna de la heroína Antonia Santos y escenario de la Batalla del Pienta; la plaza y el museo recuerdan esa historia." },
                { titulo: "🌳 Santuario de Flora y Fauna Guanentá", texto: "Cerca del municipio se accede al santuario, con bosques de niebla, quebradas y rutas de naturaleza." },
                { titulo: "🌊 Rafting y aventura", texto: "Sus ríos permiten aventura guiada y paseos por paisajes de montaña verde." },
                { titulo: "💡 Consejo TourismEasy", texto: "Reserva con operadores locales las rutas de naturaleza y aventura, especialmente en temporada alta." },
            ],
            ctaTexto: "¿Listo para explorar Charalá?",
        },
        {
            key: "charta",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Charta",
            subtitulo: "Caminos verdes en las montañas de Soto Norte",
            datos: [
                { label: "Altitud", val: "2.350 m.s.n.m." },
                { label: "Clima", val: "14°C promedio" },
                { label: "Distancia BGA", val: "55 km" },
                { label: "Mejor época", val: "Dic. a feb." },
            ],
            intro: "Charta es un municipio de clima fresco, rodeado de montañas y paisajes rurales en la provincia de Soto Norte.",
            secciones: [
                { titulo: "⛰️ Montaña y frailejones", texto: "El entorno alto andino ofrece paisajes de neblina y vegetación de páramo cerca del municipio." },
                { titulo: "⛏️ Pueblo de minería", texto: "La actividad minera marca la vida del municipio; preguntar a los locales permite conocer sus relatos." },
                { titulo: "🍲 Comida caliente", texto: "Los restaurantes sirven caldos y platos contundentes que hacen frente al frío." },
                { titulo: "💡 Consejo TourismEasy", texto: "Lleva ropa de abrigo y revisa el clima antes de viajar, porque la niebla puede limitar la visibilidad." },
            ],
            ctaTexto: "¿Listo para explorar Charta?",
        },
        {
            key: "chima",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Chima",
            subtitulo: "Tradición campesina en la provincia Comunera",
            datos: [
                { label: "Altitud", val: "1.700 m.s.n.m." },
                { label: "Clima", val: "19°C promedio" },
                { label: "Distancia BGA", val: "135 km" },
                { label: "Mejor época", val: "Dic. a feb. y jun. a ago." },
            ],
            intro: "Chima invita a conocer un municipio tranquilo de la provincia Comunera, con colinas, fincas y una vida cotidiana ligada al campo.",
            secciones: [
                { titulo: "🍫 Sabores caseros", texto: "Dulces, café y productos del campo se encuentran en pequeñas tiendas del casco urbano." },
                { titulo: "🌄 Miradores naturales", texto: "Los caminos que salen del pueblo regalan vistas amplias de la cordillera y de los valles." },
                { titulo: "⛪ Plaza y templo", texto: "La plaza principal reúne la vida social del pueblo y es el punto de inicio de cualquier recorrido." },
                { titulo: "💡 Consejo TourismEasy", texto: "Si vas en fin de semana, llega temprano: el comercio local suele cerrar pronto." },
            ],
            ctaTexto: "¿Listo para explorar Chima?",
        },
        {
            key: "chipata",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Chipatá",
            subtitulo: "Un recorrido por la tierra de Vélez",
            datos: [
                { label: "Altitud", val: "1.750 m.s.n.m." },
                { label: "Clima", val: "19°C promedio" },
                { label: "Distancia BGA", val: "230 km" },
                { label: "Mejor época", val: "Dic. a feb. y jun. a ago." },
            ],
            intro: "Chipatá combina paisajes de colinas y tradiciones agrícolas en la provincia de Vélez, una región reconocida por sus productos de guayaba.",
            secciones: [
                { titulo: "🍯 Guayaba y panela", texto: "La región vélezana destaca por sus cultivos de guayaba y caña; hay fincas que reciben visitantes." },
                { titulo: "⛪ Parque principal", texto: "El parque es sede de ferias y celebraciones locales, con templo y comercio de barrio." },
                { titulo: "🌿 Senderos veredales", texto: "Caminos tranquilos entre fincas permiten conocer paisajes verdes y aves de la zona." },
                { titulo: "💡 Consejo TourismEasy", texto: "Pregunta en la alcaldía por rutas y fincas abiertas al turismo antes de salir." },
            ],
            ctaTexto: "¿Listo para explorar Chipatá?",
        },
        {
            key: "cimitarra",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Cimitarra",
            subtitulo: "Naturaleza y cultura del Magdalena Medio",
            datos: [
                { label: "Altitud", val: "150 m.s.n.m." },
                { label: "Clima", val: "28°C promedio" },
                { label: "Distancia BGA", val: "200 km" },
                { label: "Mejor época", val: "Dic. a mar." },
            ],
            intro: "Cimitarra se extiende por una región de clima cálido, bosques y cursos de agua del Magdalena Medio, con una fuerte tradición rural.",
            secciones: [
                { titulo: "🌾 Llanura ganadera", texto: "Sus paisajes de llanura y ganadería cuentan la historia del Magdalena Medio." },
                { titulo: "🛶 Ríos y ciénagas", texto: "Los ríos de la zona permiten paseos y observación de aves y fauna regional." },
                { titulo: "🍖 Cocina del Magdalena Medio", texto: "Carne a la brasa, pescado y jugos tropicales dominan la oferta gastronómica." },
                { titulo: "💡 Consejo TourismEasy", texto: "Lleva ropa ligera, hidratación y protección solar; el calor es fuerte durante el día." },
            ],
            ctaTexto: "¿Listo para explorar Cimitarra?",
        },
        {
            key: "concepcion",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Concepción",
            subtitulo: "Arquitectura y paisajes de montaña",
            datos: [
                { label: "Altitud", val: "2.300 m.s.n.m." },
                { label: "Clima", val: "14°C promedio" },
                { label: "Distancia BGA", val: "215 km" },
                { label: "Mejor época", val: "Dic. a feb." },
            ],
            intro: "Concepción reúne un centro de tradición arquitectónica y un entorno montañoso de clima fresco en la provincia García Rovira.",
            secciones: [
                { titulo: "⛪ Pueblo andino", texto: "Un casco urbano tradicional, con parque, templo y casas de balcón, en la zona fría de García Rovira." },
                { titulo: "🥔 Papa y clima frío", texto: "Sus campos de papa y otros cultivos dan identidad a la región y a su gastronomía." },
                { titulo: "🏞️ Paisajes de páramo", texto: "Los alrededores conectan con zonas de páramo, laderas y caminos de arriería." },
                { titulo: "💡 Consejo TourismEasy", texto: "Viaja abrigado y prefiere la mañana para caminatas; por la tarde puede haber niebla." },
            ],
            ctaTexto: "¿Listo para explorar Concepción?",
        },
        {
            key: "confines",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Confines",
            subtitulo: "Un pueblo tranquilo para conocer la provincia Comunera",
            datos: [
                { label: "Altitud", val: "1.600 m.s.n.m." },
                { label: "Clima", val: "20°C promedio" },
                { label: "Distancia BGA", val: "165 km" },
                { label: "Mejor época", val: "Dic. a feb. y jun. a ago." },
            ],
            intro: "Confines es un destino de escala pequeña, con colinas y caminos rurales que permiten acercarse al paisaje y a la vida cotidiana santandereana.",
            secciones: [
                { titulo: "🍬 Pueblo tranquilo", texto: "Un casco urbano pequeño, sin afanes, donde los visitantes pueden recorrer la plaza y charlar con los habitantes." },
                { titulo: "🌿 Rutas campesinas", texto: "Caminos entre fincas ofrecen vistas del paisaje de la provincia Comunera y oportunidades de fotografía." },
                { titulo: "🥣 Comida casera", texto: "Las cocinas locales sirven sopas, arepas y platos tradicionales con ingredientes de la zona." },
                { titulo: "💡 Consejo TourismEasy", texto: "Consulta horarios de transporte intermunicipal: en fines de semana largos pueden cambiar." },
            ],
            ctaTexto: "¿Listo para explorar Confines?",
        },
        {
            key: "contratacion",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Contratación",
            subtitulo: "Historia y memoria en el corazón de Santander",
            datos: [
                { label: "Altitud", val: "1.350 m.s.n.m." },
                { label: "Clima", val: "22°C promedio" },
                { label: "Distancia BGA", val: "150 km" },
                { label: "Mejor época", val: "Todo el año" },
            ],
            intro: "Contratación conserva una historia singular asociada al antiguo lazareto y a la atención de personas afectadas por la enfermedad de Hansen.",
            secciones: [
                { titulo: "🍊 Cultivos frutales", texto: "Cítricos y otros frutales aparecen entre las fincas del municipio; hay productores que ofrecen degustaciones." },
                { titulo: "⛪ Parque y templo", texto: "El parque central concentra el comercio local y las celebraciones religiosas del municipio." },
                { titulo: "🏞️ Quebradas y senderos", texto: "Pequeñas quebradas y caminos veredales ofrecen paseos cortos para disfrutar del campo." },
                { titulo: "💡 Consejo TourismEasy", texto: "Pregunta por fincas con visitas guiadas y lleva efectivo, ya que no hay cajeros en todas las veredas." },
            ],
            ctaTexto: "¿Listo para explorar Contratación?",
        },
        {
            key: "coromoro",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Coromoro",
            subtitulo: "Montañas e historia alrededor del río Pienta",
            datos: [
                { label: "Altitud", val: "1.700 m.s.n.m." },
                { label: "Clima", val: "19°C promedio" },
                { label: "Distancia BGA", val: "125 km" },
                { label: "Mejor época", val: "Todo el año" },
            ],
            intro: "Coromoro ofrece paisajes de montaña en la provincia Guanentá y una historia regional vinculada al río Pienta.",
            secciones: [
                { titulo: "🏛️ Historia comunera", texto: "Coromoro fue escenario de episodios del movimiento comunero; su plaza y templo conservan ese aire histórico." },
                { titulo: "🐴 Cabalgatas rurales", texto: "Los recorridos a caballo por veredas ofrecen vistas hacia las montañas de Guanentá." },
                { titulo: "🍷 Dulces y artesanías", texto: "Pequeños talleres ofrecen dulces y artesanías para llevar como recuerdo." },
                { titulo: "💡 Consejo TourismEasy", texto: "Combina Coromoro con Charalá para una ruta histórica de dos días por la provincia." },
            ],
            ctaTexto: "¿Listo para explorar Coromoro?",
        },
        {
            key: "curiti",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Curití",
            subtitulo: "Artesanía en fique y aguas de Pescaderito",
            datos: [
                { label: "Altitud", val: "1.000 m.s.n.m." },
                { label: "Clima", val: "25°C promedio" },
                { label: "Distancia BGA", val: "105 km" },
                { label: "Mejor época", val: "Todo el año" },
            ],
            intro: "Curití reúne la tradición artesanal del fique y atractivos naturales como el balneario de Pescaderito, en un entorno de la provincia Guanentá.",
            secciones: [
                { titulo: "🌊 Pozos del Pescaderito", texto: "El Pescaderito es un conjunto de pozas naturales de agua cristalina, ideales para bañarse y descansar." },
                { titulo: "🧵 Fique y artesanías", texto: "Curití es referente del tejido en fique; talleres locales muestran el proceso y venden productos." },
                { titulo: "🥘 Cocina local", texto: "Los platos típicos, como sopas y asados, acompañan las visitas a las quebradas y pozos." },
                { titulo: "💡 Consejo TourismEasy", texto: "Lleva zapatos antideslizantes para los pozos y no dejes basura: son ecosistemas frágiles." },
            ],
            ctaTexto: "¿Listo para explorar Curití?",
        },
        {
            key: "el-carmen-de-chucuri",
            video: "",
            badge: "Municipio de Santander",
            titulo: "El Carmen de Chucurí",
            subtitulo: "Cacao y montañas en la región de los Yariguíes",
            datos: [
                { label: "Altitud", val: "800 m.s.n.m." },
                { label: "Clima", val: "25°C promedio" },
                { label: "Distancia BGA", val: "140 km" },
                { label: "Mejor época", val: "Dic. a mar." },
            ],
            intro: "El Carmen de Chucurí es reconocido por su tradición cacaotera y por sus paisajes rurales de montaña en el entorno de los Yariguíes.",
            secciones: [
                { titulo: "🍫 Cacao santandereano", texto: "La región es una de las más productoras de cacao de Colombia; hay fincas que enseñan el proceso." },
                { titulo: "🌴 Selva y quebradas", texto: "Las veredas cercanas ofrecen cascadas, quebradas y bosques para caminatas guiadas." },
                { titulo: "🍽️ Chocolate y gastronomía", texto: "Chocolate caliente, dulces y platos campesinos hacen parte de la oferta local." },
                { titulo: "💡 Consejo TourismEasy", texto: "Pide a los productores que te muestren el proceso del cacao: es la mejor manera de entender la región." },
            ],
            ctaTexto: "¿Listo para explorar El Carmen de Chucurí?",
        },
        {
            key: "el-guacamayo",
            video: "",
            badge: "Municipio de Santander",
            titulo: "El Guacamayo",
            subtitulo: "Ríos y vida rural en un paisaje de montaña",
            datos: [
                { label: "Altitud", val: "1.600 m.s.n.m." },
                { label: "Clima", val: "20°C promedio" },
                { label: "Distancia BGA", val: "175 km" },
                { label: "Mejor época", val: "Dic. a feb. y jun. a ago." },
            ],
            intro: "El Guacamayo es un municipio de ambiente rural, con montañas, quebradas y caminos que invitan a descubrir la provincia Comunera con calma.",
            secciones: [
                { titulo: "🌿 Paisaje de montaña", texto: "Caminos rurales entre pastos y cultivos ofrecen un paisaje tranquilo, con aves y buena luz." },
                { titulo: "⛪ Plaza tradicional", texto: "La plaza reúne el comercio y la vida social del pueblo, con un templo sencillo." },
                { titulo: "🍯 Productos del campo", texto: "Panela, queso y otros productos locales se encuentran en tiendas del casco urbano." },
                { titulo: "💡 Consejo TourismEasy", texto: "Visita entre semana si buscas tranquilidad; el fin de semana las fiestas locales pueden llenar la plaza." },
            ],
            ctaTexto: "¿Listo para explorar El Guacamayo?",
        },
        {
            key: "el-penon",
            video: "",
            badge: "Municipio de Santander",
            titulo: "El Peñón",
            subtitulo: "Cavernas y formaciones rocosas del occidente santandereano",
            datos: [
                { label: "Altitud", val: "1.400 m.s.n.m." },
                { label: "Clima", val: "21°C promedio" },
                { label: "Distancia BGA", val: "240 km" },
                { label: "Mejor época", val: "Todo el año" },
            ],
            intro: "El Peñón se distingue por un paisaje de montañas y formaciones rocosas, con cavernas que atraen a quienes exploran la naturaleza.",
            secciones: [
                { titulo: "🍬 Guayaba y bocadillo", texto: "La región vélezana trabaja la guayaba; en El Peñón se puede conocer parte de la cadena productiva." },
                { titulo: "⛪ Centro urbano", texto: "El casco urbano es pequeño y bien conservado, con parque, templo y tiendas de comercio local." },
                { titulo: "🌄 Vistas de cordillera", texto: "Desde caminos veredales se observan cadenas de montañas y valles verdes." },
                { titulo: "💡 Consejo TourismEasy", texto: "Combina la visita con Vélez o Barbosa para armar una ruta de dulces y paisaje." },
            ],
            ctaTexto: "¿Listo para explorar El Peñón?",
        },
        {
            key: "el-playon",
            video: "",
            badge: "Municipio de Santander",
            titulo: "El Playón",
            subtitulo: "Ríos y campos en el norte de Santander",
            datos: [
                { label: "Altitud", val: "1.000 m.s.n.m." },
                { label: "Clima", val: "25°C promedio" },
                { label: "Distancia BGA", val: "65 km" },
                { label: "Mejor época", val: "Todo el año" },
            ],
            intro: "El Playón combina tierras cálidas, ríos y campos agrícolas en una zona de transición entre el área metropolitana y el norte del departamento.",
            secciones: [
                { titulo: "🍍 Cultivos tropicales", texto: "Frutas de clima cálido y cultivos de la zona hacen parte del paisaje y de la gastronomía local." },
                { titulo: "🏞️ Quebradas y miradores", texto: "El entorno ofrece quebradas para refrescarse y puntos para ver las montañas del nororiente." },
                { titulo: "⛪ Parque principal", texto: "El parque es el centro de la vida social del pueblo, con comercio y restaurantes sencillos." },
                { titulo: "💡 Consejo TourismEasy", texto: "Sal temprano desde Bucaramanga; el trayecto es corto, pero aprovechar la mañana mejora la visita." },
            ],
            ctaTexto: "¿Listo para explorar El Playón?",
        },
        {
            key: "encino",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Encino",
            subtitulo: "Bosques andinos y conservación del río Fonce",
            datos: [
                { label: "Altitud", val: "1.600 m.s.n.m." },
                { label: "Clima", val: "21°C promedio" },
                { label: "Distancia BGA", val: "145 km" },
                { label: "Mejor época", val: "Todo el año" },
            ],
            intro: "Encino es puerta de entrada a bosques andinos de gran valor ecológico y al entorno del Santuario de Fauna y Flora Guanentá Alto Río Fonce.",
            secciones: [
                { titulo: "🏛️ Historia comunera", texto: "Encino conserva memoria del movimiento comunero; su plaza y templo son el punto de partida para conocerla." },
                { titulo: "🌿 Rutas veredales", texto: "Los caminos entre fincas permiten ver paisajes de la provincia de Guanentá con tranquilidad." },
                { titulo: "🥣 Cocina tradicional", texto: "Las cocinas locales ofrecen sopas y platos típicos, ideales después de una caminata." },
                { titulo: "💡 Consejo TourismEasy", texto: "Lleva calzado cómodo y consulta con la alcaldía las rutas veredales disponibles." },
            ],
            ctaTexto: "¿Listo para explorar Encino?",
        },
        {
            key: "enciso",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Enciso",
            subtitulo: "Vida campesina entre montañas",
            datos: [
                { label: "Altitud", val: "2.100 m.s.n.m." },
                { label: "Clima", val: "17°C promedio" },
                { label: "Distancia BGA", val: "190 km" },
                { label: "Mejor época", val: "Dic. a feb." },
            ],
            intro: "Enciso ofrece un paisaje de montaña y caminos rurales en la provincia García Rovira, con un ambiente apacible para conocer la vida del campo.",
            secciones: [
                { titulo: "🪨 Arte rupestre", texto: "Enciso es conocido por sus formaciones rocosas y su historia ligada a grupos indígenas de la región." },
                { titulo: "⛪ Plaza y templo", texto: "El casco urbano es pequeño y tradicional, con una plaza que concentra el comercio y las fiestas." },
                { titulo: "🌄 Paisaje de altura", texto: "Los caminos hacia las veredas ofrecen vistas del altiplano y de la cordillera." },
                { titulo: "💡 Consejo TourismEasy", texto: "Lleva ropa de abrigo y calzado de montaña; el clima cambia con rapidez." },
            ],
            ctaTexto: "¿Listo para explorar Enciso?",
        },
        {
            key: "florian",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Florián",
            subtitulo: "La Ventana de Tisquizoque y sus paisajes de montaña",
            datos: [
                { label: "Altitud", val: "1.700 m.s.n.m." },
                { label: "Clima", val: "20°C promedio" },
                { label: "Distancia BGA", val: "250 km" },
                { label: "Mejor época", val: "Todo el año" },
            ],
            intro: "Florián es conocido por la Ventana de Tisquizoque, una cascada asociada a una cueva, y por sus paisajes de montaña en el occidente santandereano.",
            secciones: [
                { titulo: "🍬 Dulces de la región", texto: "El municipio hace parte de la región dulcera de Vélez; las tiendas del parque ofrecen productos locales." },
                { titulo: "⛪ Parque principal", texto: "La plaza y el templo son el corazón del pueblo, con comercio y restaurantes de barrio." },
                { titulo: "🌿 Rutas campesinas", texto: "Caminos entre fincas y quebradas para una caminata tranquila." },
                { titulo: "💡 Consejo TourismEasy", texto: "Confirma con anticipación el transporte, ya que algunas rutas operan en horarios limitados." },
            ],
            ctaTexto: "¿Listo para explorar Florián?",
        },
        {
            key: "floridablanca",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Floridablanca",
            subtitulo: "Obleas, parques y cultura metropolitana",
            datos: [
                { label: "Altitud", val: "950 m.s.n.m." },
                { label: "Clima", val: "24°C promedio" },
                { label: "Distancia BGA", val: "8 km" },
                { label: "Mejor época", val: "Todo el año" },
            ],
            intro: "Floridablanca combina la actividad urbana del área metropolitana de Bucaramanga con parques, espacios culturales y su reconocida tradición de obleas.",
            secciones: [
                { titulo: "🌺 Jardín Botánico Eloy Valenzuela", texto: "El jardín botánico conserva especies nativas de Santander y es una de las visitas más tranquilas del área metropolitana." },
                { titulo: "🏘️ Casco histórico", texto: "El centro de Floridablanca conserva calles, plazas y templos que muestran el crecimiento de la ciudad." },
                { titulo: "🍽️ Gastronomía del área metropolitana", texto: "Restaurantes y plazas de comida ofrecen platos típicos santandereanos a pocos minutos de Bucaramanga." },
                { titulo: "💡 Consejo TourismEasy", texto: "Aprovecha la cercanía con Bucaramanga para visitar el jardín botánico por la mañana." },
            ],
            ctaTexto: "¿Listo para explorar Floridablanca?",
        },
        {
            key: "galan",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Galán",
            subtitulo: "Caminos rurales y colinas de la provincia Comunera",
            datos: [
                { label: "Altitud", val: "1.000 m.s.n.m." },
                { label: "Clima", val: "25°C promedio" },
                { label: "Distancia BGA", val: "120 km" },
                { label: "Mejor época", val: "Dic. a mar." },
            ],
            intro: "Galán ofrece un paisaje de colinas y ambiente campesino, ideal para descubrir una faceta tranquila del territorio santandereano.",
            secciones: [
                { titulo: "🌊 Cerca del río", texto: "El clima cálido y el paisaje de valle invitan a visitas relajadas y a refrescarse en cuerpos de agua cercanos." },
                { titulo: "⛪ Pueblo tradicional", texto: "Un casco urbano pequeño con parque, templo y comercio sencillo." },
                { titulo: "🍽️ Platos regionales", texto: "La oferta gastronómica incluye pescado, carne y jugos de frutas locales." },
                { titulo: "💡 Consejo TourismEasy", texto: "Lleva protector solar y agua; el clima es caluroso durante buena parte del día." },
            ],
            ctaTexto: "¿Listo para explorar Galán?",
        },
        {
            key: "gambita",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Gámbita",
            subtitulo: "Cascadas y naturaleza entre montañas",
            datos: [
                { label: "Altitud", val: "1.700 m.s.n.m." },
                { label: "Clima", val: "19°C promedio" },
                { label: "Distancia BGA", val: "160 km" },
                { label: "Mejor época", val: "Todo el año" },
            ],
            intro: "Gámbita es reconocida por sus cascadas, ríos y paisajes de montaña, atractivos que la convierten en un destino de naturaleza en Santander.",
            secciones: [
                { titulo: "🌿 Paisaje campesino", texto: "Los alrededores ofrecen fincas, cultivos y caminos veredales con vistas amplias del valle." },
                { titulo: "🏞️ Quebradas y senderos", texto: "Pequeñas quebradas y senderos permiten paseos cortos al aire libre." },
                { titulo: "⛪ Plaza y templo", texto: "La plaza es el centro del municipio y se anima con ferias y fiestas locales." },
                { titulo: "💡 Consejo TourismEasy", texto: "Pregunta por las fiestas locales: son una buena forma de conocer la cultura de la región." },
            ],
            ctaTexto: "¿Listo para explorar Gámbita?",
        },
        {
            key: "guaca",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Guaca",
            subtitulo: "Montañas frescas y caminos rurales",
            datos: [
                { label: "Altitud", val: "2.300 m.s.n.m." },
                { label: "Clima", val: "14°C promedio" },
                { label: "Distancia BGA", val: "80 km" },
                { label: "Mejor época", val: "Dic. a feb." },
            ],
            intro: "Guaca ofrece paisajes de montaña y clima fresco en la provincia García Rovira, en un entorno donde predominan las actividades campesinas.",
            secciones: [
                { titulo: "🌫️ Pueblo de altura", texto: "Guaca se siente fresco y tranquilo; sus calles y su plaza invitan a recorrerlo sin prisa." },
                { titulo: "🌿 Rutas hacia el páramo", texto: "Los caminos hacia la parte alta ofrecen paisajes de frailejones y quebradas." },
                { titulo: "🍲 Platos de clima frío", texto: "Los restaurantes sirven caldos y platos calientes con ingredientes locales." },
                { titulo: "💡 Consejo TourismEasy", texto: "Lleva abrigo y botas impermeables, y sal temprano para aprovechar la luz del día." },
            ],
            ctaTexto: "¿Listo para explorar Guaca?",
        },
        {
            key: "guadalupe",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Guadalupe",
            subtitulo: "Las Gachas y las pozas naturales de piedra roja",
            datos: [
                { label: "Altitud", val: "1.350 m.s.n.m." },
                { label: "Clima", val: "22°C promedio" },
                { label: "Distancia BGA", val: "140 km" },
                { label: "Mejor época", val: "Todo el año" },
            ],
            intro: "Guadalupe es conocido por Las Gachas, un cauce rocoso con pozas naturales que forma uno de los paisajes más singulares de la provincia Comunera.",
            secciones: [
                { titulo: "🐴 Cabalgatas y paisaje", texto: "Los paseos por veredas ofrecen vistas de colinas verdes y buenos puntos de fotografía." },
                { titulo: "⛪ Parque principal", texto: "El parque reúne comercio local y celebraciones de la comunidad." },
                { titulo: "🥣 Cocina campesina", texto: "Sopas, arepas y platos caseros que acompañan un recorrido tranquilo por el municipio." },
                { titulo: "💡 Consejo TourismEasy", texto: "Ve con tiempo si piensas combinar la visita con Socorro o Oiba." },
            ],
            ctaTexto: "¿Listo para explorar Guadalupe?",
        },
        {
            key: "guapota",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Guapotá",
            subtitulo: "Un viaje pausado por el valle del Suárez",
            datos: [
                { label: "Altitud", val: "1.300 m.s.n.m." },
                { label: "Clima", val: "21°C promedio" },
                { label: "Distancia BGA", val: "125 km" },
                { label: "Mejor época", val: "Todo el año" },
            ],
            intro: "Guapotá invita a recorrer un entorno tranquilo de la provincia Comunera, con paisajes rurales que se conectan con el valle del río Suárez.",
            secciones: [
                { titulo: "🏞️ Quebradas cercanas", texto: "Pequeñas quebradas y caminos rurales invitan a paseos de medio día." },
                { titulo: "⛪ Centro tradicional", texto: "El casco urbano es pequeño y conserva el aire tranquilo de los pueblos santandereanos." },
                { titulo: "🍬 Productos locales", texto: "En el parque se encuentran dulces y productos del campo para llevar como recuerdo." },
                { titulo: "💡 Consejo TourismEasy", texto: "Visita el pueblo en un día de mercado para ver más actividad local." },
            ],
            ctaTexto: "¿Listo para explorar Guapotá?",
        },
        {
            key: "guavata",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Guavatá",
            subtitulo: "Guayaba y tradiciones campesinas de Vélez",
            datos: [
                { label: "Altitud", val: "2.100 m.s.n.m." },
                { label: "Clima", val: "16°C promedio" },
                { label: "Distancia BGA", val: "245 km" },
                { label: "Mejor época", val: "Dic. a feb." },
            ],
            intro: "Guavatá forma parte de la región de la guayaba y el bocadillo veleño, con paisajes agrícolas y una tradición campesina arraigada.",
            secciones: [
                { titulo: "🍬 Dulces de Guavatá", texto: "Es parte de la región dulcera de Vélez; aquí se elaboran bocadillos y dulces tradicionales." },
                { titulo: "🌄 Paisaje andino", texto: "Sus montañas verdes y caminos veredales ofrecen un entorno fresco, ideal para caminar." },
                { titulo: "⛪ Parque principal", texto: "La plaza y el templo concentran la vida del pueblo y son un buen punto de partida." },
                { titulo: "💡 Consejo TourismEasy", texto: "Lleva chaqueta ligera: las tardes pueden ser frescas y con niebla." },
            ],
            ctaTexto: "¿Listo para explorar Guavatá?",
        },
        {
            key: "guepsa",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Güepsa",
            subtitulo: "Sabores de guayaba en el sur de la provincia",
            datos: [
                { label: "Altitud", val: "1.700 m.s.n.m." },
                { label: "Clima", val: "18°C promedio" },
                { label: "Distancia BGA", val: "225 km" },
                { label: "Mejor época", val: "Dic. a feb. y jun. a ago." },
            ],
            intro: "Güepsa es un municipio agrícola del sur de Santander, vinculado a la producción de guayaba y a la tradición del bocadillo veleño.",
            secciones: [
                { titulo: "⛪ Pueblo tranquilo", texto: "Güepsa es un municipio pequeño, de calles sencillas y plaza acogedora." },
                { titulo: "🏞️ Paisaje del cañón", texto: "Desde algunos puntos se observa el cañón cercano, con laderas de colores secos y verdes." },
                { titulo: "🍬 Dulces y panela", texto: "Panela, bocadillo y dulces de la región acompañan las visitas al pueblo." },
                { titulo: "💡 Consejo TourismEasy", texto: "Planea el viaje con tiempo: las distancias son largas y conviene salir temprano." },
            ],
            ctaTexto: "¿Listo para explorar Güepsa?",
        },
        {
            key: "hato",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Hato",
            subtitulo: "Colinas y tranquilidad en la provincia Comunera",
            datos: [
                { label: "Altitud", val: "1.500 m.s.n.m." },
                { label: "Clima", val: "22°C promedio" },
                { label: "Distancia BGA", val: "135 km" },
                { label: "Mejor época", val: "Todo el año" },
            ],
            intro: "Hato ofrece un ambiente rural de colinas y caminos tranquilos, para quienes quieren conocer municipios pequeños y su vida cotidiana.",
            secciones: [
                { titulo: "🌿 Entorno rural", texto: "Caminos entre fincas y pastizales invitan a paseos tranquilos y a conocer la vida del campo." },
                { titulo: "⛪ Plaza y templo", texto: "La plaza central reúne a los habitantes y es el punto de partida para recorrer el pueblo." },
                { titulo: "🍽️ Comida casera", texto: "Restaurantes pequeños ofrecen platos típicos santandereanos." },
                { titulo: "💡 Consejo TourismEasy", texto: "Lleva efectivo: no todos los comercios reciben pagos electrónicos." },
            ],
            ctaTexto: "¿Listo para explorar Hato?",
        },
        {
            key: "jesus-maria",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Jesús María",
            subtitulo: "Arquitectura tradicional y montaña en Vélez",
            datos: [
                { label: "Altitud", val: "1.600 m.s.n.m." },
                { label: "Clima", val: "20°C promedio" },
                { label: "Distancia BGA", val: "245 km" },
                { label: "Mejor época", val: "Dic. a feb. y jun. a ago." },
            ],
            intro: "Jesús María reúne arquitectura de pueblo y paisajes rurales de montaña en la provincia de Vélez.",
            secciones: [
                { titulo: "🍬 Bocadillo y guayaba", texto: "La región vélezana es dulcera y Jesús María participa con productos locales y de temporada." },
                { titulo: "⛪ Centro urbano", texto: "Un pueblo pequeño y ordenado, de calles tranquilas y parque central." },
                { titulo: "🌿 Rutas campesinas", texto: "Caminos entre fincas ofrecen paisajes de montaña y aire fresco." },
                { titulo: "💡 Consejo TourismEasy", texto: "Comparte transporte o reserva con anticipación: las rutas hacia la provincia de Vélez son largas." },
            ],
            ctaTexto: "¿Listo para explorar Jesús María?",
        },
        {
            key: "jordan",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Jordán",
            subtitulo: "Historia y paisaje en el cañón",
            datos: [
                { label: "Altitud", val: "1.300 m.s.n.m." },
                { label: "Clima", val: "22°C promedio" },
                { label: "Distancia BGA", val: "75 km" },
                { label: "Mejor época", val: "Todo el año" },
            ],
            intro: "Jordán es un pequeño municipio de cañón, apreciado por su entorno de montaña, su ambiente sereno y sus caminos históricos.",
            secciones: [
                { titulo: "🏞️ Cañón y río", texto: "Jordán se asoma a un cañón profundo; sus miradores regalan vistas amplias del río." },
                { titulo: "🏛️ Pueblo histórico", texto: "El casco urbano conserva casas antiguas y calles tranquilas que invitan a recorrerlo a pie." },
                { titulo: "🥾 Caminos antiguos", texto: "Algunos senderos recuerdan viejas rutas de comercio entre pueblos de la zona." },
                { titulo: "💡 Consejo TourismEasy", texto: "Combina Jordán con Los Santos y Aratoca en una ruta de día completo." },
            ],
            ctaTexto: "¿Listo para explorar Jordán?",
        },
        {
            key: "la-belleza",
            video: "",
            badge: "Municipio de Santander",
            titulo: "La Belleza",
            subtitulo: "Montañas verdes y quebradas del occidente",
            datos: [
                { label: "Altitud", val: "1.750 m.s.n.m." },
                { label: "Clima", val: "18°C promedio" },
                { label: "Distancia BGA", val: "255 km" },
                { label: "Mejor época", val: "Dic. a feb. y jun. a ago." },
            ],
            intro: "La Belleza ofrece un paisaje de montaña, quebradas y vegetación en el occidente de Santander, con una marcada vida rural.",
            secciones: [
                { titulo: "🍍 Cultivos de la provincia", texto: "La Belleza hace parte de la provincia de Vélez; sus fincas producen frutas, caña y café." },
                { titulo: "⛪ Parque principal", texto: "El parque central y el templo son el punto de encuentro del municipio." },
                { titulo: "🌿 Caminos veredales", texto: "Los senderos entre fincas permiten ver aves y paisajes de montaña verde." },
                { titulo: "💡 Consejo TourismEasy", texto: "Viaja con tiempo: es un destino alejado y las vías pueden demorar más de lo esperado." },
            ],
            ctaTexto: "¿Listo para explorar La Belleza?",
        },
        {
            key: "landazuri",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Landázuri",
            subtitulo: "Cacao y sabores del Magdalena Medio",
            datos: [
                { label: "Altitud", val: "1.100 m.s.n.m." },
                { label: "Clima", val: "24°C promedio" },
                { label: "Distancia BGA", val: "175 km" },
                { label: "Mejor época", val: "Todo el año" },
            ],
            intro: "Landázuri es reconocido por el cacao y combina paisajes cálidos y rurales de transición hacia el Magdalena Medio.",
            secciones: [
                { titulo: "🍫 Cacao y café", texto: "Landázuri es zona de cacao, café y frutas; algunas fincas permiten conocer el proceso." },
                { titulo: "🌴 Cascadas y quebradas", texto: "Varias quebradas y caídas de agua cercanas ofrecen paseos naturales con guías de la zona." },
                { titulo: "⛪ Parque principal", texto: "El parque central reúne comercio y restaurantes con platos típicos." },
                { titulo: "💡 Consejo TourismEasy", texto: "Pregunta por rutas de cascadas con guía local y revisa el clima antes de salir." },
            ],
            ctaTexto: "¿Listo para explorar Landázuri?",
        },
        {
            key: "la-paz",
            video: "",
            badge: "Municipio de Santander",
            titulo: "La Paz",
            subtitulo: "Tradición rural entre montañas de Vélez",
            datos: [
                { label: "Altitud", val: "1.700 m.s.n.m." },
                { label: "Clima", val: "19°C promedio" },
                { label: "Distancia BGA", val: "205 km" },
                { label: "Mejor época", val: "Dic. a feb. y jun. a ago." },
            ],
            intro: "La Paz es un municipio de caminos rurales y montañas, donde las tradiciones campesinas acompañan el paisaje de la provincia de Vélez.",
            secciones: [
                { titulo: "🍬 Dulces tradicionales", texto: "Los dulces de guayaba y panela hacen parte de la economía local y se encuentran en el parque." },
                { titulo: "⛪ Plaza y templo", texto: "La plaza es el centro del municipio y el escenario de sus fiestas y ferias." },
                { titulo: "🌿 Rutas campesinas", texto: "Caminos de herradura ofrecen vistas del paisaje y paradas para charlar con campesinos." },
                { titulo: "💡 Consejo TourismEasy", texto: "Prefiere visitar en época seca para que los caminos veredales estén en mejor estado." },
            ],
            ctaTexto: "¿Listo para explorar La Paz?",
        },
        {
            key: "lebrija",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Lebrija",
            subtitulo: "Piña, campo y paisajes cálidos",
            datos: [
                { label: "Altitud", val: "1.000 m.s.n.m." },
                { label: "Clima", val: "26°C promedio" },
                { label: "Distancia BGA", val: "18 km" },
                { label: "Mejor época", val: "Todo el año" },
            ],
            intro: "Lebrija es conocida por sus cultivos de piña y su clima cálido, además de su cercanía al área metropolitana de Bucaramanga.",
            secciones: [
                { titulo: "🍍 Capital de la piña", texto: "Lebrija es famosa por sus cultivos de piña; hay fincas y puestos donde se compra fruta fresca." },
                { titulo: "🛩️ Cerca de Bucaramanga", texto: "Su cercanía con la capital hace posible una visita de medio día para probar jugos y platos típicos." },
                { titulo: "🌄 Paisaje de valle", texto: "Los alrededores ofrecen vistas del valle y caminos veredales entre cultivos." },
                { titulo: "💡 Consejo TourismEasy", texto: "Compra piña directamente en las fincas o puestos del camino: es más fresca y económica." },
            ],
            ctaTexto: "¿Listo para explorar Lebrija?",
        },
        {
            key: "macaravita",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Macaravita",
            subtitulo: "Montaña y vida campesina en García Rovira",
            datos: [
                { label: "Altitud", val: "2.300 m.s.n.m." },
                { label: "Clima", val: "14°C promedio" },
                { label: "Distancia BGA", val: "230 km" },
                { label: "Mejor época", val: "Dic. a feb." },
            ],
            intro: "Macaravita ofrece paisajes de montaña y caminos rurales en una zona de clima fresco del oriente santandereano.",
            secciones: [
                { titulo: "⛪ Pueblo de altura", texto: "Un caserío pequeño y tranquilo en la parte alta de García Rovira, con plaza y templo sencillos." },
                { titulo: "🥔 Agricultura de páramo", texto: "La papa y otros cultivos de clima frío hacen parte del paisaje y de la cocina local." },
                { titulo: "🌫️ Caminos entre niebla", texto: "Senderos hacia las veredas ofrecen paisajes de montaña con frailejones y quebradas." },
                { titulo: "💡 Consejo TourismEasy", texto: "Lleva abrigo, botas impermeables y confirma alojamiento con anticipación." },
            ],
            ctaTexto: "¿Listo para explorar Macaravita?",
        },
        {
            key: "malaga",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Málaga",
            subtitulo: "Centro urbano y tradiciones de García Rovira",
            datos: [
                { label: "Altitud", val: "2.200 m.s.n.m." },
                { label: "Clima", val: "16°C promedio" },
                { label: "Distancia BGA", val: "215 km" },
                { label: "Mejor época", val: "Dic. a feb." },
            ],
            intro: "Málaga es un centro urbano de la provincia García Rovira, con servicios regionales, parque principal y arquitectura tradicional.",
            secciones: [
                { titulo: "⛪ Catedral y parque", texto: "Málaga es la capital de García Rovira; su parque, catedral y calles tradicionales marcan el ritmo de la ciudad." },
                { titulo: "🌄 Páramo del Almorzadero", texto: "Desde Málaga se organizan salidas al páramo, con frailejones, lagunas y paisajes de alta montaña." },
                { titulo: "🍖 Cocina de montaña", texto: "La cabrita, el cabrito y las sopas calientes son parte de la oferta gastronómica." },
                { titulo: "💡 Consejo TourismEasy", texto: "Lleva abrigo y reserva con tiempo el alojamiento durante las fiestas locales." },
            ],
            ctaTexto: "¿Listo para explorar Málaga?",
        },
        {
            key: "matanza",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Matanza",
            subtitulo: "Paisajes andinos cerca de Bucaramanga",
            datos: [
                { label: "Altitud", val: "2.200 m.s.n.m." },
                { label: "Clima", val: "14°C promedio" },
                { label: "Distancia BGA", val: "45 km" },
                { label: "Mejor época", val: "Dic. a feb." },
            ],
            intro: "Matanza forma parte de Soto Norte y ofrece un entorno de montañas, quebradas y caminos rurales no muy lejos del área metropolitana.",
            secciones: [
                { titulo: "⛏️ Pueblo minero", texto: "Matanza ha estado vinculado a la minería; su gente comparte historias de la región." },
                { titulo: "🌫️ Clima fresco", texto: "Las montañas verdes y el aire fresco hacen de las caminatas una experiencia agradable." },
                { titulo: "🍲 Caldos y platos calientes", texto: "Pequeños restaurantes sirven platos reconfortantes para el clima frío." },
                { titulo: "💡 Consejo TourismEasy", texto: "Combina la visita con California o Vetas para una ruta de pueblos mineros." },
            ],
            ctaTexto: "¿Listo para explorar Matanza?",
        },
        {
            key: "mogotes",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Mogotes",
            subtitulo: "Ríos y montañas de la provincia Guanentá",
            datos: [
                { label: "Altitud", val: "1.700 m.s.n.m." },
                { label: "Clima", val: "19°C promedio" },
                { label: "Distancia BGA", val: "130 km" },
                { label: "Mejor época", val: "Todo el año" },
            ],
            intro: "Mogotes combina ríos, cascadas y paisajes de montaña, una invitación a explorar la naturaleza de la provincia Guanentá.",
            secciones: [
                { titulo: "🌳 Parque Regional Cerro de la Judía", texto: "Las rutas de naturaleza permiten conocer bosques de niebla y miradores con guías locales." },
                { titulo: "🏞️ Cascadas y quebradas", texto: "Las caídas de agua cercanas son ideales para paseos de medio día." },
                { titulo: "🍽️ Cocina campesina", texto: "Los restaurantes del pueblo ofrecen platos tradicionales con ingredientes de las fincas." },
                { titulo: "💡 Consejo TourismEasy", texto: "Contrata guías locales para las rutas de naturaleza y lleva ropa impermeable." },
            ],
            ctaTexto: "¿Listo para explorar Mogotes?",
        },
        {
            key: "molagavita",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Molagavita",
            subtitulo: "Caminos campesinos y montañas frescas",
            datos: [
                { label: "Altitud", val: "2.000 m.s.n.m." },
                { label: "Clima", val: "16°C promedio" },
                { label: "Distancia BGA", val: "200 km" },
                { label: "Mejor época", val: "Dic. a feb." },
            ],
            intro: "Molagavita conserva un ambiente tranquilo de montaña y caminos rurales en la provincia García Rovira.",
            secciones: [
                { titulo: "⛪ Pueblo andino", texto: "Un municipio tradicional de calles empinadas, plaza y templo sencillo." },
                { titulo: "🥔 Cultivos de clima frío", texto: "Papa, trigo y hortalizas hacen parte del paisaje y de la economía local." },
                { titulo: "🌄 Miradores", texto: "Desde algunos puntos se ve el altiplano y la cordillera, con buena luz al amanecer." },
                { titulo: "💡 Consejo TourismEasy", texto: "Lleva ropa abrigada y calzado de montaña: las calles son empinadas." },
            ],
            ctaTexto: "¿Listo para explorar Molagavita?",
        },
        {
            key: "ocamonte",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Ocamonte",
            subtitulo: "Paisajes de caña panelera y tradición rural",
            datos: [
                { label: "Altitud", val: "1.500 m.s.n.m." },
                { label: "Clima", val: "21°C promedio" },
                { label: "Distancia BGA", val: "150 km" },
                { label: "Mejor época", val: "Todo el año" },
            ],
            intro: "Ocamonte se reconoce por la producción de caña panelera y sus paisajes agrícolas en la provincia Guanentá.",
            secciones: [
                { titulo: "🌿 Rutas de naturaleza", texto: "Cerca de Charalá se encuentran bosques y quebradas que se recorren con guías locales." },
                { titulo: "⛪ Parque principal", texto: "El centro del municipio es pequeño y tranquilo, con tiendas y restaurantes de barrio." },
                { titulo: "🍬 Dulces del campo", texto: "Dulces y productos de la zona se venden en tiendas del parque." },
                { titulo: "💡 Consejo TourismEasy", texto: "Combina Ocamonte con Charalá para armar una ruta de dos días por Guanentá." },
            ],
            ctaTexto: "¿Listo para explorar Ocamonte?",
        },
        {
            key: "oiba",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Oiba",
            subtitulo: "Panela y vida de pueblo en la provincia Comunera",
            datos: [
                { label: "Altitud", val: "1.400 m.s.n.m." },
                { label: "Clima", val: "22°C promedio" },
                { label: "Distancia BGA", val: "120 km" },
                { label: "Mejor época", val: "Todo el año" },
            ],
            intro: "Oiba es un municipio de tradición panelera, con paisajes rurales y una ubicación que conecta distintos destinos del sur de Santander.",
            secciones: [
                { titulo: "🍬 Panela y dulces", texto: "Oiba es conocida por su producción panelera; algunos trapiches reciben visitantes." },
                { titulo: "🏞️ Quebradas y miradores", texto: "Pequeñas quebradas y puntos de vista invitan a paseos cortos." },
                { titulo: "⛪ Plaza y templo", texto: "La plaza central es el punto de encuentro de los habitantes, con comercio y comida típica." },
                { titulo: "💡 Consejo TourismEasy", texto: "Pregunta en el parque por trapiches abiertos al público y la época de molienda." },
            ],
            ctaTexto: "¿Listo para explorar Oiba?",
        },
        {
            key: "onzaga",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Onzaga",
            subtitulo: "Montañas y tradiciones del oriente santandereano",
            datos: [
                { label: "Altitud", val: "1.700 m.s.n.m." },
                { label: "Clima", val: "18°C promedio" },
                { label: "Distancia BGA", val: "195 km" },
                { label: "Mejor época", val: "Todo el año" },
            ],
            intro: "Onzaga ofrece paisajes de montaña y tradiciones campesinas en la provincia García Rovira, con un ambiente de pueblo tranquilo.",
            secciones: [
                { titulo: "🏛️ Historia comunera", texto: "Onzaga conserva memoria de episodios históricos de la región, visibles en su plaza y templo." },
                { titulo: "🌿 Caminos de arriería", texto: "Senderos que unían pueblos cercanos hoy sirven para caminatas con vistas al valle." },
                { titulo: "🍲 Comida campesina", texto: "Sopas, arepas y carnes asadas forman parte de la oferta local." },
                { titulo: "💡 Consejo TourismEasy", texto: "Confirma con tiempo el transporte; algunas rutas son limitadas y salen temprano." },
            ],
            ctaTexto: "¿Listo para explorar Onzaga?",
        },
        {
            key: "palmar",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Palmar",
            subtitulo: "Un destino pequeño para recorrer sin afán",
            datos: [
                { label: "Altitud", val: "1.400 m.s.n.m." },
                { label: "Clima", val: "22°C promedio" },
                { label: "Distancia BGA", val: "130 km" },
                { label: "Mejor época", val: "Todo el año" },
            ],
            intro: "Palmar es un municipio de escala pequeña y ambiente tranquilo, con caminos rurales y tradiciones de la provincia Comunera.",
            secciones: [
                { titulo: "🌿 Campo santandereano", texto: "Fincas, cultivos y caminos veredales conforman un paisaje tranquilo, ideal para caminar." },
                { titulo: "⛪ Parque principal", texto: "El casco urbano es pequeño y hospitalario, con tienda, templo y parque donde se reúne la comunidad." },
                { titulo: "🍽️ Platos tradicionales", texto: "Sopas, arepas y carnes asadas son parte de la mesa local." },
                { titulo: "💡 Consejo TourismEasy", texto: "Lleva efectivo y confirma con anticipación horarios de transporte intermunicipal." },
            ],
            ctaTexto: "¿Listo para explorar Palmar?",
        },
        {
            key: "palmas-del-socorro",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Palmas del Socorro",
            subtitulo: "Paisaje rural junto a la historia comunera",
            datos: [
                { label: "Altitud", val: "1.200 m.s.n.m." },
                { label: "Clima", val: "22°C promedio" },
                { label: "Distancia BGA", val: "130 km" },
                { label: "Mejor época", val: "Todo el año" },
            ],
            intro: "Palmas del Socorro combina caminos y paisajes de campo con la memoria histórica de la provincia Comunera.",
            secciones: [
                { titulo: "🍊 Cultivos frutales", texto: "Los alrededores producen frutas de clima templado que se venden en el parque." },
                { titulo: "⛪ Plaza y templo", texto: "Un centro urbano pequeño y limpio, ideal para recorrer en poco tiempo." },
                { titulo: "🏞️ Quebradas cercanas", texto: "Pequeños cuerpos de agua y caminos rurales invitan a paseos cortos." },
                { titulo: "💡 Consejo TourismEasy", texto: "Combina la visita con Socorro, que queda a pocos kilómetros, para una ruta histórica y de campo." },
            ],
            ctaTexto: "¿Listo para explorar Palmas del Socorro?",
        },
        {
            key: "paramo",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Páramo",
            subtitulo: "Cuevas y naturaleza cerca de San Gil",
            datos: [
                { label: "Altitud", val: "1.400 m.s.n.m." },
                { label: "Clima", val: "21°C promedio" },
                { label: "Distancia BGA", val: "125 km" },
                { label: "Mejor época", val: "Todo el año" },
            ],
            intro: "Páramo es conocido por atractivos naturales de la provincia Guanentá, como la Cueva del Indio y la cascada de Juan Curí.",
            secciones: [
                { titulo: "🏞️ Cañón y cuevas", texto: "Los alrededores ofrecen miradores y formaciones naturales cercanas al valle del río." },
                { titulo: "🥘 Cocina típica", texto: "Restaurantes pequeños sirven platos santandereanos como el cabrito y la mazamorra." },
                { titulo: "⛪ Centro tranquilo", texto: "Un pueblo de calles amplias y casas bajas, perfecto para una parada breve en una ruta hacia San Gil." },
                { titulo: "💡 Consejo TourismEasy", texto: "Aprovecha que está cerca de San Gil para combinarlo con Barichara o Curití." },
            ],
            ctaTexto: "¿Listo para explorar Páramo?",
        },
        {
            key: "piedecuesta",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Piedecuesta",
            subtitulo: "Dulces tradicionales y miradores de montaña",
            datos: [
                { label: "Altitud", val: "1.000 m.s.n.m." },
                { label: "Clima", val: "24°C promedio" },
                { label: "Distancia BGA", val: "18 km" },
                { label: "Mejor época", val: "Todo el año" },
            ],
            intro: "Piedecuesta mezcla vida urbana y paisajes de montaña, y es conocida por sus dulces tradicionales y su cercanía a la Mesa de Ruitoque.",
            secciones: [
                { titulo: "🍬 Cabello de ángel y obleas", texto: "Piedecuesta es famosa por sus dulces de cabello de ángel y por el fique, símbolos de la región." },
                { titulo: "🏞️ Cañón del río Pescadero", texto: "Los miradores y senderos cercanos permiten disfrutar del paisaje a pocos minutos del casco urbano." },
                { titulo: "🧵 Artesanías en fique", texto: "Talleres locales muestran el trabajo con fique y venden bolsos, cestas y otros productos." },
                { titulo: "💡 Consejo TourismEasy", texto: "Visita el parque principal el domingo: hay mercado, música y buen ambiente." },
            ],
            ctaTexto: "¿Listo para explorar Piedecuesta?",
        },
        {
            key: "pinchote",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Pinchote",
            subtitulo: "Historia de Antonia Santos y paisaje de Guanentá",
            datos: [
                { label: "Altitud", val: "1.300 m.s.n.m." },
                { label: "Clima", val: "22°C promedio" },
                { label: "Distancia BGA", val: "115 km" },
                { label: "Mejor época", val: "Todo el año" },
            ],
            intro: "Pinchote es reconocido como tierra natal de Antonia Santos y conserva una memoria histórica ligada a la independencia.",
            secciones: [
                { titulo: "🏞️ Cerca de San Gil", texto: "Su cercanía con San Gil lo hace ideal para visitas tranquilas en medio de rutas de aventura." },
                { titulo: "🐴 Cabalgatas", texto: "Los paseos por caminos rurales ofrecen vistas del valle del Fonce y de las montañas vecinas." },
                { titulo: "🍽️ Cocina tradicional", texto: "Los restaurantes del casco urbano ofrecen platos típicos santandereanos." },
                { titulo: "💡 Consejo TourismEasy", texto: "Sal temprano desde San Gil y regresa antes del anochecer si no tienes alojamiento reservado." },
            ],
            ctaTexto: "¿Listo para explorar Pinchote?",
        },
        {
            key: "puente-nacional",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Puente Nacional",
            subtitulo: "Un lugar clave en la historia de la independencia",
            datos: [
                { label: "Altitud", val: "1.600 m.s.n.m." },
                { label: "Clima", val: "20°C promedio" },
                { label: "Distancia BGA", val: "235 km" },
                { label: "Mejor época", val: "Todo el año" },
            ],
            intro: "Puente Nacional guarda memoria de acontecimientos importantes de la independencia y forma parte de los paisajes de la provincia de Vélez.",
            secciones: [
                { titulo: "🍬 Guayaba y bocadillo", texto: "Puente Nacional es un epicentro de la guayaba y el bocadillo; fábricas y tiendas reciben visitantes." },
                { titulo: "🌉 Puente y paisaje", texto: "El puente histórico y el paisaje de valle son puntos de referencia para fotografiar la región." },
                { titulo: "⛪ Parque principal", texto: "El parque central reúne ferias, comercio y templo, con ambiente cálido y familiar." },
                { titulo: "💡 Consejo TourismEasy", texto: "Compra bocadillo en los puestos del parque o en fábricas locales para llevar de recuerdo." },
            ],
            ctaTexto: "¿Listo para explorar Puente Nacional?",
        },
        {
            key: "puerto-parra",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Puerto Parra",
            subtitulo: "Ríos y naturaleza en el Magdalena Medio",
            datos: [
                { label: "Altitud", val: "100 m.s.n.m." },
                { label: "Clima", val: "29°C promedio" },
                { label: "Distancia BGA", val: "195 km" },
                { label: "Mejor época", val: "Dic. a mar." },
            ],
            intro: "Puerto Parra es un municipio cálido del Magdalena Medio, con paisajes de ríos, humedales y bosque.",
            secciones: [
                { titulo: "🛶 Río Magdalena", texto: "El río marca la vida del pueblo; paseos en lancha y pesca artesanal ofrecen una mirada local." },
                { titulo: "🌾 Paisaje ganadero", texto: "Llanuras, pastizales y humedales caracterizan el entorno rural." },
                { titulo: "🍖 Comida ribereña", texto: "Pescado, carne asada y jugos tropicales son la base de la oferta gastronómica." },
                { titulo: "💡 Consejo TourismEasy", texto: "Lleva repelente y ropa ligera; el calor y los insectos son habituales." },
            ],
            ctaTexto: "¿Listo para explorar Puerto Parra?",
        },
        {
            key: "puerto-wilches",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Puerto Wilches",
            subtitulo: "Cultura ribereña a orillas del Magdalena",
            datos: [
                { label: "Altitud", val: "80 m.s.n.m." },
                { label: "Clima", val: "28°C promedio" },
                { label: "Distancia BGA", val: "110 km" },
                { label: "Mejor época", val: "Dic. a mar." },
            ],
            intro: "Puerto Wilches se extiende junto al río Magdalena y conserva una vida local estrechamente relacionada con el río y el transporte fluvial.",
            secciones: [
                { titulo: "🌅 Malecón y río", texto: "El malecón sobre el Magdalena es el punto de encuentro del municipio, con atardeceres abiertos." },
                { titulo: "🛶 Ciénagas y humedales", texto: "Paseos en lancha por ciénagas permiten observar aves y fauna, con guías locales." },
                { titulo: "🍤 Pescado fresco", texto: "Los restaurantes del malecón ofrecen pescado del río con acompañamientos tradicionales." },
                { titulo: "💡 Consejo TourismEasy", texto: "Contrata los paseos en lancha con operadores locales y verifica que lleven chalecos." },
            ],
            ctaTexto: "¿Listo para explorar Puerto Wilches?",
        },
        {
            key: "rionegro",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Rionegro",
            subtitulo: "Paisajes rurales y cultivos de Santander",
            datos: [
                { label: "Altitud", val: "700 m.s.n.m." },
                { label: "Clima", val: "25°C promedio" },
                { label: "Distancia BGA", val: "40 km" },
                { label: "Mejor época", val: "Todo el año" },
            ],
            intro: "Rionegro es un municipio extenso con diversidad de climas, montañas, fincas y actividad agrícola.",
            secciones: [
                { titulo: "🍍 Tierra de cultivos", texto: "Rionegro es zona de cultivos de piña y cítricos; hay productores que ofrecen degustaciones." },
                { titulo: "🏞️ Quebradas y fincas", texto: "Los senderos entre fincas y quebradas invitan a paseos de medio día." },
                { titulo: "⛪ Parque principal", texto: "El parque central concentra restaurantes, comercio y la vida social del municipio." },
                { titulo: "💡 Consejo TourismEasy", texto: "Es un destino cercano: ideal para una excursión de un día desde Bucaramanga." },
            ],
            ctaTexto: "¿Listo para explorar Rionegro?",
        },
        {
            key: "sabana-de-torres",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Sabana de Torres",
            subtitulo: "Humedales y naturaleza del Magdalena Medio",
            datos: [
                { label: "Altitud", val: "120 m.s.n.m." },
                { label: "Clima", val: "28°C promedio" },
                { label: "Distancia BGA", val: "70 km" },
                { label: "Mejor época", val: "Dic. a mar." },
            ],
            intro: "Sabana de Torres ofrece paisajes cálidos, humedales y actividad agrícola en el Magdalena Medio santandereano.",
            secciones: [
                { titulo: "🌴 Paisaje de palma y ganadería", texto: "El municipio se destaca por cultivos agroindustriales y ganadería, que definen su paisaje." },
                { titulo: "🛶 Ríos y ciénagas", texto: "Los cuerpos de agua cercanos permiten paseos y observación de aves." },
                { titulo: "🍽️ Cocina del Magdalena Medio", texto: "Carne, pescado y jugos tropicales dominan la mesa local." },
                { titulo: "💡 Consejo TourismEasy", texto: "Lleva ropa ligera y protector solar; el calor es intenso en las horas del mediodía." },
            ],
            ctaTexto: "¿Listo para explorar Sabana de Torres?",
        },
        {
            key: "san-andres",
            video: "",
            badge: "Municipio de Santander",
            titulo: "San Andrés",
            subtitulo: "La Laguna de Ortices y las montañas de García Rovira",
            datos: [
                { label: "Altitud", val: "1.800 m.s.n.m." },
                { label: "Clima", val: "18°C promedio" },
                { label: "Distancia BGA", val: "165 km" },
                { label: "Mejor época", val: "Todo el año" },
            ],
            intro: "San Andrés combina paisaje de montaña con la Laguna de Ortices, un referente natural de la provincia García Rovira.",
            secciones: [
                { titulo: "🌄 Paisaje de García Rovira", texto: "San Andrés se asienta entre montañas verdes, con vistas del altiplano y valles cercanos." },
                { titulo: "⛪ Pueblo tradicional", texto: "El casco urbano es pequeño y tranquilo, con plaza central y templo." },
                { titulo: "🥔 Cultivos andinos", texto: "La papa, el maíz y otros cultivos hacen parte de la economía y de la cocina local." },
                { titulo: "💡 Consejo TourismEasy", texto: "Prefiere la mañana para caminar; por la tarde puede haber niebla." },
            ],
            ctaTexto: "¿Listo para explorar San Andrés?",
        },
        {
            key: "san-benito",
            video: "",
            badge: "Municipio de Santander",
            titulo: "San Benito",
            subtitulo: "Guayaba y tradición campesina veleña",
            datos: [
                { label: "Altitud", val: "1.400 m.s.n.m." },
                { label: "Clima", val: "22°C promedio" },
                { label: "Distancia BGA", val: "200 km" },
                { label: "Mejor época", val: "Todo el año" },
            ],
            intro: "San Benito forma parte de la región de guayaba y bocadillo de la provincia de Vélez, con paisajes y costumbres de campo.",
            secciones: [
                { titulo: "🍬 Dulces y panela", texto: "La región vélezana es dulcera; en San Benito se encuentran panela, bocadillo y otros dulces." },
                { titulo: "⛪ Parque principal", texto: "El centro del municipio reúne iglesia, comercio y restaurantes sencillos." },
                { titulo: "🌿 Rutas campesinas", texto: "Los caminos entre fincas ofrecen vistas amplias y encuentros con el campo." },
                { titulo: "💡 Consejo TourismEasy", texto: "Consulta con la comunidad qué fincas aceptan visitas y respeta los espacios de trabajo." },
            ],
            ctaTexto: "¿Listo para explorar San Benito?",
        },
        {
            key: "san-joaquin",
            video: "",
            badge: "Municipio de Santander",
            titulo: "San Joaquín",
            subtitulo: "Un recorrido pausado por la montaña guanentina",
            datos: [
                { label: "Altitud", val: "1.700 m.s.n.m." },
                { label: "Clima", val: "18°C promedio" },
                { label: "Distancia BGA", val: "140 km" },
                { label: "Mejor época", val: "Todo el año" },
            ],
            intro: "San Joaquín es un municipio de montaña y tradición campesina en la provincia Guanentá, adecuado para una visita tranquila.",
            secciones: [
                { titulo: "🌄 Pueblo de montaña", texto: "San Joaquín se levanta entre colinas verdes, con vistas despejadas en días soleados." },
                { titulo: "🏛️ Historia local", texto: "Su plaza y sus calles cuentan relatos de los antiguos habitantes del cañón." },
                { titulo: "🍲 Platos calientes", texto: "Sopas, arepas y carnes asadas ofrecen buena comida para el clima fresco." },
                { titulo: "💡 Consejo TourismEasy", texto: "Lleva chaqueta ligera y confirma con la alcaldía las rutas veredales disponibles." },
            ],
            ctaTexto: "¿Listo para explorar San Joaquín?",
        },
        {
            key: "san-jose-de-miranda",
            video: "",
            badge: "Municipio de Santander",
            titulo: "San José de Miranda",
            subtitulo: "Arquitectura y montañas de García Rovira",
            datos: [
                { label: "Altitud", val: "1.700 m.s.n.m." },
                { label: "Clima", val: "19°C promedio" },
                { label: "Distancia BGA", val: "205 km" },
                { label: "Mejor época", val: "Todo el año" },
            ],
            intro: "San José de Miranda ofrece un ambiente de pueblo tradicional y paisajes de montaña en la provincia García Rovira.",
            secciones: [
                { titulo: "🌿 Paisaje campesino", texto: "Fincas, caminos y quebradas rodean el casco urbano, con rutas aptas para caminar." },
                { titulo: "⛪ Plaza y templo", texto: "Un pueblo pequeño y acogedor donde la plaza reúne la vida social." },
                { titulo: "🍬 Productos de la tierra", texto: "Panela, café y dulces de la zona se pueden comprar directamente a productores." },
                { titulo: "💡 Consejo TourismEasy", texto: "Lleva efectivo y calzado cómodo; los caminos veredales pueden estar húmedos." },
            ],
            ctaTexto: "¿Listo para explorar San José de Miranda?",
        },
        {
            key: "san-miguel",
            video: "",
            badge: "Municipio de Santander",
            titulo: "San Miguel",
            subtitulo: "Paisaje rural de montaña en el oriente",
            datos: [
                { label: "Altitud", val: "2.000 m.s.n.m." },
                { label: "Clima", val: "16°C promedio" },
                { label: "Distancia BGA", val: "205 km" },
                { label: "Mejor época", val: "Dic. a feb." },
            ],
            intro: "San Miguel es un municipio de ambiente rural y montañoso, donde los caminos y la agricultura marcan la vida cotidiana.",
            secciones: [
                { titulo: "🌄 Mirador del altiplano", texto: "Las veredas altas del municipio ofrecen amplias vistas del altiplano de García Rovira." },
                { titulo: "🥔 Agricultura de clima frío", texto: "Cultivos de papa y hortalizas definen el paisaje; hay productores que reciben visitantes." },
                { titulo: "⛪ Parque y templo", texto: "El casco urbano es pequeño y tradicional, con una plaza que anima las fiestas." },
                { titulo: "💡 Consejo TourismEasy", texto: "Lleva abrigo y botas de caminata; las noches pueden ser muy frías." },
            ],
            ctaTexto: "¿Listo para explorar San Miguel?",
        },
        {
            key: "san-vicente-de-chucuri",
            video: "",
            badge: "Municipio de Santander",
            titulo: "San Vicente de Chucurí",
            subtitulo: "Cacao y naturaleza en la tierra de los Yariguíes",
            datos: [
                { label: "Altitud", val: "600 m.s.n.m." },
                { label: "Clima", val: "27°C promedio" },
                { label: "Distancia BGA", val: "95 km" },
                { label: "Mejor época", val: "Dic. a mar." },
            ],
            intro: "San Vicente de Chucurí es reconocido por el cacao y por sus paisajes vinculados a la Serranía de los Yariguíes.",
            secciones: [
                { titulo: "🍫 Capital del cacao", texto: "San Vicente produce uno de los mejores cacaos del país; hay fincas que enseñan el proceso." },
                { titulo: "🌴 Cascadas y selva", texto: "Rutas cercanas llevan a caídas de agua y bosques con guías locales." },
                { titulo: "🍽️ Chocolate y gastronomía", texto: "Chocolate caliente, dulces de cacao y platos campesinos acompañan la visita." },
                { titulo: "💡 Consejo TourismEasy", texto: "Pide una visita guiada a una finca cacaotera: es la mejor forma de conocer el producto." },
            ],
            ctaTexto: "¿Listo para explorar San Vicente de Chucurí?",
        },
        {
            key: "santa-barbara",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Santa Bárbara",
            subtitulo: "Montañas frescas en el entorno metropolitano",
            datos: [
                { label: "Altitud", val: "1.700 m.s.n.m." },
                { label: "Clima", val: "19°C promedio" },
                { label: "Distancia BGA", val: "50 km" },
                { label: "Mejor época", val: "Todo el año" },
            ],
            intro: "Santa Bárbara ofrece un paisaje de montaña y clima fresco en las cercanías del área metropolitana de Bucaramanga.",
            secciones: [
                { titulo: "🌿 Paisaje de montaña", texto: "Fincas de café y cultivos de clima templado rodean el municipio, con caminos veredales para caminar." },
                { titulo: "⛪ Parque principal", texto: "El parque central y el templo concentran la vida del pueblo." },
                { titulo: "🍽️ Cocina campesina", texto: "Los restaurantes del casco urbano sirven platos típicos con ingredientes locales." },
                { titulo: "💡 Consejo TourismEasy", texto: "Es un destino cercano a Bucaramanga: ideal para una excursión de un día." },
            ],
            ctaTexto: "¿Listo para explorar Santa Bárbara?",
        },
        {
            key: "santa-helena-del-opon",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Santa Helena del Opón",
            subtitulo: "Bosques y montañas de la Serranía de los Yariguíes",
            datos: [
                { label: "Altitud", val: "700 m.s.n.m." },
                { label: "Clima", val: "24°C promedio" },
                { label: "Distancia BGA", val: "170 km" },
                { label: "Mejor época", val: "Dic. a mar." },
            ],
            intro: "Santa Helena del Opón se encuentra en un territorio de bosques y montañas relacionado con la Serranía de los Yariguíes y el río Opón.",
            secciones: [
                { titulo: "🌴 Selva y quebradas", texto: "Los alrededores ofrecen bosques tropicales, quebradas y caminos rurales, con guías locales." },
                { titulo: "🍫 Cacao y café", texto: "Fincas productoras de cacao y café muestran parte del proceso de cultivo." },
                { titulo: "⛪ Pueblo tranquilo", texto: "Un caserío cálido con parque y comercio local, ideal para una parada en la ruta hacia el Magdalena Medio." },
                { titulo: "💡 Consejo TourismEasy", texto: "Lleva repelente y ropa fresca; las lluvias son frecuentes en la selva." },
            ],
            ctaTexto: "¿Listo para explorar Santa Helena del Opón?",
        },
        {
            key: "simacota",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Simacota",
            subtitulo: "Ríos y paisajes rurales de la provincia Comunera",
            datos: [
                { label: "Altitud", val: "1.000 m.s.n.m." },
                { label: "Clima", val: "25°C promedio" },
                { label: "Distancia BGA", val: "110 km" },
                { label: "Mejor época", val: "Dic. a mar." },
            ],
            intro: "Simacota combina montañas, ríos y caminos rurales en un paisaje representativo de la provincia Comunera.",
            secciones: [
                { titulo: "🌾 Paisaje agrícola", texto: "Cultivos y fincas ganaderas dominan el paisaje; hay productores que ofrecen visitas." },
                { titulo: "🏞️ Quebradas y caminos", texto: "Pequeñas quebradas y senderos veredales permiten refrescarse y caminar." },
                { titulo: "🍽️ Cocina regional", texto: "Los restaurantes del parque ofrecen platos típicos de la zona." },
                { titulo: "💡 Consejo TourismEasy", texto: "Lleva protector solar y agua; el clima es caluroso durante el día." },
            ],
            ctaTexto: "¿Listo para explorar Simacota?",
        },
        {
            key: "suaita",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Suaita",
            subtitulo: "Caña panelera y tradición del sur de Santander",
            datos: [
                { label: "Altitud", val: "1.600 m.s.n.m." },
                { label: "Clima", val: "20°C promedio" },
                { label: "Distancia BGA", val: "150 km" },
                { label: "Mejor época", val: "Todo el año" },
            ],
            intro: "Suaita es un municipio de tradición agrícola, con producción panelera y paisajes rurales del sur de Santander.",
            secciones: [
                { titulo: "🏛️ Historia comunera", texto: "Suaita guarda memoria de la época comunera en su plaza y templo." },
                { titulo: "🌿 Rutas campesinas", texto: "Los caminos entre fincas ofrecen vistas del paisaje de la provincia Comunera." },
                { titulo: "🍬 Dulces y panela", texto: "Las tiendas del parque venden dulces y productos de la región." },
                { titulo: "💡 Consejo TourismEasy", texto: "Combina la visita con Oiba o Socorro para armar una ruta histórica." },
            ],
            ctaTexto: "¿Listo para explorar Suaita?",
        },
        {
            key: "sucre",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Sucre",
            subtitulo: "Montañas y caminos del occidente santandereano",
            datos: [
                { label: "Altitud", val: "1.800 m.s.n.m." },
                { label: "Clima", val: "18°C promedio" },
                { label: "Distancia BGA", val: "260 km" },
                { label: "Mejor época", val: "Dic. a feb. y jun. a ago." },
            ],
            intro: "Sucre ofrece paisajes montañosos y caminos rurales en el occidente del departamento, con un ambiente tranquilo de pueblo.",
            secciones: [
                { titulo: "🍯 Panela y caña", texto: "Sucre es una zona panelera; algunos trapiches reciben visitantes en época de molienda." },
                { titulo: "⛪ Plaza tradicional", texto: "Un casco urbano pequeño, de calles tranquilas y buena arquitectura de pueblo." },
                { titulo: "🌄 Paisaje de la provincia", texto: "Las montañas verdes y los caminos veredales ofrecen buenas vistas." },
                { titulo: "💡 Consejo TourismEasy", texto: "Viaja con tiempo: es un destino alejado y las vías pueden demorar más de lo previsto." },
            ],
            ctaTexto: "¿Listo para explorar Sucre?",
        },
        {
            key: "surata",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Suratá",
            subtitulo: "Agua y páramo en las montañas de Soto Norte",
            datos: [
                { label: "Altitud", val: "1.700 m.s.n.m." },
                { label: "Clima", val: "19°C promedio" },
                { label: "Distancia BGA", val: "55 km" },
                { label: "Mejor época", val: "Todo el año" },
            ],
            intro: "Suratá está rodeado por montañas y ecosistemas de páramo de Soto Norte, importantes para el agua y la biodiversidad.",
            secciones: [
                { titulo: "🌿 Cerca de Bucaramanga", texto: "Su cercanía con la capital lo hace ideal para una excursión de un día entre montañas." },
                { titulo: "⛏️ Tradición minera", texto: "La minería ha dejado huella en su historia; los habitantes comparten relatos y costumbres." },
                { titulo: "🍲 Comida local", texto: "Los restaurantes del pueblo ofrecen platos típicos con ingredientes de las veredas." },
                { titulo: "💡 Consejo TourismEasy", texto: "Combina Suratá con California o Vetas en un recorrido por el nororiente." },
            ],
            ctaTexto: "¿Listo para explorar Suratá?",
        },
        {
            key: "tona",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Tona",
            subtitulo: "Páramo y fuentes de agua cerca de Bucaramanga",
            datos: [
                { label: "Altitud", val: "1.300 m.s.n.m." },
                { label: "Clima", val: "22°C promedio" },
                { label: "Distancia BGA", val: "30 km" },
                { label: "Mejor época", val: "Todo el año" },
            ],
            intro: "Tona es un municipio de montaña con páramos y fuentes hídricas en el entorno de Santurbán, cerca del área metropolitana.",
            secciones: [
                { titulo: "🌿 Paisaje de montaña", texto: "Tona está muy cerca de Bucaramanga y ofrece caminos, quebradas y miradores entre cultivos." },
                { titulo: "🏞️ Cerca de las fuentes de agua", texto: "La región es la fuente de agua de Bucaramanga; su clima fresco y paisajes verdes invitan a pasear." },
                { titulo: "🍽️ Cocina campesina", texto: "Pequeños restaurantes sirven platos tradicionales ideales para una escapada de fin de semana." },
                { titulo: "💡 Consejo TourismEasy", texto: "Sal temprano desde Bucaramanga y regresa antes del anochecer: es una excursión cómoda de un día." },
            ],
            ctaTexto: "¿Listo para explorar Tona?",
        },
        {
            key: "valle-de-san-jose",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Valle de San José",
            subtitulo: "Tradición y paisaje cerca de San Gil",
            datos: [
                { label: "Altitud", val: "1.300 m.s.n.m." },
                { label: "Clima", val: "22°C promedio" },
                { label: "Distancia BGA", val: "120 km" },
                { label: "Mejor época", val: "Todo el año" },
            ],
            intro: "Valle de San José es un municipio de la provincia Guanentá cercano a San Gil, con paisajes rurales y tradiciones campesinas.",
            secciones: [
                { titulo: "🧵 Tradición artesanal", texto: "El municipio es conocido por sus tejidos y artesanías; algunos talleres reciben visitantes." },
                { titulo: "🌿 Rutas rurales", texto: "Los senderos entre fincas ofrecen vistas del valle y paisajes de la provincia." },
                { titulo: "⛪ Plaza y templo", texto: "El centro del pueblo es pequeño y acogedor, ideal para un recorrido a pie." },
                { titulo: "💡 Consejo TourismEasy", texto: "Pregunta por talleres y tiendas de artesanías antes de ir para que estén abiertos." },
            ],
            ctaTexto: "¿Listo para explorar Valle de San José?",
        },
        {
            key: "vetas",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Vetas",
            subtitulo: "Un pueblo de alta montaña junto a Santurbán",
            datos: [
                { label: "Altitud", val: "3.300 m.s.n.m." },
                { label: "Clima", val: "8°C promedio" },
                { label: "Distancia BGA", val: "55 km" },
                { label: "Mejor época", val: "Dic. a feb." },
            ],
            intro: "Vetas se encuentra en un paisaje frío de alta montaña, cerca de los páramos de Santurbán, y conserva una larga historia minera.",
            secciones: [
                { titulo: "⛏️ Minería de oro", texto: "Vetas es uno de los pueblos más altos de Colombia y tiene una larga tradición minera." },
                { titulo: "🌫️ Páramo de Santurbán", texto: "Cerca del municipio se encuentra el páramo, con frailejones, lagunas y paisajes de alta montaña." },
                { titulo: "🍲 Comida para el frío", texto: "Caldos de costilla y sopas calientes son perfectos para el clima helado." },
                { titulo: "💡 Consejo TourismEasy", texto: "Lleva abrigo pesado, gorro y guantes: la temperatura puede bajar de 5 °C incluso durante el día." },
            ],
            ctaTexto: "¿Listo para explorar Vetas?",
        },
        {
            key: "villanueva",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Villanueva",
            subtitulo: "Entre Barichara, Guane y los caminos de Guanentá",
            datos: [
                { label: "Altitud", val: "1.300 m.s.n.m." },
                { label: "Clima", val: "22°C promedio" },
                { label: "Distancia BGA", val: "140 km" },
                { label: "Mejor época", val: "Todo el año" },
            ],
            intro: "Villanueva ofrece paisajes de montaña y una ubicación cercana a Barichara y Guane, en un territorio de caminos históricos y tradiciones rurales.",
            secciones: [
                { titulo: "🏞️ Cañón del río Mogote", texto: "Los alrededores ofrecen paisajes de río y cañón, con miradores y paseos cortos." },
                { titulo: "⛪ Parque principal", texto: "El parque central reúne comercio, restaurantes y la vida social del municipio." },
                { titulo: "🍬 Dulces y productos locales", texto: "Las tiendas venden dulces, café y artesanías de la región." },
                { titulo: "💡 Consejo TourismEasy", texto: "Combina Villanueva con Curití y San Gil para una ruta de varios días." },
            ],
            ctaTexto: "¿Listo para explorar Villanueva?",
        },
        {
            key: "zapatoca",
            video: "",
            badge: "Municipio de Santander",
            titulo: "Zapatoca",
            subtitulo: "Cultura, miradores y cuevas en la Ciudad del Clima de Seda",
            datos: [
                { label: "Altitud", val: "1.700 m.s.n.m." },
                { label: "Clima", val: "20°C promedio" },
                { label: "Distancia BGA", val: "85 km" },
                { label: "Mejor época", val: "Todo el año" },
            ],
            intro: "Zapatoca es conocida como la Ciudad del Clima de Seda y ofrece arquitectura tradicional, miradores y atractivos naturales como la Cueva del Nitro.",
            secciones: [
                { titulo: "🕳️ Cuevas y naturaleza", texto: "Cerca de Zapatoca hay cuevas y senderos con guías locales que muestran su geología y fauna." },
                { titulo: "🏛️ Camino Real a Barichara", texto: "El histórico camino de piedra conecta el municipio con Guane y Barichara en una caminata de varias horas." },
                { titulo: "🍬 Dulces del Clima de Seda", texto: "Zapatoca es conocida como la Ciudad del Clima de Seda; sus dulces y platos típicos son parte del recorrido." },
                { titulo: "💡 Consejo TourismEasy", texto: "Reserva con anticipación guías para cuevas y caminos: algunas rutas requieren acompañamiento autorizado." },
            ],
            ctaTexto: "¿Listo para explorar Zapatoca?",
        },
    ];

    window.TE_ARTICULOS = ARTICULOS;
    if (!mount) return;

    const escapeHtml = (value) => String(value == null ? "" : value).replace(/[&<>\"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
    }[char]));

    const datoHTML = (d) =>
        `<div class="art-dato"><span class="art-dato-label">${escapeHtml(d.label)}</span><span class="art-dato-val">${escapeHtml(d.val)}</span></div>`;

    const seccionHTML = (s) =>
        `<div class="art-seccion">
    <h3 class="art-seccion-titulo">${escapeHtml(s.titulo)}</h3>
    <p>${escapeHtml(s.texto)}</p>
    </div>`;

    const videoHTML = (a) => a.video ? `
          <video class="art-video-bg" poster="${escapeHtml(a.poster || "")}" muted loop playsinline preload="metadata">
            <source src="${escapeHtml(a.video)}" />
          </video>
          <button class="art-btn-sound" onclick="toggleArtSound(this)">🔇</button>` : "";

    const heroStyle = (a) => !a.video && a.poster
        ? ` style="background: url('${escapeHtml(a.poster)}') center / cover no-repeat"`
        : "";

    const overlayHTML = (a) => `
    <div class="art-overlay" id="art-${a.key}" role="dialog" aria-modal="true">
      <div class="art-modal">
        <button class="art-close" data-close="${a.key}" aria-label="Cerrar artículo">&times;</button>
        <div class="art-hero"${heroStyle(a)}>
          ${videoHTML(a)}
          <div class="art-hero-overlay">
            <span class="art-badge">${escapeHtml(a.badge)}</span>
            <h2 class="art-titulo">${escapeHtml(a.titulo)}</h2>
            <p class="art-subtitulo">${escapeHtml(a.subtitulo)}</p>
          </div>
        </div>
        <div class="art-body">
          <div class="art-datos-rapidos">
            ${a.datos.map(datoHTML).join("")}
          </div>
          <p class="art-intro">${escapeHtml(a.intro)}</p>
          ${a.secciones.map(seccionHTML).join("")}
          <div class="art-cta">
            <p>${escapeHtml(a.ctaTexto)}</p>
            <a href="html/planes_turisticos.html" class="art-btn-reservar">
              <i class="fa-solid fa-calendar-check"></i> Ver planes disponibles
            </a>
          </div>
        </div>
      </div>
    </div>
  `;

    function renderArticulos(articulos) {
        mount.innerHTML = articulos.map(overlayHTML).join("");
    }

    renderArticulos(ARTICULOS);
    const municipiosPromise = window.TE_MUNICIPIOS_PROMISE || Promise.resolve([]);
    municipiosPromise.then((municipios) => {
        if (!Array.isArray(municipios) || !municipios.length) return;
        const articulosBase = new Map(ARTICULOS.map((article) => [article.key, article]));
        const articulos = municipios.map((municipio) => {
            const base = articulosBase.get(municipio.key);
            if (!base) {
                throw new Error(`Falta una ficha en ARTICULOS para el municipio ${municipio.titulo} (${municipio.key}).`);
            }
            const custom = municipio.article || {};
            return {
                ...base,
                ...custom,
                key: municipio.key,
                poster: municipio.img,
                titulo: custom.titulo || municipio.titulo,
                subtitulo: custom.subtitulo !== undefined ? custom.subtitulo : base.subtitulo,
                datos: Array.isArray(custom.datos) ? custom.datos : base.datos,
                intro: custom.intro !== undefined ? custom.intro : base.intro,
                secciones: Array.isArray(custom.secciones) ? custom.secciones : base.secciones,
                ctaTexto: custom.ctaTexto !== undefined ? custom.ctaTexto : base.ctaTexto
            };
        });
        renderArticulos(articulos);

        const previewKey = new URLSearchParams(window.location.search).get("previewDestino");
        if (previewKey) {
            const overlay = document.getElementById("art-" + previewKey);
            if (overlay) {
                overlay.classList.add("open");
                document.body.style.overflow = "hidden";
                const video = overlay.querySelector(".art-video-bg");
                if (video) video.play().catch(() => {});
            }
        }
    }).catch((error) => {
        console.error("[TourismEasy] No se pudieron cargar los artículos de los municipios.", error);
    });

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