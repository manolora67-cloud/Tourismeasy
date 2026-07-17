(function() {
    // ⏱️ DURACIÓN DEL DESTELLO (en segundos) que resalta la tarjeta del destino relacionado con la festividad del día.
    // Cambia SOLO este número para ajustar cuánto dura el destello (afecta el CSS y el JS automáticamente).
    const DURACION_DESTELLO_SEGUNDOS = 5;

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

    function lanzarCelebracion() {
        const hoy = new Date(); // Obtener fecha actual en formato MM-DD
        const mes = String(hoy.getMonth() + 1).padStart(2, "0"); //getMonth() devuelve un valor entre 0 (enero) y 11 (diciembre), por eso sumamos 1 y padStart para asegurar formato de dos dígitos
        const dia = String(hoy.getDate()).padStart(2, "0"); //getDate() devuelve el día del mes (1-31), padStart para formato de dos dígitos

        const fechaClave = `${mes}-${dia}`;
        // const fechaClave = `09-04`;

        // Si hoy no hay ninguna festividad registrada, detenemos el script
        if (!FESTIVIDADES[fechaClave]) return;

        const fiesta = FESTIVIDADES[fechaClave]; //aqui obtenemos el objeto de la festividad correspondiente a la fecha actual

        const style = document.createElement("style");
        style.innerHTML = `
            @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@900&family=Open+Sans:wght@700&display=swap');
            
            .snt-wrapper { 
                position: fixed !important; inset: 0 !important; 
                width: 100vw !important; height: 100vh !important; 
                background: rgba(10, 15, 25, 0.98) !important; 
                display: flex !important; justify-content: center !important; 
                align-items: center !important; z-index: 999999999 !important; 
                transition: opacity 0.8s ease; padding: 15px !important;
            }

            .snt-card { 
                /* Cambiado a fondo dinámico por municipio y agregado box-shadow inteligente con su color */
                background: ${fiesta.bgCard || "#1e293b"} !important; 
                border: 4px solid ${fiesta.colores[1]} !important; 
                padding: 40px 24px !important; border-radius: 25px !important; 
                text-align: center !important; 
                box-shadow: 0 0 60px ${fiesta.colores[1]}4D !important; 
                animation: snt-pulse 1.5s ease-out;
                width: 100% !important; max-width: 520px !important; box-sizing: border-box !important;
                overflow: hidden !important; /* Evita desbordamiento visual */
            }

            .snt-title { 
                font-family: 'Montserrat', sans-serif !important; 
                color: ${fiesta.colores[1]} !important; 
                /* Ajustado clamp() y tracking para que quepan palabras ultra-largas en móviles */
                font-size: clamp(1.3rem, 5.8vw, 2.3rem) !important; 
                font-weight: 900 !important; margin: 0 !important; line-height: 1.2 !important; 
                text-transform: uppercase !important; 
                display: block !important;
                white-space: normal !important;
                letter-spacing: -0.5px !important;
                text-shadow: 2px 2px 8px rgba(0,0,0,0.6) !important; /* Sombra para resaltar texto sobre fondos de color */
            }

            .snt-bar { 
                position: fixed !important; top: 0 !important; left: 0 !important; 
                width: 100% !important; height: 8px !important; 
                background: linear-gradient(90deg, ${fiesta.colores[0]} 33%, ${fiesta.colores[1]} 33% 66%, ${fiesta.colores[2]} 66%) !important; 
                z-index: 1000000000 !important; 
            }

            .snt-banderines { 
                position: fixed; top: 8px; left: 0; width: 100%; 
                display: flex; justify-content: space-around; 
                pointer-events: none; z-index: 999999; overflow: hidden;
            }

            .banderin { 
                width: 16px; height: 18px; 
                clip-path: polygon(0 0, 100% 0, 50% 100%); 
                animation: sway 3s infinite ease-in-out; transform-origin: top; 
            }

            @media (max-width: 480px) {
                .snt-card { padding: 25px 15px !important; border-width: 3px !important; max-width: 95% !important; }
                .snt-title { font-size: clamp(1.2rem, 5.5vw, 2rem) !important; }
                .banderin:nth-child(even) { display: none; }
                .banderin { width: 14px; height: 15px; }
                .snt-ant { width: 50px; height: 50px; font-size: 25px; bottom: 15px; left: 15px; }
            }

            @keyframes sway { 0%, 100% { transform: rotate(-10deg); } 50% { transform: rotate(10deg); } }
            @keyframes snt-pulse { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }

            /* Destello que resalta la tarjeta del destino relacionado con la festividad de hoy */
            .snt-card-destello {
                animation: snt-destello 1s ease-in-out ${DURACION_DESTELLO_SEGUNDOS} !important;
                position: relative !important;
                z-index: 5 !important;
                border-radius: 16px !important;
            }
            @keyframes snt-destello {
                0%, 100% { box-shadow: 0 0 0 0 ${fiesta.colores[1]}00; transform: scale(1); }
                50% { box-shadow: 0 0 45px 12px ${fiesta.colores[1]}CC; transform: scale(1.035); }
            }
            
            .snt-pregunta {
                color: #ffffff !important; font-family: 'Open Sans', sans-serif !important;
                font-weight: 700 !important; font-size: 1.05rem !important;
                margin: 22px 0 0 !important; text-shadow: 1px 1px 4px rgba(0,0,0,0.7) !important;
            }

            .snt-btns {
                display: flex !important; gap: 12px !important; justify-content: center !important;
                margin-top: 26px !important; flex-wrap: wrap !important;
            }
            .snt-pregunta + .snt-btns { margin-top: 14px !important; }

            .snt-btn {
                font-family: 'Open Sans', sans-serif !important; font-weight: 700 !important;
                font-size: 0.95rem !important; padding: 12px 26px !important; border-radius: 50px !important;
                cursor: pointer !important; border: none !important; transition: transform 0.15s ease, box-shadow 0.15s ease !important;
            }
            .snt-btn:active { transform: scale(0.96) !important; }

            .snt-btn-yes {
                background: ${fiesta.colores[1]} !important; color: #ffffff !important;
                box-shadow: 0 4px 16px ${fiesta.colores[1]}66 !important;
            }
            .snt-btn-yes:hover { transform: translateY(-2px) !important; }

            .snt-btn-no, .snt-btn-continue {
                background: rgba(255,255,255,0.08) !important; color: #ffffff !important;
                border: 1.5px solid rgba(255,255,255,0.35) !important;
            }
            .snt-btn-no:hover, .snt-btn-continue:hover { background: rgba(255,255,255,0.16) !important; }

            .snt-ant { 
                position: fixed; bottom: 25px; left: 25px; 
                width: 60px; height: 60px; background: ${fiesta.colores[1]}; 
                border-radius: 50%; display: flex; justify-content: center; 
                align-items: center; font-size: 30px; cursor: pointer; 
                z-index: 1000000; border: 3px solid #fff; 
                box-shadow: 0 5px 15px rgba(0,0,0,0.4); 
            }
        `;
        document.head.appendChild(style);

        const storageKey = `snt_visto_${fiesta.id}`; // Clave única para cada festividad, así se muestra una vez por festividad por usuario
        const yaSeMostro = localStorage.getItem(storageKey); // Verificar si ya se mostró esta festividad en el pasado
        const path = window.location.pathname; // Verificar si estamos en la página principal (index.html o raíz) para mostrar la celebración solo ahí
        const esIndex =
            path.endsWith("index.html") || path.endsWith("/") || path === ""; // Esto asegura que la celebración solo se muestre en la página principal y no en otras secciones del sitio

        if (!yaSeMostro && esIndex) {
            // Si la festividad tiene un destino asociado, preguntamos si el usuario quiere ir a verlo.
            // Si no tiene destino, solo mostramos un botón para continuar.
            const botonesHTML = fiesta.destino
                ? `<p class="snt-pregunta">¿Quieres visitar el destino?</p>
                   <div class="snt-btns">
                        <button class="snt-btn snt-btn-yes" id="snt-btn-si">Sí, quiero visitarlo</button>
                        <button class="snt-btn snt-btn-no" id="snt-btn-no">No, gracias</button>
                   </div>`
                : `<div class="snt-btns">
                        <button class="snt-btn snt-btn-continue" id="snt-btn-continuar">Continuar explorando</button>
                   </div>`;

            const wrapper = document.createElement("div");
            wrapper.className = "snt-wrapper";
            wrapper.innerHTML = `
                <div class="snt-card">
                    <p style="color:#fff;font-family:'Open Sans';letter-spacing:5px;margin-bottom:15px;font-weight:700;text-shadow: 1px 1px 4px rgba(0,0,0,0.7);">${fiesta.subtitulo}</p>
                    <h1 class="snt-title">${fiesta.titulo}</h1>
                    <p style="color:#ffffff;font-family:'Open Sans';margin-top:25px;font-size:1.2rem;text-shadow: 1px 1px 4px rgba(0,0,0,0.7);">${fiesta.frase}</p>
                    ${botonesHTML}
                </div>`;
            document.body.appendChild(wrapper);

            if (window.confetti) {
                confetti({
                    particleCount: 600,
                    spread: 100,
                    origin: { y: 0.6 },
                    zIndex: 1000000001,
                    colors: fiesta.colores,
                });
            }
            localStorage.setItem(storageKey, "true");

            // Cierra la tarjeta con una transición suave y ejecuta un callback opcional después
            const cerrarTarjeta = (callback) => {
                wrapper.style.opacity = "0";
                setTimeout(() => {
                    wrapper.remove();
                    if (callback) callback();
                }, 800);
            };

            // El cierre ahora depende SIEMPRE de la acción del usuario, nunca de un temporizador,
            // así puede leer con calma el mensaje de la festividad.
            const btnSi = wrapper.querySelector("#snt-btn-si");
            const btnNo = wrapper.querySelector("#snt-btn-no");
            const btnContinuar = wrapper.querySelector("#snt-btn-continuar");

            if (btnSi) {
                btnSi.onclick = () => cerrarTarjeta(() => resaltarTarjetaDestino(fiesta));
            }
            if (btnNo) {
                btnNo.onclick = () => cerrarTarjeta();
            }
            if (btnContinuar) {
                btnContinuar.onclick = () => cerrarTarjeta();
            }
        }

        // 5. RENDERIZAR BANDERINES Y BOTÓN FLOTANTE CON COLORES REGIONALES
        const bar = document.createElement("div");
        bar.className = "snt-bar";
        document.body.appendChild(bar);

        const banderinesCont = document.createElement("div");
        banderinesCont.className = "snt-banderines";
        for (let i = 0; i < 20; i++) {
            const b = document.createElement("div");
            b.className = "banderin";
            b.style.backgroundColor = fiesta.colores[i % fiesta.colores.length];
            b.style.animationDelay = i * 0.2 + "s";
            banderinesCont.appendChild(b);
        }
        document.body.appendChild(banderinesCont);

        const ant = document.createElement("div");
        ant.className = "snt-ant";
        ant.innerHTML = fiesta.emoji;
        ant.onclick = () => {
            if (window.confetti) {
                confetti({
                    particleCount: 500,
                    spread: 70,
                    origin: { x: 0.05, y: 0.9 },
                    zIndex: 2000000000,
                    colors: fiesta.colores,
                });
            }
        };
        document.body.appendChild(ant);

        // 6. El scroll (destello) hacia la tarjeta del destino ya NO es automático.
        // Ahora se dispara únicamente cuando el usuario da clic en "Sí, quiero visitarlo"
        // dentro de la tarjeta de la festividad (ver botón #snt-btn-si más arriba).
    }

    // Busca en el index la tarjeta cuyo data-article coincide con el destino de la festividad
    // y hace scroll suave hacia ella, aplicándole una animación de destello con los colores de la fiesta
    function resaltarTarjetaDestino(fiesta) {
        if (!fiesta.destino) return; // Si la festividad no tiene un destino asociado a una tarjeta, no hacemos nada

        const enlace = document.querySelector(
            `.card-link[data-article="${fiesta.destino}"]`
        );
        const tarjeta = enlace ? enlace.closest(".card") : null;
        if (!tarjeta) return; // No existe una tarjeta con ese destino en esta página

        // Ya no hay espera artificial: esta función se llama justo después de que
        // el usuario dio clic en "Sí, quiero visitarlo" y la tarjeta terminó de cerrarse.
        tarjeta.scrollIntoView({ behavior: "smooth", block: "center" });
        tarjeta.classList.add("snt-card-destello");
        setTimeout(
            () => tarjeta.classList.remove("snt-card-destello"),
            DURACION_DESTELLO_SEGUNDOS * 1000
        );
    }

    if (document.readyState === "complete") {
        lanzarCelebracion();
    } // Si el documento ya se cargó, ejecutamos inmediatamente, sino esperamos al evento load para asegurar que todo el contenido esté listo antes de mostrar la celebración
    else {
        window.addEventListener("load", lanzarCelebracion);
    }
})();