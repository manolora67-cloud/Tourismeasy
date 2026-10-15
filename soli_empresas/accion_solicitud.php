<?php
/**
 * soli_empresas/accion_solicitud.php
 * Aprueba o rechaza una solicitud de empresa, vía fn_actualizar_solicitud_empresa()
 * (que registra la auditoría internamente).
 * Espera JSON: { "nit": "1234567890", "accion": "APROBAR" | "RECHAZAR" }
 */

session_start();
require_once __DIR__ . '/../con_db/db.php';

header('Content-Type: application/json');
require_once __DIR__ . '/../cors.php';

if (empty($_SESSION['tipo']) || $_SESSION['tipo'] !== 'admin') {
    http_response_code(401);
    echo json_encode(["ok" => false, "error" => "No autorizado."]);
    exit;
}

$idAdmin = $_SESSION['id_persona'];

$input  = json_decode(file_get_contents('php://input'), true);
$nit    = trim($input['nit']    ?? '');
$accion = strtoupper(trim($input['accion'] ?? ''));

if (!$nit || !in_array($accion, ['APROBAR', 'RECHAZAR'])) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "Parámetros inválidos."]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM fn_actualizar_solicitud_empresa(:nit, :accion, :admin)");
    $stmt->execute([':nit' => $nit, ':accion' => $accion, ':admin' => $idAdmin]);
    $row = $stmt->fetch();

    if (!$row['ok']) {
        echo json_encode(["ok" => false, "error" => $row['mensaje']]);
        exit;
    }

    echo json_encode(["ok" => true, "mensaje" => $row['mensaje']]);

} catch (PDOException $e) {
    error_log('[TourismEasy] accion_solicitud.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "Error al procesar la solicitud."]);
}
