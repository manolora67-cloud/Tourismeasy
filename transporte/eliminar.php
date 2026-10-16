<?php
/**
 * transporte/eliminar.php
 * Elimina una ruta de transporte que pertenece a la empresa en sesión,
 * usando fn_eliminar_transporte(). Como esa función exige que la ruta
 * esté DISPONIBILIDAD = FALSE antes de borrarla, aquí la desactivamos
 * automáticamente con fn_toggle_disponibilidad_transporte() si hace falta,
 * para que "Eliminar" siga siendo un solo clic desde el panel.
 */

session_start();
require_once __DIR__ . '/../con_db/db.php';

require_once __DIR__ . '/../cors.php';
header('Content-Type: application/json');

if (empty($_SESSION['id_empresa']) || ($_SESSION['tipo'] ?? '') !== 'empresa') {
    http_response_code(401);
    echo json_encode(["ok" => false, "error" => "No autorizado."]);
    exit;
}

$id_empresa = $_SESSION['id_empresa'];
$input = json_decode(file_get_contents('php://input'), true);
$id = intval($input['id'] ?? 0);

if (!$id) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "ID inválido."]);
    exit;
}

try {
    $stmt = $pdo->prepare('SELECT fn_eliminar_transporte_empresa(:id, :emp)');
    $stmt->execute([':id' => $id, ':emp' => $id_empresa]);
    if (!in_array($stmt->fetchColumn(), [true, 't', 'true', '1', 1], true)) {
        echo json_encode(["ok" => false, "error" => "No se pudo eliminar la ruta."]);
        exit;
    }

    echo json_encode(["ok" => true, "mensaje" => "Ruta eliminada."]);

} catch (PDOException $e) {
    error_log('[TourismEasy] transporte/eliminar.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "Error al eliminar."]);
}
