<?php

require_once __DIR__ . '/../recuperacion/servicio_correo.php';

class ErrorAprobacionDispositivo extends RuntimeException
{
    private string $etapa;
    private string $causa;

    public function __construct(string $etapa, Throwable $error)
    {
        $this->etapa = $etapa;
        $sqlState = $error instanceof PDOException
            ? (string)($error->errorInfo[0] ?? $error->getCode())
            : '';
        $this->causa = [
            '42P01' => 'tabla_no_encontrada',
            '42703' => 'columna_no_encontrada',
            '23514' => 'restriccion_check',
            '23502' => 'valor_requerido',
            '23503' => 'relacion_no_encontrada',
            '23505' => 'duplicado',
            '42501' => 'permiso_insuficiente',
        ][$sqlState] ?? ($error instanceof PDOException ? 'error_base_de_datos' : 'error_interno');
        parent::__construct($error->getMessage(), 0, $error);
    }

    public function obtenerEtapa(): string
    {
        return $this->etapa;
    }

    public function obtenerCausa(): string
    {
        return $this->causa;
    }
}

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
    $etapa = 'iniciando_transaccion';
    try {
        $pdo->beginTransaction();

        $etapa = 'limpiando_solicitudes_antiguas';
        $pdo->query('SELECT fn_limpiar_solicitudes_dispositivo_antiguas()');

        $etapa = 'bloqueando_sesion_actual';
        $bloquearCuenta = $pdo->prepare(
            'SELECT fn_bloquear_sesion_dispositivo(:tipo, :id)'
        );
        $bloquearCuenta->execute([':tipo' => $tipo, ':id' => $idCuenta]);
        if (!$bloquearCuenta->fetchColumn()) {
            throw new RuntimeException('La sesión activa ya no está disponible.');
        }

        $etapa = 'cancelando_solicitudes_vencidas';
        $limpiar = $pdo->prepare(
            'SELECT fn_cancelar_solicitudes_dispositivo_vencidas(:tipo, :id)'
        );
        $limpiar->execute([':tipo' => $tipo, ':id' => $idCuenta]);

        $etapa = 'contando_solicitudes_recientes';
        $limite = $pdo->prepare(
            'SELECT fn_contar_solicitudes_dispositivo_recientes(:tipo, :id)'
        );
        $limite->execute([':tipo' => $tipo, ':id' => $idCuenta]);
        if ((int)$limite->fetchColumn() >= 3) {
            throw new OverflowException('Hay demasiadas solicitudes recientes. Intenta de nuevo más tarde.');
        }

        $etapa = 'cancelando_solicitudes_previas';
        $cancelar = $pdo->prepare(
            'SELECT fn_cancelar_solicitudes_dispositivo_previas(:tipo, :id)'
        );
        $cancelar->execute([':tipo' => $tipo, ':id' => $idCuenta]);

        $etapa = 'insertando_solicitud';
        $insertar = $pdo->prepare(
            'SELECT fn_crear_solicitud_dispositivo(:token, :tipo, :id, :email, :dispositivo)'
        );
        $insertar->execute([
            ':token' => $hashToken,
            ':tipo' => $tipo,
            ':id' => $idCuenta,
            ':email' => $email,
            ':dispositivo' => $hashDispositivo,
        ]);
        $idSolicitud = (int)$insertar->fetchColumn();

        $etapa = 'confirmando_transaccion';
        $pdo->commit();
    } catch (OverflowException $error) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $error;
    } catch (Throwable $error) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw new ErrorAprobacionDispositivo($etapa, $error);
    }

    try {
        $nombre = obtenerNombreRecuperacion($pdo, $email);
        enviarCorreoSolicitudDispositivo($email, $nombre, $token, $ip, $agente);
    } catch (Throwable $error) {
        try {
            $cancelar = $pdo->prepare('SELECT fn_cancelar_solicitud_dispositivo(:id)');
            $cancelar->execute([':id' => $idSolicitud]);
        } catch (Throwable $errorCancelacion) {
            throw new ErrorAprobacionDispositivo('cancelando_solicitud', $errorCancelacion);
        }
        throw new ErrorAprobacionDispositivo('enviando_correo', $error);
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
            'SELECT * FROM fn_obtener_solicitud_dispositivo(:token)'
        );
        $buscar->execute([':token' => hash('sha256', $token)]);
        $solicitud = $buscar->fetch(PDO::FETCH_ASSOC);
        if (!$solicitud) {
            $pdo->commit();
            return 'expirada';
        }
        if ($solicitud['estado'] === 'rechazada') {
            $pdo->commit();
            return 'rechazada_previamente';
        }
        if ($solicitud['estado'] !== 'pendiente') {
            $pdo->commit();
            return 'decision_previamente';
        }

        if ($aprobar) {
            $codigo = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
            $hashCodigo = password_hash($codigo, PASSWORD_DEFAULT);
            if ($hashCodigo === false) {
                throw new RuntimeException('No se pudo generar el código de aprobación.');
            }
        } else {
            $hashCodigo = null;
        }

        $actualizar = $pdo->prepare(
            'SELECT fn_decidir_solicitud_dispositivo(:id, :aprobar, :codigo)'
        );
        $actualizar->execute([
            ':id' => $solicitud['id_solicitud'],
            ':aprobar' => $aprobar,
            ':codigo' => $hashCodigo,
        ]);
        if (!in_array($actualizar->fetchColumn(), [true, 't', 'true', '1', 1], true)) {
            $pdo->commit();
            return 'expirada';
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
            'SELECT fn_rechazar_solicitud_dispositivo_aprobada(:id)'
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
            'SELECT * FROM fn_obtener_solicitud_dispositivo_codigo(:token)'
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
                'SELECT fn_actualizar_intentos_codigo_dispositivo(:id, :intentos, :estado)'
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
        'SELECT fn_consumir_solicitud_dispositivo(:id)'
    );
    $actualizar->execute([':id' => $idSolicitud]);
    if (!in_array($actualizar->fetchColumn(), [true, 't', 'true', '1', 1], true)) {
        throw new RuntimeException('La solicitud de acceso ya no está disponible.');
    }
}
