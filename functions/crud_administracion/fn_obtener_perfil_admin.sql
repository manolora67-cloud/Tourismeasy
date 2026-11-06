CREATE OR REPLACE FUNCTION fn_obtener_perfil_admin(
    p_id USUARIOS.ID_PERSONA%TYPE
)
RETURNS TABLE (
    cedula         USUARIOS.ID_PERSONA%TYPE,
    nombre         USUARIOS.NOM_PERSONA%TYPE,
    apellido       USUARIOS.APE_PERSONA%TYPE,
    celular        USUARIOS.NUM_CEL_PERSONA%TYPE,
    email_persona  USUARIOS.EMAIL_LOGIN%TYPE,
    fecha_registro USUARIOS.FECHA_REGISTRO%TYPE,
    email_login    USUARIOS.EMAIL_LOGIN%TYPE,
    rol            VARCHAR(10),
    estado         USUARIOS.ESTADO%TYPE
) AS
$$
BEGIN
    RETURN QUERY
    SELECT u.ID_PERSONA, u.NOM_PERSONA, u.APE_PERSONA, u.NUM_CEL_PERSONA,
        u.EMAIL_LOGIN, u.FECHA_REGISTRO, u.EMAIL_LOGIN, 'admin'::VARCHAR(10), u.ESTADO
    FROM USUARIOS u
    WHERE u.ID_PERSONA = p_id
    LIMIT 1;

EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN
        RAISE NOTICE 'fn_obtener_perfil_admin - FK inválida: %', SQLERRM;
        RETURN;
    WHEN CHECK_VIOLATION THEN
        RAISE NOTICE 'fn_obtener_perfil_admin - Check violado: %', SQLERRM;
        RETURN;
    WHEN LOCK_NOT_AVAILABLE THEN
        RAISE NOTICE 'fn_obtener_perfil_admin - Tabla bloqueada: %', SQLERRM;
        RETURN;
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_obtener_perfil_admin: %', SQLERRM;
        RETURN;
END;
$$
LANGUAGE plpgsql;