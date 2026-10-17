CREATE OR REPLACE FUNCTION fn_reservar_sesion_activa(
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
     IF p_tipo_cuenta IS NULL
         OR p_tipo_cuenta NOT IN ('admin', 'empresa', 'artesano')
       OR p_id_cuenta IS NULL
       OR p_id_cuenta !~ '^[0-9]{6,10}$'
       OR p_token_dispositivo_hash IS NULL
       OR p_token_dispositivo_hash !~ '^[a-f0-9]{64}$'
       OR p_id_sesion_hash IS NULL
       OR p_id_sesion_hash !~ '^[a-f0-9]{64}$' THEN
        RETURN FALSE;
    END IF;

    INSERT INTO SESIONES_ACTIVAS (
        TIPO_CUENTA, ID_CUENTA, TOKEN_DISPOSITIVO_HASH, ID_SESION_HASH
    )
    VALUES (
        p_tipo_cuenta, p_id_cuenta, p_token_dispositivo_hash, p_id_sesion_hash
    )
    ON CONFLICT (TIPO_CUENTA, ID_CUENTA) DO UPDATE SET
        ID_SESION_HASH = EXCLUDED.ID_SESION_HASH,
        FECHA_INICIO = NOW()
    WHERE SESIONES_ACTIVAS.TOKEN_DISPOSITIVO_HASH = EXCLUDED.TOKEN_DISPOSITIVO_HASH;

    GET DIAGNOSTICS v_filas = ROW_COUNT;
    RETURN v_filas = 1;
END;
$$
LANGUAGE plpgsql;