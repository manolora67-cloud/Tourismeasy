CREATE OR REPLACE FUNCTION fn_actualizar_contrasena_admin(
    p_id           USUARIOS.ID_PERSONA%TYPE,
    p_hash_actual  USUARIOS.CONTRASENA%TYPE,
    p_hash_nuevo   USUARIOS.CONTRASENA%TYPE
)
RETURNS TABLE (
    ok      BOOLEAN,
    mensaje TEXT
) AS
$$
BEGIN
    RETURN QUERY
    SELECT cambio.ok, cambio.mensaje
    FROM fn_actualizar_contrasena_cuenta('admin', p_id, p_hash_actual, p_hash_nuevo) cambio;
END;
$$
LANGUAGE plpgsql;
