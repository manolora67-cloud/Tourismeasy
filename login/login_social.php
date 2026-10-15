<?php
/**
 * login_social.php
 * Verifica el token que entrega Google o Facebook, y:
 *   - si el email ya existe en USUARIOS -> inicia sesión (igual que login.php)
 *   - si no existe -> deja los datos en $_SESSION['social_pendiente'] y le dice
 *     al frontend que muestre el mini-formulario (documento + celular)
 *
 * Espera JSON: { "proveedor": "google" | "facebook", "token": "..." }
 *   - google:   token = credential (id_token / JWT) que devuelve Google Identity Services
 *   - facebook: token = accessToken que devuelve FB.login()
 */

session_start();
require_once __DIR__ . '/../con_db/db.php';

header('Content-Type: application/json');
require_once __DIR__ . '/../cors.php';

// ── TODO: reemplaza con tus credenciales reales ──
const GOOGLE_CLIENT_ID     = '823644304181-egetedgpopqf61lpia3ckbm611c7fov6.apps.googleusercontent.com';
const FACEBOOK_APP_ID      = '4732282403706862';
const FACEBOOK_APP_SECRET  = 'e502587f3e42d14c292c31110bc65ec1';

$input     = json_decode(file_get_contents('php://input'), true);
$proveedor = trim($input['proveedor'] ?? '');
$token     = trim($input['token']     ?? '');

if (!$token || !in_array($proveedor, ['google', 'facebook'])) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "Datos incompletos."]);
    exit;
}

/**
 * Pequeño helper para hacer un GET y decodificar JSON, con timeout corto
 * para no dejar la petición colgada si el proveedor no responde.
 */
function fetchJson(string $url): ?array {
    $ctx = stream_context_create(['http' => ['timeout' => 6]]);
    $raw = @file_get_contents($url, false, $ctx);
    if ($raw === false) return null;
    $data = json_decode($raw, true);
    return is_array($data) ? $data : null;
}

$email    = null;
$nombre   = null;
$apellido = null;

try {
    if ($proveedor === 'google') {
        // El frontend ahora manda un access_token (flujo de popup), no un
        // id_token. Lo verificamos por dos vías: de quién es (tokeninfo)
        // y sus datos (userinfo).
        $check = fetchJson('https://oauth2.googleapis.com/tokeninfo?access_token=' . urlencode($token));
        $aud   = $check['aud'] ?? ($check['azp'] ?? '');

        if (!$check || $aud !== GOOGLE_CLIENT_ID) {
            http_response_code(401);
            echo json_encode(["ok" => false, "error" => "Token de Google inválido."]);
            exit;
        }

        $ctx  = stream_context_create(['http' => [
            'timeout' => 6,
            'header'  => "Authorization: Bearer $token",
        ]]);
        $raw  = @file_get_contents('https://www.googleapis.com/oauth2/v3/userinfo', false, $ctx);
        $info = $raw ? json_decode($raw, true) : null;

        if (!$info || empty($info['email'])) {
            http_response_code(401);
            echo json_encode(["ok" => false, "error" => "No se pudo obtener tu correo de Google."]);
            exit;
        }

        $email    = strtolower(trim($info['email']));
        $nombre   = trim($info['given_name']  ?? ($info['name'] ?? 'Usuario'));
        $apellido = trim($info['family_name'] ?? '');

    } else { // facebook
        // 1) Confirmamos que el access token pertenece a NUESTRA app (evita que
        //    alguien mande el token de otra app y se haga pasar por otro usuario).
        $debug = fetchJson(
            'https://graph.facebook.com/debug_token?input_token=' . urlencode($token) .
            '&access_token=' . urlencode(FACEBOOK_APP_ID . '|' . FACEBOOK_APP_SECRET)
        );

        if (!$debug || empty($debug['data']['is_valid']) || ($debug['data']['app_id'] ?? '') !== FACEBOOK_APP_ID) {
            http_response_code(401);
            echo json_encode(["ok" => false, "error" => "Token de Facebook inválido."]);
            exit;
        }

        // 2) Pedimos el perfil (solo nombre y email, sin foto)
        $perfil = fetchJson('https://graph.facebook.com/me?fields=name,email&access_token=' . urlencode($token));

        if (!$perfil || empty($perfil['email'])) {
            http_response_code(422);
            echo json_encode(["ok" => false, "error" =>
                "Tu cuenta de Facebook no tiene un correo público. Regístrate con correo y contraseña."]);
            exit;
        }

        $email = strtolower(trim($perfil['email']));
        $partes = explode(' ', trim($perfil['name'] ?? 'Usuario'), 2);
        $nombre   = $partes[0];
        $apellido = $partes[1] ?? '';
    }

    // ── Buscar si ya existe cuenta con ese email ──
    $stmt = $pdo->prepare("SELECT * FROM fn_login_social_persona(:email, :proveedor)");
    $stmt->execute([':email' => $email, ':proveedor' => $proveedor]);
    $row = $stmt->fetch();

    if ($row['ok']) {
        // Cuenta existente -> iniciar sesión, igual que login.php
        session_regenerate_id(true);
        $_SESSION['tipo']       = $row['rol'];
        $_SESSION['id_persona'] = $row['id_persona'];
        $_SESSION['email']      = $row['email_login'];
        $_SESSION['nombre']     = $row['nom_persona'] . ' ' . $row['ape_persona'];
        unset($_SESSION['social_pendiente']);

        $nombreCompleto = $row['nom_persona'] . ' ' . $row['ape_persona'];
        $avatar = strtoupper(substr($row['nom_persona'], 0, 1) . substr($row['ape_persona'], 0, 1));

        echo json_encode([
            "ok"      => true,
            "nuevo"   => false,
            "session" => [
                "tipo"   => $row['rol'],
                "id"     => $row['id_persona'],
                "email"  => $row['email_login'],
                "nombre" => $nombreCompleto,
                "avatar" => $avatar,
            ]
        ]);
        exit;
    }

    if ($row['mensaje'] === 'CUENTA_NUEVA') {
        // No existe todavía: guardamos los datos YA VERIFICADOS en la sesión
        // del servidor (no en el cliente) para que el siguiente paso
        // (registro_viajero_social.php) no tenga que volver a confiar en
        // un email que mande el navegador.
        $_SESSION['social_pendiente'] = [
            'email'     => $email,
            'nombre'    => $nombre,
            'apellido'  => $apellido,
            'proveedor' => $proveedor,
        ];

        echo json_encode([
            "ok"     => true,
            "nuevo"  => true,
            "perfil" => ["email" => $email, "nombre" => $nombre, "apellido" => $apellido],
        ]);
        exit;
    }

    // Cuenta existe pero inactiva, etc.
    echo json_encode(["ok" => false, "error" => $row['mensaje']]);

} catch (PDOException $e) {
    error_log('[TourismEasy] login_social.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "Error interno del servidor."]);
}