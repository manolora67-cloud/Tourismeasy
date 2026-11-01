(function () {
    "use strict";

    const basePath = window.location.pathname.includes("/html/") ? "../" : "";

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

    async function cargarDestinos(mapa, estado) {
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
                && Number.isFinite(Number(destino.mapa.latitud))
                && Number.isFinite(Number(destino.mapa.longitud))
                && Array.isArray(destino.mapa.etiquetas)
            ));

            if (!destinos.length) {
                estado.textContent = "Aún no hay municipios destacados. Puedes seleccionarlos desde el panel de administración.";
                mapa.setView([6.7, -73.2], 8);
                return;
            }

            const marcadores = destinos.map((destino) => window.L.marker([
                Number(destino.mapa.latitud),
                Number(destino.mapa.longitud),
            ]).addTo(mapa).bindPopup(crearContenidoPopup(destino), {
                maxWidth: 280,
                minWidth: 240,
                className: "destino-popup",
            }));

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

        const estado = contenedor.parentElement.querySelector(".mapa-estado");
        mapa.setView([6.7, -73.2], 8);
        cargarDestinos(mapa, estado);
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
            <h2 class="section-title">Destinos turísticos destacados</h2>
            <p>Selecciona un marcador para conocer más sobre cada municipio.</p>
            <p class="mapa-estado" role="status" aria-live="polite"></p>
            <div id="mapa-turistico" role="application" aria-label="Mapa interactivo de destinos turísticos de Santander"></div>
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