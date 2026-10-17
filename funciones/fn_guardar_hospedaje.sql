CREATE OR REPLACE FUNCTION fn_guardar_hospedaje(
    p_datos JSONB,
    p_id_empresa HOSPEDAJE.ID_EMPRESA%TYPE
)
RETURNS TABLE (
    ok BOOLEAN,
    id_hospedaje HOSPEDAJE.ID_HOSPEDAJE%TYPE
) AS
$$
DECLARE
    v_id HOSPEDAJE.ID_HOSPEDAJE%TYPE;
    v_nombre HOSPEDAJE.NOM_HOSPEDAJE%TYPE;
    v_tipo HOSPEDAJE.TIPO_HOSPEDAJE%TYPE;
    v_ciudad HOSPEDAJE.ID_CIUDAD%TYPE;
    v_descripcion HOSPEDAJE.DESCRIPCION%TYPE;
    v_precio HOSPEDAJE.PRECIO_NOCHE%TYPE;
    v_accesibilidad HOSPEDAJE.ACCESIBILIDAD%TYPE;
    v_capacidad HOSPEDAJE.CAPACIDAD_MAX%TYPE;
    v_disponible HOSPEDAJE.DISPONIBILIDAD%TYPE;
    v_imagen HOSPEDAJE.IMG_URL%TYPE;
    v_servicios NUMERIC[] := '{}';
    v_id_nuevo HOSPEDAJE.ID_HOSPEDAJE%TYPE;
    v_ok BOOLEAN;
BEGIN
    IF p_datos IS NULL OR JSONB_TYPEOF(p_datos) <> 'object' THEN
        RETURN QUERY SELECT FALSE, NULL::HOSPEDAJE.ID_HOSPEDAJE%TYPE;
        RETURN;
    END IF;

    IF NULLIF(BTRIM(p_datos->>'id'), '') IS NOT NULL THEN
        IF BTRIM(p_datos->>'id') !~ '^[0-9]+$' THEN
            RETURN QUERY SELECT FALSE, NULL::HOSPEDAJE.ID_HOSPEDAJE%TYPE;
            RETURN;
        END IF;
        v_id := (p_datos->>'id')::NUMERIC;
        IF v_id <= 0 OR v_id > 9999999999 THEN
            RETURN QUERY SELECT FALSE, NULL::HOSPEDAJE.ID_HOSPEDAJE%TYPE;
            RETURN;
        END IF;
    END IF;

    IF JSONB_TYPEOF(COALESCE(p_datos->'servicios_ids', '[]'::JSONB)) <> 'array' THEN
        RETURN QUERY SELECT FALSE, NULL::HOSPEDAJE.ID_HOSPEDAJE%TYPE;
        RETURN;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM JSONB_ARRAY_ELEMENTS_TEXT(COALESCE(p_datos->'servicios_ids', '[]'::JSONB)) AS s(x)
        WHERE CASE
            WHEN x ~ '^[0-9]+$' THEN x::NUMERIC BETWEEN 1 AND 9999999999
            ELSE FALSE
        END = FALSE
    ) THEN
        RETURN QUERY SELECT FALSE, NULL::HOSPEDAJE.ID_HOSPEDAJE%TYPE;
        RETURN;
    END IF;

    SELECT COALESCE(ARRAY_AGG(DISTINCT x::NUMERIC), '{}'::NUMERIC[])
    INTO v_servicios
    FROM JSONB_ARRAY_ELEMENTS_TEXT(COALESCE(p_datos->'servicios_ids', '[]'::JSONB)) AS s(x)
    WHERE CASE
        WHEN x ~ '^[0-9]+$' THEN x::NUMERIC BETWEEN 1 AND 9999999999
        ELSE FALSE
    END;

    v_nombre := NULLIF(BTRIM(p_datos->>'nombre'), '');
    v_tipo := NULLIF(BTRIM(p_datos->>'tipo'), '');
    v_ciudad := NULLIF(BTRIM(p_datos->>'id_ciudad'), '');
    v_descripcion := NULLIF(BTRIM(p_datos->>'descripcion'), '');
    v_precio := COALESCE(TRUNC(NULLIF(BTRIM(p_datos->>'precio_noche'), '')::NUMERIC), 0);
    v_accesibilidad := NULLIF(BTRIM(p_datos->>'accesibilidad'), '');
    v_capacidad := COALESCE(TRUNC(NULLIF(BTRIM(p_datos->>'capacidad_max'), '')::NUMERIC), 0);
    v_disponible := COALESCE(NULLIF(p_datos->>'disponible', '')::BOOLEAN, TRUE);
    v_imagen := NULLIF(BTRIM(p_datos->>'img_url'), '');

    IF v_id IS NULL THEN
        v_id_nuevo := fn_agregar_hospedaje(
            p_id_empresa, v_nombre, v_tipo, v_ciudad, v_precio,
            v_accesibilidad, v_capacidad, v_descripcion, v_imagen, v_servicios
        );
        RETURN QUERY SELECT v_id_nuevo IS NOT NULL, v_id_nuevo;
        RETURN;
    END IF;

    v_ok := fn_editar_hospedaje(
        v_id, p_id_empresa, v_nombre, v_tipo, v_ciudad, v_precio,
        v_accesibilidad, v_capacidad, v_descripcion, v_imagen,
        v_disponible, v_servicios
    );
    RETURN QUERY SELECT v_ok, CASE WHEN v_ok THEN v_id ELSE NULL::HOSPEDAJE.ID_HOSPEDAJE%TYPE END;
    RETURN;
EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN
        RAISE NOTICE 'fn_guardar_hospedaje - FK inválida: %', SQLERRM;
        RETURN QUERY SELECT FALSE, NULL::HOSPEDAJE.ID_HOSPEDAJE%TYPE;
    WHEN CHECK_VIOLATION THEN
        RAISE NOTICE 'fn_guardar_hospedaje - Check violado: %', SQLERRM;
        RETURN QUERY SELECT FALSE, NULL::HOSPEDAJE.ID_HOSPEDAJE%TYPE;
    WHEN LOCK_NOT_AVAILABLE THEN
        RAISE NOTICE 'fn_guardar_hospedaje - Fila bloqueada: %', SQLERRM;
        RETURN QUERY SELECT FALSE, NULL::HOSPEDAJE.ID_HOSPEDAJE%TYPE;
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_guardar_hospedaje: %', SQLERRM;
        RETURN QUERY SELECT FALSE, NULL::HOSPEDAJE.ID_HOSPEDAJE%TYPE;
END;
$$
LANGUAGE plpgsql;
