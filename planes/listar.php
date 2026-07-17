<?php
/**
 * planes/listar.php
 * GET ?panel=1  → planes de la empresa en sesión
 * GET           → todos los disponibles (frontal público)
 */

session_start();
require_once __DIR__ . '/../con_db/db.php';

require_once __DIR__ . '/../cors.php';
header('Content-Type: application/json');

$panel = isset($_GET['panel']) && $_GET['panel'] == '1';

try {
    if ($panel) {
        if (empty($_SESSION['id_empresa'])) {
            http_response_code(401);
            echo json_encode(["ok" => false, "error" => "No autorizado."]);
            exit;
        }

        $stmt = $pdo->prepare("
            SELECT
                p.ID_PLAN_TURISTICO  AS id,
                p.NOM_PLAN_TURISTICO AS nombre,
                p.DURACION           AS duracion,
                p.DESCRIPCION        AS descripcion,
                p.INCLUYE            AS incluye,
                p.ID_TIPO_PLAN       AS id_tipo_plan,
                t.NOM_TIPO_PLAN      AS tipo_plan,
                p.PRECIO_PLAN        AS precio,
                p.ACCESIBILIDAD      AS accesibilidad,
                p.DISPONIBILIDAD     AS disponible,
                p.ID_CIUDAD          AS id_ciudad,
                c.NOM_CIUDAD         AS ciudad,
                p.IMG_URL            AS img_url,
                p.FECHA_CREACION     AS fecha_creacion
            FROM PLANES_TURISTICOS p
            LEFT JOIN TIPOS_DE_PLAN_TURISTICO t ON t.ID_TIPO_PLAN = p.ID_TIPO_PLAN
            LEFT JOIN CIUDADES c ON c.ID_CIUDAD = p.ID_CIUDAD
            WHERE p.ID_EMPRESA = :emp
            ORDER BY p.FECHA_CREACION DESC
        ");
        $stmt->execute([':emp' => $_SESSION['id_empresa']]);

    } else {
        $stmt = $pdo->prepare("
            SELECT
                p.ID_PLAN_TURISTICO  AS id,
                p.NOM_PLAN_TURISTICO AS nombre,
                p.DURACION           AS duracion,
                p.DESCRIPCION        AS descripcion,
                p.INCLUYE            AS incluye,
                p.ID_TIPO_PLAN       AS id_tipo_plan,
                t.NOM_TIPO_PLAN      AS tipo_plan,
                p.PRECIO_PLAN        AS precio,
                p.ACCESIBILIDAD      AS accesibilidad,
                p.DISPONIBILIDAD     AS disponible,
                p.ID_CIUDAD          AS id_ciudad,
                c.NOM_CIUDAD         AS ciudad,
                p.IMG_URL            AS img_url,
                e.NOM_EMPRESA        AS empresa,
                e.ID_EMPRESA         AS id_empresa
            FROM PLANES_TURISTICOS p
            JOIN EMPRESAS e ON e.ID_EMPRESA = p.ID_EMPRESA
            LEFT JOIN TIPOS_DE_PLAN_TURISTICO t ON t.ID_TIPO_PLAN = p.ID_TIPO_PLAN
            LEFT JOIN CIUDADES c ON c.ID_CIUDAD = p.ID_CIUDAD
            WHERE p.DISPONIBILIDAD = TRUE
            ORDER BY p.PRECIO_PLAN ASC
        ");
        $stmt->execute();
    }

    $rows = $stmt->fetchAll();
    foreach ($rows as &$r) {
        $r['disponible'] = ($r['disponible'] === true || $r['disponible'] === 't' || $r['disponible'] === '1');
    }
    unset($r);

    echo json_encode(["ok" => true, "data" => $rows]);

} catch (PDOException $e) {
    error_log('[TourismEasy] planes/listar.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "Error al obtener planes."]);
}