const defaultProducts = [{
        id: "def-1",
        name: "Taller de Cerámica Guane",
        provider: "Artesanías Barichara",
        description: "Aprende la técnica ancestral de moldeado en tierra de color con maestros locales de Barichara. El taller ofrece sesiones grupales e individuales donde podrás crear tu propia pieza y llevártela a casa.",
        category: "talleres",
        price: 85000,
        ubicacion: "Barichara, Santander",
        contacto: "+57 310 234 5678",
        img: "../img/taller_cera_guane.avif",
    },
    {
        id: "def-2",
        name: "Collar de Cuarzo Rosa",
        provider: "Joyas del Chicamocha",
        description: "Bisutería artesanal con piedras semipreciosas extraídas de la región del Chicamocha. Cada pieza es única, trabajada a mano con técnicas de joyería tradicional transmitidas por generaciones.",
        category: "bisuteria",
        price: 45000,
        ubicacion: "San Gil, Santander",
        contacto: "+57 311 456 7890",
        img: "../img/collar_cuarzo_rosa.jpeg",
    },
    {
        id: "def-3",
        name: "Vasija en Arcilla Roja",
        provider: "Taller Girón Ancestral",
        description: "Piezas únicas de alfarería tradicional elaboradas con arcilla roja del municipio de Girón. Cada vasija refleja siglos de tradición cerámica santandereana, con formas y texturas inspiradas en la cultura guane.",
        category: "alfareria",
        price: 120000,
        ubicacion: "Girón, Santander",
        contacto: "+57 312 678 9012",
        img: "../img/vasija_arcilla_roja.webp",
    },
];

// Categoría seleccionada. "all" significa mostrar todas.
let currentCategory = "all";

// Texto que el usuario escribió en el buscador.
let currentSearch = "";

// Lista combinada de todos los productos (defecto + admin).
// Se rellena cada vez que se llama a renderProducts().
let allProducts = [];

// Productos creados desde el panel admin, traídos de la base de datos.
// Se llenan una vez al cargar la página (loadDbProducts) y luego se
// combinan con defaultProducts en cada renderProducts().
let dbProducts = [];

const PRODUCTOS_API_URL = "../e-commerce/listar.php?ajax=1";

/**
 * Convierte una fila tal como la devuelve la base de datos
 * (nom_producto, precio_cop, img_url, etc.) al formato que ya
 * usa esta página (name, price, img, etc.)
 */
function mapDbProduct(row) {
    return {
        id: row.id_producto,
        name: row.nom_producto,
        provider: row.proveedor,
        description: row.descripcion,
        category: row.categoria,
        price: Number(row.precio_cop),
        ubicacion: row.nom_ciudad ? `${row.nom_ciudad}, ${row.nom_dpto}` : "Santander, Colombia",
        contacto: row.num_contacto,
        img: row.img_url,
    };
}

/**
 * Trae los productos publicados desde el panel admin (base de datos)
 * y vuelve a pintar la tienda cuando llegan.
 * Los productos "de fábrica" (defaultProducts) se muestran de inmediato
 * sin esperar a esta petición, para que la página no se sienta lenta.
 */
