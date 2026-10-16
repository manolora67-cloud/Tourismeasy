<?php
/**
 * con_db/seguridad_login.php
 *
 * Obtiene la IP del cliente desde las cabeceras del servidor. La persistencia
 * del intento y el cálculo del bloqueo viven en fn_registrar_intento_login()
 * y fn_verificar_bloqueo_login().
 */

/**
 * Obtiene la IP real del cliente, considerando proxys/balanceadores comunes.
 */
function obtenerIpCliente(): string
{
    foreach (['HTTP_X_FORWARDED_FOR', 'HTTP_CLIENT_IP', 'REMOTE_ADDR'] as $key) {
        if (!empty($_SERVER[$key])) {
            $ip = trim(explode(',', $_SERVER[$key])[0]);
            if (filter_var($ip, FILTER_VALIDATE_IP)) {
                return $ip;
            }
        }
    }
    return '0.0.0.0';
}