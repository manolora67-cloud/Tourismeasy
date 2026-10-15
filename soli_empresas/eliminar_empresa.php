<?php
/**
 * soli_empresas/eliminar_empresa.php
 * Elimina una empresa permanentemente, vía fn_eliminar_empresa()
 * (bloquea el borrado si la empresa todavía tiene servicios publicados;
 * registra la auditoría internamente).
 * Espera JSON: { "nit": "1234567890" }
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

$input = json_decode(file_get_contents('php://input'), true);
$nit   = trim($input['nit'] ?? '');

if (!$nit) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "NIT requerido."]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM fn_eliminar_empresa(:nit, :admin)");
    $stmt->execute([':nit' => $nit, ':admin' => $idAdmin]);
    $row = $stmt->fetch();

    if (!$row['ok']) {
        echo json_encode(["ok" => false, "error" => $row['mensaje']]);
        exit;
    }

    echo json_encode(["ok" => true, "mensaje" => $row['mensaje']]);

} catch (PDOException $e) {
    error_log('[TourismEasy] eliminar_empresa.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "Error al eliminar la empresa."]);
}
