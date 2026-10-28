<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../con_db/db.php';

header('Content-Type: application/json; charset=utf-8');

function responderClickWhatsApp(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responderClickWhatsApp(405, ['ok' => false, 'error' => 'Método no permitido.']);
}

try {
    $payload = json_decode(file_get_contents('php://input'), true, 512, JSON_THROW_ON_ERROR);
} catch (JsonException $e) {
    responderClickWhatsApp(400, ['ok' => false, 'error' => 'El cuerpo JSON no es válido.']);
}

if (!is_array($payload)) {
    responderClickWhatsApp(400, ['ok' => false, 'error' => 'El cuerpo de la solicitud no es válido.']);
}

$categoria = $payload['categoria'] ?? null;
$idProducto = $payload['id_producto'] ?? null;
$categoriasPermitidas = ['Hospedaje', 'Plan', 'Transporte', 'Artesanía'];

if (!is_string($categoria) || !in_array($categoria, $categoriasPermitidas, true)) {
    responderClickWhatsApp(400, ['ok' => false, 'error' => 'La categoría no es válida.']);
}

$idProductoTexto = is_string($idProducto) || is_int($idProducto)
    ? (string)$idProducto
    : '';
if (!preg_match('/^[1-9][0-9]{0,9}$/D', $idProductoTexto)) {
    responderClickWhatsApp(400, ['ok' => false, 'error' => 'El producto no es válido.']);
}

try {
    $userAgent = trim((string)($_SERVER['HTTP_USER_AGENT'] ?? ''));
    $stmt = $pdo->prepare(
        'SELECT fn_registrar_click_whatsapp(
            CAST(:categoria AS VARCHAR(50)),
            CAST(:producto AS VARCHAR(10)),
            CAST(:user_agent AS TEXT)
        )'
    );
    $stmt->execute([
        ':categoria' => $categoria,
        ':producto' => $idProductoTexto,
        ':user_agent' => $userAgent !== '' ? $userAgent : 'Desconocido',
    ]);
    $idClick = $stmt->fetchColumn();
    if ($idClick === false || $idClick === null) {
        responderClickWhatsApp(404, ['ok' => false, 'error' => 'El producto ya no está disponible.']);
    }

    responderClickWhatsApp(201, ['ok' => true, 'id_click' => (int)$idClick]);
} catch (Throwable $e) {
    error_log('[TourismEasy] api/registrar_click_whatsapp.php - ' . $e->getMessage());
    responderClickWhatsApp(500, ['ok' => false, 'error' => 'No se pudo registrar el clic.']);
}
