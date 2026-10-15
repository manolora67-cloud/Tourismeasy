CREATE OR REPLACE FUNCTION fn_agregar_plan(
    p_id_empresa    PLANES_TURISTICOS.ID_EMPRESA%TYPE,
    p_nombre        PLANES_TURISTICOS.NOM_PLAN_TURISTICO%TYPE,
    p_duracion      PLANES_TURISTICOS.DURACION%TYPE,
    p_incluye       PLANES_TURISTICOS.INCLUYE%TYPE,
    p_id_tipo_plan  PLANES_TURISTICOS.ID_TIPO_PLAN%TYPE,
    p_precio        PLANES_TURISTICOS.PRECIO_PLAN%TYPE,
    p_accesibilidad PLANES_TURISTICOS.ACCESIBILIDAD%TYPE,
    p_id_ciudad     PLANES_TURISTICOS.ID_CIUDAD%TYPE,
    p_descripcion   PLANES_TURISTICOS.DESCRIPCION%TYPE DEFAULT NULL,
    p_img_url       PLANES_TURISTICOS.IMG_URL%TYPE DEFAULT NULL
)
RETURNS INTEGER AS
$$
DECLARE
    v_nuevo_id PLANES_TURISTICOS.ID_PLAN_TURISTICO%TYPE;
BEGIN
    -- La empresa debe existir y prestar servicio de PLANES
    IF NOT EXISTS (SELECT 1 FROM EMPRESAS WHERE ID_EMPRESA = p_id_empresa AND TIPO_SERVICIO = 'PLANES') THEN
        RETURN NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM USUARIOS_EMPRESA WHERE ID_EMPRESA = p_id_empresa AND ESTADO = 'ACTIVO') THEN
        RETURN NULL;
    END IF;

    IF p_nombre IS NULL OR LENGTH(TRIM(p_nombre)) < 3 THEN
        RETURN NULL;
    END IF;

    IF p_duracion IS NULL OR LENGTH(TRIM(p_duracion)) = 0 THEN
        RETURN NULL;
    END IF;

    IF p_incluye IS NULL OR LENGTH(TRIM(p_incluye)) = 0 THEN
        RETURN NULL;
    END IF;

    IF p_precio <= 0 THEN
        RETURN NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM TIPOS_DE_PLAN_TURISTICO WHERE ID_TIPO_PLAN = p_id_tipo_plan) THEN
        RETURN NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM CIUDADES WHERE ID_CIUDAD = p_id_ciudad) THEN
        RETURN NULL;
    END IF;

    INSERT INTO PLANES_TURISTICOS (
        NOM_PLAN_TURISTICO, DURACION, DESCRIPCION, INCLUYE,
        ID_TIPO_PLAN, PRECIO_PLAN, ACCESIBILIDAD, DISPONIBILIDAD,
        ID_EMPRESA, ID_CIUDAD, IMG_URL, FECHA_CREACION
    ) VALUES (
        TRIM(p_nombre), TRIM(p_duracion), p_descripcion, TRIM(p_incluye),
        p_id_tipo_plan, p_precio, p_accesibilidad, TRUE,
        p_id_empresa, p_id_ciudad, p_img_url, NOW()
    )
    RETURNING ID_PLAN_TURISTICO INTO v_nuevo_id;

    RETURN v_nuevo_id;

EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN
        RAISE NOTICE 'fn_agregar_plan - FK inválida: %', SQLERRM;
        RETURN NULL;
    WHEN CHECK_VIOLATION THEN
        RAISE NOTICE 'fn_agregar_plan - Check violado: %', SQLERRM;
        RETURN NULL;
    WHEN LOCK_NOT_AVAILABLE THEN
        RAISE NOTICE 'fn_agregar_plan - Fila bloqueada: %', SQLERRM;
        RETURN NULL;
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_agregar_plan: %', SQLERRM;
        RETURN NULL;
END;
$$
LANGUAGE plpgsql;