async function loadDbProducts() {
    try {
        const response = await fetch(PRODUCTOS_API_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        dbProducts = (result.data || []).map(mapDbProduct);
    } catch (error) {
        console.error("Error cargando productos desde el servidor:", error);
        dbProducts = []; // si falla, la tienda igual muestra los productos de fábrica
    }
    renderProducts();
}

function openDetailModal(product) {
    // product es el objeto con toda la información del producto que se hizo click
    // Buscamos el overlay del modal en el HTML
    const overlay = document.getElementById("productModalOverlay");

    // Etiquetas legibles para cada categoría
    const catLabel = {
        talleres: "Taller",
        bisuteria: "Bisutería",
        alfareria: "Alfarería",
    };

    // Rellenamos cada elemento del modal con los datos del producto
    overlay.querySelector(".pm-img").src = product.img;
    overlay.querySelector(".pm-img").alt = product.name;
    overlay.querySelector(".pm-cat").textContent =
        catLabel[product.category] || product.category;
    overlay.querySelector(".pm-name").textContent = product.name;
    overlay.querySelector(".pm-provider").textContent = product.provider;
    overlay.querySelector(".pm-ubicacion").textContent =
        product.ubicacion || "Santander, Colombia";
    overlay.querySelector(".pm-desc").textContent = product.description;
    overlay.querySelector(".pm-contacto").textContent =
        product.contacto || "contacto@tourismlocal.com";

    // Formateamos el precio en pesos colombianos (ej: 85000 → $85.000)
    const priceFormatted = product.price ?
        new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
        }).format(product.price) :
        "Consultar precio";
    overlay.querySelector(".pm-price").textContent = priceFormatted;

    // El botón de WhatsApp usa el número de contacto sin espacios ni símbolos
    // .replace(/\D/g, "") elimina todo lo que no sea dígito
    overlay.querySelector(".pm-whatsapp").href =
        "https://wa.me/" + (product.contacto || "").replace(/\D/g, "");

    // Mostramos el modal y bloqueamos el scroll del fondo
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
}

/**
 * closeDetailModal()
 * Oculta el modal de detalle y restaura el scroll normal.
 */
function closeDetailModal() {
    document.getElementById("productModalOverlay").classList.remove("active");
    document.body.style.overflow = "";
}

