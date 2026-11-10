CREATE OR REPLACE FUNCTION fn_listar_catalogos()
RETURNS JSONB AS
$$
BEGIN
    RETURN JSONB_BUILD_OBJECT(
        'tipos_plan', COALESCE((
            SELECT JSONB_AGG(JSONB_BUILD_OBJECT('id', t.ID_TIPO_PLAN::TEXT, 'nombre', t.NOM_TIPO_PLAN, 'activo', t.ACTIVO) ORDER BY t.NOM_TIPO_PLAN)
            FROM TIPOS_DE_PLAN_TURISTICO t
        ), '[]'::JSONB),
        'tipos_hospedaje', COALESCE((
            SELECT JSONB_AGG(JSONB_BUILD_OBJECT('id', t.TIPO_HOSPEDAJE, 'nombre', t.TIPO_HOSPEDAJE, 'activo', t.ACTIVO) ORDER BY t.TIPO_HOSPEDAJE)
            FROM TIPOS_HOSPEDAJE t
        ), '[]'::JSONB),
        'categorias_artesania', COALESCE((
            SELECT JSONB_AGG(JSONB_BUILD_OBJECT('id', c.CODIGO, 'codigo', c.CODIGO, 'nombre', c.NOMBRE_CATEGORIA, 'activo', c.ACTIVO) ORDER BY c.NOMBRE_CATEGORIA)
            FROM CATEGORIAS_ARTESANIA c
        ), '[]'::JSONB),
        'servicios_hospedaje', COALESCE((
            SELECT JSONB_AGG(JSONB_BUILD_OBJECT('id', s.ID_SERVICIO::TEXT, 'nombre', s.NOMBRE_SERVICIO, 'activo', s.ACTIVO) ORDER BY s.NOMBRE_SERVICIO)
            FROM SERVICIOS_HOSPEDAJE s
        ), '[]'::JSONB),
        'clases_transporte', COALESCE((
            SELECT JSONB_AGG(JSONB_BUILD_OBJECT('id', c.ID_CLASE::TEXT, 'nombre', c.NOMBRE_CLASE, 'activo', c.ACTIVO) ORDER BY c.NOMBRE_CLASE)
            FROM CLASE_SERVICIO_TRANSPORTE c
        ), '[]'::JSONB)
    );
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_listar_catalogos: %', SQLERRM;
        RETURN NULL;
END;
$$
LANGUAGE plpgsql;
