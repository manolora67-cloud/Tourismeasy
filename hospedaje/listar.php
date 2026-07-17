<?php
/**
 * hospedaje/listar.php
 * GET ?panel=1  → hospedajes de la empresa en sesión
 * GET           → todos los disponibles (frontal público)
 *
 * CAMBIO: los servicios ya no son una columna de texto libre.
 * Se traen desde HOSPEDAJE_SERVICIOS + SERVICIOS_HOSPEDAJE y se
 * devuelven como:
 *   - "servicios"     → array [{id, nombre}, ...]  (para el modal/checkboxes)
 *   - "servicios_txt" → "WiFi, Piscina, Spa"        (para mostrar en la tabla)
 */

session_start();
require_once __DIR__ . '/../con_db/db.php';

require_once __DIR__ . '/../cors.php';
header('Content-Type: application/json');

$panel = isset($_GET['panel']) && $_GET['panel'] == '1';

function adjuntarServicios($pdo, $rows) {
    if (!$rows) return $rows;

    $ids = array_column($rows, 'id');
    $placeholders = implode(',', array_fill(0, count($ids), '?'));

    $stmt = $pdo->prepare("
        SELECT hs.ID_HOSPEDAJE AS id_hospedaje,
               s.ID_SERVICIO   AS id,
               s.NOMBRE_SERVICIO AS nombre
        FROM HOSPEDAJE_SERVICIOS hs
        JOIN SERVICIOS_HOSPEDAJE s ON s.ID_SERVICIO = hs.ID_SERVICIO
        WHERE hs.ID_HOSPEDAJE IN ($placeholders)
        ORDER BY s.NOMBRE_SERVICIO ASC
    ");
    $stmt->execute($ids);

    $porHospedaje = [];
    foreach ($stmt->fetchAll() as $r) {
        $porHospedaje[$r['id_hospedaje']][] = ['id' => (int)$r['id'], 'nombre' => $r['nombre']];
    }

    foreach ($rows as &$row) {
        $lista = $porHospedaje[$row['id']] ?? [];
        $row['servicios']     = $lista;
        $row['servicios_txt'] = implode(', ', array_column($lista, 'nombre'));
    }
    unset($row);

    return $rows;
}

try {
    if ($panel) {
        if (empty($_SESSION['id_empresa'])) {
            http_response_code(401);
            echo json_encode(["ok" => false, "error" => "No autorizado."]);
            exit;
        }

        $stmt = $pdo->prepare("
            SELECT
                h.ID_HOSPEDAJE   AS id,
                h.NOM_HOSPEDAJE  AS nombre,
                h.TIPO_HOSPEDAJE AS tipo,
                h.ID_CIUDAD      AS id_ciudad,
                c.NOM_CIUDAD     AS ciudad,
                h.DESCRIPCION    AS descripcion,
                h.PRECIO_NOCHE   AS precio_noche,
                h.ACCESIBILIDAD  AS accesibilidad,
                h.CAPACIDAD_MAX  AS capacidad_max,
                h.DISPONIBILIDAD AS disponible,
                h.IMG_URL        AS img_url,
                h.FECHA_CREACION AS fecha_creacion
            FROM HOSPEDAJE h
            LEFT JOIN CIUDADES c ON c.ID_CIUDAD = h.ID_CIUDAD
            WHERE h.ID_EMPRESA = :emp
            ORDER BY h.FECHA_CREACION DESC
        ");
        $stmt->execute([':emp' => $_SESSION['id_empresa']]);

    } else {
        $stmt = $pdo->prepare("
            SELECT
                h.ID_HOSPEDAJE   AS id,
                h.NOM_HOSPEDAJE  AS nombre,
                h.TIPO_HOSPEDAJE AS tipo,
                h.ID_CIUDAD      AS id_ciudad,
                c.NOM_CIUDAD     AS ciudad,
                h.DESCRIPCION    AS descripcion,
                h.PRECIO_NOCHE   AS precio_noche,
                h.ACCESIBILIDAD  AS accesibilidad,
                h.CAPACIDAD_MAX  AS capacidad_max,
                h.DISPONIBILIDAD AS disponible,
                h.IMG_URL        AS img_url,
                e.NOM_EMPRESA    AS empresa,
                e.ID_EMPRESA     AS id_empresa
            FROM HOSPEDAJE h
            JOIN EMPRESAS e ON e.ID_EMPRESA = h.ID_EMPRESA
            LEFT JOIN CIUDADES c ON c.ID_CIUDAD = h.ID_CIUDAD
            WHERE h.DISPONIBILIDAD = TRUE
            ORDER BY h.PRECIO_NOCHE ASC
        ");
        $stmt->execute();
    }

    $rows = $stmt->fetchAll();
    foreach ($rows as &$r) {
        $r['disponible'] = ($r['disponible'] === true || $r['disponible'] === 't' || $r['disponible'] === '1');
    }
    unset($r);

    $rows = adjuntarServicios($pdo, $rows);

    echo json_encode(["ok" => true, "data" => $rows]);

} catch (PDOException $e) {
    error_log('[TourismEasy] hospedaje/listar.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "Error al obtener hospedajes."]);
}