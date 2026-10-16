<?php
/**
 * hospedaje/eliminar.php
 * Elimina un hospedaje que pertenece a la empresa en sesión,
 * usando fn_eliminar_hospedaje().
 */

session_start();
require_once __DIR__ . '/../con_db/db.php';

require_once __DIR__ . '/../cors.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método no permitido.']);
    exit;
}

if (empty($_SESSION['id_empresa']) || ($_SESSION['tipo'] ?? '') !== 'empresa') {
    http_response_code(401);
    echo json_encode(["ok" => false, "error" => "No autorizado."]);
    exit;
}

$id_empresa = $_SESSION['id_empresa'];
$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'JSON inválido.']);
    exit;
}
$id = filter_var($input['id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);

if (!$id) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "ID inválido."]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT fn_eliminar_hospedaje(:id, :emp)::TEXT");
    $stmt->execute([':id' => $id, ':emp' => $id_empresa]);

    if (!filter_var($stmt->fetchColumn(), FILTER_VALIDATE_BOOLEAN)) {
        echo json_encode(["ok" => false, "error" => "Registro no encontrado o no pertenece a tu empresa."]);
        exit;
    }

    echo json_encode(["ok" => true, "mensaje" => "Hospedaje eliminado."]);

} catch (PDOException $e) {
    error_log('[TourismEasy] hospedaje/eliminar.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "Error al eliminar."]);
}
