<?php
/**
 * e-commerce/buscar.php
 * Búsqueda pública de productos por texto, categoría y municipio.
 */

require_once __DIR__ . '/../con_db/db.php';
require_once __DIR__ . '/../cors.php';
header('Content-Type: application/json; charset=utf-8');

function responderBusquedaProductos(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    responderBusquedaProductos(405, ['ok' => false, 'error' => 'Método no permitido.']);
}

$busqueda = trim((string)($_GET['q'] ?? ''));
if (mb_strlen($busqueda, 'UTF-8') > 100) {
    responderBusquedaProductos(400, ['ok' => false, 'error' => 'La búsqueda no puede superar 100 caracteres.']);
}

$categoria = trim((string)($_GET['categoria'] ?? ''));
if ($categoria !== '' && !in_array($categoria, ['talleres', 'bisuteria', 'alfareria'], true)) {
    responderBusquedaProductos(400, ['ok' => false, 'error' => 'La categoría seleccionada no es válida.']);
}

$idCiudad = trim((string)($_GET['id_ciudad'] ?? ''));
if ($idCiudad !== '' && !preg_match('/^[A-Za-z0-9]{5,6}$/D', $idCiudad)) {
    responderBusquedaProductos(400, ['ok' => false, 'error' => 'El municipio seleccionado no es válido.']);
}

try {
    $stmt = $pdo->prepare(
        'SELECT * FROM fn_buscar_productos_publicos(:busqueda, :categoria, :ciudad)'
    );
    $stmt->execute([
        ':busqueda' => $busqueda !== '' ? $busqueda : null,
        ':categoria' => $categoria !== '' ? $categoria : null,
        ':ciudad' => $idCiudad !== '' ? $idCiudad : null,
    ]);
    responderBusquedaProductos(200, ['ok' => true, 'data' => $stmt->fetchAll()]);
} catch (Throwable $e) {
    error_log('[TourismEasy] e-commerce/buscar.php - ' . $e->getMessage());
    responderBusquedaProductos(500, ['ok' => false, 'error' => 'Error al buscar productos.']);
}
