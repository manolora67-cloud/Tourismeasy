<?php
declare(strict_types=1);

$config = require dirname(__DIR__) . '/api/config.php';
$token = $config['mapillary_access_token'] ?? null;

function respondJson(int $status, array $payload): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function mapillaryRequest(string $path, array $parameters, string $token): array
{
    $url = 'https://graph.mapillary.com/' . ltrim($path, '/') . '?' . http_build_query($parameters);
    $request = curl_init($url);
    if ($request === false) {
        throw new RuntimeException('No se pudo iniciar la consulta de Mapillary.');
    }

    curl_setopt_array($request, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_PROTOCOLS => CURLPROTO_HTTPS,
        CURLOPT_HTTPHEADER => [
            'Accept: application/json',
            'Authorization: OAuth ' . $token,
        ],
    ]);

    $body = curl_exec($request);
    $status = (int) curl_getinfo($request, CURLINFO_HTTP_CODE);
    $error = curl_error($request);
    if (!is_string($body)) {
        throw new RuntimeException('Falló la conexión con Mapillary: ' . $error);
    }
    if ($status < 200 || $status >= 300) {
        throw new RuntimeException('Mapillary respondió con HTTP ' . $status . '.');
    }

    $data = json_decode($body, true);
    if (!is_array($data)) {
        throw new RuntimeException('Mapillary devolvió una respuesta inválida.');
    }
    return $data;
}

function isPanorama(array $image): bool
{
    return filter_var($image['is_pano'] ?? false, FILTER_VALIDATE_BOOLEAN)
        && !empty($image['thumb_2048_url']);
}

function isAllowedMapillaryImageUrl($imageUrl): bool
{
    if (!is_string($imageUrl)
        || filter_var($imageUrl, FILTER_VALIDATE_URL) === false
        || parse_url($imageUrl, PHP_URL_SCHEME) !== 'https') {
        return false;
    }

    $imageHost = strtolower((string) parse_url($imageUrl, PHP_URL_HOST));
    return $imageHost === 'fbcdn.net'
        || substr($imageHost, -strlen('.fbcdn.net')) === '.fbcdn.net'
        || $imageHost === 'mapillary.com'
        || substr($imageHost, -strlen('.mapillary.com')) === '.mapillary.com';
}

function distanceMeters(float $latitudeA, float $longitudeA, float $latitudeB, float $longitudeB): float
{
    $latitudeDelta = deg2rad($latitudeB - $latitudeA);
    $longitudeDelta = deg2rad($longitudeB - $longitudeA);
    $a = sin($latitudeDelta / 2) ** 2
        + cos(deg2rad($latitudeA)) * cos(deg2rad($latitudeB)) * sin($longitudeDelta / 2) ** 2;
    return 6371000 * 2 * atan2(sqrt($a), sqrt(1 - $a));
}

function requireSameOrigin(): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin === '') {
        return;
    }

    $originHost = strtolower((string) parse_url($origin, PHP_URL_HOST));
    $requestHost = strtolower((string) preg_replace('/:\d+$/', '', $_SERVER['HTTP_HOST'] ?? ''));
    if ($originHost === '' || $originHost !== $requestHost) {
        respondJson(403, ['error' => 'Origen de solicitud no permitido.']);
    }
}

requireSameOrigin();
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') {
    respondJson(405, ['error' => 'Método no permitido.']);
}
if (!is_string($token) || trim($token) === '') {
    respondJson(503, ['error' => 'Configura MAPILLARY_ACCESS_TOKEN únicamente en el servidor.']);
}

