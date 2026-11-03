(function () {
    "use strict";

    function paraMostrar(urlOriginal, ancho) {
        const valor = String(urlOriginal || "").trim();
        if (!valor) return "";

        try {
            const url = new URL(valor, window.location.href);
            if (
                !/(^|\.)cloudinary\.com$/i.test(url.hostname)
                || !url.pathname.includes("/image/upload/")
            ) {
                return valor;
            }

            const partes = url.pathname.split("/image/upload/");
            const ruta = partes[1] || "";
            if (/^(?:c_[^/]+,)?(?:w_\d+|f_auto|q_auto)(?:,|\/)/.test(ruta)) {
                return url.href;
            }

            url.pathname = `${partes[0]}/image/upload/c_limit,w_${ancho},q_auto,f_auto/${ruta}`;
            return url.href;
        } catch (error) {
            console.warn("[TourismEasy] No se pudo preparar la URL de imagen:", error);
            return valor;
        }
    }

    window.TEImagenCloudinary = Object.freeze({
        tarjeta: (url) => paraMostrar(url, 640),
        portada: (url) => paraMostrar(url, 1280),
        popup: (url) => paraMostrar(url, 480),
    });
})();
