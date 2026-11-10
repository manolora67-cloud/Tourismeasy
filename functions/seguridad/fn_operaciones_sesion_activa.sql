CREATE OR REPLACE FUNCTION fn_sesion_activa_existe(
    p_tipo_cuenta VARCHAR(10),
    p_id_cuenta VARCHAR(10),
    p_id_sesion_hash CHAR(64)
)
RETURNS BOOLEAN
LANGUAGE sql
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM SESIONES_ACTIVAS
        WHERE TIPO_CUENTA = p_tipo_cuenta
          AND ID_CUENTA = p_id_cuenta
          AND ID_SESION_HASH = p_id_sesion_hash
    );
$$;

CREATE OR REPLACE FUNCTION fn_actualizar_actividad_sesion_activa(
    p_tipo_cuenta VARCHAR(10),
    p_id_cuenta VARCHAR(10),
    p_id_sesion_hash CHAR(64)
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE SESIONES_ACTIVAS
    SET FECHA_ULTIMA_ACTIVIDAD = NOW()
    WHERE TIPO_CUENTA = p_tipo_cuenta
      AND ID_CUENTA = p_id_cuenta
      AND ID_SESION_HASH = p_id_sesion_hash;

    RETURN FOUND;
END;
$$;
