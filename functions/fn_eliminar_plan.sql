CREATE OR REPLACE FUNCTION fn_eliminar_plan(
    p_id_plan    PLANES_TURISTICOS.ID_PLAN_TURISTICO%TYPE,
    p_id_empresa PLANES_TURISTICOS.ID_EMPRESA%TYPE
)
RETURNS BOOLEAN AS
$$
DECLARE
    v_id_empresa_db PLANES_TURISTICOS.ID_EMPRESA%TYPE;
BEGIN
    SELECT ID_EMPRESA INTO v_id_empresa_db
    FROM PLANES_TURISTICOS
    WHERE ID_PLAN_TURISTICO = p_id_plan;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    IF v_id_empresa_db <> p_id_empresa THEN
        RETURN FALSE;
    END IF;

    -- Primero se limpian los componentes del plan (FK)
    DELETE FROM PLAN_COMPONENTES WHERE ID_PLAN_TURISTICO = p_id_plan;

    DELETE FROM PLANES_TURISTICOS
    WHERE ID_PLAN_TURISTICO = p_id_plan AND ID_EMPRESA = p_id_empresa;

    RETURN TRUE;

EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN
        RAISE NOTICE 'fn_eliminar_plan - FK inválida: %', SQLERRM;
        RETURN FALSE;
    WHEN CHECK_VIOLATION THEN
        RAISE NOTICE 'fn_eliminar_plan - Check violado: %', SQLERRM;
        RETURN FALSE;
    WHEN LOCK_NOT_AVAILABLE THEN
        RAISE NOTICE 'fn_eliminar_plan - Fila bloqueada: %', SQLERRM;
        RETURN FALSE;
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_eliminar_plan: %', SQLERRM;
        RETURN FALSE;
END;
$$
LANGUAGE plpgsql;
