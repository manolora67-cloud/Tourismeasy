<?php
/**
 * transporte/crear.php
 * Crea o actualiza una ruta de transporte llamando a las funciones de BD
 * fn_agregar_transporte() / fn_editar_transporte().
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

$id_empresa = $_SESSION['id_empresa'];
$input = json_decode(file_get_contents('php://input'), true);

$origen      = trim($input['origen']       ?? '');
$destino     = trim($input['destino']      ?? '');
$fecha       = trim($input['fecha_salida'] ?? '');
$hora        = trim($input['hora_salida']  ?? '');
$precio      = intval($input['precio']     ?? 0);
$id_clase    = isset($input['id_clase']) ? intval($input['id_clase']) : 0;
$descripcion = trim($input['descripcion']  ?? '');
$disponible  = isset($input['disponible']) ? (bool)$input['disponible'] : true;
$img_url     = trim($input['img_url']      ?? '') ?: null;
$id_editar   = isset($input['id']) ? intval($input['id']) : null;


/* =========================================================
   VALIDACIONES
   ========================================================= */

if (!$origen || !$destino || !$fecha || !$hora || $precio <= 0 || $id_clase <= 0) {
    http_response_code(400);
    echo json_encode([
        "ok" => false,
        "error" => "Faltan campos obligatorios (origen, destino, fecha, hora, precio y clase)."
    ]);
    exit;
}

if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha)) {
    echo json_encode([
        "ok" => false,
        "error" => "Formato de fecha inválido. Use YYYY-MM-DD."
    ]);
    exit;
}

if (!preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $hora)) {
    echo json_encode([
        "ok" => false,
        "error" => "Formato de hora inválido. Use HH:MM."
    ]);
    exit;
}


/* =========================================================
   CREAR / EDITAR
   ========================================================= */

try {

    /* =====================================================
       EDITAR
       ===================================================== */

    if ($id_editar) {

        $stmt = $pdo->prepare("
            SELECT fn_editar_transporte(
                :id,
                :emp,
                :origen,
                :destino,
                :fecha,
                :hora,
                :precio,
                :clase,
                :desc,
                :img,
                :disp
            )
        ");

        $stmt->execute([
            ':id'      => $id_editar,
            ':emp'     => $id_empresa,
            ':origen'  => $origen,
            ':destino' => $destino,
            ':fecha'   => $fecha,
            ':hora'    => $hora,
            ':precio'  => $precio,
            ':clase'   => $id_clase,
            ':desc'    => $descripcion ?: null,
            ':img'     => $img_url,
            ':disp'    => $disponible ? 't' : 'f',
        ]);

        if (!$stmt->fetchColumn()) {
            echo json_encode([
                "ok" => false,
                "error" => "No se pudo actualizar la ruta. Verifica que exista, te pertenezca y que los datos sean válidos."
            ]);
            exit;
        }

        echo json_encode([
            "ok" => true,
            "mensaje" => "Ruta actualizada.",
            "id" => $id_editar
        ]);


    /* =====================================================
       CREAR
       ===================================================== */

    } else {

        $stmt = $pdo->prepare("
            SELECT fn_agregar_transporte(
                :emp,
                :origen,
                :destino,
                :fecha,
                :hora,
                :precio,
                :clase,
                :desc,
                :img
            )
        ");

        $stmt->execute([
            ':emp'     => $id_empresa,
            ':origen'  => $origen,
            ':destino' => $destino,
            ':fecha'   => $fecha,
            ':hora'    => $hora,
            ':precio'  => $precio,
            ':clase'   => $id_clase,
            ':desc'    => $descripcion ?: null,
            ':img'     => $img_url,
        ]);

        $nuevoId = $stmt->fetchColumn();

        if (!$nuevoId) {
            echo json_encode([
                "ok" => false,
                "error" => "No se pudo crear la ruta. Verifica que tu empresa esté activa, sea de tipo TRANSPORTE y que los datos sean válidos."
            ]);
            exit;
        }

        echo json_encode([
            "ok" => true,
            "mensaje" => "Ruta creada.",
            "id" => (int) $nuevoId
        ]);
    }

} catch (PDOException $e) {

    error_log('[TourismEasy] transporte/crear.php - ' . $e->getMessage());

    http_response_code(500);

    echo json_encode([
        "ok" => false,
        "error" => "Error al guardar la ruta."
    ]);
}