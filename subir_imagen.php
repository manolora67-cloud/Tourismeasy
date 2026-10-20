<?php
require_once __DIR__ . '/con_db/sesion_persistente.php';
iniciarSesionPersistente();

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$ALLOWED_ORIGINS = [
    'https://web.adsoserver.site',
    'http://10.5.211.11',
];
$allowed = in_array($origin, $ALLOWED_ORIGINS) ? $origin : $ALLOWED_ORIGINS[0];

header("Access-Control-Allow-Origin: $allowed");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token, X-Upload-Type');
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

function bytesDesdeConfiguracionPHP($valor)
{
    if (!preg_match('/^\s*(\d+)\s*([KMG]?)B?\s*$/i', (string)$valor, $coincidencias)) {
        return 0;
    }
    $unidades = ['' => 1, 'K' => 1024, 'M' => 1048576, 'G' => 1073741824];
    return (int)$coincidencias[1] * $unidades[strtoupper($coincidencias[2])];
}

$tipoCarga = strtolower($_SERVER['HTTP_X_UPLOAD_TYPE'] ?? '');
$esVideo = $tipoCarga === 'video' || !empty($_FILES['video']);
if ($esVideo && !$esAdmin) {
    http_response_code(403);
    echo json_encode(["ok" => false, "error" => "Solo administración puede subir videos de portada."]);
    exit;
}

$campoArchivo = $esVideo ? 'video' : 'imagen';
if (empty($_FILES[$campoArchivo])) {
    $limitePost = bytesDesdeConfiguracionPHP(ini_get('post_max_size'));
    $longitudSolicitud = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
    if ($longitudSolicitud > 0 && $limitePost > 0 && $longitudSolicitud > $limitePost) {
        http_response_code(413);
        echo json_encode([
            "ok" => false,
            "error" => $esVideo
                ? "El servidor PHP del alojamiento rechazó el video antes de recibirlo (post_max_size: " . ini_get('post_max_size') . "). Debe permitir upload_max_filesize de al menos 12M y post_max_size de al menos 16M; revisa la configuración PHP del servidor o consulta al administrador del alojamiento."
                : "PHP rechazó la imagen antes de recibirla porque supera post_max_size (" . ini_get('post_max_size') . ").",
        ]);
        exit;
    }
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => $esVideo ? "No se recibió el video. Selecciona el archivo de nuevo." : "No se recibió ninguna imagen. Selecciona el archivo de nuevo."]);
    exit;
}

if ($_FILES[$campoArchivo]['error'] !== UPLOAD_ERR_OK) {
    $errorCarga = $_FILES[$campoArchivo]['error'];
    $mensajeCarga = match ($errorCarga) {
        UPLOAD_ERR_INI_SIZE => "El archivo supera upload_max_filesize (" . ini_get('upload_max_filesize') . "). Aumenta el límite de PHP y reinicia el servidor.",
        UPLOAD_ERR_FORM_SIZE => "El archivo supera el tamaño máximo permitido por el formulario.",
        UPLOAD_ERR_PARTIAL => "El archivo solo se recibió parcialmente. Intenta subirlo de nuevo.",
        UPLOAD_ERR_NO_TMP_DIR => "PHP no tiene disponible una carpeta temporal para recibir archivos.",
        UPLOAD_ERR_CANT_WRITE => "PHP no pudo guardar el archivo temporalmente.",
        UPLOAD_ERR_EXTENSION => "Una extensión de PHP detuvo la subida del archivo.",
        default => "No se pudo recibir el archivo. Intenta subirlo de nuevo.",
    };
    http_response_code($errorCarga === UPLOAD_ERR_INI_SIZE || $errorCarga === UPLOAD_ERR_FORM_SIZE ? 413 : 400);
    echo json_encode(["ok" => false, "error" => $mensajeCarga]);
    exit;
}

$file = $_FILES[$campoArchivo];
$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$extsPermitidas = $esVideo ? ['mp4', 'mov', 'webm'] : ['jpg', 'jpeg', 'png', 'webp', 'gif'];

if (!in_array($ext, $extsPermitidas)) {
    http_response_code(415);
    echo json_encode(["ok" => false, "error" => $esVideo ? "Tipo de archivo no permitido. Solo MP4, MOV o WEBM." : "Tipo de archivo no permitido. Solo JPG, PNG, WEBP o GIF."]);
    exit;
}

