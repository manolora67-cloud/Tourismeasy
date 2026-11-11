CREATE OR REPLACE FUNCTION fn_actualizar_contrasena_cuenta(
    p_tipo          VARCHAR(10),
    p_id            VARCHAR(10),
    p_hash_actual   VARCHAR(255),
    p_hash_nuevo    VARCHAR(255)
)
RETURNS TABLE (
    ok                  BOOLEAN,
    mensaje             TEXT,
    cambios_restantes   INTEGER,
    codigo              TEXT
) AS
$$
DECLARE
    v_cambios_mes BIGINT;
    v_limite_mensual SMALLINT;
BEGIN
    IF p_tipo IS NULL OR p_tipo NOT IN ('admin', 'empresa', 'artesano') OR p_id IS NULL OR p_id = '' THEN
        RETURN QUERY SELECT FALSE, 'La cuenta no es válida.'::TEXT, 0, 'INVALID_ACCOUNT'::TEXT;
        RETURN;
    END IF;

    PERFORM pg_advisory_xact_lock(HASHTEXT(p_tipo), HASHTEXT(p_id));

    SELECT c.LIMITE_MENSUAL
    INTO STRICT v_limite_mensual
    FROM CONFIGURACION_SEGURIDAD c
    WHERE c.CONTROL = 'password_change';

    SELECT COUNT(*) INTO v_cambios_mes
    FROM CAMBIOS_CONTRASENA_CUENTA c
    WHERE c.TIPO_CUENTA = p_tipo
      AND c.ID_CUENTA = p_id
      AND c.FECHA_CAMBIO >= DATE_TRUNC('month', CURRENT_TIMESTAMP)
      AND c.FECHA_CAMBIO < DATE_TRUNC('month', CURRENT_TIMESTAMP) + INTERVAL '1 month';

    IF v_cambios_mes >= v_limite_mensual THEN
        RETURN QUERY SELECT FALSE,
            ('Ya alcanzaste el máximo de ' || v_limite_mensual::TEXT
                || ' cambios de contraseña de este mes.')::TEXT,
            0,
            'MONTHLY_LIMIT'::TEXT;
        RETURN;
    END IF;

    IF p_tipo = 'admin' THEN
        UPDATE USUARIOS
        SET CONTRASENA = p_hash_nuevo
        WHERE ID_PERSONA = p_id
          AND ESTADO = 'ACTIVO'
          AND CONTRASENA = p_hash_actual;
    ELSIF p_tipo = 'empresa' THEN
        UPDATE USUARIOS_EMPRESA
        SET CONTRASENA = p_hash_nuevo
        WHERE ID_EMPRESA = p_id
          AND ESTADO = 'ACTIVO'
          AND CONTRASENA = p_hash_actual;
    ELSE
        UPDATE USUARIOS_ECOMMERCE
        SET CONTRASENA = p_hash_nuevo
        WHERE ID_PERSONA_ECOMMERCE = p_id
          AND ESTADO = 'ACTIVO'
          AND CONTRASENA = p_hash_actual;
    END IF;

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE,
            'No se pudo validar la cuenta. Inicia sesión nuevamente.'::TEXT,
            GREATEST(v_limite_mensual - v_cambios_mes, 0)::INTEGER,
            'INVALID_CREDENTIALS'::TEXT;
        RETURN;
    END IF;

    INSERT INTO CAMBIOS_CONTRASENA_CUENTA (TIPO_CUENTA, ID_CUENTA)
    VALUES (p_tipo, p_id);

    RETURN QUERY SELECT TRUE,
        'Contraseña actualizada correctamente.'::TEXT,
        GREATEST(v_limite_mensual - v_cambios_mes - 1, 0)::INTEGER,
        'OK'::TEXT;
EXCEPTION
    WHEN CHECK_VIOLATION THEN
        RAISE NOTICE 'fn_actualizar_contrasena_cuenta - Check violado: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'La contraseña nueva no tiene un formato válido.'::TEXT, 0, 'INVALID_PASSWORD'::TEXT;
    WHEN LOCK_NOT_AVAILABLE THEN
        RAISE NOTICE 'fn_actualizar_contrasena_cuenta - Fila bloqueada: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'La cuenta está siendo modificada, intenta de nuevo.'::TEXT, 0, 'ACCOUNT_LOCKED'::TEXT;
END;
$$
LANGUAGE plpgsql;
