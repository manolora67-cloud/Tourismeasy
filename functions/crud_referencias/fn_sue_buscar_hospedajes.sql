CREATE OR REPLACE FUNCTION fn_sue_buscar_hospedajes(p_id_ciudad CIUDADES.ID_CIUDAD%TYPE)
RETURNS JSONB
LANGUAGE sql
AS $$
    SELECT fn_buscar_hospedaje_publico(p_id_ciudad, NULL, NULL);
$$;