function renderProducts() {
    // Buscamos el contenedor de tarjetas y el mensaje de "sin resultados"
    const productList = document.getElementById("product-list");
    const noResults = document.getElementById("noResults");

    // Si no existe el contenedor, salimos sin hacer nada
    // (este JS se carga en varias páginas, no todas tienen tienda)
    if (!productList) return;

    // Combinamos: primero los por defecto (fijos en este archivo), luego
    // los que el admin registró desde el panel (traídos de la base de datos)
    // El operador ... (spread) "desempaqueta" cada arreglo
    allProducts = [...defaultProducts, ...dbProducts];

    // Convertimos el texto de búsqueda a minúsculas para comparar sin importar mayúsculas
    const query = currentSearch.toLowerCase().trim();

    // Filtramos: un producto pasa si cumple AMBAS condiciones:
    //   - matchCat:    su categoría coincide con el filtro activo (o es "all")
    //   - matchSearch: contiene el texto buscado en algún campo
    const filtered = allProducts.filter((p) => {
        const matchCat =
            currentCategory === "all" || p.category === currentCategory;
        const matchSearch = !query ||
            p.name.toLowerCase().includes(query) ||
            p.provider.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query);
        return matchCat && matchSearch;
    });

    // Limpiamos el contenedor antes de volver a pintarlo
    productList.innerHTML = "";

    // Si no hay resultados, mostramos el mensaje y salimos
    if (filtered.length === 0) {
        if (noResults) noResults.style.display = "block";
        return;
    }

    // Si hay resultados, ocultamos el mensaje de "sin resultados"
    if (noResults) noResults.style.display = "none";

    // Creamos una tarjeta HTML por cada producto filtrado
    filtered.forEach((product) => {
        // Creamos un div vacío y le añadimos la clase "card"
        const card = document.createElement("div");
        card.classList.add("card");

        // Rellenamos el HTML interno de la tarjeta con los datos del producto
        // Las llaves ${} dentro del template literal insertan valores de variables
        const priceFormatted = product.price ?
            new Intl.NumberFormat("es-CO", {
                style: "currency",
                currency: "COP",
                minimumFractionDigits: 0,
            }).format(product.price) :
            "Consultar precio";

        card.innerHTML = `
      <img src="${product.img}" alt="${product.name}">
      <div class="card-info">
        <span class="category-tag">${product.category}</span>
        <h3>${product.name}</h3>
        <p class="provider">${product.provider}</p>
        <p class="description">${product.description}</p>
        <p class="price">${priceFormatted}</p>
        <button class="btn-add" data-id="${product.id}">Ver más info</button>
      </div>
    `;

        // Al hacer clic en "Ver más info", abrimos el modal con este producto
        card.querySelector(".btn-add").addEventListener("click", () => {
            openDetailModal(product);
        });

        // Añadimos la tarjeta al contenedor
        productList.appendChild(card);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    //se espera a que el HTML esté cargado antes de ejecutar el código

    // ── Pintamos los productos al cargar la página ──
    // Primero mostramos los de fábrica al instante (sin esperar red)...
    renderProducts();
    // ...y luego traemos los del panel admin y volvemos a pintar cuando lleguen.
    loadDbProducts();

    // ── Modal de detalle: cerrar ──
    const pmOverlay = document.getElementById("productModalOverlay");
    if (pmOverlay) {
        // Cerrar al hacer clic en la X
        document
            .getElementById("pmClose")
            .addEventListener("click", closeDetailModal);
        // Cerrar al hacer clic fuera del modal (en el fondo oscuro)
        pmOverlay.addEventListener("click", (e) => {
            if (e.target === pmOverlay) closeDetailModal();
        });
    }

    // ── Buscador en tiempo real ──
    const searchInput = document.getElementById("searchInput");
    const searchClear = document.getElementById("searchClear"); // botón X para limpiar

    if (searchInput) {
        // Cada vez que el usuario escribe algo, actualizamos la búsqueda y re-pintamos
        searchInput.addEventListener("input", () => {
            currentSearch = searchInput.value;
            // Mostramos u ocultamos el botón X según si hay texto
            if (searchClear)
                searchClear.style.display = currentSearch ? "flex" : "none";
            renderProducts();
        });
    }

    if (searchClear) {
        // Al hacer clic en X, limpiamos el buscador y re-pintamos todo
        searchClear.addEventListener("click", () => {
            searchInput.value = "";
            currentSearch = "";
            searchClear.style.display = "none";
            searchInput.focus(); // Devolvemos el foco al input para seguir escribiendo
            renderProducts();
        });
    }

    // ── Filtros por categoría ──
    document.querySelectorAll(".filter-tag").forEach((btn) => {
        btn.addEventListener("click", () => {
            // Quitamos la clase "active" de todos los botones
            document
                .querySelectorAll(".filter-tag")
                .forEach((b) => b.classList.remove("active"));
            // Se la ponemos solo al botón que se acaba de hacer clic
            btn.classList.add("active");
            // Guardamos la categoría elegida y re-pintamos
            currentCategory = btn.dataset.cat; // data-cat="talleres" etc.
            renderProducts();
        });
    });

    // El modo oscuro ahora lo maneja el componente compartido dark-mode-toggle.js
    // (mismo botón #darkModeToggle, llave 'theme' compartida con todo el sitio).
});
// ============================================================
// MENÚ HAMBURGUESA (móvil)
// ============================================================
var hamburgerBtn = document.getElementById('hamburger');
var navMobileMenu = document.getElementById('navMobile');
if (hamburgerBtn && navMobileMenu) {
    hamburgerBtn.addEventListener('click', function() {
        navMobileMenu.classList.toggle('open');
    });
}

