<?php
/**
 * resenas/accion_resena.php
 * Crea, edita, elimina una reseña, o da/quita like — cada acción llama a su función de BD.
 *
 * Espera JSON:
 *   Crear:   { "accion": "CREAR",   "id_persona": "...", "rating": 5, "texto": "..." }
 *   Editar:  { "accion": "EDITAR",  "id_persona": "...", "id_resena": 3, "rating": 4, "texto": "..." }
 *   Borrar:  { "accion": "BORRAR",  "id_persona": "...", "id_resena": 3 }
 *   Like:    { "accion": "LIKE",    "id_persona": "...", "id_resena": 3 }
 *   Unlike:  { "accion": "UNLIKE",  "id_persona": "...", "id_resena": 3 }
 */

require_once __DIR__ . '/../con_db/db.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$input      = json_decode(file_get_contents('php://input'), true);
$accion     = strtoupper(trim($input['accion']     ?? ''));
$id_persona = trim($input['id_persona'] ?? '');
$id_resena  = intval($input['id_resena'] ?? 0);
$rating     = intval($input['rating']   ?? 0);
$texto      = trim($input['texto']      ?? '');

if (!$id_persona) {
    http_response_code(401);
    echo json_encode(["ok" => false, "error" => "No autorizado."]);
    exit;
}

try {
    switch ($accion) {

        case 'CREAR':
            $stmt = $pdo->prepare("SELECT * FROM fn_crear_resena(:persona, :rating, :texto)");
            $stmt->execute([':persona' => $id_persona, ':rating' => $rating, ':texto' => $texto]);
            $row = $stmt->fetch();

            if (!$row['ok']) {
                echo json_encode(["ok" => false, "error" => $row['mensaje']]);
                exit;
            }
            echo json_encode([
                "ok"        => true,
                "id_resena" => $row['id_resena'],
                "fecha"     => $row['fecha'],
                "mensaje"   => $row['mensaje'],
            ]);
            break;

        case 'EDITAR':
            if (!$id_resena) {
                echo json_encode(["ok" => false, "error" => "ID de reseña requerido."]);
                exit;
            }
            $stmt = $pdo->prepare("SELECT * FROM fn_editar_resena(:id, :persona, :rating, :texto)");
            $stmt->execute([
                ':id'      => $id_resena,
                ':persona' => $id_persona,
                ':rating'  => $rating,
                ':texto'   => $texto,
            ]);
            $row = $stmt->fetch();

            if (!$row['ok']) {
                echo json_encode(["ok" => false, "error" => $row['mensaje']]);
                exit;
            }
            echo json_encode(["ok" => true, "mensaje" => $row['mensaje']]);
            break;

        case 'BORRAR':
            if (!$id_resena) {
                echo json_encode(["ok" => false, "error" => "ID de reseña requerido."]);
                exit;
            }
            $stmt = $pdo->prepare("SELECT * FROM fn_borrar_resena(:id, :persona)");
            $stmt->execute([':id' => $id_resena, ':persona' => $id_persona]);
            $row = $stmt->fetch();

            if (!$row['ok']) {
                echo json_encode(["ok" => false, "error" => $row['mensaje']]);
                exit;
            }
            echo json_encode(["ok" => true, "mensaje" => $row['mensaje']]);
            break;

        case 'LIKE':
            if (!$id_resena) {
                echo json_encode(["ok" => false, "error" => "ID de reseña requerido."]);
                exit;
            }
            $stmt = $pdo->prepare("SELECT * FROM fn_like_resena(:id, :persona)");
            $stmt->execute([':id' => $id_resena, ':persona' => $id_persona]);
            $row = $stmt->fetch();

            if (!$row['ok']) {
                echo json_encode(["ok" => false, "error" => $row['mensaje']]);
                exit;
            }
            echo json_encode(["ok" => true, "likes" => (int) $row['likes']]);
            break;

        case 'UNLIKE':
            if (!$id_resena) {
                echo json_encode(["ok" => false, "error" => "ID de reseña requerido."]);
                exit;
            }
            $stmt = $pdo->prepare("SELECT * FROM fn_unlike_resena(:id, :persona)");
            $stmt->execute([':id' => $id_resena, ':persona' => $id_persona]);
            $row = $stmt->fetch();

            echo json_encode(["ok" => true, "likes" => (int) $row['likes']]);
            break;

        default:
            http_response_code(400);
            echo json_encode(["ok" => false, "error" => "Acción inválida."]);
    }

} catch (PDOException $e) {
    error_log('[TourismEasy] accion_resena.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "Error al procesar la acción."]);
}