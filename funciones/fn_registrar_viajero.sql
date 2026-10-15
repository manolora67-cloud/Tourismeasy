CREATE OR REPLACE FUNCTION fn_registrar_viajero(
    p_documento     PERSONAS.ID_PERSONA%TYPE,
    p_tipo_doc      PERSONAS.ID_TIPO_DOC%TYPE,
    p_nombre        PERSONAS.NOM_PERSONA%TYPE,
    p_apellido      PERSONAS.APE_PERSONA%TYPE,
    p_celular       PERSONAS.NUM_CEL_PERSONA%TYPE,
    p_email         PERSONAS.EMAIL_PERSONA%TYPE,
    p_hash          USUARIOS.CONTRASENA%TYPE
)
RETURNS TABLE (
    ok      BOOLEAN,
    mensaje TEXT
) AS
$$
BEGIN
    IF EXISTS (SELECT 1 FROM USUARIOS WHERE EMAIL_LOGIN = p_email) THEN
        RETURN QUERY SELECT FALSE, 'Este correo ya está registrado.'::TEXT;
        RETURN;
    END IF;

    IF EXISTS (SELECT 1 FROM PERSONAS WHERE ID_PERSONA = p_documento) THEN
        RETURN QUERY SELECT FALSE, 'Este número de documento ya está registrado.'::TEXT;
        RETURN;
    END IF;

    INSERT INTO PERSONAS (ID_PERSONA, ID_TIPO_DOC, NOM_PERSONA, APE_PERSONA, NUM_CEL_PERSONA, EMAIL_PERSONA)
    VALUES (p_documento, p_tipo_doc, p_nombre, p_apellido, p_celular, p_email);

    INSERT INTO USUARIOS (ID_PERSONA, ROL, EMAIL_LOGIN, CONTRASENA, ESTADO)
    VALUES (p_documento, 'viajero', p_email, p_hash, 'ACTIVO');

    RETURN QUERY SELECT TRUE, 'Cuenta creada exitosamente.'::TEXT;

EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN
        RAISE NOTICE 'fn_registrar_viajero - FK inválida: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'Tipo de documento inválido.'::TEXT;
    WHEN CHECK_VIOLATION THEN
        RAISE NOTICE 'fn_registrar_viajero - Check violado: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'Los datos ingresados no cumplen el formato requerido.'::TEXT;
    WHEN LOCK_NOT_AVAILABLE THEN
        RAISE NOTICE 'fn_registrar_viajero - Fila bloqueada: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'El registro está siendo procesado, intenta de nuevo.'::TEXT;
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_registrar_viajero: %', SQLERRM;
        RETURN QUERY SELECT FALSE, ('Error al crear la cuenta: ' || SQLERRM)::TEXT;
END;
$$
LANGUAGE plpgsql;