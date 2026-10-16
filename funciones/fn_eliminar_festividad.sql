CREATE OR REPLACE FUNCTION fn_eliminar_festividad(
    p_id_festividad FESTIVIDADES_SANTANDER.ID_FESTIVIDAD%TYPE,
    p_id_admin USUARIOS.ID_PERSONA%TYPE
)
RETURNS JSONB AS
$$
DECLARE
    v_titulo FESTIVIDADES_SANTANDER.TITULO%TYPE;
    v_eliminado BOOLEAN;
BEGIN
    DELETE FROM FESTIVIDADES_SANTANDER
    WHERE ID_FESTIVIDAD = LOWER(BTRIM(p_id_festividad))
    RETURNING TITULO INTO v_titulo;
    v_eliminado := FOUND;

    IF NOT v_eliminado THEN
        RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'status', 404, 'error', 'No se encontró esa festividad.');
    END IF;

    PERFORM fn_registrar_auditoria(
        p_id_admin,
        'Eliminar festividad',
        'Festividades',
        v_titulo || ' (' || p_id_festividad || ')',
        'info'
    );
    RETURN JSONB_BUILD_OBJECT('ok', TRUE);
EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN
        RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'status', 409, 'error', 'No se puede eliminar la festividad porque tiene datos relacionados.');
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_eliminar_festividad: %', SQLERRM;
        RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'status', 500, 'error', 'No se pudo eliminar la festividad.');
END;
$$
LANGUAGE plpgsql;
