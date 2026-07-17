<?php
/**
 * e-commerce/logout_artesano.php
 * Cierra la sesión de servidor del artesano.
 * Borrar sessionStorage en el navegador (lo que hacía antes btnLogoutArtesano)
 * solo le oculta la sesión a ESE navegador: la cookie de sesión seguiría
 * siendo válida hasta que el servidor la destruya de verdad, que es lo que
 * hace este endpoint.
 */

session_start();

header('Content-Type: application/json');
require_once __DIR__ . '/../cors.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método no permitido.']);
    exit;
}

$_SESSION = [];

if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        '',
        time() - 42000,
        $params['path'],
        $params['domain'],
        $params['secure'],
        $params['httponly']
    );
}

session_destroy();

echo json_encode(['ok' => true]);
