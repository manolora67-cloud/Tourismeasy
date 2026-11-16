<?php
require_once __DIR__ . '/../con_db/sesion_persistente.php';
iniciarSesionPersistente();
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

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        if (($_GET['map'] ?? '') === '1') {
            $destinos = $pdo->query('SELECT * FROM fn_listar_destinos_mapa()')->fetchAll();
            foreach ($destinos as &$destino) {
                if (is_string($destino['mapa'] ?? null)) {
                    $destino['mapa'] = json_decode($destino['mapa'], true, 512, JSON_THROW_ON_ERROR);
                }
            }
            unset($destino);
            responderPortada(200, ['ok' => true, 'data' => $destinos]);
        }

        $admin = ($_GET['admin'] ?? '') === '1';
        if ($admin && !esAdminPortada()) {
            responderPortada(401, ['ok' => false, 'error' => 'Se requiere una sesión de administración.']);
        }

        $stmt = $pdo->prepare('SELECT * FROM fn_listar_contenido_portada(:solo_publicados)');
        $stmt->execute([':solo_publicados' => $admin ? 'false' : 'true']);
        $initialized = filter_var($pdo->query('SELECT fn_estado_inicial_portada(FALSE)::TEXT')->fetchColumn(), FILTER_VALIDATE_BOOLEAN);
        $csrf = null;
        if ($admin) {
            $_SESSION['csrf_portada'] = $_SESSION['csrf_portada'] ?? bin2hex(random_bytes(32));
            $csrf = $_SESSION['csrf_portada'];
        }

        responderPortada(200, [
            'ok' => true,
            'data' => $stmt->fetchAll(),
            'initialized' => $initialized,
            'csrf' => $csrf,
        ]);
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        responderPortada(405, ['ok' => false, 'error' => 'Método no permitido.']);
    }
    if (!esAdminPortada()) {
        responderPortada(401, ['ok' => false, 'error' => 'Se requiere una sesión de administración.']);
    }
    if (empty($_SESSION['csrf_portada']) || !hash_equals($_SESSION['csrf_portada'], $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '')) {
        responderPortada(403, ['ok' => false, 'error' => 'La sesión de edición expiró. Recarga el panel e intenta de nuevo.']);
    }

    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        responderPortada(400, ['ok' => false, 'error' => 'La solicitud no contiene JSON válido.']);
    }

    if (($input['action'] ?? '') === 'bootstrap') {
        $pdo->beginTransaction();
        $stmt = $pdo->prepare('SELECT fn_inicializar_contenido_portada(CAST(:destinos AS JSONB), CAST(:articulos AS JSONB), :admin)::TEXT');
        $stmt->execute([
            ':destinos' => json_encode($input['destinos'] ?? [], JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
            ':articulos' => json_encode($input['articulos'] ?? [], JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
            ':admin' => $_SESSION['id_persona'],
        ]);
        if (!filter_var($stmt->fetchColumn(), FILTER_VALIDATE_BOOLEAN)) {
            $pdo->rollBack();
            responderPortada(422, ['ok' => false, 'error' => 'No se pudo cargar el contenido inicial; revisa los datos y las funciones SQL instaladas.']);
        }
        $pdo->commit();
        $destinos = $pdo->query('SELECT * FROM fn_listar_contenido_portada(FALSE)')->fetchAll();
        responderPortada(200, ['ok' => true, 'data' => $destinos]);
    }

    if (($input['action'] ?? '') === 'save') {
        $destino = $input['destino'] ?? null;
        if (!is_array($destino)) {
            responderPortada(422, ['ok' => false, 'error' => 'El destino enviado no es válido.']);
        }
        $municipio = $input['municipio'] ?? null;
        if ($municipio !== null) {
            if (!is_array($municipio)) {
                responderPortada(422, ['ok' => false, 'error' => 'Los datos de ubicación del municipio no son válidos.']);
            }
            $idCiudad = $municipio['id'] ?? null;
            $latitud = $municipio['latitud'] ?? null;
            $longitud = $municipio['longitud'] ?? null;
            if (
                !(is_string($idCiudad) || is_int($idCiudad))
                || !preg_match('/^68[0-9]{3,4}$/D', (string)$idCiudad)
                || !(is_int($latitud) || is_float($latitud))
                || !(is_int($longitud) || is_float($longitud))
                || !is_finite((float)$latitud)
                || !is_finite((float)$longitud)
                || (float)$latitud < 5.5
                || (float)$latitud > 8.5
                || (float)$longitud < -74.5
                || (float)$longitud > -72
            ) {
                responderPortada(422, ['ok' => false, 'error' => 'Selecciona una ubicación válida para el municipio.']);
            }
        }

        $pdo->beginTransaction();
        $stmt = $pdo->prepare('SELECT fn_guardar_contenido_portada(CAST(:destino AS JSONB), :admin, TRUE)::TEXT');
        $stmt->execute([
            ':destino' => json_encode($destino, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
            ':admin' => $_SESSION['id_persona'],
        ]);
        if (!filter_var($stmt->fetchColumn(), FILTER_VALIDATE_BOOLEAN)) {
            $pdo->rollBack();
            responderPortada(422, ['ok' => false, 'error' => 'No se pudo guardar el destino; revisa los campos y las rutas de imagen/video.']);
        }
        if ($municipio !== null) {
            $ubicacion = $pdo->prepare(
                'SELECT fn_actualizar_coordenadas_municipio(:id, :latitud, :longitud, :admin)::TEXT'
            );
            $ubicacion->execute([
                ':id' => (string)$idCiudad,
                ':latitud' => (float)$latitud,
                ':longitud' => (float)$longitud,
                ':admin' => $_SESSION['id_persona'],
            ]);
            if (!filter_var($ubicacion->fetchColumn(), FILTER_VALIDATE_BOOLEAN)) {
                $pdo->rollBack();
                responderPortada(422, ['ok' => false, 'error' => 'No se pudo guardar la ubicación del municipio. Revisa el punto en el mapa e intenta de nuevo.']);
            }
        }

        $consultaGuardado = $pdo->prepare(
            'SELECT * FROM fn_listar_contenido_portada(FALSE) WHERE "key" = :clave'
        );
        $consultaGuardado->execute([':clave' => strtolower(trim((string)($destino['key'] ?? '')))]);
        $guardado = $consultaGuardado->fetch(PDO::FETCH_ASSOC);
        if (!$guardado) {
            $pdo->rollBack();
            responderPortada(500, ['ok' => false, 'error' => 'El destino no aparece después de guardarlo. Verifica las funciones SQL de contenido de portada instaladas.']);
        }

        if (is_string($guardado['article'] ?? null)) {
            $guardado['article'] = json_decode($guardado['article'], true, 512, JSON_THROW_ON_ERROR);
        }
        $mapaSolicitado = $destino['article']['mapa'] ?? null;
        if (is_array($mapaSolicitado) && ($mapaSolicitado['destacado'] ?? false) === true) {
            $mapaGuardado = $guardado['article']['mapa'] ?? null;
            $coordenadasGuardadas = is_array($mapaGuardado)
                && ($mapaGuardado['destacado'] ?? false) === true
                && is_numeric($mapaGuardado['latitud'] ?? null)
                && is_numeric($mapaGuardado['longitud'] ?? null)
                && abs((float)$mapaGuardado['latitud'] - (float)$mapaSolicitado['latitud']) < 0.0000001
                && abs((float)$mapaGuardado['longitud'] - (float)$mapaSolicitado['longitud']) < 0.0000001;
            if (!$coordenadasGuardadas) {
                $pdo->rollBack();
                responderPortada(500, [
                    'ok' => false,
                    'error' => 'La ubicación no quedó guardada. Actualiza fn_guardar_contenido_portada.sql en la base de datos e inténtalo de nuevo.',
                ]);
            }
        }

        $pdo->commit();
        responderPortada(200, ['ok' => true, 'data' => $guardado]);
    }

    if (($input['action'] ?? '') === 'delete') {
        $stmt = $pdo->prepare('SELECT fn_eliminar_contenido_portada(:clave, :admin)::TEXT');
        $stmt->execute([
            ':clave' => strtolower(trim((string)($input['key'] ?? ''))),
            ':admin' => $_SESSION['id_persona'],
        ]);
        if (!filter_var($stmt->fetchColumn(), FILTER_VALIDATE_BOOLEAN)) {
            responderPortada(404, ['ok' => false, 'error' => 'No se encontró ese destino o la clave no es válida.']);
        }
        responderPortada(200, ['ok' => true]);
    }

    responderPortada(400, ['ok' => false, 'error' => 'Acción no reconocida.']);
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('[TourismEasy] admin/contenido_portada.php - ' . $e->getMessage());
    responderPortada(500, ['ok' => false, 'error' => 'No se pudo procesar el contenido. Verifica el esquema y las funciones SQL instaladas.']);
}
