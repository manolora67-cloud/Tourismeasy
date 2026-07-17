<?php

session_start();

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
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Open+Sans:wght@400;500&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
    <link rel="icon" type="image/png" href="../img/TURISMEASY.png">
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
                <!-- Widget de sesión del artesano (nombre + cerrar sesión) -->
                <div id="artesanoWidget" class="artesano-widget">
                    <span id="artesanoNombre" class="artesano-nombre"></span>
                    <button class="btn-logout-artesano" id="btnLogoutArtesano">
                        <i class="fa-solid fa-right-from-bracket"></i> Salir
                    </button>
                </div>
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
                <span class="panel-badge"><i class="fa-solid fa-box"></i> <span id="badgeTotal">0 productos</span></span>
                <span class="panel-badge"><i class="fa-solid fa-tags"></i> <span id="badgeCategorias">0 categorías</span></span>
                <span class="panel-badge"><i class="fa-solid fa-location-dot"></i> <span id="badgeCiudades">0 ciudades</span></span>
            </div>
        </div>

        <!-- STATS -->
        <div class="panel-stats">
            <div class="stat-card">
                <div class="stat-icon stat-icon-purple"><i class="fa-solid fa-box-open"></i></div>
                <div class="stat-info">
                    <span class="stat-num" id="statTotal">0</span><span class="stat-label">Productos publicados</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon stat-icon-green"><i class="fa-solid fa-gem"></i></div>
                <div class="stat-info">
                    <span class="stat-num" id="statMasCaro">—</span><span class="stat-label">Tu producto más caro</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon stat-icon-blue"><i class="fa-solid fa-sack-dollar"></i></div>
                <div class="stat-info">
                    <span class="stat-num" id="statPromedio">$0</span><span class="stat-label">Precio promedio</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon stat-icon-orange"><i class="fa-solid fa-crown"></i></div>
                <div class="stat-info">
                    <span class="stat-num" id="statTopCategoria">—</span><span class="stat-label">Tu categoría más publicada</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon stat-icon-red"><i class="fa-solid fa-location-dot"></i></div>
                <div class="stat-info">
                    <span class="stat-num" id="statTopCiudad">—</span><span class="stat-label">Tu ciudad principal</span>
                </div>
            </div>
        </div>

        <!-- TABS -->
        <div class="panel-tabs">
            <button class="panel-tab active" data-tab="productos"><i class="fa-solid fa-box"></i> <span>Productos</span></button>
            <button class="panel-tab" data-tab="estadisticas"><i class="fa-solid fa-chart-pie"></i> <span>Estadísticas</span></button>
        </div>

        <!-- TAB: PRODUCTOS -->
        <div class="panel-content active" id="tab-productos">
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
                                <option value="talleres">Talleres</option>
                                <option value="bisuteria">Bisutería</option>
                                <option value="alfareria">Alfarería</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Precio (COP)</label>
                            <input type="number" id="price" placeholder="Ej: 85000" required />
                        </div>
                        <div class="form-group">
                            <label>Ubicación</label>
                            <select id="ubicacion" required>
                                <option value="">Selecciona una ciudad</option>
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
                                <option value="talleres">Talleres</option>
                                <option value="bisuteria">Bisutería</option>
                                <option value="alfareria">Alfarería</option>
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
    </main>

    <script src="../componentes/dark-mode-toggle.js"></script>
    <script src="../js/admin.js"></script>
    <script src="../js/santanderianidad.js"></script>
</body>

</html>