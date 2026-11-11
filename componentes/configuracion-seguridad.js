(function () {
    "use strict";

    var contenedor = document.getElementById("securitySettingsList");
    if (!contenedor) return;

    var endpoint = "../admin/seguridad.php";
    var csrf = "";
    var etiquetas = {
        login: {
            titulo: "Inicio de sesión",
            descripcion: "Fallos de autenticación por correo, compartidos entre admin, empresa y artesano."
        },
        password_change: {
            titulo: "Comprobación de contraseña actual",
            descripcion: "Fallos al cambiar la contraseña. Es un contador separado del inicio de sesión."
        },
        recovery_request: {
            titulo: "Solicitudes de recuperación",
            descripcion: "Solicitudes de enlace por correo. Se cuentan todas, exista o no una cuenta con ese correo."
        },
        recovery_link: {
            titulo: "Validación de enlace de recuperación",
            descripcion: "Enlaces inválidos por dirección IP. Los enlaces válidos usan un token aleatorio de un solo uso."
        },
        device_request: {
            titulo: "Confirmación de dispositivo nuevo",
            descripcion: "Solicitudes de aprobación de dispositivo por cuenta."
        },
        device_code: {
            titulo: "Código de dispositivo",
            descripcion: "Códigos incorrectos para una solicitud de dispositivo aprobada."
        }
    };

    function crearCampo(etiqueta, nombre, valor, minimo, maximo, unidad) {
        var grupo = document.createElement("label");
        grupo.className = "security-settings__field";
        var texto = document.createElement("span");
        texto.textContent = etiqueta + " (" + unidad + ")";
        var entrada = document.createElement("input");
        entrada.type = "number";
        entrada.name = nombre;
        entrada.min = String(minimo);
        entrada.max = String(maximo);
        entrada.step = "1";
        entrada.required = true;
        entrada.value = valor == null ? "" : String(valor);
        grupo.append(texto, entrada);
        return grupo;
    }

    function crearControl(control) {
        var meta = etiquetas[control.control];
        if (!meta) return null;

        var articulo = document.createElement("article");
        articulo.className = "security-settings__control";
        articulo.dataset.control = control.control;

        var encabezado = document.createElement("div");
        encabezado.className = "security-settings__heading";
        var titulo = document.createElement("h4");
        titulo.textContent = meta.titulo;
        var descripcion = document.createElement("p");
        descripcion.textContent = meta.descripcion;
        encabezado.append(titulo, descripcion);

        var formulario = document.createElement("form");
        formulario.className = "security-settings__form";
        formulario.append(
            crearCampo(
                "Cantidad de intentos",
                "max_intentos",
                control.max_intentos,
                1,
                control.control === "device_code" ? 5 : 10,
                "fallos o solicitudes"
            ),
            crearCampo("Ventana de conteo", "ventana_minutos", control.ventana_minutos, 1, 1440, "minutos"),
            crearCampo("Duración del bloqueo", "duracion_bloqueo_minutos", control.duracion_bloqueo_minutos, 1, 10080, "minutos")
        );
        if (control.control === "password_change") {
            formulario.append(
                crearCampo("Cambios exitosos permitidos", "limite_mensual", control.limite_mensual, 1, 10, "por mes calendario")
            );
            var nota = document.createElement("p");
            nota.className = "security-settings__note";
            nota.textContent = "Los restablecimientos mediante enlace de correo no cuentan en este límite.";
            formulario.appendChild(nota);
        }

        var acciones = document.createElement("div");
        acciones.className = "security-settings__actions";
        var guardar = document.createElement("button");
        guardar.type = "submit";
        guardar.className = "pu-btn-primary";
        guardar.textContent = "Guardar límites";
        var estado = document.createElement("p");
        estado.className = "security-settings__status";
        estado.setAttribute("role", "status");
        estado.setAttribute("aria-live", "polite");
        acciones.append(guardar, estado);
        formulario.appendChild(acciones);
        formulario.addEventListener("submit", function (event) {
            event.preventDefault();
            guardarControl(articulo, formulario, guardar, estado);
        });

        var actualizado = document.createElement("small");
        actualizado.className = "security-settings__updated";
        actualizado.textContent = control.fecha_actualizacion
            ? "Última actualización: " + new Date(control.fecha_actualizacion).toLocaleString()
            : "Configuración inicial";
        articulo.append(encabezado, formulario, actualizado);
        return articulo;
    }

    function valoresFormulario(formulario) {
        var datos = new FormData(formulario);
        var salida = {};
        ["max_intentos", "ventana_minutos", "duracion_bloqueo_minutos", "limite_mensual"].forEach(function (campo) {
            var valor = datos.get(campo);
            if (valor !== null) salida[campo] = Number(valor);
        });
        return salida;
    }

    async function guardarControl(articulo, formulario, boton, estado) {
        if (!formulario.reportValidity()) return;

        var valores = valoresFormulario(formulario);
        if (Object.keys(valores).some(function (campo) {
            return !Number.isInteger(valores[campo]);
        })) {
            estado.textContent = "Usa números enteros válidos para cada límite.";
            estado.dataset.estado = "error";
            return;
        }

        boton.disabled = true;
        estado.textContent = "Guardando…";
        estado.dataset.estado = "";
        try {
            var respuesta = await fetch(endpoint, {
                method: "POST",
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": csrf
                },
                body: JSON.stringify(Object.assign({ control: articulo.dataset.control }, valores))
            });
            var resultado = await respuesta.json();
            if (!respuesta.ok || !resultado.ok) {
                throw new Error(resultado.error || "No se pudieron guardar los límites.");
            }

            var actualizado = articulo.querySelector(".security-settings__updated");
            actualizado.textContent = "Última actualización: "
                + new Date(resultado.data.fecha_actualizacion).toLocaleString();
            estado.textContent = "Límites guardados y registrados en Auditoría.";
            estado.dataset.estado = "ok";
        } catch (error) {
            estado.textContent = error.message || "No se pudieron guardar los límites.";
            estado.dataset.estado = "error";
        } finally {
            boton.disabled = false;
        }
    }

    async function cargarControles() {
        try {
            var respuesta = await fetch(endpoint, { credentials: "same-origin", cache: "no-store" });
            var resultado = await respuesta.json();
            if (!respuesta.ok || !resultado.ok || !Array.isArray(resultado.data)) {
                throw new Error(resultado.error || "No se pudieron cargar los controles de seguridad.");
            }
            csrf = resultado.csrf;
            contenedor.replaceChildren();
            resultado.data.forEach(function (control) {
                var articulo = crearControl(control);
                if (articulo) contenedor.appendChild(articulo);
            });
            if (!contenedor.childElementCount) {
                throw new Error("No hay controles de seguridad configurados en la base de datos.");
            }
        } catch (error) {
            contenedor.textContent = error.message || "No se pudieron cargar los controles de seguridad.";
            contenedor.setAttribute("role", "alert");
        }
    }

    cargarControles();
})();
