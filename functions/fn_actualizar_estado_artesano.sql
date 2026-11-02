CREATE OR REPLACE FUNCTION fn_actualizar_estado_artesano(
    p_id            USUARIOS_ECOMMERCE.ID_PERSONA_ECOMMERCE%TYPE,
    p_nuevo_estado  USUARIOS_ECOMMERCE.ESTADO%TYPE,
    p_admin         AUDITORIA.ID_USUARIO%TYPE DEFAULT NULL
)
RETURNS BOOLEAN AS
$$
DECLARE
    v_accion TEXT;
BEGIN
    IF p_nuevo_estado NOT IN ('ACTIVO', 'INACTIVO', 'PENDIENTE') THEN
        RETURN FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM USUARIOS_ECOMMERCE WHERE ID_PERSONA_ECOMMERCE = p_id) THEN
        RETURN FALSE;
    END IF;

    UPDATE USUARIOS_ECOMMERCE
    SET ESTADO = p_nuevo_estado
    WHERE ID_PERSONA_ECOMMERCE = p_id;

    -- Registrar en auditoría: aprobar -> ACTIVO, rechazar -> INACTIVO
    v_accion := CASE
        WHEN p_nuevo_estado = 'ACTIVO'   THEN 'Artesano aprobado'
        WHEN p_nuevo_estado = 'INACTIVO' THEN 'Artesano rechazado'
        ELSE NULL
    END;

    IF v_accion IS NOT NULL THEN
        PERFORM fn_registrar_auditoria(
            p_admin,
            v_accion,
            'ARTESANOS',
            'Artesano ' || p_id || ' -> ' || p_nuevo_estado,
            'info',
            NULL,
            p_id
        );
    END IF;

    RETURN TRUE;

EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN
        RAISE NOTICE 'fn_actualizar_estado_artesano - FK inválida: %', SQLERRM;
        RETURN FALSE;
    WHEN CHECK_VIOLATION THEN
        RAISE NOTICE 'fn_actualizar_estado_artesano - Check violado: %', SQLERRM;
        RETURN FALSE;
    WHEN LOCK_NOT_AVAILABLE THEN
        RAISE NOTICE 'fn_actualizar_estado_artesano - Fila bloqueada: %', SQLERRM;
        RETURN FALSE;
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_actualizar_estado_artesano: %', SQLERRM;
        RETURN FALSE;
END;
$$
LANGUAGE plpgsql;