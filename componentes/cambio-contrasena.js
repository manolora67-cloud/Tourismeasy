(function () {
    var gatillos = document.querySelectorAll("[data-password-change]");
    if (!gatillos.length) return;

    var modal = document.createElement("div");
    modal.className = "te-password-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "tePasswordTitle");
    modal.innerHTML = [
        '<div class="te-password-modal__card">',
        '  <button class="te-password-modal__close" type="button" aria-label="Cerrar">',
        '    <i class="fa-solid fa-xmark"></i>',
        '  </button>',
        '  <h2 class="te-password-modal__title" id="tePasswordTitle">',
        '    <i class="fa-solid fa-key"></i> Cambiar contraseña',
        '  </h2>',
        '  <p class="te-password-modal__description">Confirma tu contraseña actual y escribe una nueva de al menos 8 caracteres (máximo 72 bytes). Puedes cambiarla hasta 3 veces por mes.</p>',
        '  <form novalidate>',
        '    <div class="te-password-modal__fields">',
        '      <label class="te-password-modal__field">Contraseña actual',
        '        <input class="te-password-modal__input" name="contrasena_actual" type="password" autocomplete="current-password" required>',
        '      </label>',
        '      <label class="te-password-modal__field">Nueva contraseña',
        '        <input class="te-password-modal__input" name="contrasena_nueva" type="password" autocomplete="new-password" minlength="8" required>',
        '      </label>',
        '      <label class="te-password-modal__field">Confirmar nueva contraseña',
        '        <input class="te-password-modal__input" name="confirmar_contrasena" type="password" autocomplete="new-password" minlength="8" required>',
        '      </label>',
        '    </div>',
        '    <p class="te-password-modal__error" role="alert" hidden></p>',
        '    <div class="te-password-modal__actions">',
        '      <button class="te-password-modal__button" type="button" data-password-cancel>Cancelar</button>',
        '      <button class="te-password-modal__button te-password-modal__button--primary" type="submit">',
        '        <i class="fa-solid fa-check"></i> Actualizar contraseña',
        '      </button>',
        '    </div>',
        '  </form>',
        '</div>'
    ].join("");
    document.body.appendChild(modal);

    var form = modal.querySelector("form");
    var error = modal.querySelector(".te-password-modal__error");
    var saveButton = modal.querySelector('[type="submit"]');
    var closeButton = modal.querySelector(".te-password-modal__close");
    var currentInput = form.elements.contrasena_actual;
    var ultimoGatillo = null;

    function cerrarModal(notify) {
        modal.classList.remove("is-open");
        document.body.style.overflow = "";
        form.reset();
        error.hidden = true;
        error.textContent = "";
        if (notify && window.TEUI && typeof window.TEUI.notifyClosed === "function") {
            window.TEUI.notifyClosed("Formulario");
        }
        if (ultimoGatillo) ultimoGatillo.focus();
    }

    async function solicitarCierre() {
        if (window.TEUI && typeof window.TEUI.confirmDiscard === "function") {
            if (!(await window.TEUI.confirmDiscard(form))) return;
        } else if (form.elements.contrasena_actual.value
            || form.elements.contrasena_nueva.value
            || form.elements.confirmar_contrasena.value) {
            if (!window.confirm("¿Descartar los cambios de contraseña?")) return;
        }
        cerrarModal(true);
    }

    gatillos.forEach(function (gatillo) {
        gatillo.addEventListener("click", function () {
            ultimoGatillo = gatillo;
            form.reset();
            error.hidden = true;
            error.textContent = "";
            if (window.TEUI && typeof window.TEUI.markClean === "function") {
                window.TEUI.markClean(form);
            }
            modal.classList.add("is-open");
            document.body.style.overflow = "hidden";
            currentInput.focus();
        });
    });

    closeButton.addEventListener("click", solicitarCierre);
    modal.querySelector("[data-password-cancel]").addEventListener("click", solicitarCierre);
    modal.addEventListener("click", function (event) {
        if (event.target === modal) solicitarCierre();
    });
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && modal.classList.contains("is-open")) solicitarCierre();
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        var actual = form.elements.contrasena_actual.value;
        var nueva = form.elements.contrasena_nueva.value;
        var confirmar = form.elements.confirmar_contrasena.value;

        if (!actual || !nueva || !confirmar) {
            error.textContent = "Completa la contraseña actual y los dos campos de la nueva contraseña.";
            error.hidden = false;
            return;
        }
        if (Array.from(nueva).length < 8) {
            error.textContent = "La nueva contraseña debe tener al menos 8 caracteres.";
            error.hidden = false;
            return;
        }
        var bytes = typeof TextEncoder === "function"
            ? new TextEncoder().encode(nueva).length
            : unescape(encodeURIComponent(nueva)).length;
        if (bytes > 72) {
            error.textContent = "La nueva contraseña no puede exceder 72 bytes.";
            error.hidden = false;
            return;
        }
        if (nueva !== confirmar) {
            error.textContent = "La confirmación no coincide con la nueva contraseña.";
            error.hidden = false;
            return;
        }

        var endpoint = gatillos[0].getAttribute("data-password-endpoint");
        if (!endpoint) {
            error.textContent = "No se configuró el servicio para cambiar la contraseña.";
            error.hidden = false;
            return;
        }

        saveButton.disabled = true;
        error.hidden = true;
        fetch(endpoint, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contrasena_actual: actual,
                contrasena_nueva: nueva
            })
        })
            .then(function (response) {
                return response.json().then(function (data) {
                    if (!response.ok || !data.ok) {
                        throw new Error(data.error || "No se pudo actualizar la contraseña.");
                    }
                    return data;
                });
            })
            .then(function (data) {
                if (window.TEUI && typeof window.TEUI.toast === "function") {
                    var mensaje = data.mensaje || "Contraseña actualizada correctamente.";
                    if (Number.isInteger(data.cambios_restantes)) {
                        mensaje += " Te quedan " + data.cambios_restantes
                            + (data.cambios_restantes === 1 ? " cambio este mes." : " cambios este mes.");
                    }
                    window.TEUI.toast(mensaje);
                }
                cerrarModal(false);
            })
            .catch(function (err) {
                error.textContent = err.message || "No se pudo actualizar la contraseña.";
                error.hidden = false;
            })
            .finally(function () {
                saveButton.disabled = false;
            });
    });
})();
