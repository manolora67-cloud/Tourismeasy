<?php

require_once __DIR__ . '/../con_db/sesion_persistente.php';
iniciarSesionPersistente();
require_once __DIR__ . '/../con_db/db.php';

// Evita que el navegador guarde una "foto" cacheada de esta página.
// Sin esto, el botón "atrás" puede mostrar una versión vieja de admin.php
// (o de otra página) sin volver a pasar por el session_start() de arriba,
// que es el que de verdad decide si sigues logueado o no.
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

if (empty($_SESSION['artesano_id'])) {
    // Le avisamos al navegador con ?sesion_expirada=1 para que login-ecommerce.js
    // borre el sessionStorage viejo. Sin esto, si el sessionStorage del navegador
    // quedó con datos de una sesión que ya no es válida en el servidor, se arma
    // un loop infinito: login_ecommerce.html cree que hay sesión y manda para acá,
    // acá no hay sesión de verdad y manda de vuelta a login_ecommerce.html, y así.
    header('Location: ../html/login_ecommerce.html?sesion_expirada=1');
    exit;
}

// Disponible para el HTML de abajo si en algún momento lo necesitas
// (por ejemplo, para imprimir el nombre desde PHP en vez de JS).
$artesanoNombreSesion = $_SESSION['artesano_nombre'] ?? 'Artesano';
?>
<!doctype html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="../js/control_tiempo_sesion.js?v=secure-session-v4"></script>
    <title>Panel de Productos - TourismEasy</title>
    <script>
        // Bloquea la flecha "atrás" del navegador mientras el artesano tiene sesión activa.
        // Empuja el propio estado una y otra vez, así "atrás" siempre te deja en esta misma página.
        // Solo cerrar sesión (btnLogoutArtesano -> logout_artesano.php) saca de aquí de verdad.
        history.pushState(null, null, location.href);
        window.addEventListener('popstate', function () {
            history.pushState(null, null, location.href);
        });
        // Si el navegador restaura esta página desde su caché de atrás/adelante
        // (pasa mucho en Chrome/Safari al usar el botón atrás), forzamos una
        // recarga real para que el servidor vuelva a validar la sesión.
        window.addEventListener('pageshow', function (event) {
            if (event.persisted) {
                window.location.reload();
            }
        });
    </script>
    <link rel="stylesheet" href="../css/e-comemerce.css" />
    <link rel="stylesheet" href="../css/admin.css" />
    <link rel="stylesheet" href="../componentes/menu-sesion.css?v=session-menu-v1" />
    <link rel="stylesheet" href="../componentes/cambio-contrasena.css?v=password-change-v1" />
    <link rel="stylesheet" href="../css/click_metrics.css" />
    <link rel="stylesheet" href="../css/agente-ia.css?v=mobile-layout-v2" />
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Open+Sans:wght@400;500&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
    <link rel="icon" type="image/png" href="../img/TURISMEASY.png">
    <script src="../componentes/ui-feedback.js?v=ui-feedback-v4"></script>
</head>