$mime = function_exists('mime_content_type') ? mime_content_type($file['tmp_name']) : null;
if (!$mime || $mime === 'application/octet-stream') {
    $header = file_get_contents($file['tmp_name'], false, null, 0, 16);
    if ($esVideo) {
        if ($ext === 'webm' && substr($header, 0, 4) === "\x1A\x45\xDF\xA3") {
            $mime = 'video/webm';
        } elseif (in_array($ext, ['mp4', 'mov'], true) && substr($header, 4, 4) === 'ftyp') {
            $mime = $ext === 'mov' ? 'video/quicktime' : 'video/mp4';
        }
    } else {
        if (substr($header, 0, 3) === "\xFF\xD8\xFF") {
            $mime = 'image/jpeg';
        } elseif (substr($header, 0, 8) === "\x89PNG\r\n\x1A\n") {
            $mime = 'image/png';
        } elseif (substr($header, 0, 6) === 'GIF87a' || substr($header, 0, 6) === 'GIF89a') {
            $mime = 'image/gif';
        } elseif (substr($header, 0, 4) === 'RIFF' && substr($header, 8, 4) === 'WEBP') {
            $mime = 'image/webp';
        }
    }
}
$mimesPermitidos = $esVideo
    ? ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v']
    : ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
if (!in_array($mime, $mimesPermitidos, true)) {
    http_response_code(415);
    echo json_encode(["ok" => false, "error" => $esVideo ? "El archivo no es un video MP4, MOV o WEBM válido." : "El archivo no es una imagen válida."]);
    exit;
}

$maxSize = $esVideo ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
if ($file['size'] > $maxSize) {
    http_response_code(413);
    echo json_encode(["ok" => false, "error" => $esVideo ? "El video no puede superar 10 MB." : "La imagen no puede superar 5 MB."]);
    exit;
}

// ── Subida a Cloudinary (signed upload) ──────────────────────────────
// Un identificador propio para la imagen, igual de estilo al que usabas
// para el nombre de archivo local: NIT_timestamp_random
$identificador = $esAdmin ? 'admin_' . $_SESSION['id_persona'] : $_SESSION['id_empresa'];
$publicId = $identificador . '_' . time() . '_' . bin2hex(random_bytes(4));

$timestamp = time();
$folder = $esVideo
    ? CLOUDINARY_FOLDER_PORTADA_VIDEOS
    : ($esAdmin ? CLOUDINARY_FOLDER_PORTADA_IMAGENES : CLOUDINARY_FOLDER);

// Los parámetros que se firman deben ir en orden alfabético, separados por &,
// sin incluir archivo, api_key, ni la propia firma.
$paramsAFirmar = [
    'folder'    => $folder,
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
    'folder'     => $folder,
    'public_id'  => $publicId,
];

$resourceType = $esVideo ? 'video' : 'image';
$url = 'https://api.cloudinary.com/v1_1/' . CLOUDINARY_CLOUD_NAME . '/' . $resourceType . '/upload';

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$respuesta = curl_exec($ch);
$curlError = curl_error($ch);
$httpCode  = curl_getinfo($ch, CURLINFO_HTTP_CODE);

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

$duration = $esVideo ? ($data['duration'] ?? null) : null;
if ($esVideo && (!is_numeric($duration) || (float)$duration > 10)) {
    $timestampEliminar = time();
    $parametrosEliminar = [
        'public_id' => $data['public_id'] ?? $publicId,
        'timestamp' => $timestampEliminar,
    ];
    ksort($parametrosEliminar);
    $cadenaEliminar = '';
    foreach ($parametrosEliminar as $key => $value) {
        $cadenaEliminar .= ($cadenaEliminar === '' ? '' : '&') . $key . '=' . $value;
    }
    $firmaEliminar = sha1($cadenaEliminar . CLOUDINARY_API_SECRET);
    $chEliminar = curl_init('https://api.cloudinary.com/v1_1/' . CLOUDINARY_CLOUD_NAME . '/video/destroy');
    curl_setopt($chEliminar, CURLOPT_POST, true);
    curl_setopt($chEliminar, CURLOPT_POSTFIELDS, [
        'public_id' => $parametrosEliminar['public_id'],
        'timestamp' => $timestampEliminar,
        'api_key' => CLOUDINARY_API_KEY,
        'signature' => $firmaEliminar,
    ]);
    curl_setopt($chEliminar, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($chEliminar, CURLOPT_TIMEOUT, 15);
    curl_exec($chEliminar);

    if ((float)($duration ?? 0) > 10) {
        http_response_code(422);
        echo json_encode(["ok" => false, "error" => "El video debe durar máximo 10 segundos."]);
    } else {
        http_response_code(502);
        echo json_encode(["ok" => false, "error" => "Cloudinary no devolvió la duración del video para validarlo."]);
    }
    exit;
}

echo json_encode([
    "ok"  => true,
    "url" => $data['secure_url'],
    "duration" => $duration,
]);