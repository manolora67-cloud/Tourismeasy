(function () {
    "use strict";

    const coordenadasMunicipios = {
        "68001": [7.127459, -73.119130],
        "68013": [6.162366, -73.521569],
        "68020": [5.758765, -73.915162],
        "68051": [6.694573, -73.018703],
        "68077": [5.932603, -73.612437],
        "68079": [6.635716, -73.223442],
        "68081": [7.067331, -73.852563],
        "68092": [6.900640, -73.283559],
        "68101": [5.989980, -73.770548],
        "68121": [6.593352, -73.246398],
        "68132": [7.348091, -72.945929],
        "68147": [6.529180, -72.698262],
        "68152": [6.627352, -72.626097],
        "68160": [6.753059, -72.973394],
        "68162": [6.843599, -72.693963],
        "68167": [6.288174, -73.148289],
        "68169": [7.280799, -72.968226],
        "68176": [6.344397, -73.372743],
        "68179": [6.062477, -73.637253],
        "68190": [6.314541, -73.949681],
        "68207": [6.768293, -72.694484],
        "68209": [6.355975, -73.240963],
        "68211": [6.290737, -73.474556],
        "68217": [6.295630, -73.040706],
        "68229": [6.606703, -73.069209],
        "68235": [6.698692, -73.511569],
        "68245": [6.245266, -73.497561],
        "68250": [6.055759, -73.814993],
        "68255": [7.470891, -73.203309],
        "68264": [6.137825, -73.098837],
        "68266": [6.668207, -72.699343],
        "68271": [5.802419, -73.970934],
        "68276": [7.062580, -73.085885],
        "68296": [6.637910, -73.287453],
        "68298": [5.945857, -73.345350],
        "68307": [7.069069, -73.170028],
        "68318": [6.876076, -72.855764],
        "68320": [6.246817, -73.418182],
        "68322": [6.308298, -73.321224],
        "68324": [5.954265, -73.699788],
        "68327": [6.025402, -73.572506],
        "68344": [6.542627, -73.307787],
        "68368": [5.876558, -73.782777],
        "68370": [6.732705, -73.096113],
        "68377": [5.858840, -73.965829],
        "68385": [6.220533, -73.811375],
        "68397": [6.178593, -73.589584],
        "68406": [7.113842, -73.217406],
        "68418": [6.755903, -73.101821],
        "68425": [6.506171, -72.592896],
        "68432": [6.699661, -72.732456],
        "68444": [7.323081, -73.015568],
        "68464": [6.476121, -72.970620],
        "68468": [6.673729, -72.809114],
        "68498": [6.340720, -73.122026],
        "68500": [6.264200, -73.298780],
        "68502": [6.343897, -72.816606],
        "68522": [6.538635, -73.291693],
        "68524": [6.406625, -73.287918],
        "68533": [6.416541, -73.169399],
        "68547": [6.987481, -73.050413],
        "68549": [6.532250, -73.173230],
        "68572": [5.877096, -73.679106],
        "68573": [6.651506, -74.056449],
        "68575": [7.348018, -73.897978],
        "68615": [7.264631, -73.150280],
        "68655": [7.393942, -73.499886],
        "68669": [6.810067, -72.850635],
        "68673": [6.125328, -73.509729],
        "68679": [6.555286, -73.131235],
        "68682": [6.427589, -72.867653],
        "68684": [6.658387, -72.733489],
        "68686": [6.575929, -72.645549],
        "68689": [6.881139, -73.410626],
        "68705": [6.989766, -72.907512],
        "68720": [6.338798, -73.616366],
        "68745": [6.443509, -73.337420],
        "68755": [6.470518, -73.262319],
        "68770": [6.103265, -73.440173],
        "68773": [5.918810, -73.791256],
        "68780": [7.366493, -72.984736],
        "68820": [7.202063, -72.966373],
        "68842": [6.448015, -73.144301],
        "68855": [6.012363, -73.672960],
        "68861": [7.309264, -72.871808],
        "68867": [6.671239, -73.175398],
        "68872": [6.816660, -73.268653],
    };
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

        const enlace = document.createElement("a");
        enlace.className = "mapa-destino-link";
        enlace.href = `#art-${encodeURIComponent(destino.key)}`;
        enlace.dataset.article = destino.key;
        enlace.textContent = "Ver destino";
        cuerpo.appendChild(enlace);

        contenido.appendChild(cuerpo);
        return contenido;
    }

    function crearMarcador(destino, coordenadas, mapa) {
        const icono = window.L.divIcon({
            className: "mapa-marcador-wrapper",
            html: '<span class="mapa-marcador" aria-hidden="true"><i class="fa-solid fa-location-dot"></i></span>',
            iconSize: [42, 48],
            iconAnchor: [21, 44],
            popupAnchor: [0, -40],
        });

        return window.L.marker(coordenadas, {
            icon: icono,
            title: destino.titulo,
            alt: `Ver ${destino.titulo} en el mapa`,
        }).addTo(mapa).bindPopup(crearContenidoPopup(destino), {
            maxWidth: 280,
            minWidth: 240,
            className: "destino-popup",
        });
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
        tipo.textContent = "Municipio de Santander";
        informacion.append(titulo, tipo);
        boton.appendChild(informacion);

        const flecha = document.createElement("i");
        flecha.className = "fa-solid fa-crosshairs mapa-destino-flecha";
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
        return boton;
    }

    async function cargarDestinos(mapa, bloque) {
        const estado = bloque.querySelector(".mapa-estado");
        const lista = bloque.querySelector(".mapa-destinos-lista");
        const contador = bloque.querySelector(".mapa-contador-numero");
        const selectorOrden = bloque.querySelector(".mapa-orden-select");
        estado.textContent = "Cargando municipios…";
        try {
            const destinos = await window.TE_MUNICIPIOS_PROMISE;
            if (!Array.isArray(destinos)) {
                throw new Error("La lista de municipios no está disponible.");
            }
            if (destinos.length !== Object.keys(coordenadasMunicipios).length) {
                throw new Error(`Se esperaban ${Object.keys(coordenadasMunicipios).length} municipios y se recibieron ${destinos.length}.`);
            }
            const sinCoordenadas = destinos.filter((destino) => !coordenadasMunicipios[String(destino.id)]);
            if (sinCoordenadas.length) {
                throw new Error(`Faltan coordenadas para: ${sinCoordenadas.map((destino) => destino.titulo).join(", ")}`);
            }

            contador.textContent = destinos.length;

            if (!destinos.length) {
                estado.textContent = "No hay municipios disponibles para mostrar.";
                lista.innerHTML = '<p class="mapa-lista-vacia">No hay municipios disponibles.</p>';
                mapa.setView([6.7, -73.2], 8);
                return;
            }

            const entradasLista = destinos.map((destino) => {
                const marcador = crearMarcador(destino, coordenadasMunicipios[String(destino.id)], mapa);
                const boton = agregarDestinoAlPanel(destino, marcador, lista, mapa);
                return { destino, boton, marcador };
            });
            const actualizarOrden = () => {
                const ordenadas = ordenarMunicipios(entradasLista, selectorOrden.value);
                lista.replaceChildren(...ordenadas.map((entrada) => entrada.boton));
            };
            selectorOrden.addEventListener("change", actualizarOrden);
            actualizarOrden();

            estado.textContent = "";
            estado.hidden = true;
            mapa.fitBounds(window.L.featureGroup(entradasLista.map((entrada) => entrada.marcador)).getBounds(), {
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
                    <h2 class="mapa-titulo">Santander, municipio a municipio</h2>
                    <p>Explora el territorio, ubica cada municipio y elige tu próxima aventura.</p>
                </div>
                <div class="mapa-contador" aria-live="polite">
                    <strong class="mapa-contador-numero">0</strong>
                    <span>municipios<br>de Santander</span>
                </div>
            </header>
            <p class="mapa-estado" role="status" aria-live="polite"></p>
            <div class="mapa-explorador">
                <aside class="mapa-panel-lateral" aria-label="Municipios de Santander">
                    <div class="mapa-panel-cabecera">
                        <div>
                            <h3>Explora municipios</h3>
                            <p>Selecciona un lugar para ubicarlo</p>
                        </div>
                        <i class="fa-solid fa-map-location-dot" aria-hidden="true"></i>
                    </div>
                    <div class="mapa-orden">
                        <label for="mapa-orden-select">Ordenar por</label>
                        <select id="mapa-orden-select" class="mapa-orden-select">
                            <option value="relevantes">Más relevantes</option>
                            <option value="az">A–Z</option>
                            <option value="za">Z–A</option>
                        </select>
                    </div>
                    <div class="mapa-destinos-lista"></div>
                </aside>
                <div id="mapa-turistico" role="application" aria-label="Mapa interactivo de los municipios de Santander"></div>
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