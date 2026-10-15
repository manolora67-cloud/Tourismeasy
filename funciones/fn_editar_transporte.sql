DROP FUNCTION IF EXISTS fn_editar_transporte(
    VARCHAR,
    VARCHAR,
    VARCHAR,
    VARCHAR,
    DATE,
    TIME,
    DECIMAL,
    VARCHAR,
    TEXT,
    VARCHAR,
    BOOLEAN
);

CREATE OR REPLACE FUNCTION fn_editar_transporte(
    t_id_transporte   TRANSPORTE.ID_TRANSPORTE%TYPE,
    t_id_empresa      TRANSPORTE.ID_EMPRESA%TYPE,
    t_origen          TRANSPORTE.ORIGEN%TYPE,
    t_destino         TRANSPORTE.DESTINO%TYPE,
    t_fecha_salida    TRANSPORTE.FECHA_SALIDA%TYPE,
    t_hora_salida     TRANSPORTE.HORA_SALIDA%TYPE,
    t_precio          TRANSPORTE.PRECIO%TYPE,
    t_id_clase        CLASE_SERVICIO_TRANSPORTE.ID_CLASE%TYPE,
    t_descripcion     TRANSPORTE.DESCRIPCION%TYPE DEFAULT NULL,
    t_img_url         TRANSPORTE.IMG_URL%TYPE DEFAULT NULL,
    t_disponibilidad  TRANSPORTE.DISPONIBILIDAD%TYPE DEFAULT TRUE
)
RETURNS BOOLEAN AS
$$
DECLARE
    v_id_empresa_db TRANSPORTE.ID_EMPRESA%TYPE;
BEGIN
    -- Verificar que el transporte exista
    SELECT ID_EMPRESA
    INTO v_id_empresa_db
    FROM TRANSPORTE
    WHERE ID_TRANSPORTE = t_id_transporte;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- Verificar que el transporte pertenezca a la empresa
    IF v_id_empresa_db <> t_id_empresa THEN
        RETURN FALSE;
    END IF;

    -- Verificar que la empresa sea de transporte
    IF NOT EXISTS (SELECT 1 FROM EMPRESAS WHERE ID_EMPRESA = t_id_empresa AND TIPO_SERVICIO = 'TRANSPORTE') THEN
        RETURN FALSE;
    END IF;

    -- Verificar usuario activo
    IF NOT EXISTS (SELECT 1 FROM USUARIOS_EMPRESA WHERE ID_EMPRESA = t_id_empresa AND ESTADO = 'ACTIVO') THEN
        RETURN FALSE;
    END IF;

    -- Validar origen
    IF t_origen IS NULL OR LENGTH(TRIM(t_origen)) < 3 THEN
        RETURN FALSE;
    END IF;

    -- Validar destino
    IF t_destino IS NULL OR LENGTH(TRIM(t_destino)) < 3 THEN
        RETURN FALSE;
    END IF;

    -- Origen y destino no pueden ser iguales
    IF UPPER(TRIM(t_origen)) = UPPER(TRIM(t_destino)) THEN
        RETURN FALSE;
    END IF;

    -- La fecha no puede ser anterior a hoy
    IF t_fecha_salida < CURRENT_DATE THEN
        RETURN FALSE;
    END IF;

    -- El precio debe ser mayor que cero
    IF t_precio <= 0 THEN
        RETURN FALSE;
    END IF;

    -- La clase debe existir y estar activa
    IF NOT EXISTS (SELECT 1 FROM CLASE_SERVICIO_TRANSPORTE WHERE ID_CLASE = t_id_clase AND ACTIVO = TRUE) THEN
        RETURN FALSE;
    END IF;

    -- Actualizar los datos del transporte
    UPDATE TRANSPORTE
    SET
        ORIGEN = TRIM(t_origen),
        DESTINO = TRIM(t_destino),
        FECHA_SALIDA = t_fecha_salida,
        HORA_SALIDA = t_hora_salida,
        PRECIO = t_precio,
        DESCRIPCION = t_descripcion,
        IMG_URL = t_img_url,
        DISPONIBILIDAD = t_disponibilidad
    WHERE ID_TRANSPORTE = t_id_transporte
      AND ID_EMPRESA = t_id_empresa;

    -- Actualizar la clase del transporte
    UPDATE TRANSPORTE_CLASE
    SET ID_CLASE = t_id_clase
    WHERE ID_TRANSPORTE = t_id_transporte;

    -- Por seguridad, si por alguna razón no existiera la relación, se crea
    IF NOT FOUND THEN
        INSERT INTO TRANSPORTE_CLASE (ID_TRANSPORTE, ID_CLASE)
        VALUES (t_id_transporte, t_id_clase);
    END IF;

    RETURN TRUE;

EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN
        RAISE NOTICE 'fn_editar_transporte - FK inválida: %', SQLERRM;
        RETURN FALSE;
    WHEN CHECK_VIOLATION THEN
        RAISE NOTICE 'fn_editar_transporte - Check violado: %', SQLERRM;
        RETURN FALSE;
    WHEN LOCK_NOT_AVAILABLE THEN
        RAISE NOTICE 'fn_editar_transporte - Fila bloqueada: %', SQLERRM;
        RETURN FALSE;
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_editar_transporte: %', SQLERRM;
        RETURN FALSE;
END;
$$
LANGUAGE plpgsql;