<?php
/**
 * auxiliar/eliminar.php
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
    $stmt = $pdo->prepare("
        DELETE FROM PERSONAL_AUXILIAR
        WHERE ID_PERSONAL_AUXILIAR = :id AND ID_EMPRESA = :emp
    ");
    $stmt->execute([':id' => $id, ':emp' => $id_empresa]);

    if ($stmt->rowCount() === 0) {
        echo json_encode(["ok" => false, "error" => "Registro no encontrado o no pertenece a tu empresa."]);
        exit;
    }

    echo json_encode(["ok" => true, "mensaje" => "Personal auxiliar eliminado."]);

} catch (PDOException $e) {
    error_log('[TourismEasy] auxiliar/eliminar.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "Error al eliminar."]);
}