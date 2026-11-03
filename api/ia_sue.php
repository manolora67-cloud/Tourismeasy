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
$history = array_slice($history, -30);

function preguntaEnIngles(string $question): bool
{
    $question = mb_strtolower($question, 'UTF-8');
    $englishSignals = preg_match_all(
        '/\b(hello|hi|hey|good\s+morning|good\s+afternoon|where|what|when|how|who|which|can|could|does|do|is|are|the|from|to|with|please|show|me|my|i|find|need|want|looking|for|recommend|options|accessible|transport|transportation|route|routes|bus|buses|accommodation|lodging|stay|stays|hotel|hotels|hostel|hostels|package|packages|tour|tours|activity|activities|excursion|excursions|experience|experiences|product|products|handicrafts|crafts|artisan|artisans|festival|festivals|town|towns|city|cities|municipality|municipalities|destination|destinations|company|companies|operator|operators|thanks|thank|you)\b/u',
        $question
    );
    $spanishSignals = preg_match_all(
        '/\b(hola|buenas|donde|dónde|que|qué|cuando|cuándo|como|cómo|quien|quién|cual|cuál|puedo|puedes|podría|hay|es|son|el|la|los|las|del|desde|hacia|por|para|con|necesito|quiero|busco|transporte|hospedaje|alojamiento|ruta|rutas|autobus|autobús|albergue|plan|planes|actividad|actividades|excursion|excursión|experiencia|experiencias|producto|productos|artesania|artesanía|artesano|artesanos|festividad|festividades|municipio|municipios|ciudad|ciudades|destino|destinos|empresa|empresas|gracias|accesibilidad|accesible)\b/u',
        $question
    );

    return $englishSignals > $spanishSignals;
}

function identificarCategoriaCatalogo(string $question): ?string
{
    $question = mb_strtolower($question, 'UTF-8');

    if (preg_match('/\b(empresas?|company|companies|operadores?|operators?)\b/u', $question) === 1) {
        return 'empresas';
    }

    $categorias = [
        'transportes' => '/\b(transportes?|transport|transportation|rutas?|routes?|buses?|autobuses?)\b/u',
        'hospedajes' => '/\b(hospedajes?|hoteles?|hotels?|alojamientos?|accommodations?|lodgings?|stays?|hostales?|hostels?|posadas?)\b/u',
        'planes' => '/\b(plan(?:es|s)?|tours?|paquetes?|packages?|excursiones?|excursions?|experiencias?|experiences?|actividades?|activities?)\b/u',
        'productos' => '/\b(productos?|products?|handicrafts?|crafts?|artesan[ií]as?|bisuter[ií]a|alfarer[ií]a|talleres?)\b/u',
        'artesanos' => '/\b(artesanos?|artesanas?|artisans?)\b/u',
        'festividades' => '/\b(festividades?|fiestas?|festivales?|festivals?|ferias?)\b/u',
        'municipios' => '/\b(municipios?|municipalities|ciudades?|cities|pueblos?|towns?|destinos?|destinations?)\b/u',
    ];

    foreach ($categorias as $categoria => $patron) {
        if (preg_match($patron, $question) === 1) {
            return $categoria;
        }
    }

    return null;
}

function identificarTipoServicioEmpresa(string $question): ?string
{
    $question = normalizarTextoMunicipio($question);

    if (preg_match('/\b(transportes?|transport|transportation|rutas?|routes?|buses?|autobuses?)\b/u', $question) === 1) {
        return 'TRANSPORTE';
    }
    if (preg_match('/\b(hospedajes?|hoteles?|hotels?|accommodations?|lodgings?|hostales?|hostels?|posadas?)\b/u', $question) === 1) {
        return 'HOSPEDAJE';
    }
    if (preg_match('/\b(plan(?:es|s)?|tours?|paquetes?|packages?|excursiones?|excursions?|experiencias?|experiences?|actividades?|activities?)\b/u', $question) === 1) {
        return 'PLANES';
    }

    return null;
}

function preguntaSolicitaMasResultados(string $question): bool
{
    $question = normalizarTextoMunicipio($question);

    return preg_match(
        '/\b(otras?|otros?|siguientes?|restantes|more|next|other)\s+(?:5|cinco|opciones|resultados|options|results)?\b|\b(?:muestrame|dame|ver|show\s+me|give\s+me|show)\s+(?:las?\s+)?(?:otras?|otros?|siguientes?|more|next|other)\b|\bmas\s+(?:opciones|resultados)\b|\bmore\s+(?:options|results)\b/u',
        $question
    ) === 1;
}

