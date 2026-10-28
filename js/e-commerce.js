// Categoría seleccionada. "all" significa mostrar todas.
let currentCategory = "all";

// Texto que el usuario escribió en el buscador.
let currentSearch = "";

let currentLocation = "";
let currentPage = 1;
const productsPerPage = 10;
let productsLoading = true;
let productsLoadError = false;
let productSearchTimer = null;

// Productos publicados en la base de datos.
let dbProducts = [];

const PRODUCTOS_API_URL = "../e-commerce/listar.php?ajax=1";
const PRODUCTOS_BUSCAR_API_URL = "../e-commerce/buscar.php";
let productSearchRequestId = 0;

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
        cityId: String(row.id_ciudad || ""),
        cityName: row.nom_ciudad || "",
        ubicacion: row.nom_ciudad ? `${row.nom_ciudad}, ${row.nom_dpto}` : "Santander, Colombia",
        contacto: row.num_contacto,
        img: typeof row.img_url === "string" ? row.img_url.trim() : "",
    };
}

function productImageUrl(image) {
    if (!image) return "";
    if (/^https?:\/\//i.test(image)) return image;
    if (image.startsWith("//")) return "";
    return image.startsWith("../") ? image : `../${image}`;
}

/**
 * Trae los productos publicados desde la base de datos.
 */
async function loadDbProducts() {
    try {
        const response = await fetch(PRODUCTOS_API_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        if (!result.ok || !Array.isArray(result.data)) {
            throw new Error(result.error || "El servidor devolvió una respuesta inválida.");
        }
        dbProducts = result.data.map(mapDbProduct);
        populateProductFilters();
        await searchProducts();
    } catch (error) {
        console.error("Error cargando productos desde el servidor:", error);
        productsLoadError = true;
        dbProducts = [];
        productsLoading = false;
        renderProducts();
    }
}

async function searchProducts() {
    const requestId = ++productSearchRequestId;
    const params = new URLSearchParams();
    const query = currentSearch.trim();
    if (query) params.set("q", query);
    if (currentCategory !== "all") params.set("categoria", currentCategory);
    if (currentLocation) params.set("id_ciudad", currentLocation);

    productsLoading = true;
    productsLoadError = false;
    renderProducts();

    try {
        const response = await fetch(`${PRODUCTOS_BUSCAR_API_URL}?${params.toString()}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        if (requestId !== productSearchRequestId) return;
        if (!result.ok || !Array.isArray(result.data)) {
            throw new Error(result.error || "El servidor devolvió una respuesta inválida.");
        }
        dbProducts = result.data.map(mapDbProduct);
        productsLoading = false;
        renderProducts();
    } catch (error) {
        if (requestId !== productSearchRequestId) return;
        console.error("Error buscando productos en el servidor:", error);
        productsLoadError = true;
        productsLoading = false;
        dbProducts = [];
        renderProducts();
    }
}

function populateProductFilters() {
    const locationFilter = document.getElementById("locationFilter");
    const categoryFilters = document.getElementById("categoryFilters");
    if (!locationFilter || !categoryFilters) return;

    const locations = new Map();
    const categories = new Set();
    dbProducts.forEach((product) => {
        if (product.cityId && product.cityName) locations.set(product.cityId, product.cityName);
        if (product.category) categories.add(product.category);
    });

    locations.forEach((name, id) => {
        const option = document.createElement("option");
        option.value = id;
        option.textContent = name;
        locationFilter.appendChild(option);
    });
    Array.from(locationFilter.options).slice(1).sort((a, b) =>
        a.textContent.localeCompare(b.textContent, "es")
    ).forEach((option) => locationFilter.appendChild(option));

    const categoryLabels = {
        talleres: "Talleres",
        bisuteria: "Bisutería",
        alfareria: "Alfarería",
    };
    categoryFilters.replaceChildren();
    const allButton = document.createElement("button");
    allButton.className = "filter-tag active";
    allButton.dataset.cat = "all";
    allButton.type = "button";
    allButton.textContent = "Todos";
    categoryFilters.appendChild(allButton);

    Array.from(categories).sort((a, b) => a.localeCompare(b, "es")).forEach((category) => {
        const button = document.createElement("button");
        button.className = "filter-tag";
        button.dataset.cat = category;
        button.type = "button";
        button.textContent = categoryLabels[category] || category;
        categoryFilters.appendChild(button);
    });

    categoryFilters.querySelectorAll(".filter-tag").forEach((button) => {
        button.addEventListener("click", () => {
            categoryFilters.querySelectorAll(".filter-tag").forEach((tag) => tag.classList.remove("active"));
            button.classList.add("active");
            currentCategory = button.dataset.cat;
            currentPage = 1;
            searchProducts();
        });
    });
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
    const modalImage = overlay.querySelector(".pm-img");
    const imageUrl = productImageUrl(product.img);
    modalImage.alt = product.name;
    modalImage.hidden = !imageUrl;
    if (imageUrl) modalImage.src = imageUrl;
    else modalImage.removeAttribute("src");
    overlay.querySelector(".pm-cat").textContent =
        catLabel[product.category] || product.category;
    overlay.querySelector(".pm-name").textContent = product.name;
    overlay.querySelector(".pm-provider").textContent = product.provider;
    overlay.querySelector(".pm-ubicacion").textContent =
        product.ubicacion || "Santander, Colombia";
    overlay.querySelector(".pm-desc").textContent = product.description;
    overlay.querySelector(".pm-contacto").textContent =
        product.contacto || "tourismeasyadso@gmail.com";

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
    const whatsappLink = overlay.querySelector(".pm-whatsapp");
    whatsappLink.href = "https://wa.me/" + (product.contacto || "").replace(/\D/g, "");
    whatsappLink.dataset.idProducto = String(product.id || "");
    whatsappLink.dataset.categoria = "Artesanía";

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
    const productList = document.getElementById("product-list");
    const noResults = document.getElementById("noResults");
    const storeStatus = document.getElementById("storeStatus");
    const pagination = document.getElementById("productPagination");
    const pageSummary = document.getElementById("productPageSummary");
    const previousPage = document.getElementById("productPreviousPage");
    const nextPage = document.getElementById("productNextPage");
    if (!productList) return;

    productList.innerHTML = "";
    pagination.hidden = true;
    if (productsLoading) {
        noResults.style.display = "none";
        storeStatus.textContent = "Cargando productos publicados…";
        storeStatus.classList.remove("error");
        return;
    }
    if (productsLoadError) {
        noResults.style.display = "none";
        storeStatus.textContent = "No se pudieron cargar los productos. Intenta recargar la página.";
        storeStatus.classList.add("error");
        return;
    }

    if (dbProducts.length === 0) {
        noResults.textContent = "No se encontraron productos para los filtros seleccionados.";
        noResults.style.display = "block";
        storeStatus.textContent = "";
        storeStatus.classList.remove("error");
        return;
    }

    noResults.style.display = "none";
    storeStatus.classList.remove("error");

    const totalPages = Math.ceil(dbProducts.length / productsPerPage);
    currentPage = Math.max(1, Math.min(currentPage, totalPages));
    const start = (currentPage - 1) * productsPerPage;
    const pageProducts = dbProducts.slice(start, start + productsPerPage);
    const categoryLabels = {
        talleres: "Talleres",
        bisuteria: "Bisutería",
        alfareria: "Alfarería",
    };

    pageProducts.forEach((product) => {
        const card = document.createElement("div");
        card.classList.add("card");

        const priceFormatted = product.price ?
            new Intl.NumberFormat("es-CO", {
                style: "currency",
                currency: "COP",
                minimumFractionDigits: 0,
            }).format(product.price) :
            "Consultar precio";

        const imageUrl = productImageUrl(product.img);
        const imageMarkup = imageUrl
            ? `<img src="${imageUrl}" alt="${product.name}">`
            : '<div class="product-image-placeholder" aria-label="Producto sin imagen"><i class="fa-solid fa-image" aria-hidden="true"></i></div>';
        card.innerHTML = `
      ${imageMarkup}
      <div class="card-info">
        <span class="category-tag">${categoryLabels[product.category] || product.category}</span>
        <h3>${product.name}</h3>
        <p class="provider">${product.provider}</p>
        <p class="description">${product.description}</p>
        <p class="price">${priceFormatted}</p>
        <button class="btn-add" data-id="${product.id}">Ver más info</button>
      </div>
    `;

        card.querySelector(".btn-add").addEventListener("click", () => {
            openDetailModal(product);
        });
        productList.appendChild(card);
    });

    pageSummary.textContent = `Mostrando ${start + 1}–${start + pageProducts.length} de ${dbProducts.length} productos · Página ${currentPage} de ${totalPages}`;
    previousPage.disabled = currentPage === 1;
    nextPage.disabled = currentPage === totalPages;
    pagination.hidden = totalPages <= 1;
    storeStatus.textContent = `${dbProducts.length} ${dbProducts.length === 1 ? "producto encontrado." : "productos encontrados."}`;
}

document.addEventListener("DOMContentLoaded", () => {
    renderProducts();
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
            currentPage = 1;
            if (searchClear)
                searchClear.style.display = currentSearch ? "flex" : "none";
            window.clearTimeout(productSearchTimer);
            productSearchTimer = window.setTimeout(searchProducts, 250);
        });
    }

    if (searchClear) {
        // Al hacer clic en X, limpiamos el buscador y re-pintamos todo
        searchClear.addEventListener("click", () => {
            searchInput.value = "";
            currentSearch = "";
            currentPage = 1;
            searchClear.style.display = "none";
            searchInput.focus();
            window.clearTimeout(productSearchTimer);
            searchProducts();
        });
    }

    const locationFilter = document.getElementById("locationFilter");
    locationFilter.addEventListener("change", () => {
        currentLocation = locationFilter.value;
        currentPage = 1;
        searchProducts();
    });

    document.getElementById("productPreviousPage").addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            renderProducts();
        }
    });
    document.getElementById("productNextPage").addEventListener("click", () => {
        currentPage++;
        renderProducts();
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
            <p>📧 <strong>tourismeasyadso@gmail.com</strong><br>💬 <strong>+57 317 461 3395</strong></p>
          `,
    },
    contacto: {
        title: "Contacto",
        content: `
            <p>¿Tienes preguntas sobre algún artesano, quieres registrar tu taller o simplemente quieres saber más sobre la artesanía santandereana? Escríbenos.</p>
            <ul>
              <li>📧 <strong>Email:</strong> tourismeasyadso@gmail.com</li>
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
            <details><summary>¿Cómo registro mi taller?</summary><p>El registro es gratuito. Escríbenos a tourismeasyadso@gmail.com con información y fotos de tu trabajo y te agregaremos al directorio.</p></details>
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
            <p>Si eres artesano registrado y quieres actualizar o eliminar tu información, escríbenos a tourismeasyadso@gmail.com</p>
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
            sess = JSON.parse(localStorage.getItem('te_ecommerce_session') || sessionStorage.getItem('te_ecommerce_session') || 'null');
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
    if (navAdmin) navAdmin.style.display = 'none';

    // Si el navegador restaura esta página desde el caché de
    // atrás/adelante (bfcache), volvemos a revisar la sesión.
    window.addEventListener('pageshow', function(e) {
        if (e.persisted) redirigirSiHaySesion();
    });
})();