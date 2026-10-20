<?php
/**
 * planes/buscar.php
 * Búsqueda pública de planes turísticos disponibles por municipio, tipo y accesibilidad.
 */

require_once __DIR__ . '/../con_db/db.php';
require_once __DIR__ . '/../cors.php';
header('Content-Type: application/json; charset=utf-8');

function responderBusquedaPlanes(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    responderBusquedaPlanes(405, ['ok' => false, 'error' => 'Método no permitido.']);
}

$idCiudad = trim((string)($_GET['id_ciudad'] ?? ''));
if ($idCiudad !== '' && !preg_match('/^[A-Za-z0-9]{5,6}$/D', $idCiudad)) {
    responderBusquedaPlanes(400, ['ok' => false, 'error' => 'El municipio seleccionado no es válido.']);
}

$idTipoPlan = null;
if (isset($_GET['id_tipo_plan']) && $_GET['id_tipo_plan'] !== '') {
    $idTipoTexto = (string)$_GET['id_tipo_plan'];
    if (!preg_match('/^[1-9][0-9]?$/D', $idTipoTexto)) {
        responderBusquedaPlanes(400, ['ok' => false, 'error' => 'El tipo de plan seleccionado no es válido.']);
    }
    $idTipoPlan = (int)$idTipoTexto;
}

$accesibilidad = trim((string)($_GET['accesibilidad'] ?? ''));
if (strlen($accesibilidad) > 200) {
    responderBusquedaPlanes(400, ['ok' => false, 'error' => 'La opción de accesibilidad no es válida.']);
}

try {
    $stmt = $pdo->prepare(
        'SELECT fn_buscar_planes_publicos(:ciudad, :tipo_plan, :accesibilidad)::TEXT'
    );
    $stmt->execute([
        ':ciudad' => $idCiudad !== '' ? $idCiudad : null,
        ':tipo_plan' => $idTipoPlan,
        ':accesibilidad' => $accesibilidad !== '' ? $accesibilidad : null,
    ]);

    $data = json_decode($stmt->fetchColumn(), true, 512, JSON_THROW_ON_ERROR);
    if (!is_array($data)) {
        throw new RuntimeException('La función de búsqueda no devolvió una lista válida.');
    }
    responderBusquedaPlanes(200, ['ok' => true, 'data' => $data]);
} catch (Throwable $e) {
    error_log('[TourismEasy] planes/buscar.php - ' . $e->getMessage());
    responderBusquedaPlanes(500, ['ok' => false, 'error' => 'Error al buscar planes turísticos.']);
}
