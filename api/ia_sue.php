<?php
header('Content-Type: application/json; charset=utf-8');

$raw = file_get_contents('php://input');
$input = json_decode($raw, true);
$question = trim($input['question'] ?? '');
$systemPrompt = trim($input['context'] ?? '');

function identificarCategoriaCatalogo(string $question): ?string
{
    $question = mb_strtolower($question, 'UTF-8');

    $categorias = [
        'transportes' => '/\b(transportes?|rutas?|buses?|autobuses?)\b/u',
        'hospedajes' => '/\b(hospedajes?|hoteles?|alojamientos?|hostales?|posadas?)\b/u',
        'planes' => '/\b(planes?|tours?|paquetes?|excursiones?|experiencias?|actividades?)\b/u',
        'productos' => '/\b(productos?|artesan[ií]as?|bisuter[ií]a|alfarer[ií]a|talleres?)\b/u',
        'artesanos' => '/\b(artesanos?|artesanas?)\b/u',
        'empresas' => '/\b(empresas?|operadores?)\b/u',
        'festividades' => '/\b(festividades?|fiestas?|festivales?|ferias?)\b/u',
        'municipios' => '/\b(municipios?|ciudades?|pueblos?|destinos?)\b/u',
    ];

    foreach ($categorias as $categoria => $patron) {
        if (preg_match($patron, $question) === 1) {
            return $categoria;
        }
    }

    return null;
}

function cargarDatosCatalogo(string $categoria): array
{
    require_once __DIR__ . '/../con_db/db.php';

    $stmt = $pdo->prepare('SELECT fn_consultar_catalogo_sue(:categoria)');
    $stmt->execute(['categoria' => $categoria]);
    $datos = $stmt->fetchColumn();
    $resultados = json_decode((string)$datos, true);

    if (!is_array($resultados)) {
        throw new RuntimeException('La consulta de catálogo devolvió una respuesta inválida.');
    }

    return $resultados;
}

function formatearDatosCatalogo(string $categoria, array $resultados): string
{
    if ($resultados === []) {
        return 'No encontré información disponible en la base de datos para esa categoría.';
    }

    $respuesta = "Información consultada en la base de datos ({$categoria}):\n";

    foreach ($resultados as $resultado) {
        $detalles = [];
        foreach ($resultado as $campo => $valor) {
            if ($valor === null || $valor === '' || is_array($valor)) {
                continue;
            }

            $detalles[] = str_replace('_', ' ', $campo) . ': ' . $valor;
        }
        $respuesta .= "\n• " . implode(' · ', $detalles);
    }

    return $respuesta;
}