// ============================================================
// MODALES FOOTER
// ============================================================
const tlModalData = {
    destinos: {
        title: "Destinos Artesanales de Santander",
        content: `
            <p>Santander es uno de los departamentos con mayor tradición artesanal de Colombia. Estos son los principales destinos donde puedes conocer y adquirir artesanías directamente de sus creadores:</p>
            <h3>🏘️ Barichara</h3>
            <p>Considerado el pueblo más lindo de Colombia, es famoso por su talla en piedra, cestería en fique y papel artesanal hecho a mano con técnicas prehispánicas.</p>
            <h3>🏙️ Girón</h3>
            <p>Pueblo patrimonio con fuerte tradición en cerámica, alfarería y bisutería elaborada con materiales naturales de la región.</p>
            <h3>🌿 San Gil</h3>
            <p>Capital del turismo de aventura, también cuenta con talleres de productos en cuero, hamacas y artesanías en madera.</p>
            <h3>🏔️ Socorro</h3>
            <p>Cuna histórica del departamento, con tradición en tejidos, bordados y trabajos en cerámica.</p>
          `,
    },
    "sobre-nosotros": {
        title: "Sobre Nosotros",
        content: `
            <p>TourismLocal es una plataforma informativa creada para dar visibilidad a los artesanos y emprendedores de Santander, Colombia.</p>
            <p>No somos una tienda en línea. Somos un directorio digital que conecta a los visitantes con los creadores locales, sus talleres y sus historias.</p>
            <h3>Nuestra misión</h3>
            <p>Promover el patrimonio artesanal de Santander, facilitando el encuentro entre artesanos y personas interesadas en conocer, visitar o contactar directamente a los creadores.</p>
            <h3>¿Por qué TourismLocal?</h3>
            <p>Porque creemos que cada pieza artesanal tiene una historia detrás, y esa historia merece ser contada y conocida más allá del taller donde nació.</p>
          `,
    },
    artesanos: {
        title: "Nuestros Artesanos",
        content: `
            <p>TourismLocal reúne información sobre artesanos y emprendedores verificados de todo Santander. Cada perfil incluye su historia, técnicas y formas de contacto.</p>
            <h3>¿Qué tipos de artesanos encontrarás?</h3>
            <ul>
              <li>🏺 Alfareros y ceramistas de Barichara y Girón</li>
              <li>💍 Bisuteros con técnicas ancestrales y contemporáneas</li>
              <li>🪡 Talleres de tejidos, macramé y bordados</li>
              <li>🪵 Talladores en madera y artesanos en cuero</li>
              <li>📄 Productores de papel artesanal hecho a mano</li>
            </ul>
            <p>¿Tienes un taller y quieres aparecer aquí? <a href="#" data-modal="registro">Registra tu taller.</a></p>
          `,
    },
    registro: {
        title: "Registra tu Taller",
        content: `
            <p>¿Eres artesano o tienes un emprendimiento artesanal en Santander? Queremos que tu trabajo sea visible para turistas y compradores de todo el mundo.</p>
            <h3>¿Qué obtienes al registrarte?</h3>
            <ul>
              <li>🌐 Perfil informativo con fotos de tus productos</li>
              <li>📍 Tu ubicación en el mapa artesanal de Santander</li>
              <li>📞 Datos de contacto visibles para visitantes interesados</li>
              <li>📖 Tu historia y técnicas artesanales publicadas</li>
            </ul>
            <h3>¿Cómo registrarse?</h3>
            <p>El registro es gratuito. Escríbenos con tu información y fotos de tu trabajo:</p>
            <p>📧 <strong>registro@tourismlocal.com</strong><br>💬 <strong>+57 317 461 3395</strong></p>
          `,
    },
    contacto: {
        title: "Contacto",
        content: `
            <p>¿Tienes preguntas sobre algún artesano, quieres registrar tu taller o simplemente quieres saber más sobre la artesanía santandereana? Escríbenos.</p>
            <ul>
              <li>📧 <strong>Email:</strong> contacto@tourismlocal.com</li>
              <li>📞 <strong>Teléfono:</strong> +57 317 461 3395</li>
              <li>💬 <strong>WhatsApp:</strong> +57 317 461 3395</li>
              <li>📍 <strong>Ubicación:</strong> Bucaramanga, Santander, Colombia</li>
            </ul>
            <p>Horario de atención: Lunes a Viernes 8:00am – 6:00pm</p>
          `,
    },
    faq: {
        title: "Preguntas Frecuentes",
        content: `
            <details><summary>¿TourismLocal vende productos?</summary><p>No. TourismLocal es una plataforma informativa. Mostramos los productos y talleres de artesanos santandereanos para que puedas conocerlos y contactarlos directamente.</p></details>
            <details><summary>¿Cómo contacto a un artesano?</summary><p>Cada artesano registrado tiene sus datos de contacto visibles en su perfil. Puedes escribirles directamente para preguntar por sus productos o visitar su taller.</p></details>
            <details><summary>¿Puedo visitar los talleres?</summary><p>Sí, la mayoría de los artesanos reciben visitas. Te recomendamos contactarlos previamente para confirmar horarios y disponibilidad.</p></details>
            <details><summary>¿Cómo registro mi taller?</summary><p>El registro es gratuito. Escríbenos a registro@tourismlocal.com con información y fotos de tu trabajo y te agregaremos al directorio.</p></details>
            <details><summary>¿La información es actualizada?</summary><p>Sí, revisamos y actualizamos los perfiles periódicamente. Si eres artesano registrado y quieres actualizar tu información, contáctanos.</p></details>
          `,
    },
    privacidad: {
        title: "Política de Privacidad",
        content: `
            <p><strong>Última actualización:</strong> Enero 2026</p>
            <h3>1. Datos que recopilamos</h3>
            <p>TourismLocal es una plataforma informativa. Solo recopilamos datos cuando un artesano solicita registrar su taller (nombre, contacto, ubicación y fotos de productos).</p>
            <h3>2. Uso de la información</h3>
            <p>Los datos de los artesanos se publican en su perfil para que visitantes interesados puedan contactarlos. No vendemos ni compartimos información con terceros.</p>
            <h3>3. Cookies</h3>
            <p>Usamos cookies únicamente para recordar tu preferencia de tema (claro/oscuro). No usamos cookies de rastreo ni publicidad.</p>
            <h3>4. Tus derechos</h3>
            <p>Si eres artesano registrado y quieres actualizar o eliminar tu información, escríbenos a privacidad@tourismlocal.com</p>
          `,
    },
};

