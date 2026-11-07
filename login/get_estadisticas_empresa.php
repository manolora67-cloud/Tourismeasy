<?php
/**
 * login/get_estadisticas_empresa.php
 * Devuelve estadísticas reales de los servicios y contactos de la empresa autenticada.
 */

require_once __DIR__ . '/../con_db/sesion_persistente.php';
iniciarSesionPersistente();
require_once __DIR__ . '/../con_db/db.php';

header('Content-Type: application/json');
require_once __DIR__ . '/../cors.php';

$id = ($_SESSION['tipo'] ?? '') === 'empresa' ? ($_SESSION['id_empresa'] ?? '') : '';

if (!$id) {
    http_response_code(401);
    echo json_encode(["ok" => false, "error" => "No autorizado."]);
    exit;
}

try {
    $stmt = $pdo->prepare('SELECT * FROM fn_estadisticas_empresa(:id)');
    $stmt->execute([':id' => $id]);
    $estadistica = $stmt->fetch();
    if (!$estadistica) {
        http_response_code(404);
        echo json_encode(["ok" => false, "error" => "Empresa no encontrada."]);
        exit;
    }

    $tipo = strtoupper((string) $estadistica['tipo']);
    $labels = [
        'TRANSPORTE' => ['Rutas activas', 'Rutas registradas'],
        'HOSPEDAJE' => ['Hospedajes disponibles', 'Hospedajes registrados'],
        'PLANES' => ['Planes activos', 'Planes registrados'],
    ];
    [$activosLabel, $totalLabel] = $labels[$tipo] ?? ['Servicios activos', 'Servicios registrados'];

    echo json_encode([
        "ok" => true,
        "estadisticas" => [
            "servicios_publicados" => (int)$estadistica['servicios_publicados'],
            "servicios_label" => $activosLabel,
            "servicios_totales" => (int)$estadistica['servicios_totales'],
            "servicios_totales_label" => $totalLabel,
            "clics_whatsapp_30_dias" => (int)$estadistica['clics_whatsapp_30_dias'],
        ]
    ]);

} catch (PDOException $e) {
    error_log('[TourismEasy] get_estadisticas_empresa.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => $e->getMessage()]);
}