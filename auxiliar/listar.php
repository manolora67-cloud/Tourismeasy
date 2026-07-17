<?php
/**
 * auxiliar/listar.php
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
                a.ID_PERSONAL_AUXILIAR  AS id,
                a.NOMBRE_PROFESIONAL    AS nombre,
                a.ESPECIALIDAD          AS especialidad,
                a.ID_CARGO_AUX          AS id_cargo,
                ca.NOM_CARGO            AS cargo,
                a.ID_CIUDAD             AS id_ciudad,
                c.NOM_CIUDAD            AS ciudad,
                a.EXPERIENCIA           AS experiencia,
                a.DISPONIBILIDAD        AS disponibilidad_texto,
                a.TARIFA                AS tarifa_hora,
                a.ACCESIBILIDAD         AS accesibilidad,
                a.DISPONIBLE            AS disponible,
                a.IMG_URL               AS img_url,
                a.FECHA_CREACION        AS fecha_creacion
            FROM PERSONAL_AUXILIAR a
            LEFT JOIN CARGOS_PER_AUX ca ON ca.ID_CARGO_AUX = a.ID_CARGO_AUX
            LEFT JOIN CIUDADES c         ON c.ID_CIUDAD     = a.ID_CIUDAD
            WHERE a.ID_EMPRESA = :emp
            ORDER BY a.FECHA_CREACION DESC
        ");
        $stmt->execute([':emp' => $_SESSION['id_empresa']]);

    } else {
        $stmt = $pdo->prepare("
            SELECT
                a.ID_PERSONAL_AUXILIAR  AS id,
                a.NOMBRE_PROFESIONAL    AS nombre,
                a.ESPECIALIDAD          AS especialidad,
                a.ID_CARGO_AUX          AS id_cargo,
                ca.NOM_CARGO            AS cargo,
                a.ID_CIUDAD             AS id_ciudad,
                c.NOM_CIUDAD            AS ciudad,
                a.EXPERIENCIA           AS experiencia,
                a.DISPONIBILIDAD        AS disponibilidad_texto,
                a.TARIFA                AS tarifa_hora,
                a.ACCESIBILIDAD         AS accesibilidad,
                a.DISPONIBLE            AS disponible,
                a.IMG_URL               AS img_url,
                e.NOM_EMPRESA           AS empresa,
                e.ID_EMPRESA            AS id_empresa
            FROM PERSONAL_AUXILIAR a
            JOIN EMPRESAS e             ON e.ID_EMPRESA    = a.ID_EMPRESA
            LEFT JOIN CARGOS_PER_AUX ca ON ca.ID_CARGO_AUX = a.ID_CARGO_AUX
            LEFT JOIN CIUDADES c         ON c.ID_CIUDAD     = a.ID_CIUDAD
            WHERE a.DISPONIBLE = TRUE
            ORDER BY a.TARIFA ASC
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
    error_log('[TourismEasy] auxiliar/listar.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "Error al obtener personal auxiliar."]);
}