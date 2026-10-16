<?php
session_start();

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$ALLOWED_ORIGINS = [
    'https://web.adsoserver.site',
    'http://10.5.211.11',
];
$allowed = in_array($origin, $ALLOWED_ORIGINS) ? $origin : $ALLOWED_ORIGINS[0];

header("Access-Control-Allow-Origin: $allowed");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/api/cloudinary_config.php';

$tipoSesion = $_SESSION['tipo'] ?? '';
$esEmpresa = $tipoSesion === 'empresa' && !empty($_SESSION['id_empresa']);
$esAdmin = $tipoSesion === 'admin' && !empty($_SESSION['id_persona']);
if (!$esEmpresa && !$esAdmin) {
    http_response_code(401);
    echo json_encode(["ok" => false, "error" => "No autorizado."]);
    exit;
}

if ($esAdmin) {
    $csrf = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (empty($_SESSION['csrf_portada']) || !hash_equals($_SESSION['csrf_portada'], $csrf)) {
        http_response_code(403);
        echo json_encode(["ok" => false, "error" => "La sesión de edición expiró. Recarga el panel e intenta de nuevo."]);
        exit;
    }
}

if (empty($_FILES['imagen']) || $_FILES['imagen']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "No se recibió ninguna imagen o hubo un error al subirla."]);
    exit;
}

$file = $_FILES['imagen'];
$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$extsPermitidas = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

if (!in_array($ext, $extsPermitidas)) {
    echo json_encode(["ok" => false, "error" => "Tipo de archivo no permitido. Solo JPG, PNG, WEBP o GIF."]);
    exit;
}

if (function_exists('mime_content_type')) {
    $mime = mime_content_type($file['tmp_name']);
    $mimesPermitidos = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!in_array($mime, $mimesPermitidos)) {
        echo json_encode(["ok" => false, "error" => "El archivo no es una imagen válida."]);
        exit;
    }
}

if ($file['size'] > 5 * 1024 * 1024) {
    echo json_encode(["ok" => false, "error" => "La imagen no puede superar 5MB."]);
    exit;
}

// ── Subida a Cloudinary (signed upload) ──────────────────────────────
// Un identificador propio para la imagen, igual de estilo al que usabas
// para el nombre de archivo local: NIT_timestamp_random
$identificador = $esAdmin ? 'admin_' . $_SESSION['id_persona'] : $_SESSION['id_empresa'];
$publicId = $identificador . '_' . time() . '_' . bin2hex(random_bytes(4));

$timestamp = time();

// Los parámetros que se firman deben ir en orden alfabético, separados por &,
// sin incluir archivo, api_key, ni la propia firma.
$paramsAFirmar = [
    'folder'    => CLOUDINARY_FOLDER,
    'public_id' => $publicId,
    'timestamp' => $timestamp,
];
ksort($paramsAFirmar);

$stringAFirmar = '';
foreach ($paramsAFirmar as $key => $value) {
    $stringAFirmar .= ($stringAFirmar === '' ? '' : '&') . $key . '=' . $value;
}

$signature = sha1($stringAFirmar . CLOUDINARY_API_SECRET);

$postFields = [
    'file'       => new CURLFile($file['tmp_name'], $mime ?? 'application/octet-stream', $file['name']),
    'api_key'    => CLOUDINARY_API_KEY,
    'timestamp'  => $timestamp,
    'signature'  => $signature,
    'folder'     => CLOUDINARY_FOLDER,
    'public_id'  => $publicId,
];

$url = 'https://api.cloudinary.com/v1_1/' . CLOUDINARY_CLOUD_NAME . '/image/upload';

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$respuesta = curl_exec($ch);
$curlError = curl_error($ch);
$httpCode  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($respuesta === false) {
    http_response_code(500);
    echo json_encode([
        "ok"    => false,
        "error" => "No se pudo conectar con el servicio de imágenes.",
        "debug" => ["curl_error" => $curlError],
    ]);
    exit;
}

$data = json_decode($respuesta, true);

if ($httpCode !== 200 || empty($data['secure_url'])) {
    http_response_code(500);
    echo json_encode([
        "ok"    => false,
        "error" => "No se pudo guardar la imagen en el servicio externo.",
        "debug" => [
            "http_code" => $httpCode,
            "respuesta" => $data,
        ],
    ]);
    exit;
}

echo json_encode([
    "ok"  => true,
    "url" => $data['secure_url'],
]);