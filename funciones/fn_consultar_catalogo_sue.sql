CREATE OR REPLACE FUNCTION fn_consultar_catalogo_sue(p_categoria TEXT)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_resultado JSONB;
BEGIN
    CASE LOWER(BTRIM(p_categoria))
        WHEN 'transportes' THEN
            SELECT COALESCE(JSONB_AGG(JSONB_BUILD_OBJECT(
                'origen', t.ORIGEN,
                'destino', t.DESTINO,
                'fecha_salida', t.FECHA_SALIDA,
                'hora_salida', t.HORA_SALIDA,
                'precio', t.PRECIO,
                'empresa', e.NOM_EMPRESA,
                'nombre_clase', cst.NOMBRE_CLASE
            ) ORDER BY t.FECHA_SALIDA, t.HORA_SALIDA), '[]'::JSONB)
            INTO v_resultado
            FROM (
                SELECT *
                FROM TRANSPORTE
                WHERE DISPONIBILIDAD = TRUE
                  AND FECHA_SALIDA >= CURRENT_DATE
                ORDER BY FECHA_SALIDA, HORA_SALIDA
                LIMIT 10
            ) t
            JOIN EMPRESAS e ON e.ID_EMPRESA = t.ID_EMPRESA
            LEFT JOIN TRANSPORTE_CLASE tc ON tc.ID_TRANSPORTE = t.ID_TRANSPORTE
            LEFT JOIN CLASE_SERVICIO_TRANSPORTE cst ON cst.ID_CLASE = tc.ID_CLASE;

        WHEN 'hospedajes' THEN
            SELECT COALESCE(JSONB_AGG(JSONB_BUILD_OBJECT(
                'nombre', h->'nombre',
                'tipo', h->'tipo',
                'ciudad', h->'ciudad',
                'descripcion', h->'descripcion',
                'precio_noche', h->'precio_noche',
                'accesibilidad', h->'accesibilidad',
                'capacidad_max', h->'capacidad_max',
                'empresa', h->'empresa',
                'servicios', h->'servicios_txt'
            )), '[]'::JSONB)
            INTO v_resultado
            FROM (
                SELECT value AS h
                FROM JSONB_ARRAY_ELEMENTS(
                    fn_buscar_hospedaje_publico(NULL, NULL, NULL)
                ) WITH ORDINALITY AS hospedajes(value, posicion)
                ORDER BY posicion
                LIMIT 10
            ) resultados;

        WHEN 'planes' THEN
            SELECT COALESCE(JSONB_AGG(JSONB_BUILD_OBJECT(
                'nombre', p->'nombre',
                'duracion', p->'duracion',
                'descripcion', p->'descripcion',
                'incluye', p->'incluye',
                'tipo', p->'tipo_plan',
                'precio', p->'precio',
                'accesibilidad', p->'accesibilidad',
                'ciudad', p->'ciudad',
                'empresa', p->'empresa'
            )), '[]'::JSONB)
            INTO v_resultado
            FROM (
                SELECT value AS p
                FROM JSONB_ARRAY_ELEMENTS(
                    fn_buscar_planes_publicos(NULL, NULL, NULL)
                ) WITH ORDINALITY AS planes(value, posicion)
                ORDER BY posicion
                LIMIT 10
            ) resultados;

        WHEN 'productos' THEN
            SELECT COALESCE(JSONB_AGG(JSONB_BUILD_OBJECT(
                'nombre', producto.nom_producto,
                'artesano', producto.proveedor,
                'categoria', producto.categoria,
                'precio', producto.precio_cop,
                'descripcion', producto.descripcion,
                'municipio', producto.nom_ciudad,
                'departamento', producto.nom_dpto
            )), '[]'::JSONB)
            INTO v_resultado
            FROM (
                SELECT p.*
                FROM fn_buscar_productos_publicos(NULL, NULL, NULL) p
                WHERE p.id_ciudad IS NOT NULL
                  AND (
                      NOT EXISTS (
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
                      )
                  )
                ORDER BY p.fecha_registro DESC, p.id_producto DESC
                LIMIT 10
            ) producto;

        WHEN 'artesanos' THEN
            SELECT COALESCE(JSONB_AGG(JSONB_BUILD_OBJECT(
                'artesano', CONCAT_WS(' ', a.NOM_PERSONA_ECOMMERCE, a.APE_PERSONA_ECOMMERCE),
                'productos', a.cantidad_productos,
                'municipios', a.municipios
            )), '[]'::JSONB)
            INTO v_resultado
            FROM (
                SELECT
                    p.NOM_PERSONA_ECOMMERCE,
                    p.APE_PERSONA_ECOMMERCE,
                    COUNT(DISTINCT producto.ID_PRODUCTO) AS cantidad_productos,
                    STRING_AGG(DISTINCT ciudad.NOM_CIUDAD, ', ' ORDER BY ciudad.NOM_CIUDAD) AS municipios
                FROM PERSONAS_ECOMMERCE p
                JOIN USUARIOS_ECOMMERCE u
                  ON u.ID_PERSONA_ECOMMERCE = p.ID_PERSONA_ECOMMERCE
                 AND u.ESTADO = 'ACTIVO'
                LEFT JOIN PRODUCTOS_ARTESANALES producto
                  ON producto.ID_PERSONA_ECOMMERCE = p.ID_PERSONA_ECOMMERCE
                LEFT JOIN CIUDADES ciudad
                  ON ciudad.ID_CIUDAD = producto.ID_CIUDAD
                GROUP BY p.ID_PERSONA_ECOMMERCE, p.NOM_PERSONA_ECOMMERCE, p.APE_PERSONA_ECOMMERCE
                ORDER BY p.NOM_PERSONA_ECOMMERCE, p.APE_PERSONA_ECOMMERCE
                LIMIT 10
            ) a;

        WHEN 'empresas' THEN
            SELECT COALESCE(JSONB_AGG(JSONB_BUILD_OBJECT(
                'empresa', e.NOM_EMPRESA,
                'servicio', e.TIPO_SERVICIO,
                'municipio', e.NOM_CIUDAD,
                'departamento', e.NOM_DPTO,
                'correo', e.EMAIL_INSTITU_EMPRESA,
                'telefono', e.NUM_CONTACTO_EMPRESA
            )), '[]'::JSONB)
            INTO v_resultado
            FROM (
                SELECT empresa.*, ciudad.NOM_CIUDAD, departamento.NOM_DPTO
                FROM EMPRESAS empresa
                JOIN USUARIOS_EMPRESA usuario
                  ON usuario.ID_EMPRESA = empresa.ID_EMPRESA
                 AND usuario.ESTADO = 'ACTIVO'
                JOIN CIUDADES ciudad ON ciudad.ID_CIUDAD = empresa.ID_CIUDAD
                JOIN DEPARTAMENTOS departamento ON departamento.ID_DPTO = ciudad.ID_DPTO
                ORDER BY empresa.NOM_EMPRESA
                LIMIT 10
            ) e;

        WHEN 'festividades' THEN
            SELECT COALESCE(JSONB_AGG(JSONB_BUILD_OBJECT(
                'fecha', f.FECHA_CLAVE,
                'titulo', f.TITULO,
                'detalle', f.SUBTITULO,
                'descripcion', f.FRASE,
                'tipo', f.TIPO,
                'municipio', c.NOM_CIUDAD
            )), '[]'::JSONB)
            INTO v_resultado
            FROM (
                SELECT *
                FROM FESTIVIDADES_SANTANDER
                ORDER BY SUBSTRING(FECHA_CLAVE FROM 1 FOR 2),
                         SUBSTRING(FECHA_CLAVE FROM 4 FOR 2),
                         ID_FESTIVIDAD
                LIMIT 10
            ) f
            LEFT JOIN CIUDADES c ON c.ID_CIUDAD = f.ID_CIUDAD;

        WHEN 'municipios' THEN
            SELECT COALESCE(JSONB_AGG(JSONB_BUILD_OBJECT(
                'municipio', c.NOM_CIUDAD,
                'departamento', d.NOM_DPTO
            ) ORDER BY c.NOM_CIUDAD), '[]'::JSONB)
            INTO v_resultado
            FROM CIUDADES c
            JOIN DEPARTAMENTOS d ON d.ID_DPTO = c.ID_DPTO;

        ELSE
            RAISE EXCEPTION 'Categoría no válida para la consulta de Sue: %', p_categoria;
    END CASE;

    RETURN COALESCE(v_resultado, '[]'::JSONB);
END;
$$;