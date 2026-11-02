<?php
/**
 * servicio_correo.php
 * Envía el correo de recuperación usando PHPMailer + Gmail SMTP.
 */

require_once __DIR__ . '/../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

function obtenerNombreRecuperacion(PDO $pdo, string $email): string
{
    try {
        $stmt = $pdo->prepare(
            "SELECT nombre, tipo
             FROM (
                 SELECT 'admin' AS tipo,
                        CONCAT_WS(' ', NULLIF(BTRIM(u.NOM_PERSONA), ''), NULLIF(BTRIM(u.APE_PERSONA), '')) AS nombre,
                        u.EMAIL_LOGIN AS email
                 FROM USUARIOS u
                 UNION ALL
                 SELECT 'empresa' AS tipo, e.NOM_EMPRESA AS nombre, ue.EMAIL_LOGIN AS email
                 FROM USUARIOS_EMPRESA ue
                 JOIN EMPRESAS e ON e.ID_EMPRESA = ue.ID_EMPRESA
                 UNION ALL
                 SELECT 'artesano' AS tipo,
                        CONCAT_WS(' ', NULLIF(BTRIM(p.NOM_PERSONA_ECOMMERCE), ''), NULLIF(BTRIM(p.APE_PERSONA_ECOMMERCE), '')) AS nombre,
                        u.EMAIL_LOGIN AS email
                 FROM USUARIOS_ECOMMERCE u
                 JOIN PERSONAS_ECOMMERCE p ON p.ID_PERSONA_ECOMMERCE = u.ID_PERSONA_ECOMMERCE
             ) cuentas
             WHERE LOWER(cuentas.email) = LOWER(:email)
             LIMIT 1"
        );
        $stmt->execute([':email' => $email]);
        $cuenta = $stmt->fetch(PDO::FETCH_ASSOC);
        $nombre = trim((string)($cuenta['nombre'] ?? ''));
        if ($nombre === '') {
            return '';
        }

        if (($cuenta['tipo'] ?? '') !== 'empresa') {
            $partes = preg_split('/\s+/u', $nombre);
            return $partes[0] ?? '';
        }

        return $nombre;
    } catch (PDOException $e) {
        error_log('[TourismEasy] servicio_correo.php - No se pudo obtener el nombre del destinatario: ' . $e->getMessage());
        return '';
    }
}

function enviarCorreoRecuperacion(string $emailDestino, string $nombreDestino, string $enlace): void {

    $mail = new PHPMailer(true);
    $nombre = trim($nombreDestino);
    $saludoHtml = $nombre !== ''
        ? 'Hola, <strong>' . htmlspecialchars($nombre, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') . '</strong> 👋'
        : 'Hola 👋';
    $enlaceHtml = htmlspecialchars($enlace, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');

    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'tourismeasyadso@gmail.com';
    $mail->Password   = 'jioq ucah vqsg hvsg';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port       = 465;
    $mail->CharSet    = 'UTF-8';

    $mail->setFrom('tourismeasyadso@gmail.com', 'TourismEasy Soporte');
    $mail->addAddress($emailDestino, $nombre);
    $mail->isHTML(true);
    $mail->Subject = 'Te ayudamos a recuperar el acceso a TourismEasy';
    $mail->Body    = '
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #334155; line-height: 1.7; border: 1px solid #e2e8f0; border-radius: 16px; background: #ffffff;">
        <div style="text-align: center; margin-bottom: 28px;">
            <h1 style="color: #7c3aed; font-size: 24px; margin: 0;">TourismEasy</h1>
            <p style="color: #64748b; font-size: 14px; margin: 6px 0 0;">Estamos aquí para ayudarte</p>
        </div>
        <p style="color: #1e293b; font-size: 16px; margin-bottom: 12px;">' . $saludoHtml . '</p>
        <p style="font-size: 15px; margin: 0 0 14px;">
            Recibimos tu solicitud para recuperar el acceso a TourismEasy. ¡Con gusto te ayudamos!
            Usa el botón de abajo para crear una nueva contraseña.
        </p>
        <div style="text-align: center; margin: 28px 0;">
            <a href="' . $enlaceHtml . '"
               style="background-color: #7c3aed; color: #ffffff; padding: 13px 26px;
                      text-decoration: none; font-weight: 700; border-radius: 9px;
                      display: inline-block; font-size: 15px;">
                Crear nueva contraseña
            </a>
        </div>
        <p style="font-size: 14px; margin: 0 0 12px;">
            Este enlace estará disponible durante <strong>1 hora</strong> y solo puede usarse una vez.
        </p>
        <p style="font-size: 13px; color: #64748b; margin: 0;">
            Si no solicitaste este cambio, no tienes que hacer nada: tu contraseña seguirá siendo la misma.
        </p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;">
        <p style="font-size: 12px; color: #64748b; margin: 0;">
            Si el botón no funciona, copia este enlace en tu navegador:<br>
            <a href="' . $enlaceHtml . '" style="color: #7c3aed; word-break: break-all;">' . $enlaceHtml . '</a>
        </p>
        <p style="font-size: 13px; color: #64748b; margin: 24px 0 0;">Un saludo,<br><strong>El equipo de TourismEasy</strong></p>
    </div>';
    $mail->AltBody =
        ($nombre !== '' ? "Hola, {$nombre} 👋\n\n" : "Hola 👋\n\n") .
        "Recibimos tu solicitud para recuperar el acceso a TourismEasy. ¡Con gusto te ayudamos! " .
        "Usa este enlace para crear una nueva contraseña: {$enlace}\n\n" .
        "El enlace estará disponible durante 1 hora y solo puede usarse una vez. " .
        "Si no solicitaste este cambio, no tienes que hacer nada: tu contraseña seguirá siendo la misma.\n\n" .
        "Un saludo,\nEl equipo de TourismEasy";

    $mail->send();
}