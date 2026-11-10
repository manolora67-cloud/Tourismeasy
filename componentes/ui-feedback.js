(function () {
    "use strict";

    const formSnapshots = new WeakMap();
    const styles = `
        .te-ui-dialog {
            width: min(92vw, 420px);
            margin: auto;
            padding: 28px;
            border: 0;
            border-radius: 22px;
            color: #1e293b;
            background: #fff;
            box-shadow: 0 24px 80px rgba(15, 23, 42, .3);
            font-family: "Open Sans", sans-serif;
        }
        .te-ui-dialog::backdrop {
            background: rgba(15, 23, 42, .62);
            backdrop-filter: blur(5px);
        }
        .te-ui-dialog__icon {
            display: grid;
            width: 52px;
            height: 52px;
            margin: 0 auto 14px;
            place-items: center;
            border-radius: 50%;
            color: #dc2626;
            background: #fef2f2;
            font-size: 1.25rem;
        }
        .te-ui-dialog__icon--info {
            color: #6d28d9;
            background: #f3e8ff;
        }
        .te-ui-dialog__icon--success {
            color: #15803d;
            background: #dcfce7;
        }
        .te-ui-dialog h2 {
            margin: 0 0 8px;
            color: #1e293b;
            font: 800 1.15rem/1.35 "Montserrat", sans-serif;
            text-align: center;
        }
        .te-ui-dialog p {
            margin: 0 0 22px;
            color: #475569;
            font-size: .94rem;
            line-height: 1.55;
            text-align: center;
            white-space: pre-line;
        }
        .te-ui-dialog__actions {
            display: flex;
            gap: 10px;
        }
        .te-ui-dialog__actions button {
            flex: 1;
            min-height: 44px;
            padding: 10px 14px;
            border: 0;
            border-radius: 999px;
            font: 700 .88rem "Montserrat", sans-serif;
            cursor: pointer;
            transition: transform .18s ease, background .18s ease;
        }
        .te-ui-dialog__cancel {
            color: #334155;
            background: #e2e8f0;
        }
        .te-ui-dialog__cancel:hover { background: #cbd5e1; }
        .te-ui-dialog__confirm {
            color: #fff;
            background: #dc2626;
        }
        .te-ui-dialog__confirm:hover { background: #b91c1c; transform: translateY(-1px); }
        .te-ui-dialog__confirm--primary { background: #7c3aed; }
        .te-ui-dialog__confirm--primary:hover { background: #6d28d9; }
        .te-ui-toast-stack {
            position: fixed;
            z-index: 100001;
            right: max(20px, env(safe-area-inset-right));
            bottom: max(20px, env(safe-area-inset-bottom));
            display: grid;
            gap: 10px;
            width: min(420px, calc(100vw - 40px));
            pointer-events: none;
        }
        .te-ui-toast {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 14px 18px;
            border: 1px solid #bbf7d0;
            border-radius: 14px;
            color: #14532d;
            background: #f0fdf4;
            box-shadow: 0 12px 30px rgba(15, 23, 42, .16);
            font: 600 .9rem/1.45 "Open Sans", sans-serif;
            animation: te-ui-toast-in .22s ease-out;
        }
        .te-ui-toast i { color: #16a34a; font-size: 1.1rem; }
        .te-ui-toast--error { border-color: #fecaca; color: #7f1d1d; background: #fef2f2; }
        .te-ui-toast--error i { color: #dc2626; }
        .te-ui-toast--info { border-color: #ddd6fe; color: #4c1d95; background: #f5f3ff; }
        .te-ui-toast--info i { color: #7c3aed; }
        .te-ui-toast--leaving { opacity: 0; transform: translateY(8px); transition: opacity .2s, transform .2s; }
        body.dark-mode .te-ui-dialog { color: #f1f5f9; background: #1e293b; }
        body.dark-mode .te-ui-dialog h2 { color: #f1f5f9; }
        body.dark-mode .te-ui-dialog p { color: #cbd5e1; }
        body.dark-mode .te-ui-dialog__cancel { color: #f1f5f9; background: #334155; }
        @keyframes te-ui-toast-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 480px) {
            .te-ui-toast-stack { right: 12px; bottom: 12px; width: calc(100vw - 24px); }
        }
    `;

    const styleElement = document.createElement("style");
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);

    function confirm(options) {
        const settings = typeof options === "string" ? { message: options } : options || {};
        const dialog = document.createElement("dialog");
        dialog.className = "te-ui-dialog";
        dialog.setAttribute("aria-labelledby", "te-ui-dialog-title");
        dialog.setAttribute("aria-describedby", "te-ui-dialog-message");

        const icon = document.createElement("div");
        icon.className = `te-ui-dialog__icon${settings.tone === "primary" ? " te-ui-dialog__icon--info" : ""}`;
        icon.setAttribute("aria-hidden", "true");
        icon.innerHTML = `<i class="fa-solid ${settings.icon || (settings.tone === "primary" ? "fa-circle-question" : "fa-triangle-exclamation")}"></i>`;

        const title = document.createElement("h2");
        title.id = "te-ui-dialog-title";
        title.textContent = settings.title || "¿Estás seguro?";

        const message = document.createElement("p");
        message.id = "te-ui-dialog-message";
        message.textContent = settings.message || "Confirma si deseas continuar.";

        const actions = document.createElement("div");
        actions.className = "te-ui-dialog__actions";
        const cancel = document.createElement("button");
        cancel.className = "te-ui-dialog__cancel";
        cancel.type = "button";
        cancel.textContent = settings.cancelText || "Cancelar";
        const accept = document.createElement("button");
        accept.className = `te-ui-dialog__confirm${settings.tone === "primary" ? " te-ui-dialog__confirm--primary" : ""}`;
        accept.type = "button";
        accept.textContent = settings.confirmText || "Sí, continuar";
        actions.append(cancel, accept);
        dialog.append(icon, title, message, actions);
        document.body.appendChild(dialog);

        return new Promise((resolve) => {
            let settled = false;
            const finish = (result) => {
                if (settled) return;
                settled = true;
                dialog.close();
                dialog.remove();
                resolve(result);
            };
            cancel.addEventListener("click", () => finish(false));
            accept.addEventListener("click", () => finish(true));
            dialog.addEventListener("cancel", (event) => {
                event.preventDefault();
                finish(false);
            });
            dialog.addEventListener("click", (event) => {
                if (event.target === dialog) finish(false);
            });
            dialog.showModal();
            cancel.focus();
        });
    }

    function alertDialog(options) {
        const settings = typeof options === "string" ? { message: options } : options || {};
        const dialog = document.createElement("dialog");
        dialog.className = "te-ui-dialog";
        dialog.setAttribute("aria-labelledby", "te-ui-dialog-title");
        dialog.setAttribute("aria-describedby", "te-ui-dialog-message");

        const icon = document.createElement("div");
        const tone = settings.tone === "success" ? "success" : "info";
        icon.className = `te-ui-dialog__icon te-ui-dialog__icon--${tone}`;
        icon.setAttribute("aria-hidden", "true");
        const iconElement = document.createElement("i");
        iconElement.className = `fa-solid ${settings.icon || (tone === "success" ? "fa-circle-check" : "fa-circle-info")}`;
        icon.appendChild(iconElement);

        const title = document.createElement("h2");
        title.id = "te-ui-dialog-title";
        title.textContent = settings.title || "Información";

        const message = document.createElement("p");
        message.id = "te-ui-dialog-message";
        message.textContent = settings.message || "";

        const actions = document.createElement("div");
        actions.className = "te-ui-dialog__actions";
        const accept = document.createElement("button");
        accept.className = "te-ui-dialog__confirm te-ui-dialog__confirm--primary";
        accept.type = "button";
        accept.textContent = settings.confirmText || "Entendido";
        actions.appendChild(accept);
        dialog.append(icon, title, message, actions);
        document.body.appendChild(dialog);

        return new Promise((resolve) => {
            const finish = () => {
                dialog.close();
                dialog.remove();
                resolve();
            };
            accept.addEventListener("click", finish);
            dialog.addEventListener("cancel", (event) => {
                event.preventDefault();
                finish();
            });
            dialog.addEventListener("click", (event) => {
                if (event.target === dialog) finish();
            });
            dialog.showModal();
            accept.focus();
        });
    }

    function toast(message, type) {
        let stack = document.querySelector(".te-ui-toast-stack");
        if (!stack) {
            stack = document.createElement("div");
            stack.className = "te-ui-toast-stack";
            stack.setAttribute("aria-live", "polite");
            stack.setAttribute("aria-atomic", "false");
            document.body.appendChild(stack);
        }

        const kind = ["success", "error", "info"].includes(type) ? type : "success";
        const item = document.createElement("div");
        item.className = `te-ui-toast${kind === "success" ? "" : ` te-ui-toast--${kind}`}`;
        item.setAttribute("role", kind === "error" ? "alert" : "status");
        const icon = document.createElement("i");
        icon.className = `fa-solid ${kind === "error" ? "fa-circle-exclamation" : kind === "info" ? "fa-circle-info" : "fa-circle-check"}`;
        icon.setAttribute("aria-hidden", "true");
        const text = document.createElement("span");
        text.textContent = String(message);
        item.append(icon, text);
        stack.appendChild(item);

        window.setTimeout(() => {
            item.classList.add("te-ui-toast--leaving");
            item.addEventListener("transitionend", () => item.remove(), { once: true });
            window.setTimeout(() => item.remove(), 300);
        }, 3600);
    }

    function notifyClosed(subject) {
        toast((subject || "Ventana") + " cerrada correctamente.");
    }

    function snapshotForm(form) {
        return Array.from(form.querySelectorAll("input, select, textarea"))
            .filter((element) => !element.disabled && !["button", "submit", "reset"].includes(element.type))
            .map((element) => {
                const key = element.name || element.id;
                if (element.type === "checkbox" || element.type === "radio") {
                    return [key, element.type, element.value, element.checked];
                }
                if (element.type === "file") {
                    return [key, Array.from(element.files || []).map((file) => [file.name, file.size, file.lastModified])];
                }
                if (element.tagName === "SELECT" && element.multiple) {
                    return [key, Array.from(element.selectedOptions).map((option) => option.value)];
                }
                return [key, element.value];
            });
    }

    function markClean(form) {
        if (form instanceof Element) {
            formSnapshots.set(form, JSON.stringify(snapshotForm(form)));
        }
    }

    async function confirmDiscard(form) {
        if (!(form instanceof Element) || !formSnapshots.has(form)) return true;
        if (JSON.stringify(snapshotForm(form)) === formSnapshots.get(form)) return true;
        return confirm({
            title: "¿Salir sin guardar?",
            message: "Tienes cambios sin guardar. Si sales ahora, se perderán.",
            confirmText: "Salir sin guardar",
            tone: "primary",
            icon: "fa-arrow-right-from-bracket"
        });
    }

    async function confirmDelete(options) {
        const accepted = await confirm({
            title: options.title,
            message: options.message,
            confirmText: options.confirmText || "Sí, eliminar"
        });
        if (!accepted) return false;

        if (options.button) options.button.disabled = true;
        try {
            const response = await fetch(options.endpoint, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(options.payload)
            });
            const result = await response.json();
            if (!response.ok || !result.ok) {
                toast(result.error || options.errorMessage, "error");
                return false;
            }

            if (options.onSuccess) options.onSuccess();
            toast(options.successMessage);
            return true;
        } catch (error) {
            console.error(options.logMessage, error);
            toast(options.connectionError, "error");
            return false;
        } finally {
            if (options.button) options.button.disabled = false;
        }
    }

    async function logoutAdmin(endpoint, redirectUrl) {
        const accepted = await confirm({
            title: "Cerrar sesión",
            message: "¿Quieres cerrar tu sesión?",
            confirmText: "Cerrar sesión",
            tone: "primary",
            icon: "fa-right-from-bracket"
        });
        if (!accepted) return false;

        try {
            const response = await fetch(endpoint, { method: "POST", credentials: "include" });
            const result = await response.json();
            if (!response.ok || !result.ok) {
                throw new Error(result.error || "No se pudo cerrar la sesión.");
            }
            if (window.TourismSession) {
                window.TourismSession.clear();
            } else {
                sessionStorage.removeItem("te_session");
                localStorage.removeItem("te_session");
            }
            window.location.assign(redirectUrl);
            return true;
        } catch (error) {
            console.error("No se pudo cerrar la sesión en el servidor.", error);
            toast(error.message || "No se pudo cerrar la sesión. Intenta de nuevo.", "error");
            return false;
        }
    }

    window.TEUI = { confirm, alert: alertDialog, confirmDelete, toast, notifyClosed, markClean, confirmDiscard, logoutAdmin };
})();
