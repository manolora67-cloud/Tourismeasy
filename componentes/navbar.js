(function() {
        const mount = document.getElementById("site-navbar");
        if (!mount) return; // si la página no tiene el placeholder, no hace nada

        const context = mount.dataset.context || "root";
        const active = mount.dataset.active || "";

        const rootBase = context === "subpage" ? "../" : "";
        const pagesBase = context === "subpage" ? "" : "html/";
        const mainContent = document.querySelector("main") || document.getElementById("inicioHero");
        let skipLinkHTML = "";

        if (mainContent) {
            if (!mainContent.id) mainContent.id = "main-content";
            if (!mainContent.hasAttribute("tabindex")) mainContent.setAttribute("tabindex", "-1");
            skipLinkHTML = `<a class="skip-link" href="#${mainContent.id}">Saltar al contenido principal</a>`;
        }

        const links = [
            { key: "transporte", label: "Transporte", file: "transporte.html" },
            { key: "hospedaje", label: "Hospedaje", file: "hospedaje.html" },
            { key: "planes", label: "Planes", file: "planes_turisticos.html" },
            { key: "ecommerce", label: "E-Commerce", file: "e-commerce.html" },
            { key: "festividades", label: "Festividades", file: "festividades.html" },
            { key: "metaverso", label: "Metaverso", file: "metaverso/index.html" },
        ];

        const linkHref = (link) =>
            link.key === "metaverso" ? `${rootBase}${link.file}` : `${pagesBase}${link.file}`;

        const linksHTML = () =>
            links
            .map(
                (l) =>
                `<a href="${linkHref(l)}" class="${active === l.key ? "active" : ""}">${l.label}</a>`
            )
            .join("");

        mount.innerHTML = `
    ${skipLinkHTML}
    <nav class="navbar">
      <div class="nav-container">
        <a href="${rootBase}index.html" class="nav-logo">
          <img src="${rootBase}img/TURISMEASY.png" alt="TourismEasy Logo" class="logo-img" />
          <span class="logo-text">TOURISMEASY</span>
        </a>
        <ul class="nav-links">
          ${links
            .map(
              (l) =>
                `<li><a href="${linkHref(l)}" class="${active === l.key ? "active" : ""}">${l.label}</a></li>`
            )
            .join("")}
        </ul>
        <div class="nav-slot">
          <div data-component="btn-acceder" data-context="${context}" id="btnAccederNav"></div>
          <button class="hamburger" id="hamburger" type="button" aria-label="Abrir menú de navegación" aria-controls="navMobile" aria-expanded="false">&#9776;</button>
          <div id="dark-mode-toggle"></div>
        </div>
      </div>
      <div class="nav-mobile" id="navMobile">
        ${linksHTML()}
        <div data-component="btn-acceder" data-context="${context}" id="btnAccederMobile"></div>
      </div>
    </nav>
  `;

  // ---- Lógica del hamburger (móvil) ----
  const hamburger = document.getElementById("hamburger");
  const navMobile = document.getElementById("navMobile");

  const setMobileMenuOpen = (isOpen, restoreFocus) => {
    navMobile.classList.toggle("open", isOpen);
    hamburger.setAttribute("aria-expanded", String(isOpen));
    hamburger.setAttribute(
      "aria-label",
      isOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"
    );
    if (restoreFocus) hamburger.focus();
  };

  hamburger.addEventListener("click", () => {
    setMobileMenuOpen(!navMobile.classList.contains("open"));
  });
  navMobile.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a[href]")) {
      setMobileMenuOpen(false);
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navMobile.classList.contains("open")) {
      setMobileMenuOpen(false, true);
    }
  });
})();