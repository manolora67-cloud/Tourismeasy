CREATE OR REPLACE FUNCTION fn_verificar_bloqueo_seguridad(
    p_control VARCHAR(30),
    p_sujeto VARCHAR(255)
)
RETURNS TABLE (
    bloqueado BOOLEAN,
    minutos_restantes INTEGER
) AS
$$
DECLARE
    v_max_intentos SMALLINT;
    v_ventana_minutos SMALLINT;
    v_duracion_bloqueo SMALLINT;
    v_contar_exitosos BOOLEAN;
    v_intentos BIGINT;
    v_sujeto VARCHAR(255);
    v_hasta TIMESTAMPTZ;
BEGIN
    IF p_sujeto IS NULL OR LENGTH(BTRIM(p_sujeto)) NOT BETWEEN 1 AND 255 THEN
        RAISE EXCEPTION 'El sujeto del control de seguridad no es válido.';
    END IF;

    v_sujeto := LOWER(BTRIM(p_sujeto));
    SELECT c.MAX_INTENTOS, c.VENTANA_MINUTOS, c.DURACION_BLOQUEO_MINUTOS,
           c.CONTAR_EXITOSOS
    INTO STRICT v_max_intentos, v_ventana_minutos, v_duracion_bloqueo, v_contar_exitosos
    FROM CONFIGURACION_SEGURIDAD c
    WHERE c.CONTROL = p_control;

    PERFORM pg_advisory_xact_lock(HASHTEXT(p_control), HASHTEXT(v_sujeto));

    SELECT COUNT(*)
    INTO v_intentos
    FROM INTENTOS_SEGURIDAD i
    WHERE i.CONTROL = p_control
      AND i.SUJETO = v_sujeto
      AND i.FECHA_INTENTO > NOW() - MAKE_INTERVAL(mins => v_ventana_minutos)
      AND (NOT i.EXITOSO OR v_contar_exitosos);

    SELECT b.BLOQUEADO_HASTA
    INTO v_hasta
    FROM BLOQUEOS_SEGURIDAD b
    WHERE b.CONTROL = p_control
      AND b.SUJETO = v_sujeto;

    IF v_intentos >= v_max_intentos AND v_hasta IS NULL THEN
        v_hasta := NOW() + MAKE_INTERVAL(mins => v_duracion_bloqueo);
        INSERT INTO BLOQUEOS_SEGURIDAD (CONTROL, SUJETO, BLOQUEADO_HASTA)
        VALUES (p_control, v_sujeto, v_hasta)
        ON CONFLICT (CONTROL, SUJETO) DO UPDATE
        SET BLOQUEADO_HASTA = EXCLUDED.BLOQUEADO_HASTA;
    END IF;

    RETURN QUERY SELECT
        COALESCE(v_hasta > NOW(), FALSE),
        CASE WHEN v_hasta > NOW()
            THEN CEIL(EXTRACT(EPOCH FROM (v_hasta - NOW())) / 60.0)::INTEGER
            ELSE 0
        END;
END;
$$
LANGUAGE plpgsql;
