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
    const CATEGORIAS_URL = '../datos_referencia.php?tipo=categorias_artesania';
    const DEFAULT_PRODUCT_IMAGE = '../img/default-product.jpg';
    let ciudadesPromise;
    let categoriasPromise;
    let productosLoadState = 'loading';
    const productDashboard = window.TEProductDashboard.initialize(() => productosLoadState);

    // ── Widget de sesión en el navbar (nombre + cerrar sesión) ──
    const artesanoNombreEl = document.getElementById('artesanoNombre');
    const btnLogoutArtesano = document.getElementById('btnLogoutArtesano');

    if (artesanoNombreEl) artesanoNombreEl.textContent = 'Artesano';

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

            // Primero destruimos la sesión real del servidor; la interfaz solo conserva el rol.
            try {
                const response = await fetch('../e-commerce/logout_artesano.php', {
                    method: 'POST',
                    credentials: 'include'
                });
                const result = await response.json();
                if (!response.ok || !result.ok) {
                    throw new Error(result.error || 'No se pudo cerrar la sesión.');
                }
                if (window.TourismSession) window.TourismSession.clear();
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

    // ── Cargar categorías en los selectores del panel ──
    async function loadCategorias() {
        const select = document.getElementById('category');
        if (!select) return false;
        const filter = document.getElementById('filterCategoria');
        select.disabled = true;
        select.replaceChildren(new Option('Cargando categorías…', ''));
        try {
            const response = await fetch(CATEGORIAS_URL, {
                credentials: 'include',
                cache: 'no-store'
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const result = await response.json();
            const categorias = result.data && result.data.categorias_artesania;
            if (!result.ok || !Array.isArray(categorias)) {
                throw new Error(result.error || 'La respuesta de categorías no es válida.');
            }
            select.replaceChildren(new Option('Selecciona una categoría', ''));
            if (filter) filter.replaceChildren(new Option('Todas las categorías', ''));
            categorias.forEach(categoria => {
                select.add(new Option(categoria.nombre, categoria.id));
                if (filter) filter.add(new Option(categoria.nombre, categoria.id));
            });
            select.disabled = categorias.length === 0;
            if (!categorias.length) select.replaceChildren(new Option('No hay categorías activas', ''));
            return true;
        } catch (error) {
            console.error('Error cargando categorías:', error);
            select.replaceChildren(new Option('No se pudieron cargar las categorías', ''));
            if (filter) filter.replaceChildren(new Option('Categorías no disponibles', ''));
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
        const url = `${API_URL}&id_persona=1`;
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
        productDashboard.resetProductsPage();
        productDashboard.setStatsLoading('Cargando…');
        if (document.getElementById('tab-estadisticas').classList.contains('active')) {
            productDashboard.renderStatistics();
        }
        try {
            loadingIndicator.style.display = 'block';
            tableBody.innerHTML = '';

            const products = await fetchProducts();
            loadingIndicator.style.display = 'none';
            productosLoadState = 'loaded';

            if (!products || products.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 30px; color: var(--gray-400);">
                            <i class="fa-solid fa-store" style="font-size: 1.5rem; display: block; margin-bottom: 10px;"></i>
                            No hay productos registrados. ¡Publica tu primer producto!
                        </td>
                    </tr>
                `;
                productDashboard.updateStatistics();
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
                nameCell.dataset.label = 'Producto';
                nameCell.textContent = product.nom_producto || '';
                const categoryCell = document.createElement('td');
                categoryCell.dataset.label = 'Categoría';
                categoryCell.textContent = product.nombre_categoria || product.categoria || '';
                categoryCell.dataset.codigo = product.categoria || '';
                const priceCell = document.createElement('td');
                priceCell.dataset.label = 'Precio';
                priceCell.textContent = priceFormatted;
                const locationCell = document.createElement('td');
                locationCell.dataset.label = 'Ubicación';
                locationCell.textContent = ubicacionTexto;

                const actionsCell = document.createElement('td');
                actionsCell.dataset.label = 'Acciones';
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

            productDashboard.renderProductsPage();
            productDashboard.updateStatistics();
        } catch (error) {
            loadingIndicator.style.display = 'none';
            productosLoadState = 'error';
            productDashboard.resetProductsPage();
            productDashboard.setStatsLoading('No disponible');
            console.error('Error rendering table:', error);
            if (document.getElementById('tab-estadisticas').classList.contains('active')) {
                productDashboard.renderStatistics();
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
            await categoriasPromise;
            const categorySelect = document.getElementById('category');
            if (!Array.from(categorySelect.options).some(option => option.value === product.categoria)) {
                const inactiveOption = new Option(
                    (product.nombre_categoria || product.categoria) + ' (inactiva)',
                    product.categoria
                );
                inactiveOption.disabled = true;
                categorySelect.add(inactiveOption);
            }
            categorySelect.value = product.categoria;
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
    function precargarProveedor(nombre) {
        const providerInput = document.getElementById('provider');
        providerInput.value = nombre || 'Artesano';
        providerInput.readOnly = true;
        providerInput.style.background = 'var(--gray-100)';
        providerInput.style.cursor = 'not-allowed';
    }
    precargarProveedor('Artesano');
    fetch('../e-commerce/perfil_artesano.php', {
        credentials: 'include',
        headers: { Accept: 'application/json' },
        cache: 'no-store'
    })
        .then(response => response.json().then(data => ({ response, data })))
        .then(({ response, data }) => {
            if (!response.ok || !data.ok || !data.perfil) {
                throw new Error(data.error || 'No se pudo cargar el perfil del artesano.');
            }
            const name = [data.perfil.nombre, data.perfil.apellido].filter(Boolean).join(' ').trim();
            if (!name) return;
            precargarProveedor(name);
            if (artesanoNombreEl) artesanoNombreEl.textContent = name;
        })
        .catch(error => console.error('No se pudo cargar el nombre del artesano:', error));
    window.TEUI.markClean(productForm);

    // ── Inicializar ──
    ciudadesPromise = loadCiudades();
    categoriasPromise = loadCategorias();
    renderAdminTable();

    // ── Exponer funciones ──
    window.editProduct = editProduct;

    tableBody.addEventListener('click', event => {
        const editButton = event.target.closest('.btn-edit');
        const deleteButton = event.target.closest('.btn-delete');
        if (editButton && tableBody.contains(editButton)) {
            editProduct(editButton.dataset.id);
        } else if (deleteButton && tableBody.contains(deleteButton)) {
            handleDeleteProduct(deleteButton.dataset.id);
        }
    });

});