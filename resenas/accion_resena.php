<?php

require_once __DIR__ . '/../con_db/sesion_persistente.php';
iniciarSesionPersistente();
require_once __DIR__ . '/../con_db/db.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$input          = json_decode(file_get_contents('php://input'), true);
$accion         = strtoupper(trim($input['accion']     ?? ''));
$admin_id       = ($_SESSION['tipo'] ?? '') === 'admin' ? trim($_SESSION['id_persona'] ?? '') : '';
$id_resena_entrada = $input['id_resena'] ?? null;
$id_resena = (is_string($id_resena_entrada) || is_int($id_resena_entrada))
    ? trim((string)$id_resena_entrada)
    : '';
$rating         = intval($input['rating']       ?? 0);
$texto          = trim($input['texto']          ?? '');
$nombre_anonimo = trim($input['nombre_anonimo'] ?? '');
$visitor_id     = trim($input['visitor_id']     ?? '');

if ($id_resena !== '' && !preg_match('/^[1-9][0-9]{0,9}$/D', $id_resena)) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "ID de reseña inválido."]);
    exit;
}

// Solo administración puede editar o moderar reseñas de visitantes.
if (in_array($accion, ['EDITAR', 'BORRAR'], true) && !$admin_id) {
    http_response_code(401);
    echo json_encode(["ok" => false, "error" => "No autorizado."]);
    exit;
}

if ($accion === 'CREAR' && !$nombre_anonimo) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "Ingresa tu nombre para publicar."]);
    exit;
}

if (in_array($accion, ['LIKE', 'UNLIKE']) && !$visitor_id) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "No se pudo identificar tu navegador para el like."]);
    exit;
}

try {
    switch ($accion) {

        case 'CREAR':
            $stmt = $pdo->prepare("SELECT * FROM fn_crear_resena(:rating, :texto, :anonimo)");
            $stmt->execute([
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
            $stmt = $pdo->prepare("SELECT * FROM fn_editar_resena(:id, :rating, :texto)");
            $stmt->execute([
                ':id'      => $id_resena,
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
            $stmt = $pdo->prepare("SELECT * FROM fn_borrar_resena(:id)");
            $stmt->execute([':id' => $id_resena]);
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
            $stmt = $pdo->prepare("SELECT * FROM fn_like_resena(:id, :visitor)");
            $stmt->execute([
                ':id'      => $id_resena,
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
            $stmt = $pdo->prepare("SELECT * FROM fn_unlike_resena(:id, :visitor)");
            $stmt->execute([
                ':id'      => $id_resena,
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