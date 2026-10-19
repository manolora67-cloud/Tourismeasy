<?php
/**
 * planes/eliminar.php
 * Elimina un plan turístico que pertenece a la empresa en sesión,
 * usando fn_eliminar_plan().
 */

require_once __DIR__ . '/../con_db/sesion_persistente.php';
iniciarSesionPersistente();
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
$id_entrada = $input['id'] ?? null;
$id = (is_string($id_entrada) || is_int($id_entrada)) ? trim((string)$id_entrada) : '';

if (!preg_match('/^[1-9][0-9]{0,9}$/D', $id)) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "ID inválido."]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT fn_eliminar_plan(:id, :emp)");
    $stmt->execute([':id' => $id, ':emp' => $id_empresa]);

    if (!$stmt->fetchColumn()) {
        echo json_encode(["ok" => false, "error" => "Registro no encontrado o no pertenece a tu empresa."]);
        exit;
    }

    echo json_encode(["ok" => true, "mensaje" => "Plan eliminado."]);

} catch (PDOException $e) {
    error_log('[TourismEasy] planes/eliminar.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "Error al eliminar."]);
}
