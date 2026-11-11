CREATE OR REPLACE FUNCTION fn_actualizar_configuracion_seguridad(
    p_control VARCHAR(30),
    p_max_intentos INTEGER,
    p_ventana_minutos INTEGER,
    p_duracion_bloqueo_minutos INTEGER,
    p_limite_mensual INTEGER,
    p_admin VARCHAR(10)
)
RETURNS JSONB AS
$$
DECLARE
    v_anterior CONFIGURACION_SEGURIDAD%ROWTYPE;
    v_nuevo CONFIGURACION_SEGURIDAD%ROWTYPE;
BEGIN
    IF p_admin IS NULL OR p_admin = '' THEN
        RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'error', 'La sesión de administrador no es válida.');
    END IF;
    IF p_control IS NULL
       OR p_max_intentos IS NULL OR p_max_intentos NOT BETWEEN 1 AND 10
       OR p_ventana_minutos IS NULL OR p_ventana_minutos NOT BETWEEN 1 AND 1440
       OR p_duracion_bloqueo_minutos IS NULL OR p_duracion_bloqueo_minutos NOT BETWEEN 1 AND 10080
       OR (p_control = 'device_code' AND p_max_intentos > 5)
       OR (p_control = 'password_change' AND
           (p_limite_mensual IS NULL OR p_limite_mensual NOT BETWEEN 1 AND 10))
       OR (p_control <> 'password_change' AND p_limite_mensual IS NOT NULL) THEN
        RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'error', 'Los límites configurados están fuera del rango permitido.');
    END IF;

    SELECT * INTO v_anterior
    FROM CONFIGURACION_SEGURIDAD
    WHERE CONTROL = p_control
    FOR UPDATE;
    IF NOT FOUND THEN
        RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'error', 'El control de seguridad solicitado no existe.');
    END IF;

    UPDATE CONFIGURACION_SEGURIDAD
    SET MAX_INTENTOS = p_max_intentos,
        VENTANA_MINUTOS = p_ventana_minutos,
        DURACION_BLOQUEO_MINUTOS = p_duracion_bloqueo_minutos,
        LIMITE_MENSUAL = p_limite_mensual,
        ACTUALIZADO_POR = p_admin,
        FECHA_ACTUALIZACION = NOW()
    WHERE CONTROL = p_control
    RETURNING * INTO v_nuevo;

    INSERT INTO AUDITORIA (
        FECHA_HORA,
        ID_USUARIO,
        NOM_OPERACION,
        DETALLE,
        NIVEL,
        TABLA_AFECTADA,
        REG_ANTERIOR,
        REG_NUEVO
    )
    VALUES (
        NOW(),
        p_admin,
        'Configuración de seguridad',
        'Actualización del control ' || p_control,
        'info',
        'Seguridad',
        TO_JSONB(v_anterior),
        TO_JSONB(v_nuevo)
    );

    RETURN JSONB_BUILD_OBJECT(
        'ok', TRUE,
        'data', JSONB_BUILD_OBJECT(
            'control', v_nuevo.CONTROL,
            'max_intentos', v_nuevo.MAX_INTENTOS,
            'ventana_minutos', v_nuevo.VENTANA_MINUTOS,
            'duracion_bloqueo_minutos', v_nuevo.DURACION_BLOQUEO_MINUTOS,
            'contar_exitosos', v_nuevo.CONTAR_EXITOSOS,
            'limite_mensual', v_nuevo.LIMITE_MENSUAL,
            'actualizado_por', v_nuevo.ACTUALIZADO_POR,
            'fecha_actualizacion', v_nuevo.FECHA_ACTUALIZACION
        )
    );
END;
$$
LANGUAGE plpgsql;
