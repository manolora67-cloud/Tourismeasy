const temaGlobalAdminUrl = new URL("../login/tema_global_admin.php", document.currentScript.src);

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("formTemaGlobal");
    const estado = document.getElementById("estadoTemaGlobal");
    const botonGuardar = document.getElementById("btnGuardarTemaGlobal");
    if (!form || !estado || !botonGuardar) return;

    const defaults = {
        primary: "#7c3aed",
        primaryLight: "#a855f7",
        primaryDark: "#5b21b6",
        accent: "#f59e0b"
    };
    const inputs = Object.fromEntries(
        Object.keys(defaults).map(function (key) {
            return [key, document.getElementById("tema-" + key)];
        })
    );
    let csrfToken = "";

    function aplicarTema(tema, destino) {
        const prefijos = {
            primary: "--theme-primary",
            primaryLight: "--theme-primary-light",
            primaryDark: "--theme-primary-dark",
            accent: "--theme-accent"
        };
        Object.keys(prefijos).forEach(function (key) {
            destino.style.setProperty(prefijos[key], tema[key]);
        });
    }

    function leerTema() {
        return Object.fromEntries(
            Object.keys(inputs).map(function (key) {
                return [key, inputs[key].value];
            })
        );
    }

    function mostrarEstado(mensaje, error) {
        estado.textContent = mensaje;
        estado.classList.toggle("tema-global__status--error", Boolean(error));
    }

    Object.values(inputs).forEach(function (input) {
        input.addEventListener("input", function () {
            aplicarTema(leerTema(), form);
        });
    });

    form.addEventListener("reset", function () {
        window.setTimeout(function () {
            aplicarTema(leerTema(), form);
        });
        mostrarEstado("Valores predeterminados listos; guarda para aplicarlos al sitio.", false);
    });

    botonGuardar.disabled = true;
    fetch(temaGlobalAdminUrl, { credentials: "same-origin", cache: "no-store" })
        .then(function (response) {
            if (!response.ok) throw new Error("HTTP " + response.status);
            return response.json();
        })
        .then(function (data) {
            if (!data.ok || !data.tema || !data.csrf) {
                throw new Error(data.error || "La respuesta de la paleta no es válida.");
            }
            csrfToken = data.csrf;
            Object.keys(inputs).forEach(function (key) {
                inputs[key].value = data.tema[key];
            });
            aplicarTema(data.tema, form);
            botonGuardar.disabled = false;
        })
        .catch(function (error) {
            console.error("No se pudo cargar la paleta global:", error);
            mostrarEstado("No se pudo cargar la paleta. Recarga la página o inténtalo más tarde.", true);
        });

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        if (!csrfToken) {
            mostrarEstado("No se puede guardar hasta que cargue la configuración.", true);
            return;
        }

        botonGuardar.disabled = true;
        mostrarEstado("Guardando la paleta…", false);
        fetch(temaGlobalAdminUrl, {
            method: "POST",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": csrfToken
            },
            body: JSON.stringify({ tema: leerTema() })
        })
            .then(function (response) {
                return response.json().then(function (data) {
                    if (!response.ok || !data.ok) {
                        throw new Error(data.error || "No se pudo guardar la paleta.");
                    }
                    return data;
                });
            })
            .then(function (data) {
                Object.keys(inputs).forEach(function (key) {
                    inputs[key].value = data.tema[key];
                });
                aplicarTema(data.tema, document.documentElement);
                aplicarTema(data.tema, form);
                mostrarEstado("Paleta global guardada. Ya se aplicó en este sitio.", false);
                window.TEUI.toast("Paleta global actualizada correctamente.");
            })
            .catch(function (error) {
                console.error("No se pudo guardar la paleta global:", error);
                mostrarEstado(error.message || "No se pudo guardar la paleta global.", true);
                window.TEUI.toast(error.message || "No se pudo guardar la paleta global.", "error");
            })
            .finally(function () {
                botonGuardar.disabled = false;
            });
    });
});
