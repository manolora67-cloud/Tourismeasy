<?php
/**
 * hospedaje/listar.php
 * GET ?panel=1  → hospedajes de la empresa en sesión (fn_listar_hospedaje_empresa)
 * GET           → todos los disponibles, frontal público (fn_listar_hospedaje_publico)
 *
 * Las funciones devuelven las filas completas como JSONB.
 */

require_once __DIR__ . '/../con_db/sesion_persistente.php';
iniciarSesionPersistente();
require_once __DIR__ . '/../con_db/db.php';

require_once __DIR__ . '/../cors.php';
header('Content-Type: application/json');

$panel = ($_GET['panel'] ?? '') === '1';

try {
    if ($panel) {
        if (($_SESSION['tipo'] ?? '') !== 'empresa' || empty($_SESSION['id_empresa'])) {
            http_response_code(401);
            echo json_encode(["ok" => false, "error" => "No autorizado."]);
            exit;
        }

        $stmt = $pdo->prepare('SELECT fn_listar_hospedaje_empresa(:emp)');
        $stmt->execute([':emp' => $_SESSION['id_empresa']]);

    } else {
        $stmt = $pdo->query('SELECT fn_listar_hospedaje_publico()');
    }

    $data = json_decode($stmt->fetchColumn(), true, 512, JSON_THROW_ON_ERROR);
    if (!is_array($data)) throw new RuntimeException('La función no devolvió una lista válida.');
    echo json_encode(['ok' => true, 'data' => $data]);

} catch (Throwable $e) {
    error_log('[TourismEasy] hospedaje/listar.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "Error al obtener hospedajes."]);
}
