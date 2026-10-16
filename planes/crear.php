<?php
/**
 * planes/crear.php
 * Crea o actualiza un plan turístico llamando a las funciones de BD
 * fn_agregar_plan() / fn_editar_plan().
 * La empresa se toma de $_SESSION['id_empresa'] — nunca del body.
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

$id_empresa    = $_SESSION['id_empresa'];
$input         = json_decode(file_get_contents('php://input'), true);

$nombre        = trim($input['nombre']         ?? '');
$duracion      = trim($input['duracion']       ?? '');
$descripcion   = trim($input['descripcion']    ?? '');
$incluye       = trim($input['incluye']        ?? '');
$id_tipo_plan  = intval($input['id_tipo_plan'] ?? 0);
$precio        = intval($input['precio']       ?? 0);
$accesibilidad = trim($input['accesibilidad']  ?? '');
$id_ciudad     = trim($input['id_ciudad']      ?? '');
$disponible    = isset($input['disponible']) ? (bool)$input['disponible'] : true;
$img_url       = trim($input['img_url']        ?? '') ?: null;
$id_editar     = isset($input['id']) ? intval($input['id']) : null;

try {
    if ($id_editar) {
        $stmt = $pdo->prepare("
            SELECT fn_editar_plan(:id, :emp, :nombre, :duracion, :incluye, :tipo, :precio, :acc, :ciudad, :desc, :img, :disp)
        ");
        $stmt->execute([
            ':id'      => $id_editar,
            ':emp'     => $id_empresa,
            ':nombre'  => $nombre,
            ':duracion'=> $duracion,
            ':incluye' => $incluye,
            ':tipo'    => $id_tipo_plan,
            ':precio'  => $precio,
            ':acc'     => $accesibilidad,
            ':ciudad'  => $id_ciudad,
            ':desc'    => $descripcion ?: null,
            ':img'     => $img_url,
            ':disp'    => $disponible ? 't' : 'f',
        ]);

        if (!$stmt->fetchColumn()) {
            echo json_encode(["ok" => false, "error" => "No se pudo actualizar el plan. Verifica que exista, te pertenezca y que los datos sean válidos."]);
            exit;
        }

        echo json_encode(["ok" => true, "mensaje" => "Plan actualizado.", "id" => $id_editar]);

    } else {
        $stmt = $pdo->prepare("
            SELECT fn_agregar_plan(:emp, :nombre, :duracion, :incluye, :tipo, :precio, :acc, :ciudad, :desc, :img)
        ");
        $stmt->execute([
            ':emp'     => $id_empresa,
            ':nombre'  => $nombre,
            ':duracion'=> $duracion,
            ':incluye' => $incluye,
            ':tipo'    => $id_tipo_plan,
            ':precio'  => $precio,
            ':acc'     => $accesibilidad,
            ':ciudad'  => $id_ciudad,
            ':desc'    => $descripcion ?: null,
            ':img'     => $img_url,
        ]);

        $nuevoId = $stmt->fetchColumn();

        if (!$nuevoId) {
            echo json_encode(["ok" => false, "error" => "No se pudo crear el plan. Verifica que tu empresa esté activa, sea de tipo PLANES y que los datos sean válidos."]);
            exit;
        }

        echo json_encode(["ok" => true, "mensaje" => "Plan creado.", "id" => (int) $nuevoId]);
    }

} catch (PDOException $e) {
    error_log('[TourismEasy] planes/crear.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "Error al guardar el plan."]);
}
