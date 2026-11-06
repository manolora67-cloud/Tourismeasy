<?php
/**
 * api/get_perfil_empresa.php
 * Devuelve los datos completos de la empresa autenticada.
 */

require_once __DIR__ . '/../con_db/sesion_persistente.php';
iniciarSesionPersistente();
require_once __DIR__ . '/../con_db/db.php';

header('Content-Type: application/json');
require_once __DIR__ . '/../cors.php';

$id = ($_SESSION['tipo'] ?? '') === 'empresa' ? ($_SESSION['id_empresa'] ?? '') : '';

if (!$id) {
    http_response_code(401);
    echo json_encode(["ok" => false, "error" => "No autorizado."]);
    exit;
}

try {
    $stmt = $pdo->prepare('SELECT * FROM fn_obtener_perfil_empresa(:id)');
    $stmt->execute([':id' => $id]);
    $empresa = $stmt->fetch();

    if (!$empresa) {
        http_response_code(404);
        echo json_encode(["ok" => false, "error" => "Empresa no encontrada."]);
        exit;
    }

    $metaStmt = $pdo->prepare('SELECT * FROM fn_obtener_meta_edicion_perfil_empresa(:id)');
    $metaStmt->execute([':id' => $id]);
    $meta = $metaStmt->fetch();
    if (!$meta) {
        http_response_code(404);
        echo json_encode(["ok" => false, "error" => "Empresa no encontrada."]);
        exit;
    }

    $empresa['ultima_edicion_perfil'] = $meta['ultima_edicion_perfil'];
    $empresa['puede_editar_perfil'] = in_array(
        strtolower((string) $meta['puede_editar_perfil']),
        ['1', 't', 'true', 'yes', 'on'],
        true
    );
    $empresa['proxima_edicion'] = $meta['proxima_edicion'];

    echo json_encode(["ok" => true, "empresa" => $empresa]);

} catch (PDOException $e) {
    error_log('[TourismEasy] get_perfil_empresa.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => $e->getMessage()]);
}
