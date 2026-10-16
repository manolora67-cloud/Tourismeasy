(() => {
    const API = '../api/contenido_portada.php';
    const list = document.getElementById('portadaDestinos');
    const editor = document.getElementById('portadaEditor');
    const status = document.getElementById('portadaEstado');
    const newButton = document.getElementById('btnNuevoDestino');
    if (!list || !editor || !status || !newButton) return;

    let destinos = [];
    let csrf = '';
    let cargando = false;

    const escapeHtml = (value) => String(value == null ? '' : value).replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[char]));
    const adminAsset = (value) => /^(img|audio-video)\//.test(value || '') ? `../${value}` : value;

    function showStatus(message, error = false) {
        status.textContent = message;
        status.classList.toggle('error', error);
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
            destinos = Array.isArray(result.data) ? result.data : [];
            if (!destinos.length) {
                const defaultsDestinos = window.TE_DESTINOS || [];
                const defaultsArticulos = window.TE_ARTICULOS || [];
                if (defaultsDestinos.length) {
                    const initialized = await request(API, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
                        body: JSON.stringify({ action: 'bootstrap', destinos: defaultsDestinos, articulos: defaultsArticulos })
                    });
                    destinos = initialized.data || [];
                }
            }
            render();
            showStatus(`${destinos.length} destino${destinos.length === 1 ? '' : 's'} en el catálogo.`);
        } catch (error) {
            showStatus(error.message + ' Si es una instalación existente, ejecuta la migración SQL de contenido de portada.', true);
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
                    <span class="portada-label ${destino.publicado ? '' : 'off'}">${destino.publicado ? 'Publicado' : 'Oculto'}</span>
                    <h3>${escapeHtml(destino.titulo)}</h3>
                    <p>${escapeHtml(destino.desc)}</p>
                    <div class="portada-card-actions">
                        <button type="button" class="portada-action edit" data-edit="${escapeHtml(destino.key)}"><i class="fa-solid fa-pen"></i> Editar</button>
                        <button type="button" class="portada-action delete" data-delete="${escapeHtml(destino.key)}"><i class="fa-solid fa-trash"></i> Eliminar</button>
                    </div>
                </div>
            </article>`).join('');
    }

    const blankDestination = () => ({
        key: '',
        img: '',
        alt: '',
        badge: '',
        titulo: '',
        desc: '',
        orden: destinos.length + 1,
        publicado: true,
        article: { video: '', badge: '', titulo: '', subtitulo: '', datos: [], intro: '', secciones: [], ctaTexto: '' }
    });

    function editorMarkup() {
        editor.innerHTML = `
            <h3 id="portadaFormTitle">Crear destino</h3>
            <p class="portada-editor-intro">Completa la tarjeta de la portada y el artículo asociado. Para los datos y secciones usa una entrada por línea con el formato indicado.</p>
            <form id="portadaForm">
                <div class="portada-form-grid">
                    <div class="portada-field"><label for="pdKey">Clave URL</label><input id="pdKey" required maxlength="50" pattern="[a-z0-9-]{2,50}" placeholder="ejemplo-destino"><small>Identificador corto, en minúsculas. No lo cambies en destinos ya publicados.</small></div>
                    <div class="portada-field"><label for="pdTitle">Nombre del destino</label><input id="pdTitle" required maxlength="150"></div>
                    <div class="portada-field full"><label for="pdDesc">Descripción de la tarjeta</label><textarea id="pdDesc" required maxlength="3000"></textarea></div>
                    <div class="portada-field"><label for="pdBadge">Insignia de la tarjeta (opcional)</label><input id="pdBadge" maxlength="80" placeholder="Popular"></div>
                    <div class="portada-field"><label for="pdAlt">Texto alternativo de la foto</label><input id="pdAlt" required maxlength="200"></div>
                    <div class="portada-field full"><label for="pdImage">Ruta/URL de la foto</label><input id="pdImage" required placeholder="img/destino.png"><small>También puedes elegir una imagen y subirla a Cloudinary.</small><input id="pdFile" type="file" accept="image/jpeg,image/png,image/webp,image/gif"></div>
                    <div class="portada-field full"><div class="portada-image-preview"><img id="pdPreview" alt="Vista previa"><span id="pdUploadStatus"></span></div></div>
                    <div class="portada-field"><label for="pdOrder">Orden en la portada</label><input id="pdOrder" type="number" min="0" max="10000" required></div>
                    <label class="portada-check"><input id="pdPublished" type="checkbox"> Publicado en la portada</label>
                    <div class="portada-field"><label for="paTitle">Título del artículo</label><input id="paTitle" maxlength="150"></div>
                    <div class="portada-field"><label for="paSubtitle">Subtítulo</label><input id="paSubtitle" maxlength="250"></div>
                    <div class="portada-field"><label for="paBadge">Insignia del artículo</label><input id="paBadge" maxlength="80"></div>
                    <div class="portada-field"><label for="paVideo">Video de cabecera (opcional)</label><input id="paVideo" placeholder="audio-video/destino.mp4"><small>URL HTTPS o ruta dentro de audio-video/.</small></div>
                    <div class="portada-field full"><label for="paFacts">Datos rápidos</label><textarea id="paFacts" placeholder="Altitud | 959 m.s.n.m.&#10;Clima | 24 °C promedio"></textarea><small>Una fila por línea: etiqueta | valor</small></div>
                    <div class="portada-field full"><label for="paIntro">Introducción del artículo</label><textarea id="paIntro"></textarea></div>
                    <div class="portada-field full"><label for="paSections">Secciones del artículo</label><textarea id="paSections" placeholder="Cómo moverte | Texto de la sección...&#10;Dónde alojarte | Texto de la sección..."></textarea><small>Una sección por línea: título | texto. Puedes usar emojis en el título.</small></div>
                    <div class="portada-field full"><label for="paCta">Texto final del artículo</label><input id="paCta" maxlength="250"></div>
                </div>
                <div class="portada-form-actions">
                    <button type="button" class="portada-cancel" id="pdCancel">Cancelar</button>
                    <button type="submit" class="portada-save" id="pdSave"><i class="fa-solid fa-floppy-disk"></i> Guardar destino</button>
                </div>
            </form>`;
    }

    function linesFromFacts(facts) {
        return (facts || []).map((item) => `${item.label || ''} | ${item.val || ''}`).join('\n');
    }

    function linesFromSections(sections) {
        return (sections || []).map((item) => `${item.titulo || ''} | ${item.texto || ''}`).join('\n');
    }

    function parseLines(value, firstKey, secondKey) {
        return value.split('\n').map((line) => {
            const divider = line.indexOf('|');
            return divider < 0 ? null : {
                [firstKey]: line.slice(0, divider).trim(),
                [secondKey]: line.slice(divider + 1).trim()
            };
        }).filter((item) => item && item[firstKey] && item[secondKey]);
    }

    function openEditor(destination) {
        const isNew = !destination.key;
        const item = destination;
        const article = item.article || {};
        editorMarkup();
        editor.hidden = false;
        document.getElementById('portadaFormTitle').textContent = isNew ? 'Crear destino' : `Editar ${item.titulo}`;
        const values = {
            pdKey: item.key,
            pdTitle: item.titulo,
            pdDesc: item.desc,
            pdBadge: item.badge,
            pdAlt: item.alt,
            pdImage: item.img,
            pdOrder: item.orden,
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
        document.getElementById('pdKey').readOnly = !isNew;
        document.getElementById('pdPublished').checked = item.publicado !== false;
        const preview = document.getElementById('pdPreview');
        preview.src = adminAsset(item.img || '');
        document.getElementById('pdCancel').addEventListener('click', () => { editor.hidden = true; });
        document.getElementById('pdFile').addEventListener('change', uploadImage);
        document.getElementById('portadaForm').addEventListener('submit', (event) => save(event, item));
        editor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    async function uploadImage(event) {
        const file = event.target.files && event.target.files[0];
        if (!file) return;
        const message = document.getElementById('pdUploadStatus');
        message.textContent = 'Subiendo imagen…';
        const body = new FormData();
        body.append('imagen', file);
        try {
            const response = await fetch('../subir_imagen.php', {
                method: 'POST',
                credentials: 'include',
                headers: { 'X-CSRF-Token': csrf },
                body
            });
            const result = await response.json();
            if (!response.ok || !result.ok) throw new Error(result.error || 'No se pudo subir la imagen.');
            document.getElementById('pdImage').value = result.url;
            document.getElementById('pdPreview').src = result.url;
            message.textContent = 'Imagen subida correctamente.';
        } catch (error) {
            message.textContent = error.message;
            showStatus(error.message, true);
        }
    }

    async function save(event, original) {
        event.preventDefault();
        const button = document.getElementById('pdSave');
        button.disabled = true;
        showStatus('Guardando destino…');
        const value = (id) => document.getElementById(id).value.trim();
        const record = {
            key: value('pdKey'),
            img: value('pdImage'),
            alt: value('pdAlt'),
            badge: value('pdBadge'),
            titulo: value('pdTitle'),
            desc: value('pdDesc'),
            orden: Number(value('pdOrder')) || 0,
            publicado: document.getElementById('pdPublished').checked,
            article: {
                video: value('paVideo'),
                badge: value('paBadge'),
                titulo: value('paTitle') || value('pdTitle'),
                subtitulo: value('paSubtitle'),
                datos: parseLines(value('paFacts'), 'label', 'val'),
                intro: value('paIntro'),
                secciones: parseLines(value('paSections'), 'titulo', 'texto'),
                ctaTexto: value('paCta')
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
            else destinos[index] = result.data;
            destinos.sort((a, b) => a.orden - b.orden || a.titulo.localeCompare(b.titulo));
            render();
            editor.hidden = true;
            showStatus('Destino guardado. La portada pública ya mostrará los cambios.');
        } catch (error) {
            showStatus(error.message, true);
        } finally {
            button.disabled = false;
        }
    }

    async function deleteDestination(key) {
        const item = destinos.find((destination) => destination.key === key);
        if (!item || !window.confirm(`¿Eliminar “${item.titulo}” y su artículo asociado? Esta acción no se puede deshacer.`)) return;
        try {
            await request(API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
                body: JSON.stringify({ action: 'delete', key })
            });
            destinos = destinos.filter((destination) => destination.key !== key);
            render();
            showStatus('Destino eliminado de la portada.');
        } catch (error) {
            showStatus(error.message, true);
        }
    }

    newButton.addEventListener('click', () => openEditor(blankDestination()));
    list.addEventListener('click', (event) => {
        const editButton = event.target.closest('[data-edit]');
        const deleteButton = event.target.closest('[data-delete]');
        if (editButton) {
            const item = destinos.find((destination) => destination.key === editButton.dataset.edit);
            if (item) openEditor(item);
        }
        if (deleteButton) deleteDestination(deleteButton.dataset.delete);
    });

    cargar();
})();