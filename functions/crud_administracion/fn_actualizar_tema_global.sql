CREATE OR REPLACE FUNCTION fn_actualizar_tema_global(
    p_paleta JSONB,
    p_id_admin USUARIOS.ID_PERSONA%TYPE
)
RETURNS JSONB AS
$$
DECLARE
    v_paleta JSONB;
    v_anterior JSONB;
BEGIN
    IF p_paleta IS NULL
       OR JSONB_TYPEOF(p_paleta) <> 'object'
       OR p_id_admin IS NULL
       OR NOT EXISTS (SELECT 1 FROM USUARIOS WHERE ID_PERSONA = p_id_admin) THEN
        RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'status', 400, 'error', 'La solicitud de tema no es válida.');
    END IF;

    IF COALESCE(p_paleta->>'primary', '') !~* '^#[0-9A-F]{6}$'
       OR COALESCE(p_paleta->>'primaryLight', '') !~* '^#[0-9A-F]{6}$'
       OR COALESCE(p_paleta->>'primaryDark', '') !~* '^#[0-9A-F]{6}$'
       OR COALESCE(p_paleta->>'accent', '') !~* '^#[0-9A-F]{6}$' THEN
        RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'status', 422, 'error', 'La paleta contiene un color inválido.');
    END IF;

    v_paleta := JSONB_BUILD_OBJECT(
        'primary', UPPER(p_paleta->>'primary'),
        'primaryLight', UPPER(p_paleta->>'primaryLight'),
        'primaryDark', UPPER(p_paleta->>'primaryDark'),
        'accent', UPPER(p_paleta->>'accent')
    );

    SELECT PALETA
    INTO v_anterior
    FROM CONFIGURACION_TEMA_GLOBAL
    WHERE ID_TEMA_GLOBAL = 1
    FOR UPDATE;

    UPDATE CONFIGURACION_TEMA_GLOBAL
    SET PALETA = v_paleta
    WHERE ID_TEMA_GLOBAL = 1;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No se encontró la configuración de tema global.';
    END IF;

    PERFORM fn_registrar_auditoria(
        p_id_admin,
        'Actualizar tema global',
        'Configuración',
        'AUDIT_JSON:' || JSONB_BUILD_OBJECT(
            'detalle', 'Se actualizó la paleta global del sitio.',
            'reg_anterior', v_anterior,
            'reg_nuevo', v_paleta
        )::TEXT,
        'info'
    );

    RETURN JSONB_BUILD_OBJECT('ok', TRUE, 'tema', v_paleta);
END;
$$
LANGUAGE plpgsql;
