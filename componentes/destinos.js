(function() {
        const mount = document.getElementById("site-destinos");
        if (!mount) return;

        const DESTINOS = [{
                key: "bucaramanga",
                img: "img/bucaramangaa.png",
                alt: "Bucaramanga",
                badge: "Popular",
                titulo: "Bucaramanga",
                desc: "Ciudad de los parques con rutas accesibles, transporte adaptado y hoteles certificados en inclusión."
            },
            {
                key: "sangil",
                img: "img/san gil.png",
                alt: "San Gil",
                badge: "Nuevo",
                titulo: "San Gil",
                desc: "Capital de la aventura con deportes extremos adaptados, rafting accesible y guías especializados."
            },
            {
                key: "barichara",
                img: "img/barichara.png",
                alt: "Barichara",
                titulo: "Barichara",
                desc: "Pueblo más lindo de Colombia con caminos del Fonce adaptados y hospedajes inclusivos."
            },
            {
                key: "chicamocha",
                img: "img/cañon del chicamocha.png",
                alt: "Cañón del Chicamocha",
                titulo: "Cañón del Chicamocha",
                desc: "Parque natural con teleférico accesible, senderos adaptados y experiencias para todos los sentidos."
            },
            {
                key: "socorro",
                img: "img/socorro.png",
                alt: "Socorro",
                titulo: "Socorro",
                desc: "Cuna de la independencia con museos accesibles, rutas históricas señalizadas y transporte inclusivo."
            },
            {
                key: "giron",
                img: "img/giron.png",
                alt: "Girón",
                titulo: "Girón",
                desc: "Municipio patrimonio con calles coloniales adaptadas, puentes accesibles y gastronomía inclusiva."
            },
            {
                key: "velez",
                img: "img/velez.png",
                alt: "Vélez",
                titulo: "Vélez",
                desc: "Tierra de la guabina con festivales accesibles, hoteles adaptados y cultura viva para todos."
            },
            {
                key: "lossantos",
                img: "img/lossantos.png",
                alt: "Los Santos",
                titulo: "Los Santos",
                desc: "Municipio de paisajes imponentes con miradores accesibles, senderos naturales adaptados y experiencias de avistamiento de cóndores para todos."
            },
        ];

        const cardTemplate = (d) => `
    <div class="card">
      <div class="card-img">
        <img src="${d.img}" alt="${d.alt}" />
        ${d.badge ? `<span class="card-badge">${d.badge}</span>` : ""}
      </div>
      <div class="card-body">
        <h3>${d.titulo}</h3>
        <p>${d.desc}</p>
        <a href="#" class="card-link" data-article="${d.key}">Leer artículo &rarr;</a>
      </div>
    </div>
  `;

  mount.innerHTML = `
    <section class="destinos" id="destinos">
      <div class="section-container">
        <div class="section-header">
          <div>
            <h2 class="section-title">Destinos en Santander</h2>
            <p class="section-desc">
              Exploramos los mejores rincones del departamento con empresas aliadas que garantizan accesibilidad real para todos los viajeros.
            </p>
          </div>
        </div>
        <div class="cards-grid">
          ${DESTINOS.map(cardTemplate).join("")}
        </div>
      </div>
    </section>
  `;
})();