<?php
session_start();
require_once __DIR__ . '/../con_db/db.php';
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../cors.php';

function responderPortada($status, $payload)
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

function esAdminPortada()
{
    return ($_SESSION['tipo'] ?? '') === 'admin' && !empty($_SESSION['id_persona']);
}

function booleanoPostgres($value)
{
    return in_array($value, [true, 1, '1', 't', 'true'], true);
}

function auditarPortada($pdo, $accion, $detalle)
{
    try {
        $pdo->prepare("SELECT fn_registrar_auditoria(:admin, :accion, 'Contenido portada', :detalle, 'info')")
            ->execute([
                ':admin' => $_SESSION['id_persona'],
                ':accion' => $accion,
                ':detalle' => $detalle,
            ]);
    } catch (PDOException $e) {
        error_log('[TourismEasy] auditoría de contenido portada - ' . $e->getMessage());
    }
}

function validarTextoPortada($value, $max, $field, $required = true)
{
    if (!is_string($value)) {
        $value = '';
    }
    $value = trim($value);
    if (($required && $value === '') || mb_strlen($value) > $max) {
        throw new InvalidArgumentException('Revisa el campo ' . $field . '.');
    }
    return $value;
}

function validarRutaMediaPortada($value, $field, $required = true)
{
    $value = trim((string)$value);
    if (!$required && $value === '') {
        return '';
    }
    if ($value === '' || (!preg_match('#^https://[^\s]+$#i', $value) && !preg_match("~^(img|audio-video)/[^\\x00-\\x1F<>\"'?#]+$~u", $value))) {
        throw new InvalidArgumentException('La ruta de ' . $field . ' debe ser una URL HTTPS o una ruta local válida.');
    }
    return $value;
}

function prepararRegistroPortada($item)
{
    if (!is_array($item)) {
        throw new InvalidArgumentException('El destino enviado no es válido.');
    }

    $clave = strtolower(trim((string)($item['key'] ?? '')));
    if (!preg_match('/^[a-z0-9-]{2,50}$/', $clave)) {
        throw new InvalidArgumentException('La clave debe tener entre 2 y 50 caracteres: letras minúsculas, números o guiones.');
    }

    $articulo = $item['article'] ?? [];
    if (!is_array($articulo)) {
        throw new InvalidArgumentException('La información del artículo no es válida.');
    }
    if (!is_array($articulo['datos'] ?? []) || !is_array($articulo['secciones'] ?? [])) {
        throw new InvalidArgumentException('Los datos rápidos y las secciones deben ser listas válidas.');
    }

    $datos = [];
    foreach (($articulo['datos'] ?? []) as $dato) {
        if (!is_array($dato)) continue;
        $label = validarTextoPortada($dato['label'] ?? '', 100, 'etiqueta del dato');
        $val = validarTextoPortada($dato['val'] ?? '', 200, 'valor del dato');
        $datos[] = ['label' => $label, 'val' => $val];
        if (count($datos) > 12) throw new InvalidArgumentException('El artículo admite máximo 12 datos rápidos.');
    }

    $secciones = [];
    foreach (($articulo['secciones'] ?? []) as $seccion) {
        if (!is_array($seccion)) continue;
        $tituloSeccion = validarTextoPortada($seccion['titulo'] ?? '', 150, 'título de sección');
        $textoSeccion = validarTextoPortada($seccion['texto'] ?? '', 5000, 'texto de sección');
        $secciones[] = ['titulo' => $tituloSeccion, 'texto' => $textoSeccion];
        if (count($secciones) > 20) throw new InvalidArgumentException('El artículo admite máximo 20 secciones.');
    }

    $articuloLimpio = [
        'video' => validarRutaMediaPortada($articulo['video'] ?? '', 'video', false),
        'badge' => validarTextoPortada($articulo['badge'] ?? '', 80, 'insignia del artículo', false),
        'titulo' => validarTextoPortada($articulo['titulo'] ?? ($item['titulo'] ?? ''), 150, 'título del artículo'),
        'subtitulo' => validarTextoPortada($articulo['subtitulo'] ?? '', 250, 'subtítulo del artículo', false),
        'datos' => $datos,
        'intro' => validarTextoPortada($articulo['intro'] ?? '', 8000, 'introducción', false),
        'secciones' => $secciones,
        'ctaTexto' => validarTextoPortada($articulo['ctaTexto'] ?? '', 250, 'texto de cierre', false),
    ];

    return [
        'key' => $clave,
        'img' => validarRutaMediaPortada($item['img'] ?? '', 'imagen'),
        'alt' => validarTextoPortada($item['alt'] ?? '', 200, 'texto alternativo'),
        'badge' => validarTextoPortada($item['badge'] ?? '', 80, 'insignia', false),
        'titulo' => validarTextoPortada($item['titulo'] ?? '', 150, 'título'),
        'desc' => validarTextoPortada($item['desc'] ?? '', 3000, 'descripción'),
        'orden' => max(0, min(10000, (int)($item['orden'] ?? 0))),
        'publicado' => !empty($item['publicado']),
        'article' => $articuloLimpio,
    ];
}

