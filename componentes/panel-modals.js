(function () {
    "use strict";

    function getOverlay(target) {
        var overlay = typeof target === "string" ? document.querySelector(target) : target;
        if (!(overlay instanceof Element)) {
            throw new Error("No se encontró el modal indicado.");
        }
        return overlay;
    }

    function close(overlay) {
        overlay = getOverlay(overlay);
        if (overlay.contains(document.activeElement) && document.activeElement.blur) {
            document.activeElement.blur();
        }
        overlay.classList.remove("vm-visible");
        overlay.setAttribute("aria-hidden", "true");
    }

    function closeAll() {
        document.querySelectorAll(".vm-overlay.vm-visible").forEach(close);
    }

    function open(overlay) {
        closeAll();
        overlay = getOverlay(overlay);
        overlay.classList.add("vm-visible");
        overlay.removeAttribute("aria-hidden");
    }

    function bindClose(overlaySelector, buttonSelectors, subject) {
        var overlay = getOverlay(overlaySelector);
        buttonSelectors.forEach(function (selector) {
            var button = document.querySelector(selector);
            if (!button) throw new Error("No se encontró el botón para cerrar el modal: " + selector);
            button.addEventListener("click", function () {
                close(overlay);
                window.TEUI.notifyClosed(subject || "Detalle");
            });
        });
    }

    function bindDiscardClose(overlaySelector, buttonSelectors, onClose) {
        var overlay = getOverlay(overlaySelector);
        var form = overlay.querySelector(".vm-box");
        if (!form) throw new Error("El modal no contiene el formulario de edición.");

        buttonSelectors.forEach(function (selector) {
            var button = document.querySelector(selector);
            if (!button) throw new Error("No se encontró el botón para salir del modal: " + selector);
            button.addEventListener("click", async function () {
                if (await window.TEUI.confirmDiscard(form)) {
                    onClose();
                    window.TEUI.notifyClosed("Formulario");
                }
            });
        });
    }

    window.TEPanelModals = { open: open, close: close, closeAll: closeAll, bindClose: bindClose, bindDiscardClose: bindDiscardClose };
})();
