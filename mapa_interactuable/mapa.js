(function () {
    "use strict";

    const coloresTema = getComputedStyle(document.documentElement);
    const colorPrincipal = coloresTema.getPropertyValue("--theme-primary").trim() || "#7c3aed";
    const colorPrincipalOscuro = coloresTema.getPropertyValue("--theme-primary-dark").trim() || "#5b21b6";
    const ordenMunicipiosRelevantes = [
        "barichara",
        "velez",
        "socorro",
        "sangil",
        "barrancabermeja",
        "curiti",
        "lossantos",
        "guadalupe",
        "zapatoca",
        "molagavita",
    ];
    const comparadorMunicipios = new Intl.Collator("es", { sensitivity: "base" });

    function ordenarMunicipios(entradas, criterio) {
        const ordenadas = [...entradas];
        if (criterio === "az") {
            return ordenadas.sort((a, b) => comparadorMunicipios.compare(a.destino.titulo, b.destino.titulo));
        }
        if (criterio === "za") {
            return ordenadas.sort((a, b) => comparadorMunicipios.compare(b.destino.titulo, a.destino.titulo));
        }

        const prioridad = new Map(ordenMunicipiosRelevantes.map((key, index) => [key, index]));
        return ordenadas.sort((a, b) => {
            const prioridadA = prioridad.get(a.destino.key) ?? Number.MAX_SAFE_INTEGER;
            const prioridadB = prioridad.get(b.destino.key) ?? Number.MAX_SAFE_INTEGER;
            return prioridadA - prioridadB
                || comparadorMunicipios.compare(a.destino.titulo, b.destino.titulo);
        });
    }

    function crearContenidoPopup(destino) {
        const contenido = document.createElement("div");
        contenido.className = "mapa-popup";

        const imagen = document.createElement("img");
        imagen.className = "mapa-popup-imagen";
        imagen.dataset.src = window.TEImagenCloudinary
            ? window.TEImagenCloudinary.popup(destino.img)
            : destino.img;
        imagen.alt = destino.alt || destino.titulo;
        imagen.loading = "lazy";
        imagen.decoding = "async";
        contenido.appendChild(imagen);

        const cuerpo = document.createElement("div");
        cuerpo.className = "mapa-popup-cuerpo";

        const region = document.createElement("span");
        region.className = "mapa-popup-region";
        region.textContent = "Santander";
        cuerpo.appendChild(region);

        const titulo = document.createElement("h3");
        titulo.textContent = destino.titulo;
        cuerpo.appendChild(titulo);

        const enlace = document.createElement("a");
        enlace.className = "mapa-destino-link";
        enlace.href = `#art-${encodeURIComponent(destino.key)}`;
        enlace.dataset.article = destino.key;
        enlace.textContent = "Ver destino";
        cuerpo.appendChild(enlace);

        contenido.appendChild(cuerpo);
        return contenido;
    }

    function cargarImagenPopup(marcador) {
        const elementoPopup = marcador.getPopup().getElement();
        const imagen = elementoPopup && elementoPopup.querySelector(".mapa-popup-imagen");
        if (!imagen || !imagen.dataset.src) return;

        imagen.src = imagen.dataset.src;
        delete imagen.dataset.src;
    }

    function crearMarcador(destino, coordenadas, renderizadorMovil) {
        if (renderizadorMovil) {
            const marcador = window.L.circleMarker(coordenadas, {
                renderer: renderizadorMovil,
                radius: 7,
                color: "#ffffff",
                weight: 2,
                fillColor: colorPrincipal,
                fillOpacity: 1,
                title: destino.titulo,
            }).bindPopup(crearContenidoPopup(destino), {
                maxWidth: 280,
                minWidth: 240,
                className: "destino-popup",
            });

            marcador.on("popupopen", () => {
                marcador.setStyle({ radius: 9, fillColor: colorPrincipalOscuro });
            });
            marcador.on("popupclose", () => {
                marcador.setStyle({ radius: 7, fillColor: colorPrincipal });
            });
            marcador.on("popupopen", () => cargarImagenPopup(marcador));

            return marcador;
        }

        const icono = window.L.divIcon({
            className: "mapa-marcador-wrapper",
            html: '<span class="mapa-marcador" aria-hidden="true"><i class="fa-solid fa-location-dot"></i></span>',
            iconSize: [30, 34],
            iconAnchor: [15, 31],
            popupAnchor: [0, -28],
        });

        const marcador = window.L.marker(coordenadas, {
            icon: icono,
            title: destino.titulo,
            alt: `Ver ${destino.titulo} en el mapa`,
        }).bindPopup(crearContenidoPopup(destino), {
            maxWidth: 280,
            minWidth: 240,
            className: "destino-popup",
        });

        marcador.on("popupopen", () => cargarImagenPopup(marcador));

        return marcador;
    }

    function agregarDestinoAlPanel(destino, marcador, lista, mapa) {
        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = "mapa-destino-item";
        boton.dataset.destinoKey = destino.key;
        boton.setAttribute("aria-label", `Ubicar ${destino.titulo} en el mapa`);

        const icono = document.createElement("span");
        icono.className = "mapa-destino-icono";
        icono.setAttribute("aria-hidden", "true");
        icono.innerHTML = '<i class="fa-solid fa-location-dot"></i>';
        boton.appendChild(icono);

        const informacion = document.createElement("span");
        informacion.className = "mapa-destino-informacion";
        const titulo = document.createElement("strong");
        titulo.textContent = destino.titulo;
        const tipo = document.createElement("span");
        tipo.textContent = "Destino de Santander";
        informacion.append(titulo, tipo);
        boton.appendChild(informacion);

        const flecha = document.createElement("i");
        flecha.className = "fa-solid fa-crosshairs mapa-destino-flecha";
        flecha.setAttribute("aria-hidden", "true");
        boton.appendChild(flecha);

        boton.addEventListener("click", () => {
            const ubicacion = marcador.getLatLng();
            const zoom = Math.max(mapa.getZoom(), 10);
            if (typeof marcador.setStyle === "function") {
                mapa.setView(ubicacion, zoom, { animate: false });
            } else {
                mapa.flyTo(ubicacion, zoom, { duration: 0.6 });
            }
            marcador.openPopup();
        });
        marcador.on("popupopen", () => {
            const elementoMarcador = marcador.getElement();
            const iconoMarcador = elementoMarcador && elementoMarcador.querySelector(".mapa-marcador");
            if (iconoMarcador) iconoMarcador.classList.add("is-selected");
            lista.querySelectorAll(".mapa-destino-item").forEach((item) => {
                const seleccionado = item === boton;
                item.classList.toggle("is-selected", seleccionado);
                if (seleccionado) {
                    item.setAttribute("aria-current", "location");
                } else {
                    item.removeAttribute("aria-current");
                }
            });
        });
        marcador.on("popupclose", () => {
            const elementoMarcador = marcador.getElement();
            const iconoMarcador = elementoMarcador && elementoMarcador.querySelector(".mapa-marcador");
            if (iconoMarcador) iconoMarcador.classList.remove("is-selected");
            boton.classList.remove("is-selected");
            boton.removeAttribute("aria-current");
        });
        lista.appendChild(boton);
        return boton;
    }

    async function cargarDestinos(mapa, bloque) {
        const estado = bloque.querySelector(".mapa-estado");
        const lista = bloque.querySelector(".mapa-destinos-lista");
        const contador = bloque.querySelector(".mapa-contador-numero");
        const selectorOrden = bloque.querySelector(".mapa-orden-select");
        const esMovil = window.matchMedia("(max-width: 767px)").matches;
        const renderizadorMovil = esMovil ? window.L.canvas({ padding: 0.5 }) : null;
        estado.textContent = "Cargando destinos…";
        try {
            const destinos = await window.TE_MUNICIPIOS_PROMISE;
            if (!Array.isArray(destinos)) {
                throw new Error("La lista de destinos no está disponible.");
            }
            const ubicados = destinos.filter((destino) => {
                if (!destino.publicado) return false;
                if (destino.mapaDestacado === false) return false;
                if (destino.latitud === null || destino.longitud === null) return false;
                const latitud = Number(destino.latitud);
                const longitud = Number(destino.longitud);
                return Number.isFinite(latitud) && latitud >= -90 && latitud <= 90
                    && Number.isFinite(longitud) && longitud >= -180 && longitud <= 180;
            });
            contador.textContent = ubicados.length;

            if (!ubicados.length) {
                estado.textContent = "Aún no hay destinos seleccionados para el mapa.";
                lista.innerHTML = '<p class="mapa-lista-vacia">No hay destinos disponibles.</p>';
                mapa.setView([6.7, -73.2], 8);
                return;
            }

            const entradasLista = ubicados.map((destino) => {
                const coordenadas = [Number(destino.latitud), Number(destino.longitud)];
                const marcador = crearMarcador(
                    destino,
                    coordenadas,
                    renderizadorMovil
                );
                const boton = agregarDestinoAlPanel(destino, marcador, lista, mapa);
                return { destino, boton, marcador };
            });
            const grupoMarcadores = window.L.featureGroup(
                entradasLista.map((entrada) => entrada.marcador)
            ).addTo(mapa);
            const actualizarOrden = () => {
                const ordenadas = ordenarMunicipios(entradasLista, selectorOrden.value);
                lista.replaceChildren(...ordenadas.map((entrada) => entrada.boton));
            };
            selectorOrden.addEventListener("change", actualizarOrden);
            actualizarOrden();

            estado.textContent = `${ubicados.length} ${ubicados.length === 1 ? "destino" : "destinos"} en el mapa.`;
            estado.hidden = false;
            mapa.fitBounds(grupoMarcadores.getBounds(), {
                padding: [28, 28],
                maxZoom: 9,
            });
        } catch (error) {
            console.error("[TourismEasy] No se pudieron cargar los destinos del mapa.", error);
            estado.textContent = "No se pudieron cargar los destinos del mapa. Inténtalo de nuevo más tarde.";
        }
    }

    function crearMapa(contenedor) {
        if (contenedor.dataset.mapaInicializado === "true") return;
        if (!window.L) {
            contenedor.textContent = "No se pudo cargar el mapa. Puedes explorar los destinos en las tarjetas de abajo.";
            contenedor.setAttribute("role", "status");
            return;
        }
        contenedor.dataset.mapaInicializado = "true";

        const mapa = window.L.map(contenedor, {
            scrollWheelZoom: false,
            preferCanvas: true,
            zoomAnimation: false,
            fadeAnimation: false,
            markerZoomAnimation: false,
            tap: false,
        });

        const opcionesTiles = {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        };
        if (window.matchMedia("(max-width: 767px)").matches) {
            opcionesTiles.updateWhenIdle = true;
            opcionesTiles.updateWhenZooming = false;
            opcionesTiles.keepBuffer = 1;
        }
        window.L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", opcionesTiles).addTo(mapa);

        mapa.setView([6.7, -73.2], 8);
        cargarDestinos(mapa, contenedor.closest(".destinos-mapa"));
    }

    function instalarMapa() {
        const seccion = document.querySelector("#site-destinos .section-container");
        if (!seccion || seccion.querySelector(".destinos-mapa")) return;

        const encabezadoMunicipios = seccion.querySelector(".section-header");
        const carrusel = seccion.querySelector(".destinos-carousel");
        const puntoInsercion = encabezadoMunicipios || carrusel;
        if (!puntoInsercion) return;

        const bloque = document.createElement("div");
        bloque.className = "destinos-mapa";
        bloque.innerHTML = `
            <header class="mapa-encabezado">
                <div class="mapa-encabezado-icono" aria-hidden="true"><i class="fa-solid fa-compass"></i></div>
                <div class="mapa-encabezado-texto">
                    <span class="mapa-eyebrow">Descubre Santander</span>
                    <h2 class="mapa-titulo">Santander, lugar a lugar</h2>
                    <p>Explora municipios, corregimientos y otros destinos para planear tu próxima aventura.</p>
                </div>
                <div class="mapa-contador" aria-live="polite">
                    <strong class="mapa-contador-numero">0</strong>
                    <span>destinos<br>en el mapa</span>
                </div>
            </header>
            <p class="mapa-estado" role="status" aria-live="polite"></p>
            <div class="mapa-explorador">
                <aside class="mapa-panel-lateral" aria-label="Destinos de Santander">
                    <div class="mapa-panel-cabecera">
                        <div>
                            <h3>Explora los destinos</h3>
                            <p>Selecciona uno para verlo en el mapa</p>
                        </div>
                        <i class="fa-solid fa-map-location-dot" aria-hidden="true"></i>
                    </div>
                    <div class="mapa-orden">
                        <label for="mapa-orden-select">Ordenar por</label>
                        <select id="mapa-orden-select" class="mapa-orden-select">
                            <option value="az" selected>A–Z</option>
                            <option value="relevantes">Más relevantes</option>
                            <option value="za">Z–A</option>
                        </select>
                    </div>
                    <div class="mapa-destinos-lista"></div>
                </aside>
                <div id="mapa-turistico" role="application" aria-label="Mapa interactivo de los destinos de Santander"></div>
            </div>
        `;
        seccion.insertBefore(bloque, puntoInsercion);
        crearMapa(bloque.querySelector("#mapa-turistico"));
    }

    function iniciar() {
        instalarMapa();

        const mount = document.getElementById("site-destinos");
        if (!mount) return;

        const observador = new MutationObserver(() => instalarMapa());
        observador.observe(mount, { childList: true, subtree: true });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar, { once: true });
    } else {
        iniciar();
    }
})();