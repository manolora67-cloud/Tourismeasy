<?php
/**
 * planes/crear.php
 * Crea o actualiza un plan turístico.
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

if (!$nombre || !$duracion || !$incluye || !$id_tipo_plan || $precio <= 0 || !$accesibilidad || !$id_ciudad) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "Faltan campos obligatorios (nombre, duración, incluye, tipo de plan, precio, accesibilidad, ciudad)."]);
    exit;
}

try {
    $chkT = $pdo->prepare("SELECT 1 FROM TIPOS_DE_PLAN_TURISTICO WHERE ID_TIPO_PLAN = :t");
    $chkT->execute([':t' => $id_tipo_plan]);
    if (!$chkT->fetch()) {
        echo json_encode(["ok" => false, "error" => "Tipo de plan inválido."]);
        exit;
    }

    $chkC = $pdo->prepare("SELECT 1 FROM CIUDADES WHERE ID_CIUDAD = :c");
    $chkC->execute([':c' => $id_ciudad]);
    if (!$chkC->fetch()) {
        echo json_encode(["ok" => false, "error" => "Ciudad no válida."]);
        exit;
    }

    if ($id_editar) {
        $chk = $pdo->prepare("SELECT 1 FROM PLANES_TURISTICOS WHERE ID_PLAN_TURISTICO = :id AND ID_EMPRESA = :emp");
        $chk->execute([':id' => $id_editar, ':emp' => $id_empresa]);
        if (!$chk->fetch()) {
            echo json_encode(["ok" => false, "error" => "Registro no encontrado o no pertenece a tu empresa."]);
            exit;
        }

        $stmt = $pdo->prepare("
            UPDATE PLANES_TURISTICOS SET
                NOM_PLAN_TURISTICO = :nombre,
                DURACION           = :duracion,
                DESCRIPCION        = :desc,
                INCLUYE            = :incluye,
                ID_TIPO_PLAN       = :tipo,
                PRECIO_PLAN        = :precio,
                ACCESIBILIDAD      = :acc,
                ID_CIUDAD          = :ciudad,
                DISPONIBILIDAD     = :disp,
                IMG_URL            = :img
            WHERE ID_PLAN_TURISTICO = :id AND ID_EMPRESA = :emp
        ");
        $stmt->execute([
            ':nombre'  => $nombre,      ':duracion' => $duracion,
            ':desc'    => $descripcion ?: null, ':incluye' => $incluye,
            ':tipo'    => $id_tipo_plan, ':precio'  => $precio,
            ':acc'     => $accesibilidad, ':ciudad' => $id_ciudad,
            ':disp'    => $disponible ? 't' : 'f',
            ':img'     => $img_url,
            ':id'      => $id_editar,   ':emp'     => $id_empresa,
        ]);

        echo json_encode(["ok" => true, "mensaje" => "Plan actualizado.", "id" => $id_editar]);

    } else {
        $stmt = $pdo->prepare("
            INSERT INTO PLANES_TURISTICOS
                (NOM_PLAN_TURISTICO, DURACION, DESCRIPCION, INCLUYE,
                 ID_TIPO_PLAN, PRECIO_PLAN, ACCESIBILIDAD, DISPONIBILIDAD,
                 ID_EMPRESA, ID_CIUDAD, IMG_URL)
            VALUES
                (:nombre, :duracion, :desc, :incluye,
                 :tipo, :precio, :acc, :disp,
                 :emp, :ciudad, :img)
            RETURNING ID_PLAN_TURISTICO
        ");
        $stmt->execute([
            ':nombre'  => $nombre,      ':duracion' => $duracion,
            ':desc'    => $descripcion ?: null, ':incluye' => $incluye,
            ':tipo'    => $id_tipo_plan, ':precio'  => $precio,
            ':acc'     => $accesibilidad,
            ':disp'    => $disponible ? 't' : 'f',
            ':emp'     => $id_empresa,  ':ciudad'  => $id_ciudad,
            ':img'     => $img_url,
        ]);

        $nuevo = $stmt->fetch();
        echo json_encode(["ok" => true, "mensaje" => "Plan creado.", "id" => $nuevo['id_plan_turistico']]);
    }

} catch (PDOException $e) {
    error_log('[TourismEasy] planes/crear.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "Error al guardar el plan."]);
}