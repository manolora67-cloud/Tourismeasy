<?php

require_once __DIR__ . '/../recuperacion/servicio_correo.php';

function crearSolicitudAprobacionDispositivo(
    PDO $pdo,
    string $tipo,
    string $idCuenta,
    string $email,
    string $hashDispositivo,
    string $ip,
    string $agente
): string {
    $token = bin2hex(random_bytes(32));
    $hashToken = hash('sha256', $token);
    $pdo->beginTransaction();
    try {
        $eliminarAntiguas = $pdo->prepare(
            "DELETE FROM SOLICITUDES_INICIO_SESION
             WHERE FECHA_CREACION < NOW() - INTERVAL '30 days'"
        );
        $eliminarAntiguas->execute();

        $bloquearCuenta = $pdo->prepare(
            'SELECT 1 FROM SESIONES_ACTIVAS
             WHERE TIPO_CUENTA = :tipo AND ID_CUENTA = :id
             FOR UPDATE'
        );
        $bloquearCuenta->execute([':tipo' => $tipo, ':id' => $idCuenta]);
        if (!$bloquearCuenta->fetchColumn()) {
            throw new RuntimeException('La sesión activa ya no está disponible.');
        }

        $limpiar = $pdo->prepare(
            "UPDATE SOLICITUDES_INICIO_SESION
             SET ESTADO = 'cancelada'
             WHERE TIPO_CUENTA = :tipo
               AND ID_CUENTA = :id
               AND ESTADO IN ('pendiente', 'aprobada')
               AND FECHA_EXPIRA <= NOW()"
        );
        $limpiar->execute([':tipo' => $tipo, ':id' => $idCuenta]);

        $limite = $pdo->prepare(
            "SELECT COUNT(*)
             FROM SOLICITUDES_INICIO_SESION
             WHERE TIPO_CUENTA = :tipo
               AND ID_CUENTA = :id
               AND FECHA_CREACION > NOW() - INTERVAL '15 minutes'"
        );
        $limite->execute([':tipo' => $tipo, ':id' => $idCuenta]);
        if ((int)$limite->fetchColumn() >= 3) {
            throw new OverflowException('Hay demasiadas solicitudes recientes. Intenta de nuevo más tarde.');
        }

        $cancelar = $pdo->prepare(
            "UPDATE SOLICITUDES_INICIO_SESION
             SET ESTADO = 'cancelada'
             WHERE TIPO_CUENTA = :tipo
               AND ID_CUENTA = :id
               AND ESTADO IN ('pendiente', 'aprobada')"
        );
        $cancelar->execute([':tipo' => $tipo, ':id' => $idCuenta]);

        $insertar = $pdo->prepare(
            "INSERT INTO SOLICITUDES_INICIO_SESION
                (TOKEN_HASH, TIPO_CUENTA, ID_CUENTA, EMAIL, TOKEN_DISPOSITIVO_HASH, FECHA_EXPIRA)
             VALUES
                (:token, :tipo, :id, :email, :dispositivo, NOW() + INTERVAL '10 minutes')
             RETURNING ID_SOLICITUD"
        );
        $insertar->execute([
            ':token' => $hashToken,
            ':tipo' => $tipo,
            ':id' => $idCuenta,
            ':email' => $email,
            ':dispositivo' => $hashDispositivo,
        ]);
        $idSolicitud = (int)$insertar->fetchColumn();
        $pdo->commit();
    } catch (Throwable $error) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $error;
    }

    try {
        $nombre = obtenerNombreRecuperacion($pdo, $email);
        enviarCorreoSolicitudDispositivo($email, $nombre, $token, $ip, $agente);
    } catch (Throwable $error) {
        $cancelar = $pdo->prepare(
            "UPDATE SOLICITUDES_INICIO_SESION SET ESTADO = 'cancelada' WHERE ID_SOLICITUD = :id"
        );
        $cancelar->execute([':id' => $idSolicitud]);
        throw $error;
    }

    return $token;
}

