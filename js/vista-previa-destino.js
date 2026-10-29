(() => {
    const mount = document.getElementById('destinoPreview');
    if (!mount) return;

    const escapeHtml = (value) => String(value == null ? '' : value).replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[char]));

    function renderPreview(data) {
        const destination = data && data.destination;
        const article = data && data.article;
        if (!destination || !article || typeof destination.key !== 'string') {
            mount.innerHTML = '<p class="destinos-error" role="alert">No se pudo cargar la vista previa de este destino.</p>';
            return;
        }

        const facts = Array.isArray(article.datos) ? article.datos : [];
        const sections = Array.isArray(article.secciones) ? article.secciones : [];
        mount.innerHTML = `
            <div class="art-overlay open" role="dialog" aria-modal="true" aria-label="Vista previa de ${escapeHtml(article.titulo || destination.titulo)}">
                <article class="art-modal">
                    <div class="art-hero">
                        <img class="art-preview-poster" src="${escapeHtml(article.poster || destination.img)}" alt="${escapeHtml(destination.alt || destination.titulo)}">
                        <div class="art-hero-overlay">
                            ${article.badge ? `<span class="art-badge">${escapeHtml(article.badge)}</span>` : ''}
                            <h1 class="art-titulo">${escapeHtml(article.titulo || destination.titulo)}</h1>
                            ${article.subtitulo ? `<p class="art-subtitulo">${escapeHtml(article.subtitulo)}</p>` : ''}
                        </div>
                    </div>
                    <div class="art-body">
                        ${facts.length ? `<div class="art-datos-rapidos">${facts.map((fact) => `
                            <div class="art-dato">
                                <span class="art-dato-label">${escapeHtml(fact.label)}</span>
                                <span class="art-dato-val">${escapeHtml(fact.val)}</span>
                            </div>`).join('')}</div>` : ''}
                        ${article.intro ? `<p class="art-intro">${escapeHtml(article.intro)}</p>` : ''}
                        ${sections.map((section) => `
                            <div class="art-seccion">
                                <h2 class="art-seccion-titulo">${escapeHtml(section.titulo)}</h2>
                                <p>${escapeHtml(section.texto)}</p>
                            </div>`).join('')}
                        ${article.ctaTexto ? `<div class="art-cta"><p>${escapeHtml(article.ctaTexto)}</p></div>` : ''}
                    </div>
                </article>
            </div>`;
    }

    window.addEventListener('message', (event) => {
        if (event.source !== window.parent || event.origin !== window.location.origin) return;
        if (!event.data || event.data.type !== 'tourismeasy:preview-destino') return;
        renderPreview(event.data.destination);
    });
})();
