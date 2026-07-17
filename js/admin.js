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

    // ── Sesión del artesano logueado ──
    // Coincide con lo que login_ecommerce.html guarda tras un login exitoso:
    // sessionStorage.setItem('te_ecommerce_session', JSON.stringify(data.session))
    const SESSION_KEY = 'te_ecommerce_session';

    function getSesionArtesano() {
        try {
            const raw = sessionStorage.getItem(SESSION_KEY);
            if (!raw) return null;
            const data = JSON.parse(raw);
            return data && data.id ? data : null;
        } catch (e) {
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
            // Primero destruimos la sesión real de servidor; sessionStorage
            // solo era para mostrar el nombre en pantalla, no da acceso.
            try {
                await fetch('../e-commerce/logout_artesano.php', { method: 'POST', credentials: 'include' });
            } catch (e) {
                console.error('Error cerrando sesión en el servidor:', e);
            }
            sessionStorage.removeItem(SESSION_KEY);
            window.location.replace('../html/e-commerce.html');
        });
    }

    // ── Cargar ciudades en el <select id="ubicacion"> ──
    async function loadCiudades() {
        const select = document.getElementById('ubicacion');
        if (!select) return;
        try {
            const response = await fetch(CIUDADES_URL);
            const result = await response.json();
            const ciudades = (result.data && result.data.ciudades) || [];

            select.innerHTML = '<option value="">Selecciona una ciudad</option>' +
                ciudades.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
        } catch (error) {
            console.error('Error cargando ciudades:', error);
            select.innerHTML = '<option value="">No se pudieron cargar las ciudades</option>';
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
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 24px;
            border-radius: 8px;
            color: white;
            background: ${type === 'success' ? '#22c55e' : '#ef4444'};
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease;
            font-family: 'Open Sans', sans-serif;
            font-weight: 500;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ── CRUD con Fetch ──

    // GET: Obtener todos los productos (solo los del artesano logueado)
    async function fetchProducts() {
        try {
            const url = sesion ? `${API_URL}&id_persona=${encodeURIComponent(sesion.id)}` : API_URL;
            const response = await fetch(url, { credentials: 'include' });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const result = await response.json();
            return result.data || [];
        } catch (error) {
            console.error('Error fetching products:', error);
            showToast('Error al cargar los productos', 'error');
            return [];
        }
    }

    // GET: Obtener un producto por ID
    async function fetchProductById(id) {
        try {
            // El id del artesano ya no se manda por la URL: crear.php lo toma
            // de la sesión de servidor.
            const response = await fetch(`../e-commerce/crear.php?ajax=1&id=${id}`, { credentials: 'include' });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching product:', error);
            showToast('Error al cargar el producto', 'error');
            return null;
        }
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
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error al crear el producto');
            }
            return await response.json();
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
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error al actualizar el producto');
            }
            return await response.json();
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
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error al eliminar el producto');
            }
            return await response.json();
        } catch (error) {
            console.error('Error deleting product:', error);
            showToast('Error al eliminar el producto: ' + error.message, 'error');
            throw error;
        }
    }

    // ── Renderizar tabla ──
    async function renderAdminTable() {
        try {
            loadingIndicator.style.display = 'block';
            tableBody.innerHTML = '';

            const products = await fetchProducts();
            loadingIndicator.style.display = 'none';

            if (!products || products.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 30px; color: var(--gray-400);">
                            <i class="fa-solid fa-store" style="font-size: 1.5rem; display: block; margin-bottom: 10px;"></i>
                            No hay productos registrados. ¡Publica tu primer producto!
                        </td>
                    </tr>
                `;
                return;
            }

            products.forEach(product => {
                const priceFormatted = new Intl.NumberFormat('es-CO', {
                    style: 'currency',
                    currency: 'COP',
                    minimumFractionDigits: 0
                }).format(product.precio_cop);

                const ubicacionTexto = product.nom_ciudad ?
                    `${product.nom_ciudad}, ${product.nom_dpto}` : '—';

                const tr = document.createElement('tr');
                tr.dataset.precio = product.precio_cop || '';
                tr.innerHTML = `
                    <td><img src="${product.img_url || '../img/default-product.jpg'}" class="img-preview" alt="${product.nom_producto}" onerror="this.src='../img/default-product.jpg'"></td>
                    <td>${product.nom_producto}</td>
                    <td>${product.categoria}</td>
                    <td>${priceFormatted}</td>
                    <td>${ubicacionTexto}</td>
                    <td>
                        <button class="btn-edit" data-id="${product.id_producto}">Editar</button>
                        <button class="btn-delete" data-id="${product.id_producto}">Eliminar</button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });

            // Event listeners para botones
            document.querySelectorAll('.btn-edit').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.dataset.id;
                    editProduct(id);
                });
            });

            document.querySelectorAll('.btn-delete').forEach(btn => {
                btn.addEventListener('click', async() => {
                    const id = btn.dataset.id;
                    await handleDeleteProduct(id);
                });
            });

        } catch (error) {
            loadingIndicator.style.display = 'none';
            console.error('Error rendering table:', error);
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 30px; color: var(--gray-400);">
                        <i class="fa-solid fa-circle-exclamation" style="font-size: 1.5rem; display: block; margin-bottom: 10px; color: #ef4444;"></i>
                        Error al cargar los productos. Verifica la conexión con el servidor.
                    </td>
                </tr>
            `;
        }
    }

    // ── Manejar eliminación ──
    async function handleDeleteProduct(id) {
        if (confirm('¿Estás seguro de eliminar este producto?')) {
            try {
                await deleteProduct(id);
                await renderAdminTable();
                showToast('Producto eliminado correctamente', 'success');
            } catch (error) {
                console.error('Error:', error);
            }
        }
    }

    // ── Editar producto ──
    async function editProduct(id) {
        try {
            const product = await fetchProductById(id);
            if (!product) {
                showToast('Producto no encontrado', 'error');
                return;
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
            window.scrollTo(0, 0);

        } catch (error) {
            console.error('Error loading product for edit:', error);
            showToast('Error al cargar el producto para editar', 'error');
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
    }

    btnCancel.addEventListener('click', resetForm);

    // ── Precargar el campo "Proveedor" con el nombre del artesano logueado ──
    // Ya no tiene sentido escribirlo a mano: el panel es tuyo, tus productos van a tu nombre.
    if (sesion && sesion.nombre) {
        const providerInput = document.getElementById('provider');
        providerInput.value = sesion.nombre;
        providerInput.readOnly = true;
        providerInput.style.background = 'var(--gray-100)';
        providerInput.style.cursor = 'not-allowed';
    }

    // ── Inicializar ──
    loadCiudades();
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

    // ── Filtro por categoría (visual, sobre las filas ya renderizadas) ──
    const filtroCategoria = document.getElementById('filterCategoria');
    filtroCategoria.addEventListener('change', () => {
        const val = filtroCategoria.value.toLowerCase();
        document.querySelectorAll('#admin-table-body tr').forEach(tr => {
            if (tr.querySelector('td[colspan]')) return; // fila de "cargando" o "vacío"
            const cat = (tr.cells[2] ? tr.cells[2].textContent : '').trim().toLowerCase();
            tr.style.display = !val || cat.indexOf(val) !== -1 ? '' : 'none';
        });
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
            el.innerHTML = '<div class="chart-empty"><i class="fa-solid fa-chart-simple"></i><p>Todavía no hay productos para graficar.</p></div>';
            return;
        }

        const max = entradas[0][1];
        el.innerHTML = entradas.map(e => {
            const pct = Math.round((e[1] / max) * 100);
            return `<div class="bar-row">
                <span class="bar-row__label" title="${e[0]}">${e[0]}</span>
                <div class="bar-row__track"><div class="bar-row__fill" style="width:${pct}%"></div></div>
                <span class="bar-row__val">${e[1]}</span>
            </div>`;
        }).join('');
    }

    function actualizarStats() {
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
        const promedio = conteoPrecio ? Math.round(sumaPrecio / conteoPrecio) : 0;

        productosPrecio.sort((a, b) => b.precio - a.precio);
        const masCaro = productosPrecio[0];

        document.getElementById('statTotal').textContent = total;
        document.getElementById('statPromedio').textContent = '$' + promedio.toLocaleString('es-CO');
        document.getElementById('statTopCategoria').textContent = topCategoria;
        document.getElementById('statTopCiudad').textContent = topCiudad;
        document.getElementById('statMasCaro').textContent = masCaro ?
            '$' + masCaro.precio.toLocaleString('es-CO') : '—';

        document.getElementById('badgeTotal').textContent = total + (total === 1 ? ' producto' : ' productos');
        document.getElementById('badgeCategorias').textContent = Object.keys(categorias).length + ' categorías';
        document.getElementById('badgeCiudades').textContent = Object.keys(ciudades).length + ' ciudades';

        // Se guarda para pintar la pestaña de Estadísticas al abrirla
        window._teStatsCache = { categorias, ciudades, productosPrecio };
    }

    function renderEstadisticas() {
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

        rankEl.innerHTML = top5.map((p, i) => {
            const pct = Math.round((p.precio / maxPrecio) * 100);
            const precioFmt = '$' + p.precio.toLocaleString('es-CO');
            return `<div class="bar-row" style="margin-bottom:12px;">
                <span class="bar-row__label" style="min-width:170px;" title="${p.nombre}"><span class="rank-num">${i + 1}</span>${p.nombre}</span>
                <div class="bar-row__track"><div class="bar-row__fill" style="width:${pct}%"></div></div>
                <span class="bar-row__val">${precioFmt}</span>
            </div>`;
        }).join('');
    }

    // Recalcula cada vez que renderAdminTable() modifica la tabla (alta, edición, borrado, carga inicial)
    const tbodyObs = new MutationObserver(() => {
        actualizarStats();
        if (document.getElementById('tab-estadisticas').classList.contains('active')) {
            renderEstadisticas();
        }
    });
    tbodyObs.observe(tableBody, { childList: true, subtree: true });

    // Primer cálculo por si la tabla ya tenía contenido
    actualizarStats();
});