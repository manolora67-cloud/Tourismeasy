CREATE OR REPLACE FUNCTION fn_registrar_intento_seguridad(
    p_control VARCHAR(30),
    p_sujeto VARCHAR(255),
    p_ip VARCHAR(45),
    p_exitoso BOOLEAN
)
RETURNS BOOLEAN AS
$$
DECLARE
    v_max_intentos SMALLINT;
    v_ventana_minutos SMALLINT;
    v_duracion_bloqueo SMALLINT;
    v_contar_exitosos BOOLEAN;
    v_intentos BIGINT;
    v_sujeto VARCHAR(255);
BEGIN
    v_sujeto := LOWER(BTRIM(p_sujeto));
    IF p_sujeto IS NULL OR LENGTH(v_sujeto) NOT BETWEEN 1 AND 255
       OR p_exitoso IS NULL OR p_ip IS NULL OR LENGTH(p_ip) > 45 THEN
        RAISE EXCEPTION 'Los datos del intento de seguridad no son válidos.';
    END IF;

    SELECT c.MAX_INTENTOS, c.VENTANA_MINUTOS, c.DURACION_BLOQUEO_MINUTOS,
           c.CONTAR_EXITOSOS
    INTO STRICT v_max_intentos, v_ventana_minutos, v_duracion_bloqueo, v_contar_exitosos
    FROM CONFIGURACION_SEGURIDAD c
    WHERE c.CONTROL = p_control;

    PERFORM pg_advisory_xact_lock(HASHTEXT(p_control), HASHTEXT(v_sujeto));

    INSERT INTO INTENTOS_SEGURIDAD (CONTROL, SUJETO, IP_ORIGEN, EXITOSO)
    VALUES (p_control, v_sujeto, p_ip, p_exitoso);

    IF NOT p_exitoso OR v_contar_exitosos THEN
        SELECT COUNT(*)
        INTO v_intentos
        FROM INTENTOS_SEGURIDAD i
        WHERE i.CONTROL = p_control
          AND i.SUJETO = v_sujeto
          AND i.FECHA_INTENTO > NOW() - MAKE_INTERVAL(mins => v_ventana_minutos)
          AND (NOT i.EXITOSO OR v_contar_exitosos);

        IF v_intentos >= v_max_intentos THEN
            INSERT INTO BLOQUEOS_SEGURIDAD (CONTROL, SUJETO, BLOQUEADO_HASTA)
            VALUES (p_control, v_sujeto, NOW() + MAKE_INTERVAL(mins => v_duracion_bloqueo))
            ON CONFLICT (CONTROL, SUJETO) DO UPDATE
            SET BLOQUEADO_HASTA = EXCLUDED.BLOQUEADO_HASTA;
        END IF;
    END IF;

    RETURN TRUE;
END;
$$
LANGUAGE plpgsql;
