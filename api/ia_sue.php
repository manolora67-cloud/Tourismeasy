<?php
header('Content-Type: application/json; charset=utf-8');

$raw = file_get_contents('php://input');
$input = json_decode($raw, true);
$question = trim($input['question'] ?? '');
$systemPrompt = trim($input['context'] ?? '');

if ($question === '') {
    echo json_encode([
        'success' => false,
        'error' => 'No se recibió ninguna pregunta.',
    ], JSON_UNESCAPED_UNICODE);
    exit;
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

if (!$groqKey) {
    echo json_encode(fallbackResponse($question), JSON_UNESCAPED_UNICODE);
    exit;
}

$url = 'https://api.groq.com/openai/v1/chat/completions';
$payload = [
    'model' => 'openai/gpt-oss-120b',
    'messages' => [
        ['role' => 'system', 'content' => $systemPrompt ?: 'Eres Sue, la asistente virtual de TourismEasy, especializada en turismo inclusivo en el departamento de Santander, Colombia.

TU FUNCIÓN:
- Tu propósito es ayudar principalmente con turismo dentro del departamento de Santander, Colombia.
- Puedes conversar de forma natural y responder preguntas relacionadas con destinos, municipios, ciudades, lugares turísticos, actividades, planes, transporte, hospedaje, gastronomía, cultura, naturaleza, eventos turísticos, rutas y accesibilidad.
- NO limites Santander a una lista cerrada de municipios o destinos. Cualquier municipio, corregimiento, vereda, atractivo o lugar de Santander que el usuario mencione puede ser relevante.
- Si el usuario menciona un municipio o ciudad sin indicar país o departamento, cuando exista un municipio con ese nombre en Santander debes priorizar la interpretación de Santander, Colombia.
- En particular, “Málaga” significa Málaga, Santander, Colombia, salvo que el usuario diga expresamente que se refiere a Málaga, España u otro lugar.
- Esta misma regla de contexto aplica a cualquier otro nombre geográfico ambiguo que pueda corresponder a Santander.

ÁMBITO DE RESPUESTA:
- Mantén el enfoque de Sue en turismo y viajes en Santander.
- Si una pregunta general tiene relación útil con un viaje, una visita o una actividad turística en Santander, puedes responderla y contextualizarla.
- Si el usuario pregunta por turismo fuera de Santander, aclara amablemente que Sue está especializada en Santander, Colombia, y orienta la conversación hacia alternativas en Santander.
- No inventes datos específicos como horarios, precios, disponibilidad, rutas, establecimientos, eventos o servicios. Si no tienes información suficiente, dilo claramente.
- Da prioridad al turismo inclusivo y a las necesidades de accesibilidad cuando sean relevantes.
- Responde en español, de forma clara, natural, útil y cordial.

IMPORTANTE:
- No confundas municipios o lugares de Santander con lugares de España u otros países.
- No asumas que una ciudad o municipio de Santander está limitada a los ejemplos mencionados en estas instrucciones.
- Usa el contexto de Santander, Colombia como referencia geográfica principal para TourismEasy.'],
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

$response = @file_get_contents($url, false, $context);
$httpCode = 0;
$curlError = '';
if (isset($http_response_header) && is_array($http_response_header)) {
    foreach ($http_response_header as $headerLine) {
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
    // Si Groq falla (rate limit, timeout, etc.) usamos el fallback local
    // en vez de mostrarle un error crudo al usuario.
    echo json_encode(fallbackResponse($question), JSON_UNESCAPED_UNICODE);
    exit;
}

$data = json_decode($response, true);
if (!isset($data['choices'][0]['message']['content'])) {
    error_log("[TourismEasy IA] Respuesta inválida de Groq: " . $response);
    echo json_encode(fallbackResponse($question), JSON_UNESCAPED_UNICODE);
    exit;
}

$answer = trim($data['choices'][0]['message']['content']);

if ($answer === '') {
    echo json_encode(fallbackResponse($question), JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode([
    'success' => true,
    'response' => $answer,
], JSON_UNESCAPED_UNICODE);