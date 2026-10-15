CREATE OR REPLACE FUNCTION fn_obtener_perfil_admin(
    p_id PERSONAS.ID_PERSONA%TYPE
)
RETURNS TABLE (
    cedula         PERSONAS.ID_PERSONA%TYPE,
    nombre         PERSONAS.NOM_PERSONA%TYPE,
    apellido       PERSONAS.APE_PERSONA%TYPE,
    celular        PERSONAS.NUM_CEL_PERSONA%TYPE,
    email_persona  PERSONAS.EMAIL_PERSONA%TYPE,
    fecha_registro PERSONAS.FECHA_REGISTRO%TYPE,
    email_login    USUARIOS.EMAIL_LOGIN%TYPE,
    rol            USUARIOS.ROL%TYPE,
    estado         USUARIOS.ESTADO%TYPE
) AS
$$
BEGIN
    RETURN QUERY
    SELECT
        p.ID_PERSONA, p.NOM_PERSONA, p.APE_PERSONA, p.NUM_CEL_PERSONA,
        p.EMAIL_PERSONA, p.FECHA_REGISTRO, u.EMAIL_LOGIN, u.ROL, u.ESTADO
    FROM PERSONAS p
    JOIN USUARIOS u ON u.ID_PERSONA = p.ID_PERSONA
    WHERE p.ID_PERSONA = p_id
      AND u.ROL = 'admin'
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