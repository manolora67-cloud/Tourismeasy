(function () {
    var dialog = document.createElement("dialog");
    dialog.className = "te-company-dialog";
    dialog.setAttribute("aria-labelledby", "teCompanyName");
    dialog.innerHTML =
        '<div class="te-company-dialog__body">' +
        '<button class="te-company-dialog__close" type="button" aria-label="Cerrar">&times;</button>' +
        '<p class="te-company-dialog__eyebrow">Sobre la empresa</p>' +
        '<h2 id="teCompanyName"></h2>' +
        '<p class="te-company-dialog__description" id="teCompanyDescription"></p>' +
        '<dl class="te-company-dialog__contacts">' +
        '<div><dt>Teléfono</dt><dd><a id="teCompanyPhone"></a></dd></div>' +
        '<div><dt>Correo</dt><dd><a id="teCompanyEmail"></a></dd></div>' +
        '</dl>' +
        '</div>';
    document.body.appendChild(dialog);

    var name = dialog.querySelector("#teCompanyName");
    var description = dialog.querySelector("#teCompanyDescription");
    var phone = dialog.querySelector("#teCompanyPhone");
    var email = dialog.querySelector("#teCompanyEmail");

    dialog.querySelector(".te-company-dialog__close").addEventListener("click", function () {
        dialog.close();
    });
    dialog.addEventListener("click", function (event) {
        if (event.target === dialog) dialog.close();
    });

    window.TEEmpresaModal = {
        open: function (empresa) {
            var phoneText = String(empresa.telefono || "").trim();
            var emailText = String(empresa.email || "").trim();
            name.textContent = String(empresa.nombre || "Empresa");
            description.textContent = String(empresa.descripcion || "").trim()
                || "Esta empresa aún no ha agregado una descripción.";
            phone.textContent = phoneText || "No disponible";
            if (phoneText) phone.href = "tel:" + phoneText.replace(/[^\d+]/g, "");
            else phone.removeAttribute("href");
            email.textContent = emailText || "No disponible";
            if (emailText) email.href = "mailto:" + emailText;
            else email.removeAttribute("href");
            if (!dialog.open) dialog.showModal();
        }
    };
})();
