CREATE OR REPLACE FUNCTION fn_editar_plan(
    p_id_plan       PLANES_TURISTICOS.ID_PLAN_TURISTICO%TYPE,
    p_id_empresa    PLANES_TURISTICOS.ID_EMPRESA%TYPE,
    p_nombre        PLANES_TURISTICOS.NOM_PLAN_TURISTICO%TYPE,
    p_duracion      PLANES_TURISTICOS.DURACION%TYPE,
    p_incluye       PLANES_TURISTICOS.INCLUYE%TYPE,
    p_id_tipo_plan  PLANES_TURISTICOS.ID_TIPO_PLAN%TYPE,
    p_precio        PLANES_TURISTICOS.PRECIO_PLAN%TYPE,
    p_accesibilidad PLANES_TURISTICOS.ACCESIBILIDAD%TYPE,
    p_id_ciudad     PLANES_TURISTICOS.ID_CIUDAD%TYPE,
    p_descripcion   PLANES_TURISTICOS.DESCRIPCION%TYPE DEFAULT NULL,
    p_img_url       PLANES_TURISTICOS.IMG_URL%TYPE DEFAULT NULL,
    p_disponibilidad PLANES_TURISTICOS.DISPONIBILIDAD%TYPE DEFAULT TRUE
)
RETURNS BOOLEAN AS
$$
DECLARE
    v_id_empresa_db PLANES_TURISTICOS.ID_EMPRESA%TYPE;
BEGIN
    SELECT ID_EMPRESA INTO v_id_empresa_db
    FROM PLANES_TURISTICOS
    WHERE ID_PLAN_TURISTICO = p_id_plan;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    IF v_id_empresa_db <> p_id_empresa THEN
        RETURN FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM USUARIOS_EMPRESA WHERE ID_EMPRESA = p_id_empresa AND ESTADO = 'ACTIVO') THEN
        RETURN FALSE;
    END IF;

    IF p_nombre IS NULL OR LENGTH(TRIM(p_nombre)) < 3 THEN
        RETURN FALSE;
    END IF;

    IF p_precio <= 0 THEN
        RETURN FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM TIPOS_DE_PLAN_TURISTICO WHERE ID_TIPO_PLAN = p_id_tipo_plan) THEN
        RETURN FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM CIUDADES WHERE ID_CIUDAD = p_id_ciudad) THEN
        RETURN FALSE;
    END IF;

    UPDATE PLANES_TURISTICOS SET
        NOM_PLAN_TURISTICO = TRIM(p_nombre),
        DURACION           = TRIM(p_duracion),
        DESCRIPCION        = p_descripcion,
        INCLUYE            = TRIM(p_incluye),
        ID_TIPO_PLAN       = p_id_tipo_plan,
        PRECIO_PLAN        = p_precio,
        ACCESIBILIDAD      = p_accesibilidad,
        ID_CIUDAD          = p_id_ciudad,
        DISPONIBILIDAD     = p_disponibilidad,
        IMG_URL            = p_img_url
    WHERE ID_PLAN_TURISTICO = p_id_plan
      AND ID_EMPRESA        = p_id_empresa;

    RETURN TRUE;

EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN
        RAISE NOTICE 'fn_editar_plan - FK inválida: %', SQLERRM;
        RETURN FALSE;
    WHEN CHECK_VIOLATION THEN
        RAISE NOTICE 'fn_editar_plan - Check violado: %', SQLERRM;
        RETURN FALSE;
    WHEN LOCK_NOT_AVAILABLE THEN
        RAISE NOTICE 'fn_editar_plan - Fila bloqueada: %', SQLERRM;
        RETURN FALSE;
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_editar_plan: %', SQLERRM;
        RETURN FALSE;
END;
$$
LANGUAGE plpgsql;
