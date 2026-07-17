(function() {
        const mount = document.getElementById("site-navbar");
        if (!mount) return; // si la página no tiene el placeholder, no hace nada

        const context = mount.dataset.context || "root";
        const active = mount.dataset.active || "";

        const rootBase = context === "subpage" ? "../" : "";
        const pagesBase = context === "subpage" ? "" : "html/";

        const links = [
            { key: "transporte", label: "Transporte", file: "transporte.html" },
            { key: "hospedaje", label: "Hospedaje", file: "hospedaje.html" },
            { key: "planes", label: "Planes Turísticos", file: "planes_turisticos.html" },
            { key: "personal", label: "Personal Auxiliar", file: "personal_auxiliar.html" },
            { key: "ecommerce", label: "E-Commerce", file: "e-commerce.html" },
        ];

        const linkHref = (file) => `${pagesBase}${file}`;

        const linksHTML = () =>
            links
            .map(
                (l) =>
                `<a href="${linkHref(l.file)}" class="${active === l.key ? "active" : ""}">${l.label}</a>`
            )
            .join("");

        mount.innerHTML = `
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
                `<li><a href="${linkHref(l.file)}" class="${active === l.key ? "active" : ""}">${l.label}</a></li>`
            )
            .join("")}
        </ul>
        <div data-component="btn-acceder" data-context="${context}" id="btnAccederNav"></div>
        <button class="hamburger" id="hamburger">&#9776;</button>
        <div id="dark-mode-toggle"></div>
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
  hamburger.addEventListener("click", () => navMobile.classList.toggle("open"));
})();