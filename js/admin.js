// /js/admin.js
// Panel de administración con conexión a la base de datos mediante fetch

document.addEventListener('DOMContentLoaded', () => {
    // Truco para desactivar el caché de "atrás/adelante" (bfcache):
    // con un listener de "unload" la mayoría de navegadores dejan de guardar
    // esta página en ese caché y la vuelven a cargar de cero (ejecutando este
    // script otra vez) cada vez que se navega hacia ella, incluso con los
    // botones atrás/adelante.
    window.addEventListener('unload', function() {});

    // ── Elementos del DOM ──
    const productForm = document.getElementById('product-form');
    const tableBody = document.getElementById('admin-table-body');
    const loadingIndicator = document.getElementById('loading-indicator');
    const productsPagination = document.getElementById('productosPaginacion');
    const filtroCategoria = document.getElementById('filterCategoria');
    const btnSave = document.getElementById('btn-save');
    const btnCancel = document.getElementById('btn-cancel');
    const formTitle = document.getElementById('form-title');
    const imgInput = document.getElementById('img-file');
    const imgBase64 = document.getElementById('img-base64');
    const previewContainer = document.getElementById('preview-container');
    const previewImg = document.getElementById('img-preview-form');

    // ── Constantes ──
    const API_URL = '../e-commerce/listar.php?ajax=1';
    const CIUDADES_URL = '../datos_referencia.php?tipo=ciudades';
    const DEFAULT_PRODUCT_IMAGE = '../img/default-product.jpg';
    const PRODUCT_PAGE_SIZE = 10;
    let productsCurrentPage = 1;
    let ciudadesPromise;
    let productosLoadState = 'loading';

    // ── Modal de confirmación (usado antes de cerrar sesión) ──
    // Se inyecta solo (CSS + HTML) la primera vez que se necesita, así no
    // hace falta tocar ningún archivo .css ni <link> en el HTML.
    function confirmarCerrarSesion(mensaje) {
        return new Promise((resolve) => {
            if (!document.getElementById('teConfirmStyles')) {
                const style = document.createElement('style');
                style.id = 'teConfirmStyles';
                style.textContent = `
                    .te-confirm-overlay{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;opacity:0;pointer-events:none;visibility:hidden;transition:opacity .25s ease, visibility 0s linear .25s;}
                    .te-confirm-overlay::before{content:"";position:fixed;inset:0;background:rgba(15,23,42,.65);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);z-index:-1;}
                    .te-confirm-overlay.active{opacity:1;pointer-events:all;visibility:visible;transition:opacity .25s ease, visibility 0s linear 0s;}
                    .te-confirm-box{background:var(--white);border-radius:20px;width:100%;max-width:360px;padding:28px 26px 24px;text-align:center;box-shadow:0 32px 80px rgba(0,0,0,.28);transform:translateY(20px) scale(.97);opacity:0;transition:transform .3s cubic-bezier(.34,1.56,.64,1), opacity .25s ease;}
                    .te-confirm-overlay.active .te-confirm-box{transform:translateY(0) scale(1);opacity:1;}
                    .te-confirm-icon{width:52px;height:52px;border-radius:50%;background:rgba(239,68,68,.1);color:#dc2626;display:flex;align-items:center;justify-content:center;font-size:1.3rem;margin:0 auto 14px;}
                    .te-confirm-box p{font-family:var(--font-head);font-weight:700;font-size:1.02rem;color:var(--gray-800);margin-bottom:22px;}
                    .te-confirm-actions{display:flex;gap:10px;}
                    .te-confirm-actions button{flex:1;padding:11px;border-radius:50px;border:none;font-family:var(--font-head);font-weight:700;font-size:.88rem;cursor:pointer;transition:background .2s, transform .15s;}
                    .te-confirm-cancel{background:var(--gray-200);color:var(--gray-800);}
                    .te-confirm-cancel:hover{background:var(--gray-400);}
                    .te-confirm-ok{background:#dc2626;color:#fff;}
                    .te-confirm-ok:hover{background:#b91c1c;transform:translateY(-1px);}
                    body.dark-mode .te-confirm-box{background:#1e293b;}
                    body.dark-mode .te-confirm-box p{color:#f1f5f9;}
                    body.dark-mode .te-confirm-cancel{background:#334155;color:#f1f5f9;}`;
                document.head.appendChild(style);
            }

            const overlay = document.createElement('div');
            overlay.className = 'te-confirm-overlay';
            overlay.innerHTML = `
                <div class="te-confirm-box">
                    <div class="te-confirm-icon"><i class="fa-solid fa-right-from-bracket"></i></div>
                    <p>${mensaje}</p>
                    <div class="te-confirm-actions">
                        <button class="te-confirm-cancel" id="teConfirmCancel">Cancelar</button>
                        <button class="te-confirm-ok" id="teConfirmOk">Cerrar sesión</button>
                    </div>
                </div>`;
            document.body.appendChild(overlay);
            requestAnimationFrame(() => overlay.classList.add('active'));

            function cerrar(resultado) {
                overlay.classList.remove('active');
                setTimeout(() => overlay.remove(), 250);
                resolve(resultado);
            }
            overlay.querySelector('#teConfirmCancel').addEventListener('click', () => cerrar(false));
            overlay.querySelector('#teConfirmOk').addEventListener('click', () => cerrar(true));
        });
    }

    // ── Sesión del artesano logueado ──
    // Coincide con lo que login_ecommerce.html guarda tras un login exitoso:
    // localStorage.setItem('te_ecommerce_session', JSON.stringify(data.session))
    const SESSION_KEY = 'te_ecommerce_session';

    function getSesionArtesano() {
        try {
            const raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
            if (!raw) return null;
            const data = JSON.parse(raw);
            if (!data || !data.id) return null;
            localStorage.setItem(SESSION_KEY, JSON.stringify(data));
            sessionStorage.removeItem(SESSION_KEY);
            return data;
        } catch (error) {
            console.error('No se pudo leer la sesión del artesano:', error);
            return null;
        }
    }

    const sesion = getSesionArtesano();

    if (!sesion) {
        // Sin sesión no puede estar aquí (ni siquiera volviendo con el botón
        // "adelante" del navegador tras cerrar sesión): lo mandamos a iniciar
        // sesión. replace() no deja rastro en el historial.
        window.location.replace('../html/login_ecommerce.html');
        return;
    }

    // Si el navegador restaura esta página desde el caché de atrás/adelante
    // (bfcache) y la sesión ya no existe (por ejemplo, se cerró sesión en
    // otra pestaña), volvemos a revisar y sacamos al usuario del panel.
    window.addEventListener('pageshow', function(e) {
        if (e.persisted && !getSesionArtesano()) {
            window.location.replace('../html/login_ecommerce.html');
        }
    });

    // ── Widget de sesión en el navbar (nombre + cerrar sesión) ──
    const artesanoNombreEl = document.getElementById('artesanoNombre');
    const btnLogoutArtesano = document.getElementById('btnLogoutArtesano');

    if (sesion && artesanoNombreEl) {
        artesanoNombreEl.textContent = sesion.nombre || 'Artesano';
    }

    if (btnLogoutArtesano) {
        btnLogoutArtesano.addEventListener('click', async() => {
            const confirmado = await window.TEUI.confirm({
                title: 'Cerrar sesión',
                message: '¿Quieres cerrar tu sesión de TourismLocal?',
                confirmText: 'Cerrar sesión',
                tone: 'primary',
                icon: 'fa-right-from-bracket'
            });
            if (!confirmado) return;

            // Primero destruimos la sesión real de servidor; sessionStorage
            // solo era para mostrar el nombre en pantalla, no da acceso.
            try {
                const response = await fetch('../e-commerce/logout_artesano.php', {
                    method: 'POST',
                    credentials: 'include'
                });
                const result = await response.json();
                if (!response.ok || !result.ok) {
                    throw new Error(result.error || 'No se pudo cerrar la sesión.');
                }
                sessionStorage.removeItem(SESSION_KEY);
                localStorage.removeItem(SESSION_KEY);
                window.location.replace('../html/e-commerce.html');
            } catch (e) {
                console.error('Error cerrando sesión en el servidor:', e);
                window.TEUI.toast(e.message || 'No se pudo cerrar la sesión. Intenta de nuevo.', 'error');
            }
        });
    }

    // ── Cargar ciudades en el <select id="ubicacion"> ──
    async function loadCiudades() {
        const select = document.getElementById('ubicacion');
        if (!select) return false;
        select.disabled = true;
        select.replaceChildren(new Option('Cargando ciudades…', ''));
        try {
            const response = await fetch(CIUDADES_URL, {
                credentials: 'include',
                cache: 'no-store'
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const result = await response.json();
            const ciudades = result.data && result.data.ciudades;
            if (!result.ok || !Array.isArray(ciudades)) {
                throw new Error(result.error || 'La respuesta de ciudades no es válida.');
            }

            select.replaceChildren(new Option('Selecciona una ciudad', ''));
            ciudades.forEach(ciudad => {
                select.add(new Option(ciudad.nombre, ciudad.id));
            });
            select.disabled = ciudades.length === 0;
            if (!ciudades.length) {
                select.replaceChildren(new Option('No hay ciudades disponibles', ''));
            }
            return true;
        } catch (error) {
            console.error('Error cargando ciudades:', error);
            select.replaceChildren(new Option('No se pudieron cargar las ciudades', ''));
            return false;
        }
    }

    // ── Compresión de imagen ──
    function compressImage(file, callback) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const MAX = 400;
                let w = img.width,
                    h = img.height;

                if (w > h) {
                    if (w > MAX) {
                        h = Math.round(h * MAX / w);
                        w = MAX;
                    }
                } else {
                    if (h > MAX) {
                        w = Math.round(w * MAX / h);
                        h = MAX;
                    }
                }

                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);
                callback(canvas.toDataURL('image/jpeg', 0.6));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // ── Preview de imagen ──
    imgInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            compressImage(file, function(compressed) {
                imgBase64.value = compressed;
                previewImg.src = compressed;
                previewContainer.style.display = 'block';
            });
        }
        clearFieldError('img-file');
    });

    // ── Validaciones ──
    function showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (!field) return;
        field.classList.add('input-error');

        let errorSpan = field.parentElement.querySelector('.field-error-msg');
        if (!errorSpan) {
            errorSpan = document.createElement('span');
            errorSpan.className = 'field-error-msg';
            errorSpan.style.cssText = 'color: #ef4444; font-size: 0.8rem; margin-top: 4px; display: block;';
            field.parentElement.appendChild(errorSpan);
        }
        errorSpan.textContent = message;
        errorSpan.style.display = 'block';
    }

    function clearFieldError(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;
        field.classList.remove('input-error');
        const errorSpan = field.parentElement.querySelector('.field-error-msg');
        if (errorSpan) errorSpan.style.display = 'none';
    }

    function clearAllErrors() {
        ['name', 'provider', 'category', 'price', 'ubicacion', 'contacto', 'img-file', 'description']
        .forEach(clearFieldError);
    }

    function validateForm() {
        clearAllErrors();
        let isValid = true;

        const name = document.getElementById('name').value.trim();
        const provider = document.getElementById('provider').value.trim();
        const category = document.getElementById('category').value;
        const priceRaw = document.getElementById('price').value.trim();
        const ubicacion = document.getElementById('ubicacion').value.trim();
        const contacto = document.getElementById('contacto').value.trim();
        const description = document.getElementById('description').value.trim();
        const imgVal = imgBase64.value;

        // Nombre
        const soloLetrasNombre = /^[a-zA-ZÀ-ÿ\s\-]+$/;
        if (!name) {
            showFieldError('name', 'El nombre del producto es obligatorio.');
            isValid = false;
        } else if (name.length < 3) {
            showFieldError('name', 'El nombre debe tener al menos 3 caracteres.');
            isValid = false;
        } else if (!soloLetrasNombre.test(name)) {
            showFieldError('name', 'El nombre solo puede contener letras.');
            isValid = false;
        }

        // Proveedor
        if (!provider) {
            showFieldError('provider', 'El proveedor es obligatorio.');
            isValid = false;
        } else if (provider.length < 3) {
            showFieldError('provider', 'El proveedor debe tener al menos 3 caracteres.');
            isValid = false;
        }

        // Categoría
        if (!category) {
            showFieldError('category', 'Selecciona una categoría.');
            isValid = false;
        }

        // Precio
        const cleanPrice = String(priceRaw).replace(/\./g, '').replace(',', '.').replace(/[^0-9.]/g, '');
        const parsedPrice = parseFloat(cleanPrice);
        if (!priceRaw) {
            showFieldError('price', 'El precio es obligatorio.');
            isValid = false;
        } else if (isNaN(parsedPrice) || parsedPrice <= 0) {
            showFieldError('price', 'Ingresa un precio válido mayor a 0.');
            isValid = false;
        }

        // Ubicación (select de ciudad)
        if (!ubicacion) {
            showFieldError('ubicacion', 'Selecciona una ciudad.');
            isValid = false;
        }

        // Contacto
        const soloDigitos = contacto.replace(/\s/g, '');
        if (!contacto) {
            showFieldError('contacto', 'El teléfono de contacto es obligatorio.');
            isValid = false;
        } else if (soloDigitos.length !== 10) {
            showFieldError('contacto', 'El teléfono debe tener exactamente 10 dígitos.');
            isValid = false;
        } else if (!soloDigitos.startsWith('3')) {
            showFieldError('contacto', 'El teléfono colombiano debe empezar por 3.');
            isValid = false;
        }

        // Imagen
        if (!imgVal) {
            showFieldError('img-file', 'Debes seleccionar una imagen para el producto.');
            isValid = false;
        }

        // Descripción
        if (!description) {
            showFieldError('description', 'La descripción es obligatoria.');
            isValid = false;
        } else if (description.length < 10) {
            showFieldError('description', 'La descripción debe tener al menos 10 caracteres.');
            isValid = false;
        }

        if (!isValid) {
            const firstError = productForm.querySelector('.input-error');
            if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        return isValid;
    }

    // ── Limpieza en tiempo real ──
    ['name', 'provider', 'price', 'contacto', 'description'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', () => clearFieldError(id));
    });
    document.getElementById('category').addEventListener('change', () => clearFieldError('category'));
    document.getElementById('ubicacion').addEventListener('change', () => clearFieldError('ubicacion'));

    // ── Bloqueo de teclado ──
    ['name', 'provider'].forEach(id => {
        document.getElementById(id).addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey || e.key.length > 1) return;
            if (!/^[a-zA-ZÀ-ÿ\s\-]$/.test(e.key)) e.preventDefault();
        });
    });

    document.getElementById('contacto').addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey || e.key.length > 1) return;
        if (!/^[0-9]$/.test(e.key)) {
            e.preventDefault();
            return;
        }
        const current = e.target.value.replace(/\s/g, '');
        if (current.length === 0 && e.key !== '3') {
            e.preventDefault();
            return;
        }
        if (current.length >= 10) e.preventDefault();
    });

    // ── Toast notifications ──
    function showToast(message, type = 'success') {
        window.TEUI.toast(message, type);
    }

    // ── CRUD con Fetch ──

    // GET: Obtener todos los productos (solo los del artesano logueado)
    async function fetchProducts() {
        const url = sesion ? `${API_URL}&id_persona=${encodeURIComponent(sesion.id)}` : API_URL;
        const response = await fetch(url, {
            credentials: 'include',
            cache: 'no-store'
        });
        const result = await response.json();
        if (!response.ok || !result.ok || !Array.isArray(result.data)) {
            throw new Error(result.error || `No se pudieron cargar los productos (HTTP ${response.status}).`);
        }
        return result.data;
    }

    // GET: Obtener un producto por ID
    async function fetchProductById(id) {
        // El id del artesano ya no se manda por la URL: crear.php lo toma
        // de la sesión de servidor.
        const response = await fetch(`../e-commerce/crear.php?ajax=1&id=${encodeURIComponent(id)}`, {
            credentials: 'include',
            cache: 'no-store'
        });
        const product = await response.json();
        if (!response.ok || !product || String(product.id_producto) !== String(id)) {
            throw new Error((product && product.error) || `No se pudo cargar el producto (HTTP ${response.status}).`);
        }
        return product;
    }

    // POST: Crear un nuevo producto
    async function createProduct(data) {
        try {
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('provider', data.provider);
            formData.append('category', data.category);
            formData.append('price', data.price);
            formData.append('id_ciudad', data.id_ciudad);
            formData.append('contacto', data.contacto);
            formData.append('description', data.description);
            formData.append('img_base64', data.img);
            formData.append('ajax', '1');
            // Ya no se manda id_persona: crear.php toma el dueño de la sesión de servidor.

            const response = await fetch('../e-commerce/crear.php', {
                method: 'POST',
                credentials: 'include',
                body: formData
            });
            const result = await response.json();
            if (!response.ok || !result.ok) {
                throw new Error(result.error || `Error al crear el producto (HTTP ${response.status}).`);
            }
            return result;
        } catch (error) {
            console.error('Error creating product:', error);
            showToast('Error al crear el producto: ' + error.message, 'error');
            throw error;
        }
    }

    // POST: Actualizar un producto
    async function updateProduct(id, data) {
        try {
            const formData = new FormData();
            formData.append('id', id);
            formData.append('name', data.name);
            formData.append('provider', data.provider);
            formData.append('category', data.category);
            formData.append('price', data.price);
            formData.append('id_ciudad', data.id_ciudad);
            formData.append('contacto', data.contacto);
            formData.append('description', data.description);
            formData.append('img_base64', data.img);
            formData.append('ajax', '1');
            // Ya no se manda id_persona: crear.php toma el dueño de la sesión de servidor.

            const response = await fetch('../e-commerce/crear.php', {
                method: 'POST',
                credentials: 'include',
                body: formData
            });
            const result = await response.json();
            if (!response.ok || !result.ok) {
                throw new Error(result.error || `Error al actualizar el producto (HTTP ${response.status}).`);
            }
            return result;
        } catch (error) {
            console.error('Error updating product:', error);
            showToast('Error al actualizar el producto: ' + error.message, 'error');
            throw error;
        }
    }

    // DELETE: Eliminar un producto
    async function deleteProduct(id) {
        try {
            const formData = new FormData();
            formData.append('id', id);
            formData.append('ajax', '1');
            // Ya no se manda id_persona: eliminar.php toma el dueño de la sesión de servidor.

            const response = await fetch('../e-commerce/eliminar.php', {
                method: 'POST',
                credentials: 'include',
                body: formData
            });
            const result = await response.json();
            if (!response.ok || !result.ok) {
                throw new Error(result.error || `Error al eliminar el producto (HTTP ${response.status}).`);
            }
            return result;
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    }

    // ── Renderizar tabla ──
    async function renderAdminTable() {
        productosLoadState = 'loading';
        productsCurrentPage = 1;
        if (productsPagination) productsPagination.hidden = true;
        setStatsLoading('Cargando…');
        if (document.getElementById('tab-estadisticas').classList.contains('active')) {
            renderEstadisticas();
        }
        try {
            loadingIndicator.style.display = 'block';
            tableBody.innerHTML = '';

            const products = await fetchProducts();
            loadingIndicator.style.display = 'none';
            productosLoadState = 'loaded';

            if (!products || products.length === 0) {
                if (productsPagination) productsPagination.hidden = true;
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 30px; color: var(--gray-400);">
                            <i class="fa-solid fa-store" style="font-size: 1.5rem; display: block; margin-bottom: 10px;"></i>
                            No hay productos registrados. ¡Publica tu primer producto!
                        </td>
                    </tr>
                `;
                actualizarStats();
                return;
            }

            products.forEach(product => {
                if (!product || !product.id_producto) {
                    throw new Error('El servidor devolvió un producto inválido.');
                }
                const price = Number(product.precio_cop);
                if (!Number.isFinite(price) || price <= 0) {
                    throw new Error('El servidor devolvió un precio de producto inválido.');
                }
                const priceFormatted = new Intl.NumberFormat('es-CO', {
                    style: 'currency',
                    currency: 'COP',
                    minimumFractionDigits: 0
                }).format(price);

                const ubicacionTexto = product.nom_ciudad ?
                    `${product.nom_ciudad}, ${product.nom_dpto}` : '—';

                const tr = document.createElement('tr');
                tr.dataset.precio = product.precio_cop || '';
                const imageCell = document.createElement('td');
                const image = document.createElement('img');
                image.className = 'img-preview';
                image.alt = product.nom_producto || 'Producto';
                image.src = safeProductImageUrl(product.img_url);
                image.addEventListener('error', () => {
                    image.src = DEFAULT_PRODUCT_IMAGE;
                }, { once: true });
                imageCell.appendChild(image);

                const nameCell = document.createElement('td');
                nameCell.textContent = product.nom_producto || '';
                const categoryCell = document.createElement('td');
                categoryCell.textContent = product.categoria || '';
                const priceCell = document.createElement('td');
                priceCell.textContent = priceFormatted;
                const locationCell = document.createElement('td');
                locationCell.textContent = ubicacionTexto;

                const actionsCell = document.createElement('td');
                const actions = document.createElement('div');
                actions.className = 'table-actions';
                const editButton = document.createElement('button');
                editButton.className = 'btn-edit';
                editButton.dataset.id = product.id_producto;
                editButton.title = 'Editar';
                editButton.innerHTML = '<i class="fa-solid fa-pen"></i>';
                const deleteButton = document.createElement('button');
                deleteButton.className = 'btn-delete';
                deleteButton.dataset.id = product.id_producto;
                deleteButton.title = 'Eliminar';
                deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i>';
                actions.append(editButton, deleteButton);
                actionsCell.appendChild(actions);
                tr.append(imageCell, nameCell, categoryCell, priceCell, locationCell, actionsCell);
                tableBody.appendChild(tr);
            });

            renderPaginaProductos();
            actualizarStats();
        } catch (error) {
            loadingIndicator.style.display = 'none';
            productosLoadState = 'error';
            if (productsPagination) productsPagination.hidden = true;
            setStatsLoading('No disponible');
            console.error('Error rendering table:', error);
            if (document.getElementById('tab-estadisticas').classList.contains('active')) {
                renderEstadisticas();
            }
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 6;
            cell.style.cssText = 'text-align:center;padding:30px;color:#ef4444;';
            cell.textContent = error.message || 'Error al cargar los productos. Verifica la conexión con el servidor.';
            row.appendChild(cell);
            tableBody.replaceChildren(row);
        }
    }

    function safeProductImageUrl(value) {
        if (!value) return DEFAULT_PRODUCT_IMAGE;
        try {
            const url = new URL(String(value), window.location.href);
            if (url.origin === window.location.origin || url.protocol === 'https:') {
                return url.href;
            }
        } catch (error) {
            console.warn('Se omitió una URL de imagen inválida.');
        }
        return DEFAULT_PRODUCT_IMAGE;
    }

    function setStatsLoading(value) {
        ['statTotal', 'statMasCaro', 'statMasBarato', 'statPromedio', 'statTopCategoria', 'statTopCiudad']
        .forEach(id => {
            document.getElementById(id).textContent = value;
        });
        document.getElementById('badgeTotal').textContent = value;
        document.getElementById('badgeCategorias').textContent = value;
        document.getElementById('badgeCiudades').textContent = value;
    }

    // ── Manejar eliminación ──
    async function handleDeleteProduct(id) {
        if (await window.TEUI.confirm({
            title: 'Eliminar producto',
            message: '¿Quieres eliminar este producto? Esta acción no se puede deshacer.',
            confirmText: 'Sí, eliminar'
        })) {
            try {
                await deleteProduct(id);
                await renderAdminTable();
                showToast('Producto eliminado correctamente', 'success');
            } catch (error) {
                console.error('Error:', error);
                window.TEUI.toast(error.message || 'No se pudo eliminar el producto.', 'error');
            }
        }
    }

    // ── Editar producto ──
    async function editProduct(id) {
        try {
            const product = await fetchProductById(id);
            if (!product || product.id_producto == null) {
                throw new Error('El servidor devolvió un producto inválido.');
            }
            if (!await ciudadesPromise) {
                throw new Error('No se pudieron cargar las ciudades. Recarga la página e inténtalo de nuevo.');
            }

            document.getElementById('product-id').value = product.id_producto;
            document.getElementById('name').value = product.nom_producto;
            document.getElementById('provider').value = product.proveedor;
            document.getElementById('category').value = product.categoria;
            document.getElementById('price').value = product.precio_cop;
            document.getElementById('ubicacion').value = product.id_ciudad || '';
            document.getElementById('contacto').value = product.num_contacto || '';
            document.getElementById('description').value = product.descripcion;

            if (product.img_url) {
                imgBase64.value = product.img_url;
                previewImg.src = product.img_url;
                previewContainer.style.display = 'block';
            } else {
                imgBase64.value = '';
                previewContainer.style.display = 'none';
            }

            formTitle.innerText = "Editando Producto";
            btnSave.innerText = "Actualizar Cambios";
            btnCancel.style.display = "block";
            clearAllErrors();
            window.TEUI.markClean(productForm);
            window.scrollTo(0, 0);

        } catch (error) {
            console.error('Error loading product for edit:', error);
            showToast(error.message || 'Error al cargar el producto para editar', 'error');
        }
    }

    // ── Guardar producto ──
    productForm.addEventListener('submit', async(e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const id = document.getElementById('product-id').value;
        const rawPrice = String(document.getElementById('price').value)
            .replace(/\./g, '').replace(',', '.').replace(/[^0-9.]/g, '');
        const price = parseFloat(rawPrice);

        const productData = {
            name: document.getElementById('name').value.trim(),
            provider: document.getElementById('provider').value.trim(),
            category: document.getElementById('category').value,
            price: price,
            id_ciudad: document.getElementById('ubicacion').value.trim(),
            contacto: document.getElementById('contacto').value.trim(),
            img: imgBase64.value,
            description: document.getElementById('description').value.trim()
        };

        btnSave.disabled = true;
        try {
            if (id) {
                await updateProduct(id, productData);
                showToast('Producto actualizado correctamente', 'success');
            } else {
                await createProduct(productData);
                showToast('Producto creado correctamente', 'success');
            }

            resetForm();
            await renderAdminTable();
        } catch (error) {
            console.error('Error saving product:', error);
        } finally {
            btnSave.disabled = false;
        }
    });

    // ── Resetear formulario ──
    function resetForm() {
        productForm.reset();
        document.getElementById('product-id').value = '';
        imgBase64.value = '';
        previewContainer.style.display = 'none';
        formTitle.innerText = "Registrar Nuevo Producto";
        btnSave.innerText = "Publicar Producto";
        btnCancel.style.display = "none";
        clearAllErrors();
        precargarProveedor();
        window.TEUI.markClean(productForm);
    }

    btnCancel.addEventListener('click', async() => {
        if (await window.TEUI.confirmDiscard(productForm)) {
            resetForm();
            window.TEUI.notifyClosed("Edición");
        }
    });

    // ── Precargar el campo "Proveedor" con el nombre del artesano logueado ──
    // Ya no tiene sentido escribirlo a mano: el panel es tuyo, tus productos van a tu nombre.
    // Se llama al cargar la página Y dentro de resetForm(), porque form.reset()
    // borra el valor de vuelta a su default (vacío) pero no toca el readOnly,
    // dejando el campo bloqueado y en blanco tras el primer producto.
    function precargarProveedor() {
        if (sesion && sesion.nombre) {
            const providerInput = document.getElementById('provider');
            providerInput.value = sesion.nombre;
            providerInput.readOnly = true;
            providerInput.style.background = 'var(--gray-100)';
            providerInput.style.cursor = 'not-allowed';
        }
    }
    precargarProveedor();
    window.TEUI.markClean(productForm);

    // ── Inicializar ──
    ciudadesPromise = loadCiudades();
    renderAdminTable();

    // ── Exponer funciones ──
    window.editProduct = editProduct;

    // ══════════════════════════════════════════════════════
    //  DASHBOARD DEL PANEL
    //  Modo oscuro, tabs, filtro por categoría y estadísticas.
    //  Esta parte solo maneja la interfaz; no toca el CRUD de
    //  arriba, pero reacciona automáticamente cada vez que
    //  renderAdminTable() cambia el contenido de la tabla.
    // ══════════════════════════════════════════════════════

    // ── Modo oscuro: ahora lo maneja el componente compartido dark-mode-toggle.js
    // (mismo botón #darkModeToggle, llave 'theme' compartida con todo el sitio).

    // ── Tabs (Productos / Estadísticas) ──
    document.querySelectorAll('.panel-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.panel-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.panel-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
            if (tab.dataset.tab === 'estadisticas') renderEstadisticas();
        });
    });

    tableBody.addEventListener('click', event => {
        const editButton = event.target.closest('.btn-edit');
        const deleteButton = event.target.closest('.btn-delete');
        if (editButton && tableBody.contains(editButton)) {
            editProduct(editButton.dataset.id);
        } else if (deleteButton && tableBody.contains(deleteButton)) {
            handleDeleteProduct(deleteButton.dataset.id);
        }
    });

    function renderPaginaProductos() {
        const filas = filasValidas();
        const categoria = filtroCategoria.value.toLowerCase();
        const filtradas = filas.filter(tr => {
            const cat = (tr.cells[2] ? tr.cells[2].textContent : '').trim().toLowerCase();
            return !categoria || cat.includes(categoria);
        });
        const totalPages = Math.max(1, Math.ceil(filtradas.length / PRODUCT_PAGE_SIZE));
        productsCurrentPage = Math.min(productsCurrentPage, totalPages);
        const inicio = (productsCurrentPage - 1) * PRODUCT_PAGE_SIZE;
        const visibles = new Set(filtradas.slice(inicio, inicio + PRODUCT_PAGE_SIZE));
        filas.forEach(tr => {
            tr.style.display = visibles.has(tr) ? '' : 'none';
        });

        const emptyFilterRow = tableBody.querySelector('.products-filter-empty');
        if (!filtradas.length && filas.length) {
            if (!emptyFilterRow) {
                const row = document.createElement('tr');
                row.className = 'products-filter-empty';
                const cell = document.createElement('td');
                cell.colSpan = 6;
                cell.style.cssText = 'text-align:center;padding:24px;color:var(--gray-600);';
                cell.textContent = 'No hay productos en esta categoría.';
                row.appendChild(cell);
                tableBody.appendChild(row);
            }
        } else if (emptyFilterRow) {
            emptyFilterRow.remove();
        }

        const pagination = window.TourismEasyPagination.render({
            selector: '#productosPaginacion',
            currentPage: productsCurrentPage,
            totalItems: filtradas.length,
            pageSize: PRODUCT_PAGE_SIZE,
            label: 'Mostrando',
            onPageChange: page => {
                productsCurrentPage = page;
                renderPaginaProductos();
            }
        });
        if (pagination) productsCurrentPage = pagination.currentPage;
    }

    // ── Filtro por categoría ──
    filtroCategoria.addEventListener('change', () => {
        productsCurrentPage = 1;
        renderPaginaProductos();
    });

    // ── Estadísticas — se calculan leyendo las filas que renderAdminTable() ya pintó ──
    function filasValidas() {
        return Array.from(document.querySelectorAll('#admin-table-body tr')).filter(tr => !tr.querySelector('td[colspan]'));
    }

    function contarPor(map, key) {
        key = (key || 'Sin dato').trim();
        if (!key) key = 'Sin dato';
        map[key] = (map[key] || 0) + 1;
    }

    function pintarBarras(contenedorId, mapa) {
        const el = document.getElementById(contenedorId);
        const entradas = Object.keys(mapa).map(k => [k, mapa[k]]);
        entradas.sort((a, b) => b[1] - a[1]);

        if (!entradas.length) {
            const empty = document.createElement('div');
            empty.className = 'chart-empty';
            const icon = document.createElement('i');
            icon.className = 'fa-solid fa-chart-simple';
            const message = document.createElement('p');
            message.textContent = 'Todavía no hay productos para graficar.';
            empty.append(icon, message);
            el.replaceChildren(empty);
            return;
        }

        const max = entradas[0][1];
        const rows = entradas.map(([label, count]) => {
            const row = document.createElement('div');
            row.className = 'bar-row';
            const labelElement = document.createElement('span');
            labelElement.className = 'bar-row__label';
            labelElement.title = label;
            labelElement.textContent = label;
            const track = document.createElement('div');
            track.className = 'bar-row__track';
            const fill = document.createElement('div');
            fill.className = 'bar-row__fill';
            fill.style.width = `${Math.round((count / max) * 100)}%`;
            track.appendChild(fill);
            const value = document.createElement('span');
            value.className = 'bar-row__val';
            value.textContent = count;
            row.append(labelElement, track, value);
            return row;
        });
        el.replaceChildren(...rows);
    }

    function actualizarStats() {
        if (productosLoadState !== 'loaded') return;

        const filas = filasValidas();
        const total = filas.length;

        const categorias = {};
        const ciudades = {};
        const productosPrecio = []; // { nombre, precio } de cada producto propio
        let sumaPrecio = 0;
        let conteoPrecio = 0;

        filas.forEach(tr => {
            const nombre = tr.cells[1] ? tr.cells[1].textContent.trim() : 'Producto';
            const categoria = tr.cells[2] ? tr.cells[2].textContent : '';
            const ciudad = tr.cells[4] ? tr.cells[4].textContent : '';

            contarPor(categorias, categoria);
            contarPor(ciudades, ciudad);

            // Preferimos el precio "crudo" guardado en data-precio; si no está, lo sacamos del texto formateado
            const precioTxt = tr.cells[3] ? tr.cells[3].textContent : '';
            const precioNum = tr.dataset.precio ?
                parseFloat(tr.dataset.precio) :
                parseInt((precioTxt || '').replace(/[^0-9]/g, ''), 10);

            if (!isNaN(precioNum) && precioNum > 0) {
                sumaPrecio += precioNum;
                conteoPrecio++;
                productosPrecio.push({ nombre, precio: precioNum });
            }
        });

        const topCategoria = Object.keys(categorias).sort((a, b) => categorias[b] - categorias[a])[0] || '—';
        const topCiudad = Object.keys(ciudades).sort((a, b) => ciudades[b] - ciudades[a])[0] || '—';
        const promedio = conteoPrecio ? Math.round(sumaPrecio / conteoPrecio) : null;

        productosPrecio.sort((a, b) => b.precio - a.precio);
        const masCaro = productosPrecio[0];
        const masBarato = productosPrecio[productosPrecio.length - 1];

        document.getElementById('statTotal').textContent = total;
        document.getElementById('statPromedio').textContent = promedio === null ?
            '—' : '$' + promedio.toLocaleString('es-CO');
        document.getElementById('statTopCategoria').textContent = topCategoria;
        document.getElementById('statTopCiudad').textContent = topCiudad;
        document.getElementById('statMasCaro').textContent = masCaro ?
            '$' + masCaro.precio.toLocaleString('es-CO') : '—';
        // Si solo hay 1 producto, masBarato === masCaro (mismo producto), lo cual es correcto.
        document.getElementById('statMasBarato').textContent = masBarato ?
            '$' + masBarato.precio.toLocaleString('es-CO') : '—';

        document.getElementById('badgeTotal').textContent = total + (total === 1 ? ' producto' : ' productos');
        document.getElementById('badgeCategorias').textContent = Object.keys(categorias).length + ' categorías';
        document.getElementById('badgeCiudades').textContent = Object.keys(ciudades).length + ' ciudades';

        // Se guarda para pintar la pestaña de Estadísticas al abrirla
        window._teStatsCache = { categorias, ciudades, productosPrecio };
    }

    function renderEstadisticas() {
        if (productosLoadState !== 'loaded') {
            const message = productosLoadState === 'error' ? 'No se pudieron cargar las estadísticas.' : 'Cargando estadísticas…';
            document.getElementById('chartCategorias').textContent = message;
            document.getElementById('chartCiudades').textContent = message;
            document.getElementById('rankPrecios').textContent = message;
            document.getElementById('rankPreciosEmpty').style.display = 'none';
            return;
        }

        const cache = window._teStatsCache || { categorias: {}, ciudades: {}, productosPrecio: [] };
        pintarBarras('chartCategorias', cache.categorias);
        pintarBarras('chartCiudades', cache.ciudades);

        const top5 = cache.productosPrecio.slice(0, 5);
        const rankEl = document.getElementById('rankPrecios');
        const emptyEl = document.getElementById('rankPreciosEmpty');

        if (!top5.length) {
            rankEl.innerHTML = '';
            emptyEl.style.display = 'block';
            return;
        }
        emptyEl.style.display = 'none';
        const maxPrecio = top5[0].precio;

        const rows = top5.map((p, i) => {
            const pct = Math.round((p.precio / maxPrecio) * 100);
            const precioFmt = '$' + p.precio.toLocaleString('es-CO');
            const row = document.createElement('div');
            row.className = 'bar-row';
            row.style.marginBottom = '12px';
            const label = document.createElement('span');
            label.className = 'bar-row__label';
            label.style.minWidth = '170px';
            label.title = p.nombre;
            const rank = document.createElement('span');
            rank.className = 'rank-num';
            rank.textContent = i + 1;
            label.append(rank, document.createTextNode(p.nombre));
            const track = document.createElement('div');
            track.className = 'bar-row__track';
            const fill = document.createElement('div');
            fill.className = 'bar-row__fill';
            fill.style.width = `${pct}%`;
            track.appendChild(fill);
            const value = document.createElement('span');
            value.className = 'bar-row__val';
            value.textContent = precioFmt;
            row.append(label, track, value);
            return row;
        });
        rankEl.replaceChildren(...rows);
    }

    // Recalcula cada vez que renderAdminTable() modifica la tabla (alta, edición, borrado, carga inicial)
    const tbodyObs = new MutationObserver(() => {
        actualizarStats();
        if (productosLoadState === 'loaded' &&
            document.getElementById('tab-estadisticas').classList.contains('active')) {
            renderEstadisticas();
        }
    });
    tbodyObs.observe(tableBody, { childList: true, subtree: true });

    // Primer cálculo por si la tabla ya tenía contenido
    if (productosLoadState === 'loading') setStatsLoading('Cargando…');
});