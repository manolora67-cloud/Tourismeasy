CREATE OR REPLACE FUNCTION fn_rehash_contrasena_login(
    p_tipo          VARCHAR(10),
    p_id_cuenta     VARCHAR(10),
    p_hash_anterior VARCHAR(255),
    p_hash_nuevo    VARCHAR(255)
)
RETURNS BOOLEAN AS
$$
BEGIN
    IF p_tipo = 'admin' THEN
        UPDATE USUARIOS
        SET CONTRASENA = p_hash_nuevo
        WHERE ID_PERSONA = p_id_cuenta
          AND CONTRASENA = p_hash_anterior;
    ELSIF p_tipo = 'empresa' THEN
        UPDATE USUARIOS_EMPRESA
        SET CONTRASENA = p_hash_nuevo
        WHERE ID_EMPRESA = p_id_cuenta
          AND CONTRASENA = p_hash_anterior;
    ELSIF p_tipo = 'artesano' THEN
        UPDATE USUARIOS_ECOMMERCE
        SET CONTRASENA = p_hash_nuevo
        WHERE ID_PERSONA_ECOMMERCE = p_id_cuenta
          AND CONTRASENA = p_hash_anterior;
    ELSE
        RETURN FALSE;
    END IF;

    RETURN FOUND;
END;
$$
LANGUAGE plpgsql;