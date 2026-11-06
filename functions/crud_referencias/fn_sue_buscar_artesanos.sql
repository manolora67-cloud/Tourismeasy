CREATE OR REPLACE FUNCTION fn_sue_buscar_artesanos(p_id_ciudad CIUDADES.ID_CIUDAD%TYPE)
RETURNS JSONB
LANGUAGE sql
AS $$
    SELECT COALESCE(JSONB_AGG(JSONB_BUILD_OBJECT(
        'artesano', a.artesano,
        'productos', a.productos,
        'municipios', a.municipios
    ) ORDER BY a.nombre, a.apellido, a.id_persona_ecommerce), '[]'::JSONB)
    FROM (
        SELECT
            persona.ID_PERSONA_ECOMMERCE AS id_persona_ecommerce,
            persona.NOM_PERSONA_ECOMMERCE AS nombre,
            persona.APE_PERSONA_ECOMMERCE AS apellido,
            CONCAT_WS(' ', persona.NOM_PERSONA_ECOMMERCE, persona.APE_PERSONA_ECOMMERCE) AS artesano,
            COUNT(DISTINCT producto.ID_PRODUCTO) AS productos,
            STRING_AGG(DISTINCT ciudad.NOM_CIUDAD, ', ' ORDER BY ciudad.NOM_CIUDAD) AS municipios
        FROM PERSONAS_ECOMMERCE persona
        JOIN USUARIOS_ECOMMERCE usuario
          ON usuario.ID_PERSONA_ECOMMERCE = persona.ID_PERSONA_ECOMMERCE
         AND usuario.ESTADO = 'ACTIVO'
        LEFT JOIN PRODUCTOS_ARTESANALES producto
          ON producto.ID_PERSONA_ECOMMERCE = persona.ID_PERSONA_ECOMMERCE
         AND (p_id_ciudad IS NULL OR producto.ID_CIUDAD = p_id_ciudad)
        LEFT JOIN CIUDADES ciudad ON ciudad.ID_CIUDAD = producto.ID_CIUDAD
        WHERE p_id_ciudad IS NULL
           OR EXISTS (
               SELECT 1
               FROM PRODUCTOS_ARTESANALES producto_ciudad
               WHERE producto_ciudad.ID_PERSONA_ECOMMERCE = persona.ID_PERSONA_ECOMMERCE
                 AND producto_ciudad.ID_CIUDAD = p_id_ciudad
           )
        GROUP BY persona.ID_PERSONA_ECOMMERCE,
                 persona.NOM_PERSONA_ECOMMERCE,
                 persona.APE_PERSONA_ECOMMERCE
    ) a;
$$;
