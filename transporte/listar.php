<?php
/**
 * transporte/listar.php
 * GET ?panel=1  → solo las rutas de la empresa en sesión (fn_listar_transporte_empresa)
 * GET           → todas las rutas disponibles, frontal público (fn_listar_transporte_publico)
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

        $stmt = $pdo->prepare("SELECT * FROM fn_listar_transporte_empresa(:emp)");
        $stmt->execute([':emp' => $_SESSION['id_empresa']]);

    } else {
        $stmt = $pdo->prepare("SELECT * FROM fn_listar_transporte_publico()");
        $stmt->execute();
    }

    $rows = $stmt->fetchAll();
    foreach ($rows as &$r) {
        $r['disponible'] = ($r['disponible'] === true || $r['disponible'] === 't' || $r['disponible'] === '1');
    }
    unset($r);

    echo json_encode(["ok" => true, "data" => $rows]);

} catch (PDOException $e) {
    error_log('[TourismEasy] transporte/listar.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "Error al obtener rutas."]);
}
