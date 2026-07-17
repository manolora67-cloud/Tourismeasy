<?php
/**
 * e-commerce/eliminar.php
 * POST id, ajax=1 -> elimina el producto de forma permanente, vía fn_eliminar_producto().
 *
 * El id del artesano viene de la sesión de servidor, no del formulario:
 * así nadie puede borrar productos de otro artesano solo cambiando el
 * id_persona que manda el navegador.
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

$id = $_POST['id'] ?? null;
$idPersona = $_SESSION['artesano_id'] ?? null;

if (!$id) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Falta el id del producto.']);
    exit;
}

if (!$idPersona) {
    http_response_code(401);
    echo json_encode(['ok' => false, 'error' => 'Sesión de artesano no encontrada. Inicia sesión de nuevo.']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT fn_eliminar_producto(:id, :id_persona)");
    $stmt->execute(['id' => $id, 'id_persona' => $idPersona]);

    if (!$stmt->fetchColumn()) {
        http_response_code(403);
        echo json_encode(['ok' => false, 'error' => 'No se pudo eliminar: el producto no existe o no te pertenece.']);
        exit;
    }

    echo json_encode(['ok' => true]);

} catch (PDOException $e) {
    error_log('[TourismEasy] e-commerce/eliminar.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Error al eliminar el producto.']);
}