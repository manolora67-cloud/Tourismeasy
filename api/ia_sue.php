<?php
header('Content-Type: application/json; charset=utf-8');

$raw = file_get_contents('php://input');
$input = json_decode($raw, true);
$question = trim($input['question'] ?? '');
$history = $input['history'] ?? [];
if (!is_array($history)) {
    $history = [];
}
$history = array_values(array_filter(
    $history,
    static fn($message) =>
        is_array($message)
        && in_array($message['role'] ?? null, ['user', 'assistant'], true)
        && is_string($message['content'] ?? null)
        && !(
            ($message['role'] ?? null) === 'assistant'
            && preg_match('/base\s+de\s+datos|datos?\s+registrad[oa]s?\s+en\s+la\s+base/iu', $message['content']) === 1
        )
));
$history = array_slice($history, -10);

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

function normalizarTextoMunicipio(string $texto): string
{
    $texto = mb_strtolower(trim($texto), 'UTF-8');
    return strtr($texto, [
        'á' => 'a',
        'é' => 'e',
        'í' => 'i',
        'ó' => 'o',
        'ú' => 'u',
        'ü' => 'u',
    ]);
}

function buscarMunicipiosMencionados(string $question): array
{
    $municipios = cargarDatosCatalogo('municipios');
    $preguntaNormalizada = normalizarTextoMunicipio($question);
    $mencionados = [];

    foreach ($municipios as $municipio) {
        $nombre = trim((string)($municipio['municipio'] ?? ''));
        if ($nombre === '') {
            continue;
        }

        $nombreNormalizado = preg_quote(normalizarTextoMunicipio($nombre), '/');
        if (
            preg_match(
                '/(?<![\p{L}\p{N}])' . $nombreNormalizado . '(?![\p{L}\p{N}])/u',
                $preguntaNormalizada,
                $coincidencia,
                PREG_OFFSET_CAPTURE
            ) === 1
        ) {
            $mencionados[] = [
                'nombre' => $nombre,
                'posicion' => $coincidencia[0][1],
            ];
        }
    }

    usort($mencionados, static fn(array $a, array $b): int => $a['posicion'] <=> $b['posicion']);

    return array_values(array_unique(array_column($mencionados, 'nombre')));
}

function cargarTransportesPorRuta(?string $origen, ?string $destino): array
{
    require_once __DIR__ . '/../con_db/db.php';

    $filtros = [];
    $parametros = [];

    if ($origen !== null) {
        $filtros[] = 'LOWER(BTRIM(co.NOM_CIUDAD)) = LOWER(BTRIM(:origen))';
        $parametros['origen'] = $origen;
    }

    if ($destino !== null) {
        $filtros[] = 'LOWER(BTRIM(cd.NOM_CIUDAD)) = LOWER(BTRIM(:destino))';
        $parametros['destino'] = $destino;
    }

    $stmt = $pdo->prepare(
        'SELECT
            t.ORIGEN AS origen,
            t.DESTINO AS destino,
            t.FECHA_SALIDA AS fecha_salida,
            t.HORA_SALIDA AS hora_salida,
            t.PRECIO AS precio,
            e.NOM_EMPRESA AS empresa,
            cst.NOMBRE_CLASE AS nombre_clase
        FROM TRANSPORTE t
        JOIN EMPRESAS e ON e.ID_EMPRESA = t.ID_EMPRESA
        JOIN CIUDADES co ON co.ID_CIUDAD = t.ID_CIUDAD_ORIGEN
        JOIN CIUDADES cd ON cd.ID_CIUDAD = t.ID_CIUDAD_DESTINO
        LEFT JOIN TRANSPORTE_CLASE tc ON tc.ID_TRANSPORTE = t.ID_TRANSPORTE
        LEFT JOIN CLASE_SERVICIO_TRANSPORTE cst ON cst.ID_CLASE = tc.ID_CLASE
        WHERE t.DISPONIBILIDAD = TRUE
          AND t.FECHA_SALIDA >= CURRENT_DATE
          AND ' . implode("\n          AND ", $filtros) . '
        ORDER BY t.FECHA_SALIDA, t.HORA_SALIDA
        LIMIT 6'
    );
    $stmt->execute($parametros);

    return $stmt->fetchAll();
}

