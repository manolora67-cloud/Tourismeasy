CREATE OR REPLACE FUNCTION fn_datos_referencia(p_tipo EMPRESAS.TIPO_SERVICIO%TYPE)
RETURNS JSONB AS
$$
DECLARE
    v_respuesta JSONB := '{}'::JSONB;
BEGIN
    IF p_tipo IN ('ciudades', 'todos') THEN
        SELECT v_respuesta || JSONB_BUILD_OBJECT('ciudades', COALESCE(JSONB_AGG(JSONB_BUILD_OBJECT('id', c.ID_CIUDAD, 'nombre', c.NOM_CIUDAD) ORDER BY c.NOM_CIUDAD), '[]'::JSONB))
        INTO v_respuesta FROM CIUDADES c;
    END IF;
    IF p_tipo IN ('tipos_plan', 'todos') THEN
        SELECT v_respuesta || JSONB_BUILD_OBJECT('tipos_plan', COALESCE(JSONB_AGG(JSONB_BUILD_OBJECT('id', t.ID_TIPO_PLAN, 'nombre', t.NOM_TIPO_PLAN) ORDER BY t.NOM_TIPO_PLAN), '[]'::JSONB))
        INTO v_respuesta FROM TIPOS_DE_PLAN_TURISTICO t WHERE t.ACTIVO = TRUE;
    END IF;
    IF p_tipo IN ('tipos_hospedaje', 'todos') THEN
        SELECT v_respuesta || JSONB_BUILD_OBJECT('tipos_hospedaje', COALESCE(JSONB_AGG(JSONB_BUILD_OBJECT('id', t.TIPO_HOSPEDAJE, 'nombre', t.TIPO_HOSPEDAJE) ORDER BY t.TIPO_HOSPEDAJE), '[]'::JSONB))
        INTO v_respuesta FROM TIPOS_HOSPEDAJE t WHERE t.ACTIVO = TRUE;
    END IF;
    IF p_tipo IN ('categorias_artesania', 'todos') THEN
        SELECT v_respuesta || JSONB_BUILD_OBJECT('categorias_artesania', COALESCE(JSONB_AGG(JSONB_BUILD_OBJECT('id', c.CODIGO, 'nombre', c.NOMBRE_CATEGORIA) ORDER BY c.NOMBRE_CATEGORIA), '[]'::JSONB))
        INTO v_respuesta FROM CATEGORIAS_ARTESANIA c WHERE c.ACTIVO = TRUE;
    END IF;
    RETURN v_respuesta;
EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN RAISE NOTICE 'fn_datos_referencia - FK inválida: %', SQLERRM; RETURN NULL;
    WHEN CHECK_VIOLATION THEN RAISE NOTICE 'fn_datos_referencia - Check violado: %', SQLERRM; RETURN NULL;
    WHEN LOCK_NOT_AVAILABLE THEN RAISE NOTICE 'fn_datos_referencia - Tabla bloqueada: %', SQLERRM; RETURN NULL;
    WHEN OTHERS THEN RAISE NOTICE 'fn_datos_referencia: %', SQLERRM; RETURN NULL;
END;
$$ LANGUAGE plpgsql;
