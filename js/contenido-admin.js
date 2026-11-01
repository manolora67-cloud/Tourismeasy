(() => {
    const API = '../admin/contenido_portada.php';
    const list = document.getElementById('portadaDestinos');
    const editor = document.getElementById('portadaEditor');
    const status = document.getElementById('portadaEstado');
    const newButton = document.getElementById('btnNuevoDestino');
    const editorDialog = document.getElementById('portadaEditorDialog');
    const previewDialog = document.getElementById('portadaPreviewDialog');
    const previewFrame = document.getElementById('portadaPreviewFrame');
    if (!list || !editor || !status || !newButton || !editorDialog || !previewDialog || !previewFrame) return;

    let destinos = [];
    let csrf = '';
    let cargando = false;
    let uploadsEnCurso = 0;
    let portadaInicializada = false;
    let previewPendiente = null;
    let mapaSelector = null;
    let marcadorSelector = null;
    let ultimaBusquedaMapa = 0;

    const escapeHtml = (value) => String(value == null ? '' : value).replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[char]));
    const adminAsset = (value) => /^(img|audio-video)\//.test(value || '') ? `../${value}` : value;
    const slugify = (value) => String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    const parseArticle = (value) => {
        if (value && typeof value === 'object') return value;
        if (typeof value === 'string') {
            try { return JSON.parse(value); } catch (error) { return {}; }
        }
        return {};
    };
    const normalizeRows = (rows) => rows.map((row) => ({
        ...row,
        article: parseArticle(row.article),
        publicado: row.publicado === true || ['1', 't', 'true'].includes(String(row.publicado).toLowerCase())
    }));

    function showStatus(message, error = false) {
        status.textContent = message;
        status.classList.toggle('error', error);
        const editorStatus = document.getElementById('portadaEditorStatus');
        if (editorStatus) {
            editorStatus.textContent = message;
            editorStatus.classList.toggle('error', error);
        }
    }

    async function request(url, options = {}) {
        const response = await fetch(url, { credentials: 'include', ...options });
        const result = await response.json();
        if (!response.ok || !result.ok) throw new Error(result.error || 'No se pudo completar la solicitud.');
        return result;
    }

    async function cargar() {
        if (cargando) return;
        cargando = true;
        showStatus('Cargando destinos…');
        try {
            const result = await request(`${API}?admin=1`);
            csrf = result.csrf || '';
            portadaInicializada = result.initialized === true;
            destinos = Array.isArray(result.data) ? normalizeRows(result.data) : [];
            if (!portadaInicializada) {
                const defaultsDestinos = window.TE_DESTINOS || [];
                const defaultsArticulos = window.TE_ARTICULOS || [];
                if (defaultsDestinos.length) {
                    const initialized = await request(API, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
                        body: JSON.stringify({ action: 'bootstrap', destinos: defaultsDestinos, articulos: defaultsArticulos })
                    });
                    destinos = normalizeRows(initialized.data || []);
                    portadaInicializada = true;
                }
            }
            const municipios = await (window.TE_MUNICIPIOS_PROMISE || Promise.resolve([]));
            if (!municipios.length) {
                throw new Error('No se pudo obtener la lista de municipios de Santander.');
            }
            const guardados = destinos;
            destinos = municipios.map((municipio) => {
                const aliases = [municipio.key, slugify(municipio.titulo)];
                const guardado = guardados.find((item) =>
                    aliases.includes(item.key) || slugify(item.titulo) === slugify(municipio.titulo)
                );
                return {
                    ...municipio,
                    ...(guardado || {}),
                    key: guardado ? guardado.key : municipio.key,
                    titulo: guardado ? guardado.titulo : municipio.titulo,
                    img: (guardado && guardado.img) || municipio.img,
                    publicado: guardado ? guardado.publicado : !portadaInicializada,
                    persistido: Boolean(guardado),
                    municipio: true
                };
            }).sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'));
            newButton.hidden = true;
            render();
            showStatus(`${destinos.length} municipios. Puedes editar el contenido, previsualizarlo y eliminarlo de la portada.`);
        } catch (error) {
            showStatus(error.message + ' Verifica que importaste las funciones de contenido de portada indicadas en db/README.md.', true);
            list.innerHTML = '';
        } finally {
            cargando = false;
        }
    }

    function render() {
        if (!destinos.length) {
            list.innerHTML = '<p class="portada-help">No hay destinos todavía. Usa “Crear destino” para agregar el primero.</p>';
            return;
        }
        list.innerHTML = destinos.map((destino) => `
            <article class="portada-card">
                <img src="${escapeHtml(adminAsset(destino.img))}" alt="${escapeHtml(destino.alt)}" loading="lazy">
                <div class="portada-card-body">
                    <span class="portada-label ${destino.publicado ? '' : 'off'}">${destino.publicado ? 'Publicado' : destino.persistido ? 'Oculto' : 'Eliminado de portada'}</span>
                    <h3>${escapeHtml(destino.titulo)}</h3>
                    <p>${escapeHtml(destino.desc)}</p>
                    <div class="portada-card-actions">
                        ${destino.publicado ? `<button type="button" class="portada-action preview" data-preview="${escapeHtml(destino.key)}"><i class="fa-solid fa-eye"></i> Vista previa</button>` : ''}
                        <button type="button" class="portada-action edit" data-edit="${escapeHtml(destino.key)}"><i class="fa-solid fa-pen"></i> Editar</button>
                        ${destino.persistido ? `<button type="button" class="portada-action delete" data-delete="${escapeHtml(destino.key)}"><i class="fa-solid fa-trash"></i> Eliminar</button>` : ''}
                        <button type="button" class="portada-action map" data-map="${escapeHtml(destino.key)}"><i class="fa-solid fa-map-location-dot"></i> ${destino.article && destino.article.mapa && destino.article.mapa.destacado ? 'Editar mapa' : 'Agregar al mapa'}</button>
                    </div>
                </div>
            </article>`).join('');
    }

    function closePreview() {
        previewPendiente = null;
        if (previewDialog.open) previewDialog.close();
        previewFrame.src = 'about:blank';
    }

    function openPreview(key) {
        const destination = destinos.find((item) => item.key === key);
        if (!destination) return;
        const baseArticle = (window.TE_ARTICULOS || []).find((item) => item.key === destination.key) || {};
        const customArticle = destination.article || {};
        const article = {
            ...baseArticle,
            ...customArticle,
            key: destination.key,
            poster: destination.img,
            badge: customArticle.badge || destination.badge || baseArticle.badge || '',
            titulo: customArticle.titulo || destination.titulo,
            subtitulo: customArticle.subtitulo !== undefined ? customArticle.subtitulo : baseArticle.subtitulo || '',
            datos: Array.isArray(customArticle.datos) ? customArticle.datos : baseArticle.datos || [],
            intro: customArticle.intro !== undefined ? customArticle.intro : baseArticle.intro || '',
            secciones: Array.isArray(customArticle.secciones) ? customArticle.secciones : baseArticle.secciones || [],
            ctaTexto: customArticle.ctaTexto !== undefined ? customArticle.ctaTexto : baseArticle.ctaTexto || ''
        };
        delete article.video;
        previewPendiente = {
            destination: {
                key: destination.key,
                img: destination.img,
                alt: destination.alt,
                badge: destination.badge,
                titulo: destination.titulo,
                desc: destination.desc
            },
            article
        };
        previewFrame.src = `vista_previa_destino.html?previewDestino=${encodeURIComponent(key)}&previewVersion=2`;
        previewDialog.showModal();
    }

    const blankDestination = () => ({
        key: '',
        img: '',
        alt: '',
        badge: '',
        titulo: '',
        desc: '',
        orden: destinos.reduce((maximum, destino) => Math.max(maximum, Number(destino.orden) || 0), 0) + 1,
        publicado: true,
        article: { video: '', badge: '', titulo: '', subtitulo: '', datos: [], intro: '', secciones: [], ctaTexto: '' }
    });

    function editorMarkup() {
        editor.innerHTML = `
            <h3 id="portadaFormTitle">Crear destino</h3>
            <p class="portada-editor-intro">Completa la tarjeta de la portada y el artículo asociado. Para los datos y secciones usa una entrada por línea con el formato indicado.</p>
            <p id="portadaEditorStatus" class="portada-status" role="status"></p>
            <form id="portadaForm">
                <div class="portada-form-grid">
                    <div class="portada-field"><label for="pdKey">Clave URL</label><input id="pdKey" required maxlength="50" pattern="[a-z0-9-]{2,50}" placeholder="ejemplo-destino"><small>Identificador corto, en minúsculas. No lo cambies en destinos ya publicados.</small></div>
                    <div class="portada-field"><label for="pdTitle">Nombre del destino</label><input id="pdTitle" required maxlength="150"></div>
                    <div class="portada-field full"><label for="pdDesc">Descripción de la tarjeta</label><textarea id="pdDesc" required maxlength="3000"></textarea></div>
                    <div class="portada-field"><label for="pdBadge">Insignia de la tarjeta (opcional)</label><input id="pdBadge" maxlength="80" placeholder="Popular"></div>
                    <div class="portada-field"><label for="pdAlt">Texto alternativo de la foto</label><input id="pdAlt" required maxlength="200"></div>
                    <div class="portada-field full"><label for="pdFile">Foto de la tarjeta</label><input id="pdImage" type="hidden"><input id="pdFile" type="file" accept="image/jpeg,image/png,image/webp,image/gif"><small>Selecciona una imagen JPG, PNG, WEBP o GIF (máximo 5 MB). Se subirá a Cloudinary.</small></div>
                    <div class="portada-field full"><div class="portada-image-preview"><img id="pdPreview" alt="Vista previa"><span id="pdUploadStatus"></span></div></div>
                    <div class="portada-field"><label for="pdOrder">Orden en la portada</label><input id="pdOrder" type="text" inputmode="numeric" readonly required aria-describedby="pdOrderHelp"><small id="pdOrderHelp">Asignado automáticamente. No se puede editar.</small></div>
                    <label class="portada-check"><input id="pdPublished" type="checkbox"> Publicado en la portada</label>
                    <div class="portada-map-config full" id="pdMapConfig">
                        <label class="portada-check"><input id="pdMapFeatured" type="checkbox"> Destacar en el mapa turístico</label>
                        <p class="portada-help">Busca el municipio o un lugar cercano y selecciónalo. Luego puedes hacer clic en el mapa para ajustar el marcador. Agrega de una a tres palabras clave.</p>
                        <div class="portada-map-search">
                            <label for="pdMapSearch">Buscar lugar en Santander</label>
                            <div class="portada-map-search-row">
                                <input id="pdMapSearch" type="search" maxlength="120" placeholder="Ej. Barichara, parque principal">
                                <button type="button" class="portada-map-search-button" id="pdMapSearchButton">Buscar</button>
                            </div>
                            <p id="pdMapSearchStatus" class="portada-help" role="status" aria-live="polite"></p>
                            <div id="pdMapSearchResults" class="portada-map-search-results" aria-label="Resultados de búsqueda"></div>
                        </div>
                        <div id="pdMapPicker" class="portada-map-picker" role="application" aria-label="Mapa para seleccionar la ubicación del municipio"></div>
                        <p class="portada-help">Haz clic en el mapa o arrastra el marcador para elegir la ubicación. © OpenStreetMap contributors.</p>
                        <div class="portada-map-fields">
                            <div class="portada-field"><label for="pdMapLatitude">Latitud</label><input id="pdMapLatitude" type="number" min="-90" max="90" step="any" placeholder="6.6357"></div>
                            <div class="portada-field"><label for="pdMapLongitude">Longitud</label><input id="pdMapLongitude" type="number" min="-180" max="180" step="any" placeholder="-73.2228"></div>
                            <div class="portada-field"><label for="pdMapTag1">Palabra clave 1</label><input id="pdMapTag1" maxlength="40" placeholder="Colonial"></div>
                            <div class="portada-field"><label for="pdMapTag2">Palabra clave 2</label><input id="pdMapTag2" maxlength="40" placeholder="Camino Real"></div>
                            <div class="portada-field"><label for="pdMapTag3">Palabra clave 3</label><input id="pdMapTag3" maxlength="40" placeholder="Artesanías"></div>
                        </div>
                    </div>
                    <div class="portada-field"><label for="paTitle">Título del artículo</label><input id="paTitle" maxlength="150"></div>
                    <div class="portada-field"><label for="paSubtitle">Subtítulo</label><input id="paSubtitle" maxlength="250"></div>
                    <div class="portada-field"><label for="paBadge">Insignia del artículo</label><input id="paBadge" maxlength="80"></div>
                    <div class="portada-field full"><label for="paVideoFile">Video de cabecera (opcional)</label><input id="paVideo" type="hidden"><input id="paVideoFile" type="file" accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm"><small>Selecciona un video MP4, MOV o WEBM de máximo 10 segundos y 10 MB. Se subirá a Cloudinary.</small><span id="paVideoUploadStatus" role="status"></span><video id="paVideoPreview" class="portada-video-preview" controls muted playsinline hidden></video><button type="button" class="portada-video-remove" id="paVideoRemove" hidden><i class="fa-solid fa-trash"></i> Quitar video</button></div>
                    <div class="portada-field full"><label for="paFacts">Datos rápidos</label><textarea id="paFacts" placeholder="Altitud - 959 m.s.n.m.&#10;Clima - 24 °C promedio"></textarea><small>Una fila por línea: etiqueta - valor</small></div>
                    <div class="portada-field full"><label for="paIntro">Introducción del artículo</label><textarea id="paIntro"></textarea></div>
                    <div class="portada-field full"><label for="paSections">Secciones del artículo</label><textarea id="paSections" placeholder="Cómo moverte - Texto de la sección...&#10;Dónde alojarte - Texto de la sección..."></textarea><small>Una sección por línea: título - texto. Puedes usar emojis en el título.</small></div>
                    <div class="portada-field full"><label for="paCta">Texto final del artículo</label><input id="paCta" maxlength="250"></div>
                </div>
                <div class="portada-form-actions">
                    <button type="button" class="portada-cancel" id="pdCancel">Cancelar</button>
                    <button type="submit" class="portada-save" id="pdSave"><i class="fa-solid fa-floppy-disk"></i> Guardar destino</button>
                </div>
            </form>`;
    }

    function linesFromFacts(facts) {
        return (facts || []).map((item) => `${item.label || ''} - ${item.val || ''}`).join('\n');
    }

    function linesFromSections(sections) {
        return (sections || []).map((item) => `${item.titulo || ''} - ${item.texto || ''}`).join('\n');
    }

    function parseLines(value, firstKey, secondKey) {
        return value.split('\n').map((line) => {
            const modernDivider = line.indexOf(' - ');
            const divider = modernDivider >= 0 ? modernDivider : line.indexOf('|');
            const separatorLength = modernDivider >= 0 ? 3 : 1;
            return divider < 0 ? null : {
                [firstKey]: line.slice(0, divider).trim(),
                [secondKey]: line.slice(divider + separatorLength).trim()
            };
        }).filter((item) => item && item[firstKey] && item[secondKey]);
    }

    function parseFacts(value) {
        return value.split('\n').map((line) => {
            const divider = line.includes(' - ') ? line.indexOf(' - ') : line.indexOf('|');
            return divider < 0 ? null : {
                label: line.slice(0, divider).trim(),
                val: line.slice(divider + (line.startsWith(' - ', divider) ? 3 : 1)).trim()
            };
        }).filter((item) => item && item.label && item.val);
    }

    function updateMapCoordinates(latitude, longitude, zoom = 15) {
        document.getElementById('pdMapLatitude').value = latitude.toFixed(6);
        document.getElementById('pdMapLongitude').value = longitude.toFixed(6);
        if (mapaSelector) {
            const position = [latitude, longitude];
            if (!marcadorSelector) {
                marcadorSelector = window.L.marker(position, { draggable: true }).addTo(mapaSelector);
                marcadorSelector.on('dragend', () => {
                    const point = marcadorSelector.getLatLng();
                    updateMapCoordinates(point.lat, point.lng, mapaSelector.getZoom());
                });
            } else {
                marcadorSelector.setLatLng(position);
            }
            mapaSelector.setView(position, zoom);
        }
    }

    function showMapSearchResults(results) {
        const container = document.getElementById('pdMapSearchResults');
        container.replaceChildren();

        results.forEach((result) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'portada-map-search-result';
            button.textContent = result.display_name;
            button.addEventListener('click', () => {
                const latitude = Number(result.lat);
                const longitude = Number(result.lon);
                updateMapCoordinates(latitude, longitude);
                document.getElementById('pdMapSearchStatus').textContent = 'Ubicación seleccionada. Puedes afinarla haciendo clic o arrastrando el marcador.';
                container.replaceChildren();
            });
            container.appendChild(button);
        });
    }

    async function searchMapLocation() {
        const input = document.getElementById('pdMapSearch');
        const status = document.getElementById('pdMapSearchStatus');
        const button = document.getElementById('pdMapSearchButton');
        if (button.disabled) return;
        const query = input.value.trim();
        if (!query) {
            status.textContent = 'Escribe el nombre de un municipio o lugar para buscarlo.';
            input.focus();
            return;
        }

        button.disabled = true;
        status.textContent = 'Buscando en el mapa…';
        try {
            const tiempoRestante = 1100 - (Date.now() - ultimaBusquedaMapa);
            if (tiempoRestante > 0) {
                await new Promise((resolve) => window.setTimeout(resolve, tiempoRestante));
            }
            const parametros = new URLSearchParams({
                q: `${query}, Santander, Colombia`,
                format: 'jsonv2',
                limit: '5',
                countrycodes: 'co',
                'accept-language': 'es'
            });
            ultimaBusquedaMapa = Date.now();
            const response = await fetch(`https://nominatim.openstreetmap.org/search?${parametros}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const results = await response.json();
            if (!Array.isArray(results)) throw new Error('La respuesta de búsqueda no tiene el formato esperado.');
            const validResults = results.filter((result) => (
                Number.isFinite(Number(result.lat))
                && Number.isFinite(Number(result.lon))
                && typeof result.display_name === 'string'
            ));
            showMapSearchResults(validResults);
            status.textContent = validResults.length
                ? 'Elige el resultado correcto para ubicar el marcador.'
                : 'No encontramos ese lugar. Prueba con otro nombre.';
        } catch (error) {
            console.error('[TourismEasy] No se pudo buscar la ubicación del municipio.', error);
            status.textContent = 'No se pudo completar la búsqueda. Revisa tu conexión e inténtalo de nuevo.';
        } finally {
            button.disabled = false;
        }
    }

    function initializeMapPicker(mapConfig) {
        const container = document.getElementById('pdMapPicker');
        if (!window.L) {
            document.getElementById('pdMapSearchStatus').textContent = 'No se pudo cargar el mapa. Puedes ingresar las coordenadas manualmente.';
            return;
        }

        if (mapaSelector) {
            mapaSelector.remove();
            mapaSelector = null;
            marcadorSelector = null;
        }

        const latitudeValue = document.getElementById('pdMapLatitude').value.trim();
        const longitudeValue = document.getElementById('pdMapLongitude').value.trim();
        const latitude = Number(latitudeValue);
        const longitude = Number(longitudeValue);
        const tieneCoordenadas = latitudeValue !== '' && longitudeValue !== ''
            && Number.isFinite(latitude) && Number.isFinite(longitude);
        const centro = tieneCoordenadas ? [latitude, longitude] : [6.7, -73.2];
        mapaSelector = window.L.map(container, { scrollWheelZoom: false }).setView(centro, tieneCoordenadas ? 14 : 8);
        window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapaSelector);

        if (tieneCoordenadas) updateMapCoordinates(latitude, longitude, 14);
        mapaSelector.on('click', (event) => {
            updateMapCoordinates(event.latlng.lat, event.latlng.lng, mapaSelector.getZoom());
        });

        document.getElementById('pdMapSearchButton').addEventListener('click', searchMapLocation);
        document.getElementById('pdMapSearch').addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                searchMapLocation();
            }
        });
        ['pdMapLatitude', 'pdMapLongitude'].forEach((id) => {
            document.getElementById(id).addEventListener('change', () => {
                const latitudeValue = document.getElementById('pdMapLatitude').value.trim();
                const longitudeValue = document.getElementById('pdMapLongitude').value.trim();
                const latitude = Number(latitudeValue);
                const longitude = Number(longitudeValue);
                if (latitudeValue && longitudeValue
                    && Number.isFinite(latitude) && latitude >= -90 && latitude <= 90
                    && Number.isFinite(longitude) && longitude >= -180 && longitude <= 180) {
                    updateMapCoordinates(latitude, longitude, mapaSelector.getZoom());
                }
            });
        });
        if (mapConfig && mapConfig.destacado) {
            document.getElementById('pdMapSearchStatus').textContent = 'Ubicación actual. Busca otro lugar o haz clic en el mapa para cambiarla.';
        }
        window.setTimeout(() => mapaSelector && mapaSelector.invalidateSize(), 0);
    }

    function openEditor(destination, mapOnly = false) {
        const isNew = !destination.key;
        const item = destination;
        const article = item.article || {};
        editorMarkup();
        editor.hidden = false;
        document.getElementById('portadaFormTitle').textContent = mapOnly
            ? `Configurar mapa: ${item.titulo}`
            : isNew ? 'Crear destino' : `Editar ${item.titulo}`;
        editor.querySelector('.portada-editor-intro').textContent = mapOnly
            ? 'Configura si este municipio aparece en el mapa, su ubicación y las palabras clave. Los demás datos se conservarán.'
            : item.municipio
                ? 'Edita la tarjeta de portada y todos los campos del artículo. La clave y el orden se mantienen fijos.'
                : 'Completa la tarjeta de la portada y el artículo asociado. Para los datos y secciones usa una entrada por línea con el formato indicado.';
        const values = {
            pdKey: item.key,
            pdTitle: item.titulo,
            pdDesc: item.desc,
            pdBadge: item.badge,
            pdAlt: item.alt,
            pdImage: item.img,
            pdOrder: item.orden,
            pdMapLatitude: article.mapa && article.mapa.latitud,
            pdMapLongitude: article.mapa && article.mapa.longitud,
            pdMapTag1: article.mapa && article.mapa.etiquetas && article.mapa.etiquetas[0],
            pdMapTag2: article.mapa && article.mapa.etiquetas && article.mapa.etiquetas[1],
            pdMapTag3: article.mapa && article.mapa.etiquetas && article.mapa.etiquetas[2],
            paTitle: article.titulo || item.titulo,
            paSubtitle: article.subtitulo,
            paBadge: article.badge,
            paVideo: article.video,
            paFacts: linesFromFacts(article.datos),
            paIntro: article.intro,
            paSections: linesFromSections(article.secciones),
            paCta: article.ctaTexto
        };
        Object.entries(values).forEach(([id, value]) => { document.getElementById(id).value = value == null ? '' : value; });
        document.getElementById('pdKey').readOnly = !isNew || item.municipio;
        document.getElementById('pdPublished').checked = item.publicado !== false;
        const mapFeatured = document.getElementById('pdMapFeatured');
        mapFeatured.checked = mapOnly || Boolean(article.mapa && article.mapa.destacado);
        const updateMapFields = () => {
            ['pdMapLatitude', 'pdMapLongitude', 'pdMapTag1', 'pdMapTag2', 'pdMapTag3'].forEach((id) => {
                const field = document.getElementById(id);
                field.disabled = !mapFeatured.checked;
                field.required = mapFeatured.checked && ['pdMapLatitude', 'pdMapLongitude'].includes(id);
            });
        };
        mapFeatured.addEventListener('change', updateMapFields);
        updateMapFields();
        document.getElementById('portadaForm').classList.toggle('map-only', mapOnly);
        const preview = document.getElementById('pdPreview');
        preview.src = item.img ? adminAsset(item.img) : '';
        const videoPreview = document.getElementById('paVideoPreview');
        const videoRemove = document.getElementById('paVideoRemove');
        if (article.video) {
            videoPreview.src = adminAsset(article.video);
            videoPreview.hidden = false;
            videoRemove.hidden = false;
        } else {
            videoPreview.removeAttribute('src');
            videoPreview.hidden = true;
            videoRemove.hidden = true;
        }
        document.getElementById('pdCancel').addEventListener('click', () => editorDialog.close());
        document.getElementById('pdFile').addEventListener('change', uploadImage);
        document.getElementById('paVideoFile').addEventListener('change', uploadVideo);
        videoRemove.addEventListener('click', () => {
            document.getElementById('paVideo').value = '';
            document.getElementById('paVideoFile').value = '';
            videoPreview.pause();
            videoPreview.removeAttribute('src');
            videoPreview.hidden = true;
            videoRemove.hidden = true;
            document.getElementById('paVideoUploadStatus').textContent = 'Video quitado. Guarda el destino para aplicar el cambio.';
        });
        document.getElementById('portadaForm').addEventListener('submit', (event) => save(event, item));
        if (!editorDialog.open) editorDialog.showModal();
        if (mapOnly) {
            document.getElementById('pdMapConfig').scrollIntoView({ block: 'center' });
            requestAnimationFrame(() => initializeMapPicker(article.mapa));
        } else {
            document.getElementById('pdTitle').focus();
        }
    }

    async function subirArchivo(file, field) {
        const body = new FormData();
        body.append(field, file);
        return request('../subir_imagen.php', {
            method: 'POST',
            headers: { 'X-CSRF-Token': csrf, 'X-Upload-Type': field },
            body
        });
    }

    async function uploadImage(event) {
        const file = event.target.files && event.target.files[0];
        if (!file) return;
        const message = document.getElementById('pdUploadStatus');
        if (file.size > 5 * 1024 * 1024) {
            message.textContent = 'La imagen no puede superar 5 MB.';
            event.target.value = '';
            return;
        }
        message.textContent = 'Subiendo imagen…';
        uploadsEnCurso++;
        try {
            const result = await subirArchivo(file, 'imagen');
            document.getElementById('pdImage').value = result.url;
            document.getElementById('pdPreview').src = result.url;
            message.textContent = 'Imagen subida correctamente.';
        } catch (error) {
            message.textContent = error.message;
            showStatus(error.message, true);
        } finally {
            uploadsEnCurso--;
        }
    }

    function obtenerDuracionVideo(file) {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            const objectUrl = URL.createObjectURL(file);
            video.preload = 'metadata';
            video.onloadedmetadata = () => {
                URL.revokeObjectURL(objectUrl);
                resolve(video.duration);
            };
            video.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                reject(new Error('No se pudo leer la duración del video. Usa MP4, MOV o WEBM.'));
            };
            video.src = objectUrl;
        });
    }

    async function uploadVideo(event) {
        const file = event.target.files && event.target.files[0];
        if (!file) return;
        const message = document.getElementById('paVideoUploadStatus');
        if (file.size > 10 * 1024 * 1024) {
            message.textContent = 'El video no puede superar 10 MB.';
            event.target.value = '';
            return;
        }

        try {
            const duration = await obtenerDuracionVideo(file);
            if (!Number.isFinite(duration) || duration > 10) {
                throw new Error('El video debe durar máximo 10 segundos.');
            }
        } catch (error) {
            message.textContent = error.message;
            event.target.value = '';
            return;
        }

        message.textContent = 'Subiendo video…';
        uploadsEnCurso++;
        try {
            const result = await subirArchivo(file, 'video');
            document.getElementById('paVideo').value = result.url;
            const preview = document.getElementById('paVideoPreview');
            preview.src = result.url;
            preview.hidden = false;
            document.getElementById('paVideoRemove').hidden = false;
            message.textContent = 'Video subido correctamente.';
        } catch (error) {
            message.textContent = error.message;
            showStatus(error.message, true);
            event.target.value = '';
        } finally {
            uploadsEnCurso--;
        }
    }

    async function save(event, original) {
        event.preventDefault();
        const button = document.getElementById('pdSave');
        if (uploadsEnCurso > 0) {
            showStatus('Espera a que termine la subida de los archivos.', true);
            return;
        }
        if (!document.getElementById('pdImage').value) {
            showStatus('Selecciona una foto de la tarjeta y espera a que termine la subida.', true);
            return;
        }
        button.disabled = true;
        showStatus('Guardando destino…');
        const value = (id) => document.getElementById(id).value.trim();
        const destacarEnMapa = document.getElementById('pdMapFeatured').checked;
        const etiquetasMapa = ['pdMapTag1', 'pdMapTag2', 'pdMapTag3']
            .map(value)
            .filter(Boolean);
        const latitudMapaTexto = value('pdMapLatitude');
        const longitudMapaTexto = value('pdMapLongitude');
        const latitudMapa = Number(latitudMapaTexto);
        const longitudMapa = Number(longitudMapaTexto);
        if (destacarEnMapa && (
            !latitudMapaTexto || !Number.isFinite(latitudMapa) || latitudMapa < -90 || latitudMapa > 90
            || !longitudMapaTexto || !Number.isFinite(longitudMapa) || longitudMapa < -180 || longitudMapa > 180
            || etiquetasMapa.length < 1
        )) {
            showStatus('Para destacar el municipio en el mapa, indica coordenadas válidas y al menos una palabra clave.', true);
            button.disabled = false;
            return;
        }
        const record = {
            ...original,
            key: original.municipio ? original.key : value('pdKey'),
            img: value('pdImage'),
            alt: value('pdAlt'),
            badge: value('pdBadge'),
            titulo: value('pdTitle'),
            desc: value('pdDesc'),
            orden: Number(original.orden) || Number(value('pdOrder')) || 0,
            publicado: document.getElementById('pdPublished').checked,
            article: {
                video: value('paVideo'),
                badge: value('paBadge'),
                titulo: value('paTitle') || value('pdTitle'),
                subtitulo: value('paSubtitle'),
                datos: parseFacts(value('paFacts')),
                intro: value('paIntro'),
                secciones: parseLines(value('paSections'), 'titulo', 'texto'),
                ctaTexto: value('paCta'),
                mapa: destacarEnMapa ? {
                    destacado: true,
                    latitud: latitudMapa,
                    longitud: longitudMapa,
                    etiquetas: etiquetasMapa
                } : {
                    destacado: false,
                    latitud: null,
                    longitud: null,
                    etiquetas: []
                }
            }
        };
        if (original.key && original.key !== record.key) {
            showStatus('La clave de un destino existente no se puede cambiar.', true);
            button.disabled = false;
            return;
        }
        try {
            const result = await request(API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
                body: JSON.stringify({ action: 'save', destino: record })
            });
            const index = destinos.findIndex((destination) => destination.key === record.key);
            if (index < 0) destinos.push(result.data);
            else destinos[index] = { ...result.data, municipio: original.municipio, persistido: true };
            destinos.sort((a, b) => a.orden - b.orden || a.titulo.localeCompare(b.titulo));
            render();
            editorDialog.close();
            showStatus('Destino guardado. La portada pública ya mostrará los cambios.');
        } catch (error) {
            showStatus(error.message, true);
        } finally {
            button.disabled = false;
        }
    }

    async function deleteDestination(key) {
        const item = destinos.find((destination) => destination.key === key);
        if (!item || !item.persistido || !window.confirm(`¿Eliminar definitivamente el contenido de “${item.titulo}” de la portada? El municipio seguirá en la base de datos y podrás volver a crear su contenido editándolo.`)) return;
        try {
            await request(API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
                body: JSON.stringify({ action: 'delete', key })
            });
            destinos = destinos.map((destination) => destination.key === key
                ? { ...destination, persistido: false, publicado: false }
                : destination);
            render();
            showStatus('Contenido del municipio eliminado de la portada. El municipio permanece en el catálogo y puedes volver a publicarlo editándolo.');
        } catch (error) {
            showStatus(error.message, true);
        }
    }

    newButton.addEventListener('click', () => openEditor(blankDestination()));
    list.addEventListener('click', (event) => {
        const editButton = event.target.closest('[data-edit]');
        const deleteButton = event.target.closest('[data-delete]');
        const previewButton = event.target.closest('[data-preview]');
        const mapButton = event.target.closest('[data-map]');
        if (editButton) {
            const item = destinos.find((destination) => destination.key === editButton.dataset.edit);
            if (item) openEditor(item);
        }
        if (deleteButton) deleteDestination(deleteButton.dataset.delete);
        if (previewButton) openPreview(previewButton.dataset.preview);
        if (mapButton) {
            const item = destinos.find((destination) => destination.key === mapButton.dataset.map);
            if (item) openEditor(item, true);
        }
    });
    previewDialog.addEventListener('click', (event) => {
        if (event.target === previewDialog) closePreview();
    });
    previewFrame.addEventListener('load', () => {
        if (!previewPendiente) return;
        const previewUrl = new URL(previewFrame.contentWindow.location.href);
        if (!previewUrl.pathname.endsWith('/vista_previa_destino.html')) return;
        if (previewUrl.searchParams.get('previewDestino') !== previewPendiente.destination.key) return;
        previewFrame.contentWindow.postMessage({
            type: 'tourismeasy:preview-destino',
            destination: previewPendiente
        }, window.location.origin);
        previewPendiente = null;
    });
    previewDialog.addEventListener('close', () => { previewFrame.src = 'about:blank'; });
    previewDialog.querySelector('[data-preview-close]').addEventListener('click', closePreview);
    editorDialog.addEventListener('cancel', (event) => {
        event.preventDefault();
    });
    editorDialog.addEventListener('mousedown', (event) => {
        if (event.target === editorDialog) {
            event.preventDefault();
        }
    });
    editorDialog.addEventListener('close', () => {
        editor.hidden = true;
        if (mapaSelector) {
            mapaSelector.remove();
            mapaSelector = null;
            marcadorSelector = null;
        }
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && previewDialog.open) closePreview();
    });

    cargar();
})();