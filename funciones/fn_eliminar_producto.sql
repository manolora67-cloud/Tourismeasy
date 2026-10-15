CREATE OR REPLACE FUNCTION fn_eliminar_producto(
    p_id         PRODUCTOS_ARTESANALES.ID_PRODUCTO%TYPE,
    p_id_persona PRODUCTOS_ARTESANALES.ID_PERSONA_ECOMMERCE%TYPE DEFAULT NULL
)
RETURNS BOOLEAN AS
$$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM PRODUCTOS_ARTESANALES
        WHERE ID_PRODUCTO = p_id
          AND (p_id_persona IS NULL OR ID_PERSONA_ECOMMERCE = p_id_persona)
    ) THEN
        RETURN FALSE;
    END IF;

    DELETE FROM PRODUCTOS_ARTESANALES
    WHERE ID_PRODUCTO = p_id
      AND (p_id_persona IS NULL OR ID_PERSONA_ECOMMERCE = p_id_persona);

    RETURN TRUE;

EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN
        RAISE NOTICE 'fn_eliminar_producto - FK inválida: %', SQLERRM;
        RETURN FALSE;
    WHEN CHECK_VIOLATION THEN
        RAISE NOTICE 'fn_eliminar_producto - Check violado: %', SQLERRM;
        RETURN FALSE;
    WHEN LOCK_NOT_AVAILABLE THEN
        RAISE NOTICE 'fn_eliminar_producto - Fila bloqueada: %', SQLERRM;
        RETURN FALSE;
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_eliminar_producto: %', SQLERRM;
        RETURN FALSE;
END;
$$
LANGUAGE plpgsql;