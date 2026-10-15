<?php
/**
 * registro_viajero_social.php
 * Segundo paso del login social para un email nuevo: el usuario ya se
 * autenticó con Google/Facebook (ver login_social.php), así que aquí solo
 * pedimos lo que el proveedor NUNCA entrega: documento y celular.
 * El email, nombre y apellido se toman de $_SESSION['social_pendiente']
 * (no del body) para que nadie pueda registrar una cuenta con un correo
 * que no verificó.
 *
 * Espera JSON: { "documento": "...", "tipo_doc": 1, "celular": "...",
 *               "nombre": "...", "apellido": "..." }
 * (nombre/apellido son opcionales, por si el usuario quiere corregir lo
 * que vino de Google/Facebook)
 */

session_start();
require_once __DIR__ . '/../con_db/db.php';

header('Content-Type: application/json');
require_once __DIR__ . '/../cors.php';

if (empty($_SESSION['social_pendiente'])) {
    http_response_code(440);
    echo json_encode(["ok" => false, "error" =>
        "Tu sesión con Google/Facebook expiró. Vuelve a intentarlo."]);
    exit;
}

$pendiente = $_SESSION['social_pendiente'];
$email     = $pendiente['email'];   // ← siempre del servidor, nunca del cliente

$input         = json_decode(file_get_contents('php://input'), true);
$documento     = trim($input['documento']     ?? '');
$tipo_doc      = intval($input['tipo_doc']    ?? 0);
$celular       = trim($input['celular']       ?? '');
$nombre        = trim($input['nombre']   ?? '') ?: $pendiente['nombre'];
$apellido      = trim($input['apellido'] ?? '') ?: $pendiente['apellido'];

if (!$documento || !$tipo_doc || !$celular || !$nombre || !$apellido) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "Documento, tipo de documento, celular y nombre son obligatorios."]);
    exit;
}

// La cuenta solo se podrá usar entrando por Google/Facebook, así que la
// contraseña es un hash aleatorio que el usuario nunca necesita teclear.
$hash = bin2hex(random_bytes(32));

try {
    $stmt = $pdo->prepare("
        SELECT * FROM fn_registrar_viajero(:doc, :tipo_doc, :nombre, :apellido, :celular, :email, :hash)
    ");
    $stmt->execute([
        ':doc'      => $documento,
        ':tipo_doc' => $tipo_doc,
        ':nombre'   => $nombre,
        ':apellido' => $apellido,
        ':celular'  => $celular,
        ':email'    => $email,
        ':hash'     => $hash,
    ]);
    $row = $stmt->fetch();

    if (!$row['ok']) {
        echo json_encode(["ok" => false, "error" => $row['mensaje']]);
        exit;
    }

    // Registro OK -> iniciar sesión de una vez, igual que login.php
    session_regenerate_id(true);
    $_SESSION['tipo']       = 'viajero';
    $_SESSION['id_persona'] = $documento;
    $_SESSION['email']      = $email;
    $_SESSION['nombre']     = $nombre . ' ' . $apellido;
    unset($_SESSION['social_pendiente']);

    $avatar = strtoupper(substr($nombre, 0, 1) . substr($apellido, 0, 1));

    echo json_encode([
        "ok"      => true,
        "mensaje" => $row['mensaje'],
        "session" => [
            "tipo"   => "viajero",
            "id"     => $documento,
            "email"  => $email,
            "nombre" => $nombre . ' ' . $apellido,
            "avatar" => $avatar,
        ]
    ]);

} catch (PDOException $e) {
    error_log('[TourismEasy] registro_viajero_social.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "Error al crear la cuenta. Intenta de nuevo."]);
}
