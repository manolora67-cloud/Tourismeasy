CREATE OR REPLACE FUNCTION fn_actualizar_estado_empresa(
    p_nit      EMPRESAS.ID_EMPRESA%TYPE,
    p_id_admin USUARIOS.ID_PERSONA%TYPE
)
RETURNS TABLE (
    ok          BOOLEAN,
    mensaje     TEXT,
    nuevo_estado USUARIOS_EMPRESA.ESTADO%TYPE
) AS
$$
DECLARE
    v_estado_actual USUARIOS_EMPRESA.ESTADO%TYPE;
    v_nombre        EMPRESAS.NOM_EMPRESA%TYPE;
    v_nuevo         USUARIOS_EMPRESA.ESTADO%TYPE;
BEGIN
    SELECT u.ESTADO, e.NOM_EMPRESA
    INTO v_estado_actual, v_nombre
    FROM USUARIOS_EMPRESA u
    JOIN EMPRESAS e ON e.ID_EMPRESA = u.ID_EMPRESA
    WHERE u.ID_EMPRESA = p_nit;

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'Empresa no encontrada.'::TEXT, NULL::USUARIOS_EMPRESA.ESTADO%TYPE;
        RETURN;
    END IF;

    IF v_estado_actual NOT IN ('ACTIVO', 'INACTIVO') THEN
        RETURN QUERY SELECT FALSE, 'Esta empresa todavía está pendiente de aprobación.'::TEXT, NULL::USUARIOS_EMPRESA.ESTADO%TYPE;
        RETURN;
    END IF;

    v_nuevo := CASE WHEN v_estado_actual = 'ACTIVO' THEN 'INACTIVO' ELSE 'ACTIVO' END;

    UPDATE USUARIOS_EMPRESA SET ESTADO = v_nuevo WHERE ID_EMPRESA = p_nit;

    PERFORM fn_registrar_auditoria(
        p_id_admin,
        CASE WHEN v_nuevo = 'INACTIVO' THEN 'Empresa inactivada' ELSE 'Empresa activada' END,
        'Empresas',
        v_nombre,
        CASE WHEN v_nuevo = 'INACTIVO' THEN 'advertencia' ELSE 'info' END
    );

    RETURN QUERY SELECT TRUE, 'Estado actualizado.'::TEXT, v_nuevo;

EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN
        RAISE NOTICE 'fn_actualizar_estado_empresa - El usuario admin o la empresa no existen: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'El usuario administrador no es válido.'::TEXT, NULL::USUARIOS_EMPRESA.ESTADO%TYPE;
    WHEN CHECK_VIOLATION THEN
        RAISE NOTICE 'fn_actualizar_estado_empresa - Check violado (estado inválido): %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'Estado inválido para la empresa.'::TEXT, NULL::USUARIOS_EMPRESA.ESTADO%TYPE;
    WHEN LOCK_NOT_AVAILABLE THEN
        RAISE NOTICE 'fn_actualizar_estado_empresa - Fila bloqueada: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'La empresa está siendo modificada, intenta de nuevo.'::TEXT, NULL::USUARIOS_EMPRESA.ESTADO%TYPE;
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_actualizar_estado_empresa - Error inesperado: %', SQLERRM;
        RETURN QUERY SELECT FALSE, ('Error: ' || SQLERRM)::TEXT, NULL::USUARIOS_EMPRESA.ESTADO%TYPE;
END;
$$
LANGUAGE plpgsql;