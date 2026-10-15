(function() {
    const mounts = document.querySelectorAll("[data-component='btn-acceder']");
    if (!mounts.length) return;

    mounts.forEach((mount, i) => {
        const context = mount.dataset.context || "root";
        const pagesBase = context === "subpage" ? "" : "html/";
        const loginHref = `${pagesBase}login.html`;
        const id = mount.id || `btnAcceder-${i}`;

        mount.outerHTML = `<a href="${loginHref}" class="btn-acceder" id="${id}">Acceso empresas y administración</a>`;
    });

    // Si ya hay sesión, reemplazamos el texto en todos los botones montados
})();