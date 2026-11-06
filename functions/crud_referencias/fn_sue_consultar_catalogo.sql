CREATE OR REPLACE FUNCTION fn_sue_consultar_catalogo(
    p_categoria TEXT,
    p_municipio TEXT,
    p_tipo_empresa TEXT,
    p_mes INTEGER,
    p_busqueda TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_id_ciudad CIUDADES.ID_CIUDAD%TYPE;
    v_resultados JSONB;
BEGIN
    IF p_municipio IS NOT NULL THEN
        SELECT c.ID_CIUDAD
        INTO v_id_ciudad
        FROM CIUDADES c
        WHERE LOWER(BTRIM(c.NOM_CIUDAD)) = LOWER(BTRIM(p_municipio));

        IF NOT FOUND THEN
            RETURN '[]'::JSONB;
        END IF;
    END IF;

    CASE p_categoria
        WHEN 'transportes' THEN
            SELECT COALESCE(JSONB_AGG(TO_JSONB(t)), '[]'::JSONB)
            INTO v_resultados
            FROM fn_sue_buscar_transportes_ruta(NULL, NULL, 0) t;
            RETURN v_resultados;
        WHEN 'planes' THEN
            RETURN fn_sue_buscar_planes(v_id_ciudad);
        WHEN 'hospedajes' THEN
            RETURN fn_sue_buscar_hospedajes(v_id_ciudad);
        WHEN 'productos' THEN
            RETURN fn_sue_buscar_productos(v_id_ciudad);
        WHEN 'artesanos' THEN
            RETURN fn_sue_buscar_artesanos(v_id_ciudad);
        WHEN 'empresas' THEN
            RETURN fn_sue_buscar_empresas(v_id_ciudad, p_tipo_empresa);
        WHEN 'festividades' THEN
            RETURN fn_sue_buscar_festividades(v_id_ciudad, p_mes, p_busqueda);
        WHEN 'municipios' THEN
            RETURN fn_sue_buscar_municipios(v_id_ciudad);
        ELSE
            RETURN '[]'::JSONB;
    END CASE;
END;
$$;
