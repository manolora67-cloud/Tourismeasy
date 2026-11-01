(function () {
    "use strict";

    const basePath = window.location.pathname.includes("/html/") ? "../" : "";
    const categoriasMapa = [
        { nombre: "Aventura", palabras: ["aventura", "rafting", "deporte", "adrenalina"], clase: "aventura", icono: "fa-person-hiking" },
        { nombre: "Naturaleza", palabras: ["naturaleza", "cascada", "montana", "rio", "parque", "paisaje", "cueva"], clase: "naturaleza", icono: "fa-leaf" },
        { nombre: "Cultura e historia", palabras: ["cultura", "historia", "colonial", "patrimonio", "arquitectura", "tradicion"], clase: "cultura", icono: "fa-landmark" },
        { nombre: "Gastronomía", palabras: ["gastronomia", "comida", "cafe", "bocadillo", "dulce"], clase: "gastronomia", icono: "fa-utensils" },
    ];

    function normalizarTexto(texto) {
        return String(texto || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    }

    function obtenerCategoria(destino) {
        const etiquetas = destino.mapa.etiquetas.map(normalizarTexto);
        return categoriasMapa.find((categoria) => (
            etiquetas.some((etiqueta) => categoria.palabras.some((palabra) => etiqueta.includes(palabra)))
        )) || { nombre: "Destino destacado", clase: "destacado", icono: "fa-location-dot" };
    }

    function crearContenidoPopup(destino) {
        const contenido = document.createElement("div");
        contenido.className = "mapa-popup";

        const imagen = document.createElement("img");
        imagen.className = "mapa-popup-imagen";
        imagen.src = destino.img;
        imagen.alt = destino.alt || destino.titulo;
        imagen.loading = "eager";
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

        const etiquetas = document.createElement("div");
        etiquetas.className = "mapa-popup-etiquetas";
        etiquetas.setAttribute("aria-label", `Temas destacados de ${destino.titulo}`);
        destino.mapa.etiquetas.forEach((texto) => {
            const etiqueta = document.createElement("span");
            etiqueta.textContent = texto;
            etiquetas.appendChild(etiqueta);
        });
        cuerpo.appendChild(etiquetas);

        const enlace = document.createElement("a");
        enlace.className = "mapa-destino-link";
        enlace.href = `#art-${encodeURIComponent(destino.key)}`;
        enlace.dataset.article = destino.key;
        enlace.textContent = "Ver destino";
        cuerpo.appendChild(enlace);

        contenido.appendChild(cuerpo);
        return contenido;
    }

    function crearMarcador(destino, mapa, categoria) {
        const icono = window.L.divIcon({
            className: "mapa-marcador-wrapper",
            html: `<span class="mapa-marcador mapa-marcador--${categoria.clase}" aria-hidden="true"><i class="fa-solid ${categoria.icono}"></i></span>`,
            iconSize: [42, 48],
            iconAnchor: [21, 44],
            popupAnchor: [0, -40],
        });

        return window.L.marker([
            Number(destino.mapa.latitud),
            Number(destino.mapa.longitud),
        ], {
            icon: icono,
            title: destino.titulo,
            alt: `Ver ${destino.titulo} en el mapa`,
        }).addTo(mapa).bindPopup(crearContenidoPopup(destino), {
            maxWidth: 280,
            minWidth: 240,
            className: "destino-popup",
        });
    }

    function agregarDestinoAlPanel(destino, categoria, marcador, lista) {
        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = "mapa-destino-item";
        boton.dataset.destinoKey = destino.key;
        boton.setAttribute("aria-label", `Ubicar ${destino.titulo} en el mapa`);

        const icono = document.createElement("span");
        icono.className = `mapa-destino-icono mapa-destino-icono--${categoria.clase}`;
        icono.setAttribute("aria-hidden", "true");
        icono.innerHTML = `<i class="fa-solid ${categoria.icono}"></i>`;
        boton.appendChild(icono);

        const informacion = document.createElement("span");
        informacion.className = "mapa-destino-informacion";
        const titulo = document.createElement("strong");
        titulo.textContent = destino.titulo;
        const tipo = document.createElement("span");
        tipo.textContent = destino.mapa.etiquetas[0] || categoria.nombre;
        informacion.append(titulo, tipo);
        boton.appendChild(informacion);

        const flecha = document.createElement("i");
        flecha.className = "fa-solid fa-arrow-up-right-from-square mapa-destino-flecha";
        flecha.setAttribute("aria-hidden", "true");
        boton.appendChild(flecha);

        boton.addEventListener("click", () => {
            mapa.flyTo(marcador.getLatLng(), Math.max(mapa.getZoom(), 10), { duration: 0.6 });
            marcador.openPopup();
        });
        marcador.on("popupopen", () => {
            const elementoMarcador = marcador.getElement();
            if (elementoMarcador) elementoMarcador.querySelector(".mapa-marcador").classList.add("is-selected");
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
            if (elementoMarcador) elementoMarcador.querySelector(".mapa-marcador").classList.remove("is-selected");
            boton.classList.remove("is-selected");
            boton.removeAttribute("aria-current");
        });
        lista.appendChild(boton);
    }

    async function cargarDestinos(mapa, bloque) {
        const estado = bloque.querySelector(".mapa-estado");
        const lista = bloque.querySelector(".mapa-destinos-lista");
        const contador = bloque.querySelector(".mapa-contador-numero");
        estado.textContent = "Cargando destinos destacados…";
        try {
            const respuesta = await fetch(`${basePath}admin/contenido_portada.php?map=1`);
            const resultado = await respuesta.json();
            if (!respuesta.ok || !resultado.ok || !Array.isArray(resultado.data)) {
                throw new Error(resultado.error || "No se pudieron cargar los destinos destacados.");
            }

            const destinos = resultado.data.filter((destino) => (
                destino.mapa
                && destino.mapa.destacado === true
                && destino.mapa.latitud !== null
                && destino.mapa.latitud !== ""
                && destino.mapa.longitud !== null
                && destino.mapa.longitud !== ""
                && Number.isFinite(Number(destino.mapa.latitud))
                && Math.abs(Number(destino.mapa.latitud)) <= 90
                && Number.isFinite(Number(destino.mapa.longitud))
                && Math.abs(Number(destino.mapa.longitud)) <= 180
                && Array.isArray(destino.mapa.etiquetas)
            ));
            contador.textContent = destinos.length;

            if (!destinos.length) {
                estado.textContent = "Aún no hay municipios destacados. Puedes seleccionarlos desde el panel de administración.";
                lista.innerHTML = '<p class="mapa-lista-vacia">Los destinos que destaques aparecerán aquí.</p>';
                mapa.setView([6.7, -73.2], 8);
                return;
            }

            const marcadores = destinos.map((destino) => {
                const categoria = obtenerCategoria(destino);
                const marcador = crearMarcador(destino, mapa, categoria);
                agregarDestinoAlPanel(destino, categoria, marcador, lista);
                return marcador;
            });

            estado.textContent = "";
            estado.hidden = true;
            mapa.fitBounds(window.L.featureGroup(marcadores).getBounds(), {
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
            contenedor.textContent = "No se pudo cargar el mapa. Puedes explorar los municipios en las tarjetas de abajo.";
            contenedor.setAttribute("role", "status");
            return;
        }
        contenedor.dataset.mapaInicializado = "true";

        const mapa = window.L.map(contenedor, {
            scrollWheelZoom: false,
        });

        window.L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(mapa);

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
                    <h2 class="mapa-titulo">Santander, destino a destino</h2>
                    <p>Explora municipios, encuentra nuevos atractivos y elige tu próxima aventura.</p>
                </div>
                <div class="mapa-contador" aria-live="polite">
                    <strong class="mapa-contador-numero">0</strong>
                    <span>destinos<br>destacados</span>
                </div>
            </header>
            <p class="mapa-estado" role="status" aria-live="polite"></p>
            <div class="mapa-explorador">
                <aside class="mapa-panel-lateral" aria-label="Destinos destacados">
                    <div class="mapa-panel-cabecera">
                        <div>
                            <h3>Explora destinos</h3>
                            <p>Selecciona un lugar para ubicarlo</p>
                        </div>
                        <i class="fa-solid fa-map-location-dot" aria-hidden="true"></i>
                    </div>
                    <div class="mapa-destinos-lista"></div>
                    <div class="mapa-leyenda" aria-label="Categorías de destinos">
                        <span><i class="fa-solid fa-person-hiking mapa-leyenda-aventura"></i> Aventura</span>
                        <span><i class="fa-solid fa-leaf mapa-leyenda-naturaleza"></i> Naturaleza</span>
                        <span><i class="fa-solid fa-landmark mapa-leyenda-cultura"></i> Cultura</span>
                        <span><i class="fa-solid fa-utensils mapa-leyenda-gastronomia"></i> Gastronomía</span>
                        <span><i class="fa-solid fa-location-dot mapa-leyenda-destacado"></i> Otros</span>
                    </div>
                </aside>
                <div id="mapa-turistico" role="application" aria-label="Mapa interactivo de destinos turísticos de Santander"></div>
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