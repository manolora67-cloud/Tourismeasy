CREATE OR REPLACE FUNCTION fn_registrar_empresa(
    p_nit           EMPRESAS.ID_EMPRESA%TYPE,
    p_nombre        EMPRESAS.NOM_EMPRESA%TYPE,
    p_email_inst    EMPRESAS.EMAIL_INSTITU_EMPRESA%TYPE,
    p_contacto      EMPRESAS.NUM_CONTACTO_EMPRESA%TYPE,
    p_id_ciudad     EMPRESAS.ID_CIUDAD%TYPE,
    p_tipo_servicio EMPRESAS.TIPO_SERVICIO%TYPE,
    p_email_login   USUARIOS_EMPRESA.EMAIL_LOGIN%TYPE,
    p_hash          USUARIOS_EMPRESA.CONTRASENA%TYPE
)
RETURNS TABLE (
    ok      BOOLEAN,
    mensaje TEXT
) AS
$$
BEGIN
    IF EXISTS (SELECT 1 FROM EMPRESAS WHERE ID_EMPRESA = p_nit) THEN
        RETURN QUERY SELECT FALSE, 'Este NIT ya está registrado.'::TEXT;
        RETURN;
    END IF;

    PERFORM pg_advisory_xact_lock(HASHTEXT(LOWER(BTRIM(p_email_login))));

    IF EXISTS (SELECT 1 FROM USUARIOS_EMPRESA WHERE LOWER(EMAIL_LOGIN) = LOWER(BTRIM(p_email_login))) THEN
        RETURN QUERY SELECT FALSE, 'Este correo ya está registrado.'::TEXT;
        RETURN;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM CIUDADES WHERE ID_CIUDAD = p_id_ciudad) THEN
        RETURN QUERY SELECT FALSE, 'Ciudad no válida.'::TEXT;
        RETURN;
    END IF;

    INSERT INTO EMPRESAS (ID_EMPRESA, NOM_EMPRESA, EMAIL_INSTITU_EMPRESA, NUM_CONTACTO_EMPRESA, ID_CIUDAD, TIPO_SERVICIO)
    VALUES (p_nit, p_nombre, p_email_inst, p_contacto, p_id_ciudad, p_tipo_servicio);

    INSERT INTO USUARIOS_EMPRESA (ID_EMPRESA, EMAIL_LOGIN, CONTRASENA, ESTADO)
    VALUES (p_nit, p_email_login, p_hash, 'PENDIENTE');

    RETURN QUERY SELECT TRUE, 'Solicitud enviada. Un administrador revisará tu cuenta pronto.'::TEXT;

EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN
        RAISE NOTICE 'fn_registrar_empresa - FK inválida: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'Ciudad no válida.'::TEXT;
    WHEN CHECK_VIOLATION THEN
        RAISE NOTICE 'fn_registrar_empresa - Check violado: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'Los datos ingresados no cumplen el formato requerido.'::TEXT;
    WHEN LOCK_NOT_AVAILABLE THEN
        RAISE NOTICE 'fn_registrar_empresa - Fila bloqueada: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'El registro está siendo procesado, intenta de nuevo.'::TEXT;
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_registrar_empresa: %', SQLERRM;
        RETURN QUERY SELECT FALSE, ('Error al registrar la empresa: ' || SQLERRM)::TEXT;
END;
$$
LANGUAGE plpgsql;