function guardarRegistroPortada($pdo, $item)
{
    $destino = prepararRegistroPortada($item);
    $stmt = $pdo->prepare(
        'INSERT INTO CONTENIDO_PORTADA
            (CLAVE, IMAGEN, TEXTO_ALT, INSIGNIA, TITULO, DESCRIPCION, ARTICULO, ORDEN, PUBLICADO, MODIFICADO_POR, FECHA_ACTUALIZACION)
         VALUES
            (:clave, :imagen, :alt, :insignia, :titulo, :descripcion, CAST(:articulo AS JSONB), :orden, :publicado, :admin, NOW())
         ON CONFLICT (CLAVE) DO UPDATE SET
            IMAGEN = EXCLUDED.IMAGEN,
            TEXTO_ALT = EXCLUDED.TEXTO_ALT,
            INSIGNIA = EXCLUDED.INSIGNIA,
            TITULO = EXCLUDED.TITULO,
            DESCRIPCION = EXCLUDED.DESCRIPCION,
            ARTICULO = EXCLUDED.ARTICULO,
            ORDEN = EXCLUDED.ORDEN,
            PUBLICADO = EXCLUDED.PUBLICADO,
            MODIFICADO_POR = EXCLUDED.MODIFICADO_POR,
            FECHA_ACTUALIZACION = NOW()'
    );
    $stmt->execute([
        ':clave' => $destino['key'],
        ':imagen' => $destino['img'],
        ':alt' => $destino['alt'],
        ':insignia' => $destino['badge'] !== '' ? $destino['badge'] : null,
        ':titulo' => $destino['titulo'],
        ':descripcion' => $destino['desc'],
        ':articulo' => json_encode($destino['article'], JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
        ':orden' => $destino['orden'],
        ':publicado' => $destino['publicado'] ? 'true' : 'false',
        ':admin' => $_SESSION['id_persona'],
    ]);
    return $destino;
}

function listarPortada($pdo, $soloPublicados)
{
    $sql = 'SELECT CLAVE, IMAGEN, TEXTO_ALT, INSIGNIA, TITULO, DESCRIPCION, ARTICULO, ORDEN, PUBLICADO
            FROM CONTENIDO_PORTADA ' . ($soloPublicados ? 'WHERE PUBLICADO = TRUE ' : '') . 'ORDER BY ORDEN, TITULO';
    $destinos = [];
    foreach ($pdo->query($sql)->fetchAll() as $row) {
        $row['article'] = json_decode($row['articulo'], true) ?: [];
        $destinos[] = [
            'key' => $row['clave'],
            'img' => $row['imagen'],
            'alt' => $row['texto_alt'],
            'badge' => $row['insignia'] ?? '',
            'titulo' => $row['titulo'],
            'desc' => $row['descripcion'],
            'orden' => (int)$row['orden'],
            'publicado' => booleanoPostgres($row['publicado']),
            'article' => $row['article'],
        ];
    }
    return $destinos;
}

function portadaInicializada($pdo)
{
    $state = $pdo->query('SELECT DEFAULTS_CARGADOS FROM ESTADO_INICIAL_PORTADA WHERE ID = 1')->fetchColumn();
    return booleanoPostgres($state);
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $admin = isset($_GET['admin']) && $_GET['admin'] === '1';
        if ($admin && !esAdminPortada()) {
            responderPortada(401, ['ok' => false, 'error' => 'Se requiere una sesión de administración.']);
        }
        $csrf = null;
        if ($admin) {
            if (empty($_SESSION['csrf_portada'])) {
                $_SESSION['csrf_portada'] = bin2hex(random_bytes(32));
            }
            $csrf = $_SESSION['csrf_portada'];
        }
        responderPortada(200, [
            'ok' => true,
            'data' => listarPortada($pdo, !$admin),
            'initialized' => portadaInicializada($pdo),
            'csrf' => $csrf,
        ]);
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        responderPortada(405, ['ok' => false, 'error' => 'Método no permitido.']);
    }
    if (!esAdminPortada()) {
        responderPortada(401, ['ok' => false, 'error' => 'Se requiere una sesión de administración.']);
    }
    $csrf = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (empty($_SESSION['csrf_portada']) || !hash_equals($_SESSION['csrf_portada'], $csrf)) {
        responderPortada(403, ['ok' => false, 'error' => 'La sesión de edición expiró. Recarga el panel e intenta de nuevo.']);
    }

    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        responderPortada(400, ['ok' => false, 'error' => 'La solicitud no contiene JSON válido.']);
    }
    $action = $input['action'] ?? '';

    if ($action === 'bootstrap') {
        $pdo->beginTransaction();
        $stateRow = $pdo->query('SELECT DEFAULTS_CARGADOS FROM ESTADO_INICIAL_PORTADA WHERE ID = 1 FOR UPDATE')->fetch(PDO::FETCH_ASSOC);
        if (!$stateRow) {
            throw new RuntimeException('Falta ejecutar la migración de contenido de portada.');
        }
        $defaultsLoaded = booleanoPostgres($stateRow['defaults_cargados']);
        if (!$defaultsLoaded) {
            $cards = $input['destinos'] ?? [];
            $articles = $input['articulos'] ?? [];
            if (!is_array($cards) || !is_array($articles)) {
                throw new InvalidArgumentException('No se pudieron cargar los datos iniciales de portada.');
            }
            $articleByKey = [];
            foreach ($articles as $article) {
                if (is_array($article) && isset($article['key'])) $articleByKey[$article['key']] = $article;
            }
            foreach ($cards as $index => $card) {
                if (!is_array($card)) continue;
                $card['orden'] = $index + 1;
                $card['publicado'] = true;
                $card['article'] = $articleByKey[$card['key'] ?? ''] ?? [];
                guardarRegistroPortada($pdo, $card);
            }
            $pdo->exec('UPDATE ESTADO_INICIAL_PORTADA SET DEFAULTS_CARGADOS = TRUE WHERE ID = 1');
        }
        $pdo->commit();
        responderPortada(200, ['ok' => true, 'data' => listarPortada($pdo, false)]);
    }

    if ($action === 'save') {
        $saved = guardarRegistroPortada($pdo, $input['destino'] ?? null);
        auditarPortada($pdo, 'Guardar destino', 'Se guardó el destino de portada ' . $saved['key']);
        responderPortada(200, ['ok' => true, 'data' => $saved]);
    }

    if ($action === 'delete') {
        $key = strtolower(trim((string)($input['key'] ?? '')));
        if (!preg_match('/^[a-z0-9-]{2,50}$/', $key)) {
            responderPortada(400, ['ok' => false, 'error' => 'Clave de destino inválida.']);
        }
        $stmt = $pdo->prepare('DELETE FROM CONTENIDO_PORTADA WHERE CLAVE = :clave');
        $stmt->execute([':clave' => $key]);
        if ($stmt->rowCount() === 0) {
            responderPortada(404, ['ok' => false, 'error' => 'No se encontró ese destino.']);
        }
        auditarPortada($pdo, 'Eliminar destino', 'Se eliminó el destino de portada ' . $key);
        responderPortada(200, ['ok' => true]);
    }

    responderPortada(400, ['ok' => false, 'error' => 'Acción no reconocida.']);
} catch (InvalidArgumentException $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    responderPortada(422, ['ok' => false, 'error' => $e->getMessage()]);
} catch (Throwable $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    error_log('[TourismEasy] contenido_portada.php - ' . $e->getMessage());
    responderPortada(500, ['ok' => false, 'error' => 'No se pudo procesar el contenido. Verifica que la migración esté instalada.']);
}
