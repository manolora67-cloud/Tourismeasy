CREATE OR REPLACE FUNCTION fn_actualizar_solicitud_empresa(
    p_nit      EMPRESAS.ID_EMPRESA%TYPE,
    p_accion   VARCHAR,
    p_id_admin USUARIOS.ID_PERSONA%TYPE
)
RETURNS TABLE (ok BOOLEAN, mensaje TEXT) AS
$$
DECLARE
    v_nuevo_estado USUARIOS_EMPRESA.ESTADO%TYPE;
    v_nombre       EMPRESAS.NOM_EMPRESA%TYPE;
    v_filas        INTEGER;
BEGIN
    IF p_accion NOT IN ('APROBAR', 'RECHAZAR') THEN
        RETURN QUERY SELECT FALSE, 'Acción inválida.'::TEXT;
        RETURN;
    END IF;

    SELECT NOM_EMPRESA INTO v_nombre FROM EMPRESAS WHERE ID_EMPRESA = p_nit;

    v_nuevo_estado := CASE WHEN p_accion = 'APROBAR' THEN 'ACTIVO' ELSE 'INACTIVO' END;

    UPDATE USUARIOS_EMPRESA
    SET ESTADO = v_nuevo_estado
    WHERE ID_EMPRESA = p_nit AND ESTADO = 'PENDIENTE';

    GET DIAGNOSTICS v_filas = ROW_COUNT;

    IF v_filas = 0 THEN
        RETURN QUERY SELECT FALSE, 'Solicitud no encontrada o ya procesada.'::TEXT;
        RETURN;
    END IF;

    PERFORM fn_registrar_auditoria(
        p_id_admin,
        CASE WHEN p_accion = 'APROBAR' THEN 'Empresa aceptada' ELSE 'Empresa rechazada' END,
        'Solicitudes',
        COALESCE(v_nombre, p_nit) || ' (NIT ' || p_nit || ')',
        CASE WHEN p_accion = 'APROBAR' THEN 'info' ELSE 'advertencia' END
    );

    RETURN QUERY SELECT TRUE,
        (CASE WHEN p_accion = 'APROBAR' THEN 'Empresa aprobada correctamente.' ELSE 'Solicitud rechazada.' END)::TEXT;

EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN
        RAISE NOTICE 'fn_actualizar_solicitud_empresa - El usuario admin o la empresa no existen: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'El usuario administrador no es válido o la empresa fue eliminada.'::TEXT;
    WHEN CHECK_VIOLATION THEN
        RAISE NOTICE 'fn_actualizar_solicitud_empresa - Estado inválido: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'Estado inválido para la solicitud.'::TEXT;
    WHEN LOCK_NOT_AVAILABLE THEN
        RAISE NOTICE 'fn_actualizar_solicitud_empresa - Fila bloqueada: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'La solicitud está siendo procesada por otra operación, intenta de nuevo.'::TEXT;
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_actualizar_solicitud_empresa - Error inesperado: %', SQLERRM;
        RETURN QUERY SELECT FALSE, ('Error al procesar la solicitud: ' || SQLERRM)::TEXT;
END;
$$
LANGUAGE plpgsql;