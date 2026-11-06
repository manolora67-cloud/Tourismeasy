CREATE OR REPLACE FUNCTION fn_sue_buscar_productos(p_id_ciudad CIUDADES.ID_CIUDAD%TYPE)
RETURNS JSONB
LANGUAGE sql
AS $$
    SELECT COALESCE(JSONB_AGG(JSONB_BUILD_OBJECT(
        'nombre', p.nom_producto,
        'artesano', p.proveedor,
        'categoria', p.categoria,
        'precio', p.precio_cop,
        'descripcion', p.descripcion,
        'municipio', p.nom_ciudad
    ) ORDER BY p.fecha_registro DESC, p.id_producto DESC), '[]'::JSONB)
    FROM fn_buscar_productos_publicos(NULL, NULL, p_id_ciudad) p
    WHERE NOT EXISTS (
        SELECT 1
        FROM PRODUCTOS_ARTESANALES pa
        WHERE pa.ID_PRODUCTO = p.id_producto
          AND pa.ID_PERSONA_ECOMMERCE IS NOT NULL
    )
    OR EXISTS (
        SELECT 1
        FROM PRODUCTOS_ARTESANALES pa
        JOIN USUARIOS_ECOMMERCE ue
          ON ue.ID_PERSONA_ECOMMERCE = pa.ID_PERSONA_ECOMMERCE
        WHERE pa.ID_PRODUCTO = p.id_producto
          AND ue.ESTADO = 'ACTIVO'
    );
$$;
