(function() {
    const mount = document.getElementById("site-destinos");
    const basePath = window.location.pathname.includes("/html/") ? "../" : "";
    const DEFAULT_IMAGE = "img/TURISMEASY.png";
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
            const article = saved ? parseArticle(saved.article) : {};
            return {
                key: saved ? saved.key : (legacy ? legacy.key : slugify(city.nombre)),
                img: saved && saved.img ? saved.img : (legacy ? legacy.img : DEFAULT_IMAGE),
                alt: saved && saved.alt ? saved.alt : (legacy ? legacy.alt : titulo),
                badge: saved && saved.badge ? saved.badge : (legacy ? legacy.badge : ""),
                titulo,
                desc: saved && saved.desc
                    ? saved.desc
                    : (legacy ? legacy.desc : `Explora ${titulo}, un municipio de Santander lleno de cultura, paisajes y experiencias locales.`),
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

    function updateCarousel(track, previous, next) {
        const maxScroll = track.scrollWidth - track.clientWidth;
        previous.disabled = track.scrollLeft <= 1;
        next.disabled = track.scrollLeft >= maxScroll - 1;
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
          <div class="cards-grid destinos-track" tabindex="0" aria-label="Carrusel de municipios">
            ${destinations.map(cardTemplate).join("")}
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
        const update = () => updateCarousel(track, previous, next);
        const scroll = (direction) => {
            const card = track.querySelector(".card");
            if (!card) return;
            const styles = window.getComputedStyle(track);
            const gap = parseFloat(styles.columnGap || styles.gap) || 0;
            track.scrollBy({ left: direction * (card.getBoundingClientRect().width + gap), behavior: "smooth" });
        };

        previous.addEventListener("click", () => scroll(-1));
        next.addEventListener("click", () => scroll(1));
        track.addEventListener("scroll", update, { passive: true });
        window.addEventListener("resize", update);
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
