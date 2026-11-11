(function () {
    // ⏱️ DURACIÓN DEL DESTELLO (en segundos) que resalta la tarjeta del destino relacionado con la festividad del día.
    // Cambia SOLO este número para ajustar cuánto dura el destello (afecta el CSS y el JS automáticamente).
    const DURACION_DESTELLO_SEGUNDOS = 3;
    const API_FESTIVIDADES = new URL("../admin/festividades.php", document.currentScript.src).href;

    // 1. DICCIONARIO DE 48 FESTIVIDADES (4 POR MES) — MUNICIPALES DE SANTANDER Y NACIONALES DE COLOMBIA
    const FESTIVIDADES = {
        // ENERO
        "01-01": {
            id: "ano_nuevo",
            subtitulo: "COLOMBIA • CONMEMORACIÓN NACIONAL",
            titulo: "¡FELIZ<br>AÑO NUEVO!",
            frase: "Un nuevo año para seguir explorando Santander 🎆🥳",
            emoji: "🎆",
            colores: ["#FFCD00", "#003893", "#CE1126"], // Bandera de Colombia: Amarillo, Azul y Rojo
            bgCard: "#061630",
        },
        "01-06": {
            id: "ferias_malaga",
            subtitulo: "MÁLAGA • PROVINCIA GARCÍA ROVIRA",
            titulo: "FERIAS Y FIESTAS<br>DEL RETORNO",
            frase: "¡Capital de García Rovira! Fiesta taurina, comparsas y folclor caprino 🐐🎉",
            emoji: "🐐",
            colores: ["#009B3A", "#FFCD00", "#FFFFFF"], // Bandera de Málaga: Verde, Amarillo y Blanco
            bgCard: "#0a2311", // Fondo verde oscuro montañés
        },
        "01-10": {
            id: "neugatas_charala",
            subtitulo: "CHARALÁ • TIERRA DE PRÓCERES",
            titulo: "TRADICIONALES<br>NEUGATAS",
            frase: "¡Comparsas, disfraces y humor campesino toman las calles! 🎭🎉",
            emoji: "🎭",
            colores: ["#D21034", "#009B3A", "#FFCD00"], // Paleta alusiva a la festividad
            bgCard: "#210508",
        },
        "01-20": {
            id: "fiestas_floridablanca",
            subtitulo: "FLORIDABLANCA • TIERRA DULCE",
            titulo: "FIESTAS DE<br>SAN JUAN NEPOMUCENO",
            frase: "¡La capital mundial del dulce y la oblea está de celebración! 🥞🍯",
            emoji: "🥞",
            colores: ["#009B3A", "#FFCD00", "#FFFFFF"], // Bandera de Floridablanca: Verde, Amarillo y Blanco
            bgCard: "#1e293b",
        },
        // FEBRERO
        "02-01": {
            id: "ferias_san_andres",
            subtitulo: "SAN ANDRÉS • PROVINCIA GARCÍA ROVIRA",
            titulo: "FERIAS Y FIESTAS<br>Y ENCUENTRO FOLCLÓRICO",
            frase: "¡Cultura campesina y color en la montaña santandereana! 🎊🌄",
            emoji: "🌄",
            colores: ["#009B3A", "#FFFFFF", "#FFCD00"], // Paleta alusiva a la festividad
            bgCard: "#0c1e12",
        },
        "02-02": {
            id: "virgen_candelaria",
            subtitulo: "COLOMBIA • TRADICIÓN RELIGIOSA",
            titulo: "DÍA DE LA<br>VIRGEN DE LA CANDELARIA",
            frase: "Velas, procesiones y devoción en varios pueblos santandereanos 🕯️",
            emoji: "🕯️",
            colores: ["#FFCD00", "#FFFFFF", "#009B3A"], // Paleta alusiva a la festividad
            bgCard: "#1e293b",
        },
        "02-06": {
            id: "ferias_san_jose_miranda",
            subtitulo: "SAN JOSÉ DE MIRANDA • GARCÍA ROVIRA",
            titulo: "FERIAS Y FIESTAS<br>VIRGEN DE LOS REMEDIOS",
            frase: "¡El Pueblito Lindo de Santander se viste de fiesta! 🎶🐎",
            emoji: "🐎",
            colores: ["#D21034", "#FFCD00", "#FFFFFF"], // Paleta alusiva a la festividad
            bgCard: "#2d080c",
        },
        "02-11": {
            id: "virgen_piedra_barichara",
            subtitulo: "BARICHARA • EL PUEBLITO MÁS LINDO",
            titulo: "DÍA DE LA<br>VIRGEN DE LA PIEDRA",
            frase: "Homenaje a la patrona de los talladores de piedra amarilla 🪨🙏",
            emoji: "🪨",
            colores: ["#009B3A", "#FFCD00", "#FFFFFF"], // Bandera de Barichara: Verde, Amarillo-Ocre y Blanco
            bgCard: "#1e293b",
            destino: "barichara", // ← data-article de la tarjeta del index a resaltar
        },
        // MARZO
        "03-08": {
            id: "dia_mujer",
            subtitulo: "COLOMBIA • CONMEMORACIÓN NACIONAL",
            titulo: "DÍA INTERNACIONAL<br>DE LA MUJER",
            frase: "Reconociendo a las mujeres que construyen turismo en Santander 💜",
            emoji: "💜",
            colores: ["#8b5cf6", "#FFFFFF", "#8b5cf6"], // Paleta alusiva a la festividad
            bgCard: "#1e1033",
        },
        "03-16": {
            id: "insurreccion_comunera",
            subtitulo: "EL SOCORRO • CUNA DE LA LIBERTAD",
            titulo: "INSURRECCIÓN<br>COMUNERA",
            frase: "¡Manuela Beltrán rompe el edicto! El primer grito de libertad 📜🔥",
            emoji: "📜",
            colores: ["#D21034", "#009B3A", "#FFFFFF"], // Bandera de El Socorro: Rojo, Verde y Blanco
            bgCard: "#2d080c", // Fondo rojo carmesí histórico muy oscuro
            destino: "socorro", // ← data-article de la tarjeta del index a resaltar
        },
        "03-19": {
            id: "dia_san_jose",
            subtitulo: "COLOMBIA • TRADICIÓN RELIGIOSA",
            titulo: "DÍA DE<br>SAN JOSÉ",
            frase: "Fiestas patronales en honor a San José en varios municipios 🙏🌸",
            emoji: "🌸",
            colores: ["#FFCD00", "#009B3A", "#FFFFFF"], // Paleta alusiva a la festividad
            bgCard: "#1e293b",
        },
        "03-22": {
            id: "dia_mundial_agua",
            subtitulo: "SANTANDER • RÍOS Y CAÑONES",
            titulo: "DÍA MUNDIAL<br>DEL AGUA",
            frase: "¡Por el Fonce, el Suárez y el Chicamocha que nos regalan aventura! 🌊🛶",
            emoji: "💧",
            colores: ["#0ea5e9", "#FFFFFF", "#009B3A"], // Paleta alusiva a la festividad
            bgCard: "#0c2233",
            destino: "chicamocha", // ← data-article de la tarjeta del index a resaltar
        },
        // ABRIL
        "04-09": {
            id: "dia_memoria_victimas",
            subtitulo: "COLOMBIA • CONMEMORACIÓN NACIONAL",
            titulo: "DÍA DE LA MEMORIA Y<br>SOLIDARIDAD CON LAS VÍCTIMAS",
            frase: "Un día para recordar, sanar y seguir construyendo país 🕊️",
            emoji: "🕊️",
            colores: ["#FFFFFF", "#94a3b8", "#FFFFFF"], // Paleta alusiva a la festividad
            bgCard: "#1e293b",
        },
        "04-23": {
            id: "dia_idioma",
            subtitulo: "COLOMBIA • CULTURA",
            titulo: "DÍA DEL IDIOMA<br>Y DEL LIBRO",
            frase: "Celebrando las historias que se cuentan en cada rincón de Santander 📖",
            emoji: "📖",
            colores: ["#D21034", "#FFCD00", "#009B3A"], // Paleta alusiva a la festividad
            bgCard: "#210508",
        },
        "04-27": {
            id: "festival_vallenato",
            subtitulo: "VALLEDUPAR • COLOMBIA",
            titulo: "FESTIVAL DE LA<br>LEYENDA VALLENATA",
            frase: "El evento musical más importante de Colombia suena en todo el país 🪗🎶",
            emoji: "🪗",
            colores: ["#FFCD00", "#003893", "#CE1126"], // Bandera de Colombia: Amarillo, Azul y Rojo
            bgCard: "#061630",
        },
        "04-28": {
            id: "fiestas_sol_barrancabermeja",
            subtitulo: "BARRANCABERMEJA • CAPITAL PETROLERA",
            titulo: "FIESTAS<br>DEL SOL",
            frase: "¡Sol, río Magdalena y alegría portuaria en el puerto petrolero! ☀️🚤",
            emoji: "☀️",
            colores: ["#000000", "#FFCD00", "#009B3A"], // Paleta alusiva a la festividad
            bgCard: "#0f0f0f",
        },
        // MAYO
        "05-01": {
            id: "dia_trabajo",
            subtitulo: "COLOMBIA • CONMEMORACIÓN NACIONAL",
            titulo: "DÍA DEL<br>TRABAJO",
            frase: "Homenaje a quienes construyen el turismo santandereano cada día 👷🌎",
            emoji: "👷",
            colores: ["#FFCD00", "#003893", "#CE1126"], // Bandera de Colombia: Amarillo, Azul y Rojo
            bgCard: "#061630",
        },
        "05-11": {
            id: "batalla_palonegro",
            subtitulo: "BUCARAMANGA • MEMORIA HISTÓRICA",
            titulo: "BATALLA DE<br>PALONEGRO",
            frase: "Un episodio clave de la Guerra de los Mil Días cerca de Bucaramanga ⚔️",
            emoji: "⚔️",
            colores: ["#D21034", "#009B3A", "#FFCD00"], // Bandera de Santander
            bgCard: "#2d080c",
            destino: "bucaramanga", // ← data-article de la tarjeta del index a resaltar
        },
        "05-13": {
            id: "santanderianidad",
            subtitulo: "SANTANDER • COLOMBIA",
            titulo: "FELIZ DÍA DE LA<br>SANTANDERIANIDAD",
            frase: "¡Siempre adelante, ni un paso atrás! 🐜",
            emoji: "🐜",
            colores: ["#009B3A", "#FFCD00", "#D21034"], // Bandera de Santander: Verde, Amarillo y Rojo
            bgCard: "#111827", // Fondo elegante oscuro
        },
        "05-21": {
            id: "afrocolombianidad",
            subtitulo: "SANTANDER • INCLUSIVO",
            titulo: "DÍA DE LA<br>AFROCOLOMBIANIDAD",
            frase: "Celebrando la herencia, libertad y cultura afro en nuestra region 🤎🥁",
            emoji: "🥁",
            colores: ["#000000", "#FFCD00", "#009B3A"], // Combinación Cultural: Negro, Amarillo y Verde
            bgCard: "#0f0f0f", // Fondo negro profundo
        },
        // JUNIO
        "06-05": {
            id: "ferias_carcasi",
            subtitulo: "CARCASÍ • GARCÍA ROVIRA",
            titulo: "FERIAS Y<br>FIESTAS",
            frase: "¡Tradición campesina en lo alto de la cordillera santandereana! ⛰️🎉",
            emoji: "🎪",
            colores: ["#009B3A", "#FFFFFF", "#FFCD00"], // Paleta alusiva a la festividad
            bgCard: "#0c1e12",
        },
        "06-13": {
            id: "fiestas_retorno_mogotes",
            subtitulo: "MOGOTES • PROVINCIA GUANENTÁ",
            titulo: "FIESTAS DEL<br>RETORNO",
            frase: "¡El páramo y la tradición campesina se toman las calles! 🌾🎻",
            emoji: "🌾",
            colores: ["#FFCD00", "#009B3A", "#FFFFFF"], // Paleta alusiva a la festividad
            bgCard: "#1e293b",
        },
        "06-27": {
            id: "festival_mono_jesusmaria",
            subtitulo: "JESÚS MARÍA • VÉLEZ",
            titulo: "FESTIVAL NACIONAL<br>DEL MOÑO",
            frase: "¡Homenaje al talento artesanal y musical de la provincia de Vélez! 🎀🎸",
            emoji: "🎀",
            colores: ["#D21034", "#FFCD00", "#009B3A"], // Paleta alusiva a la festividad
            bgCard: "#210508",
        },
        "06-29": {
            id: "san_pedro_molagavita",
            subtitulo: "MOLAGAVITA • GARCÍA ROVIRA",
            titulo: "FIESTAS DE<br>SAN PEDRO",
            frase: "¡Tierra del chivo y el porrón! Tradición y alegría en la montaña ⛰️🎻",
            emoji: "🎻",
            colores: ["#009B3A", "#FFFFFF", "#FFCD00"], // Bandera de Molagavita: Verde, Blanco y Amarillo
            bgCard: "#0c1e12",
        },
        // JULIO
        "07-03": {
            id: "ferias_giron",
            subtitulo: "SAN JUAN DE GIRÓN • PUEBLO PATRIMONIO",
            titulo: "FIESTAS DEL<br>RETORNO",
            frase: "Celebrando la tradición colonial, el tabaco y la hojarasca 🍂⛪",
            emoji: "⛪",
            colores: ["#FFCD00", "#D21034", "#FFFFFF"], // Bandera de Girón: Amarillo, Amarillo-Oro y Rojo con Blanco
            bgCard: "#1e293b",
            destino: "giron", // ← data-article de la tarjeta del index a resaltar
        },
        "07-16": {
            id: "virgen_carmen_barbosa",
            subtitulo: "BARBOSA • PUERTA DE SANTANDER",
            titulo: "FIESTAS DE LA<br>VIRGEN DEL CARMEN",
            frase: "¡Festival del Río Suárez y desfile de transportadores! 🌊🚗",
            emoji: "🌊",
            colores: ["#D21034", "#FFFFFF", "#009B3A"], // Bandera de Barbosa: Rojo, Blanco y Verde
            bgCard: "#1e293b",
        },
        "07-20": {
            id: "independencia_colombia",
            subtitulo: "CONMEMORACIÓN NACIONAL",
            titulo: "INDEPENDENCIA DE<br>COLOMBIA",
            frase: "¡Orgullo patrio! 216 años de libertad, historia y diversidad",
            emoji: "🇨🇴",
            colores: ["#FFCD00", "#003893", "#CE1126"], // Bandera de Colombia: Amarillo, Azul y Rojo
            bgCard: "#061630", // Fondo azul patriótico profundo
        },
        "07-24": {
            id: "natalicio_bolivar",
            subtitulo: "COLOMBIA • CONMEMORACIÓN NACIONAL",
            titulo: "NATALICIO DE<br>SIMÓN BOLÍVAR",
            frase: "Honrando al Libertador que forjó la independencia de Colombia 🎖️",
            emoji: "🎖️",
            colores: ["#FFCD00", "#003893", "#CE1126"], // Bandera de Colombia: Amarillo, Azul y Rojo
            bgCard: "#061630",
        },
        // AGOSTO
        "08-07": {
            id: "batalla_boyaca",
            subtitulo: "FIESTA PATRIA NACIONAL",
            titulo: "BATALLA DE<br>BOYACÁ",
            frase: "Homenaje a nuestros héroes y a la consolidación de la libertad ⚔️",
            emoji: "🎖️",
            colores: ["#FFCD00", "#003893", "#CE1126"], // Bandera de Colombia: Amarillo, Azul y Rojo
            bgCard: "#061630",
        },
        "08-08": {
            id: "festival_velez",
            subtitulo: "VÉLEZ • CAPITAL DE LA GUABINA",
            titulo: "FESTIVAL NACIONAL DE<br>LA GUABINA Y EL TIPLE",
            frase: "¡Tierra del bocadillo, el traje típico y el torbellino! 🪕💃",
            emoji: "🪕",
            colores: ["#FFFFFF", "#009B3A", "#FFFFFF"], // Bandera de Vélez: Blanco y Verde (Franjas Blanco, Verde, Blanco)
            bgCard: "#082111",
            destino: "velez", // ← data-article de la tarjeta del index a resaltar
        },
        "08-16": {
            id: "ferias_zapatoca",
            subtitulo: "ZAPATOCA • CIUDAD DE LEVITÁ",
            titulo: "FERIAS Y FIESTAS<br>DE LA CORDIALIDAD",
            frase: "Clima de seda, cuevas históricas y el calor de su gente 🌲🍃",
            emoji: "🌲",
            colores: ["#009B3A", "#FFFFFF", "#FFCD00"], // Bandera de Zapatoca: Verde, Blanco y Amarillo
            bgCard: "#1e293b",
        },
        "08-30": {
            id: "festival_tiple_charala",
            subtitulo: "CHARALÁ • TIERRA DE PRÓCERES",
            titulo: "FESTIVAL DEL<br>TIPLE Y LA COMPOSICIÓN",
            frase: "Homenaje a la dinastía Martínez y a la libertad de la patria 🎸",
            emoji: "🎸",
            colores: ["#D21034", "#009B3A", "#FFCD00"], // Bandera de Charalá: Rojo, Verde y Amarillo
            bgCard: "#210508",
        },
        // SEPTIEMBRE
        "09-04": {
            id: "feria_bonita",
            subtitulo: "BUCARAMANGA",
            titulo: "¡VIENE LA<br>FERIA BONITA!",
            frase: "Ciudad de los Parques, la más hermosa de Colombia 🌳👑",
            emoji: "👑",
            colores: ["#FFCD00", "#009B3A", "#D21034"], // Bandera de Bucaramanga: Verde y Amarillo con su estrella Roja
            bgCard: "#1e293b",
            destino: "bucaramanga", // ← data-article de la tarjeta del index a resaltar
        },
        "09-15": {
            id: "semana_santanderianidad_piedecuesta",
            subtitulo: "PIEDECUESTA • TIERRA DE GARRATEROS",
            titulo: "SEMANA DE LA<br>PIEDECUESTANIDAD",
            frase: "¡Cuna del tabaco, el biche, la arcilla y el talento garrotero! 🍂🏺",
            emoji: "🏺",
            colores: ["#D21034", "#009B3A", "#D21034"], // Bandera de Piedecuesta: Franjas Rojo, Verde, Rojo
            bgCard: "#210508", // Fondo tabaco/arcilla quemada muy oscuro
        },
        "09-20": {
            id: "festival_cine_barichara",
            subtitulo: "BARICHARA • EL PUEBLITO MÁS LINDO",
            titulo: "FESTIVAL DE CINE<br>VERDE",
            frase: "Cine bajo las estrellas entre calles de piedra amarilla 🎬🌻",
            emoji: "🎬",
            colores: ["#009B3A", "#FFCD00", "#FFFFFF"], // Bandera de Barichara: Verde, Amarillo-Ocre y Blanco
            bgCard: "#1e293b",
            destino: "barichara", // ← data-article de la tarjeta del index a resaltar
        },
        "09-29": {
            id: "ferias_san_gil",
            subtitulo: "SAN GIL • CAPITAL TURÍSTICA",
            titulo: "FERIA DEL<br>TURISMO Y AVENTURA",
            frase: "Tierra del rafting, el parapente y el Río Fonce 🌊🪂",
            emoji: "🛶",
            colores: ["#009B3A", "#FFCD00", "#D21034"], // Bandera de San Gil: Azul/Verde, Amarillo y Rojo
            bgCard: "#1e293b",
            destino: "sangil", // ← data-article de la tarjeta del index a resaltar
        },
        // OCTUBRE
        "10-04": {
            id: "parapente_lossantos",
            subtitulo: "LOS SANTOS • MESA DE LOS SANTOS",
            titulo: "ENCUENTRO DE<br>PARAPENTE DEL CHICAMOCHA",
            frase: "¡Pilotos de todo el país sobrevuelan el cañón más profundo de Colombia! 🪂🦅",
            emoji: "🪂",
            colores: ["#009B3A", "#0ea5e9", "#FFFFFF"], // Paleta alusiva a la festividad
            bgCard: "#0c2233",
            destino: "lossantos", // ← data-article de la tarjeta del index a resaltar
        },
        "10-12": {
            id: "festival_retorno_barrancabermeja",
            subtitulo: "BARRANCABERMEJA • CAPITAL PETROLERA",
            titulo: "FESTIVAL DE DEPORTES<br>NÁUTICOS Y RETORNO",
            frase: "¡Calor humano, petróleo, ciénaga y la mejor pollera colorá! 🐠🔥",
            emoji: "🐠",
            colores: ["#000000", "#FFCD00", "#009B3A"], // Bandera de Barrancabermeja: Negro y Amarillo-Oro
            bgCard: "#0f0f0f",
        },
        "10-16": {
            id: "ferias_curiti",
            subtitulo: "CURITÍ • TIERRA DE TEJEDORES",
            titulo: "FERIAS Y FIESTAS<br>DEL FIQUE",
            frase: "Artesanías que tejen la historia y cultura de nuestro pueblo 🧶🌾",
            emoji: "🧶",
            colores: ["#009B3A", "#FFCD00", "#FFFFFF"], // Bandera de Curití: Verde, Amarillo y Blanco
            bgCard: "#1e293b",
        },
        "10-31": {
            id: "noche_brujas",
            subtitulo: "SANTANDER • TRADICIÓN POPULAR",
            titulo: "¡NOCHE DE<br>BRUJAS!",
            frase: "Disfraces, dulces y desfiles infantiles en los parques de la región 🎃👻",
            emoji: "🎃",
            colores: ["#FFCD00", "#000000", "#009B3A"], // Paleta alusiva a la festividad
            bgCard: "#0f0f0f",
        },
        // NOVIEMBRE
        "11-01": {
            id: "todos_los_santos",
            subtitulo: "COLOMBIA • TRADICIÓN RELIGIOSA",
            titulo: "DÍA DE<br>TODOS LOS SANTOS",
            frase: "Un día de recuerdo y devoción en toda Colombia 🕯️",
            emoji: "🕯️",
            colores: ["#FFFFFF", "#94a3b8", "#FFFFFF"], // Paleta alusiva a la festividad
            bgCard: "#1e293b",
        },
        "11-09": {
            id: "reinado_belleza",
            subtitulo: "CARTAGENA • COLOMBIA",
            titulo: "REINADO NACIONAL<br>DE BELLEZA",
            frase: "El certamen de belleza más tradicional de Colombia engalana al país 👑",
            emoji: "👑",
            colores: ["#FFCD00", "#003893", "#CE1126"], // Bandera de Colombia: Amarillo, Azul y Rojo
            bgCard: "#061630",
        },
        "11-11": {
            id: "cumpleanos_bucaramanga",
            subtitulo: "BUCARAMANGA • 300+ AÑOS",
            titulo: "CUMPLEAÑOS DE<br>LA CIUDAD BONITA",
            frase: "¡Orgullo de la capital de los santandereanos! 🌳🏢",
            emoji: "🏢",
            colores: ["#FFCD00", "#009B3A", "#D21034"], // Bandera de Bucaramanga: Amarillo, Verde y Rojo
            bgCard: "#1e293b",
            destino: "bucaramanga", // ← data-article de la tarjeta del index a resaltar
        },
        "11-16": {
            id: "ferias_paramo",
            subtitulo: "PÁRAMO • PROVINCIA GUANENTÁ",
            titulo: "FERIAS Y<br>FIESTAS",
            frase: "¡Alegría campesina en uno de los pueblos guanentinos de Santander! 🎉🐴",
            emoji: "🐴",
            colores: ["#009B3A", "#FFFFFF", "#D21034"], // Paleta alusiva a la festividad
            bgCard: "#1e293b",
        },
        // DICIEMBRE
        "12-06": {
            id: "parranda_velez",
            subtitulo: "PROVINCIA DE VÉLEZ",
            titulo: "PARRANDA<br>VELEZANA",
            frase: "¡A sonar los tiples, requintos y alpargatas en decembrina! 🪕🎄",
            emoji: "🎅",
            colores: ["#FFFFFF", "#009B3A", "#FFFFFF"], // Bandera de Vélez: Blanco y Verde
            bgCard: "#082111",
            destino: "velez", // ← data-article de la tarjeta del index a resaltar
        },
        "12-08": {
            id: "dia_velitas",
            subtitulo: "COLOMBIA • TRADICIÓN NACIONAL",
            titulo: "¡DÍA DE LAS<br>VELITAS!",
            frase: "Colombia entera se ilumina con velas y faroles para abrir la Navidad 🕯️✨",
            emoji: "🕯️",
            colores: ["#CE1126", "#FFCD00", "#FFFFFF"], // Paleta alusiva a la festividad
            bgCard: "#051f0d",
        },
        "12-22": {
            id: "creacion_departamento",
            subtitulo: "CONMEMORACIÓN HISTÓRICA",
            titulo: "CREACIÓN DEL<br>DEPARTAMENTO",
            frase: "¡Orgullosamente de la tierra del Cañón del Chicamocha! ⛰️",
            emoji: "⛰️",
            colores: ["#009B3A", "#FFCD00", "#D21034"], // Bandera de Santander
            bgCard: "#111827",
        },
        "12-24": {
            id: "navidad",
            subtitulo: "¡FELICES FIESTAS EN FAMILIA!",
            titulo: "¡FELIZ<br>NAVIDAD!",
            frase: "Que la paz, el amor y los tamales santandereanos llenen tu hogar 🎄✨",
            emoji: "🎄",
            colores: ["#CE1126", "#009B3A", "#FFFFFF"], // Combinación Navideña: Rojo, Verde y Blanco
            bgCard: "#051f0d", // Fondo verde Navidad muy navideño
        },
    };

    function inicializarAgendaCultural() {
        const mount = document.getElementById("santanderianidad");
        if (!mount) return;

        const render = () => renderAgendaSantanderiana(mount);
        if (window.TE_MUNICIPIOS_PROMISE) {
            window.TE_MUNICIPIOS_PROMISE.then(render).catch((error) => {
                console.error("No se pudieron cargar los municipios para la agenda cultural.", error);
                render();
            });
        } else {
            render();
        }
    }

    function obtenerProximaFecha(fechaClave, hoy) {
        const match = /^(\d{2})-(\d{2})$/.exec(fechaClave);
        if (!match) return null;

        const mes = Number(match[1]) - 1;
        const dia = Number(match[2]);
        const crearFecha = (anio) => new Date(anio, mes, dia);
        let fecha = crearFecha(hoy.getFullYear());

        if (fecha.getMonth() !== mes || fecha.getDate() !== dia) return null;
        if (fecha < hoy) {
            fecha = crearFecha(hoy.getFullYear() + 1);
            if (fecha.getMonth() !== mes || fecha.getDate() !== dia) return null;
        }
        return fecha;
    }

    function textoEditorial(valor) {
        const texto = String(valor || "")
            .replace(/<br\s*\/?>/gi, " ")
            .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0E}\u{FE0F}\u{200D}]/gu, "")
            .replace(/\s+([,.;!?])/g, "$1")
            .replace(/\s{2,}/g, " ")
            .trim();

        if (texto && texto === texto.toLocaleUpperCase("es")) {
            return texto.charAt(0) + texto.slice(1).toLocaleLowerCase("es");
        }
        return texto;
    }

    function obtenerMunicipio(fiesta) {
        const municipios = Array.isArray(window.TE_MUNICIPIOS) ? window.TE_MUNICIPIOS : [];
        const municipio = municipios.find((item) =>
            (fiesta.idCiudad && String(item.id) === String(fiesta.idCiudad))
            || (fiesta.destino && item.key === fiesta.destino)
        );
        if (municipio) return municipio.titulo || municipio.nombre || "";

        const destinos = Array.isArray(window.TE_DESTINOS) ? window.TE_DESTINOS : [];
        const destino = destinos.find((item) => item.key === fiesta.destino);
        return destino ? destino.titulo : "";
    }

    function etiquetaTipo(fiesta) {
        const tipo = String(fiesta.tipo || (fiesta.idCiudad || fiesta.destino ? "REGIONAL" : "NACIONAL"))
            .toUpperCase();
        return tipo === "NACIONAL" ? "Conmemoración nacional" : "Tradición regional";
    }

    function fechaLegible(fecha, incluirAnio) {
        const opciones = { day: "numeric", month: "short" };
        if (incluirAnio) opciones.year = "numeric";
        return new Intl.DateTimeFormat("es-CO", opciones).format(fecha);
    }

    function fechaISO(fecha) {
        return [
            fecha.getFullYear(),
            String(fecha.getMonth() + 1).padStart(2, "0"),
            String(fecha.getDate()).padStart(2, "0")
        ].join("-");
    }

    function colorDeFiesta(fiesta, indice, respaldo) {
        return colorValido(fiesta.colores && fiesta.colores[indice], respaldo);
    }

    function renderAgendaSantanderiana(mount) {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const fechaClaveHoy = `${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;
        const eventoHoy = FESTIVIDADES[fechaClaveHoy] || null;
        const proximos = Object.entries(FESTIVIDADES)
            .filter(([fechaClave]) => fechaClave !== fechaClaveHoy)
            .map(([fechaClave, fiesta]) => ({
                fecha: obtenerProximaFecha(fechaClave, hoy),
                fiesta
            }))
            .filter((item) => item.fecha)
            .sort((a, b) => a.fecha - b.fecha)
            .slice(0, 3);

        if (!eventoHoy && !proximos.length) {
            mount.replaceChildren();
            mount.hidden = true;
            return;
        }

        mount.hidden = false;
        const eventoDestacado = eventoHoy
            ? `<article class="snt-feature"
                style="--snt-color-1:${colorDeFiesta(eventoHoy, 0, "#009B3A")};--snt-color-2:${colorDeFiesta(eventoHoy, 1, "#FFCD00")};--snt-color-3:${colorDeFiesta(eventoHoy, 2, "#FFFFFF")}">
                <div class="snt-feature__meta">
                    <span class="snt-chip snt-chip--today">Hoy · ${escaparHTML(fechaLegible(hoy, false))}</span>
                    <span class="snt-chip">${escaparHTML(etiquetaTipo(eventoHoy))}</span>
                </div>
                <p class="snt-feature__location">${escaparHTML(textoEditorial(eventoHoy.subtitulo))}</p>
                <h3>${escaparHTML(textoEditorial(eventoHoy.titulo))}</h3>
                <p class="snt-feature__copy">${escaparHTML(textoEditorial(eventoHoy.frase))}</p>
                ${eventoHoy.idCiudad || eventoHoy.destino
                    ? `<button class="snt-action" type="button" data-snt-visit="${escaparHTML(eventoHoy.id)}">Explorar ${escaparHTML(obtenerMunicipio(eventoHoy) || "el destino")}</button>`
                    : ""}
            </article>`
            : "";

        const agendaMarkup = proximos.length
            ? `<ol class="snt-agenda__list">
                ${proximos.map(({ fecha, fiesta }) => {
                    const municipio = obtenerMunicipio(fiesta);
                    const visitar = Boolean(fiesta.idCiudad || fiesta.destino);
                    return `<li class="snt-agenda__item">
                        <time class="snt-agenda__date" datetime="${fechaISO(fecha)}">${escaparHTML(fechaLegible(fecha, fecha.getFullYear() !== hoy.getFullYear()))}</time>
                        <div class="snt-agenda__details">
                            <p>${escaparHTML(etiquetaTipo(fiesta))} · ${escaparHTML(municipio || "Santander")}</p>
                            <h4>${escaparHTML(textoEditorial(fiesta.titulo))}</h4>
                        </div>
                        ${visitar
                            ? `<button class="snt-agenda__link" type="button" data-snt-visit="${escaparHTML(fiesta.id)}" aria-label="Explorar ${escaparHTML(municipio || "el destino")}">Explorar</button>`
                            : ""}
                    </li>`;
                }).join("")}
            </ol>`
            : `<p class="snt-agenda__empty">No hay otras celebraciones próximas registradas.</p>`;

        mount.innerHTML = `
            <section class="snt-section" aria-labelledby="sntSectionTitle">
                <div class="snt-container">
                    <header class="snt-heading">
                        <p class="snt-eyebrow">Agenda cultural</p>
                        <h2 id="sntSectionTitle">Tradiciones que nos conectan</h2>
                        <p>Fechas y celebraciones de Santander para descubrir durante todo el año.</p>
                    </header>
                    <div class="snt-layout${eventoHoy ? "" : " snt-layout--agenda-only"}">
                        ${eventoDestacado}
                        <section class="snt-agenda" aria-labelledby="sntAgendaTitle">
                            <header class="snt-agenda__heading">
                                <p class="snt-eyebrow">Calendario</p>
                                <h3 id="sntAgendaTitle">Próximas fechas</h3>
                            </header>
                            ${agendaMarkup}
                        </section>
                    </div>
                </div>
            </section>`;

        mount.querySelectorAll("[data-snt-visit]").forEach((button) => {
            const fiesta = Object.values(FESTIVIDADES).find(
                (item) => String(item.id) === button.dataset.sntVisit
            );
            if (fiesta) button.addEventListener("click", () => visitarDestino(fiesta));
        });
    }

    // Busca en el index la tarjeta cuyo data-article coincide con el destino de la festividad
    // y hace scroll suave hacia ella, resaltándola brevemente.
    function resaltarTarjetaDestino(fiesta) {
        if (!fiesta.destino) return; // Si la festividad no tiene un destino asociado a una tarjeta, no hacemos nada

        const enlace = document.querySelector(
            `.card-link[data-article="${fiesta.destino}"]`
        );
        const tarjeta = enlace ? enlace.closest(".card") : null;
        if (!tarjeta) return; // No existe una tarjeta con ese destino en esta página

        // La navegación ocurre únicamente después de que el usuario pulsa "Explorar".
        tarjeta.scrollIntoView({ behavior: "smooth", block: "center" });
        tarjeta.classList.add("snt-card-destello");
        setTimeout(
            () => tarjeta.classList.remove("snt-card-destello"),
            DURACION_DESTELLO_SEGUNDOS * 1000
        );
    }

    function visitarDestino(fiesta) {
        const resaltarMunicipio = () => {
            const tarjeta = typeof window.TE_IR_A_MUNICIPIO === "function"
                ? window.TE_IR_A_MUNICIPIO(fiesta.idCiudad)
                : false;
            if (!tarjeta) {
                resaltarTarjetaDestino(fiesta);
                return;
            }

            tarjeta.classList.add("snt-card-destello");
            setTimeout(
                () => tarjeta.classList.remove("snt-card-destello"),
                DURACION_DESTELLO_SEGUNDOS * 1000
            );
        };

        if (fiesta.idCiudad && typeof window.TE_IR_A_MUNICIPIO !== "function" && window.TE_MUNICIPIOS_PROMISE) {
            window.TE_MUNICIPIOS_PROMISE.then(resaltarMunicipio).catch((error) => {
                console.error("No se pudieron cargar los municipios para visitar el destino.", error);
                resaltarTarjetaDestino(fiesta);
            });
            return;
        }
        if (fiesta.idCiudad) resaltarMunicipio();
        else resaltarTarjetaDestino(fiesta);
    }

    function escaparHTML(valor) {
        return String(valor)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function colorValido(color, respaldo) {
        return /^#[0-9a-fA-F]{6}$/.test(color || "") ? color : respaldo;
    }

    async function cargarFestividadesAdministradas() {
        try {
            const response = await fetch(API_FESTIVIDADES, { credentials: "include" });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const result = await response.json();
            if (!result.ok || !Array.isArray(result.data)) throw new Error("Respuesta de festividades inválida");

            const originales = Object.values(FESTIVIDADES);
            Object.keys(FESTIVIDADES).forEach((fecha) => delete FESTIVIDADES[fecha]);
            result.data.forEach((row) => {
                const fecha = String(row.fecha_clave || "").trim();
                const original = originales.find((item) => item.id === row.id_festividad);
                const c1 = colorValido(row.color_1, "#009B3A");
                const c2 = colorValido(row.color_2, "#FFCD00");
                const c3 = colorValido(row.color_3, "#FFFFFF");
                FESTIVIDADES[fecha] = {
                    id: row.id_festividad,
                    subtitulo: row.subtitulo,
                    titulo: row.titulo,
                    frase: row.frase,
                    emoji: row.emoji,
                    colores: [c1, c2, c3],
                    bgCard: colorValido(row.bg_card, "#1e293b"),
                    tipo: row.tipo,
                    idCiudad: row.id_ciudad ? String(row.id_ciudad).trim() : null,
                    destino: original ? original.destino : undefined,
                };
            });
        } catch (error) {
            console.error("No se pudieron cargar las festividades administradas; se usarán los datos locales.", error);
        }

        if (document.readyState === "complete") {
            inicializarAgendaCultural();
        } else {
            window.addEventListener("load", inicializarAgendaCultural, { once: true });
        }
    }

    cargarFestividadesAdministradas();
})();