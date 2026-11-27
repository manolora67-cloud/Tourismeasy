(() => {
    const municipality = new URLSearchParams(window.location.search).get("municipio");
    const title = document.getElementById("panoramaTitle");
    const backLink = document.getElementById("backToMetaverso");

    if (municipality) {
        title.textContent = `Panorama de prueba · ${municipality}`;
        document.title = `Prueba 360° · ${municipality} - TourismEasy`;
    }

    backLink.addEventListener("click", (event) => {
        try {
            if (window.sessionStorage.getItem("tourismeasy.metaverso-return-state")) {
                event.preventDefault();
                window.history.back();
            }
        } catch (error) {
            console.error("No se pudo comprobar el estado de regreso al metaverso.", error);
        }
    });
})();
