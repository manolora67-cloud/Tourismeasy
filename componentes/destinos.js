(function() {
    const mount = document.getElementById("site-destinos");
    const basePath = window.location.pathname.includes("/html/") ? "../" : "";
    const DEFAULT_IMAGE = "img/TURISMEASY.png";
    const MUNICIPIO_DESCRIPCIONES = {
        "bucaramanga": "Capital de Santander, conocida como la Ciudad Bonita. Recorre sus parques, disfruta su oferta cultural y prueba la gastronomía santandereana.",
        "aguada": "Un destino de ambiente rural en la provincia de Vélez, con paisajes de montaña, caminos tranquilos y tradiciones campesinas.",
        "albania": "Descubre un rincón apacible de la provincia de Vélez, rodeado de paisajes rurales y ligado a la vida agrícola santandereana.",
        "aratoca": "Con vistas al imponente cañón del Chicamocha, Aratoca ofrece paisajes de montaña y es una de las puertas de entrada a Panachi.",
        "barbosa": "Conocida por la guayaba y el bocadillo veleño, Barbosa es un animado punto de encuentro en el sur de Santander.",
        "barichara": "Recorre sus calles de piedra, su arquitectura colonial y el Camino Real que comunica el pueblo con Guane.",
        "barrancabermeja": "A orillas del río Magdalena, Barrancabermeja reúne paisajes ribereños, actividad petrolera y la vida portuaria del Magdalena Medio.",
        "betulia": "Explora el entorno del embalse Topocoro y los paisajes de agua y montaña que distinguen este municipio santandereano.",
        "bolivar": "Un municipio de la provincia de Vélez para conocer caminos rurales, paisajes de montaña y la vida tradicional del campo santandereano.",
        "cabrera": "Disfruta la tranquilidad de su centro tradicional y los caminos rurales que atraviesan los paisajes de la provincia Guanentá.",
        "california": "Este municipio de montaña forma parte del entorno del páramo de Santurbán y conserva una larga tradición minera.",
        "capitanejo": "Ubicado junto al cañón del Chicamocha, Capitanejo combina paisajes secos de montaña con el curso del río Chicamocha.",
        "carcasi": "Conoce sus paisajes de alta montaña y la vida rural de la provincia García Rovira, en un entorno de clima fresco.",
        "cepita": "En el cañón del Chicamocha, Cepitá ofrece un paisaje de laderas áridas y vistas abiertas sobre el río.",
        "cerrito": "Puerta de entrada a los paisajes de páramo del Almorzadero, con montañas frías y escenarios de naturaleza altoandina.",
        "charala": "Cuna de historia comunera y de la batalla del río Pienta; visita sus lugares históricos y conoce sus tradiciones.",
        "charta": "Un destino de montaña de la provincia Soto Norte, con caminos rurales, clima fresco y paisajes verdes.",
        "chima": "Conoce la vida campesina y los paisajes tranquilos de este municipio de la provincia Comunera.",
        "chipata": "Un municipio de tradición rural en la provincia de Vélez, rodeado de colinas y paisajes agrícolas.",
        "cimitarra": "En el Magdalena Medio, Cimitarra invita a conocer sus paisajes de río, bosques y tierras cálidas.",
        "concepcion": "Disfruta sus paisajes de montaña y las tradiciones rurales de la provincia García Rovira, en un entorno de clima fresco.",
        "confines": "Un destino tranquilo de la provincia Comunera, con caminos rurales y paisajes de colinas para descubrir sin prisa.",
        "contratacion": "Conoce la historia de Contratación y su patrimonio ligado al antiguo lazareto, además de sus paisajes rurales.",
        "coromoro": "Recorre los paisajes de montaña de la provincia Guanentá y conoce la historia local ligada al río Pienta.",
        "curiti": "Famoso por sus tejidos de fique y el balneario natural Pescaderito, Curití combina artesanía y naturaleza.",
        "el-carmen-de-chucuri": "Territorio de tradición cacaotera, rodeado de montañas y paisajes rurales en la región de los Yariguíes.",
        "el-guacamayo": "Un destino de montaña para disfrutar caminos rurales, quebradas y la tranquilidad del paisaje santandereano.",
        "el-penon": "Explora un paisaje de formaciones rocosas, cavernas y montañas en un entorno rural del occidente santandereano.",
        "el-playon": "Entre ríos, quebradas y campos agrícolas, El Playón ofrece una escapada de naturaleza en el norte del departamento.",
        "encino": "Descubre los bosques andinos y la riqueza natural del Santuario de Fauna y Flora Guanentá Alto Río Fonce.",
        "enciso": "Conoce sus montañas, caminos campesinos y el ambiente tranquilo de la provincia García Rovira.",
        "florian": "Visita la Ventana de Tisquizoque, una cascada que atraviesa una cueva, y disfruta los paisajes montañosos de Florián.",
        "floridablanca": "Prueba las tradicionales obleas y recorre parques y espacios culturales en esta ciudad del área metropolitana de Bucaramanga.",
        "galan": "Un destino de ambiente rural, con colinas, caminos tranquilos y paisajes agrícolas de la provincia Comunera.",
        "gambita": "Conocida por sus cascadas y escenarios naturales, Gámbita es ideal para descubrir ríos y paisajes de montaña.",
        "giron": "Camina por sus calles empedradas y fachadas blancas, y conoce el patrimonio colonial de este pueblo cercano a Bucaramanga.",
        "guaca": "Disfruta los paisajes fríos de montaña y los caminos rurales de Guaca, en la provincia García Rovira.",
        "guadalupe": "Visita Las Gachas, un cauce de piedra rojiza con pozas naturales, y descubre los paisajes rurales de Guadalupe.",
        "guapota": "Un destino sereno de la provincia Comunera, con paisajes de campo y caminos que conducen al valle del río Suárez.",
        "guavata": "En la tierra de la guayaba y el bocadillo, conoce las tradiciones campesinas y los paisajes de la provincia de Vélez.",
        "guepsa": "Descubre la cultura de la guayaba y el bocadillo veleño en este municipio de tradición agrícola.",
        "hato": "Disfruta el ritmo tranquilo de la vida rural y los paisajes de colinas de la provincia Comunera.",
        "jesus-maria": "Conoce su arquitectura tradicional y recorre los paisajes rurales de montaña de la provincia de Vélez.",
        "jordan": "En el cañón del Chicamocha, Jordán conserva un ambiente sereno y caminos históricos entre montañas y río.",
        "la-belleza": "Un destino de montaña con paisajes verdes, caminos rurales y quebradas en el occidente de Santander.",
        "landazuri": "Reconocido por su producción de cacao, Landázuri invita a conocer paisajes rurales y sabores del Magdalena Medio.",
        "la-paz": "Recorre caminos rurales y descubre los paisajes de montaña y las tradiciones de este municipio de la provincia de Vélez.",
        "lebrija": "La capital piñera de Santander combina cultivos frutales, paisajes cálidos y cercanía al área metropolitana de Bucaramanga.",
        "los-santos": "Recorre la Mesa de Los Santos y disfruta sus miradores hacia el cañón del Chicamocha, además de sus fincas y cafés.",
        "macaravita": "Un destino de montaña en García Rovira, con caminos rurales y paisajes abiertos para disfrutar con calma.",
        "malaga": "Centro urbano de la provincia García Rovira, con parque principal, arquitectura tradicional y servicios para explorar la región.",
        "matanza": "Descubre sus paisajes andinos, quebradas y caminos rurales en las montañas de Soto Norte.",
        "mogotes": "Entre ríos, cascadas y montañas de la provincia Guanentá, Mogotes ofrece escenarios para disfrutar la naturaleza.",
        "molagavita": "Conoce sus caminos campesinos y paisajes de montaña en un municipio tranquilo de la provincia García Rovira.",
        "ocamonte": "Un municipio de tradición agrícola, con cultivos de caña panelera y paisajes rurales de la provincia Guanentá.",
        "oiba": "Conocida por la producción de panela, Oiba ofrece sabores tradicionales y paisajes rurales de la provincia Comunera.",
        "onzaga": "Explora los paisajes de montaña y la tradición campesina de este municipio de la provincia García Rovira.",
        "palmar": "Un destino pequeño y apacible para conocer los caminos rurales y las tradiciones de la provincia Comunera.",
        "palmas-del-socorro": "Disfruta sus paisajes de campo y caminos entre montañas en este tranquilo municipio de la provincia Comunera.",
        "paramo": "Desde aquí puedes visitar la Cueva del Indio y la cascada de Juan Curí, dos atractivos naturales de la provincia Guanentá.",
        "piedecuesta": "Conocida por sus dulces y tabacos, Piedecuesta también ofrece paisajes de montaña y miradores en la Mesa de Ruitoque.",
        "pinchote": "Tierra natal de Antonia Santos, Pinchote invita a conocer su memoria histórica y su entorno rural tradicional.",
        "puente-nacional": "Conoce su papel en la historia de la independencia y recorre las calles y paisajes de este municipio de la provincia de Vélez.",
        "puerto-parra": "Un destino cálido del Magdalena Medio, con ríos, ciénagas y paisajes de bosque para disfrutar la naturaleza.",
        "puerto-wilches": "A orillas del Magdalena, Puerto Wilches permite conocer la vida ribereña, los paisajes del río y la cultura local.",
        "rionegro": "Descubre sus paisajes de montaña, fincas y cultivos en este extenso municipio de la provincia Soto Norte.",
        "sabana-de-torres": "Conoce los paisajes cálidos y humedales del Magdalena Medio, junto con la actividad agrícola de Sabana de Torres.",
        "san-andres": "Visita la Laguna de Ortices y disfruta los paisajes de montaña de este municipio de la provincia García Rovira.",
        "san-benito": "La tradición de la guayaba y el bocadillo acompaña los paisajes rurales de este municipio de la provincia de Vélez.",
        "san-gil": "La capital turística de Santander reúne rafting en el río Fonce, actividades de aventura y un animado centro urbano.",
        "san-joaquin": "Un municipio de montaña para descubrir caminos rurales y la vida tranquila de la provincia Guanentá.",
        "san-jose-de-miranda": "Disfruta sus montañas, arquitectura tradicional y ambiente sereno en el corazón de García Rovira.",
        "san-miguel": "Conoce sus paisajes rurales de montaña y las tradiciones campesinas de la provincia García Rovira.",
        "san-vicente-de-chucuri": "Capital cacaotera de Santander, rodeada de cultivos y de los paisajes naturales de la Serranía de los Yariguíes.",
        "santa-barbara": "Un destino de clima fresco y paisajes de montaña, con caminos rurales en las cercanías del área metropolitana.",
        "santa-helena-del-opon": "Descubre sus paisajes de selva y montaña, vinculados a la Serranía de los Yariguíes y al río Opón.",
        "simacota": "Explora ríos, quebradas y caminos rurales entre los paisajes de montaña de la provincia Comunera.",
        "socorro": "Protagonista de la Revolución de los Comuneros, conserva lugares históricos y arquitectura tradicional santandereana.",
        "suaita": "Conoce sus tradiciones rurales y paisajes de caña panelera en este municipio del sur de Santander.",
        "sucre": "Un destino de montaña y caminos rurales para descubrir la tranquilidad y las tradiciones del occidente santandereano.",
        "surata": "Rodeado por montañas y páramos de Soto Norte, Suratá ofrece paisajes de agua y naturaleza altoandina.",
        "tona": "Un municipio de montaña con clima fresco, páramos y fuentes de agua en el entorno de Santurbán.",
        "valle-de-san-jose": "Conoce sus tradiciones campesinas y disfruta los paisajes de la provincia Guanentá, cerca de San Gil.",
        "velez": "Cuna de la guabina y el tiple, Vélez celebra su música y su tradición de bocadillo de guayaba.",
        "vetas": "Uno de los pueblos más altos de Colombia, rodeado por los páramos de Santurbán y una histórica tradición minera.",
        "villanueva": "Descubre sus paisajes de montaña y su cercanía a Barichara, Guane y los caminos históricos de la provincia Guanentá.",
        "zapatoca": "Conocida como la Ciudad del Clima de Seda, Zapatoca ofrece arquitectura tradicional, miradores y la Cueva del Nitro."
    };
    const LEGACY_DESTINOS = [{
            key: "bucaramanga",
            img: "img/bucaramangaa.png",
            alt: "Bucaramanga",
            badge: "Popular",
            titulo: "Bucaramanga",
            desc: "Ciudad de los parques con rutas accesibles, transporte adaptado y hoteles certificados en inclusión."
        },
        {
            key: "sangil",
            img: "img/san gil.png",
            alt: "San Gil",
            badge: "Nuevo",
            titulo: "San Gil",
            desc: "Capital de la aventura con deportes extremos adaptados, rafting accesible y guías especializados."
        },
        {
            key: "barichara",
            img: "img/barichara.png",
            alt: "Barichara",
            titulo: "Barichara",
            desc: "Pueblo más lindo de Colombia con caminos del Fonce adaptados y hospedajes inclusivos."
        },
        {
            key: "socorro",
            img: "img/socorro.png",
            alt: "Socorro",
            titulo: "Socorro",
            desc: "Cuna de la independencia con museos accesibles, rutas históricas señalizadas y transporte inclusivo."
        },
        {
            key: "giron",
            img: "img/giron.png",
            alt: "Girón",
            titulo: "Girón",
            desc: "Municipio patrimonio con calles coloniales adaptadas, puentes accesibles y gastronomía inclusiva."
        },
        {
            key: "velez",
            img: "img/velez.png",
            alt: "Vélez",
            titulo: "Vélez",
            desc: "Tierra de la guabina con festivales accesibles, hoteles adaptados y cultura viva para todos."
        },
        {
            key: "lossantos",
            img: "img/lossantos.png",
            alt: "Los Santos",
            titulo: "Los Santos",
            desc: "Municipio de paisajes imponentes con miradores, senderos naturales y experiencias locales."
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

    function destinationAliases(city) {
        const slug = slugify(city.nombre);
        const legacy = LEGACY_DESTINOS.find((item) =>
            slugify(item.titulo) === slug
            || (city.nombre.toLocaleUpperCase("es") === "SAN GIL" && item.key === "sangil")
            || (city.nombre.toLocaleUpperCase("es") === "LOS SANTOS" && item.key === "lossantos")
        );
        return [...new Set([slug, legacy && legacy.key].filter(Boolean))];
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

    function createMunicipalities(cities, content) {
        return cities.map((city, index) => {
            const aliases = destinationAliases(city);
            const legacy = LEGACY_DESTINOS.find((item) => aliases.includes(item.key));
            const saved = content.find((item) => aliases.includes(String(item.key || "").toLowerCase()));
            const titulo = titleCase(city.nombre);
            const descripcion = MUNICIPIO_DESCRIPCIONES[slugify(city.nombre)];
            const article = saved ? parseArticle(saved.article) : {};
            return {
                key: saved ? saved.key : (legacy ? legacy.key : slugify(city.nombre)),
                img: saved && saved.img ? saved.img : (legacy ? legacy.img : DEFAULT_IMAGE),
                alt: saved && saved.alt ? saved.alt : (legacy ? legacy.alt : titulo),
                badge: saved && saved.badge ? saved.badge : (legacy ? legacy.badge : ""),
                titulo,
                desc: descripcion || (saved && saved.desc) || (legacy ? legacy.desc : `Explora ${titulo}, un municipio de Santander lleno de cultura, paisajes y experiencias locales.`),
                orden: index + 1,
                publicado: true,
                municipio: true,
                article
            };
        });
    }

    function cardTemplate(destination) {
        return `
    <article class="card">
      <div class="card-img">
        <img src="${escapeHtml(destination.img)}" alt="${escapeHtml(destination.alt)}" loading="lazy" />
        ${destination.badge ? `<span class="card-badge">${escapeHtml(destination.badge)}</span>` : ""}
      </div>
      <div class="card-body">
        <h3>${escapeHtml(destination.titulo)}</h3>
        <p>${escapeHtml(destination.desc)}</p>
        <a href="#" class="card-link" data-article="${escapeHtml(destination.key)}">Conocer destino &rarr;</a>
      </div>
    </article>`;
    }

    function renderPages(destinations) {
        const pageSize = 8;
        const pages = [];
        for (let index = 0; index < destinations.length; index += pageSize) {
            pages.push(destinations.slice(index, index + pageSize));
        }
        return pages;
    }

    function updateCarousel(track, previous, next, pageIndex, pageCount) {
        track.style.transform = `translateX(-${pageIndex * 100}%)`;
        Array.from(track.children).forEach((page, index) => {
            page.setAttribute("aria-hidden", index === pageIndex ? "false" : "true");
            page.inert = index !== pageIndex;
        });
        previous.disabled = pageIndex === 0;
        next.disabled = pageIndex >= pageCount - 1;
    }

    function renderDestinos(destinations) {
        if (!mount) return;
        mount.innerHTML = `
    <section class="destinos" id="destinos">
      <div class="section-container">
        <div class="section-header">
          <div>
            <h2 class="section-title">Municipios de Santander</h2>
            <p class="section-desc">
              Explora los municipios de Santander. Usa las flechas para recorrer todos los destinos.
            </p>
          </div>
        </div>
        <div class="destinos-carousel">
          <button class="destinos-arrow destinos-arrow-prev" type="button" aria-label="Ver municipios anteriores">
            <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
          </button>
          <div class="destinos-viewport" aria-label="Carrusel de municipios">
            <div class="destinos-track">
              ${renderPages(destinations).map((page, index) => `
                <div class="destinos-page" role="group" aria-label="Municipios ${index * 8 + 1} a ${Math.min((index + 1) * 8, destinations.length)}">
                  ${page.map(cardTemplate).join("")}
                </div>
              `).join("")}
            </div>
          </div>
          <button class="destinos-arrow destinos-arrow-next" type="button" aria-label="Ver municipios siguientes">
            <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </section>`;

        const track = mount.querySelector(".destinos-track");
        const previous = mount.querySelector(".destinos-arrow-prev");
        const next = mount.querySelector(".destinos-arrow-next");
        const pageCount = track.children.length;
        let pageIndex = 0;
        const update = () => updateCarousel(track, previous, next, pageIndex, pageCount);
        const changePage = (direction) => {
            pageIndex = Math.max(0, Math.min(pageCount - 1, pageIndex + direction));
            update();
        };

        previous.addEventListener("click", () => changePage(-1));
        next.addEventListener("click", () => changePage(1));
        update();
    }

    const citiesPromise = fetch(`${basePath}datos_referencia.php?tipo=ciudades`)
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

    const contentPromise = fetch(`${basePath}admin/contenido_portada.php`)
        .then((response) => response.ok ? response.json() : null)
        .then((result) => result && result.ok && Array.isArray(result.data) ? result.data : [])
        .catch((error) => {
            console.warn("[TourismEasy] No se pudo cargar la personalización de destinos.", error);
            return [];
        });

    window.TE_DESTINOS = LEGACY_DESTINOS;
    window.TE_MUNICIPIOS_PROMISE = Promise.all([citiesPromise, contentPromise])
        .then(([cities, content]) => {
            const municipalities = createMunicipalities(cities, content);
            window.TE_MUNICIPIOS = municipalities;
            renderDestinos(municipalities);
            return municipalities;
        })
        .catch((error) => {
            console.error("[TourismEasy] No se pudieron cargar todos los municipios de Santander.", error);
            if (mount) {
                mount.innerHTML = '<section class="destinos" id="destinos"><div class="section-container"><p class="destinos-error" role="alert">No se pudo cargar el listado completo de municipios. Recarga la página o inténtalo más tarde.</p></div></section>';
            }
            return [];
        });
})();
