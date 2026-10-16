<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../cors.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método no permitido.']);
    exit;
}
if (($_SESSION['tipo'] ?? '') !== 'admin') {
    http_response_code(401);
    echo json_encode(['ok' => false, 'error' => 'No hay una sesión de administración activa.']);
    exit;
}

$_SESSION = [];
if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', [
        'expires' => time() - 42000,
        'path' => $params['path'],
        'domain' => $params['domain'],
        'secure' => $params['secure'],
        'httponly' => $params['httponly'],
        'samesite' => 'Lax',
    ]);
}
session_destroy();
echo json_encode(['ok' => true]);
