CREATE OR REPLACE FUNCTION fn_agregar_producto(
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
RETURNS INTEGER AS
$$
DECLARE
    v_nuevo_id PRODUCTOS_ARTESANALES.ID_PRODUCTO%TYPE;
BEGIN
    IF p_nombre IS NULL OR LENGTH(TRIM(p_nombre)) < 3 THEN
        RETURN NULL;
    END IF;

    IF p_proveedor IS NULL OR LENGTH(TRIM(p_proveedor)) < 3 THEN
        RETURN NULL;
    END IF;

    IF p_categoria NOT IN ('talleres', 'bisuteria', 'alfareria') THEN
        RETURN NULL;
    END IF;

    IF p_precio IS NULL OR p_precio <= 0 THEN
        RETURN NULL;
    END IF;

    IF p_descripcion IS NULL OR LENGTH(TRIM(p_descripcion)) < 10 THEN
        RETURN NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM CIUDADES WHERE ID_CIUDAD = p_id_ciudad) THEN
        RETURN NULL;
    END IF;

    IF p_id_persona IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM USUARIOS_ECOMMERCE WHERE ID_PERSONA_ECOMMERCE = p_id_persona AND ESTADO = 'ACTIVO'
    ) THEN
        RETURN NULL;
    END IF;

    INSERT INTO PRODUCTOS_ARTESANALES
        (NOM_PRODUCTO, PROVEEDOR, CATEGORIA, PRECIO_COP, ID_CIUDAD, NUM_CONTACTO, DESCRIPCION, IMG_URL, ID_PERSONA_ECOMMERCE)
    VALUES
        (TRIM(p_nombre), TRIM(p_proveedor), p_categoria, p_precio, p_id_ciudad, p_contacto, p_descripcion, p_img_url, p_id_persona)
    RETURNING ID_PRODUCTO INTO v_nuevo_id;

    RETURN v_nuevo_id;

EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN
        RAISE NOTICE 'fn_agregar_producto - FK inválida: %', SQLERRM;
        RETURN NULL;
    WHEN CHECK_VIOLATION THEN
        RAISE NOTICE 'fn_agregar_producto - Check violado: %', SQLERRM;
        RETURN NULL;
    WHEN LOCK_NOT_AVAILABLE THEN
        RAISE NOTICE 'fn_agregar_producto - Fila bloqueada: %', SQLERRM;
        RETURN NULL;
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_agregar_producto: %', SQLERRM;
        RETURN NULL;
END;
$$
LANGUAGE plpgsql;