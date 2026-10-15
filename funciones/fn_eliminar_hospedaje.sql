CREATE OR REPLACE FUNCTION fn_eliminar_hospedaje(
    h_id_hospedaje HOSPEDAJE.ID_HOSPEDAJE%TYPE,
    h_id_empresa   HOSPEDAJE.ID_EMPRESA%TYPE
)
RETURNS BOOLEAN AS
$$
DECLARE
    v_id_empresa_db HOSPEDAJE.ID_EMPRESA%TYPE;
BEGIN
    SELECT ID_EMPRESA INTO v_id_empresa_db
    FROM HOSPEDAJE
    WHERE ID_HOSPEDAJE = h_id_hospedaje;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    IF v_id_empresa_db <> h_id_empresa THEN
        RETURN FALSE;
    END IF;

    -- Primero se limpia la relación muchos-a-muchos con servicios (FK)
    DELETE FROM HOSPEDAJE_SERVICIOS WHERE ID_HOSPEDAJE = h_id_hospedaje;

    DELETE FROM HOSPEDAJE
    WHERE ID_HOSPEDAJE = h_id_hospedaje AND ID_EMPRESA = h_id_empresa;

    RETURN TRUE;

EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN
        RAISE NOTICE 'fn_eliminar_hospedaje - FK inválida: %', SQLERRM;
        RETURN FALSE;
    WHEN CHECK_VIOLATION THEN
        RAISE NOTICE 'fn_eliminar_hospedaje - Check violado: %', SQLERRM;
        RETURN FALSE;
    WHEN LOCK_NOT_AVAILABLE THEN
        RAISE NOTICE 'fn_eliminar_hospedaje - Fila bloqueada: %', SQLERRM;
        RETURN FALSE;
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_eliminar_hospedaje: %', SQLERRM;
        RETURN FALSE;
END;
$$
LANGUAGE plpgsql;
