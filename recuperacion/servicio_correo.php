<?php
/**
 * servicio_correo.php
 * Envía el correo de recuperación usando PHPMailer + Gmail SMTP.
 */

require_once __DIR__ . '/../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

function enviarCorreoRecuperacion(string $emailDestino, string $enlace): void {

    $mail = new PHPMailer(true);

    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'manolora67@gmail.com';
    $mail->Password   = 'aarc jqau phnv dhfe';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port       = 465;
    $mail->CharSet    = 'UTF-8';

    $mail->setFrom('manolora67@gmail.com', 'TourismEasy Soporte');
    $mail->addAddress($emailDestino);
    $mail->isHTML(true);
    $mail->Subject = 'Recuperación de Contraseña - TourismEasy';
    $mail->Body    = '
    <div style="font-family: Open Sans, sans-serif; max-width: 540px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="font-family: Montserrat, sans-serif; color: #7c3aed; font-size: 1.4rem; margin: 0;">TourismEasy</h1>
        </div>
        <p style="color: #1e293b; font-size: 0.95rem; line-height: 1.6;">Hola,</p>
        <p style="color: #475569; font-size: 0.92rem; line-height: 1.7;">
            Recibimos una solicitud para restablecer la contraseña de tu cuenta.
            Si no fuiste tú, puedes ignorar este mensaje de forma segura.
        </p>
        <div style="text-align: center; margin: 32px 0;">
            <a href="' . htmlspecialchars($enlace) . '"
               style="background-color: #7c3aed; color: #ffffff; padding: 14px 32px;
                      text-decoration: none; font-weight: 700; border-radius: 8px;
                      display: inline-block; font-size: 0.95rem; font-family: Montserrat, sans-serif;">
                Restablecer Contraseña
            </a>
        </div>
        <p style="font-size: 0.78rem; color: #94a3b8; text-align: center; margin-top: 24px;">
            Este enlace vencerá automáticamente en <strong>1 hora</strong>.<br>
            Si el botón no funciona, copia este enlace en tu navegador:<br>
            <span style="color: #7c3aed; word-break: break-all;">' . htmlspecialchars($enlace) . '</span>
        </p>
    </div>';

    $mail->send();
}