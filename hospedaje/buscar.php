<?php
/**
 * hospedaje/buscar.php
 * Búsqueda pública de hospedajes publicados por municipio, accesibilidad y capacidad.
 */

require_once __DIR__ . '/../con_db/db.php';
require_once __DIR__ . '/../cors.php';
header('Content-Type: application/json; charset=utf-8');

function responderBusquedaHospedaje(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    responderBusquedaHospedaje(405, ['ok' => false, 'error' => 'Método no permitido.']);
}

$idCiudad = trim((string)($_GET['id_ciudad'] ?? ''));
if ($idCiudad !== '' && !preg_match('/^[A-Za-z0-9]{5,6}$/D', $idCiudad)) {
    responderBusquedaHospedaje(400, ['ok' => false, 'error' => 'El municipio seleccionado no es válido.']);
}

$accesibilidad = trim((string)($_GET['accesibilidad'] ?? ''));
if (strlen($accesibilidad) > 200) {
    responderBusquedaHospedaje(400, ['ok' => false, 'error' => 'La opción de accesibilidad no es válida.']);
}

$capacidad = null;
if (isset($_GET['capacidad']) && $_GET['capacidad'] !== '') {
    $capacidadTexto = (string)$_GET['capacidad'];
    if (!preg_match('/^(?:[1-9]|1[0-9]|20)$/D', $capacidadTexto)) {
        responderBusquedaHospedaje(400, ['ok' => false, 'error' => 'La capacidad solicitada debe estar entre 1 y 20 personas.']);
    }
    $capacidad = (int)$capacidadTexto;
}

try {
    $stmt = $pdo->prepare(
        'SELECT fn_buscar_hospedaje_publico(:ciudad, :accesibilidad, :capacidad)::TEXT'
    );
    $stmt->execute([
        ':ciudad' => $idCiudad !== '' ? $idCiudad : null,
        ':accesibilidad' => $accesibilidad !== '' ? $accesibilidad : null,
        ':capacidad' => $capacidad,
    ]);

    $data = json_decode($stmt->fetchColumn(), true, 512, JSON_THROW_ON_ERROR);
    if (!is_array($data)) {
        throw new RuntimeException('La función de búsqueda no devolvió una lista válida.');
    }
    responderBusquedaHospedaje(200, ['ok' => true, 'data' => $data]);
} catch (Throwable $e) {
    error_log('[TourismEasy] hospedaje/buscar.php - ' . $e->getMessage());
    responderBusquedaHospedaje(500, ['ok' => false, 'error' => 'Error al buscar hospedajes.']);
}
