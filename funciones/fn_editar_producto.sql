CREATE OR REPLACE FUNCTION fn_editar_producto(
    p_id          PRODUCTOS_ARTESANALES.ID_PRODUCTO%TYPE,
    p_nombre      PRODUCTOS_ARTESANALES.NOM_PRODUCTO%TYPE,
    p_proveedor   PRODUCTOS_ARTESANALES.PROVEEDOR%TYPE,
    p_categoria   PRODUCTOS_ARTESANALES.CATEGORIA%TYPE,
    p_precio      PRODUCTOS_ARTESANALES.PRECIO_COP%TYPE,
    p_id_ciudad   PRODUCTOS_ARTESANALES.ID_CIUDAD%TYPE,
    p_contacto    PRODUCTOS_ARTESANALES.NUM_CONTACTO%TYPE,
    p_descripcion PRODUCTOS_ARTESANALES.DESCRIPCION%TYPE,
    p_img_url     PRODUCTOS_ARTESANALES.IMG_URL%TYPE DEFAULT NULL,
    p_id_persona  PRODUCTOS_ARTESANALES.ID_PERSONA_ECOMMERCE%TYPE DEFAULT NULL
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

    IF p_nombre IS NULL OR LENGTH(TRIM(p_nombre)) < 3 THEN
        RETURN FALSE;
    END IF;

    IF p_proveedor IS NULL OR LENGTH(TRIM(p_proveedor)) < 3 THEN
        RETURN FALSE;
    END IF;

    IF p_categoria NOT IN ('talleres', 'bisuteria', 'alfareria') THEN
        RETURN FALSE;
    END IF;

    IF p_precio IS NULL OR p_precio <= 0 THEN
        RETURN FALSE;
    END IF;

    IF p_descripcion IS NULL OR LENGTH(TRIM(p_descripcion)) < 10 THEN
        RETURN FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM CIUDADES WHERE ID_CIUDAD = p_id_ciudad) THEN
        RETURN FALSE;
    END IF;

    UPDATE PRODUCTOS_ARTESANALES SET
        NOM_PRODUCTO = TRIM(p_nombre),
        PROVEEDOR    = TRIM(p_proveedor),
        CATEGORIA    = p_categoria,
        PRECIO_COP   = p_precio,
        ID_CIUDAD    = p_id_ciudad,
        NUM_CONTACTO = p_contacto,
        DESCRIPCION  = p_descripcion,
        IMG_URL      = p_img_url
    WHERE ID_PRODUCTO = p_id
      AND (p_id_persona IS NULL OR ID_PERSONA_ECOMMERCE = p_id_persona);

    RETURN TRUE;

EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN
        RAISE NOTICE 'fn_editar_producto - FK inválida: %', SQLERRM;
        RETURN FALSE;
    WHEN CHECK_VIOLATION THEN
        RAISE NOTICE 'fn_editar_producto - Check violado: %', SQLERRM;
        RETURN FALSE;
    WHEN LOCK_NOT_AVAILABLE THEN
        RAISE NOTICE 'fn_editar_producto - Fila bloqueada: %', SQLERRM;
        RETURN FALSE;
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_editar_producto: %', SQLERRM;
        RETURN FALSE;
END;
$$
LANGUAGE plpgsql;