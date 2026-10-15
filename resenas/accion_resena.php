<?php

require_once __DIR__ . '/../con_db/db.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$input          = json_decode(file_get_contents('php://input'), true);
$accion         = strtoupper(trim($input['accion']     ?? ''));
$id_persona     = trim($input['id_persona']     ?? '');
$id_resena      = intval($input['id_resena']    ?? 0);
$rating         = intval($input['rating']       ?? 0);
$texto          = trim($input['texto']          ?? '');
$nombre_anonimo = trim($input['nombre_anonimo'] ?? '');
$visitor_id     = trim($input['visitor_id']     ?? '');

// EDITAR y BORRAR sí exigen sesión siempre (necesitan probar dueño de la
// reseña). CREAR y LIKE/UNLIKE aceptan cuenta O identidad anónima:
//   - CREAR: id_persona o nombre_anonimo
//   - LIKE/UNLIKE: id_persona o visitor_id (un token que genera el navegador)
if (in_array($accion, ['EDITAR', 'BORRAR']) && !$id_persona) {
    http_response_code(401);
    echo json_encode(["ok" => false, "error" => "No autorizado."]);
    exit;
}

if ($accion === 'CREAR' && !$id_persona && !$nombre_anonimo) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "Ingresa tu nombre para publicar, o inicia sesión."]);
    exit;
}

if (in_array($accion, ['LIKE', 'UNLIKE']) && !$id_persona && !$visitor_id) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "No se pudo identificar tu navegador para el like."]);
    exit;
}

try {
    switch ($accion) {

        case 'CREAR':
            $stmt = $pdo->prepare("SELECT * FROM fn_crear_resena(:persona, :rating, :texto, :anonimo)");
            $stmt->execute([
                ':persona' => $id_persona ?: null,
                ':rating'  => $rating,
                ':texto'   => $texto,
                ':anonimo' => $nombre_anonimo ?: null,
            ]);
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
            $stmt = $pdo->prepare("SELECT * FROM fn_like_resena(:id, :persona, :visitor)");
            $stmt->execute([
                ':id'      => $id_resena,
                ':persona' => $id_persona ?: null,
                ':visitor' => $visitor_id ?: null,
            ]);
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
            $stmt = $pdo->prepare("SELECT * FROM fn_unlike_resena(:id, :persona, :visitor)");
            $stmt->execute([
                ':id'      => $id_resena,
                ':persona' => $id_persona ?: null,
                ':visitor' => $visitor_id ?: null,
            ]);
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