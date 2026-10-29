<?php
/**
 * transporte/eliminar.php
 * Elimina una ruta de transporte que pertenece a la empresa en sesión,
 * usando fn_eliminar_transporte(). Como esa función exige que la ruta
 * esté DISPONIBILIDAD = FALSE antes de borrarla, aquí la desactivamos
 * automáticamente con fn_toggle_disponibilidad_transporte() si hace falta,
 * para que "Eliminar" siga siendo un solo clic desde el panel.
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
    $pdo->beginTransaction();
    $stmt = $pdo->prepare(
        'SELECT DISPONIBILIDAD
         FROM TRANSPORTE
         WHERE ID_TRANSPORTE = :id AND ID_EMPRESA = :emp
         FOR UPDATE'
    );
    $stmt->execute([':id' => $id, ':emp' => $id_empresa]);
    $ruta = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($ruta === false) {
        $pdo->rollBack();
        http_response_code(404);
        echo json_encode(["ok" => false, "error" => "La ruta no existe o no pertenece a tu empresa."]);
        exit;
    }

    $disponible = $ruta['disponibilidad'];
    if (in_array($disponible, [true, 't', 'true', '1', 1], true)) {
        $stmt = $pdo->prepare('SELECT fn_toggle_disponibilidad_transporte(:id, :emp)');
        $stmt->execute([':id' => $id, ':emp' => $id_empresa]);
        $desactivada = $stmt->fetchColumn();
        if (!in_array($desactivada, [true, 't', 'true', '1', 1], true)) {
            $pdo->rollBack();
            http_response_code(409);
            echo json_encode(["ok" => false, "error" => "No se pudo desactivar la ruta antes de eliminarla."]);
            exit;
        }
    }

    $stmt = $pdo->prepare('SELECT fn_eliminar_transporte_empresa(:id, :emp)');
    $stmt->execute([':id' => $id, ':emp' => $id_empresa]);
    if (!in_array($stmt->fetchColumn(), [true, 't', 'true', '1', 1], true)) {
        $pdo->rollBack();
        http_response_code(409);
        echo json_encode(["ok" => false, "error" => "No se pudo eliminar la ruta."]);
        exit;
    }

    $pdo->commit();
    echo json_encode(["ok" => true, "mensaje" => "Ruta eliminada."]);

} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('[TourismEasy] transporte/eliminar.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "Error al eliminar."]);
}
