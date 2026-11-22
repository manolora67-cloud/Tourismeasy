(function () {
    "use strict";

    var formulario = document.getElementById("formLimiteEdicionPerfil");
    if (!formulario) return;

    var endpoint = "../admin/limite_edicion_perfil.php";
    var entrada = document.getElementById("limiteEdicionPerfilEmpresa");
    var boton = document.getElementById("btnGuardarLimiteEdicionPerfil");
    var estadoCarga = document.getElementById("estadoCargaLimiteEdicionPerfil");
    var estadoFormulario = document.getElementById("estadoLimiteEdicionPerfil");
    var fechaActualizacion = document.getElementById("fechaLimiteEdicionPerfil");
    var csrf = "";

    function mostrarFecha(fecha) {
        if (!fecha) return "Configuración inicial";
        var date = new Date(fecha);
        return Number.isNaN(date.getTime())
            ? "Configuración actualizada"
            : "Última actualización: " + date.toLocaleString();
    }

    function mostrarError(error) {
        estadoCarga.textContent = error.message || "No se pudo cargar el límite.";
        estadoCarga.setAttribute("role", "alert");
    }

    async function cargarLimite() {
        try {
            var response = await fetch(endpoint, { credentials: "same-origin", cache: "no-store" });
            var result = await response.json();
            if (!response.ok || !result.ok || !result.data) {
                throw new Error(result.error || "No se pudo cargar el límite de edición.");
            }

            csrf = result.csrf;
            entrada.value = String(result.data.limite_mensual);
            fechaActualizacion.textContent = mostrarFecha(result.data.fecha_actualizacion);
            formulario.hidden = false;
            estadoCarga.hidden = true;
        } catch (error) {
            mostrarError(error);
        }
    }

    formulario.addEventListener("submit", async function (event) {
        event.preventDefault();
        if (!formulario.reportValidity()) return;

        var limite = Number(entrada.value);
        if (!Number.isInteger(limite) || limite < 1 || limite > 10) {
            estadoFormulario.textContent = "Elige un número entero entre 1 y 10.";
            estadoFormulario.dataset.estado = "error";
            return;
        }

        boton.disabled = true;
        estadoFormulario.textContent = "Guardando…";
        estadoFormulario.dataset.estado = "";
        try {
            var response = await fetch(endpoint, {
                method: "POST",
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": csrf
                },
                body: JSON.stringify({ limite_mensual: limite })
            });
            var result = await response.json();
            if (!response.ok || !result.ok || !result.data) {
                throw new Error(result.error || "No se pudo guardar el límite.");
            }

            entrada.value = String(result.data.limite_mensual);
            fechaActualizacion.textContent = mostrarFecha(result.data.fecha_actualizacion);
            estadoFormulario.textContent = result.data.actualizado === false
                ? "El límite ya tenía ese valor; no hubo cambios."
                : "Límite guardado y registrado en Auditoría.";
            estadoFormulario.dataset.estado = "ok";
        } catch (error) {
            estadoFormulario.textContent = error.message || "No se pudo guardar el límite.";
            estadoFormulario.dataset.estado = "error";
        } finally {
            boton.disabled = false;
        }
    });

    cargarLimite();
})();