const tlOverlay = document.getElementById("tlModalOverlay");
const tlTitle = document.getElementById("tlModalTitle");
const tlContent = document.getElementById("tlModalContent");
const tlClose = document.getElementById("tlModalClose");

function openTlModal(key) {
    const data = tlModalData[key];
    if (!data) return;
    tlTitle.textContent = data.title;
    tlContent.innerHTML = data.content;
    tlOverlay.classList.add("active");
    tlContent.querySelectorAll("[data-modal]").forEach((inner) => {
        inner.addEventListener("click", (e) => {
            e.preventDefault();
            openTlModal(inner.getAttribute("data-modal"));
        });
    });
}

document.querySelectorAll("[data-modal]").forEach((link) => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        openTlModal(link.getAttribute("data-modal"));
    });
});

tlClose.addEventListener("click", () =>
    tlOverlay.classList.remove("active"),
);
tlOverlay.addEventListener("click", (e) => {
    if (e.target === tlOverlay) tlOverlay.classList.remove("active");
});

// ============================================================
// Sesión artesano — un artesano logueado NO puede ver la tienda pública:
// se manda directo a su panel. Para "volver" a la tienda, primero tiene
// que cerrar sesión desde admin.php. También queda protegido contra los
// botones atrás/adelante del navegador (ver bfcache más abajo).
// ============================================================
(function() {
    // Truco para desactivar el caché de "atrás/adelante" (bfcache):
    // con un listener de "unload" la mayoría de navegadores dejan de
    // guardar esta página en ese caché y la vuelven a cargar de cero
    // (ejecutando este script otra vez) cada vez que se navega hacia
    // ella, incluso con los botones atrás/adelante.
    window.addEventListener('unload', function() {});

    function haySesionArtesano() {
        var sess = null;
        try {
            sess = JSON.parse(sessionStorage.getItem('te_ecommerce_session') || 'null');
        } catch (e) {}
        return sess && sess.tipo === 'artesano' && sess.estado === 'ACTIVO';
    }

    function redirigirSiHaySesion() {
        if (haySesionArtesano()) {
            // replace() no deja rastro en el historial: el botón
            // "atrás" desde admin.php no vuelve a esta página.
            window.location.replace('../e-commerce/admin.php');
            return true;
        }
        return false;
    }

    if (redirigirSiHaySesion()) return;

    var navAdmin = document.getElementById('navPanelAdmin');
    var btnAcceder = document.getElementById('btnAcceder');
    if (navAdmin) navAdmin.style.display = 'none';
    if (btnAcceder) btnAcceder.style.display = 'flex';

    // Si el navegador restaura esta página desde el caché de
    // atrás/adelante (bfcache), volvemos a revisar la sesión.
    window.addEventListener('pageshow', function(e) {
        if (e.persisted) redirigirSiHaySesion();
    });
})();