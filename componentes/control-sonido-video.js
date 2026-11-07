(function () {
    "use strict";

    function actualizarBoton(boton, video) {
        if (!boton || !video) return;
        const silenciado = video.muted;
        boton.textContent = silenciado
            ? boton.dataset.soundMutedLabel
            : boton.dataset.soundActiveLabel;
        boton.setAttribute(
            "aria-label",
            silenciado ? boton.dataset.soundMutedAria : boton.dataset.soundActiveAria
        );
        boton.setAttribute("aria-pressed", String(!silenciado));
    }

    function obtenerVideo(boton) {
        const grupo = boton.closest(".hero, .art-hero");
        return grupo && grupo.querySelector("video");
    }

    document.addEventListener("click", function (event) {
        const boton = event.target.closest("[data-sound-toggle]");
        if (!boton) return;

        const video = obtenerVideo(boton);
        if (!video) return;

        video.muted = !video.muted;
        actualizarBoton(boton, video);
    });

    window.TEVideoSound = {
        sync: function (video) {
            const grupo = video && video.closest(".hero, .art-hero");
            const boton = grupo && grupo.querySelector("[data-sound-toggle]");
            actualizarBoton(boton, video);
        },
    };
})();
