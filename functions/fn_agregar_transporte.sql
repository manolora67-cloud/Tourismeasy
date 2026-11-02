CREATE OR REPLACE FUNCTION fn_agregar_transporte(
    t_id_empresa    TRANSPORTE.ID_EMPRESA%TYPE,
    t_origen        TRANSPORTE.ORIGEN%TYPE,
    t_destino       TRANSPORTE.DESTINO%TYPE,
    t_fecha_salida  TRANSPORTE.FECHA_SALIDA%TYPE,
    t_hora_salida   TRANSPORTE.HORA_SALIDA%TYPE,
    t_precio        TRANSPORTE.PRECIO%TYPE,
    t_id_clase      CLASE_SERVICIO_TRANSPORTE.ID_CLASE%TYPE,
    t_descripcion   TRANSPORTE.DESCRIPCION%TYPE DEFAULT NULL,
    t_img_url       TRANSPORTE.IMG_URL%TYPE DEFAULT NULL
)
RETURNS TRANSPORTE.ID_TRANSPORTE%TYPE AS
$$
DECLARE
    v_nuevo_id TRANSPORTE.ID_TRANSPORTE%TYPE;
    v_origen TRANSPORTE.ORIGEN%TYPE;
    v_destino TRANSPORTE.DESTINO%TYPE;
BEGIN
    -- La empresa debe existir y prestar servicio de TRANSPORTE
    IF NOT EXISTS (SELECT 1 FROM EMPRESAS WHERE ID_EMPRESA = t_id_empresa AND TIPO_SERVICIO = 'TRANSPORTE') THEN
        RETURN NULL;
    END IF;

    -- El usuario de la empresa debe estar activo
    IF NOT EXISTS (SELECT 1 FROM USUARIOS_EMPRESA WHERE ID_EMPRESA = t_id_empresa AND ESTADO = 'ACTIVO') THEN
        RETURN NULL;
    END IF;

    -- Los parámetros origen/destino son identificadores de CIUDADES.
    IF t_origen IS NULL OR LENGTH(TRIM(t_origen)) < 3 THEN
        RETURN NULL;
    END IF;

    IF t_destino IS NULL OR LENGTH(TRIM(t_destino)) < 3 THEN
        RETURN NULL;
    END IF;

    IF t_origen = t_destino
       OR NOT EXISTS (SELECT 1 FROM CIUDADES WHERE ID_CIUDAD = t_origen)
       OR NOT EXISTS (SELECT 1 FROM CIUDADES WHERE ID_CIUDAD = t_destino) THEN
        RETURN NULL;
    END IF;

    SELECT NOM_CIUDAD INTO v_origen FROM CIUDADES WHERE ID_CIUDAD = t_origen;
    SELECT NOM_CIUDAD INTO v_destino FROM CIUDADES WHERE ID_CIUDAD = t_destino;

    -- La fecha no puede ser anterior a hoy
    IF t_fecha_salida < CURRENT_DATE THEN
        RETURN NULL;
    END IF;

    -- El precio debe ser mayor que cero
    IF t_precio <= 0 THEN
        RETURN NULL;
    END IF;

    -- La clase debe existir y estar activa
    IF NOT EXISTS (SELECT 1 FROM CLASE_SERVICIO_TRANSPORTE WHERE ID_CLASE = t_id_clase AND ACTIVO = TRUE) THEN
        RETURN NULL;
    END IF;

    -- Crear transporte
    INSERT INTO TRANSPORTE (
        ID_EMPRESA,
        ORIGEN,
        DESTINO,
        ID_CIUDAD_ORIGEN,
        ID_CIUDAD_DESTINO,
        FECHA_SALIDA,
        HORA_SALIDA,
        PRECIO,
        DISPONIBILIDAD,
        DESCRIPCION,
        IMG_URL,
        FECHA_CREACION
    )
    VALUES (
        t_id_empresa,
        v_origen,
        v_destino,
        t_origen,
        t_destino,
        t_fecha_salida,
        t_hora_salida,
        t_precio,
        TRUE,
        t_descripcion,
        t_img_url,
        NOW()
    )
    RETURNING ID_TRANSPORTE INTO v_nuevo_id;

    -- Asociar la clase seleccionada
    INSERT INTO TRANSPORTE_CLASE (
        ID_TRANSPORTE,
        ID_CLASE
    )
    VALUES (
        v_nuevo_id,
        t_id_clase
    );

    RETURN v_nuevo_id;

EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN
        RAISE NOTICE 'fn_agregar_transporte - FK inválida: %', SQLERRM;
        RETURN NULL;
    WHEN CHECK_VIOLATION THEN
        RAISE NOTICE 'fn_agregar_transporte - Check violado: %', SQLERRM;
        RETURN NULL;
    WHEN LOCK_NOT_AVAILABLE THEN
        RAISE NOTICE 'fn_agregar_transporte - Fila bloqueada: %', SQLERRM;
        RETURN NULL;
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_agregar_transporte: %', SQLERRM;
        RETURN NULL;
END;
$$
LANGUAGE plpgsql;