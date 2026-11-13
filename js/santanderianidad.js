(function () {
    // ⏱️ DURACIÓN DEL DESTELLO (en segundos) que resalta la tarjeta del destino relacionado con la festividad del día.
    // Cambia SOLO este número para ajustar cuánto dura el destello (afecta el CSS y el JS automáticamente).
    const DURACION_DESTELLO_SEGUNDOS = 4;
    const SCRIPT_URL = document.currentScript.src;
    const API_FESTIVIDADES = new URL("../admin/festividades.php", SCRIPT_URL).href;
    const SITE_ROOT = new URL("../", SCRIPT_URL);
    const AVISO_FESTIVIDAD_SEEN_KEY = "tourismeasy_aviso_festividad_seen";

    // La tabla no incluye la clave de la tarjeta para estos eventos sin ciudad asociada.
    const DESTINOS_POR_FESTIVIDAD = {
        "virgen_piedra_barichara": "barichara",
        "dia_mundial_agua": "chicamocha",
        "batalla_palonegro": "bucaramanga",
        "parapente_lossantos": "lossantos",
    };
    const CATEGORIAS_FESTIVIDADES = [
        { id: "PAISAJES", nombre: "Paisajes", imagen: "img/festividades/web/canon.jpg" },
        { id: "PATRIMONIO", nombre: "Patrimonio", imagen: "img/festividades/web/calle_colonial.jpg" },
        { id: "MUSICA", nombre: "Música", imagen: "img/festividades/web/musicos.jpg" },
        { id: "TRADICION", nombre: "Tradición", imagen: "img/festividades/web/artesano.jpg" },
    ];
    function yaSeMostroAvisoFestividad() {
        try {
            return window.sessionStorage.getItem(AVISO_FESTIVIDAD_SEEN_KEY) === "1";
        } catch (error) {
            console.error("[TourismEasy] No se pudo leer el estado del aviso de festividad:", error);
            return false;
        }
    }

    function guardarAvisoFestividadMostrado() {
        try {
            window.sessionStorage.setItem(AVISO_FESTIVIDAD_SEEN_KEY, "1");
        } catch (error) {
            console.error("[TourismEasy] No se pudo guardar el estado del aviso de festividad:", error);
        }
    }

    let festividades = [];
    let avisoFestividadMostrado = yaSeMostroAvisoFestividad();
    let avisoFestividadProgramado = false;

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

    function fechaClaveDeDia(fecha) {
        return `${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;
    }

    function abrirAvisoFestividad(mount) {
        if (avisoFestividadMostrado || avisoFestividadProgramado) return;
        avisoFestividadProgramado = true;

        const welcomeScreen = document.getElementById("welcomeScreen");
        const abrir = () => {
            if (mount.open) return;
            mount.showModal();
            avisoFestividadMostrado = true;
            guardarAvisoFestividadMostrado();
            const closeButton = mount.querySelector("[data-snt-notice-close]");
            if (closeButton) closeButton.focus();
        };
        if (!welcomeScreen || welcomeScreen.hidden) {
            abrir();
            return;
        }

        const observer = new MutationObserver(() => {
            if (!welcomeScreen.hidden) return;
            observer.disconnect();
            abrir();
        });
        observer.observe(welcomeScreen, { attributes: true, attributeFilter: ["hidden"] });
    }

    function renderAvisoFestividadHoy(mount) {
        const hoy = new Date();
        const fiesta = festividades.find((item) => item.fechaClave === fechaClaveDeDia(hoy));
        if (!fiesta) {
            if (mount.open) mount.close();
            mount.innerHTML = "";
            return;
        }

        const enlaceFestividades = new URL("html/festividades.html", SITE_ROOT).href;
        const fechaTexto = new Intl.DateTimeFormat("es-CO", {
            day: "numeric",
            month: "long"
        }).format(hoy);
        const tieneDestino = Boolean(fiesta.idCiudad);
        mount.innerHTML = `
            <button class="snt-home-notice__close" type="button" data-snt-notice-close aria-label="Cerrar aviso">
                <span aria-hidden="true">&times;</span>
            </button>
            <div class="snt-home-notice__media">
                <img class="snt-home-notice__image"
                    src="${escaparHTML(urlImagenFiesta(fiesta, "tarjeta"))}"
                    alt="${escaparHTML(altImagenFiesta(fiesta))}" loading="lazy" decoding="async">
                <span class="snt-home-notice__badge">Festividad de hoy</span>
            </div>
            <div class="snt-home-notice__body">
                <p class="snt-home-notice__eyebrow">
                    <span>Hoy</span>
                    <span class="snt-home-notice__separator" aria-hidden="true">·</span>
                    ${escaparHTML(fechaTexto)}
                    <span class="snt-home-notice__separator" aria-hidden="true">·</span>
                    ${escaparHTML(etiquetaCategoria(fiesta.categoria))}
                </p>
                <h2 id="sntHomeNoticeTitle">${escaparHTML(textoEditorial(fiesta.titulo))}</h2>
                <p id="sntHomeNoticeDescription" class="snt-home-notice__context">${escaparHTML(textoEditorial(fiesta.subtitulo))}</p>
                <p class="snt-home-notice__copy">${escaparHTML(textoEditorial(fiesta.frase))}</p>
                <div class="snt-home-notice__actions">
                    ${tieneDestino
                        ? `<button class="snt-home-notice__link" type="button" data-snt-notice-explore>
                            Explorar municipio <span aria-hidden="true">&rarr;</span>
                        </button>`
                        : ""}
                    <a class="${tieneDestino ? "snt-home-notice__secondary-link" : "snt-home-notice__link"}"
                        href="${escaparHTML(enlaceFestividades)}#sntCalendarTitle">
                        Ver agenda de festividades <span aria-hidden="true">&rarr;</span>
                    </a>
                </div>
            </div>`;
        mount.setAttribute("aria-labelledby", "sntHomeNoticeTitle");
        mount.setAttribute("aria-describedby", "sntHomeNoticeDescription");
        mount.style.setProperty("--snt-notice-accent", colorDeFiesta(fiesta, 0, "#009B3A"));
        mount.querySelector("[data-snt-notice-close]").addEventListener("click", () => mount.close());
        const exploreButton = mount.querySelector("[data-snt-notice-explore]");
        if (exploreButton) {
            exploreButton.addEventListener("click", () => {
                mount.close();
                visitarDestino(fiesta);
            });
        }
        mount.onclick = (event) => {
            if (event.target === mount) mount.close();
        };
        abrirAvisoFestividad(mount);
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
        const destinoKey = fiesta.destino || DESTINOS_POR_FESTIVIDAD[fiesta.id];
        const municipio = municipios.find((item) =>
            (fiesta.idCiudad && String(item.id) === String(fiesta.idCiudad))
            || (destinoKey && item.key === destinoKey)
        );
        if (municipio) return municipio.titulo || municipio.nombre || "";

        const destinos = Array.isArray(window.TE_DESTINOS) ? window.TE_DESTINOS : [];
        const destino = destinos.find((item) => item.key === destinoKey);
        return destino ? destino.titulo : "";
    }

    function claveTipo(fiesta) {
        return String(fiesta.tipo || (fiesta.idCiudad || fiesta.destino ? "REGIONAL" : "NACIONAL"))
            .toUpperCase();
    }

    function etiquetaTipo(fiesta) {
        const tipo = claveTipo(fiesta);
        return tipo === "NACIONAL" ? "Conmemoración nacional" : "Tradición regional";
    }

    function obtenerLugarCalendario(fiesta) {
        const municipio = obtenerMunicipio(fiesta);
        if (municipio) return textoEditorial(municipio);

        const contexto = textoEditorial(fiesta.subtitulo);
        return contexto.split(/\s+[•·]\s+/)[0] || contexto || "Santander";
    }

    function obtenerContextoCalendario(fiesta) {
        return textoEditorial(fiesta.subtitulo) || obtenerLugarCalendario(fiesta);
    }

    function etiquetaMes(fechaClave) {
        const match = /^(\d{2})-(\d{2})$/.exec(fechaClave);
        if (!match) return "";

        const nombre = new Intl.DateTimeFormat("es-CO", { month: "long" })
            .format(new Date(2000, Number(match[1]) - 1, 1));
        return nombre.charAt(0).toLocaleUpperCase("es") + nombre.slice(1);
    }

    function fechaLegible(fecha, incluirAnio) {
        const opciones = { day: "numeric", month: "short" };
        if (incluirAnio) opciones.year = "numeric";
        return new Intl.DateTimeFormat("es-CO", opciones).format(fecha);
    }

    function fechaFichaMarkup(fecha, hoy) {
        const mes = new Intl.DateTimeFormat("es-CO", { month: "short" })
            .format(fecha)
            .replace(/\.$/, "");
        const anio = fecha.getFullYear() !== hoy.getFullYear()
            ? `<span class="snt-date-badge__year">${fecha.getFullYear()}</span>`
            : "";
        return `<span class="snt-date-badge__day">${String(fecha.getDate()).padStart(2, "0")}</span>
            <span class="snt-date-badge__month">${escaparHTML(mes)}</span>${anio}`;
    }

    function etiquetaProximidad(fecha, hoy) {
        const fechaUTC = Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
        const hoyUTC = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
        const dias = Math.round((fechaUTC - hoyUTC) / 86400000);
        if (dias <= 0) return "Hoy";
        if (dias === 1) return "Mañana";
        return `En ${dias} días`;
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

    function categoriaValida(categoria) {
        return CATEGORIAS_FESTIVIDADES.some((item) => item.id === categoria)
            ? categoria
            : "TRADICION";
    }

    function etiquetaCategoria(categoria) {
        const categoriaEncontrada = CATEGORIAS_FESTIVIDADES.find(
            (item) => item.id === categoriaValida(categoria)
        );
        return categoriaEncontrada.nombre;
    }

    function urlImagenFiesta(fiesta, variante) {
        let url = fiesta.imagenUrl;
        if (url) {
            try {
                const candidata = new URL(url);
                if (
                    candidata.protocol !== "https:"
                    || candidata.hostname !== "res.cloudinary.com"
                    || candidata.username
                    || candidata.password
                    || !candidata.pathname.includes("/image/upload/")
                ) {
                    url = "";
                } else {
                    url = candidata.href;
                }
            } catch (error) {
                url = "";
            }
        }
        if (!url) {
            const categoria = CATEGORIAS_FESTIVIDADES.find(
                (item) => item.id === categoriaValida(fiesta.categoria)
            );
            url = new URL(categoria.imagen, SITE_ROOT).href;
        }
        const cloudinary = window.TEImagenCloudinary;
        return cloudinary && typeof cloudinary[variante] === "function"
            ? cloudinary[variante](url)
            : url;
    }

    function altImagenFiesta(fiesta) {
        return fiesta.imagenUrl
            ? `Fotografía de ${textoEditorial(fiesta.titulo)}`
            : `Imagen de ${etiquetaCategoria(fiesta.categoria)}`;
    }

    function abrirDetalleFestividad(dialogo, fiesta) {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const fecha = obtenerProximaFecha(fiesta.fechaClave, hoy);
        if (!fecha) return;

        const titulo = textoEditorial(fiesta.titulo);
        const contexto = obtenerContextoCalendario(fiesta);
        const frase = textoEditorial(fiesta.frase);
        const tieneDestino = Boolean(fiesta.idCiudad || fiesta.destino);
        const incluirAnio = fecha.getFullYear() !== hoy.getFullYear();

        dialogo.innerHTML = `
            <button class="snt-home-notice__close" type="button" data-snt-detail-close aria-label="Cerrar detalles de ${escaparHTML(titulo)}">
                <span aria-hidden="true">&times;</span>
            </button>
            <div class="snt-home-notice__media">
                <img class="snt-home-notice__image"
                    src="${escaparHTML(urlImagenFiesta(fiesta, "portada"))}"
                    alt="${escaparHTML(altImagenFiesta(fiesta))}" loading="eager" decoding="async">
                <span class="snt-home-notice__badge">${escaparHTML(etiquetaProximidad(fecha, hoy))}</span>
            </div>
            <div class="snt-home-notice__body">
                <p class="snt-home-notice__eyebrow">
                    <span>${escaparHTML(fechaLegible(fecha, incluirAnio))}</span>
                    <span class="snt-home-notice__separator" aria-hidden="true">·</span>
                    ${escaparHTML(etiquetaCategoria(fiesta.categoria))}
                    <span class="snt-home-notice__separator" aria-hidden="true">·</span>
                    ${escaparHTML(etiquetaTipo(fiesta))}
                </p>
                <h2 id="sntDetailTitle">${escaparHTML(titulo)}</h2>
                <p id="sntDetailContext" class="snt-home-notice__context">${escaparHTML(contexto)}</p>
                ${frase ? `<p class="snt-home-notice__copy">${escaparHTML(frase)}</p>` : ""}
                ${tieneDestino
                    ? `<div class="snt-home-notice__actions">
                        <button class="snt-home-notice__link" type="button" data-snt-detail-explore>
                            ${fiesta.idCiudad ? "Explorar municipio" : "Explorar el destino"}
                            <span aria-hidden="true">&rarr;</span>
                        </button>
                    </div>`
                    : ""}
            </div>`;
        dialogo.setAttribute("aria-labelledby", "sntDetailTitle");
        dialogo.setAttribute("aria-describedby", "sntDetailContext");
        dialogo.style.setProperty("--snt-notice-accent", colorDeFiesta(fiesta, 0, "#009B3A"));
        dialogo.querySelector("[data-snt-detail-close]").addEventListener("click", () => dialogo.close());
        const botonExplorar = dialogo.querySelector("[data-snt-detail-explore]");
        if (botonExplorar) {
            botonExplorar.addEventListener("click", () => {
                dialogo.close();
                visitarDestino(fiesta);
            });
        }
        dialogo.onclick = (event) => {
            if (event.target === dialogo) dialogo.close();
        };
        dialogo.showModal();
        dialogo.querySelector("[data-snt-detail-close]").focus();
    }

    function renderAgendaSantanderiana(mount) {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const fechaClaveHoy = fechaClaveDeDia(hoy);
        const eventoHoy = festividades.find((fiesta) => fiesta.fechaClave === fechaClaveHoy) || null;
        const proximos = festividades
            .filter((fiesta) => fiesta.fechaClave !== fechaClaveHoy)
            .map((fiesta) => ({
                fecha: obtenerProximaFecha(fiesta.fechaClave, hoy),
                fiesta
            }))
            .filter((item) => item.fecha)
            .sort((a, b) => a.fecha - b.fecha);

        if (!festividades.length) {
            mount.hidden = false;
            mount.innerHTML = `
                <section class="snt-section" aria-labelledby="sntSectionTitle">
                    <div class="snt-container">
                        <header class="snt-heading">
                            <p class="snt-eyebrow">Agenda cultural</p>
                            <h2 id="sntSectionTitle">Tradiciones que nos conectan</h2>
                        </header>
                        <p class="snt-unavailable" role="status">Aún no hay festividades registradas para mostrar.</p>
                    </div>
                </section>`;
            return;
        }

        mount.hidden = false;
        const destacado = eventoHoy
            ? { fecha: hoy, fiesta: eventoHoy }
            : proximos[0] || null;
        const tieneDestinoDestacado = Boolean(
            destacado && (destacado.fiesta.idCiudad || destacado.fiesta.destino)
        );
        const eventoDestacado = destacado
            ? `<article class="snt-feature"
                style="--snt-color-1:${colorDeFiesta(destacado.fiesta, 0, "#009B3A")};--snt-color-2:${colorDeFiesta(destacado.fiesta, 1, "#FFCD00")};--snt-color-3:${colorDeFiesta(destacado.fiesta, 2, "#FFFFFF")}">
                <div class="snt-feature__meta">
                    <span class="snt-chip snt-chip--highlight">${escaparHTML(etiquetaProximidad(destacado.fecha, hoy))}</span>
                    <span class="snt-chip">${escaparHTML(etiquetaCategoria(destacado.fiesta.categoria))}</span>
                    <span class="snt-chip">${escaparHTML(etiquetaTipo(destacado.fiesta))}</span>
                </div>
                <div class="snt-feature__visual">
                    <img src="${escaparHTML(urlImagenFiesta(destacado.fiesta, "portada"))}" alt="${escaparHTML(altImagenFiesta(destacado.fiesta))}" loading="eager" decoding="async" fetchpriority="high">
                    <time class="snt-feature__date" datetime="${fechaISO(destacado.fecha)}" aria-label="Fecha: ${escaparHTML(fechaLegible(destacado.fecha, destacado.fecha.getFullYear() !== hoy.getFullYear()))}">
                        <span class="snt-feature__date-day">${String(destacado.fecha.getDate()).padStart(2, "0")}</span>
                        <span class="snt-feature__date-month">${escaparHTML(new Intl.DateTimeFormat("es-CO", { month: "long" }).format(destacado.fecha))}</span>
                    </time>
                </div>
                <div class="snt-feature__content">
                    <p class="snt-feature__location"><span>Contexto cultural</span>${escaparHTML(textoEditorial(destacado.fiesta.subtitulo))}</p>
                    <h3>${escaparHTML(textoEditorial(destacado.fiesta.titulo))}</h3>
                    <p class="snt-feature__copy">${escaparHTML(textoEditorial(destacado.fiesta.frase))}</p>
                </div>
                ${tieneDestinoDestacado
                    ? `<div class="snt-feature__actions">
                        <button class="snt-action" type="button" data-snt-visit="${escaparHTML(destacado.fiesta.id)}">
                            ${destacado.fiesta.idCiudad ? "Explorar municipio" : "Explorar el destino"}
                            <span aria-hidden="true">&rarr;</span>
                        </button>
                    </div>`
                    : ""}
            </article>`
            : "";

        const eventosCalendario = festividades
            .map((fiesta) => ({
                fiesta,
                fecha: obtenerProximaFecha(fiesta.fechaClave, hoy),
            }))
            .filter((item) => item.fecha)
            .sort((a, b) => a.fecha - b.fecha);
        const meses = [...new Set(eventosCalendario.map(({ fiesta }) => fiesta.fechaClave.slice(0, 2)))]
            .sort();
        const tipos = [...new Set(eventosCalendario.map(({ fiesta }) => claveTipo(fiesta)))].sort();
        const lugares = [...new Set(eventosCalendario.map(({ fiesta }) => obtenerLugarCalendario(fiesta)))]
            .sort((a, b) => a.localeCompare(b, "es"));

        const calendarioMarkup = eventosCalendario.length
            ? `<section class="snt-calendar" aria-labelledby="sntCalendarTitle">
                <header class="snt-calendar__heading">
                    <p class="snt-eyebrow">Todas las fechas</p>
                    <h3 id="sntCalendarTitle">Calendario de festividades</h3>
                    <p>Consulta las celebraciones registradas durante el año.</p>
                </header>
                <div class="snt-calendar__filters">
                    <label>
                        <span>Mes</span>
                        <select data-snt-filter="month" aria-label="Filtrar festividades por mes">
                            <option value="">Todos los meses</option>
                            ${meses.map((mes) => `<option value="${escaparHTML(mes)}">${escaparHTML(etiquetaMes(`${mes}-01`))}</option>`).join("")}
                        </select>
                    </label>
                    <label>
                        <span>Categoría</span>
                        <select data-snt-filter="category" aria-label="Filtrar festividades por categoría">
                            <option value="">Todas las categorías</option>
                            ${CATEGORIAS_FESTIVIDADES.map((categoria) => `<option value="${categoria.id}">${escaparHTML(categoria.nombre)}</option>`).join("")}
                        </select>
                    </label>
                    <label>
                        <span>Tipo</span>
                        <select data-snt-filter="type" aria-label="Filtrar festividades por tipo">
                            <option value="">Todos los tipos</option>
                            ${tipos.map((tipo) => `<option value="${escaparHTML(tipo)}">${escaparHTML(tipo === "NACIONAL" ? "Conmemoración nacional" : "Tradición regional")}</option>`).join("")}
                        </select>
                    </label>
                    <label>
                        <span>Lugar o región</span>
                        <select data-snt-filter="place" aria-label="Filtrar festividades por lugar o región">
                            <option value="">Todos los lugares</option>
                            ${lugares.map((lugar) => `<option value="${escaparHTML(lugar)}">${escaparHTML(lugar)}</option>`).join("")}
                        </select>
                    </label>
                </div>
                <p class="snt-calendar__count" data-snt-calendar-count role="status" aria-live="polite"></p>
                <ol class="snt-calendar__list">
                    ${eventosCalendario.map(({ fecha, fiesta }) => {
                        const lugar = obtenerLugarCalendario(fiesta);
                        const visitar = Boolean(fiesta.idCiudad || fiesta.destino);
                        const frase = textoEditorial(fiesta.frase);
                        const titulo = textoEditorial(fiesta.titulo);
                        return `<li class="snt-calendar__item"
                            data-month="${escaparHTML(fiesta.fechaClave.slice(0, 2))}"
                            data-type="${escaparHTML(claveTipo(fiesta))}"
                            data-category="${escaparHTML(categoriaValida(fiesta.categoria))}"
                            data-place="${escaparHTML(lugar)}">
                            <time class="snt-calendar__date snt-date-badge" datetime="${fechaISO(fecha)}">
                                ${fechaFichaMarkup(fecha, hoy)}
                            </time>
                            <div class="snt-calendar__image-wrap">
                                <img class="snt-calendar__image" src="${escaparHTML(urlImagenFiesta(fiesta, "tarjeta"))}" alt="${escaparHTML(altImagenFiesta(fiesta))}" loading="lazy" decoding="async">
                            </div>
                            <div class="snt-calendar__details">
                                <p class="snt-calendar__meta">
                                    <span class="snt-calendar__relative">${escaparHTML(etiquetaProximidad(fecha, hoy))}</span>
                                    <span>${escaparHTML(etiquetaCategoria(fiesta.categoria))} · ${escaparHTML(etiquetaTipo(fiesta))} · ${escaparHTML(obtenerContextoCalendario(fiesta))}</span>
                                </p>
                                <h4>${escaparHTML(titulo)}</h4>
                                ${frase ? `<p class="snt-calendar__copy">${escaparHTML(frase)}</p>` : ""}
                            </div>
                            <div class="snt-calendar__actions">
                                <button class="snt-calendar__detail" type="button" data-snt-detail="${escaparHTML(fiesta.id)}" aria-haspopup="dialog" aria-controls="sntDetailDialog" aria-label="Ver detalles de ${escaparHTML(titulo)}">Ver detalles</button>
                                ${visitar
                                    ? `<button class="snt-calendar__link" type="button" data-snt-visit="${escaparHTML(fiesta.id)}" aria-label="Explorar ${escaparHTML(lugar)}">Explorar</button>`
                                    : ""}
                            </div>
                        </li>`;
                    }).join("")}
                </ol>
                <p class="snt-calendar__empty" hidden>No hay festividades que coincidan con estos filtros.</p>
                <nav class="snt-calendar__pagination" aria-label="Paginación de festividades">
                    <button type="button" data-calendar-page="previous" aria-label="Página anterior">Anterior</button>
                    <span data-calendar-page-summary aria-live="polite"></span>
                    <button type="button" data-calendar-page="next" aria-label="Página siguiente">Siguiente</button>
                </nav>
            </section>`
            : `<p class="snt-unavailable" role="status">No hay festividades con fechas válidas para mostrar.</p>`;

        mount.innerHTML = `
            <section class="snt-section" aria-labelledby="sntSectionTitle">
                <div class="snt-container">
                    <div class="snt-intro">
                        <header class="snt-heading">
                            <p class="snt-eyebrow">Agenda cultural</p>
                            <h2 id="sntSectionTitle">Tradiciones que nos conectan</h2>
                            <p>Fechas y celebraciones de Santander para descubrir durante todo el año.</p>
                        </header>
                        <div class="snt-gallery" aria-label="Paisajes y expresiones culturales de Santander">
                            ${CATEGORIAS_FESTIVIDADES.map((categoria) => {
                                const cantidad = festividades.filter(
                                    (fiesta) => categoriaValida(fiesta.categoria) === categoria.id
                                ).length;
                                const imagen = new URL(categoria.imagen, SITE_ROOT).href;
                                return `<button class="snt-gallery__item" type="button" data-snt-category="${categoria.id}" aria-pressed="false" aria-label="Filtrar por ${categoria.nombre}, ${cantidad} ${cantidad === 1 ? "festividad" : "festividades"}">
                                    <img src="${imagen}" alt="" loading="lazy" decoding="async">
                                    <span class="snt-gallery__caption">
                                        <span>${escaparHTML(categoria.nombre)}</span>
                                        <small>${cantidad} ${cantidad === 1 ? "festividad" : "festividades"}</small>
                                    </span>
                                </button>`;
                            }).join("")}
                        </div>
                    </div>
                    <div class="snt-layout snt-layout--spotlight-only">
                        ${eventoDestacado}
                    </div>
                    ${calendarioMarkup}
                    <dialog id="sntDetailDialog" class="snt-home-notice-dialog snt-event-detail-dialog" data-snt-detail-dialog></dialog>
                </div>
            </section>`;

        const filtrosCalendario = mount.querySelectorAll("[data-snt-filter]");
        const filasCalendario = Array.from(mount.querySelectorAll(".snt-calendar__item"));
        const estadoCalendario = mount.querySelector("[data-snt-calendar-count]");
        const mensajeCalendarioVacio = mount.querySelector(".snt-calendar__empty");
        const paginacionCalendario = mount.querySelector(".snt-calendar__pagination");
        const resumenPagina = mount.querySelector("[data-calendar-page-summary]");
        const botonPaginaAnterior = mount.querySelector('[data-calendar-page="previous"]');
        const botonPaginaSiguiente = mount.querySelector('[data-calendar-page="next"]');
        const filasPorPagina = 10;
        let paginaActual = 1;
        const actualizarCalendario = () => {
            const filtros = {
                month: mount.querySelector('[data-snt-filter="month"]').value,
                type: mount.querySelector('[data-snt-filter="type"]').value,
                category: mount.querySelector('[data-snt-filter="category"]').value,
                place: mount.querySelector('[data-snt-filter="place"]').value,
            };
            const coincidentes = filasCalendario.filter((fila) =>
                Object.entries(filtros).every(([filtro, valor]) =>
                    !valor || fila.dataset[filtro] === valor
                )
            );
            const totalPaginas = Math.max(1, Math.ceil(coincidentes.length / filasPorPagina));
            paginaActual = Math.min(paginaActual, totalPaginas);
            const inicio = (paginaActual - 1) * filasPorPagina;
            const fin = Math.min(inicio + filasPorPagina, coincidentes.length);
            const filasVisibles = new Set(coincidentes.slice(inicio, fin));
            filasCalendario.forEach((fila) => {
                fila.hidden = !filasVisibles.has(fila);
            });
            estadoCalendario.textContent = `${coincidentes.length} ${coincidentes.length === 1 ? "festividad coincide" : "festividades coinciden"} con los filtros.`;
            mensajeCalendarioVacio.hidden = coincidentes.length !== 0;
            paginacionCalendario.hidden = totalPaginas <= 1;
            resumenPagina.textContent = coincidentes.length
                ? `Página ${paginaActual} · ${inicio + 1}–${fin} de ${coincidentes.length}`
                : "Página 1 · 0 resultados";
            botonPaginaAnterior.disabled = paginaActual <= 1;
            botonPaginaSiguiente.disabled = paginaActual >= totalPaginas;
            mount.querySelectorAll("[data-snt-category]").forEach((boton) => {
                const activo = boton.dataset.sntCategory === filtros.category;
                boton.classList.toggle("is-active", activo);
                boton.setAttribute("aria-pressed", String(activo));
            });
        };
        filtrosCalendario.forEach((filtro) => filtro.addEventListener("change", () => {
            paginaActual = 1;
            actualizarCalendario();
        }));
        if (estadoCalendario) {
            botonPaginaAnterior.addEventListener("click", () => {
                paginaActual -= 1;
                actualizarCalendario();
            });
            botonPaginaSiguiente.addEventListener("click", () => {
                paginaActual += 1;
                actualizarCalendario();
            });
            actualizarCalendario();
        }

        mount.querySelectorAll("[data-snt-category]").forEach((boton) => {
            boton.addEventListener("click", () => {
                const filtroCategoria = mount.querySelector('[data-snt-filter="category"]');
                const calendario = mount.querySelector(".snt-calendar");
                if (!filtroCategoria || !calendario) return;
                filtroCategoria.value = filtroCategoria.value === boton.dataset.sntCategory
                    ? ""
                    : boton.dataset.sntCategory;
                filtroCategoria.dispatchEvent(new Event("change", { bubbles: true }));
                calendario.scrollIntoView({
                    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
                    block: "start"
                });
            });
        });

        mount.querySelectorAll("[data-snt-visit]").forEach((button) => {
            const fiesta = festividades.find(
                (item) => String(item.id) === button.dataset.sntVisit
            );
            if (fiesta) button.addEventListener("click", () => visitarDestino(fiesta));
        });
        const dialogoDetalle = mount.querySelector("[data-snt-detail-dialog]");
        mount.querySelectorAll("[data-snt-detail]").forEach((button) => {
            const fiesta = festividades.find(
                (item) => String(item.id) === button.dataset.sntDetail
            );
            if (fiesta && dialogoDetalle) {
                button.addEventListener("click", () => abrirDetalleFestividad(dialogoDetalle, fiesta));
            }
        });
    }

    // Busca en el index la tarjeta cuyo data-article coincide con el destino de la festividad
    // y hace scroll suave hacia ella, resaltándola brevemente.
    function resaltarTarjetaDestino(fiesta) {
        const municipios = Array.isArray(window.TE_MUNICIPIOS) ? window.TE_MUNICIPIOS : [];
        const municipio = municipios.find(
            (item) => fiesta.idCiudad && String(item.id) === String(fiesta.idCiudad)
        );
        const destinoKey = fiesta.destino || (municipio && municipio.key);
        if (!destinoKey) return;

        const enlace = Array.from(document.querySelectorAll(".card-link[data-article]"))
            .find((item) => item.dataset.article === destinoKey);
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
        if (!document.getElementById("site-destinos")) {
            const home = new URL("index.html", SITE_ROOT);
            home.searchParams.set("festividad", fiesta.id);
            window.location.assign(home.href);
            return;
        }

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

    function visitarFestividadSolicitada() {
        const url = new URL(window.location.href);
        const idFestividad = url.searchParams.get("festividad");
        if (!idFestividad) return;

        url.searchParams.delete("festividad");
        window.history.replaceState(null, "", url);
        const fiesta = festividades.find((item) => item.id === idFestividad);
        if (!fiesta) return;

        const visitar = () => visitarDestino(fiesta);
        if (window.TE_MUNICIPIOS_PROMISE) {
            window.TE_MUNICIPIOS_PROMISE.then(visitar).catch((error) => {
                console.error("No se pudieron cargar los municipios para visitar la festividad.", error);
                visitar();
            });
        } else {
            visitar();
        }
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
        const mount = document.getElementById("santanderianidad");
        const homeNotice = document.getElementById("aviso-festividad-hoy");
        const idFestividadSolicitada = new URLSearchParams(window.location.search).get("festividad");
        if (!mount && !homeNotice && !idFestividadSolicitada) return;

        try {
            const response = await fetch(API_FESTIVIDADES, { credentials: "include" });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const result = await response.json();
            if (!result.ok || !Array.isArray(result.data)) throw new Error("Respuesta de festividades inválida");

            festividades = result.data.map((row) => {
                const id = String(row.id_festividad || "").trim();
                const c1 = colorValido(row.color_1, "#009B3A");
                const c2 = colorValido(row.color_2, "#FFCD00");
                const c3 = colorValido(row.color_3, "#FFFFFF");
                return {
                    id,
                    fechaClave: String(row.fecha_clave || "").trim(),
                    subtitulo: row.subtitulo,
                    titulo: row.titulo,
                    frase: row.frase,
                    colores: [c1, c2, c3],
                    tipo: row.tipo,
                    categoria: categoriaValida(String(row.categoria || "").toUpperCase()),
                    imagenUrl: row.img_url ? String(row.img_url).trim() : "",
                    idCiudad: row.id_ciudad ? String(row.id_ciudad).trim() : null,
                    destino: DESTINOS_POR_FESTIVIDAD[id] || null,
                };
            });
        } catch (error) {
            console.error("No se pudieron cargar las festividades administradas.", error);
            if (mount) {
                mount.hidden = false;
                mount.innerHTML = `
                <section class="snt-section" aria-labelledby="sntSectionTitle">
                    <div class="snt-container">
                        <header class="snt-heading">
                            <p class="snt-eyebrow">Agenda cultural</p>
                            <h2 id="sntSectionTitle">Tradiciones que nos conectan</h2>
                        </header>
                        <p class="snt-unavailable" role="status">La agenda cultural no está disponible en este momento. Intenta de nuevo más tarde.</p>
                    </div>
                </section>`;
            }
            return;
        }

        if (mount) inicializarAgendaCultural();
        if (homeNotice) renderAvisoFestividadHoy(homeNotice);
        visitarFestividadSolicitada();
    }

    cargarFestividadesAdministradas();
})();