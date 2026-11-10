CREATE OR REPLACE FUNCTION fn_sue_buscar_transportes_ruta(
    p_origen TEXT,
    p_destino TEXT,
    p_offset INTEGER
)
RETURNS TABLE (
    origen VARCHAR(100),
    destino VARCHAR(100),
    fecha_salida DATE,
    hora_salida TIME,
    precio DECIMAL(12, 0),
    empresa VARCHAR(50),
    nombre_clase VARCHAR(100)
)
LANGUAGE sql
AS $$
    SELECT
        t.ORIGEN,
        t.DESTINO,
        t.FECHA_SALIDA,
        t.HORA_SALIDA,
        t.PRECIO,
        e.NOM_EMPRESA,
        cst.NOMBRE_CLASE
    FROM TRANSPORTE t
    JOIN EMPRESAS e ON e.ID_EMPRESA = t.ID_EMPRESA
    JOIN CIUDADES co ON co.ID_CIUDAD = t.ID_CIUDAD_ORIGEN
    JOIN CIUDADES cd ON cd.ID_CIUDAD = t.ID_CIUDAD_DESTINO
    LEFT JOIN TRANSPORTE_CLASE tc ON tc.ID_TRANSPORTE = t.ID_TRANSPORTE
    LEFT JOIN CLASE_SERVICIO_TRANSPORTE cst ON cst.ID_CLASE = tc.ID_CLASE
    WHERE t.DISPONIBILIDAD = TRUE
      AND t.FECHA_SALIDA >= CURRENT_DATE
      AND e.TIPO_SERVICIO = 'TRANSPORTE'
      AND EXISTS (
          SELECT 1
          FROM USUARIOS_EMPRESA ue
          WHERE ue.ID_EMPRESA = e.ID_EMPRESA
            AND ue.ESTADO = 'ACTIVO'
      )
      AND (p_origen IS NULL OR LOWER(BTRIM(co.NOM_CIUDAD)) = LOWER(BTRIM(p_origen)))
      AND (p_destino IS NULL OR LOWER(BTRIM(cd.NOM_CIUDAD)) = LOWER(BTRIM(p_destino)))
    ORDER BY t.FECHA_SALIDA, t.HORA_SALIDA, t.ID_TRANSPORTE
    LIMIT 6 OFFSET p_offset;
$$;
