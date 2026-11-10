(function () {
    "use strict";

    function inicializarVideoPrincipal() {
        const video = document.getElementById("miVideo");
        if (!video) return;

        const source = video.querySelector("source[data-src]");
        const button = video.parentElement.querySelector("[data-sound-toggle]");
        const hero = video.closest(".hero");
        const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        let visible = false;
        let sourceLoaded = false;
        let videoFailed = false;
        let hasFrame = false;

        function usarPoster() {
            const preferenciaPoster = motionPreference.matches || Boolean(connection && (
                connection.saveData || connection.effectiveType === "slow-2g" || connection.effectiveType === "2g"
            ));
            const formatoCompatible = source && video.canPlayType(source.type) !== "";
            return preferenciaPoster || videoFailed || !formatoCompatible;
        }

        function sincronizarReproduccion() {
            const posterOnly = usarPoster();
            if (button) button.hidden = posterOnly || !hasFrame;
            if (hero) hero.classList.toggle("hero-poster", posterOnly);
            if (posterOnly || !visible || document.hidden) {
                video.pause();
                return;
            }

            cargarFuente();
            video.play().catch(function (error) {
                console.warn("[TourismEasy] No se pudo reproducir el video principal:", error);
            });
        }

        function cargarFuente() {
            if (source && !sourceLoaded) {
                source.src = source.dataset.src;
                sourceLoaded = true;
                video.load();
            }
        }

        video.addEventListener("loadeddata", function () {
            hasFrame = true;
            video.classList.add("is-ready");
            video.classList.remove("is-poster");
            sincronizarReproduccion();
        });
        video.addEventListener("error", function () {
            videoFailed = true;
            sincronizarReproduccion();
        });

        sincronizarReproduccion();

        if ("IntersectionObserver" in window) {
            const observer = new IntersectionObserver(function (entries) {
                visible = entries.some(function (entry) {
                    return entry.isIntersecting && entry.intersectionRatio >= 0.15;
                });
                sincronizarReproduccion();
            }, { threshold: [0, 0.15] });
            observer.observe(video);
        } else {
            visible = true;
        }

        document.addEventListener("visibilitychange", sincronizarReproduccion);
        motionPreference.addEventListener("change", sincronizarReproduccion);
        if (connection && connection.addEventListener) {
            connection.addEventListener("change", sincronizarReproduccion);
        }
        sincronizarReproduccion();
    }

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

    inicializarVideoPrincipal();

    window.TEVideoSound = {
        sync: function (video) {
            const grupo = video && video.closest(".hero, .art-hero");
            const boton = grupo && grupo.querySelector("[data-sound-toggle]");
            actualizarBoton(boton, video);
        },
    };
})();
