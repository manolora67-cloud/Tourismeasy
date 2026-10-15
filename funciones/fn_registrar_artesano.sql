CREATE OR REPLACE FUNCTION fn_registrar_artesano(
    p_documento PERSONAS_ECOMMERCE.ID_PERSONA_ECOMMERCE%TYPE,
    p_tipo_doc  PERSONAS_ECOMMERCE.ID_TIPO_DOC%TYPE,
    p_nombre    PERSONAS_ECOMMERCE.NOM_PERSONA_ECOMMERCE%TYPE,
    p_apellido  PERSONAS_ECOMMERCE.APE_PERSONA_ECOMMERCE%TYPE,
    p_celular   PERSONAS_ECOMMERCE.NUM_CEL_PERSONA_ECOMMERCE%TYPE,
    p_email     PERSONAS_ECOMMERCE.EMAIL_PERSONA_ECOMMERCE%TYPE,
    p_hash      USUARIOS_ECOMMERCE.CONTRASENA%TYPE
)
RETURNS TABLE (
    ok      BOOLEAN,
    mensaje TEXT
) AS
$$
BEGIN
    IF EXISTS (SELECT 1 FROM PERSONAS_ECOMMERCE WHERE ID_PERSONA_ECOMMERCE = p_documento) THEN
        RETURN QUERY SELECT FALSE, 'Este documento ya está registrado.'::TEXT;
        RETURN;
    END IF;

    IF EXISTS (SELECT 1 FROM USUARIOS_ECOMMERCE WHERE EMAIL_LOGIN = p_email) THEN
        RETURN QUERY SELECT FALSE, 'Este correo ya está registrado.'::TEXT;
        RETURN;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM TIPOS_DOCUMENTOS WHERE ID_TIPO_DOC = p_tipo_doc) THEN
        RETURN QUERY SELECT FALSE, 'Tipo de documento inválido.'::TEXT;
        RETURN;
    END IF;

    INSERT INTO PERSONAS_ECOMMERCE
        (ID_PERSONA_ECOMMERCE, ID_TIPO_DOC, NOM_PERSONA_ECOMMERCE, APE_PERSONA_ECOMMERCE, NUM_CEL_PERSONA_ECOMMERCE, EMAIL_PERSONA_ECOMMERCE)
    VALUES
        (p_documento, p_tipo_doc, p_nombre, p_apellido, p_celular, p_email);

    INSERT INTO USUARIOS_ECOMMERCE (ID_PERSONA_ECOMMERCE, EMAIL_LOGIN, CONTRASENA, ESTADO)
    VALUES (p_documento, p_email, p_hash, 'PENDIENTE');

    RETURN QUERY SELECT TRUE, 'Solicitud enviada. Un administrador revisará tu cuenta pronto.'::TEXT;

EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN
        RAISE NOTICE 'fn_registrar_artesano - FK inválida: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'Tipo de documento inválido.'::TEXT;
    WHEN CHECK_VIOLATION THEN
        RAISE NOTICE 'fn_registrar_artesano - Check violado: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'Los datos ingresados no cumplen el formato requerido.'::TEXT;
    WHEN LOCK_NOT_AVAILABLE THEN
        RAISE NOTICE 'fn_registrar_artesano - Fila bloqueada: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'El registro está siendo procesado, intenta de nuevo.'::TEXT;
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_registrar_artesano: %', SQLERRM;
        RETURN QUERY SELECT FALSE, ('Error al registrar: ' || SQLERRM)::TEXT;
END;
$$
LANGUAGE plpgsql;