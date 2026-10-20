CREATE OR REPLACE FUNCTION fn_buscar_transporte(
    t_origen     TRANSPORTE.ORIGEN%TYPE DEFAULT NULL,
    t_destino    TRANSPORTE.DESTINO%TYPE DEFAULT NULL,
    t_fecha      TRANSPORTE.FECHA_SALIDA%TYPE DEFAULT NULL,
    t_id_empresa TRANSPORTE.ID_EMPRESA%TYPE DEFAULT NULL,
    p_id_clase   CLASE_SERVICIO_TRANSPORTE.ID_CLASE%TYPE DEFAULT NULL
)
RETURNS TABLE (
    id             TRANSPORTE.ID_TRANSPORTE%TYPE,
    empresa        EMPRESAS.NOM_EMPRESA%TYPE,
    origen         TRANSPORTE.ORIGEN%TYPE,
    destino        TRANSPORTE.DESTINO%TYPE,
    fecha_salida   TRANSPORTE.FECHA_SALIDA%TYPE,
    hora_salida    TRANSPORTE.HORA_SALIDA%TYPE,
    precio         TRANSPORTE.PRECIO%TYPE,
    descripcion    TRANSPORTE.DESCRIPCION%TYPE,
    img_url        TRANSPORTE.IMG_URL%TYPE,
    id_clase       CLASE_SERVICIO_TRANSPORTE.ID_CLASE%TYPE,
    nombre_clase   CLASE_SERVICIO_TRANSPORTE.NOMBRE_CLASE%TYPE,
    disponible     TRANSPORTE.DISPONIBILIDAD%TYPE
) AS
$$
BEGIN
    -- Si se recibe empresa, debe existir y ser de TRANSPORTE
    IF t_id_empresa IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM EMPRESAS WHERE ID_EMPRESA = t_id_empresa AND TIPO_SERVICIO = 'TRANSPORTE') THEN
        RETURN;
    END IF;

    -- Si se recibe clase, debe existir
    IF p_id_clase IS NOT NULL
       AND NOT EXISTS (
           SELECT 1
           FROM CLASE_SERVICIO_TRANSPORTE AS clase
           WHERE clase.ID_CLASE = p_id_clase
       ) THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT
        T.ID_TRANSPORTE,
        E.NOM_EMPRESA,
        T.ORIGEN,
        T.DESTINO,
        T.FECHA_SALIDA,
        T.HORA_SALIDA,
        T.PRECIO,
        T.DESCRIPCION,
        T.IMG_URL,
        CST.ID_CLASE,
        CST.NOMBRE_CLASE,
        T.DISPONIBILIDAD
    FROM TRANSPORTE T
    INNER JOIN EMPRESAS E
        ON E.ID_EMPRESA = T.ID_EMPRESA
    LEFT JOIN TRANSPORTE_CLASE TC
        ON TC.ID_TRANSPORTE = T.ID_TRANSPORTE
    LEFT JOIN CLASE_SERVICIO_TRANSPORTE CST
        ON CST.ID_CLASE = TC.ID_CLASE
    WHERE T.DISPONIBILIDAD = TRUE
      AND (t_origen IS NULL OR T.ORIGEN ILIKE '%' || t_origen || '%')
      AND (t_destino IS NULL OR T.DESTINO ILIKE '%' || t_destino || '%')
      AND (t_fecha IS NULL OR T.FECHA_SALIDA = t_fecha)
      AND (t_id_empresa IS NULL OR T.ID_EMPRESA = t_id_empresa)
      AND (p_id_clase IS NULL OR TC.ID_CLASE = p_id_clase)
    ORDER BY
        T.FECHA_SALIDA,
        T.HORA_SALIDA;

    RETURN;
END;
$$
LANGUAGE plpgsql;