if ($question === '') {
    echo json_encode([
        'success' => false,
        'error' => 'No se recibió ninguna pregunta.',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$categoriaCatalogo = identificarCategoriaCatalogo($question);
$datosCatalogo = null;
if ($categoriaCatalogo !== null) {
    try {
        $datosCatalogo = cargarDatosCatalogo($categoriaCatalogo);
    } catch (Throwable $e) {
        error_log('[TourismEasy IA] No se pudo consultar el catálogo: ' . $e->getMessage());
        echo json_encode([
            'success' => true,
            'response' => 'No pude consultar esa información ahora mismo. Inténtalo de nuevo más tarde.',
        ], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
        exit;
    }

    if ($datosCatalogo === []) {
        echo json_encode([
            'success' => true,
            'response' => formatearDatosCatalogo($categoriaCatalogo, $datosCatalogo),
        ], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
        exit;
    }
}

$groqKey = require __DIR__ . '/config.php';
$groqKey = $groqKey['groq_key'] ?? null;

function fallbackResponse(string $question): array
{
    $question = mb_strtolower($question, 'UTF-8');

    if (preg_match('/\b(hola|buenas|buenos dias|buenas tardes|buenas noches|hey)\b/u', $question)) {
        return [
            'success' => true,
            'response' => '¡Hola! 👋 Soy Sue, tu asistente para viajes inclusivos en Santander. ¿En qué puedo ayudarte hoy?',
        ];
    }

    if (preg_match('/\b(transporte|terminal|bus|autobus|ruta|boleto|viajar|llegar|salida|movi)\b/u', $question)) {
        return [
            'success' => true,
            'response' => 'En Santander puedes tomar transporte intermunicipal desde la Terminal de Bucaramanga a destinos como San Gil, Barichara, Socorro y Giron. TourismEasy también te ayuda con opciones de transporte adaptado y guías para movilidad reducida.',
        ];
    }

    if (preg_match('/\b(hospedaje|hotel|alojamiento|posada|hostal|habitacion|cama|reserva)\b/u', $question)) {
        return [
            'success' => true,
            'response' => 'En la plataforma encontrarás hospedajes accesibles con rampas, baños adaptados y opciones inclusivas. Selecciona la sección de hospedaje y filtra por accesibilidad para ver las mejores opciones.',
        ];
    }

    if (preg_match('/\b(destino|destinos|barichara|canon|canyon|san gil|bucaramanga|santander|giron|velez|los santos|socorro)\b/u', $question)) {
        return [
            'success' => true,
            'response' => 'Santander tiene destinos como Barichara para turismo colonial, San Gil para aventura adaptada y el Cañon del Chicamocha para vistas accesibles. Puedes explorar planes en la plataforma según tu necesidad.',
        ];
    }

    if (preg_match('/\b(plan|planes|tour|actividad|paquete|excursion|experiencia)\b/u', $question)) {
        return [
            'success' => true,
            'response' => 'TourismEasy ofrece planes turísticos inclusivos con guías especializados y actividades adaptadas. Elige el tipo de experiencia que buscas y te guiaré a la mejor opción.',
        ];
    }

    if (preg_match('/\b(discapacidad|accesibilidad|inclusivo|inclusiva|silla de ruedas|visual|auditiva)\b/u', $question)) {
        return [
            'success' => true,
            'response' => 'Puedes encontrar servicios accesibles en transporte, hospedaje y planes. Si necesitas apoyo especial, pregunta por opciones para movilidad reducida, discapacidad visual o auditiva.',
        ];
    }

    return [
        'success' => true,
        'response' => 'Lo siento, no tengo una respuesta exacta para eso ahora mismo. Pregunta sobre transporte, hospedaje, destinos, planes o accesibilidad en Santander.',
    ];
}

function respuestaConDatosOFallback(string $question, ?array $datosCatalogo, ?string $categoria): array
{
    if ($datosCatalogo !== null && $categoria !== null) {
        return [
            'success' => true,
            'response' => formatearDatosCatalogo($categoria, $datosCatalogo),
        ];
    }

    return fallbackResponse($question);
}

if (!$groqKey) {
    echo json_encode(
        respuestaConDatosOFallback($question, $datosCatalogo, $categoriaCatalogo),
        JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE
    );
    exit;
}

$promptAsistente = $systemPrompt ?: 'Eres Sue, la asistente virtual de TourismEasy, especializada en turismo inclusivo en Santander, Colombia. Responde en español, de forma clara, cordial y concisa. No inventes datos de servicios.';
if ($datosCatalogo !== null && $categoriaCatalogo !== null) {
    $promptAsistente .= "\n\nDatos de {$categoriaCatalogo} consultados en la base de datos:\n";
    $promptAsistente .= json_encode($datosCatalogo, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    $promptAsistente .= "\nUsa solo estos datos para responder sobre esta categoría. No inventes ni completes información que no aparezca aquí.";
}

$url = 'https://api.groq.com/openai/v1/chat/completions';
$payload = [
    'model' => 'openai/gpt-oss-120b',
    'messages' => [
        ['role' => 'system', 'content' => $promptAsistente],
        ['role' => 'user', 'content' => $question],
    ],
    'temperature' => 0.7,
    'max_completion_tokens' => 450,
    'top_p' => 0.95,
];

$context = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/json\r\n" .
                    "Authorization: Bearer " . $groqKey . "\r\n",
        'content' => json_encode($payload, JSON_UNESCAPED_UNICODE),
        'ignore_errors' => true,
        'timeout' => 20,
    ],
]);

$responseStream = @fopen($url, 'rb', false, $context);
$response = $responseStream === false ? false : stream_get_contents($responseStream);
$responseHeaders = [];
if ($responseStream !== false) {
    $streamMetadata = stream_get_meta_data($responseStream);
    $responseHeaders = is_array($streamMetadata['wrapper_data'] ?? null)
        ? $streamMetadata['wrapper_data']
        : [];
    fclose($responseStream);
}

$httpCode = 0;
$curlError = '';
if ($responseHeaders !== []) {
    foreach ($responseHeaders as $headerLine) {
        if (preg_match('#^HTTP/\d\.\d\s+(\d+)#', $headerLine, $matches)) {
            $httpCode = (int) $matches[1];
            break;
        }
    }
}
if ($response === false) {
    $curlError = 'Error al conectarse a Groq';
}

if ($response === false || $httpCode !== 200) {
    error_log("[TourismEasy IA] Groq error HTTP {$httpCode}: {$curlError}");
    echo json_encode(
        respuestaConDatosOFallback($question, $datosCatalogo, $categoriaCatalogo),
        JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE
    );
    exit;
}

$data = json_decode($response, true);
if (!isset($data['choices'][0]['message']['content'])) {
    error_log("[TourismEasy IA] Respuesta inválida de Groq: " . $response);
    echo json_encode(
        respuestaConDatosOFallback($question, $datosCatalogo, $categoriaCatalogo),
        JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE
    );
    exit;
}

$answer = trim($data['choices'][0]['message']['content']);

if ($answer === '') {
    echo json_encode(
        respuestaConDatosOFallback($question, $datosCatalogo, $categoriaCatalogo),
        JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE
    );
    exit;
}

echo json_encode([
    'success' => true,
    'response' => $answer,
], JSON_UNESCAPED_UNICODE);