function respuestaMunicipiosSantander(array $municipios): string
{
    $nombres = count($municipios) > 1
        ? implode(', ', array_slice($municipios, 0, -1)) . ' y ' . end($municipios)
        : $municipios[0];

    return "{$nombres} " . (count($municipios) > 1 ? 'son municipios' : 'es un municipio') .
        " de Santander, Colombia. En TourismEasy puedo ayudarte a consultar opciones de transporte, hospedaje y planes turísticos para esos destinos.";
}

function formatearDatosCatalogo(string $categoria, array $resultados, ?string $contexto = null): string
{
    if ($resultados === []) {
        return $contexto === null
            ? 'No encontré opciones disponibles para esa categoría.'
            : "No encontré opciones disponibles {$contexto}.";
    }

    $etiquetasCategoria = [
        'transportes' => 'transportes',
        'hospedajes' => 'hospedajes',
        'planes' => 'planes turísticos',
        'productos' => 'productos artesanales',
        'artesanos' => 'artesanos',
        'empresas' => 'empresas turísticas',
        'festividades' => 'festividades',
        'municipios' => 'municipios',
    ];
    $camposVisibles = [
        'transportes' => ['origen', 'destino', 'fecha_salida', 'hora_salida', 'precio', 'empresa', 'nombre_clase'],
        'hospedajes' => ['nombre', 'tipo', 'ciudad', 'precio_noche', 'accesibilidad', 'capacidad_max', 'empresa', 'servicios'],
        'planes' => ['nombre', 'tipo', 'ciudad', 'precio', 'duracion', 'accesibilidad', 'empresa', 'incluye', 'descripcion'],
        'productos' => ['nombre', 'categoria', 'precio', 'municipio', 'artesano', 'descripcion'],
        'artesanos' => ['artesano', 'productos', 'municipios'],
        'empresas' => ['empresa', 'servicio', 'municipio', 'departamento', 'correo', 'telefono'],
        'festividades' => ['fecha', 'titulo', 'detalle', 'descripcion', 'tipo', 'municipio'],
        'municipios' => ['municipio', 'departamento'],
    ];
    $etiquetasCampo = [
        'fecha_salida' => 'fecha',
        'hora_salida' => 'hora',
        'precio_noche' => 'por noche',
        'nombre_clase' => 'clase',
        'capacidad_max' => 'capacidad',
        'tipo' => 'tipo',
        'incluye' => 'incluye',
    ];
    $etiquetaCategoria = $etiquetasCategoria[$categoria] ?? 'opciones turísticas';
    $campos = $camposVisibles[$categoria] ?? [];
    $cantidadVisible = min(count($resultados), 5);
    $respuesta = $contexto === null
        ? "Encontré estas opciones de {$etiquetaCategoria}:\n"
        : "Encontré estas opciones de {$etiquetaCategoria} {$contexto}:\n";

    foreach (array_slice($resultados, 0, 5) as $resultado) {
        $detalles = [];
        foreach ($campos as $campo) {
            $valor = $resultado[$campo] ?? null;
            if ($valor === null || $valor === '' || is_array($valor)) {
                continue;
            }

            if (in_array($campo, ['precio', 'precio_noche'], true) && is_numeric($valor)) {
                $valor = '$' . number_format((float)$valor, 0, ',', '.');
            } elseif (in_array($campo, ['descripcion', 'incluye', 'servicios'], true)) {
                $valor = mb_substr(trim((string)$valor), 0, 140, 'UTF-8');
                if (mb_strlen((string)($resultado[$campo] ?? ''), 'UTF-8') > 140) {
                    $valor .= '…';
                }
            }

            $etiqueta = $etiquetasCampo[$campo] ?? str_replace('_', ' ', $campo);
            $detalles[] = "{$etiqueta}: {$valor}";
        }
        $respuesta .= "\n• " . implode(' · ', $detalles);
    }

    if (count($resultados) > $cantidadVisible) {
        $respuesta .= "\n\nTe muestro las primeras {$cantidadVisible} opciones.";
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
if (
    $categoriaCatalogo === null
    && (
        preg_match('/\b(sobre|municipios?|ciudades?|pueblos?|destinos?|en|de|visitar|conocer|viajar)\b/ui', $question) === 1
        || preg_match('/^\W*[\p{L}\p{M}][\p{L}\p{M}\s,.-]{2,40}\W*$/u', $question) === 1
    )
) {
    try {
        $municipiosMencionados = buscarMunicipiosMencionados($question);
        if ($municipiosMencionados !== []) {
            echo json_encode([
                'success' => true,
                'response' => respuestaMunicipiosSantander($municipiosMencionados),
            ], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
            exit;
        }
    } catch (Throwable $e) {
        error_log('[TourismEasy IA] No se pudieron verificar municipios: ' . $e->getMessage());
    }
}

$datosCatalogo = null;
$contextoCatalogo = null;
if ($categoriaCatalogo !== null) {
    try {
        if ($categoriaCatalogo === 'transportes') {
            $municipiosMencionados = buscarMunicipiosMencionados($question);
            if ($municipiosMencionados !== []) {
                $preguntaNormalizada = normalizarTextoMunicipio($question);
                $primerMunicipio = $municipiosMencionados[0];
                $nombreNormalizado = normalizarTextoMunicipio($primerMunicipio);
                $posicionMunicipio = mb_strpos($preguntaNormalizada, $nombreNormalizado, 0, 'UTF-8');
                $prefijoMunicipio = $posicionMunicipio === false
                    ? ''
                    : mb_substr($preguntaNormalizada, 0, $posicionMunicipio, 'UTF-8');
                $origen = preg_match('/\b(desde|saliendo de|partiendo de|origen|de)\s*$/u', $prefijoMunicipio) === 1
                    ? $primerMunicipio
                    : null;
                $destino = $origen === null ? $primerMunicipio : $municipiosMencionados[1] ?? null;

                $datosCatalogo = cargarTransportesPorRuta($origen, $destino);
                $contextoCatalogo = $origen === null
                    ? "con destino a {$destino}"
                    : ($destino === null
                        ? "con origen en {$origen}"
                        : "desde {$origen} hacia {$destino}");
            } else {
                $datosCatalogo = cargarDatosCatalogo($categoriaCatalogo);
            }
        } else {
            $datosCatalogo = cargarDatosCatalogo($categoriaCatalogo);
        }
    } catch (Throwable $e) {
        error_log('[TourismEasy IA] No se pudo consultar el catálogo: ' . $e->getMessage());
        $codigoDiagnostico = $e instanceof PDOException && isset($e->errorInfo[0])
            ? (string)$e->errorInfo[0]
            : 'SERVER_ERROR';
        if (preg_match('/^[0-9A-Z]{5}$/D', $codigoDiagnostico) !== 1) {
            $codigoDiagnostico = 'SERVER_ERROR';
        }

        echo json_encode([
            'success' => true,
            'response' => 'No pude consultar esa información ahora mismo. Inténtalo de nuevo más tarde.',
            'diagnostic_code' => $codigoDiagnostico,
        ], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
        exit;
    }

    echo json_encode([
        'success' => true,
        'response' => formatearDatosCatalogo($categoriaCatalogo, $datosCatalogo, $contextoCatalogo),
    ], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
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

$promptAsistente = 'Eres Sue, la asistente virtual de TourismEasy, enfocada exclusivamente en turismo, viajes, destinos y servicios turísticos de Santander, Colombia. Responde siempre en español, con amabilidad, brevedad y empatía. Limita tus respuestas a esos temas y a las funciones de TourismEasy. Si preguntan sobre fútbol, política, tareas, cultura general u otro tema ajeno al turismo, explica amablemente que solo puedes ayudar con turismo y ofrece orientar sobre destinos, transporte, hospedaje, planes, artesanías, festividades, municipios o accesibilidad. No menciones bases de datos, consultas, fuentes internas ni detalles técnicos de cómo obtienes la información. No inventes datos de servicios ni contradigas la información proporcionada. Máximo tres párrafos cortos.';
if ($datosCatalogo !== null && $categoriaCatalogo !== null) {
    $promptAsistente .= "\n\nInformación disponible sobre {$categoriaCatalogo}:\n";
    $promptAsistente .= json_encode($datosCatalogo, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    $promptAsistente .= "\nUsa solo esta información para responder sobre esos servicios. No inventes ni completes información que no aparezca aquí.";
}

$url = 'https://api.groq.com/openai/v1/chat/completions';
$payload = [
    'model' => 'openai/gpt-oss-120b',
    'messages' => [
        ['role' => 'system', 'content' => $promptAsistente],
        ...array_map(
            static fn($message) => [
                'role' => $message['role'],
                'content' => mb_substr($message['content'], 0, 1500, 'UTF-8'),
            ],
            $history
        ),
        ['role' => 'user', 'content' => $question],
    ],
    'temperature' => 0.7,
    'max_completion_tokens' => 700,
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

if (
    $answer === ''
    || preg_match('/base\s+de\s+datos|datos?\s+registrad[oa]s?\s+en\s+la\s+base/iu', $answer) === 1
) {
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