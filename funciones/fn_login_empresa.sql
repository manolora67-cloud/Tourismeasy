CREATE OR REPLACE FUNCTION fn_login_empresa(
    p_email USUARIOS_EMPRESA.EMAIL_LOGIN%TYPE,
    p_hash  USUARIOS_EMPRESA.CONTRASENA%TYPE
)
RETURNS TABLE (
    ok            BOOLEAN,
    mensaje       TEXT,
    id_empresa    EMPRESAS.ID_EMPRESA%TYPE,
    email_login   USUARIOS_EMPRESA.EMAIL_LOGIN%TYPE,
    nom_empresa   EMPRESAS.NOM_EMPRESA%TYPE,
    tipo_servicio EMPRESAS.TIPO_SERVICIO%TYPE
) AS
$$
DECLARE
    v_id_empresa    EMPRESAS.ID_EMPRESA%TYPE;
    v_email_login   USUARIOS_EMPRESA.EMAIL_LOGIN%TYPE;
    v_estado        USUARIOS_EMPRESA.ESTADO%TYPE;
    v_nom_empresa   EMPRESAS.NOM_EMPRESA%TYPE;
    v_tipo_servicio EMPRESAS.TIPO_SERVICIO%TYPE;
BEGIN
    SELECT ue.ID_EMPRESA, ue.EMAIL_LOGIN, ue.ESTADO, e.NOM_EMPRESA, e.TIPO_SERVICIO
    INTO v_id_empresa, v_email_login, v_estado, v_nom_empresa, v_tipo_servicio
    FROM USUARIOS_EMPRESA ue
    JOIN EMPRESAS e ON e.ID_EMPRESA = ue.ID_EMPRESA
    WHERE ue.EMAIL_LOGIN ILIKE p_email
      AND ue.CONTRASENA  = p_hash;

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'Correo o contraseña incorrectos.'::TEXT,
            NULL::VARCHAR(10),
            NULL::VARCHAR(254),
            NULL::VARCHAR(50),
            NULL::VARCHAR(20);
        RETURN;
    END IF;

    IF v_estado <> 'ACTIVO' THEN
        RETURN QUERY SELECT FALSE, 'Tu cuenta está pendiente de aprobación.'::TEXT,
            NULL::VARCHAR(10),
            NULL::VARCHAR(254),
            NULL::VARCHAR(50),
            NULL::VARCHAR(20);
        RETURN;
    END IF;

    BEGIN
        PERFORM fn_registrar_auditoria(
            NULL,
            'Inicio de sesión',
            'Sesiones',
            'Empresa: ' || v_nom_empresa || ' (' || v_email_login || ')',
            'info',
            v_id_empresa
        );
    EXCEPTION
        WHEN OTHERS THEN
            -- La auditoría es informativa: si falla, no debe bloquear un login válido.
            RAISE NOTICE 'fn_login_empresa - auditoría no crítica: %', SQLERRM;
    END;

    RETURN QUERY SELECT TRUE, 'OK'::TEXT, v_id_empresa, v_email_login, v_nom_empresa, v_tipo_servicio;

EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN
        RAISE NOTICE 'fn_login_empresa - FK inválida: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'Error interno de datos.'::TEXT,
            NULL::VARCHAR(10),
            NULL::VARCHAR(254),
            NULL::VARCHAR(50),
            NULL::VARCHAR(20);
    WHEN CHECK_VIOLATION THEN
        RAISE NOTICE 'fn_login_empresa - Check violado: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'Error interno de datos.'::TEXT,
            NULL::VARCHAR(10),
            NULL::VARCHAR(254),
            NULL::VARCHAR(50),
            NULL::VARCHAR(20);
    WHEN LOCK_NOT_AVAILABLE THEN
        RAISE NOTICE 'fn_login_empresa - Fila bloqueada: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'El inicio de sesión está siendo procesado, intenta de nuevo.'::TEXT,
            NULL::VARCHAR(10),
            NULL::VARCHAR(254),
            NULL::VARCHAR(50),
            NULL::VARCHAR(20);
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_login_empresa: %', SQLERRM;
        RETURN QUERY SELECT FALSE, ('Error interno: ' || SQLERRM)::TEXT,
            NULL::VARCHAR(10),
            NULL::VARCHAR(254),
            NULL::VARCHAR(50),
            NULL::VARCHAR(20);
END;
$$
LANGUAGE plpgsql;