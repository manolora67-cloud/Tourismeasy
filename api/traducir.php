<?php
header('Content-Type: application/json; charset=utf-8');

function responderTraduccion(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

function textosIguales(string $first, string $second): bool
{
    $first = trim($first);
    $second = trim($second);
    if (function_exists('mb_strtolower')) {
        return mb_strtolower($first, 'UTF-8') === mb_strtolower($second, 'UTF-8');
    }

    return strtolower($first) === strtolower($second);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    responderTraduccion(405, ['error' => 'Método no permitido.']);
}

try {
    $input = json_decode((string)file_get_contents('php://input'), true, 512, JSON_THROW_ON_ERROR);
} catch (JsonException $error) {
    responderTraduccion(400, ['error' => 'El cuerpo de la solicitud no es JSON válido.']);
}

if (!is_array($input)) {
    responderTraduccion(400, ['error' => 'El cuerpo de la solicitud debe ser un objeto JSON.']);
}

$configuracion = require __DIR__ . '/config.php';
$myMemoryEmail = $configuracion['mymemory_email'] ?? null;

$texts = $input['texts'] ?? null;
if (
    !is_array($texts)
    || array_keys($texts) !== range(0, count($texts) - 1)
    || count($texts) < 1
    || count($texts) > 5
) {
    responderTraduccion(400, ['error' => 'Envía entre 1 y 5 textos por solicitud.']);
}

$characterCount = 0;
foreach ($texts as $text) {
    if (!is_string($text) || trim($text) === '') {
        responderTraduccion(400, ['error' => 'Cada elemento debe ser un texto no vacío.']);
    }

    $length = strlen($text);
    if ($length > 500) {
        responderTraduccion(413, ['error' => 'Cada texto debe tener como máximo 500 bytes.']);
    }
    $characterCount += $length;
}
if ($characterCount > 2000) {
    responderTraduccion(413, ['error' => 'La solicitud supera el límite de 2.000 bytes.']);
}

$translations = [];
foreach ($texts as $text) {
    $parameters = [
        'q' => $text,
        'langpair' => 'es|en',
    ];
    if ($myMemoryEmail !== null) {
        $parameters['de'] = $myMemoryEmail;
    }
    $url = 'https://api.mymemory.translated.net/get?' . http_build_query(
        $parameters,
        '',
        '&',
        PHP_QUERY_RFC3986
    );
    $curl = curl_init($url);
    if ($curl === false) {
        error_log('[TourismEasy Translator] No se pudo inicializar cURL.');
        responderTraduccion(500, ['error' => 'No se pudo iniciar la conexión con el servicio de traducción.']);
    }

    curl_setopt_array($curl, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_USERAGENT => 'TourismEasy/1.0',
    ]);

    $response = curl_exec($curl);
    $httpCode = (int)curl_getinfo($curl, CURLINFO_HTTP_CODE);
    $curlError = $response === false ? curl_error($curl) : '';
    if (PHP_VERSION_ID < 80000) {
        curl_close($curl);
    }

    if ($response === false || $httpCode !== 200) {
        error_log("[TourismEasy Translator] MyMemory respondió HTTP {$httpCode}: {$curlError}");
        responderTraduccion(502, ['error' => 'MyMemory no está disponible en este momento.']);
    }

    try {
        $result = json_decode($response, true, 512, JSON_THROW_ON_ERROR);
    } catch (JsonException $error) {
        error_log('[TourismEasy Translator] MyMemory devolvió una respuesta JSON inválida.');
        responderTraduccion(502, ['error' => 'El servicio de traducción devolvió una respuesta inválida.']);
    }

    if (!is_array($result)) {
        error_log('[TourismEasy Translator] MyMemory devolvió una respuesta inesperada.');
        responderTraduccion(502, ['error' => 'El servicio de traducción devolvió una respuesta inválida.']);
    }

    if (($result['quotaFinished'] ?? false) === true) {
        responderTraduccion(429, ['error' => 'Se alcanzó la cuota diaria gratuita de MyMemory. Inténtalo mañana.']);
    }

    $translatedText = $result['responseData']['translatedText'] ?? null;
    if (($result['responseStatus'] ?? null) !== 200 || !is_string($translatedText)) {
        $errorCode = (string)($result['responseStatus'] ?? 0);
        error_log("[TourismEasy Translator] MyMemory devolvió error {$errorCode}.");
        responderTraduccion(502, ['error' => 'MyMemory no pudo traducir este texto.']);
    }

    $translations[] = html_entity_decode($translatedText, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $translationIndex = count($translations) - 1;
    if (textosIguales($translations[$translationIndex], $text)) {
        foreach (($result['matches'] ?? []) as $match) {
            if (
                is_array($match)
                && is_string($match['segment'] ?? null)
                && is_string($match['translation'] ?? null)
                && textosIguales($match['segment'], $text)
                && !textosIguales($match['translation'], $text)
            ) {
                $translations[$translationIndex] = html_entity_decode(
                    $match['translation'],
                    ENT_QUOTES | ENT_HTML5,
                    'UTF-8'
                );
                break;
            }
        }
    }
}

responderTraduccion(200, ['translations' => $translations]);
