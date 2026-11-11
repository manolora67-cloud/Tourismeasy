CREATE OR REPLACE FUNCTION fn_obtener_control_seguridad(p_control VARCHAR(30))
RETURNS TABLE (
    max_intentos SMALLINT,
    ventana_minutos SMALLINT,
    duracion_bloqueo_minutos SMALLINT,
    contar_exitosos BOOLEAN,
    limite_mensual SMALLINT
) AS
$$
BEGIN
    RETURN QUERY
    SELECT c.MAX_INTENTOS, c.VENTANA_MINUTOS, c.DURACION_BLOQUEO_MINUTOS,
           c.CONTAR_EXITOSOS, c.LIMITE_MENSUAL
    FROM CONFIGURACION_SEGURIDAD c
    WHERE c.CONTROL = p_control;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No existe la configuración del control de seguridad %.', p_control;
    END IF;
END;
$$
LANGUAGE plpgsql;
