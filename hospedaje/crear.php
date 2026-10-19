<?php
require_once __DIR__ . '/../con_db/sesion_persistente.php';
iniciarSesionPersistente();
require_once __DIR__ . '/../con_db/db.php';
require_once __DIR__ . '/../cors.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método no permitido.']);
    exit;
}
if (($_SESSION['tipo'] ?? '') !== 'empresa' || empty($_SESSION['id_empresa'])) {
    http_response_code(401);
    echo json_encode(['ok' => false, 'error' => 'No autorizado.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'JSON inválido.']);
    exit;
}

try {
    $stmt = $pdo->prepare('SELECT ok::TEXT, id_hospedaje FROM fn_guardar_hospedaje(CAST(:datos AS JSONB), :empresa)');
    $stmt->execute([
        ':datos' => json_encode($input, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
        ':empresa' => $_SESSION['id_empresa'],
    ]);
    $resultado = $stmt->fetch();

    if (!$resultado || !filter_var($resultado['ok'], FILTER_VALIDATE_BOOLEAN)) {
        http_response_code(422);
        echo json_encode(['ok' => false, 'error' => 'No se pudo guardar el hospedaje. Verifica los datos, la cuenta y los servicios activos.']);
        exit;
    }
    echo json_encode(['ok' => true, 'id' => (string)$resultado['id_hospedaje']]);
} catch (Throwable $e) {
    error_log('[TourismEasy] hospedaje/crear.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Error al guardar el hospedaje.']);
}