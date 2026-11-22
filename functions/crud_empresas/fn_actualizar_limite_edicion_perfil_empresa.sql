CREATE OR REPLACE FUNCTION fn_actualizar_limite_edicion_perfil_empresa(
    p_limite INTEGER,
    p_admin USUARIOS.ID_PERSONA%TYPE
)
RETURNS JSONB AS
$$
DECLARE
    v_anterior CONFIGURACION_LIMITE_PERFIL_EMPRESA%ROWTYPE;
    v_nuevo CONFIGURACION_LIMITE_PERFIL_EMPRESA%ROWTYPE;
BEGIN
    IF p_limite IS NULL OR p_limite NOT BETWEEN 1 AND 10
       OR p_admin IS NULL OR BTRIM(p_admin) = '' THEN
        RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'error', 'El límite debe ser un número entero entre 1 y 10.');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM USUARIOS WHERE ID_PERSONA = p_admin) THEN
        RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'error', 'La sesión de administrador no es válida.');
    END IF;

    SELECT * INTO v_anterior
    FROM CONFIGURACION_LIMITE_PERFIL_EMPRESA
    WHERE ID_CONFIG = 1
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'error', 'No se encontró la configuración del límite de perfil.');
    END IF;

    IF v_anterior.LIMITE_MENSUAL = p_limite THEN
        RETURN JSONB_BUILD_OBJECT(
            'ok', TRUE,
            'data', JSONB_BUILD_OBJECT(
                'limite_mensual', v_anterior.LIMITE_MENSUAL,
                'actualizado_por', v_anterior.ACTUALIZADO_POR,
                'fecha_actualizacion', v_anterior.FECHA_ACTUALIZACION,
                'actualizado', FALSE
            )
        );
    END IF;

    UPDATE CONFIGURACION_LIMITE_PERFIL_EMPRESA
    SET LIMITE_MENSUAL = p_limite::SMALLINT,
        ACTUALIZADO_POR = p_admin,
        FECHA_ACTUALIZACION = NOW()
    WHERE ID_CONFIG = 1
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
        'Límite de edición de perfil actualizado',
        'Límite mensual de cambios de perfil: ' || v_anterior.LIMITE_MENSUAL || ' -> ' || v_nuevo.LIMITE_MENSUAL,
        'info',
        'Configuración de perfil',
        TO_JSONB(v_anterior),
        TO_JSONB(v_nuevo)
    );

    RETURN JSONB_BUILD_OBJECT(
        'ok', TRUE,
        'data', JSONB_BUILD_OBJECT(
            'limite_mensual', v_nuevo.LIMITE_MENSUAL,
            'actualizado_por', v_nuevo.ACTUALIZADO_POR,
            'fecha_actualizacion', v_nuevo.FECHA_ACTUALIZACION,
            'actualizado', TRUE
        )
    );
END;
$$
LANGUAGE plpgsql;
