<?php
/**
 * cors.php
 * Helper centralizado de CORS para TourismEasy en servidor.
 * Incluir con: require_once __DIR__ . '/../cors.php';
 * (o ajustar la ruta según la profundidad del archivo)
 */

$ALLOWED_ORIGINS = [
    'https://web.adsoserver.site',
    'http://10.5.211.11',           // acceso directo por IP en la red interna
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = in_array($origin, $ALLOWED_ORIGINS) ? $origin : $ALLOWED_ORIGINS[0];

header("Access-Control-Allow-Origin: $allowed");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
