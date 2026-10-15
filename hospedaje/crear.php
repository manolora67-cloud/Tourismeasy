<?php
/**
 * hospedaje/crear.php
 * Crea o actualiza un hospedaje llamando a las funciones de BD
 * fn_agregar_hospedaje() / fn_editar_hospedaje().
 * La empresa se toma de $_SESSION['id_empresa'] — nunca del body.
 *
 * Los servicios se reciben en el body como "servicios_ids": [1, 3, 5]
 * (array de ID_SERVICIO) y se sincronizan dentro de la función de BD.
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

$nombre        = trim($input['nombre']        ?? '');
$tipo          = trim($input['tipo']          ?? '');
$id_ciudad     = trim($input['id_ciudad']     ?? '');
$descripcion   = trim($input['descripcion']   ?? '');
$precio_noche  = intval($input['precio_noche'] ?? 0);
$accesibilidad = trim($input['accesibilidad'] ?? '');
$capacidad     = intval($input['capacidad_max'] ?? 0);
$disponible    = isset($input['disponible']) ? (bool)$input['disponible'] : true;
$img_url       = trim($input['img_url']       ?? '') ?: null;
$id_editar     = isset($input['id']) ? intval($input['id']) : null;

// Servicios: array de IDs (INT), se limpia y se quitan duplicados/ceros
$servicios_ids = array_values(array_unique(array_filter(
    array_map('intval', $input['servicios_ids'] ?? []),
    function ($v) { return $v > 0; }
)));

$tipos_validos = ['Hotel','Hotel Boutique','Finca','Cabaña','Hostal','Apartamento','Glamping'];

if (!$nombre || !$tipo || !$id_ciudad || $precio_noche <= 0 || !$accesibilidad || $capacidad <= 0) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "Faltan campos obligatorios (nombre, tipo, ciudad, precio, accesibilidad, capacidad)."]);
    exit;
}

if (!in_array($tipo, $tipos_validos)) {
    echo json_encode(["ok" => false, "error" => "Tipo de hospedaje inválido."]);
    exit;
}

// PDO no maneja arrays nativos de PHP: se pasan como literal de array de Postgres "{1,3,5}"
$servicios_pg = '{' . implode(',', $servicios_ids) . '}';

try {
    if ($id_editar) {
        $stmt = $pdo->prepare("
            SELECT fn_editar_hospedaje(:id, :emp, :nombre, :tipo, :ciudad, :precio, :acc, :cap, :desc, :img, :disp, :servicios)
        ");
        $stmt->execute([
            ':id'        => $id_editar,
            ':emp'       => $id_empresa,
            ':nombre'    => $nombre,
            ':tipo'      => $tipo,
            ':ciudad'    => $id_ciudad,
            ':precio'    => $precio_noche,
            ':acc'       => $accesibilidad,
            ':cap'       => $capacidad,
            ':desc'      => $descripcion ?: null,
            ':img'       => $img_url,
            ':disp'      => $disponible ? 't' : 'f',
            ':servicios' => $servicios_pg,
        ]);

        if (!$stmt->fetchColumn()) {
            echo json_encode(["ok" => false, "error" => "No se pudo actualizar el hospedaje. Verifica que exista, te pertenezca y que los datos sean válidos."]);
            exit;
        }

        echo json_encode(["ok" => true, "mensaje" => "Hospedaje actualizado.", "id" => $id_editar]);

    } else {
        $stmt = $pdo->prepare("
            SELECT fn_agregar_hospedaje(:emp, :nombre, :tipo, :ciudad, :precio, :acc, :cap, :desc, :img, :servicios)
        ");
        $stmt->execute([
            ':emp'       => $id_empresa,
            ':nombre'    => $nombre,
            ':tipo'      => $tipo,
            ':ciudad'    => $id_ciudad,
            ':precio'    => $precio_noche,
            ':acc'       => $accesibilidad,
            ':cap'       => $capacidad,
            ':desc'      => $descripcion ?: null,
            ':img'       => $img_url,
            ':servicios' => $servicios_pg,
        ]);

        $nuevoId = $stmt->fetchColumn();

        if (!$nuevoId) {
            echo json_encode(["ok" => false, "error" => "No se pudo crear el hospedaje. Verifica que tu empresa esté activa, sea de tipo HOSPEDAJE y que los datos sean válidos."]);
            exit;
        }

        echo json_encode(["ok" => true, "mensaje" => "Hospedaje creado.", "id" => (int) $nuevoId]);
    }

} catch (PDOException $e) {
    error_log('[TourismEasy] hospedaje/crear.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "Error al guardar el hospedaje."]);
}
