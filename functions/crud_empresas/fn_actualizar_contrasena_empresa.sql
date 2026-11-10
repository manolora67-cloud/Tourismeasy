CREATE OR REPLACE FUNCTION fn_actualizar_contrasena_empresa(
    p_id           USUARIOS_EMPRESA.ID_EMPRESA%TYPE,
    p_hash_actual  USUARIOS_EMPRESA.CONTRASENA%TYPE,
    p_hash_nuevo   USUARIOS_EMPRESA.CONTRASENA%TYPE
)
RETURNS TABLE (
    ok      BOOLEAN,
    mensaje TEXT
) AS
$$
BEGIN
    RETURN QUERY
    SELECT cambio.ok, cambio.mensaje
    FROM fn_actualizar_contrasena_cuenta('empresa', p_id, p_hash_actual, p_hash_nuevo) cambio;
END;
$$
LANGUAGE plpgsql;