function recuperarConsultaPaginada(array $history, string $question): ?array
{
    if (!preguntaSolicitaMasResultados($question)) {
        return null;
    }

    $offset = 5;
    for ($i = count($history) - 1; $i >= 0; $i--) {
        $message = $history[$i];
        if (($message['role'] ?? null) !== 'user') {
            continue;
        }

        $contenido = (string)$message['content'];
        if (preguntaSolicitaMasResultados($contenido)) {
            $offset += 5;
            continue;
        }

        $categoria = identificarCategoriaCatalogo($contenido);
        if ($categoria !== null) {
            return [
                'question' => $contenido,
                'categoria' => $categoria,
                'offset' => $offset,
            ];
        }

        return null;
    }

    return null;
}

function cargarDatosCatalogo(string $categoria): array
{
    return cargarDatosCatalogoPorMunicipio($categoria);
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

function preguntaSolicitaMunicipio(string $question, string $categoria): bool
{
    $question = normalizarTextoMunicipio($question);
    $patron = '\b(en|hacia|con destino a|para ir a|para viajar a|in|to|toward|towards|near)\b';

    if ($categoria === 'transportes') {
        $patron .= '|\b(para|hasta|desde|saliendo de|partiendo de|origen|from|leaving from)\b';
    }

    return preg_match('/(?:' . $patron . ')/u', $question) === 1;
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

function cargarTransportesPorRuta(?string $origen, ?string $destino, int $offset = 0): array
{
    global $pdo;
    require_once __DIR__ . '/../con_db/db.php';

    $filtros = [
        't.DISPONIBILIDAD = TRUE',
        't.FECHA_SALIDA >= CURRENT_DATE',
        'e.TIPO_SERVICIO = \'TRANSPORTE\'',
        'EXISTS (
            SELECT 1
            FROM USUARIOS_EMPRESA ue
            WHERE ue.ID_EMPRESA = e.ID_EMPRESA
              AND ue.ESTADO = \'ACTIVO\'
        )',
    ];
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
        WHERE ' . implode("\n          AND ", $filtros) . '
        ORDER BY t.FECHA_SALIDA, t.HORA_SALIDA, t.ID_TRANSPORTE
        LIMIT 6 OFFSET :offset'
    );
    $parametros['offset'] = $offset;
    $stmt->execute($parametros);

    return $stmt->fetchAll();
}

