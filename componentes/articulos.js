(function() {
    const mount = document.getElementById("site-articulos");

    const TURISMO_RESPONSABLE = "Respeta las indicaciones de la comunidad, cuida los espacios naturales y culturales, y confirma directamente con los prestadores los horarios, accesos y servicios vigentes.";

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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Vélez" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Aguada permite acercarse al paisaje campesino del sur de Santander, con caminos rurales, laderas y una vida local ligada al campo.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Recorre el centro municipal y sus alrededores con tiempo para observar la arquitectura cotidiana y el paisaje de montaña." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La agricultura y las costumbres campesinas forman parte de la identidad local. Pregunta por productos de temporada y actividades comunitarias." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Consulta previamente el transporte y el estado de las vías rurales; lleva agua y calzado adecuado para caminar." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Vélez" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Albania es un municipio rural de la provincia de Vélez. Su atractivo está en descubrir con calma el paisaje, las labores agrícolas y las tradiciones de sus habitantes.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Planea un recorrido por el casco urbano y sus caminos cercanos, respetando las fincas y los espacios de trabajo local." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La vida campesina y los productos del campo ayudan a conocer la región más allá de sus rutas conocidas." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Confirma los servicios disponibles antes de viajar y acuerda con anticipación cualquier visita a predios privados." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Guanentá" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Aratoca se encuentra en un entorno de cañón y ofrece una perspectiva de las montañas y del paisaje seco característico de esta zona.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Disfruta los miradores y panorámicas del cañón desde puntos autorizados." },
                { titulo: "🎭 Cultura y tradiciones", texto: "Conoce la historia y las costumbres locales conversando con guías y prestadores de la región." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "El clima puede ser cálido y soleado: lleva protección solar y verifica accesos, transporte y horarios de los atractivos antes de salir." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Vélez" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Barbosa es un punto de encuentro del sur de Santander, reconocido por la producción de guayaba y el bocadillo veleño, además de su ambiente comercial.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Recorre el centro y busca establecimientos locales donde conocer el proceso y las variedades de productos de guayaba." },
                { titulo: "🎭 Cultura y tradiciones", texto: "El bocadillo y otros dulces tradicionales reflejan la relación de la región con el cultivo de guayaba." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Pregunta por productores y puntos de venta locales; confirma horarios y transporte si planeas continuar hacia otros municipios de la provincia." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Mares" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Barrancabermeja es una ciudad portuaria del Magdalena Medio santandereano. El río, la actividad petrolera y el clima cálido han marcado su historia y su vida cotidiana.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Acércate a los espacios públicos junto al río y conoce la relación de la ciudad con el Magdalena y la navegación regional." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La cocina ribereña y la cultura del Magdalena Medio hacen parte de la experiencia local." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Planea actividades para las horas menos calurosas y confirma las condiciones de acceso a los espacios ribereños." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Mares" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Betulia combina paisaje montañoso con el entorno del embalse Topocoro, un escenario de agua que ha transformado la zona y sus posibilidades de recreación.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Explora el paisaje del embalse desde accesos permitidos y pregunta a operadores locales por actividades disponibles y condiciones de seguridad." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La vida rural y las comunidades cercanas al embalse ofrecen una mirada a la transformación de este territorio." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "No ingreses al agua sin verificar las normas del lugar y los operadores autorizados; confirma el estado de las vías antes de viajar." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Vélez" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Bolívar es un municipio extenso de tradición campesina, con paisajes de montaña y caminos que conectan comunidades rurales del occidente santandereano.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "El centro municipal y sus recorridos rurales permiten conocer la diversidad del territorio y sus vistas de montaña." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La agricultura y las tradiciones campesinas son parte importante de la identidad de sus veredas." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Por las distancias entre veredas, organiza el recorrido con anticipación y confirma transporte, clima y servicios disponibles." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Guanentá" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Cabrera conserva un ambiente apacible y una escala de pueblo que invita a recorrer el centro y apreciar el paisaje rural de la provincia Guanentá.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Dedica tiempo a la plaza y las calles del casco urbano; los caminos rurales permiten observar las colinas y la vida cotidiana del municipio." },
                { titulo: "🎭 Cultura y tradiciones", texto: "Las costumbres campesinas y la cocina regional se descubren mejor conversando con sus habitantes y productores." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Pregunta por rutas y condiciones de los caminos antes de iniciar una caminata fuera del casco urbano." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Soto Norte" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "California está enclavado en las montañas de Soto Norte, en el entorno del páramo de Santurbán. Su historia y su identidad están ligadas a la minería.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Conoce el paisaje de montaña desde lugares permitidos y aprende sobre la historia minera local mediante guías y relatos de la comunidad." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La memoria del trabajo minero forma parte de la cultura del municipio y de los debates sobre el futuro de la región." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Respeta las áreas naturales y no ingreses a minas o predios sin autorización; confirma las condiciones de acceso antes de desplazarte." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "García Rovira" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Capitanejo se asienta en un valle junto al río, en un entorno cálido de laderas y paisajes contrastantes con las montañas altas de García Rovira.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Observa el cañón y el río desde puntos seguros y consulta por recorridos guiados que expliquen la geografía de la zona." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La agricultura de clima cálido y la cocina local reflejan la diversidad de esta región." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Lleva hidratación y protección solar. Evita acercarte a las riberas durante crecientes y sigue las indicaciones locales." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "García Rovira" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Carcasí ofrece un paisaje de montaña y un entorno de clima fresco, donde la vida rural y los caminos veredales definen el ritmo del municipio.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Recorre el centro y consulta con habitantes locales por caminos panorámicos accesibles según el clima y la temporada." },
                { titulo: "🎭 Cultura y tradiciones", texto: "Las tradiciones campesinas y los productos agrícolas permiten conocer la identidad de esta zona andina." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Lleva ropa para cambios de clima y confirma transporte y estado de las vías, especialmente para trayectos rurales." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Guanentá" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Cepitá se ubica en un cañón, entre laderas secas y el curso del río. Su paisaje ofrece una perspectiva distinta de Santander.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Disfruta las panorámicas desde lugares seguros y conoce el casco urbano y los caminos autorizados de la zona." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La vida local está vinculada al río, al clima cálido y a las actividades rurales propias del cañón." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "El terreno puede ser exigente y caluroso; consulta por accesos y guías, lleva agua y evita senderos durante lluvias." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "García Rovira" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "El Cerrito es conocido por sus paisajes fríos de alta montaña y por su cercanía al páramo del Almorzadero, un ecosistema clave para el agua de la región.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Conoce el paisaje de páramo desde rutas permitidas y con orientación local, cuidando la vegetación y las fuentes de agua." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La ganadería y la vida campesina de clima frío forman parte de la cultura local." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Lleva abrigo, revisa el clima y no abandones los caminos señalizados; la niebla y las lluvias pueden cambiar las condiciones rápidamente." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Guanentá" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Charalá ocupa un lugar destacado en la historia de Santander y está ligada a la Revolución de los Comuneros y a la batalla del río Pienta.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Visita los espacios históricos del casco urbano y pregunta por rutas locales relacionadas con la memoria de la independencia." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La música, las celebraciones y la tradición oral mantienen viva la historia de Charalá y de la provincia Guanentá." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Consulta con guías locales para contextualizar los lugares históricos y verifica fechas de actividades culturales." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Soto Norte" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Charta es un municipio de clima fresco, rodeado de montañas y paisajes rurales en la provincia de Soto Norte.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Explora el casco urbano y sus alrededores con acompañamiento local para descubrir los caminos y vistas de montaña." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La agricultura y las labores campesinas son parte del ritmo diario del municipio." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Confirma el estado de las vías y los senderos antes de salir; lleva ropa apropiada para lluvia y cambios de temperatura." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Comunera" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Chima invita a conocer un municipio tranquilo de la provincia Comunera, con colinas, fincas y una vida cotidiana ligada al campo.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Recorre el centro y consulta por caminos veredales y miradores accesibles durante tu visita." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La agricultura local y las costumbres de sus comunidades dan forma a la identidad de Chima." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Organiza el transporte con anticipación y pregunta antes de ingresar a fincas o caminos privados." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Vélez" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Chipatá combina paisajes de colinas y tradiciones agrícolas en la provincia de Vélez, una región reconocida por sus productos de guayaba.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Descubre el casco urbano y sus alrededores; los caminos rurales muestran la relación entre el municipio y el paisaje agrícola." },
                { titulo: "🎭 Cultura y tradiciones", texto: "Las preparaciones tradicionales con guayaba y la vida campesina son parte de la experiencia local." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Pregunta por productos de temporada y confirma los servicios de transporte y alimentación disponibles." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Vélez" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Cimitarra se extiende por una región de clima cálido, bosques y cursos de agua del Magdalena Medio, con una fuerte tradición rural.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Consulta por recorridos comunitarios y accesos autorizados para conocer los paisajes naturales y ribereños." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La agricultura, la ganadería y la cultura del Magdalena Medio caracterizan la vida local." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Verifica las condiciones de las vías rurales y los niveles de los ríos; para actividades de naturaleza, usa operadores con experiencia." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "García Rovira" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Concepción reúne un centro de tradición arquitectónica y un entorno montañoso de clima fresco en la provincia García Rovira.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Pasea por el casco urbano y aprecia sus construcciones tradicionales; consulta por rutas hacia los paisajes rurales cercanos." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La vida campesina y las costumbres de García Rovira forman parte del carácter del municipio." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Lleva abrigo y confirma transporte y condiciones de las vías, en especial si vas a recorrer veredas." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Comunera" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Confines es un destino de escala pequeña, con colinas y caminos rurales que permiten acercarse al paisaje y a la vida cotidiana santandereana.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Recorre el centro municipal y pregunta por caminos cercanos adecuados para una caminata tranquila." },
                { titulo: "🎭 Cultura y tradiciones", texto: "Las tradiciones campesinas y la agricultura local son una parte esencial de la identidad de Confines." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Verifica servicios, horarios de transporte y condiciones del clima antes de organizar un recorrido rural." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Comunera" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Contratación conserva una historia singular asociada al antiguo lazareto y a la atención de personas afectadas por la enfermedad de Hansen.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Conoce los lugares de memoria y el patrimonio local con respeto, idealmente mediante una visita guiada que aporte contexto histórico." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La memoria de sus habitantes y las tradiciones de la provincia Comunera dan profundidad a la visita." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Pregunta por los espacios abiertos al público y sus horarios; trata los sitios de memoria con especial respeto." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Guanentá" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Coromoro ofrece paisajes de montaña en la provincia Guanentá y una historia regional vinculada al río Pienta.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Consulta por los recorridos locales hacia el río y los paisajes rurales, siempre atendiendo las condiciones del terreno." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La tradición campesina y la memoria histórica del Pienta ayudan a comprender la identidad del municipio." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Pregunta por el estado de los caminos y no te acerques a quebradas o ríos si hay lluvia o creciente." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Guanentá" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Curití reúne la tradición artesanal del fique y atractivos naturales como el balneario de Pescaderito, en un entorno de la provincia Guanentá.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Conoce los talleres artesanales y pregunta por las condiciones de acceso y conservación de Pescaderito." },
                { titulo: "🎭 Cultura y tradiciones", texto: "Los tejidos y objetos de fique muestran un oficio tradicional que puedes apoyar comprando directamente a sus productores." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Verifica el estado del balneario y las reglas de ingreso; usa calzado adecuado y evita dejar residuos en el agua." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Yariguíes" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "El Carmen de Chucurí es reconocido por su tradición cacaotera y por sus paisajes rurales de montaña en el entorno de los Yariguíes.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Pregunta a asociaciones y productores por experiencias relacionadas con el cacao y recorridos por fincas." },
                { titulo: "🎭 Cultura y tradiciones", texto: "Conocer el cultivo y la transformación del cacao permite acercarse a uno de los productos representativos del municipio." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Coordina previamente las visitas a fincas y revisa el estado de las vías, especialmente durante temporadas de lluvia." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Comunera" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "El Guacamayo es un municipio de ambiente rural, con montañas, quebradas y caminos que invitan a descubrir la provincia Comunera con calma.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Consulta por sitios naturales y rutas autorizadas; los habitantes pueden orientar sobre accesos y condiciones locales." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La agricultura y las tradiciones campesinas son protagonistas de la vida cotidiana." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "No ingreses a quebradas sin conocer las condiciones del caudal y confirma opciones de transporte antes de viajar." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Vélez" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "El Peñón se distingue por un paisaje de montañas y formaciones rocosas, con cavernas que atraen a quienes exploran la naturaleza.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Infórmate sobre las cavernas y recorridos disponibles con guías locales; no ingreses por cuenta propia a espacios subterráneos." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La vida rural y el conocimiento del territorio por parte de sus habitantes enriquecen la experiencia de visita." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Usa equipos y acompañamiento adecuados para actividades de cueva, y verifica clima y accesos antes de desplazarte." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Soto Norte" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "El Playón combina tierras cálidas, ríos y campos agrícolas en una zona de transición entre el área metropolitana y el norte del departamento.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Consulta por balnearios y espacios naturales habilitados; los ríos y quebradas son parte central del paisaje." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La producción agrícola y la cocina local reflejan la diversidad de su entorno cálido." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Revisa las condiciones de los ríos, evita bañarte durante lluvias y confirma que los lugares visitados estén habilitados." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Guanentá" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Encino es puerta de entrada a bosques andinos de gran valor ecológico y al entorno del Santuario de Fauna y Flora Guanentá Alto Río Fonce.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Planea recorridos de naturaleza con orientación local y respeta los límites de las áreas protegidas." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La relación de la comunidad con el bosque y el agua ayuda a entender la importancia de conservar este territorio." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Consulta previamente los permisos y condiciones de ingreso a áreas protegidas; no dejes residuos ni alimentes animales silvestres." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "García Rovira" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Enciso ofrece un paisaje de montaña y caminos rurales en la provincia García Rovira, con un ambiente apacible para conocer la vida del campo.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Recorre el casco urbano y pregunta por caminos veredales adecuados a tu experiencia y a las condiciones del clima." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La agricultura y las tradiciones locales expresan la identidad de esta zona andina." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Organiza el transporte y lleva ropa para clima variable; pregunta antes de ingresar a fincas o caminos privados." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Vélez" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Florián es conocido por la Ventana de Tisquizoque, una cascada asociada a una cueva, y por sus paisajes de montaña en el occidente santandereano.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Consulta las condiciones de acceso a la Ventana de Tisquizoque y realiza el recorrido con acompañamiento local cuando sea necesario." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La historia y las tradiciones campesinas de Florián complementan la visita a sus atractivos naturales." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "El acceso puede cambiar según el clima. Lleva calzado con buen agarre y evita acercarte a la cascada durante lluvias fuertes." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Metropolitana" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Floridablanca combina la actividad urbana del área metropolitana de Bucaramanga con parques, espacios culturales y su reconocida tradición de obleas.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Explora los parques y espacios públicos, y visita comercios locales donde se preparan las obleas tradicionales." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La oferta gastronómica y las celebraciones locales muestran la mezcla de tradición y vida urbana del municipio." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Aprovecha las opciones de transporte metropolitano y confirma horarios de los espacios culturales que quieras visitar." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Comunera" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Galán ofrece un paisaje de colinas y ambiente campesino, ideal para descubrir una faceta tranquila del territorio santandereano.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Pregunta por rutas rurales y miradores cercanos, teniendo en cuenta las distancias y el estado de los caminos." },
                { titulo: "🎭 Cultura y tradiciones", texto: "Las labores agrícolas y la vida de las comunidades son parte importante del patrimonio local." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Confirma transporte y servicios con anticipación; respeta los predios privados y consulta antes de iniciar caminatas." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Comunera" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Gámbita es reconocida por sus cascadas, ríos y paisajes de montaña, atractivos que la convierten en un destino de naturaleza en Santander.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Infórmate sobre las cascadas habilitadas y los recorridos con guías del municipio; las condiciones pueden cambiar con la lluvia." },
                { titulo: "🎭 Cultura y tradiciones", texto: "Las comunidades rurales y su relación con el agua y el paisaje forman parte de la experiencia." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Usa calzado apropiado, no ingreses a corrientes fuertes y verifica el estado de los accesos antes de salir." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "García Rovira" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Guaca ofrece paisajes de montaña y clima fresco en la provincia García Rovira, en un entorno donde predominan las actividades campesinas.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Recorre el casco urbano y consulta por trayectos rurales con vistas a las montañas." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La agricultura y la tradición campesina permiten conocer la cultura local de García Rovira." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Lleva abrigo y revisa el clima y las vías; coordina con anticipación cualquier visita a zonas rurales." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Comunera" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Guadalupe es conocido por Las Gachas, un cauce rocoso con pozas naturales que forma uno de los paisajes más singulares de la provincia Comunera.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Visita Las Gachas con respeto por el entorno y atiende las indicaciones de acceso, seguridad y conservación." },
                { titulo: "🎭 Cultura y tradiciones", texto: "El centro municipal y la vida campesina ofrecen otra perspectiva de Guadalupe más allá de su atractivo natural." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "El cauce puede ser resbaloso y las condiciones cambian con la lluvia; usa calzado adecuado y no dejes residuos." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Comunera" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Guapotá invita a recorrer un entorno tranquilo de la provincia Comunera, con paisajes rurales que se conectan con el valle del río Suárez.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Conoce el centro y pregunta por miradores y rutas veredales que puedan visitarse de manera segura." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La agricultura y las tradiciones de la provincia Comunera forman parte del carácter del municipio." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Confirma las condiciones de las vías y el transporte; los trayectos rurales pueden tomar más tiempo del esperado." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Vélez" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Guavatá forma parte de la región de la guayaba y el bocadillo veleño, con paisajes agrícolas y una tradición campesina arraigada.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Visita productores locales para conocer los cultivos y, cuando esté disponible, el proceso de elaboración de productos de guayaba." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La guayaba, el bocadillo y las recetas tradicionales son una forma de acercarse a la cultura de la provincia." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Pregunta por temporadas de cosecha y disponibilidad de visitas antes de desplazarte a las fincas." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Vélez" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Güepsa es un municipio agrícola del sur de Santander, vinculado a la producción de guayaba y a la tradición del bocadillo veleño.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Conoce el centro y busca productores locales que compartan cómo se cultiva y transforma la guayaba." },
                { titulo: "🎭 Cultura y tradiciones", texto: "Los dulces y productos de guayaba expresan una tradición regional que puedes apoyar comprando a productores locales." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Verifica horarios de comercios y transporte, en especial si planeas continuar hacia otros municipios de la provincia." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Comunera" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Hato ofrece un ambiente rural de colinas y caminos tranquilos, para quienes quieren conocer municipios pequeños y su vida cotidiana.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Pasea por el casco urbano y consulta por caminos cercanos y puntos panorámicos accesibles." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La agricultura y las tradiciones locales forman parte de la identidad de sus comunidades." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Planifica la movilidad con antelación y pregunta a los residentes por las condiciones actuales de las rutas." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Vélez" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Jesús María reúne arquitectura de pueblo y paisajes rurales de montaña en la provincia de Vélez.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Dedica tiempo al centro municipal y pregunta por recorridos hacia los paisajes rurales cercanos." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La cultura campesina y las tradiciones de la provincia se reflejan en la cocina y las celebraciones locales." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Consulta fechas de eventos y opciones de transporte; lleva calzado cómodo para calles y caminos rurales." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Guanentá" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Jordán es un pequeño municipio de cañón, apreciado por su entorno de montaña, su ambiente sereno y sus caminos históricos.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Planea el acceso con orientación local y disfruta las vistas del cañón desde rutas seguras." },
                { titulo: "🎭 Cultura y tradiciones", texto: "Su historia y su escala de pueblo permiten una visita pausada, conectada con las tradiciones de Guanentá." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Verifica el estado del camino y las condiciones del clima; lleva agua y evita hacer recorridos exigentes sin preparación." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Vélez" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "La Belleza ofrece un paisaje de montaña, quebradas y vegetación en el occidente de Santander, con una marcada vida rural.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Consulta por recorridos comunitarios para conocer las quebradas y los caminos veredales de manera segura." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La agricultura y las tradiciones campesinas son parte esencial del municipio y su entorno." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Confirma accesos y transporte con habitantes locales; no visites quebradas durante lluvias o crecientes." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Vélez" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Landázuri es reconocido por el cacao y combina paisajes cálidos y rurales de transición hacia el Magdalena Medio.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Pregunta a productores por recorridos de cacao para conocer el cultivo y sus etapas de transformación." },
                { titulo: "🎭 Cultura y tradiciones", texto: "El chocolate y los productos derivados del cacao permiten acercarse al trabajo de las familias productoras." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Coordina con anticipación las visitas a fincas y consulta las condiciones de las vías rurales." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Vélez" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "La Paz es un municipio de caminos rurales y montañas, donde las tradiciones campesinas acompañan el paisaje de la provincia de Vélez.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Recorre el centro y pregunta por rutas locales hacia los paisajes rurales cercanos." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La agricultura y las costumbres de la provincia hacen parte de la identidad de La Paz." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Verifica transporte y estado de los caminos antes de desplazarte a las veredas." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Metropolitana" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Lebrija es conocida por sus cultivos de piña y su clima cálido, además de su cercanía al área metropolitana de Bucaramanga.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Conoce la actividad agrícola desde comercios y productores que reciban visitantes; disfruta el paisaje de cultivos desde lugares públicos." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La piña y otros productos del campo son protagonistas de su identidad y gastronomía." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Pregunta por la disponibilidad de visitas a cultivos y protege del sol durante los recorridos." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "García Rovira" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Macaravita ofrece paisajes de montaña y caminos rurales en una zona de clima fresco del oriente santandereano.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Recorre el casco urbano y consulta por rutas veredales adecuadas a las condiciones del día." },
                { titulo: "🎭 Cultura y tradiciones", texto: "Las labores campesinas y la producción local reflejan la cultura de García Rovira." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Lleva abrigo y organiza con anticipación el transporte, especialmente si visitas áreas rurales." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "García Rovira" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Málaga es un centro urbano de la provincia García Rovira, con servicios regionales, parque principal y arquitectura tradicional.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Pasea por el centro y utiliza la ciudad como punto de partida para conocer otros municipios de la provincia." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La gastronomía y las celebraciones locales reúnen tradiciones de los municipios de García Rovira." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Confirma los servicios de transporte hacia municipios vecinos y consulta la agenda cultural local." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Soto Norte" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Matanza forma parte de Soto Norte y ofrece un entorno de montañas, quebradas y caminos rurales no muy lejos del área metropolitana.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Consulta por miradores y recorridos comunitarios que permitan disfrutar el paisaje sin afectar las fuentes de agua." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La agricultura y la vida campesina son parte de las tradiciones de este municipio andino." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Comprueba el clima y el estado de las vías; evita visitar quebradas durante lluvias intensas." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Guanentá" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Mogotes combina ríos, cascadas y paisajes de montaña, una invitación a explorar la naturaleza de la provincia Guanentá.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Pregunta por balnearios y recorridos habilitados; para cascadas y senderos, consulta las condiciones del terreno." },
                { titulo: "🎭 Cultura y tradiciones", texto: "Las actividades rurales y la cocina local acompañan una visita centrada en la naturaleza." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "No ingreses a ríos con corriente fuerte y revisa el pronóstico antes de organizar caminatas." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "García Rovira" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Molagavita conserva un ambiente tranquilo de montaña y caminos rurales en la provincia García Rovira.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Conoce el centro y consulta a residentes por trayectos panorámicos y accesibles." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La agricultura y las costumbres campesinas dan forma a la identidad local." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Confirma las rutas disponibles y lleva ropa para lluvia y cambios de temperatura." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Guanentá" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Ocamonte se reconoce por la producción de caña panelera y sus paisajes agrícolas en la provincia Guanentá.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Pregunta por trapiches o productores que reciban visitantes para conocer el proceso panelero." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La panela y las preparaciones tradicionales están ligadas a la vida y el trabajo campesino." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Coordina cualquier visita a unidades productivas y confirma horarios y transporte." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Comunera" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Oiba es un municipio de tradición panelera, con paisajes rurales y una ubicación que conecta distintos destinos del sur de Santander.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Recorre el centro y pregunta por productores que permitan conocer el cultivo de caña y la elaboración de panela." },
                { titulo: "🎭 Cultura y tradiciones", texto: "Las preparaciones con panela y la cocina regional son parte de la experiencia local." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Consulta la disponibilidad de recorridos productivos y planifica el transporte hacia municipios cercanos." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "García Rovira" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Onzaga ofrece paisajes de montaña y tradiciones campesinas en la provincia García Rovira, con un ambiente de pueblo tranquilo.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Explora el casco urbano y consulta por caminos rurales que puedan recorrerse con seguridad." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La agricultura y las celebraciones locales conservan costumbres propias de la región." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Revisa el estado de las vías y el clima antes del viaje; lleva abrigo para las noches frescas." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Comunera" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Palmar es un municipio de escala pequeña y ambiente tranquilo, con caminos rurales y tradiciones de la provincia Comunera.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Pasea por el casco urbano y pregunta por lugares cercanos que estén abiertos a visitantes." },
                { titulo: "🎭 Cultura y tradiciones", texto: "Las costumbres campesinas y la cocina local permiten conocer el carácter del municipio." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Algunos servicios pueden tener horarios limitados; confirma transporte y alimentación antes de viajar." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Comunera" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Palmas del Socorro combina caminos y paisajes de campo con la memoria histórica de la provincia Comunera.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Recorre el centro y pregunta por rutas que conecten el municipio con los lugares históricos de la región." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La historia de los Comuneros y las tradiciones campesinas son parte del patrimonio local." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Consulta con residentes por visitas y transporte; respeta los predios privados y los espacios de memoria." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Guanentá" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Páramo es conocido por atractivos naturales de la provincia Guanentá, como la Cueva del Indio y la cascada de Juan Curí.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Infórmate sobre el acceso y los operadores de la Cueva del Indio y Juan Curí antes de planear la visita." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La oferta de actividades de naturaleza convive con la vida cotidiana y las tradiciones de sus comunidades." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Para cuevas y cascadas, verifica condiciones, usa guía cuando corresponda y evita recorridos con lluvia fuerte." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Metropolitana" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Piedecuesta mezcla vida urbana y paisajes de montaña, y es conocida por sus dulces tradicionales y su cercanía a la Mesa de Ruitoque.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Consulta por miradores y espacios naturales de acceso permitido en la zona de Ruitoque." },
                { titulo: "🎭 Cultura y tradiciones", texto: "Los dulces y tabacos tradicionales expresan oficios y sabores de la región." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Verifica el transporte hacia los miradores y pregunta por condiciones de ingreso y parqueo." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Guanentá" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Pinchote es reconocido como tierra natal de Antonia Santos y conserva una memoria histórica ligada a la independencia.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Visita los espacios conmemorativos del casco urbano y pregunta por recorridos que expliquen la historia local." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La tradición oral y las celebraciones mantienen presentes las figuras y acontecimientos de la región." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Consulta por horarios de los lugares de interés y combina la visita con otros destinos cercanos de Guanentá." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Vélez" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Puente Nacional guarda memoria de acontecimientos importantes de la independencia y forma parte de los paisajes de la provincia de Vélez.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Conoce el casco urbano y sus sitios históricos, preferiblemente con información de guías o fuentes locales." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La música, las tradiciones campesinas y la historia regional se encuentran en la identidad del municipio." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Pregunta por recorridos y eventos culturales; confirma el transporte si planeas continuar hacia otros pueblos." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Vélez" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Puerto Parra es un municipio cálido del Magdalena Medio, con paisajes de ríos, humedales y bosque.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Consulta por espacios naturales abiertos al público y operadores comunitarios que conozcan las condiciones del territorio." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La cultura ribereña y las actividades rurales reflejan la relación con el agua y el bosque." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Revisa el clima y el nivel de los ríos, y evita acceder a zonas inundables o privadas sin autorización." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Mares" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Puerto Wilches se extiende junto al río Magdalena y conserva una vida local estrechamente relacionada con el río y el transporte fluvial.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Conoce los espacios públicos ribereños y pregunta por actividades autorizadas para acercarte al paisaje del Magdalena." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La pesca, la cocina y las tradiciones del río hacen parte de la cultura del municipio." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Sigue las indicaciones de seguridad junto al agua y confirma las condiciones de navegación y transporte local." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Soto Norte" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Rionegro es un municipio extenso con diversidad de climas, montañas, fincas y actividad agrícola.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Elige una zona concreta para visitar y consulta a prestadores locales por accesos y recorridos disponibles." },
                { titulo: "🎭 Cultura y tradiciones", texto: "Los productos agrícolas y las tradiciones varían entre sus zonas, reflejando la amplitud del municipio." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Por las distancias, evita improvisar trayectos: confirma transporte, clima y servicios en la zona elegida." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Mares" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Sabana de Torres ofrece paisajes cálidos, humedales y actividad agrícola en el Magdalena Medio santandereano.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Pregunta por humedales y espacios naturales habilitados para observación, idealmente con acompañamiento de guías locales." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La cultura rural y los productos de la región hacen parte de la identidad del municipio." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Lleva protección solar e hidratación y consulta por temporadas, accesos y normas de conservación de los humedales." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "García Rovira" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "San Andrés combina paisaje de montaña con la Laguna de Ortices, un referente natural de la provincia García Rovira.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Consulta el acceso a la laguna y disfruta el entorno desde zonas habilitadas, cuidando el agua y la vegetación." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La agricultura y las costumbres campesinas acompañan la vida local." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Verifica el estado de la vía y las condiciones del lugar; lleva abrigo y no dejes residuos en el entorno de la laguna." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Vélez" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "San Benito forma parte de la región de guayaba y bocadillo de la provincia de Vélez, con paisajes y costumbres de campo.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Pregunta por productores locales y conoce cómo se cultiva y transforma la guayaba." },
                { titulo: "🎭 Cultura y tradiciones", texto: "Los dulces y productos artesanales son parte de una tradición que puedes apoyar comprando directamente a sus productores." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Consulta por horarios y temporadas de producción antes de organizar una visita a fincas." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Guanentá" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "San Joaquín es un municipio de montaña y tradición campesina en la provincia Guanentá, adecuado para una visita tranquila.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Recorre el centro y pregunta por caminos y paisajes rurales accesibles según las condiciones del día." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La vida local y los productos del campo muestran las costumbres de las comunidades de Guanentá." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Planifica el transporte con anticipación y consulta el clima antes de caminar por rutas rurales." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "García Rovira" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "San José de Miranda ofrece un ambiente de pueblo tradicional y paisajes de montaña en la provincia García Rovira.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Conoce el centro municipal y observa su arquitectura; pregunta por recorridos rurales con orientación local." },
                { titulo: "🎭 Cultura y tradiciones", texto: "Las tradiciones campesinas y las celebraciones locales permiten acercarse a su identidad." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Lleva ropa para clima fresco y verifica los servicios de transporte y alimentación disponibles." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "García Rovira" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "San Miguel es un municipio de ambiente rural y montañoso, donde los caminos y la agricultura marcan la vida cotidiana.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Consulta por rutas panorámicas y espacios accesibles para visitantes antes de iniciar recorridos." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La cultura campesina de García Rovira se expresa en sus productos, costumbres y vida comunitaria." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Organiza transporte y provisiones con tiempo; confirma el estado de las carreteras rurales." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Yariguíes" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "San Vicente de Chucurí es reconocido por el cacao y por sus paisajes vinculados a la Serranía de los Yariguíes.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Conoce la producción cacaotera con productores locales y consulta por senderos o áreas naturales habilitadas." },
                { titulo: "🎭 Cultura y tradiciones", texto: "El cacao, el chocolate y sus derivados son parte central de la economía y la identidad local." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Coordina las visitas a fincas, revisa el clima y sigue las indicaciones para proteger los ecosistemas." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Metropolitana" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Santa Bárbara ofrece un paisaje de montaña y clima fresco en las cercanías del área metropolitana de Bucaramanga.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Pregunta por caminos y miradores de acceso permitido para disfrutar las vistas rurales." },
                { titulo: "🎭 Cultura y tradiciones", texto: "Las labores agrícolas y la vida campesina forman parte del carácter del municipio." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Verifica el estado de las vías y las condiciones meteorológicas antes de recorrer zonas de montaña." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Yariguíes" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Santa Helena del Opón se encuentra en un territorio de bosques y montañas relacionado con la Serranía de los Yariguíes y el río Opón.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Consulta con guías y comunidades por recorridos permitidos y condiciones de conservación del entorno natural." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La vida rural y la relación con los bosques y el río forman parte de la identidad local." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "El acceso puede ser exigente; coordina transporte, guía y provisiones, y respeta las áreas naturales." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Comunera" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Simacota combina montañas, ríos y caminos rurales en un paisaje representativo de la provincia Comunera.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Pregunta por balnearios y rutas habilitadas; revisa las condiciones del caudal antes de acercarte al agua." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La agricultura y las tradiciones campesinas acompañan la vida de sus comunidades." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Evita ríos durante lluvias, confirma accesos y consulta a residentes por las condiciones locales." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Comunera" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Suaita es un municipio de tradición agrícola, con producción panelera y paisajes rurales del sur de Santander.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Consulta por trapiches o productores que reciban visitantes para conocer el trabajo de la caña y la panela." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La panela, la cocina local y las costumbres campesinas son parte de su patrimonio cotidiano." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Coordina previamente las visitas productivas y revisa las opciones de transporte intermunicipal." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Vélez" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Sucre ofrece paisajes montañosos y caminos rurales en el occidente del departamento, con un ambiente tranquilo de pueblo.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Recorre el centro y pregunta por rutas locales y miradores accesibles." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La agricultura y las tradiciones de la provincia forman parte de la vida cotidiana del municipio." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Confirma las condiciones de las vías, el transporte y los servicios antes de viajar." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Soto Norte" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Suratá está rodeado por montañas y ecosistemas de páramo de Soto Norte, importantes para el agua y la biodiversidad.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Conoce el paisaje desde rutas autorizadas y consulta por orientación local antes de acercarte a zonas de páramo." },
                { titulo: "🎭 Cultura y tradiciones", texto: "Las comunidades campesinas mantienen una relación estrecha con las fuentes de agua y el entorno montañoso." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Respeta los nacimientos de agua, lleva abrigo y no salgas de los caminos permitidos." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Soto Norte" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Tona es un municipio de montaña con páramos y fuentes hídricas en el entorno de Santurbán, cerca del área metropolitana.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Consulta por rutas autorizadas y disfruta los paisajes altoandinos sin afectar los ecosistemas." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La vida campesina de clima frío y la protección del agua son parte de la identidad local." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Verifica accesos y clima; el páramo es frágil, así que permanece en los caminos y retira todos tus residuos." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Guanentá" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Valle de San José es un municipio de la provincia Guanentá cercano a San Gil, con paisajes rurales y tradiciones campesinas.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Recorre el centro municipal y consulta por atractivos y caminos locales para complementar una visita a San Gil." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La música, la cocina y la vida rural reflejan las tradiciones de Guanentá." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Confirma el transporte entre municipios y consulta con residentes por actividades disponibles durante tu visita." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Soto Norte" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Vetas se encuentra en un paisaje frío de alta montaña, cerca de los páramos de Santurbán, y conserva una larga historia minera.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Conoce el centro y el paisaje de montaña desde puntos permitidos; pregunta por iniciativas comunitarias de turismo." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La historia minera y la adaptación a las condiciones de altura forman parte de la identidad local." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Lleva abrigo, revisa el clima y respeta las restricciones ambientales y de acceso en el páramo." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Guanentá" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Villanueva ofrece paisajes de montaña y una ubicación cercana a Barichara y Guane, en un territorio de caminos históricos y tradiciones rurales.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Consulta por rutas locales y miradores; organiza con tiempo cualquier recorrido que conecte varios pueblos." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La arquitectura, los oficios y la cocina regional forman parte de la cultura de Guanentá." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Verifica transporte y estado de los caminos antes de combinar destinos; lleva agua para caminatas." },
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
                { label: "Departamento", val: "Santander, Colombia" },
                { label: "Provincia", val: "Mares" },
                { label: "Perfil", val: "Turismo local y cultural" },
                { label: "Plan recomendado", val: "Recorrido con orientación local" },
            ],
            intro: "Zapatoca es conocida como la Ciudad del Clima de Seda y ofrece arquitectura tradicional, miradores y atractivos naturales como la Cueva del Nitro.",
            secciones: [
                { titulo: "🗺️ Qué conocer", texto: "Explora el centro y consulta por las condiciones de acceso a miradores y cuevas con operadores locales." },
                { titulo: "🎭 Cultura y tradiciones", texto: "La historia, las celebraciones y la cocina local dan carácter a este destino del occidente santandereano." },
                { titulo: "🌿 Turismo responsable", texto: TURISMO_RESPONSABLE },
                { titulo: "💡 Consejo TourismEasy", texto: "Para visitar cuevas, sigue las normas de seguridad y usa acompañamiento autorizado; confirma horarios antes de viajar." },
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
            <source src="${escapeHtml(a.video)}" type="video/mp4" />
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
                titulo: municipio.titulo,
                subtitulo: custom.subtitulo || base.subtitulo,
                datos: Array.isArray(custom.datos) && custom.datos.length ? custom.datos : base.datos,
                intro: custom.intro || base.intro,
                secciones: Array.isArray(custom.secciones) && custom.secciones.length ? custom.secciones : base.secciones,
                ctaTexto: custom.ctaTexto || base.ctaTexto
            };
        });
        renderArticulos(articulos);
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