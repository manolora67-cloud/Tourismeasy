(function () {
    try {
        const storedSession = localStorage.getItem("te_session") || sessionStorage.getItem("te_session");
        const session = JSON.parse(storedSession || "null");
        if (session && ["admin", "empresa"].includes(session.tipo)) {
            localStorage.setItem("te_session", JSON.stringify(session));
            sessionStorage.removeItem("te_session");
            const panel = session.tipo === "admin"
                ? "panel_admin.html"
                : ({
                    transporte: "panel_transporte.html",
                    hospedaje: "panel_hospedaje.html",
                    planes: "panel_planes.html"
                }[String(session.tipoServicio || "").toLowerCase()] || "panel_transporte.html");
            window.location.replace(panel);
            return;
        }
    } catch (error) {
        sessionStorage.removeItem("te_session");
        localStorage.removeItem("te_session");
    }

    const darkBtn = document.getElementById("darkModeToggle");
    const icon = darkBtn ? darkBtn.querySelector("i") : null;
    const saved = localStorage.getItem("theme");
    const dark = saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.body.classList.toggle("dark-mode", dark);
    if (icon) icon.className = dark ? "fa-solid fa-sun" : "fa-solid fa-moon";
    if (darkBtn) {
        darkBtn.addEventListener("click", function () {
            const enabled = !document.body.classList.contains("dark-mode");
            document.body.classList.toggle("dark-mode", enabled);
            localStorage.setItem("theme", enabled ? "dark" : "light");
            if (icon) icon.className = enabled ? "fa-solid fa-sun" : "fa-solid fa-moon";
        });
    }

    const forms = Array.from(document.querySelectorAll("#formLogin, #formRegister"));
    const initialFormValues = new Map(forms.map((form) => [form, getFormValues(form)]));

    function getFormValues(form) {
        return Array.from(form.querySelectorAll("input, select, textarea"))
            .filter((field) => !field.disabled && !["button", "submit", "reset"].includes(field.type))
            .map((field) => {
                if (field.type === "checkbox" || field.type === "radio") {
                    return [field.name || field.id, field.type, field.value, field.checked];
                }
                if (field.type === "file") {
                    return [field.name || field.id, Array.from(field.files || []).map((file) => [
                        file.name,
                        file.size,
                        file.lastModified
                    ])];
                }
                if (field.tagName === "SELECT" && field.multiple) {
                    return [field.name || field.id, Array.from(field.selectedOptions).map((option) => option.value)];
                }
                return [field.name || field.id, field.value];
            });
    }

    function hasUnsavedChanges() {
        return forms.some((form) =>
            JSON.stringify(getFormValues(form)) !== JSON.stringify(initialFormValues.get(form))
        );
    }

    window.addEventListener("beforeunload", function (event) {
        if (!window._loginSuccess && hasUnsavedChanges()) {
            event.preventDefault();
            event.returnValue = "";
        }
    });

    const back = document.querySelector(".btn-back-home");
    if (back) {
        back.addEventListener("click", async function (event) {
            event.preventDefault();
            if (!hasUnsavedChanges() || await window.TEUI.confirm({
                title: "Salir del formulario",
                message: "Perderás el progreso que no hayas guardado.",
                confirmText: "Salir sin guardar",
                tone: "primary",
                icon: "fa-arrow-right-from-bracket"
            })) {
                window._loginSuccess = true;
                window.location.href = "../index.html";
            }
        });
    }
})();