function cargarDatosCatalogoPorMunicipio(
    string $categoria,
    ?string $municipio = null,
    ?string $tipoEmpresa = null
): array
{
    global $pdo;
    require_once __DIR__ . '/../con_db/db.php';

    $idCiudad = null;
    if ($municipio !== null) {
        $stmtCiudad = $pdo->prepare(
            'SELECT ID_CIUDAD FROM CIUDADES WHERE LOWER(BTRIM(NOM_CIUDAD)) = LOWER(BTRIM(:municipio))'
        );
        $stmtCiudad->execute(['municipio' => $municipio]);
        $idCiudad = $stmtCiudad->fetchColumn();

        if ($idCiudad === false) {
            return [];
        }
    }

    switch ($categoria) {
        case 'planes':
            $stmt = $pdo->prepare('SELECT fn_buscar_planes_publicos(:id_ciudad, NULL, NULL)');
            $stmt->execute(['id_ciudad' => $idCiudad]);
            $resultados = json_decode((string)$stmt->fetchColumn(), true);
            break;

        case 'hospedajes':
            $stmt = $pdo->prepare('SELECT fn_buscar_hospedaje_publico(:id_ciudad, NULL, NULL)');
            $stmt->execute(['id_ciudad' => $idCiudad]);
            $resultados = json_decode((string)$stmt->fetchColumn(), true);
            break;

        case 'productos':
            $stmt = $pdo->prepare(
                'SELECT p.*
                 FROM fn_buscar_productos_publicos(NULL, NULL, :id_ciudad) p
                 WHERE (NOT EXISTS (
                     SELECT 1
                     FROM PRODUCTOS_ARTESANALES pa
                     WHERE pa.ID_PRODUCTO = p.id_producto
                       AND pa.ID_PERSONA_ECOMMERCE IS NOT NULL
                 )
                 OR EXISTS (
                     SELECT 1
                     FROM PRODUCTOS_ARTESANALES pa
                     JOIN USUARIOS_ECOMMERCE ue
                       ON ue.ID_PERSONA_ECOMMERCE = pa.ID_PERSONA_ECOMMERCE
                     WHERE pa.ID_PRODUCTO = p.id_producto
                       AND ue.ESTADO = \'ACTIVO\'
                 ))
                 ORDER BY p.fecha_registro DESC, p.id_producto DESC'
            );
            $stmt->execute(['id_ciudad' => $idCiudad]);
            $resultados = array_map(
                static fn(array $producto): array => [
                    'nombre' => $producto['nom_producto'],
                    'artesano' => $producto['proveedor'],
                    'categoria' => $producto['categoria'],
                    'precio' => $producto['precio_cop'],
                    'descripcion' => $producto['descripcion'],
                    'municipio' => $producto['nom_ciudad'],
                ],
                $stmt->fetchAll()
            );
            break;

        case 'artesanos':
            $filtroCiudad = $idCiudad === null ? '' : ' AND producto.ID_CIUDAD = :id_ciudad';
            $joinProducto = $idCiudad === null ? 'LEFT JOIN' : 'JOIN';
            $stmt = $pdo->prepare(
                'SELECT
                    CONCAT_WS(\' \', persona.NOM_PERSONA_ECOMMERCE, persona.APE_PERSONA_ECOMMERCE) AS artesano,
                    COUNT(DISTINCT producto.ID_PRODUCTO) AS productos,
                    STRING_AGG(DISTINCT ciudad.NOM_CIUDAD, \', \' ORDER BY ciudad.NOM_CIUDAD) AS municipios
                 FROM PERSONAS_ECOMMERCE persona
                 JOIN USUARIOS_ECOMMERCE usuario
                   ON usuario.ID_PERSONA_ECOMMERCE = persona.ID_PERSONA_ECOMMERCE
                  AND usuario.ESTADO = \'ACTIVO\'
                 ' . $joinProducto . ' PRODUCTOS_ARTESANALES producto
                   ON producto.ID_PERSONA_ECOMMERCE = persona.ID_PERSONA_ECOMMERCE
                  ' . $filtroCiudad . '
                 LEFT JOIN CIUDADES ciudad ON ciudad.ID_CIUDAD = producto.ID_CIUDAD
                 GROUP BY persona.ID_PERSONA_ECOMMERCE, persona.NOM_PERSONA_ECOMMERCE, persona.APE_PERSONA_ECOMMERCE
                 ORDER BY persona.NOM_PERSONA_ECOMMERCE, persona.APE_PERSONA_ECOMMERCE, persona.ID_PERSONA_ECOMMERCE'
            );
            $stmt->execute($idCiudad === null ? [] : ['id_ciudad' => $idCiudad]);
            $resultados = $stmt->fetchAll();
            break;

        case 'empresas':
            $filtrosEmpresa = [];
            $parametrosEmpresa = [];
            if ($idCiudad !== null) {
                $filtrosEmpresa[] = 'empresa.ID_CIUDAD = :id_ciudad';
                $parametrosEmpresa['id_ciudad'] = $idCiudad;
            }
            if ($tipoEmpresa !== null) {
                $filtrosEmpresa[] = 'empresa.TIPO_SERVICIO = :tipo_servicio';
                $parametrosEmpresa['tipo_servicio'] = $tipoEmpresa;
            }
            $whereEmpresa = $filtrosEmpresa === []
                ? ''
                : 'WHERE ' . implode(' AND ', $filtrosEmpresa);
            $stmt = $pdo->prepare(
                'SELECT
                    empresa.NOM_EMPRESA AS empresa,
                    empresa.ID_EMPRESA AS id_empresa,
                    empresa.TIPO_SERVICIO AS servicio,
                    ciudad.NOM_CIUDAD AS municipio,
                    departamento.NOM_DPTO AS departamento,
                    empresa.EMAIL_INSTITU_EMPRESA AS correo,
                    empresa.NUM_CONTACTO_EMPRESA AS telefono
                 FROM EMPRESAS empresa
                 JOIN USUARIOS_EMPRESA usuario
                   ON usuario.ID_EMPRESA = empresa.ID_EMPRESA
                  AND usuario.ESTADO = \'ACTIVO\'
                 JOIN CIUDADES ciudad
                   ON ciudad.ID_CIUDAD = empresa.ID_CIUDAD
                 JOIN DEPARTAMENTOS departamento
                   ON departamento.ID_DPTO = ciudad.ID_DPTO
                 ' . $whereEmpresa . '
                 ORDER BY empresa.NOM_EMPRESA, empresa.ID_EMPRESA'
            );
            $stmt->execute($parametrosEmpresa);
            $resultados = $stmt->fetchAll();
            break;

        case 'festividades':
            $filtroCiudad = $idCiudad === null ? '' : ' WHERE festividad.ID_CIUDAD = :id_ciudad';
            $stmt = $pdo->prepare(
                'SELECT
                    festividad.FECHA_CLAVE AS fecha,
                    festividad.TITULO AS titulo,
                    festividad.SUBTITULO AS detalle,
                    festividad.FRASE AS descripcion,
                    festividad.TIPO AS tipo,
                    ciudad.NOM_CIUDAD AS municipio
                 FROM FESTIVIDADES_SANTANDER festividad
                 LEFT JOIN CIUDADES ciudad ON ciudad.ID_CIUDAD = festividad.ID_CIUDAD
                 ' . $filtroCiudad . '
                 ORDER BY SUBSTRING(festividad.FECHA_CLAVE FROM 1 FOR 2),
                          SUBSTRING(festividad.FECHA_CLAVE FROM 4 FOR 2),
                          festividad.ID_FESTIVIDAD'
            );
            $stmt->execute($idCiudad === null ? [] : ['id_ciudad' => $idCiudad]);
            $resultados = $stmt->fetchAll();
            break;

        case 'municipios':
            $filtroCiudad = $idCiudad === null ? '' : ' WHERE ciudad.ID_CIUDAD = :id_ciudad';
            $stmt = $pdo->prepare(
                'SELECT ciudad.NOM_CIUDAD AS municipio, departamento.NOM_DPTO AS departamento
                 FROM CIUDADES ciudad
                 JOIN DEPARTAMENTOS departamento ON departamento.ID_DPTO = ciudad.ID_DPTO'
                    . $filtroCiudad
                    . ' ORDER BY ciudad.NOM_CIUDAD, ciudad.ID_CIUDAD'
            );
            if ($idCiudad !== null) {
                $stmt->execute(['id_ciudad' => $idCiudad]);
            } else {
                $stmt->execute();
            }
            $resultados = $stmt->fetchAll();
            break;

        default:
            return [];
    }

    if (!is_array($resultados)) {
        throw new RuntimeException('La consulta del catálogo por municipio devolvió una respuesta inválida.');
    }

    if (in_array($categoria, ['planes', 'hospedajes'], true)) {
        $campoPrecio = $categoria === 'planes' ? 'precio' : 'precio_noche';
        usort($resultados, static function (array $a, array $b) use ($campoPrecio): int {
            $comparacionPrecio = (float)($a[$campoPrecio] ?? 0) <=> (float)($b[$campoPrecio] ?? 0);
            return $comparacionPrecio !== 0
                ? $comparacionPrecio
                : (int)($a['id'] ?? 0) <=> (int)($b['id'] ?? 0);
        });
    }

    return $resultados;
}

function respuestaMunicipiosSantander(array $municipios, bool $english = false): string
{
    $nombres = count($municipios) > 1
        ? implode(', ', array_slice($municipios, 0, -1)) . ' y ' . end($municipios)
        : $municipios[0];

    if ($english) {
        return "{$nombres} " . (count($municipios) > 1 ? 'are towns' : 'is a town') .
            " in Santander, Colombia. TourismEasy can help you find transportation, accommodation, and tour options for those destinations.";
    }

    return "{$nombres} " . (count($municipios) > 1 ? 'son municipios' : 'es un municipio') .
        " de Santander, Colombia. En TourismEasy puedo ayudarte a consultar opciones de transporte, hospedaje y planes turísticos para esos destinos.";
}

function formatearDatosCatalogo(
    string $categoria,
    array $resultados,
    ?string $contexto = null,
    int $offset = 0,
    bool $resultadosPaginados = false,
    bool $english = false
): string
{
    if ($resultados === [] && $offset > 0) {
        if ($english) {
            return $contexto === null
                ? 'I have shown you all the available options in that category.'
                : "I have shown you all the available options {$contexto}.";
        }
        return $contexto === null
            ? 'Ya te mostré todas las opciones disponibles de esa categoría.'
            : "Ya te mostré todas las opciones disponibles {$contexto}.";
    }

    $pagina = $resultadosPaginados
        ? array_slice($resultados, 0, 5)
        : array_slice($resultados, $offset, 5);
    if ($pagina === []) {
        if ($english) {
            return $contexto === null
                ? 'I could not find any available options in that category.'
                : "I could not find any available options {$contexto}.";
        }
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
    if ($english) {
        $etiquetasCampo = [
            'origen' => 'origin',
            'destino' => 'destination',
            'fecha_salida' => 'departure date',
            'hora_salida' => 'departure time',
            'precio' => 'price',
            'empresa' => 'company',
            'nombre_clase' => 'class',
            'nombre' => 'name',
            'tipo' => 'type',
            'ciudad' => 'town',
            'precio_noche' => 'per night',
            'accesibilidad' => 'accessibility',
            'capacidad_max' => 'capacity',
            'servicios' => 'services',
            'duracion' => 'duration',
            'incluye' => 'includes',
            'descripcion' => 'description',
            'categoria' => 'category',
            'municipio' => 'town',
            'artesano' => 'artisan',
            'productos' => 'products',
            'municipios' => 'towns',
            'servicio' => 'service',
            'departamento' => 'department',
            'correo' => 'email',
            'telefono' => 'phone',
            'fecha' => 'date',
            'titulo' => 'title',
            'detalle' => 'details',
        ];
    }
    if ($english) {
        $etiquetasCategoria = [
            'transportes' => 'transportation options',
            'hospedajes' => 'accommodations',
            'planes' => 'tour packages',
            'productos' => 'handcrafted products',
            'artesanos' => 'artisans',
            'empresas' => 'tourism companies',
            'festividades' => 'festivals',
            'municipios' => 'towns',
        ];
    }
    $etiquetaCategoria = $etiquetasCategoria[$categoria] ?? ($english ? 'tourism options' : 'opciones turísticas');
    $campos = $camposVisibles[$categoria] ?? [];
    $hayMasResultados = $resultadosPaginados
        ? count($resultados) > 5
        : count($resultados) > $offset + count($pagina);
    if ($english) {
        $respuesta = $contexto === null
            ? "Here are some {$etiquetaCategoria}:\n"
            : "Here are some {$etiquetaCategoria} {$contexto}:\n";
    } else {
        $respuesta = $contexto === null
            ? "Encontré estas opciones de {$etiquetaCategoria}:\n"
            : "Encontré estas opciones de {$etiquetaCategoria} {$contexto}:\n";
    }

    foreach ($pagina as $resultado) {
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

    if ($hayMasResultados) {
        $respuesta .= $english
            ? "\n\nThere are more options. Ask me for the next 5 to see them."
            : "\n\nHay más opciones. Dime «otras 5» para mostrarte las siguientes.";
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

$english = preguntaEnIngles($question);
$consultaPaginada = recuperarConsultaPaginada($history, $question);
$questionCatalogo = $consultaPaginada['question'] ?? $question;
$categoriaCatalogo = $consultaPaginada['categoria'] ?? identificarCategoriaCatalogo($question);
$offsetCatalogo = $consultaPaginada['offset'] ?? 0;
$tipoEmpresaCatalogo = $categoriaCatalogo === 'empresas'
    ? identificarTipoServicioEmpresa($questionCatalogo)
    : null;
if (preguntaSolicitaMasResultados($question) && $consultaPaginada === null && $categoriaCatalogo === null) {
    echo json_encode([
        'success' => true,
        'response' => $english
            ? 'Which category would you like to explore: transportation, accommodation, tour packages, handcrafted products, artisans, or tourism companies?'
            : 'Dime de qué categoría quieres ver opciones: transporte, hospedaje, planes, productos artesanales, artesanos o empresas.',
    ], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}
if (
    $categoriaCatalogo === null
    && (
        preg_match('/\b(sobre|municipios?|ciudades?|pueblos?|destinos?|en|de|visitar|conocer|viajar|about|towns?|cities|destinations?|in|visit|travel|tell\s+me)\b/ui', $questionCatalogo) === 1
        || preg_match('/^\W*[\p{L}\p{M}][\p{L}\p{M}\s,.-]{2,40}\W*$/u', $questionCatalogo) === 1
    )
) {
    try {
        $municipiosMencionados = buscarMunicipiosMencionados($questionCatalogo);
        if ($municipiosMencionados !== []) {
            echo json_encode([
                'success' => true,
                'response' => respuestaMunicipiosSantander($municipiosMencionados, $english),
            ], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
            exit;
        }
    } catch (Throwable $e) {
        error_log('[TourismEasy IA] No se pudieron verificar municipios: ' . $e->getMessage());
    }
}

$datosCatalogo = null;
$contextoCatalogo = null;
$etapaConsulta = 'catalogo';
$configuracion = require __DIR__ . '/config.php';
$groqKey = $configuracion['groq_key'] ?? null;
if ($categoriaCatalogo !== null) {
    try {
        if ($categoriaCatalogo === 'transportes') {
            $etapaConsulta = 'municipios';
            $municipiosMencionados = buscarMunicipiosMencionados($questionCatalogo);
            if ($municipiosMencionados !== []) {
                $preguntaNormalizada = normalizarTextoMunicipio($questionCatalogo);
                $primerMunicipio = $municipiosMencionados[0];
                $nombreNormalizado = normalizarTextoMunicipio($primerMunicipio);
                $posicionMunicipio = mb_strpos($preguntaNormalizada, $nombreNormalizado, 0, 'UTF-8');
                $prefijoMunicipio = $posicionMunicipio === false
                    ? ''
                    : mb_substr($preguntaNormalizada, 0, $posicionMunicipio, 'UTF-8');
                $origen = preg_match('/\b(desde|saliendo de|partiendo de|origen|from|leaving from)\s*$/u', $prefijoMunicipio) === 1
                    ? $primerMunicipio
                    : null;
                $destino = $origen === null ? $primerMunicipio : $municipiosMencionados[1] ?? null;

                $etapaConsulta = 'rutas';
                $datosCatalogo = cargarTransportesPorRuta($origen, $destino, $offsetCatalogo);
                $contextoCatalogo = $english
                    ? ($origen === null
                        ? "to {$destino}"
                        : ($destino === null ? "from {$origen}" : "from {$origen} to {$destino}"))
                    : ($origen === null
                        ? "con destino a {$destino}"
                        : ($destino === null
                            ? "con origen en {$origen}"
                            : "desde {$origen} hacia {$destino}"));
            } elseif (preguntaSolicitaMunicipio($questionCatalogo, $categoriaCatalogo)) {
                echo json_encode([
                    'success' => true,
                    'response' => $english
                        ? 'I could not identify that town in Santander. Tell me its name and I will look for available routes.'
                        : 'No logré identificar ese municipio de Santander. Dime el nombre del municipio y busco las rutas disponibles.',
                ], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
                exit;
            } else {
                $etapaConsulta = 'rutas';
                $datosCatalogo = cargarTransportesPorRuta(null, null, $offsetCatalogo);
            }
        } elseif ($categoriaCatalogo !== 'municipios') {
            $etapaConsulta = 'municipios';
            $municipiosMencionados = buscarMunicipiosMencionados($questionCatalogo);
            if ($municipiosMencionados !== []) {
                $etapaConsulta = 'catalogo_filtrado';
                if (count($municipiosMencionados) > 3) {
                    echo json_encode([
                        'success' => true,
                        'response' => $english
                            ? 'You mentioned several towns. For accurate results, please ask about up to three places at a time.'
                            : 'Mencionaste varios municipios. Para darte resultados precisos, dime hasta tres lugares por consulta.',
                    ], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
                    exit;
                }
                $municipiosConsultados = $municipiosMencionados;
                $datosCatalogo = [];
                foreach ($municipiosConsultados as $municipio) {
                    $datosCatalogo = array_merge(
                        $datosCatalogo,
                        cargarDatosCatalogoPorMunicipio(
                            $categoriaCatalogo,
                            $municipio,
                            $tipoEmpresaCatalogo
                        )
                    );
                }
                $contextoCatalogo = ($english ? 'in ' : 'en ') .
                    implode($english ? ' and ' : ' y ', $municipiosConsultados);
                if ($tipoEmpresaCatalogo !== null) {
                    $contextoCatalogo .= ($english ? ' for ' : ' de ') . strtolower($tipoEmpresaCatalogo);
                }
            } elseif (preguntaSolicitaMunicipio($questionCatalogo, $categoriaCatalogo)) {
                echo json_encode([
                    'success' => true,
                    'response' => $english
                        ? 'I could not identify that town in Santander. Tell me which town you mean and I will look for options there.'
                        : 'No logré identificar ese municipio de Santander. Dime el nombre del municipio y busco opciones solo para ese lugar.',
                ], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
                exit;
            } else {
                $etapaConsulta = 'catalogo';
                $datosCatalogo = cargarDatosCatalogoPorMunicipio(
                    $categoriaCatalogo,
                    null,
                    $tipoEmpresaCatalogo
                );
                if ($tipoEmpresaCatalogo !== null) {
                    $etiquetaServicio = $english
                        ? [
                            'TRANSPORTE' => 'transportation',
                            'HOSPEDAJE' => 'accommodation',
                            'PLANES' => 'tour packages',
                        ][$tipoEmpresaCatalogo] ?? strtolower($tipoEmpresaCatalogo)
                        : strtolower($tipoEmpresaCatalogo);
                    $contextoCatalogo = ($english ? 'for ' : 'de ') . $etiquetaServicio;
                }
            }
        } else {
            $etapaConsulta = 'municipios';
            $municipiosMencionados = buscarMunicipiosMencionados($questionCatalogo);
            if ($municipiosMencionados !== []) {
                if (count($municipiosMencionados) > 3) {
                    echo json_encode([
                        'success' => true,
                        'response' => $english
                            ? 'You mentioned several towns. For accurate results, please ask about up to three places at a time.'
                            : 'Mencionaste varios municipios. Para darte resultados precisos, dime hasta tres lugares por consulta.',
                    ], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
                    exit;
                }
                $etapaConsulta = 'catalogo_filtrado';
                $datosCatalogo = [];
                foreach ($municipiosMencionados as $municipio) {
                    $datosCatalogo = array_merge(
                        $datosCatalogo,
                        cargarDatosCatalogoPorMunicipio($categoriaCatalogo, $municipio)
                    );
                }
                $contextoCatalogo = 'en ' . implode(' y ', $municipiosMencionados);
            } elseif (preguntaSolicitaMunicipio($questionCatalogo, $categoriaCatalogo)) {
                echo json_encode([
                    'success' => true,
                    'response' => $english
                        ? 'I could not identify that town in Santander. Tell me which one you are looking for and I will help you find it.'
                        : 'No logré identificar ese municipio de Santander. Dime cuál buscas y te ayudo a ubicarlo.',
                ], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
                exit;
            } else {
                $etapaConsulta = 'catalogo';
                $datosCatalogo = cargarDatosCatalogo($categoriaCatalogo);
            }
        }
    } catch (Throwable $e) {
        error_log('[TourismEasy IA] No se pudo consultar el catálogo: ' . $e->getMessage());
        $codigoDiagnostico = 'SERVER_ERROR';
        if ($e instanceof PDOException) {
            $codigoDiagnostico = (string)($e->errorInfo[0] ?? $e->getCode());
            if (preg_match('/^[0-9A-Z]{5}$/D', $codigoDiagnostico) !== 1) {
                $codigoDiagnostico = 'DB_ERROR';
            }
        } else {
            $tipoError = (new ReflectionClass($e))->getShortName();
            if (preg_match('/^[A-Za-z]+$/D', $tipoError) === 1) {
                $codigoDiagnostico = 'PHP_' . strtoupper($tipoError);
            }
        }
        if (preg_match('/^[0-9A-Z]{5}$/D', $codigoDiagnostico) !== 1) {
            if (!in_array($codigoDiagnostico, ['DB_ERROR'], true)
                && preg_match('/^PHP_[A-Z]+$/D', $codigoDiagnostico) !== 1) {
                $codigoDiagnostico = 'SERVER_ERROR';
            }
        }

        echo json_encode([
            'success' => true,
            'response' => $english
                ? 'I could not retrieve that information right now. Please try again later.'
                : 'No pude consultar esa información ahora mismo. Inténtalo de nuevo más tarde.',
            'diagnostic_code' => $codigoDiagnostico,
            'diagnostic_stage' => $etapaConsulta,
        ], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
        exit;
    }

    if (!$groqKey || !$english) {
        echo json_encode([
            'success' => true,
            'response' => formatearDatosCatalogo(
                $categoriaCatalogo,
                $datosCatalogo,
                $contextoCatalogo,
                $offsetCatalogo,
                $categoriaCatalogo === 'transportes',
                $english
            ),
        ], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
        exit;
    }
}

function fallbackResponse(string $question): array
{
    $question = mb_strtolower($question, 'UTF-8');
    $english = preguntaEnIngles($question);

    if (preg_match('/\b(hola|buenas|buenos dias|buenas tardes|buenas noches|hey|hello|hi)\b/u', $question)) {
        return [
            'success' => true,
            'response' => $english
                ? 'Hello! 👋 I am Sue, your inclusive travel assistant for Santander. How can I help you today?'
                : '¡Hola! 👋 Soy Sue, tu asistente para viajes inclusivos en Santander. ¿En qué puedo ayudarte hoy?',
        ];
    }

    if (preg_match('/\b(transporte|transportation|terminal|bus|autobus|ruta|route|routes|boleto|viajar|travel|llegar|salida|movi)\b/u', $question)) {
        return [
            'success' => true,
            'response' => $english
                ? 'In Santander, you can take intercity transportation from Bucaramanga Terminal to destinations such as San Gil, Barichara, Socorro, and Girón. TourismEasy can also help you find accessible transportation and mobility support.'
                : 'En Santander puedes tomar transporte intermunicipal desde la Terminal de Bucaramanga a destinos como San Gil, Barichara, Socorro y Giron. TourismEasy también te ayuda con opciones de transporte adaptado y guías para movilidad reducida.',
        ];
    }

    if (preg_match('/\b(hospedaje|accommodation|lodging|stay|hotel|alojamiento|posada|hostal|hostel|habitacion|cama|reserva|booking)\b/u', $question)) {
        return [
            'success' => true,
            'response' => $english
                ? 'You can find accessible accommodations on the platform. Open the accommodation section and filter by accessibility to explore the available options.'
                : 'En la plataforma encontrarás hospedajes accesibles con rampas, baños adaptados y opciones inclusivas. Selecciona la sección de hospedaje y filtra por accesibilidad para ver las mejores opciones.',
        ];
    }

    if (preg_match('/\b(destino|destination|destinations|barichara|canon|canyon|san gil|bucaramanga|santander|giron|velez|los santos|socorro)\b/u', $question)) {
        return [
            'success' => true,
            'response' => $english
                ? 'Santander offers destinations such as Barichara for colonial tourism, San Gil for accessible adventures, and Chicamocha Canyon for scenic views. You can explore tour options on the platform.'
                : 'Santander tiene destinos como Barichara para turismo colonial, San Gil para aventura adaptada y el Cañon del Chicamocha para vistas accesibles. Puedes explorar planes en la plataforma según tu necesidad.',
        ];
    }

    if (preg_match('/\b(plan|plans|planes|tour|activity|activities|package|packages|excursion|experience)\b/u', $question)) {
        return [
            'success' => true,
            'response' => $english
                ? 'TourismEasy offers inclusive tours with specialized guides and adapted activities. Tell me what kind of experience you are looking for and I will help you explore the options.'
                : 'TourismEasy ofrece planes turísticos inclusivos con guías especializados y actividades adaptadas. Elige el tipo de experiencia que buscas y te guiaré a la mejor opción.',
        ];
    }

    if (preg_match('/\b(discapacidad|accesibilidad|accessibility|accessible|inclusive|inclusivo|inclusiva|silla de ruedas|wheelchair|visual|auditiva)\b/u', $question)) {
        return [
            'success' => true,
            'response' => $english
                ? 'You can find accessible transportation, accommodation, and tours. If you need specific support, ask about mobility, visual, or hearing accessibility.'
                : 'Puedes encontrar servicios accesibles en transporte, hospedaje y planes. Si necesitas apoyo especial, pregunta por opciones para movilidad reducida, discapacidad visual o auditiva.',
        ];
    }

    return [
        'success' => true,
        'response' => $english
            ? 'Sorry, I do not have an exact answer for that right now. Ask me about transportation, accommodation, destinations, tours, or accessibility in Santander.'
            : 'Lo siento, no tengo una respuesta exacta para eso ahora mismo. Pregunta sobre transporte, hospedaje, destinos, planes o accesibilidad en Santander.',
    ];
}

function respuestaConDatosOFallback(
    string $question,
    ?array $datosCatalogo,
    ?string $categoria,
    bool $english = false
): array
{
    if ($datosCatalogo !== null && $categoria !== null) {
        return [
            'success' => true,
            'response' => formatearDatosCatalogo($categoria, $datosCatalogo, null, 0, false, $english),
        ];
    }

    return fallbackResponse($question);
}

if (!$groqKey) {
    echo json_encode(
        respuestaConDatosOFallback($question, $datosCatalogo, $categoriaCatalogo, $english),
        JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE
    );
    exit;
}

$promptAsistente = 'Eres Sue, la asistente virtual de TourismEasy, enfocada exclusivamente en turismo, viajes, destinos y servicios turísticos de Santander, Colombia. Responde en el mismo idioma de la pregunta más reciente: si está en inglés, responde en inglés; si está en español, responde en español. Mantén un tono amable, breve y empático. Limita tus respuestas a esos temas y a las funciones de TourismEasy. Si preguntan sobre fútbol, política, tareas, cultura general u otro tema ajeno al turismo, explica amablemente en el idioma de la pregunta que solo puedes ayudar con turismo y ofrece orientar sobre destinos, transporte, hospedaje, planes, artesanías, festividades, municipios o accesibilidad. No menciones bases de datos, consultas, fuentes internas ni detalles técnicos de cómo obtienes la información. No inventes datos de servicios ni contradigas la información proporcionada. Máximo tres párrafos cortos.';
if ($datosCatalogo !== null && $categoriaCatalogo !== null) {
    $promptAsistente .= "\n\nInformación disponible sobre {$categoriaCatalogo} (los nombres y textos de los registros pueden estar en español; responde en el idioma de la pregunta y conserva sin cambios los nombres propios, precios y datos concretos):\n";
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
        respuestaConDatosOFallback($question, $datosCatalogo, $categoriaCatalogo, $english),
        JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE
    );
    exit;
}

$data = json_decode($response, true);
if (!isset($data['choices'][0]['message']['content'])) {
    error_log("[TourismEasy IA] Respuesta inválida de Groq: " . $response);
    echo json_encode(
        respuestaConDatosOFallback($question, $datosCatalogo, $categoriaCatalogo, $english),
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
        respuestaConDatosOFallback($question, $datosCatalogo, $categoriaCatalogo, $english),
        JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE
    );
    exit;
}

echo json_encode([
    'success' => true,
    'response' => $answer,
], JSON_UNESCAPED_UNICODE);