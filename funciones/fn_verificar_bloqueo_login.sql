CREATE OR REPLACE FUNCTION fn_verificar_bloqueo_login(
    p_email INTENTOS_LOGIN.EMAIL%TYPE,
    p_max_intentos INTEGER DEFAULT 3,
    p_minutos INTEGER DEFAULT 5
)
RETURNS TABLE (
    bloqueado BOOLEAN,
    minutos_restantes INTEGER
) AS
$$
DECLARE
    v_fallos BIGINT;
    v_ultimo TIMESTAMP;
    v_restantes INTEGER;
BEGIN
    SELECT COUNT(*), MAX(i.FECHA_INTENTO)
    INTO v_fallos, v_ultimo
    FROM INTENTOS_LOGIN i
    WHERE i.EMAIL = LOWER(BTRIM(p_email))
      AND i.EXITOSO = FALSE
      AND i.FECHA_INTENTO > NOW() - MAKE_INTERVAL(mins => p_minutos);

    v_restantes := CEIL(GREATEST(0, p_minutos * 60 - EXTRACT(EPOCH FROM (NOW() - v_ultimo))) / 60.0)::INTEGER;
    RETURN QUERY SELECT (v_fallos >= p_max_intentos AND v_restantes > 0),
        CASE WHEN v_fallos >= p_max_intentos AND v_restantes > 0 THEN v_restantes ELSE 0 END;
EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN RAISE NOTICE 'fn_verificar_bloqueo_login - FK inválida: %', SQLERRM; RETURN QUERY SELECT TRUE, p_minutos;
    WHEN CHECK_VIOLATION THEN RAISE NOTICE 'fn_verificar_bloqueo_login - Check violado: %', SQLERRM; RETURN QUERY SELECT TRUE, p_minutos;
    WHEN LOCK_NOT_AVAILABLE THEN RAISE NOTICE 'fn_verificar_bloqueo_login - Tabla bloqueada: %', SQLERRM; RETURN QUERY SELECT TRUE, p_minutos;
    WHEN OTHERS THEN RAISE NOTICE 'fn_verificar_bloqueo_login: %', SQLERRM; RETURN QUERY SELECT TRUE, p_minutos;
END;
$$ LANGUAGE plpgsql;