$imageId = $_GET['image'] ?? null;
if (is_string($imageId) && $imageId !== '') {
    if (!preg_match('/^\d{1,32}$/', $imageId)) {
        respondJson(400, ['error' => 'Identificador de imagen inválido.']);
    }

    $image = [];
    try {
        $image = mapillaryRequest($imageId, ['fields' => 'id,is_pano,thumb_2048_url'], $token);
    } catch (RuntimeException $error) {
        error_log($error->getMessage());
        respondJson(502, ['error' => 'No se pudo consultar la imagen panorámica en Mapillary.']);
    }
    if (!isPanorama($image)) {
        respondJson(404, ['error' => 'La imagen de Mapillary no es un panorama 360.']);
    }

    $imageUrl = $image['thumb_2048_url'] ?? null;
    if (!isAllowedMapillaryImageUrl($imageUrl)) {
        respondJson(502, ['error' => 'Mapillary devolvió una dirección de imagen no válida.']);
    }

    header('Location: ' . $imageUrl, true, 302);
    header('Cache-Control: no-store');
    exit;
}

$latitude = filter_var($_GET['lat'] ?? null, FILTER_VALIDATE_FLOAT);
$longitude = filter_var($_GET['lon'] ?? null, FILTER_VALIDATE_FLOAT);
if ($latitude === false || $longitude === false
    || $latitude < 5.3 || $latitude > 7.7 || $longitude < -74.5 || $longitude > -72.0) {
    respondJson(400, ['error' => 'Coordenadas fuera de la zona turística configurada.']);
}

try {
    $results = mapillaryRequest('images', [
        'fields' => 'id,is_pano,thumb_2048_url,captured_at,computed_geometry,creator',
        'lat' => $latitude,
        'lng' => $longitude,
        'radius' => 50,
        'limit' => 100,
    ], $token);
} catch (RuntimeException $error) {
    error_log($error->getMessage());
    respondJson(502, ['error' => 'No se pudo buscar cobertura 360 en Mapillary.']);
}

$candidates = [];
$images = $results['data'] ?? [];
if (!is_array($images)) {
    respondJson(502, ['error' => 'Mapillary devolvió una lista de imágenes inválida.']);
}
foreach ($images as $image) {
    if (!is_array($image) || !isPanorama($image)) {
        continue;
    }
    $imageUrl = $image['thumb_2048_url'] ?? null;
    if (!isAllowedMapillaryImageUrl($imageUrl)) {
        continue;
    }
    $imageId = $image['id'] ?? null;
    if (!is_scalar($imageId) || !preg_match('/^\d{1,32}$/', (string) $imageId)) {
        continue;
    }
    $coordinates = $image['computed_geometry']['coordinates'] ?? null;
    if (!is_array($coordinates) || count($coordinates) < 2) {
        continue;
    }
    $distance = distanceMeters($latitude, $longitude, (float) $coordinates[1], (float) $coordinates[0]);
    if ($distance <= 50) {
        $image['distance_meters'] = $distance;
        $candidates[] = $image;
    }
}
usort($candidates, static function (array $first, array $second): int {
    return $first['distance_meters'] <=> $second['distance_meters'];
});

foreach ($candidates as $image) {
    $creatorId = $image['creator']['id'] ?? $image['creator'] ?? null;
    if (!is_scalar($creatorId) || !preg_match('/^\d{1,32}$/', (string) $creatorId)) {
        continue;
    }
    try {
        $creator = mapillaryRequest((string) $creatorId, ['fields' => 'username'], $token);
    } catch (RuntimeException $error) {
        error_log($error->getMessage());
        continue;
    }
    $creatorName = $creator['username'] ?? null;
    if (!is_string($creatorName) || trim($creatorName) === '') {
        continue;
    }

    $id = (string) $imageId;
    respondJson(200, [
        'id' => $id,
        'imageUrl' => $imageUrl,
        'sourceUrl' => 'https://www.mapillary.com/app/?pKey=' . rawurlencode($id),
        'creatorName' => $creatorName,
        'license' => 'CC BY-SA 4.0',
        'capturedAt' => $image['captured_at'] ?? null,
        'distanceMeters' => (int) round($image['distance_meters']),
    ]);
}

respondJson(404, ['error' => 'Mapillary no tiene un panorama 360 disponible cerca de este municipio.']);
