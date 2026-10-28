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

$consultasProducto = [
    'Hospedaje' => 'SELECT ID_EMPRESA, ID_CIUDAD FROM HOSPEDAJE WHERE ID_HOSPEDAJE = :id AND DISPONIBILIDAD = TRUE',
    'Plan' => 'SELECT ID_EMPRESA, ID_CIUDAD FROM PLANES_TURISTICOS WHERE ID_PLAN_TURISTICO = :id AND DISPONIBILIDAD = TRUE',
    'Transporte' => 'SELECT ID_EMPRESA, ID_CIUDAD_DESTINO AS ID_CIUDAD FROM TRANSPORTE WHERE ID_TRANSPORTE = :id AND DISPONIBILIDAD = TRUE',
    'Artesanía' => 'SELECT NULL::VARCHAR(10) AS ID_EMPRESA, ID_CIUDAD FROM PRODUCTOS_ARTESANALES WHERE ID_PRODUCTO = :id',
];

try {
    $productoStmt = $pdo->prepare($consultasProducto[$categoria]);
    $productoStmt->execute([':id' => $idProductoTexto]);
    $producto = $productoStmt->fetch();
    if (!$producto) {
        responderClickWhatsApp(404, ['ok' => false, 'error' => 'El producto ya no está disponible.']);
    }

    $userAgent = trim((string)($_SERVER['HTTP_USER_AGENT'] ?? ''));
    if ($userAgent === '') {
        $userAgent = 'Desconocido';
    }

    $insertar = $pdo->prepare(
        'INSERT INTO LOGS_CLICS_WEB_EXTERNOS
            (FECHA_HORA, ID_EMPRESA, ID_PRODUCTO, TIPO_CATEGORIA, ID_CIUDAD, USER_AGENT)
         VALUES
            (CURRENT_TIMESTAMP, :empresa, :producto, :categoria, :ciudad, :user_agent)
         RETURNING ID_CLICK'
    );
    $insertar->execute([
        ':empresa' => $producto['id_empresa'],
        ':producto' => $idProductoTexto,
        ':categoria' => $categoria,
        ':ciudad' => $producto['id_ciudad'],
        ':user_agent' => substr($userAgent, 0, 255),
    ]);

    responderClickWhatsApp(201, ['ok' => true, 'id_click' => $insertar->fetchColumn()]);
} catch (Throwable $e) {
    error_log('[TourismEasy] api/registrar_click_whatsapp.php - ' . $e->getMessage());
    responderClickWhatsApp(500, ['ok' => false, 'error' => 'No se pudo registrar el clic.']);
}
