<?php
function iniciarSesionPersistente(): void
{
    $dias = 30;
    $horas = $dias * 24;
    $duracion = $horas * 3600;
    $seguro = (!empty($_SERVER['HTTPS']) && strtolower((string) $_SERVER['HTTPS']) !== 'off')
        || (string) ($_SERVER['SERVER_PORT'] ?? '') === '443';

    ini_set('session.gc_maxlifetime', (string) $duracion);
    session_set_cookie_params([
        'lifetime' => $duracion,
        'path' => '/',
        'secure' => $seguro,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
    setcookie(session_name(), session_id(), [
        'expires' => time() + $duracion,
        'path' => '/',
        'secure' => $seguro,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}
