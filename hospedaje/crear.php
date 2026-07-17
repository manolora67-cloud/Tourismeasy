<?php
/**
 * hospedaje/crear.php
 * Crea o actualiza un hospedaje.
 *
 * CAMBIO: la columna de texto libre SERVICIOS ya no existe.
 * Ahora los servicios se manejan como relación muchos-a-muchos
 * a través de la tabla HOSPEDAJE_SERVICIOS, y se reciben en el
 * body como "servicios_ids": [1, 3, 5] (array de ID_SERVICIO).
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

try {
    $chkC = $pdo->prepare("SELECT 1 FROM CIUDADES WHERE ID_CIUDAD = :c");
    $chkC->execute([':c' => $id_ciudad]);
    if (!$chkC->fetch()) {
        echo json_encode(["ok" => false, "error" => "Ciudad no válida."]);
        exit;
    }

    // Validar que los servicios enviados realmente existan
    if ($servicios_ids) {
        $placeholders = implode(',', array_fill(0, count($servicios_ids), '?'));
        $chkS = $pdo->prepare("SELECT ID_SERVICIO FROM SERVICIOS_HOSPEDAJE WHERE ID_SERVICIO IN ($placeholders)");
        $chkS->execute($servicios_ids);
        $validos = array_map('intval', array_column($chkS->fetchAll(), 'id_servicio'));
        $invalidos = array_diff($servicios_ids, $validos);
        if ($invalidos) {
            echo json_encode(["ok" => false, "error" => "Servicio(s) inválido(s): " . implode(', ', $invalidos)]);
            exit;
        }
    }

    $pdo->beginTransaction();

    if ($id_editar) {
        $chk = $pdo->prepare("SELECT 1 FROM HOSPEDAJE WHERE ID_HOSPEDAJE = :id AND ID_EMPRESA = :emp");
        $chk->execute([':id' => $id_editar, ':emp' => $id_empresa]);
        if (!$chk->fetch()) {
            $pdo->rollBack();
            echo json_encode(["ok" => false, "error" => "Registro no encontrado o no pertenece a tu empresa."]);
            exit;
        }

        $stmt = $pdo->prepare("
            UPDATE HOSPEDAJE SET
                NOM_HOSPEDAJE  = :nombre,
                TIPO_HOSPEDAJE = :tipo,
                ID_CIUDAD      = :ciudad,
                DESCRIPCION    = :desc,
                PRECIO_NOCHE   = :precio,
                ACCESIBILIDAD  = :acc,
                CAPACIDAD_MAX  = :cap,
                DISPONIBILIDAD = :disp,
                IMG_URL        = :img
            WHERE ID_HOSPEDAJE = :id AND ID_EMPRESA = :emp
        ");
        $stmt->execute([
            ':nombre'   => $nombre,      ':tipo'     => $tipo,
            ':ciudad'   => $id_ciudad,   ':desc'     => $descripcion ?: null,
            ':precio'   => $precio_noche,
            ':acc'      => $accesibilidad,':cap'      => $capacidad,
            ':disp'     => $disponible ? 't' : 'f',
            ':img'      => $img_url,
            ':id'       => $id_editar,   ':emp'      => $id_empresa,
        ]);

        $id_hospedaje = $id_editar;

        // Resincronizar servicios: borrar los actuales y volver a insertar los nuevos
        $del = $pdo->prepare("DELETE FROM HOSPEDAJE_SERVICIOS WHERE ID_HOSPEDAJE = :id");
        $del->execute([':id' => $id_hospedaje]);

        $mensaje = "Hospedaje actualizado.";

    } else {
        $stmt = $pdo->prepare("
            INSERT INTO HOSPEDAJE
                (ID_EMPRESA, NOM_HOSPEDAJE, TIPO_HOSPEDAJE, ID_CIUDAD,
                 DESCRIPCION, PRECIO_NOCHE, ACCESIBILIDAD,
                 CAPACIDAD_MAX, DISPONIBILIDAD, IMG_URL)
            VALUES
                (:emp, :nombre, :tipo, :ciudad,
                 :desc, :precio, :acc,
                 :cap, :disp, :img)
            RETURNING ID_HOSPEDAJE
        ");
        $stmt->execute([
            ':emp'      => $id_empresa,
            ':nombre'   => $nombre,      ':tipo'     => $tipo,
            ':ciudad'   => $id_ciudad,   ':desc'     => $descripcion ?: null,
            ':precio'   => $precio_noche,
            ':acc'      => $accesibilidad,':cap'      => $capacidad,
            ':disp'     => $disponible ? 't' : 'f',
            ':img'      => $img_url,
        ]);

        $nuevo = $stmt->fetch();
        $id_hospedaje = $nuevo['id_hospedaje'];
        $mensaje = "Hospedaje creado.";
    }

    // Insertar los servicios seleccionados (si hay)
    if ($servicios_ids) {
        $insServ = $pdo->prepare("INSERT INTO HOSPEDAJE_SERVICIOS (ID_HOSPEDAJE, ID_SERVICIO) VALUES (:h, :s)");
        foreach ($servicios_ids as $sid) {
            $insServ->execute([':h' => $id_hospedaje, ':s' => $sid]);
        }
    }

    $pdo->commit();

    echo json_encode(["ok" => true, "mensaje" => $mensaje, "id" => $id_hospedaje]);

} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('[TourismEasy] hospedaje/crear.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "Error al guardar el hospedaje."]);
}