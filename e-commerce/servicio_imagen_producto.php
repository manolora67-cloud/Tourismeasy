<?php
require_once __DIR__ . '/../api/cloudinary_config.php';

function subirImagenCloudinary(string $imagen): ?string
{
    if ($imagen === '') return null;
    if (strpos($imagen, 'data:image') !== 0) return $imagen;

    $publicId = ($_SESSION['artesano_id'] ?? 'artesano') . '_' . time() . '_' . bin2hex(random_bytes(4));
    $timestamp = time();
    $cadena = 'folder=' . CLOUDINARY_FOLDER_PRODUCTOS . '&public_id=' . $publicId . '&timestamp=' . $timestamp;
    $firma = sha1($cadena . CLOUDINARY_API_SECRET);

    $ch = curl_init('https://api.cloudinary.com/v1_1/' . CLOUDINARY_CLOUD_NAME . '/image/upload');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => [
            'file' => $imagen,
            'api_key' => CLOUDINARY_API_KEY,
            'timestamp' => $timestamp,
            'signature' => $firma,
            'folder' => CLOUDINARY_FOLDER_PRODUCTOS,
            'public_id' => $publicId,
        ],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
    ]);
    $respuesta = curl_exec($ch);
    $curlError = curl_error($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    if ($respuesta === false) {
        error_log('[TourismEasy] Cloudinary cURL error: ' . $curlError);
        return null;
    }

    $data = json_decode($respuesta, true);
    if ($httpCode !== 200 || empty($data['secure_url'])) {
        error_log('[TourismEasy] Cloudinary error (HTTP ' . $httpCode . '): ' . $respuesta);
        return null;
    }
    return $data['secure_url'];
}