function confirmarSolicitudAprobacionDispositivo(PDO $pdo, string $token, bool $aprobar): string
{
    if (!preg_match('/^[a-f0-9]{64}$/D', $token)) {
        return 'expirada';
    }

    $codigo = '';
    $pdo->beginTransaction();
    try {
        $buscar = $pdo->prepare(
            'SELECT ID_SOLICITUD, EMAIL, ESTADO
             FROM SOLICITUDES_INICIO_SESION
             WHERE TOKEN_HASH = :token
             FOR UPDATE'
        );
        $buscar->execute([':token' => hash('sha256', $token)]);
        $solicitud = $buscar->fetch(PDO::FETCH_ASSOC);
        if (!$solicitud || $solicitud['estado'] !== 'pendiente') {
            $pdo->commit();
            return 'expirada';
        }

        if ($aprobar) {
            $codigo = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
            $hashCodigo = password_hash($codigo, PASSWORD_DEFAULT);
            if ($hashCodigo === false) {
                throw new RuntimeException('No se pudo generar el código de aprobación.');
            }
            $actualizar = $pdo->prepare(
                "UPDATE SOLICITUDES_INICIO_SESION
                 SET ESTADO = 'aprobada',
                     HASH_CODIGO = :codigo,
                     INTENTOS_CODIGO = 0,
                     FECHA_CONFIRMACION = NOW(),
                     FECHA_EXPIRA = NOW() + INTERVAL '5 minutes'
                 WHERE ID_SOLICITUD = :id
                   AND FECHA_EXPIRA > NOW()"
            );
            $actualizar->execute([':codigo' => $hashCodigo, ':id' => $solicitud['id_solicitud']]);
            if ($actualizar->rowCount() !== 1) {
                $pdo->commit();
                return 'expirada';
            }
        } else {
            $actualizar = $pdo->prepare(
                "UPDATE SOLICITUDES_INICIO_SESION
                 SET ESTADO = 'rechazada', FECHA_CONFIRMACION = NOW()
                 WHERE ID_SOLICITUD = :id
                   AND FECHA_EXPIRA > NOW()"
            );
            $actualizar->execute([':id' => $solicitud['id_solicitud']]);
            if ($actualizar->rowCount() !== 1) {
                $pdo->commit();
                return 'expirada';
            }
        }
        $pdo->commit();
    } catch (Throwable $error) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $error;
    }

    if (!$aprobar) {
        return 'rechazada';
    }

    try {
        $nombre = obtenerNombreRecuperacion($pdo, (string)$solicitud['email']);
        enviarCodigoInicioSesion((string)$solicitud['email'], $nombre, $codigo);
    } catch (Throwable $error) {
        $rechazar = $pdo->prepare(
            "UPDATE SOLICITUDES_INICIO_SESION
             SET ESTADO = 'rechazada', HASH_CODIGO = NULL
             WHERE ID_SOLICITUD = :id AND ESTADO = 'aprobada'"
        );
        $rechazar->execute([':id' => $solicitud['id_solicitud']]);
        throw $error;
    }

    return 'aprobada';
}

function validarCodigoAprobacionDispositivo(
    PDO $pdo,
    string $token,
    string $codigo,
    string $tipo,
    string $email,
    string $hashDispositivo
): array {
    if (!preg_match('/^[a-f0-9]{64}$/D', $token)) {
        return ['ok' => false, 'error' => 'solicitud_invalida'];
    }

    $pdo->beginTransaction();
    try {
        $buscar = $pdo->prepare(
            'SELECT ID_SOLICITUD, ID_CUENTA, EMAIL, TIPO_CUENTA, TOKEN_DISPOSITIVO_HASH,
                    ESTADO, HASH_CODIGO, INTENTOS_CODIGO, FECHA_EXPIRA
             FROM SOLICITUDES_INICIO_SESION
             WHERE TOKEN_HASH = :token
             FOR UPDATE'
        );
        $buscar->execute([':token' => hash('sha256', $token)]);
        $solicitud = $buscar->fetch(PDO::FETCH_ASSOC);
        if (!$solicitud || $solicitud['estado'] !== 'aprobada') {
            $pdo->commit();
            return ['ok' => false, 'error' => 'solicitud_invalida'];
        }

        if (
            strtotime((string)$solicitud['fecha_expira']) <= time()
            || $solicitud['tipo_cuenta'] !== $tipo
            || strcasecmp((string)$solicitud['email'], $email) !== 0
            || !hash_equals(trim((string)$solicitud['token_dispositivo_hash']), $hashDispositivo)
        ) {
            $pdo->commit();
            return ['ok' => false, 'error' => 'solicitud_expirada'];
        }

        if ((int)$solicitud['intentos_codigo'] >= 5) {
            $pdo->commit();
            return ['ok' => false, 'error' => 'limite_alcanzado'];
        }

        if (!is_string($solicitud['hash_codigo']) || !password_verify($codigo, $solicitud['hash_codigo'])) {
            $intentos = (int)$solicitud['intentos_codigo'] + 1;
            $estado = $intentos >= 5 ? 'bloqueada' : 'aprobada';
            $actualizar = $pdo->prepare(
                'UPDATE SOLICITUDES_INICIO_SESION
                 SET INTENTOS_CODIGO = :intentos, ESTADO = :estado
                 WHERE ID_SOLICITUD = :id'
            );
            $actualizar->execute([
                ':intentos' => $intentos,
                ':estado' => $estado,
                ':id' => $solicitud['id_solicitud'],
            ]);
            $pdo->commit();
            return ['ok' => false, 'error' => $estado === 'bloqueada' ? 'limite_alcanzado' : 'codigo_invalido'];
        }

        return [
            'ok' => true,
            'id_solicitud' => (int)$solicitud['id_solicitud'],
            'id_cuenta' => (string)$solicitud['id_cuenta'],
        ];
    } catch (Throwable $error) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $error;
    }
}

function consumirSolicitudAprobacionDispositivo(PDO $pdo, int $idSolicitud): void
{
    $actualizar = $pdo->prepare(
        "UPDATE SOLICITUDES_INICIO_SESION
         SET ESTADO = 'consumida', HASH_CODIGO = NULL
         WHERE ID_SOLICITUD = :id AND ESTADO = 'aprobada'"
    );
    $actualizar->execute([':id' => $idSolicitud]);
    if ($actualizar->rowCount() !== 1) {
        throw new RuntimeException('La solicitud de acceso ya no está disponible.');
    }
}
