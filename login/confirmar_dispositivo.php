<?php
require_once __DIR__ . '/../con_db/db.php';
require_once __DIR__ . '/../con_db/aprobacion_dispositivo.php';

header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

$token = $_SERVER['REQUEST_METHOD'] === 'POST'
    ? trim((string)($_POST['token'] ?? ''))
    : trim((string)($_GET['token'] ?? ''));
$resultado = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $decision = (string)($_POST['decision'] ?? '');
    if (!in_array($decision, ['si', 'no'], true)) {
        http_response_code(400);
        $resultado = 'Solicitud inválida.';
    } else {
        try {
            $resultado = confirmarSolicitudAprobacionDispositivo($pdo, $token, $decision === 'si');
        } catch (Throwable $error) {
            error_log('[TourismEasy] confirmar_dispositivo.php - ' . $error->getMessage());
            http_response_code(500);
            $resultado = 'No se pudo procesar la solicitud. Intenta de nuevo o inicia sesión otra vez.';
        }
    }
}

$tokenValido = preg_match('/^[a-f0-9]{64}$/D', $token) === 1;
$mensajes = [
    'aprobada' => 'Aprobaste el inicio de sesión. Enviamos un código de seis dígitos a este correo. Escríbelo en el dispositivo donde solicitaste el acceso. La sesión actual seguirá activa hasta que el código se use.',
    'rechazada' => 'Rechazaste el inicio de sesión. No se generó ningún código y la sesión actual sigue activa.',
    'rechazada_previamente' => 'Ya elegiste “No soy yo” para esta solicitud. Fue anulada y no se puede aprobar después. Tu sesión actual sigue activa.',
    'decision_previamente' => 'Esta solicitud ya fue respondida y no se puede cambiar. Tu sesión actual sigue activa.',
    'expirada' => 'Esta solicitud ya venció o fue utilizada. Tu sesión actual no se ha cerrado.',
];
$contenido = $resultado !== null
    ? ($mensajes[$resultado] ?? $resultado)
    : 'Se solicitó iniciar sesión en un dispositivo nuevo. ¿Reconoces este intento?';
?>
<!doctype html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Confirmación de inicio de sesión - TourismEasy</title>
    <link rel="stylesheet" href="../tema_global.php?v=global-theme-v1">
    <style>
        body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f1f5f9;font-family:Arial,sans-serif;color:#1e293b}
        main{box-sizing:border-box;width:min(92vw,520px);padding:32px;border:1px solid #e2e8f0;border-radius:16px;background:#fff;box-shadow:0 16px 45px #0f172a18}
        h1{margin-top:0;color:var(--theme-primary-dark,#6d28d9)}p{line-height:1.6}.actions{display:flex;gap:12px;margin-top:24px}
        button{flex:1;padding:13px;border:0;border-radius:8px;font-size:16px;font-weight:700;cursor:pointer}
        .yes{background:var(--theme-primary-dark,#6d28d9);color:#fff}.no{background:#e2e8f0;color:#334155}
    </style>
</head>
<body>
<main>
    <h1>TourismEasy</h1>
    <p><?= htmlspecialchars($contenido, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') ?></p>
    <?php if ($resultado === null && $tokenValido): ?>
        <form method="post" class="actions">
            <input type="hidden" name="token" value="<?= htmlspecialchars($token, ENT_QUOTES, 'UTF-8') ?>">
            <button class="yes" type="submit" name="decision" value="si">Sí, soy yo</button>
            <button class="no" type="submit" name="decision" value="no">No soy yo</button>
        </form>
    <?php elseif ($resultado === null): ?>
        <p>El enlace no es válido. Inicia sesión de nuevo para solicitar otro.</p>
    <?php endif; ?>
</main>
</body>
</html>
