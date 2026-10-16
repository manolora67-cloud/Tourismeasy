CREATE OR REPLACE FUNCTION fn_editar_hospedaje(
    h_id_hospedaje   HOSPEDAJE.ID_HOSPEDAJE%TYPE,
    h_id_empresa     HOSPEDAJE.ID_EMPRESA%TYPE,
    h_nombre         HOSPEDAJE.NOM_HOSPEDAJE%TYPE,
    h_tipo           HOSPEDAJE.TIPO_HOSPEDAJE%TYPE,
    h_id_ciudad      HOSPEDAJE.ID_CIUDAD%TYPE,
    h_precio_noche   HOSPEDAJE.PRECIO_NOCHE%TYPE,
    h_accesibilidad  HOSPEDAJE.ACCESIBILIDAD%TYPE,
    h_capacidad_max  HOSPEDAJE.CAPACIDAD_MAX%TYPE,
    h_descripcion    HOSPEDAJE.DESCRIPCION%TYPE DEFAULT NULL,
    h_img_url        HOSPEDAJE.IMG_URL%TYPE DEFAULT NULL,
    h_disponibilidad HOSPEDAJE.DISPONIBILIDAD%TYPE DEFAULT TRUE,
    h_servicios_ids  INTEGER[] DEFAULT '{}'
)
RETURNS BOOLEAN AS
$$
DECLARE
    v_id_empresa_db HOSPEDAJE.ID_EMPRESA%TYPE;
    v_sid           INTEGER;
BEGIN
    SELECT ID_EMPRESA INTO v_id_empresa_db
    FROM HOSPEDAJE
    WHERE ID_HOSPEDAJE = h_id_hospedaje
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    IF v_id_empresa_db <> h_id_empresa THEN
        RETURN FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM EMPRESAS WHERE ID_EMPRESA = h_id_empresa AND TIPO_SERVICIO = 'HOSPEDAJE') THEN
        RETURN FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM USUARIOS_EMPRESA WHERE ID_EMPRESA = h_id_empresa AND ESTADO = 'ACTIVO') THEN
        RETURN FALSE;
    END IF;

    IF h_nombre IS NULL OR LENGTH(TRIM(h_nombre)) < 3 THEN
        RETURN FALSE;
    END IF;

    IF h_tipo IS NULL OR LENGTH(TRIM(h_tipo)) = 0 THEN
        RETURN FALSE;
    END IF;

    IF h_precio_noche <= 0 THEN
        RETURN FALSE;
    END IF;

    IF h_capacidad_max <= 0 THEN
        RETURN FALSE;
    END IF;

    IF h_accesibilidad IS NULL OR LENGTH(TRIM(h_accesibilidad)) < 3 THEN
        RETURN FALSE;
    END IF;

    IF h_descripcion IS NOT NULL AND LENGTH(TRIM(h_descripcion)) < 5 THEN
        RETURN FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM CIUDADES WHERE ID_CIUDAD = h_id_ciudad) THEN
        RETURN FALSE;
    END IF;

    IF EXISTS (
        SELECT 1 FROM UNNEST(COALESCE(h_servicios_ids, '{}'::INTEGER[])) AS s(id)
        LEFT JOIN SERVICIOS_HOSPEDAJE sh ON sh.ID_SERVICIO = s.id
        WHERE sh.ID_SERVICIO IS NULL OR sh.ACTIVO = FALSE
    ) THEN
        RETURN FALSE;
    END IF;

    UPDATE HOSPEDAJE SET
        NOM_HOSPEDAJE  = TRIM(h_nombre),
        TIPO_HOSPEDAJE = h_tipo,
        ID_CIUDAD      = h_id_ciudad,
        DESCRIPCION    = h_descripcion,
        PRECIO_NOCHE   = h_precio_noche,
        ACCESIBILIDAD  = h_accesibilidad,
        CAPACIDAD_MAX  = h_capacidad_max,
        DISPONIBILIDAD = h_disponibilidad,
        IMG_URL        = COALESCE(h_img_url, IMG_URL)
    WHERE ID_HOSPEDAJE = h_id_hospedaje
      AND ID_EMPRESA    = h_id_empresa;

    -- Resincronizar servicios: se borran los actuales y se insertan los nuevos
    DELETE FROM HOSPEDAJE_SERVICIOS WHERE ID_HOSPEDAJE = h_id_hospedaje;

    IF h_servicios_ids IS NOT NULL THEN
        FOREACH v_sid IN ARRAY h_servicios_ids LOOP
            IF EXISTS (SELECT 1 FROM SERVICIOS_HOSPEDAJE WHERE ID_SERVICIO = v_sid AND ACTIVO = TRUE) THEN
                INSERT INTO HOSPEDAJE_SERVICIOS (ID_HOSPEDAJE, ID_SERVICIO)
                VALUES (h_id_hospedaje, v_sid)
                ON CONFLICT DO NOTHING;
            END IF;
        END LOOP;
    END IF;

    RETURN TRUE;

EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN
        RAISE NOTICE 'fn_editar_hospedaje - FK inválida: %', SQLERRM;
        RETURN FALSE;
    WHEN CHECK_VIOLATION THEN
        RAISE NOTICE 'fn_editar_hospedaje - Check violado: %', SQLERRM;
        RETURN FALSE;
    WHEN LOCK_NOT_AVAILABLE THEN
        RAISE NOTICE 'fn_editar_hospedaje - Fila bloqueada: %', SQLERRM;
        RETURN FALSE;
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_editar_hospedaje: %', SQLERRM;
        RETURN FALSE;
END;
$$
LANGUAGE plpgsql;
