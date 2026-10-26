<?php
/**
 * transporte/crear.php
 * Crea o actualiza una ruta de transporte llamando a las funciones de BD
 * fn_agregar_transporte() / fn_editar_transporte().
 * La empresa se toma de $_SESSION['id_empresa'] — nunca del body.
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
if (!is_array($input)) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "El cuerpo de la solicitud no es válido."]);
    exit;
}

$origen_entrada = $input['id_ciudad_origen'] ?? null;
$destino_entrada = $input['id_ciudad_destino'] ?? null;
$origen = (is_string($origen_entrada) || is_int($origen_entrada))
    ? trim((string)$origen_entrada)
    : '';
$destino = (is_string($destino_entrada) || is_int($destino_entrada))
    ? trim((string)$destino_entrada)
    : '';
$fecha       = trim($input['fecha_salida'] ?? '');
$hora        = trim($input['hora_salida']  ?? '');
$precio      = intval($input['precio']     ?? 0);
$id_clase_entrada = $input['id_clase'] ?? null;
$id_clase = (is_string($id_clase_entrada) || is_int($id_clase_entrada))
    ? trim((string)$id_clase_entrada)
    : '';
$descripcion = trim($input['descripcion']  ?? '');
$disponible  = isset($input['disponible']) ? (bool)$input['disponible'] : true;
$img_url     = trim($input['img_url']      ?? '') ?: null;
$id_editar = null;
if (isset($input['id'])) {
    $id_editar_entrada = $input['id'];
    $id_editar = (is_string($id_editar_entrada) || is_int($id_editar_entrada))
        ? trim((string)$id_editar_entrada)
        : '';
    if (!preg_match('/^[1-9][0-9]{0,9}$/D', $id_editar)) {
        http_response_code(400);
        echo json_encode(["ok" => false, "error" => "ID de ruta inválido."]);
        exit;
    }
}


/* =========================================================
   VALIDACIONES
   ========================================================= */

if (!preg_match('/^[A-Za-z0-9]{5,6}$/D', $origen)
    || !preg_match('/^[A-Za-z0-9]{5,6}$/D', $destino)
    || !$fecha || !$hora || $precio <= 0
    || !preg_match('/^[1-9][0-9]{0,9}$/D', $id_clase)) {
    http_response_code(400);
    echo json_encode([
        "ok" => false,
        "error" => "Selecciona los municipios de origen y destino, la fecha, la hora, el precio y la clase."
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
            "id" => (string)$nuevoId
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