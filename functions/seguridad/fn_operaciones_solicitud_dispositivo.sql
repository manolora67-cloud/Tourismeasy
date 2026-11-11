CREATE OR REPLACE FUNCTION fn_limpiar_solicitudes_dispositivo_antiguas()
RETURNS VOID
LANGUAGE sql
AS $$
    DELETE FROM SOLICITUDES_INICIO_SESION
    WHERE FECHA_CREACION < NOW() - INTERVAL '30 days';
$$;

CREATE OR REPLACE FUNCTION fn_bloquear_sesion_dispositivo(
    p_tipo_cuenta VARCHAR(10),
    p_id_cuenta VARCHAR(10)
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    PERFORM 1
    FROM SESIONES_ACTIVAS
    WHERE TIPO_CUENTA = p_tipo_cuenta
      AND ID_CUENTA = p_id_cuenta
    FOR UPDATE;

    RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION fn_cancelar_solicitudes_dispositivo_vencidas(
    p_tipo_cuenta VARCHAR(10),
    p_id_cuenta VARCHAR(10)
)
RETURNS VOID
LANGUAGE sql
AS $$
    UPDATE SOLICITUDES_INICIO_SESION
    SET ESTADO = 'cancelada'
    WHERE TIPO_CUENTA = p_tipo_cuenta
      AND ID_CUENTA = p_id_cuenta
      AND ESTADO IN ('pendiente', 'aprobada')
      AND FECHA_EXPIRA <= NOW();
$$;

CREATE OR REPLACE FUNCTION fn_contar_solicitudes_dispositivo_recientes(
    p_tipo_cuenta VARCHAR(10),
    p_id_cuenta VARCHAR(10)
)
RETURNS BIGINT
LANGUAGE sql
AS $$
    SELECT COUNT(*)
    FROM SOLICITUDES_INICIO_SESION
    WHERE TIPO_CUENTA = p_tipo_cuenta
      AND ID_CUENTA = p_id_cuenta
      AND FECHA_CREACION > NOW() - MAKE_INTERVAL(mins => (
          SELECT VENTANA_MINUTOS
          FROM CONFIGURACION_SEGURIDAD
          WHERE CONTROL = 'device_request'
      ));
$$;

CREATE OR REPLACE FUNCTION fn_cancelar_solicitudes_dispositivo_previas(
    p_tipo_cuenta VARCHAR(10),
    p_id_cuenta VARCHAR(10)
)
RETURNS VOID
LANGUAGE sql
AS $$
    UPDATE SOLICITUDES_INICIO_SESION
    SET ESTADO = 'cancelada'
    WHERE TIPO_CUENTA = p_tipo_cuenta
      AND ID_CUENTA = p_id_cuenta
      AND ESTADO IN ('pendiente', 'aprobada');
$$;

CREATE OR REPLACE FUNCTION fn_crear_solicitud_dispositivo(
    p_token_hash CHAR(64),
    p_tipo_cuenta VARCHAR(10),
    p_id_cuenta VARCHAR(10),
    p_email VARCHAR,
    p_token_dispositivo_hash CHAR(64)
)
RETURNS BIGINT
LANGUAGE sql
AS $$
    INSERT INTO SOLICITUDES_INICIO_SESION
        (TOKEN_HASH, TIPO_CUENTA, ID_CUENTA, EMAIL, TOKEN_DISPOSITIVO_HASH, FECHA_EXPIRA)
    VALUES
        (p_token_hash, p_tipo_cuenta, p_id_cuenta, p_email, p_token_dispositivo_hash, NOW() + INTERVAL '10 minutes')
    RETURNING ID_SOLICITUD;
$$;

CREATE OR REPLACE FUNCTION fn_cancelar_solicitud_dispositivo(p_id_solicitud BIGINT)
RETURNS VOID
LANGUAGE sql
AS $$
    UPDATE SOLICITUDES_INICIO_SESION
    SET ESTADO = 'cancelada'
    WHERE ID_SOLICITUD = p_id_solicitud;
$$;

CREATE OR REPLACE FUNCTION fn_obtener_solicitud_dispositivo(p_token_hash CHAR(64))
RETURNS TABLE (
    id_solicitud BIGINT,
    email VARCHAR,
    estado VARCHAR(12)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT s.ID_SOLICITUD, s.EMAIL, s.ESTADO
    FROM SOLICITUDES_INICIO_SESION s
    WHERE s.TOKEN_HASH = p_token_hash
    FOR UPDATE;
END;
$$;

CREATE OR REPLACE FUNCTION fn_decidir_solicitud_dispositivo(
    p_id_solicitud BIGINT,
    p_aprobar BOOLEAN,
    p_hash_codigo VARCHAR(255)
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_filas INTEGER;
BEGIN
    IF p_aprobar THEN
        UPDATE SOLICITUDES_INICIO_SESION
        SET ESTADO = 'aprobada',
            HASH_CODIGO = p_hash_codigo,
            INTENTOS_CODIGO = 0,
            FECHA_CONFIRMACION = NOW(),
            FECHA_EXPIRA = NOW() + INTERVAL '5 minutes'
        WHERE ID_SOLICITUD = p_id_solicitud
          AND FECHA_EXPIRA > NOW();
    ELSE
        UPDATE SOLICITUDES_INICIO_SESION
        SET ESTADO = 'rechazada',
            FECHA_CONFIRMACION = NOW()
        WHERE ID_SOLICITUD = p_id_solicitud
          AND FECHA_EXPIRA > NOW();
    END IF;

    GET DIAGNOSTICS v_filas = ROW_COUNT;
    RETURN v_filas = 1;
END;
$$;

CREATE OR REPLACE FUNCTION fn_rechazar_solicitud_dispositivo_aprobada(p_id_solicitud BIGINT)
RETURNS VOID
LANGUAGE sql
AS $$
    UPDATE SOLICITUDES_INICIO_SESION
    SET ESTADO = 'rechazada',
        HASH_CODIGO = NULL
    WHERE ID_SOLICITUD = p_id_solicitud
      AND ESTADO = 'aprobada';
$$;

CREATE OR REPLACE FUNCTION fn_obtener_solicitud_dispositivo_codigo(p_token_hash CHAR(64))
RETURNS TABLE (
    id_solicitud BIGINT,
    id_cuenta VARCHAR(10),
    email VARCHAR,
    tipo_cuenta VARCHAR(10),
    token_dispositivo_hash CHAR(64),
    estado VARCHAR(12),
    hash_codigo VARCHAR(255),
    intentos_codigo SMALLINT,
    fecha_expira TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.ID_SOLICITUD,
        s.ID_CUENTA,
        s.EMAIL,
        s.TIPO_CUENTA,
        s.TOKEN_DISPOSITIVO_HASH,
        s.ESTADO,
        s.HASH_CODIGO,
        s.INTENTOS_CODIGO,
        s.FECHA_EXPIRA
    FROM SOLICITUDES_INICIO_SESION s
    WHERE s.TOKEN_HASH = p_token_hash
    FOR UPDATE;
END;
$$;

CREATE OR REPLACE FUNCTION fn_actualizar_intentos_codigo_dispositivo(
    p_id_solicitud BIGINT,
    p_intentos INTEGER,
    p_estado VARCHAR(12)
)
RETURNS VOID
LANGUAGE sql
AS $$
    UPDATE SOLICITUDES_INICIO_SESION
    SET INTENTOS_CODIGO = p_intentos,
        ESTADO = p_estado
    WHERE ID_SOLICITUD = p_id_solicitud;
$$;

CREATE OR REPLACE FUNCTION fn_consumir_solicitud_dispositivo(p_id_solicitud BIGINT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_filas INTEGER;
BEGIN
    UPDATE SOLICITUDES_INICIO_SESION
    SET ESTADO = 'consumida',
        HASH_CODIGO = NULL
    WHERE ID_SOLICITUD = p_id_solicitud
      AND ESTADO = 'aprobada';

    GET DIAGNOSTICS v_filas = ROW_COUNT;
    RETURN v_filas = 1;
END;
$$;
