CREATE OR REPLACE FUNCTION fn_cerrar_sesion_activa(
    p_tipo_cuenta            VARCHAR(10),
    p_id_cuenta              VARCHAR(10),
    p_token_dispositivo_hash CHAR(64),
    p_id_sesion_hash         CHAR(64)
)
RETURNS BOOLEAN AS
$$
DECLARE
    v_filas INTEGER;
BEGIN
    DELETE FROM SESIONES_ACTIVAS
    WHERE TIPO_CUENTA = p_tipo_cuenta
      AND ID_CUENTA = p_id_cuenta
      AND (
          (p_token_dispositivo_hash IS NOT NULL
              AND TOKEN_DISPOSITIVO_HASH = p_token_dispositivo_hash)
          OR ID_SESION_HASH = p_id_sesion_hash
      );

    GET DIAGNOSTICS v_filas = ROW_COUNT;
    RETURN v_filas = 1;
END;
$$
LANGUAGE plpgsql;