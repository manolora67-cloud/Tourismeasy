CREATE OR REPLACE FUNCTION fn_listar_catalogos()
RETURNS JSONB AS
$$
BEGIN
    RETURN JSONB_BUILD_OBJECT(
        'tipos_plan', COALESCE((
            SELECT JSONB_AGG(JSONB_BUILD_OBJECT(
                'id', t.ID_TIPO_PLAN::TEXT,
                'nombre', t.NOM_TIPO_PLAN,
                'activo', t.ACTIVO,
                'uso_actual', COALESCE(uso.total, 0)
            ) ORDER BY t.NOM_TIPO_PLAN)
            FROM TIPOS_DE_PLAN_TURISTICO t
            LEFT JOIN (
                SELECT p.ID_TIPO_PLAN, COUNT(*) AS total
                FROM PLANES_TURISTICOS p
                GROUP BY p.ID_TIPO_PLAN
            ) uso ON uso.ID_TIPO_PLAN = t.ID_TIPO_PLAN
        ), '[]'::JSONB),
        'tipos_hospedaje', COALESCE((
            SELECT JSONB_AGG(JSONB_BUILD_OBJECT(
                'id', t.TIPO_HOSPEDAJE,
                'nombre', t.TIPO_HOSPEDAJE,
                'activo', t.ACTIVO,
                'uso_actual', COALESCE(uso.total, 0)
            ) ORDER BY t.TIPO_HOSPEDAJE)
            FROM TIPOS_HOSPEDAJE t
            LEFT JOIN (
                SELECT h.TIPO_HOSPEDAJE, COUNT(*) AS total
                FROM HOSPEDAJE h
                GROUP BY h.TIPO_HOSPEDAJE
            ) uso ON uso.TIPO_HOSPEDAJE = t.TIPO_HOSPEDAJE
        ), '[]'::JSONB),
        'categorias_artesania', COALESCE((
            SELECT JSONB_AGG(JSONB_BUILD_OBJECT(
                'id', c.CODIGO,
                'codigo', c.CODIGO,
                'nombre', c.NOMBRE_CATEGORIA,
                'activo', c.ACTIVO,
                'uso_actual', COALESCE(uso.total, 0)
            ) ORDER BY c.NOMBRE_CATEGORIA)
            FROM CATEGORIAS_ARTESANIA c
            LEFT JOIN (
                SELECT p.CATEGORIA, COUNT(*) AS total
                FROM PRODUCTOS_ARTESANALES p
                GROUP BY p.CATEGORIA
            ) uso ON uso.CATEGORIA = c.CODIGO
        ), '[]'::JSONB),
        'servicios_hospedaje', COALESCE((
            SELECT JSONB_AGG(JSONB_BUILD_OBJECT(
                'id', s.ID_SERVICIO::TEXT,
                'nombre', s.NOMBRE_SERVICIO,
                'activo', s.ACTIVO,
                'uso_actual', COALESCE(uso.total, 0)
            ) ORDER BY s.NOMBRE_SERVICIO)
            FROM SERVICIOS_HOSPEDAJE s
            LEFT JOIN (
                SELECT hs.ID_SERVICIO, COUNT(DISTINCT hs.ID_HOSPEDAJE) AS total
                FROM HOSPEDAJE_SERVICIOS hs
                GROUP BY hs.ID_SERVICIO
            ) uso ON uso.ID_SERVICIO = s.ID_SERVICIO
        ), '[]'::JSONB),
        'clases_transporte', COALESCE((
            SELECT JSONB_AGG(JSONB_BUILD_OBJECT(
                'id', c.ID_CLASE::TEXT,
                'nombre', c.NOMBRE_CLASE,
                'activo', c.ACTIVO,
                'uso_actual', COALESCE(uso.total, 0)
            ) ORDER BY c.NOMBRE_CLASE)
            FROM CLASE_SERVICIO_TRANSPORTE c
            LEFT JOIN (
                SELECT tc.ID_CLASE, COUNT(DISTINCT tc.ID_TRANSPORTE) AS total
                FROM TRANSPORTE_CLASE tc
                GROUP BY tc.ID_CLASE
            ) uso ON uso.ID_CLASE = c.ID_CLASE
        ), '[]'::JSONB)
    );
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_listar_catalogos: %', SQLERRM;
        RETURN NULL;
END;
$$
LANGUAGE plpgsql;
