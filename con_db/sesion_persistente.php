<?php
function iniciarSesionPersistente(): void
{
    $duracion = 10 * 60;
    $seguro = sesionPersistenteUsaHttps();

    ini_set('session.gc_maxlifetime', (string) $duracion);
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    session_set_cookie_params([
        'lifetime' => $duracion,
        'path' => '/',
        'secure' => $seguro,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();

    if (!sesionPersistenteTieneCuentaActiva()) {
        return;
    }

    $ultimaActividad = $_SESSION['te_ultima_actividad'] ?? 0;
    if (!is_int($ultimaActividad) || time() - $ultimaActividad >= $duracion) {
        $_SESSION = [];
        session_regenerate_id(true);
        return;
    }

    renovarCookieSesionPersistente();
}

function sesionPersistenteUsaHttps(): bool
{
    $https = strtolower(trim((string) ($_SERVER['HTTPS'] ?? '')));
    $forwardedProto = strtolower(trim(explode(',', (string) ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? ''))[0]));

    return in_array($https, ['on', '1', 'https'], true)
        || (string) ($_SERVER['SERVER_PORT'] ?? '') === '443'
        || $forwardedProto === 'https';
}

function sesionPersistenteTieneCuentaActiva(): bool
{
    return !empty($_SESSION['tipo']) || !empty($_SESSION['artesano_id']);
}

function renovarCookieSesionPersistente(): void
{
    if (session_status() !== PHP_SESSION_ACTIVE || !ini_get('session.use_cookies')) {
        return;
    }

    $params = session_get_cookie_params();
    setcookie(session_name(), session_id(), [
        'expires' => time() + (10 * 60),
        'path' => $params['path'],
        'domain' => $params['domain'],
        'secure' => $params['secure'],
        'httponly' => $params['httponly'],
        'samesite' => 'Lax',
    ]);
}
