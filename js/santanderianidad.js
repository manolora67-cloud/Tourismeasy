(function () {
    // ⏱️ DURACIÓN DEL DESTELLO (en segundos) que resalta la tarjeta del destino relacionado con la festividad del día.
    // Cambia SOLO este número para ajustar cuánto dura el destello (afecta el CSS y el JS automáticamente).
    const DURACION_DESTELLO_SEGUNDOS = 3;
    const API_FESTIVIDADES = new URL("../admin/festividades.php", document.currentScript.src).href;

    // La tabla no incluye la clave de la tarjeta para estos eventos sin ciudad asociada.
    const DESTINOS_POR_FESTIVIDAD = {
        "virgen_piedra_barichara": "barichara",
        "dia_mundial_agua": "chicamocha",
        "batalla_palonegro": "bucaramanga",
        "parapente_lossantos": "lossantos",
    };
    let festividades = [];

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
        const eventoHoy = festividades.find((fiesta) => fiesta.fechaClave === fechaClaveHoy) || null;
        const proximos = festividades
            .filter((fiesta) => fiesta.fechaClave !== fechaClaveHoy)
            .map((fiesta) => ({
                fecha: obtenerProximaFecha(fiesta.fechaClave, hoy),
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
                    <div class="snt-intro">
                        <header class="snt-heading">
                            <p class="snt-eyebrow">Agenda cultural</p>
                            <h2 id="sntSectionTitle">Tradiciones que nos conectan</h2>
                            <p>Fechas y celebraciones de Santander para descubrir durante todo el año.</p>
                        </header>
                        <div class="snt-gallery" aria-label="Paisajes y expresiones culturales de Santander">
                            <figure class="snt-gallery__item">
                                <img src="img/festividades/web/canon.jpg" alt="Paisaje del cañón del Chicamocha" loading="lazy" decoding="async">
                                <figcaption>Paisajes</figcaption>
                            </figure>
                            <figure class="snt-gallery__item">
                                <img src="img/festividades/web/calle_colonial.jpg" alt="Calle de arquitectura colonial santandereana" loading="lazy" decoding="async">
                                <figcaption>Patrimonio</figcaption>
                            </figure>
                            <figure class="snt-gallery__item">
                                <img src="img/festividades/web/musicos.jpg" alt="Músicos interpretando instrumentos tradicionales" loading="lazy" decoding="async">
                                <figcaption>Música</figcaption>
                            </figure>
                            <figure class="snt-gallery__item">
                                <img src="img/festividades/web/artesano.jpg" alt="Artesano preparando un producto tradicional" loading="lazy" decoding="async">
                                <figcaption>Tradición</figcaption>
                            </figure>
                        </div>
                    </div>
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
            const fiesta = festividades.find(
                (item) => String(item.id) === button.dataset.sntVisit
            );
            if (fiesta) button.addEventListener("click", () => visitarDestino(fiesta));
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
        const mount = document.getElementById("santanderianidad");
        if (!mount) return;

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
                    idCiudad: row.id_ciudad ? String(row.id_ciudad).trim() : null,
                    destino: DESTINOS_POR_FESTIVIDAD[id] || null,
                };
            });
        } catch (error) {
            console.error("No se pudieron cargar las festividades administradas.", error);
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
            return;
        }

        inicializarAgendaCultural();
    }

    cargarFestividadesAdministradas();
})();