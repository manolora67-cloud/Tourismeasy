DROP FUNCTION IF EXISTS fn_listar_transporte_publico();

CREATE OR REPLACE FUNCTION fn_listar_transporte_publico()
RETURNS TABLE (
    id              TRANSPORTE.ID_TRANSPORTE%TYPE,
    origen          TRANSPORTE.ORIGEN%TYPE,
    destino         TRANSPORTE.DESTINO%TYPE,
    fecha_salida    TRANSPORTE.FECHA_SALIDA%TYPE,
    hora_salida     TRANSPORTE.HORA_SALIDA%TYPE,
    precio          TRANSPORTE.PRECIO%TYPE,
    disponible      TRANSPORTE.DISPONIBILIDAD%TYPE,
    descripcion     TRANSPORTE.DESCRIPCION%TYPE,
    img_url         TRANSPORTE.IMG_URL%TYPE,
    empresa         EMPRESAS.NOM_EMPRESA%TYPE,
    id_empresa      TRANSPORTE.ID_EMPRESA%TYPE,
    ciudad_origen   CIUDADES.NOM_CIUDAD%TYPE,
    telefono        EMPRESAS.NUM_CONTACTO_EMPRESA%TYPE,
    id_clase        CLASE_SERVICIO_TRANSPORTE.ID_CLASE%TYPE,
    nombre_clase    CLASE_SERVICIO_TRANSPORTE.NOMBRE_CLASE%TYPE
) AS
$$
BEGIN
    RETURN QUERY
    SELECT
        T.ID_TRANSPORTE,
        T.ORIGEN,
        T.DESTINO,
        T.FECHA_SALIDA,
        T.HORA_SALIDA,
        T.PRECIO,
        T.DISPONIBILIDAD,
        T.DESCRIPCION,
        T.IMG_URL,
        E.NOM_EMPRESA,
        E.ID_EMPRESA,
        C.NOM_CIUDAD,
        E.NUM_CONTACTO_EMPRESA,
        CST.ID_CLASE,
        CST.NOMBRE_CLASE
    FROM TRANSPORTE T
    JOIN EMPRESAS E
        ON E.ID_EMPRESA = T.ID_EMPRESA
    LEFT JOIN CIUDADES C
        ON C.ID_CIUDAD = E.ID_CIUDAD
    LEFT JOIN TRANSPORTE_CLASE TC
        ON TC.ID_TRANSPORTE = T.ID_TRANSPORTE
    LEFT JOIN CLASE_SERVICIO_TRANSPORTE CST
        ON CST.ID_CLASE = TC.ID_CLASE
    WHERE T.DISPONIBILIDAD = TRUE
    ORDER BY
        T.FECHA_SALIDA ASC,
        T.HORA_SALIDA ASC;

EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN
        RAISE NOTICE 'fn_listar_transporte_publico - FK inválida: %', SQLERRM;
        RETURN;
    WHEN CHECK_VIOLATION THEN
        RAISE NOTICE 'fn_listar_transporte_publico - Check violado: %', SQLERRM;
        RETURN;
    WHEN LOCK_NOT_AVAILABLE THEN
        RAISE NOTICE 'fn_listar_transporte_publico - Tabla bloqueada: %', SQLERRM;
        RETURN;
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_listar_transporte_publico: %', SQLERRM;
        RETURN;
END;
$$
LANGUAGE plpgsql;