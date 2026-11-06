CREATE OR REPLACE FUNCTION fn_guardar_producto(
    p_id          PRODUCTOS_ARTESANALES.ID_PRODUCTO%TYPE,
    p_nombre      PRODUCTOS_ARTESANALES.NOM_PRODUCTO%TYPE,
    p_proveedor   PRODUCTOS_ARTESANALES.PROVEEDOR%TYPE,
    p_categoria   PRODUCTOS_ARTESANALES.CATEGORIA%TYPE,
    p_precio      PRODUCTOS_ARTESANALES.PRECIO_COP%TYPE,
    p_id_ciudad   PRODUCTOS_ARTESANALES.ID_CIUDAD%TYPE,
    p_contacto    PRODUCTOS_ARTESANALES.NUM_CONTACTO%TYPE,
    p_descripcion PRODUCTOS_ARTESANALES.DESCRIPCION%TYPE,
    p_img_url     PRODUCTOS_ARTESANALES.IMG_URL%TYPE,
    p_id_persona  PRODUCTOS_ARTESANALES.ID_PERSONA_ECOMMERCE%TYPE
)
RETURNS TABLE (
    ok BOOLEAN,
    id_producto PRODUCTOS_ARTESANALES.ID_PRODUCTO%TYPE
) AS
$$
DECLARE
    v_id PRODUCTOS_ARTESANALES.ID_PRODUCTO%TYPE;
BEGIN
    IF p_id IS NULL THEN
        v_id := fn_agregar_producto(
            p_nombre, p_proveedor, p_categoria, p_precio, p_id_ciudad,
            p_contacto, p_descripcion, p_img_url, p_id_persona
        );
        RETURN QUERY SELECT v_id IS NOT NULL, v_id;
        RETURN;
    END IF;

    IF fn_editar_producto(
        p_id, p_nombre, p_proveedor, p_categoria, p_precio, p_id_ciudad,
        p_contacto, p_descripcion, p_img_url, p_id_persona
    ) THEN
        RETURN QUERY SELECT TRUE, p_id;
    ELSE
        RETURN QUERY SELECT FALSE, NULL::PRODUCTOS_ARTESANALES.ID_PRODUCTO%TYPE;
    END IF;
    RETURN;
EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN
        RAISE NOTICE 'fn_guardar_producto - FK inválida: %', SQLERRM;
        RETURN QUERY SELECT FALSE, NULL::PRODUCTOS_ARTESANALES.ID_PRODUCTO%TYPE;
    WHEN CHECK_VIOLATION THEN
        RAISE NOTICE 'fn_guardar_producto - Check violado: %', SQLERRM;
        RETURN QUERY SELECT FALSE, NULL::PRODUCTOS_ARTESANALES.ID_PRODUCTO%TYPE;
    WHEN LOCK_NOT_AVAILABLE THEN
        RAISE NOTICE 'fn_guardar_producto - Fila bloqueada: %', SQLERRM;
        RETURN QUERY SELECT FALSE, NULL::PRODUCTOS_ARTESANALES.ID_PRODUCTO%TYPE;
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_guardar_producto: %', SQLERRM;
        RETURN QUERY SELECT FALSE, NULL::PRODUCTOS_ARTESANALES.ID_PRODUCTO%TYPE;
END;
$$
LANGUAGE plpgsql;
