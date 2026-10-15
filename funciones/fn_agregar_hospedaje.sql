CREATE OR REPLACE FUNCTION fn_agregar_hospedaje(
    h_id_empresa     HOSPEDAJE.ID_EMPRESA%TYPE,
    h_nombre         HOSPEDAJE.NOM_HOSPEDAJE%TYPE,
    h_tipo           HOSPEDAJE.TIPO_HOSPEDAJE%TYPE,
    h_id_ciudad      HOSPEDAJE.ID_CIUDAD%TYPE,
    h_precio_noche   HOSPEDAJE.PRECIO_NOCHE%TYPE,
    h_accesibilidad  HOSPEDAJE.ACCESIBILIDAD%TYPE,
    h_capacidad_max  HOSPEDAJE.CAPACIDAD_MAX%TYPE,
    h_descripcion    HOSPEDAJE.DESCRIPCION%TYPE DEFAULT NULL,
    h_img_url        HOSPEDAJE.IMG_URL%TYPE DEFAULT NULL,
    h_servicios_ids  INTEGER[] DEFAULT '{}'
)
RETURNS INTEGER AS
$$
DECLARE
    v_nuevo_id HOSPEDAJE.ID_HOSPEDAJE%TYPE;
    v_sid      INTEGER;
BEGIN
    -- La empresa debe existir y prestar servicio de HOSPEDAJE
    IF NOT EXISTS (SELECT 1 FROM EMPRESAS WHERE ID_EMPRESA = h_id_empresa AND TIPO_SERVICIO = 'HOSPEDAJE') THEN
        RETURN NULL;
    END IF;

    -- El usuario de la empresa debe estar activo
    IF NOT EXISTS (SELECT 1 FROM USUARIOS_EMPRESA WHERE ID_EMPRESA = h_id_empresa AND ESTADO = 'ACTIVO') THEN
        RETURN NULL;
    END IF;

    IF h_nombre IS NULL OR LENGTH(TRIM(h_nombre)) < 3 THEN
        RETURN NULL;
    END IF;

    IF h_precio_noche <= 0 THEN
        RETURN NULL;
    END IF;

    IF h_capacidad_max <= 0 THEN
        RETURN NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM CIUDADES WHERE ID_CIUDAD = h_id_ciudad) THEN
        RETURN NULL;
    END IF;

    INSERT INTO HOSPEDAJE (
        ID_EMPRESA, NOM_HOSPEDAJE, TIPO_HOSPEDAJE, ID_CIUDAD,
        DESCRIPCION, PRECIO_NOCHE, ACCESIBILIDAD, CAPACIDAD_MAX,
        DISPONIBILIDAD, IMG_URL, FECHA_CREACION
    ) VALUES (
        h_id_empresa, TRIM(h_nombre), h_tipo, h_id_ciudad,
        h_descripcion, h_precio_noche, h_accesibilidad, h_capacidad_max,
        TRUE, h_img_url, NOW()
    )
    RETURNING ID_HOSPEDAJE INTO v_nuevo_id;

    -- Vincular servicios (solo los que realmente existen en el catálogo)
    IF h_servicios_ids IS NOT NULL THEN
        FOREACH v_sid IN ARRAY h_servicios_ids LOOP
            IF EXISTS (SELECT 1 FROM SERVICIOS_HOSPEDAJE WHERE ID_SERVICIO = v_sid) THEN
                INSERT INTO HOSPEDAJE_SERVICIOS (ID_HOSPEDAJE, ID_SERVICIO)
                VALUES (v_nuevo_id, v_sid)
                ON CONFLICT DO NOTHING;
            END IF;
        END LOOP;
    END IF;

    RETURN v_nuevo_id;

EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN
        RAISE NOTICE 'fn_agregar_hospedaje - FK inválida: %', SQLERRM;
        RETURN NULL;
    WHEN CHECK_VIOLATION THEN
        RAISE NOTICE 'fn_agregar_hospedaje - Check violado: %', SQLERRM;
        RETURN NULL;
    WHEN LOCK_NOT_AVAILABLE THEN
        RAISE NOTICE 'fn_agregar_hospedaje - Fila bloqueada: %', SQLERRM;
        RETURN NULL;
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_agregar_hospedaje: %', SQLERRM;
        RETURN NULL;
END;
$$
LANGUAGE plpgsql;
