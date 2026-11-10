<?php
declare(strict_types=1);
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Recorre en primera persona el mapa futurista de las siete provincias de Santander.">
    <meta name="theme-color" content="#080b12">
    <title>Metaverso de Santander - TourismEasy</title>
    <link rel="icon" type="image/png" href="../img/TURISMEASY.png">
    <link rel="stylesheet" href="metaverso.css">
</head>

<body>
    <main class="metaverso-app">
        <section class="experience-screen consent-screen" id="consentScreen" aria-labelledby="consentTitle">
            <div class="consent-content">
                <img class="consent-logo" src="../img/TURISMEASY.png" alt="Logo de TourismEasy">
                <p class="consent-eyebrow">Una experiencia TourismEasy</p>
                <h1 id="consentTitle">Experiencia 360° / Realidad Virtual</h1>
                <p class="consent-copy">
                    Para entrar al mundo 3D se cargará A-Frame desde un CDN, cuyo proveedor recibirá
                    tu dirección IP. No solicitamos acceso a tu cámara ni a tu micrófono; el visor
                    usará el seguimiento propio del dispositivo. Puedes revocar el permiso en cualquier momento.
                </p>
                <div class="consent-actions">
                    <button class="button button-primary" id="activateButton" type="button">Activar y continuar</button>
                    <a class="button button-secondary" href="../index.html">Volver al inicio</a>
                </div>
            </div>
        </section>

        <section class="experience-screen loader-screen" id="loaderScreen" aria-live="polite" hidden>
            <div class="loader-content">
                <div class="loader-logo" id="loaderLogo" role="img" aria-label="TourismEasy">
                    <img class="loader-logo-base" src="../img/TURISMEASY.png" alt="">
                    <div class="loader-logo-fill" id="loaderLogoFill">
                        <img src="../img/TURISMEASY.png" alt="">
                    </div>
                </div>
                <p class="loader-brand">TOURISMEASY</p>
                <h1 id="loaderTitle">Preparando el metaverso</h1>
                <p class="loader-status" id="loaderStatus">Conectando con la experiencia 3D...</p>
                <div class="progress-track" id="progressTrack" role="progressbar" aria-label="Carga del metaverso" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
                    <span class="progress-bar" id="progressBar"></span>
                </div>
                <p class="progress-value" id="progressValue">0%</p>
                <p class="loader-error" id="loaderError" role="alert" hidden></p>
                <button class="button button-primary retry-button" id="retryButton" type="button" hidden>Reintentar carga</button>
                <a class="loader-back-link" href="../index.html">Volver al inicio</a>
            </div>
        </section>

        <section class="world-screen" id="worldScreen" aria-label="Mapa interactivo de las provincias de Santander" hidden>
            <div class="scene-host" id="sceneHost"></div>
            <header class="world-header">
                <a class="world-brand" href="../index.html" aria-label="Volver a TourismEasy">
                    <img src="../img/TURISMEASY.png" alt="">
                    <span>TourismEasy <small>Santander inmersivo</small></span>
                </a>
                <div class="exploration-counter" aria-live="polite">
                    <span>Provincias</span>
                    <strong><span id="exploredCount">0</span>/<span id="provinceCount">0</span></strong>
                    <span class="counter-track"><span id="counterProgress"></span></span>
                </div>
            </header>

            <nav class="province-menu" id="provinceMenu" aria-label="Siete provincias de Santander"></nav>

            <section class="province-card" id="provinceCard" aria-live="polite" hidden>
                <button class="place-card-close" id="closeProvinceCard" type="button" aria-label="Cerrar información">×</button>
                <p class="place-card-eyebrow">Territorio activo</p>
                <h2 id="provinceTitle"></h2>
                <p class="province-capital" id="provinceCapital"></p>
                <p id="provinceDescription"></p>
                <h3>Municipios destacados</h3>
                <div class="municipality-list" id="municipalityList"></div>
            </section>

            <footer class="world-footer">
                <p>WASD: caminar · Espacio: saltar · Visor: joystick izquierdo para moverte y derecho para girar · Mira con ratón o cabeza</p>
                <button class="revoke-button" id="revokeButton" type="button">Revocar permiso</button>
            </footer>
        </section>
    </main>

    <script src="metaverso.js"></script>
</body>

</html>
