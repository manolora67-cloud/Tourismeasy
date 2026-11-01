(function () {
    "use strict";

    const DESTINOS_TURISTICOS = [
        { key: "barichara", nombre: "Barichara", coordenadas: [6.6357, -73.2228] },
        { key: "velez", nombre: "Vélez", coordenadas: [6.0139, -73.6732] },
        { key: "socorro", nombre: "Socorro", coordenadas: [6.4626, -73.2606] },
        { key: "sangil", nombre: "San Gil", coordenadas: [6.5557, -73.1331] },
        { key: "barrancabermeja", nombre: "Barrancabermeja", coordenadas: [7.0653, -73.8547] },
        { key: "curiti", nombre: "Curití", coordenadas: [6.6057, -73.0689] },
        { key: "lossantos", nombre: "Los Santos", coordenadas: [6.7552, -73.1021] },
        { key: "guadalupe", nombre: "Guadalupe", coordenadas: [6.2463, -73.4189] },
        { key: "zapatoca", nombre: "Zapatoca", coordenadas: [6.8153, -73.2677] },
        { key: "molagavita", nombre: "Molagavita", coordenadas: [6.6400, -72.8100] },
    ];

    function crearContenidoPopup(destino) {
        const enlaceTarjeta = Array.from(
            document.querySelectorAll("#site-destinos [data-article]")
        ).find((enlace) => enlace.dataset.article === destino.key);
        const tarjeta = enlaceTarjeta && enlaceTarjeta.closest(".card");
        const imagenTarjeta = tarjeta && tarjeta.querySelector(".card-img img");
        const descripcionTarjeta = tarjeta && tarjeta.querySelector(".card-body p");
        const contenido = document.createElement("div");
        contenido.className = "mapa-popup";

        if (imagenTarjeta) {
            const imagen = document.createElement("img");
            imagen.className = "mapa-popup-imagen";
            imagen.src = imagenTarjeta.src;
            imagen.alt = imagenTarjeta.alt || destino.nombre;
            imagen.loading = "eager";
            contenido.appendChild(imagen);
        }

        const cuerpo = document.createElement("div");
        cuerpo.className = "mapa-popup-cuerpo";

        const region = document.createElement("span");
        region.className = "mapa-popup-region";
        region.textContent = "Santander";
        cuerpo.appendChild(region);

        const titulo = document.createElement("h3");
        titulo.textContent = destino.nombre;
        cuerpo.appendChild(titulo);

        if (descripcionTarjeta) {
            const descripcion = document.createElement("p");
            descripcion.textContent = descripcionTarjeta.textContent.trim();
            cuerpo.appendChild(descripcion);
        }

        const enlace = document.createElement("a");
        enlace.className = "mapa-destino-link";
        enlace.href = `#art-${encodeURIComponent(destino.key)}`;
        enlace.dataset.article = destino.key;
        enlace.textContent = "Ver destino";
        cuerpo.appendChild(enlace);

        contenido.appendChild(cuerpo);
        return contenido;
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

        const marcadores = DESTINOS_TURISTICOS.map((destino) => {
            return window.L.marker(destino.coordenadas)
                .addTo(mapa)
                .bindPopup(crearContenidoPopup(destino), {
                    maxWidth: 280,
                    minWidth: 240,
                    className: "destino-popup",
                });
        });

        const limites = window.L.featureGroup(marcadores).getBounds();
        mapa.fitBounds(limites, { padding: [28, 28], maxZoom: 9 });
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