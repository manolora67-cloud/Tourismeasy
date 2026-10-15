(function() {
    const mounts = document.querySelectorAll("[data-component='btn-acceder']");
    if (!mounts.length) return;

    mounts.forEach((mount, i) => {
        const context = mount.dataset.context || "root";
        const pagesBase = context === "subpage" ? "" : "html/";
        const loginHref = `${pagesBase}login.html`;
        const id = mount.id || `btnAcceder-${i}`;

        mount.outerHTML = `<a href="${loginHref}" class="btn-acceder" id="${id}">Acceder</a>`;
    });

    // Si ya hay sesión, reemplazamos el texto en todos los botones montados
    const sesion = localStorage.getItem("sesion_viajero");
    if (!sesion) return;

    try {
        const datos = JSON.parse(sesion);
        document.querySelectorAll(".btn-acceder").forEach((btn) => {
            btn.textContent = datos.nombre;
            btn.classList.add("session-name");
        });
    } catch (e) {
        /* si el JSON está corrupto, dejamos el botón por defecto */
    }
})();