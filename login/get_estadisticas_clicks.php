<?php
require_once __DIR__ . '/../con_db/sesion_persistente.php';
iniciarSesionPersistente();
require_once __DIR__ . '/../con_db/db.php';
require_once __DIR__ . '/../cors.php';

header('Content-Type: application/json; charset=utf-8');

function responderEstadisticasClicks(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    responderEstadisticasClicks(405, ['ok' => false, 'error' => 'Método no permitido.']);
}

$tipo = $_SESSION['tipo'] ?? '';
$idEmpresa = $tipo === 'empresa' ? ($_SESSION['id_empresa'] ?? null) : null;
if ($tipo !== 'admin' && (!is_string($idEmpresa) || $idEmpresa === '')) {
    responderEstadisticasClicks(401, ['ok' => false, 'error' => 'No autorizado.']);
}

try {
    $stmt = $pdo->prepare(
        'SELECT fn_estadisticas_clicks(CAST(:id_empresa AS VARCHAR(10)))::TEXT'
    );
    $stmt->execute([':id_empresa' => $idEmpresa]);
    $estadisticas = json_decode($stmt->fetchColumn(), true, 512, JSON_THROW_ON_ERROR);
    if (
        !is_array($estadisticas)
        || !is_array($estadisticas['resumen'] ?? null)
        || !is_array($estadisticas['por_categoria'] ?? null)
        || !is_array($estadisticas['por_producto'] ?? null)
        || !is_array($estadisticas['por_empresa'] ?? null)
        || !is_array($estadisticas['recientes'] ?? null)
    ) {
        throw new RuntimeException('La función de estadísticas no devolvió un objeto válido.');
    }

    responderEstadisticasClicks(200, [
        'ok' => true,
        'rol' => $tipo,
        'resumen' => $estadisticas['resumen'],
        'por_categoria' => $estadisticas['por_categoria'],
        'por_producto' => $estadisticas['por_producto'],
        'por_empresa' => $estadisticas['por_empresa'],
        'recientes' => $estadisticas['recientes'],
    ]);
} catch (Throwable $e) {
    error_log('[TourismEasy] get_estadisticas_clicks.php - ' . $e->getMessage());
    responderEstadisticasClicks(500, ['ok' => false, 'error' => 'No se pudieron cargar las estadísticas de clics.']);
}
