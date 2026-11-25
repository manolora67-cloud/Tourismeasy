(function() {
    const mount = document.getElementById("site-destinos");
    const basePath = window.location.pathname.includes("/html/") ? "../" : "";
    const DEFAULT_IMAGE = "img/TURISMEASY.png";
    const DESTINOS = [
        {
            key: "bucaramanga",
            img: "img/bucaramangaa.png",
            alt: "Bucaramanga",
            badge: "Popular",
            titulo: "Bucaramanga",
            desc: "Capital de Santander, conocida como la Ciudad Bonita. Recorre sus parques, disfruta su oferta cultural y prueba la gastronomía santandereana."
        },
        {
            key: "sangil",
            img: "img/san gil.png",
            alt: "San Gil",
            badge: "Nuevo",
            titulo: "San Gil",
            desc: "La capital turística de Santander reúne rafting en el río Fonce, actividades de aventura y un animado centro urbano."
        },
        {
            key: "barichara",
            img: "img/barichara.png",
            alt: "Barichara",
            titulo: "Barichara",
            desc: "Recorre sus calles de piedra, su arquitectura colonial y el Camino Real que comunica el pueblo con Guane."
        },
        {
            key: "socorro",
            img: "img/socorro.png",
            alt: "Socorro",
            titulo: "Socorro",
            desc: "Protagonista de la Revolución de los Comuneros, conserva lugares históricos y arquitectura tradicional santandereana."
        },
        {
            key: "giron",
            img: "img/giron.png",
            alt: "Girón",
            titulo: "Girón",
            desc: "Camina por sus calles empedradas y fachadas blancas, y conoce el patrimonio colonial de este pueblo cercano a Bucaramanga."
        },
        {
            key: "velez",
            img: "img/velez.png",
            alt: "Vélez",
            titulo: "Vélez",
            desc: "Cuna de la guabina y el tiple, Vélez celebra su música y su tradición de bocadillo de guayaba."
        },
        {
            key: "lossantos",
            img: "img/lossantos.png",
            alt: "Los Santos",
            titulo: "Los Santos",
            desc: "Recorre la Mesa de Los Santos y disfruta sus miradores hacia el cañón, además de sus fincas y cafés."
        },
        {
            key: "aguada",
            img: DEFAULT_IMAGE,
            alt: "Aguada",
            titulo: "Aguada",
            desc: "Un destino de ambiente rural en la provincia de Vélez, con paisajes de montaña, caminos tranquilos y tradiciones campesinas."
        },
        {
            key: "albania",
            img: DEFAULT_IMAGE,
            alt: "Albania",
            titulo: "Albania",
            desc: "Descubre un rincón apacible de la provincia de Vélez, rodeado de paisajes rurales y ligado a la vida agrícola santandereana."
        },
        {
            key: "aratoca",
            img: DEFAULT_IMAGE,
            alt: "Aratoca",
            titulo: "Aratoca",
            desc: "Con vistas a un imponente cañón, Aratoca ofrece paisajes de montaña y miradores para disfrutar con calma."
        },
        {
            key: "barbosa",
            img: DEFAULT_IMAGE,
            alt: "Barbosa",
            titulo: "Barbosa",
            desc: "Conocida por la guayaba y el bocadillo veleño, Barbosa es un animado punto de encuentro en el sur de Santander."
        },
        {
            key: "barrancabermeja",
            img: DEFAULT_IMAGE,
            alt: "Barrancabermeja",
            titulo: "Barrancabermeja",
            desc: "A orillas del río Magdalena, Barrancabermeja reúne paisajes ribereños, actividad petrolera y la vida portuaria del Magdalena Medio."
        },
        {
            key: "betulia",
            img: DEFAULT_IMAGE,
            alt: "Betulia",
            titulo: "Betulia",
            desc: "Explora el entorno del embalse Topocoro y los paisajes de agua y montaña que distinguen este municipio santandereano."
        },
        {
            key: "bolivar",
            img: DEFAULT_IMAGE,
            alt: "Bolívar",
            titulo: "Bolívar",
            desc: "Un municipio de la provincia de Vélez para conocer caminos rurales, paisajes de montaña y la vida tradicional del campo santandereano."
        },
        {
            key: "cabrera",
            img: DEFAULT_IMAGE,
            alt: "Cabrera",
            titulo: "Cabrera",
            desc: "Disfruta la tranquilidad de su centro tradicional y los caminos rurales que atraviesan los paisajes de la provincia Guanentá."
        },
        {
            key: "california",
            img: DEFAULT_IMAGE,
            alt: "California",
            titulo: "California",
            desc: "Este municipio de montaña forma parte del entorno del páramo de Santurbán y conserva una larga tradición minera."
        },
        {
            key: "capitanejo",
            img: DEFAULT_IMAGE,
            alt: "Capitanejo",
            titulo: "Capitanejo",
            desc: "Ubicado en un cañón cálido, Capitanejo combina paisajes secos de montaña con el curso del río."
        },
        {
            key: "carcasi",
            img: DEFAULT_IMAGE,
            alt: "Carcasí",
            titulo: "Carcasí",
            desc: "Conoce sus paisajes de alta montaña y la vida rural de la provincia García Rovira, en un entorno de clima fresco."
        },
        {
            key: "cepita",
            img: DEFAULT_IMAGE,
            alt: "Cepitá",
            titulo: "Cepitá",
            desc: "En medio de un cañón, Cepitá ofrece un paisaje de laderas áridas y vistas abiertas sobre el río."
        },
        {
            key: "cerrito",
            img: DEFAULT_IMAGE,
            alt: "El Cerrito",
            titulo: "El Cerrito",
            desc: "Puerta de entrada a los paisajes de páramo del Almorzadero, con montañas frías y escenarios de naturaleza altoandina."
        },
        {
            key: "charala",
            img: DEFAULT_IMAGE,
            alt: "Charalá",
            titulo: "Charalá",
            desc: "Cuna de historia comunera y de la batalla del río Pienta; visita sus lugares históricos y conoce sus tradiciones."
        },
        {
            key: "charta",
            img: DEFAULT_IMAGE,
            alt: "Charta",
            titulo: "Charta",
            desc: "Un destino de montaña de la provincia Soto Norte, con caminos rurales, clima fresco y paisajes verdes."
        },
        {
            key: "chima",
            img: DEFAULT_IMAGE,
            alt: "Chima",
            titulo: "Chima",
            desc: "Conoce la vida campesina y los paisajes tranquilos de este municipio de la provincia Comunera."
        },
        {
            key: "chipata",
            img: DEFAULT_IMAGE,
            alt: "Chipatá",
            titulo: "Chipatá",
            desc: "Un municipio de tradición rural en la provincia de Vélez, rodeado de colinas y paisajes agrícolas."
        },
        {
            key: "cimitarra",
            img: DEFAULT_IMAGE,
            alt: "Cimitarra",
            titulo: "Cimitarra",
            desc: "En el Magdalena Medio, Cimitarra invita a conocer sus paisajes de río, bosques y tierras cálidas."
        },
        {
            key: "concepcion",
            img: DEFAULT_IMAGE,
            alt: "Concepción",
            titulo: "Concepción",
            desc: "Disfruta sus paisajes de montaña y las tradiciones rurales de la provincia García Rovira, en un entorno de clima fresco."
        },
        {
            key: "confines",
            img: DEFAULT_IMAGE,
            alt: "Confines",
            titulo: "Confines",
            desc: "Un destino tranquilo de la provincia Comunera, con caminos rurales y paisajes de colinas para descubrir sin prisa."
        },
        {
            key: "contratacion",
            img: DEFAULT_IMAGE,
            alt: "Contratación",
            titulo: "Contratación",
            desc: "Conoce la historia de Contratación y su patrimonio ligado al antiguo lazareto, además de sus paisajes rurales."
        },
        {
            key: "coromoro",
            img: DEFAULT_IMAGE,
            alt: "Coromoro",
            titulo: "Coromoro",
            desc: "Recorre los paisajes de montaña de la provincia Guanentá y conoce la historia local ligada al río Pienta."
        },
        {
            key: "curiti",
            img: DEFAULT_IMAGE,
            alt: "Curití",
            titulo: "Curití",
            desc: "Famoso por sus tejidos de fique y el balneario natural Pescaderito, Curití combina artesanía y naturaleza."
        },
        {
            key: "el-carmen-de-chucuri",
            img: DEFAULT_IMAGE,
            alt: "El Carmen de Chucurí",
            titulo: "El Carmen de Chucurí",
            desc: "Territorio de tradición cacaotera, rodeado de montañas y paisajes rurales en la región de los Yariguíes."
        },
        {
            key: "el-guacamayo",
            img: DEFAULT_IMAGE,
            alt: "El Guacamayo",
            titulo: "El Guacamayo",
            desc: "Un destino de montaña para disfrutar caminos rurales, quebradas y la tranquilidad del paisaje santandereano."
        },
        {
            key: "el-penon",
            img: DEFAULT_IMAGE,
            alt: "El Peñón",
            titulo: "El Peñón",
            desc: "Explora un paisaje de formaciones rocosas, cavernas y montañas en un entorno rural del occidente santandereano."
        },
        {
            key: "el-playon",
            img: DEFAULT_IMAGE,
            alt: "El Playón",
            titulo: "El Playón",
            desc: "Entre ríos, quebradas y campos agrícolas, El Playón ofrece una escapada de naturaleza en el norte del departamento."
        },
        {
            key: "encino",
            img: DEFAULT_IMAGE,
            alt: "Encino",
            titulo: "Encino",
            desc: "Descubre los bosques andinos y la riqueza natural del Santuario de Fauna y Flora Guanentá Alto Río Fonce."
        },
        {
            key: "enciso",
            img: DEFAULT_IMAGE,
            alt: "Enciso",
            titulo: "Enciso",
            desc: "Conoce sus montañas, caminos campesinos y el ambiente tranquilo de la provincia García Rovira."
        },
        {
            key: "florian",
            img: DEFAULT_IMAGE,
            alt: "Florián",
            titulo: "Florián",
            desc: "Visita la Ventana de Tisquizoque, una cascada que atraviesa una cueva, y disfruta los paisajes montañosos de Florián."
        },
        {
            key: "floridablanca",
            img: DEFAULT_IMAGE,
            alt: "Floridablanca",
            titulo: "Floridablanca",
            desc: "Prueba las tradicionales obleas y recorre parques y espacios culturales en esta ciudad del área metropolitana de Bucaramanga."
        },
        {
            key: "galan",
            img: DEFAULT_IMAGE,
            alt: "Galán",
            titulo: "Galán",
            desc: "Un destino de ambiente rural, con colinas, caminos tranquilos y paisajes agrícolas de la provincia Comunera."
        },
        {
            key: "gambita",
            img: DEFAULT_IMAGE,
            alt: "Gámbita",
            titulo: "Gámbita",
            desc: "Conocida por sus cascadas y escenarios naturales, Gámbita es ideal para descubrir ríos y paisajes de montaña."
        },
        {
            key: "guaca",
            img: DEFAULT_IMAGE,
            alt: "Guaca",
            titulo: "Guaca",
            desc: "Disfruta los paisajes fríos de montaña y los caminos rurales de Guaca, en la provincia García Rovira."
        },
        {
            key: "guadalupe",
            img: DEFAULT_IMAGE,
            alt: "Guadalupe",
            titulo: "Guadalupe",
            desc: "Visita Las Gachas, un cauce de piedra rojiza con pozas naturales, y descubre los paisajes rurales de Guadalupe."
        },
        {
            key: "guapota",
            img: DEFAULT_IMAGE,
            alt: "Guapotá",
            titulo: "Guapotá",
            desc: "Un destino sereno de la provincia Comunera, con paisajes de campo y caminos que conducen al valle del río Suárez."
        },
        {
            key: "guavata",
            img: DEFAULT_IMAGE,
            alt: "Guavatá",
            titulo: "Guavatá",
            desc: "En la tierra de la guayaba y el bocadillo, conoce las tradiciones campesinas y los paisajes de la provincia de Vélez."
        },
        {
            key: "guepsa",
            img: DEFAULT_IMAGE,
            alt: "Güepsa",
            titulo: "Güepsa",
            desc: "Descubre la cultura de la guayaba y el bocadillo veleño en este municipio de tradición agrícola."
        },
        {
            key: "hato",
            img: DEFAULT_IMAGE,
            alt: "Hato",
            titulo: "Hato",
            desc: "Disfruta el ritmo tranquilo de la vida rural y los paisajes de colinas de la provincia Comunera."
        },
        {
            key: "jesus-maria",
            img: DEFAULT_IMAGE,
            alt: "Jesús María",
            titulo: "Jesús María",
            desc: "Conoce su arquitectura tradicional y recorre los paisajes rurales de montaña de la provincia de Vélez."
        },
        {
            key: "jordan",
            img: DEFAULT_IMAGE,
            alt: "Jordán",
            titulo: "Jordán",
            desc: "En un cañón de la provincia Guanentá, Jordán conserva un ambiente sereno y caminos históricos entre montañas y río."
        },
        {
            key: "la-belleza",
            img: DEFAULT_IMAGE,
            alt: "La Belleza",
            titulo: "La Belleza",
            desc: "Un destino de montaña con paisajes verdes, caminos rurales y quebradas en el occidente de Santander."
        },
        {
            key: "landazuri",
            img: DEFAULT_IMAGE,
            alt: "Landázuri",
            titulo: "Landázuri",
            desc: "Reconocido por su producción de cacao, Landázuri invita a conocer paisajes rurales y sabores del Magdalena Medio."
        },
        {
            key: "la-paz",
            img: DEFAULT_IMAGE,
            alt: "La Paz",
            titulo: "La Paz",
            desc: "Recorre caminos rurales y descubre los paisajes de montaña y las tradiciones de este municipio de la provincia de Vélez."
        },
        {
            key: "lebrija",
            img: DEFAULT_IMAGE,
            alt: "Lebrija",
            titulo: "Lebrija",
            desc: "La capital piñera de Santander combina cultivos frutales, paisajes cálidos y cercanía al área metropolitana de Bucaramanga."
        },
        {
            key: "macaravita",
            img: DEFAULT_IMAGE,
            alt: "Macaravita",
            titulo: "Macaravita",
            desc: "Un destino de montaña en García Rovira, con caminos rurales y paisajes abiertos para disfrutar con calma."
        },
        {
            key: "malaga",
            img: DEFAULT_IMAGE,
            alt: "Málaga",
            titulo: "Málaga",
            desc: "Centro urbano de la provincia García Rovira, con parque principal, arquitectura tradicional y servicios para explorar la región."
        },
        {
            key: "matanza",
            img: DEFAULT_IMAGE,
            alt: "Matanza",
            titulo: "Matanza",
            desc: "Descubre sus paisajes andinos, quebradas y caminos rurales en las montañas de Soto Norte."
        },
        {
            key: "mogotes",
            img: DEFAULT_IMAGE,
            alt: "Mogotes",
            titulo: "Mogotes",
            desc: "Entre ríos, cascadas y montañas de la provincia Guanentá, Mogotes ofrece escenarios para disfrutar la naturaleza."
        },
        {
            key: "molagavita",
            img: DEFAULT_IMAGE,
            alt: "Molagavita",
            titulo: "Molagavita",
            desc: "Conoce sus caminos campesinos y paisajes de montaña en un municipio tranquilo de la provincia García Rovira."
        },
        {
            key: "ocamonte",
            img: DEFAULT_IMAGE,
            alt: "Ocamonte",
            titulo: "Ocamonte",
            desc: "Un municipio de tradición agrícola, con cultivos de caña panelera y paisajes rurales de la provincia Guanentá."
        },
        {
            key: "oiba",
            img: DEFAULT_IMAGE,
            alt: "Oiba",
            titulo: "Oiba",
            desc: "Conocida por la producción de panela, Oiba ofrece sabores tradicionales y paisajes rurales de la provincia Comunera."
        },
        {
            key: "onzaga",
            img: DEFAULT_IMAGE,
            alt: "Onzaga",
            titulo: "Onzaga",
            desc: "Explora los paisajes de montaña y la tradición campesina de este municipio de la provincia García Rovira."
        },
        {
            key: "palmar",
            img: DEFAULT_IMAGE,
            alt: "Palmar",
            titulo: "Palmar",
            desc: "Un destino pequeño y apacible para conocer los caminos rurales y las tradiciones de la provincia Comunera."
        },
        {
            key: "palmas-del-socorro",
            img: DEFAULT_IMAGE,
            alt: "Palmas del Socorro",
            titulo: "Palmas del Socorro",
            desc: "Disfruta sus paisajes de campo y caminos entre montañas en este tranquilo municipio de la provincia Comunera."
        },
        {
            key: "paramo",
            img: DEFAULT_IMAGE,
            alt: "Páramo",
            titulo: "Páramo",
            desc: "Desde aquí puedes visitar la Cueva del Indio y la cascada de Juan Curí, dos atractivos naturales de la provincia Guanentá."
        },
        {
            key: "piedecuesta",
            img: DEFAULT_IMAGE,
            alt: "Piedecuesta",
            titulo: "Piedecuesta",
            desc: "Conocida por sus dulces y tabacos, Piedecuesta también ofrece paisajes de montaña y miradores en la Mesa de Ruitoque."
        },
        {
            key: "pinchote",
            img: DEFAULT_IMAGE,
            alt: "Pinchote",
            titulo: "Pinchote",
            desc: "Tierra natal de Antonia Santos, Pinchote invita a conocer su memoria histórica y su entorno rural tradicional."
        },
        {
            key: "puente-nacional",
            img: DEFAULT_IMAGE,
            alt: "Puente Nacional",
            titulo: "Puente Nacional",
            desc: "Conoce su papel en la historia de la independencia y recorre las calles y paisajes de este municipio de la provincia de Vélez."
        },
        {
            key: "puerto-parra",
            img: DEFAULT_IMAGE,
            alt: "Puerto Parra",
            titulo: "Puerto Parra",
            desc: "Un destino cálido del Magdalena Medio, con ríos, ciénagas y paisajes de bosque para disfrutar la naturaleza."
        },
        {
            key: "puerto-wilches",
            img: DEFAULT_IMAGE,
            alt: "Puerto Wilches",
            titulo: "Puerto Wilches",
            desc: "A orillas del Magdalena, Puerto Wilches permite conocer la vida ribereña, los paisajes del río y la cultura local."
        },
        {
            key: "rionegro",
            img: DEFAULT_IMAGE,
            alt: "Rionegro",
            titulo: "Rionegro",
            desc: "Descubre sus paisajes de montaña, fincas y cultivos en este extenso municipio de la provincia Soto Norte."
        },
        {
            key: "sabana-de-torres",
            img: DEFAULT_IMAGE,
            alt: "Sabana de Torres",
            titulo: "Sabana de Torres",
            desc: "Conoce los paisajes cálidos y humedales del Magdalena Medio, junto con la actividad agrícola de Sabana de Torres."
        },
        {
            key: "san-andres",
            img: DEFAULT_IMAGE,
            alt: "San Andrés",
            titulo: "San Andrés",
            desc: "Visita la Laguna de Ortices y disfruta los paisajes de montaña de este municipio de la provincia García Rovira."
        },
        {
            key: "san-benito",
            img: DEFAULT_IMAGE,
            alt: "San Benito",
            titulo: "San Benito",
            desc: "La tradición de la guayaba y el bocadillo acompaña los paisajes rurales de este municipio de la provincia de Vélez."
        },
        {
            key: "san-joaquin",
            img: DEFAULT_IMAGE,
            alt: "San Joaquín",
            titulo: "San Joaquín",
            desc: "Un municipio de montaña para descubrir caminos rurales y la vida tranquila de la provincia Guanentá."
        },
        {
            key: "san-jose-de-miranda",
            img: DEFAULT_IMAGE,
            alt: "San José de Miranda",
            titulo: "San José de Miranda",
            desc: "Disfruta sus montañas, arquitectura tradicional y ambiente sereno en el corazón de García Rovira."
        },
        {
            key: "san-miguel",
            img: DEFAULT_IMAGE,
            alt: "San Miguel",
            titulo: "San Miguel",
            desc: "Conoce sus paisajes rurales de montaña y las tradiciones campesinas de la provincia García Rovira."
        },
        {
            key: "san-vicente-de-chucuri",
            img: DEFAULT_IMAGE,
            alt: "San Vicente de Chucurí",
            titulo: "San Vicente de Chucurí",
            desc: "Capital cacaotera de Santander, rodeada de cultivos y de los paisajes naturales de la Serranía de los Yariguíes."
        },
        {
            key: "santa-barbara",
            img: DEFAULT_IMAGE,
            alt: "Santa Bárbara",
            titulo: "Santa Bárbara",
            desc: "Un destino de clima fresco y paisajes de montaña, con caminos rurales en las cercanías del área metropolitana."
        },
        {
            key: "santa-helena-del-opon",
            img: DEFAULT_IMAGE,
            alt: "Santa Helena del Opón",
            titulo: "Santa Helena del Opón",
            desc: "Descubre sus paisajes de selva y montaña, vinculados a la Serranía de los Yariguíes y al río Opón."
        },
        {
            key: "simacota",
            img: DEFAULT_IMAGE,
            alt: "Simacota",
            titulo: "Simacota",
            desc: "Explora ríos, quebradas y caminos rurales entre los paisajes de montaña de la provincia Comunera."
        },
        {
            key: "suaita",
            img: DEFAULT_IMAGE,
            alt: "Suaita",
            titulo: "Suaita",
            desc: "Conoce sus tradiciones rurales y paisajes de caña panelera en este municipio del sur de Santander."
        },
        {
            key: "sucre",
            img: DEFAULT_IMAGE,
            alt: "Sucre",
            titulo: "Sucre",
            desc: "Un destino de montaña y caminos rurales para descubrir la tranquilidad y las tradiciones del occidente santandereano."
        },
        {
            key: "surata",
            img: DEFAULT_IMAGE,
            alt: "Suratá",
            titulo: "Suratá",
            desc: "Rodeado por montañas y páramos de Soto Norte, Suratá ofrece paisajes de agua y naturaleza altoandina."
        },
        {
            key: "tona",
            img: DEFAULT_IMAGE,
            alt: "Tona",
            titulo: "Tona",
            desc: "Un municipio de montaña con clima fresco, páramos y fuentes de agua en el entorno de Santurbán."
        },
        {
            key: "valle-de-san-jose",
            img: DEFAULT_IMAGE,
            alt: "Valle de San José",
            titulo: "Valle de San José",
            desc: "Conoce sus tradiciones campesinas y disfruta los paisajes de la provincia Guanentá, cerca de San Gil."
        },
        {
            key: "vetas",
            img: DEFAULT_IMAGE,
            alt: "Vetas",
            titulo: "Vetas",
            desc: "Uno de los pueblos más altos de Colombia, rodeado por los páramos de Santurbán y una histórica tradición minera."
        },
        {
            key: "villanueva",
            img: DEFAULT_IMAGE,
            alt: "Villanueva",
            titulo: "Villanueva",
            desc: "Descubre sus paisajes de montaña y su cercanía a Barichara, Guane y los caminos históricos de la provincia Guanentá."
        },
        {
            key: "zapatoca",
            img: DEFAULT_IMAGE,
            alt: "Zapatoca",
            titulo: "Zapatoca",
            desc: "Conocida como la Ciudad del Clima de Seda, Zapatoca ofrece arquitectura tradicional, miradores y la Cueva del Nitro."
        }
    ];

    const escapeHtml = (value) => String(value == null ? "" : value).replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
    }[char]));

    function slugify(value) {
        return String(value || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
    }

    function titleCase(value) {
        const lowercaseWords = new Set(["de", "del", "la", "las", "los", "y"]);
        return String(value || "").toLocaleLowerCase("es")
            .split(/\s+/)
            .map((word, index) => index > 0 && lowercaseWords.has(word)
                ? word
                : word.charAt(0).toLocaleUpperCase("es") + word.slice(1))
            .join(" ");
    }

    function parseArticle(article) {
        if (article && typeof article === "object") return article;
        if (typeof article === "string") {
            try {
                return JSON.parse(article);
            } catch (error) {
                console.warn("[TourismEasy] No se pudo leer el artículo del destino.", error);
            }
        }
        return {};
    }

    function fetchMunicipalities(url) {
        return fetch(url, { cache: "no-store" })
            .then((response) => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.json();
            })
            .then((result) => {
                if (!result.ok || !result.data || !Array.isArray(result.data.ciudades)) {
                    throw new Error(result.error || "La lista de municipios no tiene el formato esperado.");
                }
                return result.data.ciudades.filter((city) => String(city.id).startsWith("68"));
            });
    }

    function createMunicipalities(cities, content, initialized) {
        const destinosMunicipales = cities.map((city, index) => {
            const slug = slugify(city.nombre);
            const nombre = titleCase(city.nombre);
            const base = DESTINOS.find((item) => item.key === slug || slugify(item.titulo) === slug) || {
                key: slug,
                img: DEFAULT_IMAGE,
                alt: nombre,
                titulo: nombre,
                desc: `Explora ${nombre}, un municipio de Santander lleno de cultura, paisajes y experiencias locales.`
            };
            const saved = content.find((item) => [slug, base.key].includes(String(item.key || "").toLowerCase()));
            const article = saved ? parseArticle(saved.article) : {};
            const mapa = article.mapa || {};
            return {
                id: String(city.id),
                key: saved ? saved.key : base.key,
                img: (saved && saved.img) || base.img,
                alt: (saved && saved.alt) || base.alt,
                badge: saved ? saved.badge || "" : base.badge || "",
                titulo: saved ? saved.titulo : base.titulo,
                desc: saved ? saved.desc : base.desc,
                orden: saved ? Number(saved.orden) || index + 1 : index + 1,
                publicado: saved
                    ? saved.publicado === true || ["1", "t", "true"].includes(String(saved.publicado).toLowerCase())
                    : !initialized,
                municipio: true,
                nombreMunicipio: nombre,
                latitud: city.latitud === null || city.latitud === undefined ? null : Number(city.latitud),
                longitud: city.longitud === null || city.longitud === undefined ? null : Number(city.longitud),
                article,
                mapaDestacado: mapa.destacado === undefined
                    ? true
                    : mapa.destacado === true
            };
        });
        const clavesMunicipales = new Set(destinosMunicipales.flatMap((destino) => [
            destino.key,
            slugify(destino.titulo)
        ]));
        const destinosAdicionales = content
            .filter((destino) => !clavesMunicipales.has(String(destino.key || "").toLowerCase())
                && !clavesMunicipales.has(slugify(destino.titulo)))
            .map((destino, index) => {
                const article = parseArticle(destino.article);
                const mapa = article.mapa || {};
                const destacado = mapa.destacado === true;
                return {
                    ...destino,
                    id: null,
                    municipio: false,
                    nombreMunicipio: destino.titulo,
                    latitud: destacado ? Number(mapa.latitud) : null,
                    longitud: destacado ? Number(mapa.longitud) : null,
                    mapaDestacado: destacado,
                    orden: Number(destino.orden) || destinosMunicipales.length + index + 1,
                    article
                };
            });
        return [...destinosMunicipales, ...destinosAdicionales]
            .sort((a, b) => a.orden - b.orden || a.titulo.localeCompare(b.titulo, "es"));
    }

    function cardTemplate(destination) {
        const imageUrl = window.TEImagenCloudinary
            ? window.TEImagenCloudinary.tarjeta(destination.img)
            : destination.img;
        return `
    <article class="card" ${destination.id ? `data-ciudad-id="${escapeHtml(destination.id)}"` : ""} data-destino-key="${escapeHtml(destination.key)}">
      <div class="card-img">
        <img data-src="${escapeHtml(imageUrl)}" alt="${escapeHtml(destination.alt)}" loading="lazy" decoding="async" />
        ${destination.badge ? `<span class="card-badge">${escapeHtml(destination.badge)}</span>` : ""}
      </div>
      <div class="card-body">
        <h3>${escapeHtml(destination.titulo)}</h3>
        <p>${escapeHtml(destination.desc)}</p>
        <a href="#" class="card-link" data-article="${escapeHtml(destination.key)}">Conocer destino &rarr;</a>
      </div>
    </article>`;
    }

    function renderPages(destinations, pageSize) {
        const pages = [];
        for (let index = 0; index < destinations.length; index += pageSize) {
            pages.push(destinations.slice(index, index + pageSize));
        }
        return pages;
    }

    function updateCarousel(track, previous, next, pagination, pageIndex, pageSize, total) {
        const pageCount = track.children.length;
        track.style.transform = `translateX(-${pageIndex * 100}%)`;
        Array.from(track.children).forEach((page, index) => {
            page.setAttribute("aria-hidden", index === pageIndex ? "false" : "true");
            page.inert = index !== pageIndex;
        });
        previous.disabled = pageIndex === 0;
        next.disabled = pageIndex >= pageCount - 1;
        const firstDestination = pageIndex * pageSize + 1;
        const lastDestination = Math.min((pageIndex + 1) * pageSize, total);
        pagination.textContent = `Página ${pageIndex + 1} · Destinos ${firstDestination}–${lastDestination} de ${total}`;
    }

    function cargarImagenesPagina(track, pageIndex) {
        const page = track.children[pageIndex];
        if (!page) return;

        page.querySelectorAll("img[data-src]").forEach((image) => {
            const fallbackUrl = new URL(DEFAULT_IMAGE, document.baseURI).href;
            const usarImagenRespaldo = () => {
                if (image.dataset.fallbackApplied !== "true" && image.src !== fallbackUrl) {
                    image.dataset.fallbackApplied = "true";
                    image.src = fallbackUrl;
                    return;
                }
                image.removeEventListener("error", usarImagenRespaldo);
                image.removeAttribute("src");
                image.alt = "";
            };
            image.addEventListener("error", usarImagenRespaldo);
            image.src = new URL(image.dataset.src, document.baseURI).href;
            image.removeAttribute("data-src");
        });
    }

    function renderDestinos(destinations, notifyChanges) {
        if (!mount) return;
        const publicDestinations = destinations
            .filter((destination) => destination.publicado)
            .sort((a, b) => a.titulo.localeCompare(b.titulo, "es", { sensitivity: "base" }));
        const mapaExistente = mount.querySelector(".destinos-mapa");
        const tarjetaActual = mount.querySelector('.destinos-page[aria-hidden="false"] .card');
        const claveActual = tarjetaActual ? tarjetaActual.dataset.destinoKey : "";
        if (!publicDestinations.length) {
            mount.innerHTML = '<section class="destinos" id="destinos"><div class="section-container"><p class="destinos-error">Próximamente encontrarás nuevos destinos de Santander.</p></div></section>';
            const contenedorVacio = mount.querySelector(".section-container");
            if (mapaExistente && contenedorVacio) contenedorVacio.appendChild(mapaExistente);
            if (notifyChanges) {
                window.dispatchEvent(new CustomEvent("tourismeasy:destinos-actualizados", {
                    detail: { destinos }
                }));
            }
            return;
        }
        mount.innerHTML = `
    <section class="destinos" id="destinos">
      <div class="section-container">
        <div class="section-header">
          <div>
            <h2 class="section-title">Descubre los destinos</h2>
            <p class="section-desc">
              Explora los municipios, corregimientos y otros lugares de Santander.
            </p>
          </div>
        </div>
        <div class="destinos-carousel">
          <button class="destinos-arrow destinos-arrow-prev" type="button" aria-label="Ver destinos anteriores">
            <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
          </button>
          <div class="destinos-viewport" aria-label="Carrusel de destinos">
            <div class="destinos-track">
            </div>
          </div>
          <button class="destinos-arrow destinos-arrow-next" type="button" aria-label="Ver destinos siguientes">
            <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
          </button>
        </div>
        <p class="destinos-paginacion" aria-live="polite"></p>
      </div>
    </section>`;

        const contenedor = mount.querySelector(".section-container");
        const encabezado = contenedor.querySelector(".section-header");
        if (mapaExistente) contenedor.insertBefore(mapaExistente, encabezado);

        const track = mount.querySelector(".destinos-track");
        const previous = mount.querySelector(".destinos-arrow-prev");
        const next = mount.querySelector(".destinos-arrow-next");
        const pagination = mount.querySelector(".destinos-paginacion");
        const mobileLayout = window.matchMedia("(max-width: 767px)");
        let pageSize = mobileLayout.matches ? 4 : 8;
        let pageIndex = 0;
        const renderCarousel = (firstMunicipality = 0) => {
            pageSize = mobileLayout.matches ? 4 : 8;
            const pages = renderPages(publicDestinations, pageSize);
            track.innerHTML = pages.map((page, index) => `
                <div class="destinos-page" role="group" aria-label="Destinos ${index * pageSize + 1} a ${Math.min((index + 1) * pageSize, publicDestinations.length)}">
                  ${page.map(cardTemplate).join("")}
                </div>
              `).join("");
            pageIndex = Math.min(Math.floor(firstMunicipality / pageSize), pages.length - 1);
            updateCarousel(track, previous, next, pagination, pageIndex, pageSize, publicDestinations.length);
            cargarImagenesPagina(track, pageIndex);
        };
        const update = () => {
            updateCarousel(track, previous, next, pagination, pageIndex, pageSize, publicDestinations.length);
            cargarImagenesPagina(track, pageIndex);
        };
        window.TE_IR_A_MUNICIPIO = (idCiudad) => {
            const card = Array.from(track.querySelectorAll(".card[data-ciudad-id]"))
                .find((element) => element.dataset.ciudadId === String(idCiudad));
            if (!card) return false;

            const page = card.closest(".destinos-page");
            const targetPageIndex = Array.from(track.children).indexOf(page);
            if (targetPageIndex < 0) return false;

            pageIndex = targetPageIndex;
            update();
            const cardBounds = card.getBoundingClientRect();
            window.scrollTo({
                top: Math.max(0, window.scrollY + cardBounds.top - (window.innerHeight - cardBounds.height) / 2),
                behavior: "smooth"
            });
            return card;
        };
        const changePage = (direction) => {
            pageIndex = Math.max(0, Math.min(track.children.length - 1, pageIndex + direction));
            update();
        };

        previous.addEventListener("click", () => changePage(-1));
        next.addEventListener("click", () => changePage(1));
        const indiceActual = publicDestinations.findIndex((destination) => destination.key === claveActual);
        renderCarousel(indiceActual < 0 ? 0 : indiceActual);
        mobileLayout.addEventListener("change", () => renderCarousel(pageIndex * pageSize));
        if (notifyChanges) {
            window.dispatchEvent(new CustomEvent("tourismeasy:destinos-actualizados", {
                detail: { destinos }
            }));
        }
    }

    const citiesPromise = fetchMunicipalities(`${basePath}datos_referencia.php?tipo=ciudades`);
    let destinosInicializados = false;
    let destinosRefreshInFlight = false;
    let destinosSnapshot = null;

    async function cargarContenidoPortada(url) {
        let ultimoError;
        for (let intento = 0; intento < 3; intento += 1) {
            try {
                const response = await fetch(url, { cache: "no-store" });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const result = await response.json();
                if (!result.ok || !Array.isArray(result.data)) {
                    throw new Error(result.error || "La respuesta de contenido no tiene el formato esperado.");
                }
                return { data: result.data, initialized: result.initialized === true };
            } catch (error) {
                ultimoError = error;
                if (intento < 2) {
                    await new Promise((resolve) => window.setTimeout(resolve, 300 * (intento + 1)));
                }
            }
        }
        throw ultimoError;
    }

    const contentPromise = cargarContenidoPortada(`${basePath}admin/contenido_portada.php`);

    window.TE_DESTINOS = DESTINOS;
    window.TE_MUNICIPIOS_PROMISE = Promise.all([citiesPromise, contentPromise])
        .then(([cities, content]) => {
            const municipalities = createMunicipalities(cities, content.data, content.initialized);
            window.TE_MUNICIPIOS = municipalities;
            destinosSnapshot = JSON.stringify(municipalities);
            destinosInicializados = true;
            renderDestinos(municipalities);
            return municipalities;
        })
        .catch((error) => {
            console.error("[TourismEasy] No se pudieron cargar los destinos de Santander.", error);
            destinosInicializados = true;
            if (mount) {
                mount.innerHTML = '<section class="destinos" id="destinos"><div class="section-container"><p class="destinos-error" role="alert">No se pudo cargar la lista de destinos. Recarga la página o inténtalo más tarde.</p></div></section>';
            }
            return [];
        });

    async function actualizarDestinosPublicados() {
        if (!mount || !destinosInicializados || destinosRefreshInFlight
            || document.visibilityState !== "visible" || !mount.getClientRects().length) return;
        const elementoActivo = document.activeElement;
        if ((elementoActivo && mount.contains(elementoActivo)
                && ["INPUT", "SELECT", "TEXTAREA"].includes(elementoActivo.tagName))
            || mount.querySelector(".leaflet-popup")
            || document.querySelector(".art-overlay.open")) return;

        destinosRefreshInFlight = true;
        try {
            const [cities, content] = await Promise.all([
                fetchMunicipalities(`${basePath}datos_referencia.php?tipo=ciudades`),
                cargarContenidoPortada(`${basePath}admin/contenido_portada.php`)
            ]);
            const municipalities = createMunicipalities(cities, content.data, content.initialized);
            const snapshot = JSON.stringify(municipalities);
            if (snapshot === destinosSnapshot) return;

            destinosSnapshot = snapshot;
            window.TE_MUNICIPIOS = municipalities;
            window.TE_MUNICIPIOS_PROMISE = Promise.resolve(municipalities);
            renderDestinos(municipalities, true);
        } catch (error) {
            console.error("[TourismEasy] No se pudieron actualizar los destinos en segundo plano.", error);
        } finally {
            destinosRefreshInFlight = false;
        }
    }

    window.setInterval(actualizarDestinosPublicados, 30000);
})();