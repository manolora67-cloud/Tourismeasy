CREATE OR REPLACE FUNCTION fn_eliminar_empresa(
    p_nit      EMPRESAS.ID_EMPRESA%TYPE,
    p_id_admin USUARIOS.ID_PERSONA%TYPE
)
RETURNS TABLE (
    ok      BOOLEAN,
    mensaje TEXT
) AS
$$
DECLARE
    v_nombre        EMPRESAS.NOM_EMPRESA%TYPE;
    v_tipo_servicio EMPRESAS.TIPO_SERVICIO%TYPE;
    v_tiene_serv    BOOLEAN := FALSE;
BEGIN
    SELECT NOM_EMPRESA, TIPO_SERVICIO INTO v_nombre, v_tipo_servicio
    FROM EMPRESAS WHERE ID_EMPRESA = p_nit;

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'Empresa no encontrada.'::TEXT;
        RETURN;
    END IF;

    -- No se puede eliminar si la empresa tiene servicios publicados
    CASE v_tipo_servicio
        WHEN 'TRANSPORTE' THEN
            v_tiene_serv := EXISTS (SELECT 1 FROM TRANSPORTE WHERE ID_EMPRESA = p_nit);
        WHEN 'HOSPEDAJE' THEN
            v_tiene_serv := EXISTS (SELECT 1 FROM HOSPEDAJE WHERE ID_EMPRESA = p_nit);
        WHEN 'PLANES' THEN
            v_tiene_serv := EXISTS (SELECT 1 FROM PLANES_TURISTICOS WHERE ID_EMPRESA = p_nit);
    END CASE;

    IF v_tiene_serv THEN
        RETURN QUERY SELECT FALSE, 'No se puede eliminar: la empresa todavía tiene servicios publicados.'::TEXT;
        RETURN;
    END IF;

    DELETE FROM USUARIOS_EMPRESA WHERE ID_EMPRESA = p_nit;
    DELETE FROM EMPRESAS WHERE ID_EMPRESA = p_nit;

    PERFORM fn_registrar_auditoria(p_id_admin, 'Empresa eliminada', 'Empresas', v_nombre || ' (NIT ' || p_nit || ')', 'advertencia');

    RETURN QUERY SELECT TRUE, 'Empresa eliminada permanentemente.'::TEXT;

EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN
        RAISE NOTICE 'fn_eliminar_empresa - FK inválida: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'No se puede eliminar: la empresa tiene datos asociados en otras tablas.'::TEXT;
    WHEN CHECK_VIOLATION THEN
        RAISE NOTICE 'fn_eliminar_empresa - Check violado: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'Error de integridad de datos.'::TEXT;
    WHEN LOCK_NOT_AVAILABLE THEN
        RAISE NOTICE 'fn_eliminar_empresa - Fila bloqueada: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'La empresa está siendo modificada, intenta de nuevo.'::TEXT;
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_eliminar_empresa - Error inesperado: %', SQLERRM;
        RETURN QUERY SELECT FALSE, ('Error al eliminar: ' || SQLERRM)::TEXT;
END;
$$
LANGUAGE plpgsql;