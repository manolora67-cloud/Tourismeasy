CREATE OR REPLACE FUNCTION fn_eliminar_hospedaje(
    h_id_hospedaje HOSPEDAJE.ID_HOSPEDAJE%TYPE,
    h_id_empresa   HOSPEDAJE.ID_EMPRESA%TYPE
)
RETURNS BOOLEAN AS
$$
DECLARE
    v_id_eliminado HOSPEDAJE.ID_HOSPEDAJE%TYPE;
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM USUARIOS_EMPRESA
        WHERE ID_EMPRESA = h_id_empresa AND ESTADO = 'ACTIVO'
    ) OR NOT EXISTS (
        SELECT 1 FROM EMPRESAS
        WHERE ID_EMPRESA = h_id_empresa AND TIPO_SERVICIO = 'HOSPEDAJE'
    ) THEN
        RETURN FALSE;
    END IF;

    DELETE FROM HOSPEDAJE
    WHERE ID_HOSPEDAJE = h_id_hospedaje AND ID_EMPRESA = h_id_empresa
    RETURNING ID_HOSPEDAJE INTO v_id_eliminado;

    RETURN v_id_eliminado IS NOT NULL;

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
