(function () {
    "use strict";

    const darkButton = document.getElementById("darkModeToggle");
    const darkIcon = darkButton ? darkButton.querySelector("i") : null;
    if (darkButton && darkIcon) {
        const savedTheme = localStorage.getItem("theme");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

        function applyTheme(dark) {
            document.body.classList.toggle("dark-mode", dark);
            darkIcon.className = dark ? "fa-solid fa-sun" : "fa-solid fa-moon";
            localStorage.setItem("theme", dark ? "dark" : "light");
        }

        applyTheme(savedTheme ? savedTheme === "dark" : prefersDark);
        darkButton.addEventListener("click", function () {
            applyTheme(!document.body.classList.contains("dark-mode"));
        });
    }

    const requestForm = document.getElementById("formSolicitud");
    if (requestForm) {
        const parameters = new URLSearchParams(window.location.search);
        const emailInput = document.getElementById("email");
        const recoveryOrigin = parameters.get("origen") === "ecommerce" ? "ecommerce" : "general";
        const loginLink = document.getElementById("linkVolverLogin");
        loginLink.href = recoveryOrigin === "ecommerce" ? "login_ecommerce.html" : "login.html";

        const emailFromLogin = parameters.get("email");
        const emailFromSession = sessionStorage.getItem("te_recovery_email");
        if (emailFromSession) sessionStorage.removeItem("te_recovery_email");
        emailInput.value = emailFromLogin || emailFromSession || "";

        requestForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            if (!requestForm.reportValidity()) return;

            const button = document.getElementById("btnEnviar");
            const message = document.getElementById("mensaje");
            const messageText = document.getElementById("mensajeTexto");
            button.classList.add("loading");
            button.disabled = true;
            message.className = "rec-mensaje";

            try {
                const response = await fetch("../recuperacion/solicitar_recuperacion.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: emailInput.value.trim(),
                        origen: recoveryOrigin
                    })
                });
                const result = await response.json();
                if (!response.ok || !result.success) {
                    throw new Error(result.message || "No se pudo solicitar la recuperación.");
                }

                messageText.textContent = result.message;
                message.querySelector("i").className = "fa-solid fa-circle-check";
                message.classList.add("show", "ok");
            } catch (error) {
                messageText.textContent = error.message || "Error de conexión. Intenta de nuevo.";
                message.querySelector("i").className = "fa-solid fa-circle-exclamation";
                message.classList.add("show", "error");
            } finally {
                button.classList.remove("loading");
                button.disabled = false;
            }
        });
    }

    const resetForm = document.getElementById("formRestablecer");
    if (!resetForm) return;

    const parameters = new URLSearchParams(window.location.search);
    const token = parameters.get("token");
    const loginHref = parameters.get("origen") === "ecommerce" ? "login_ecommerce.html" : "login.html";
    document.getElementById("linkVolverLogin").href = loginHref;

    document.getElementById("togglePass").addEventListener("click", function () {
        const passwordInput = document.getElementById("password");
        const icon = this.querySelector("i");
        const isHidden = passwordInput.type === "password";
        passwordInput.type = isHidden ? "text" : "password";
        icon.className = isHidden ? "fa-solid fa-eye-slash" : "fa-solid fa-eye";
    });

    const passwordInput = document.getElementById("password");
    const strengthBars = ["bar1", "bar2", "bar3", "bar4"].map(function (id) {
        return document.getElementById(id);
    });
    const strengthLabel = document.getElementById("strengthLabel");
    const strengthLevels = [
        { label: "", cls: "" },
        { label: "Débil", cls: "weak" },
        { label: "Regular", cls: "fair" },
        { label: "Buena", cls: "good" },
        { label: "Fuerte", cls: "strong" }
    ];

    passwordInput.addEventListener("input", function () {
        const value = this.value;
        let score = 0;
        if (value.length >= 8) score++;
        if (/[A-Z]/.test(value)) score++;
        if (/[0-9]/.test(value)) score++;
        if (/[^A-Za-z0-9]/.test(value)) score++;

        strengthBars.forEach(function (bar, index) {
            bar.className = "pass-strength-bar";
            if (index < score) bar.classList.add(strengthLevels[score].cls);
        });
        strengthLabel.textContent = score > 0 ? strengthLevels[score].label : "";
    });

    resetForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        if (!resetForm.reportValidity()) return;

        const button = document.getElementById("btnActualizar");
        const message = document.getElementById("mensaje");
        const messageText = document.getElementById("mensajeTexto");

        if (!token) {
            messageText.textContent = "Token inválido o ausente. Solicita un nuevo enlace.";
            message.querySelector("i").className = "fa-solid fa-circle-exclamation";
            message.classList.add("show", "error");
            return;
        }

        button.classList.add("loading");
        button.disabled = true;
        message.className = "rec-mensaje";

        try {
            const response = await fetch("../recuperacion/restablecer_contrasena.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: token, password: passwordInput.value })
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || "No se pudo actualizar la contraseña.");
            }

            messageText.textContent = result.message;
            message.querySelector("i").className = "fa-solid fa-circle-check";
            message.classList.add("show", "ok");
            button.disabled = true;
            setTimeout(function () {
                window.location.href = loginHref;
            }, 2500);
        } catch (error) {
            messageText.textContent = error.message || "Error de conexión. Intenta de nuevo.";
            message.querySelector("i").className = "fa-solid fa-circle-exclamation";
            message.classList.add("show", "error");
        } finally {
            if (!message.classList.contains("ok")) {
                button.classList.remove("loading");
                button.disabled = false;
            }
        }
    });
})();