<body>
    <!-- NAVBAR -->
    <nav class="navbar">
        <div class="nav-container">
            <a href="javascript:location.reload()" class="nav-logo" title="Refrescar panel">
                <img src="../img/TURISMEASY.png" alt="TourismEasy Logo" class="logo-img" />
                <span class="logo-text">TOURISMEASY</span>
            </a>
            <span class="panel-navbar-label"><i class="fa-solid fa-palette"></i> Mi Panel de Productos</span>
            <div class="nav-slot">
                <div id="sessionWidgetSlot" data-role="artesano" data-root="../" data-active="panel"></div>
                <div id="dark-mode-toggle"></div>
            </div>
        </div>
    </nav>

    <main class="panel-main">
        <!-- HEADER -->
        <div class="panel-header">
            <div class="panel-header-info">
                <div class="panel-empresa-avatar"><i class="fa-solid fa-shop"></i></div>
                <div>
                    <h1 class="panel-empresa-nombre">Mi Panel de Productos</h1>
                    <p class="panel-empresa-sub">Crea, edita y elimina tus productos, y revisa cómo les está yendo</p>
                </div>
            </div>
            <div class="panel-header-badges">
                <span class="panel-badge"><i class="fa-solid fa-box"></i> <span id="badgeTotal">Cargando…</span></span>
                <span class="panel-badge"><i class="fa-solid fa-tags"></i> <span id="badgeCategorias">Cargando…</span></span>
                <span class="panel-badge"><i class="fa-solid fa-location-dot"></i> <span id="badgeCiudades">Cargando…</span></span>
            </div>
        </div>

        <!-- STATS -->
        <div class="panel-stats">
            <div class="stat-card">
                <div class="stat-icon stat-icon-purple"><i class="fa-solid fa-box-open"></i></div>
                <div class="stat-info">
                    <span class="stat-num" id="statTotal">Cargando…</span><span class="stat-label">Productos publicados</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon stat-icon-green"><i class="fa-solid fa-gem"></i></div>
                <div class="stat-info">
                    <span class="stat-num" id="statMasCaro">Cargando…</span><span class="stat-label">Tu producto más caro</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon stat-icon-teal"><i class="fa-solid fa-tag"></i></div>
                <div class="stat-info">
                    <span class="stat-num" id="statMasBarato">Cargando…</span><span class="stat-label">Tu producto más económico</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon stat-icon-blue"><i class="fa-solid fa-sack-dollar"></i></div>
                <div class="stat-info">
                    <span class="stat-num" id="statPromedio">Cargando…</span><span class="stat-label">Precio promedio</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon stat-icon-orange"><i class="fa-solid fa-crown"></i></div>
                <div class="stat-info">
                    <span class="stat-num" id="statTopCategoria">Cargando…</span><span class="stat-label">Tu categoría más publicada</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon stat-icon-green"><i class="fa-brands fa-whatsapp"></i></div>
                <div class="stat-info">
                    <span class="stat-num" data-clicks-total>Cargando…</span><span class="stat-label">Clics de WhatsApp</span>
                </div>
            </div>
        </div>

        <!-- TABS -->
        <div class="panel-tabs">
            <button class="panel-tab active" data-tab="productos"><i class="fa-solid fa-box"></i> <span>Productos</span></button>
            <button class="panel-tab" data-tab="estadisticas"><i class="fa-solid fa-chart-pie"></i> <span>Estadísticas</span></button>
            <button class="panel-tab" data-tab="configuracion"><i class="fa-solid fa-gear"></i> <span>Configuración</span></button>
        </div>

        <!-- TAB: PRODUCTOS -->
        <div class="panel-content active" id="tab-productos">
            <section
                class="click-metrics"
                data-clicks-dashboard
                data-clicks-dashboard-template
                data-title="Clics de WhatsApp"
                data-description="Revisa cuántas veces las personas abrieron WhatsApp desde tus productos."
                aria-label="Clics de WhatsApp de mis productos"></section>
            <div class="admin-grid">
                <div class="form-container">
                    <h2 id="form-title">Registrar Nuevo Producto</h2>
                    <form id="product-form" enctype="multipart/form-data">
                        <input type="hidden" id="product-id" />
                        <div class="form-group">
                            <label>Nombre</label>
                            <input type="text" id="name" placeholder="Ej: Taller de Cerámica Guane" required />
                        </div>
                        <div class="form-group">
                            <label>Proveedor / Artesano</label>
                            <input type="text" id="provider" placeholder="Ej: Artesanías Barichara" required />
                        </div>
                        <div class="form-group">
                            <label>Categoría</label>
                            <select id="category">
                                <option value="">Cargando categorías…</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Precio (COP)</label>
                            <input type="number" id="price" placeholder="Ej: 85000" required />
                        </div>
                        <div class="form-group">
                            <label>Ubicación</label>
                            <select id="ubicacion" required disabled>
                                <option value="">Cargando ciudades…</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Teléfono de contacto</label>
                            <input type="text" id="contacto" placeholder="Ej: 3102345678" required />
                        </div>
                        <div class="form-group">
                            <label>Imagen del Producto</label>
                            <input type="file" id="img-file" accept="image/*" />
                            <input type="hidden" id="img-base64" />
                            <div id="preview-container" style="display: none; margin-top: 10px">
                                <img id="img-preview-form" class="img-preview" src="" style="width: 100px; height: 100px" />
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Descripción</label>
                            <textarea id="description" rows="3" placeholder="Describe el producto o taller con detalle…" required></textarea>
                        </div>
                        <button type="submit" class="btn-submit" id="btn-save">
                            Publicar Producto
                        </button>
                        <button type="button" id="btn-cancel" style="display: none; margin-top: 10px; background: #666" class="btn-submit">
                            Cancelar Edición
                        </button>
                    </form>
                </div>

                <div class="table-container">
                    <div class="panel-content-header">
                        <h2><i class="fa-solid fa-list"></i> Mis productos</h2>
                        <div class="panel-filter">
                            <select class="panel-select" id="filterCategoria">
                                <option value="">Todas las categorías</option>
                            </select>
                        </div>
                    </div>
                    <div id="loading-indicator" style="text-align: center; padding: 20px;">
                        <i class="fa-solid fa-spinner fa-spin"></i> Cargando productos...
                    </div>
                    <div class="panel-table-wrap">
                        <table class="panel-table">
                            <thead>
                                <tr>
                                    <th>Imagen</th>
                                    <th>Nombre</th>
                                    <th>Categoría</th>
                                    <th>Precio</th>
                                    <th>Ubicación</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="admin-table-body"></tbody>
                        </table>
                    </div>
                    <nav class="pagination panel-product-pagination" id="productosPaginacion" aria-label="Paginación de productos" hidden></nav>
                </div>
            </div>
        </div>

        <!-- TAB: ESTADÍSTICAS -->
        <div class="panel-content" id="tab-estadisticas">
            <div class="panel-content-header">
                <h2><i class="fa-solid fa-chart-pie"></i> Estadísticas de mis productos</h2>
            </div>

            <div class="stats-grid-2col">
                <div class="chart-card">
                    <h3><i class="fa-solid fa-tags"></i> Productos por categoría</h3>
                    <div id="chartCategorias" class="bar-chart"></div>
                </div>
                <div class="chart-card">
                    <h3><i class="fa-solid fa-location-dot"></i> Productos por ciudad</h3>
                    <div id="chartCiudades" class="bar-chart"></div>
                </div>
            </div>

            <div class="chart-card" style="margin-top: 20px;">
                <h3><i class="fa-solid fa-ranking-star"></i> Tus productos con mayor precio</h3>
                <div id="rankPrecios"></div>
                <div class="chart-empty" id="rankPreciosEmpty" style="display:none;">
                    <i class="fa-solid fa-box-open"></i>
                    <p>Aún no tienes productos publicados.</p>
                </div>
            </div>
        </div>

        <!-- TAB: CONFIGURACIÓN -->
        <div class="panel-content" id="tab-configuracion">
            <div class="panel-content-header">
                <h2><i class="fa-solid fa-gear"></i> Configuración de la cuenta</h2>
            </div>
            <div class="artisan-settings-grid">
                <section class="artisan-settings-card" aria-labelledby="artisanContactTitle">
                    <h3 id="artisanContactTitle"><i class="fa-solid fa-address-card"></i> Datos de contacto</h3>
                    <p class="artisan-settings-card__description">Mantén actualizado el correo para iniciar sesión y recibir avisos, y el teléfono de contacto de tu cuenta.</p>
                    <form id="artisanContactForm" class="artisan-settings-form" aria-busy="true">
                        <div class="form-group">
                            <label for="artisanContactEmail">Correo de acceso y contacto</label>
                            <input id="artisanContactEmail" name="email" type="email" autocomplete="email" maxlength="254" required disabled>
                        </div>
                        <div class="form-group">
                            <label for="artisanContactPhone">Teléfono / WhatsApp</label>
                            <input id="artisanContactPhone" name="telefono" type="tel" inputmode="tel" autocomplete="tel" pattern="\+?[0-9]{7,15}" title="Usa entre 7 y 15 dígitos; puedes iniciar con +." required disabled>
                        </div>
                        <p class="artisan-settings-note">Si cambias el correo, también cambiará el que usas para iniciar sesión y recuperar tu cuenta.</p>
                        <p class="artisan-settings-status" id="artisanContactStatus" role="status" aria-live="polite" hidden></p>
                        <button class="btn-submit" id="artisanContactSubmit" type="submit" disabled>Guardar datos de contacto</button>
                    </form>
                </section>

                <section class="artisan-settings-card" aria-labelledby="artisanAccountTitle">
                    <h3 id="artisanAccountTitle"><i class="fa-solid fa-id-card"></i> Mi cuenta</h3>
                    <p class="artisan-settings-card__description">Información registrada en TourismEasy.</p>
                    <dl class="artisan-account-details">
                        <div><dt>Nombre</dt><dd id="artisanAccountName">Cargando…</dd></div>
                        <div><dt>Documento</dt><dd id="artisanAccountId">Cargando…</dd></div>
                        <div><dt>Estado</dt><dd id="artisanAccountStatus">Cargando…</dd></div>
                        <div><dt>Miembro desde</dt><dd id="artisanAccountCreated">Cargando…</dd></div>
                    </dl>
                </section>

                <section class="artisan-settings-card artisan-settings-card--security" aria-labelledby="artisanPasswordSettingsTitle">
                    <h3 id="artisanPasswordSettingsTitle"><i class="fa-solid fa-shield-halved"></i> Seguridad de la cuenta</h3>
                    <div class="artisan-security-content">
                        <div>
                            <strong>Cambiar contraseña</strong>
                            <p class="artisan-settings-card__description">El administrador configura el límite mensual de cambios correctos. Los restablecimientos mediante el enlace del correo no consumen esos cambios.</p>
                        </div>
                        <button class="te-password-settings__trigger" type="button" data-password-change
                            data-password-endpoint="actualizar_contrasena_artesano.php">Cambiar contraseña</button>
                    </div>
                </section>
            </div>
        </div>
    </main>

    <script src="../componentes/dark-mode-toggle.js"></script>
    <script src="../componentes/click-metrics-dashboard.js?v=click-metrics-v2"></script>
    <script src="../js/metricas_clics.js"></script>
    <script src="../componentes/paginacion.js"></script>
    <script src="../componentes/menu-sesion.js?v=session-menu-v1"></script>
    <script>window.TESessionMenu.mount();</script>
    <script src="../js/admin.js?v=secure-session-v1"></script>
    <script src="../componentes/cambio-contrasena.js?v=password-change-v1"></script>
    <script src="../js/configuracion_artesano.js?v=artisan-settings-v1"></script>
    <script src="../js/santanderianidad.js"></script>
    <script src="../componentes/agente-ia.js?v=private-chat-memory-v1"></script>
    <script src="../menu_accesibilidad/menu.js?v=a11y-v14"></script>
</body>

</html>