CREATE OR REPLACE FUNCTION fn_procesar_login(
    p_email USUARIOS.EMAIL_LOGIN%TYPE,
    p_hash  USUARIOS.CONTRASENA%TYPE,
    p_tipo  VARCHAR(10),
    p_ip    INTENTOS_SEGURIDAD.IP_ORIGEN%TYPE,
    p_token_dispositivo_hash CHAR(64),
    p_id_sesion_hash CHAR(64),
    p_reemplazar_sesion BOOLEAN
)
RETURNS TABLE (
    codigo           VARCHAR(20),
    ok               BOOLEAN,
    mensaje          TEXT,
    bloqueado        BOOLEAN,
    minutos_restantes INTEGER,
    id               VARCHAR(10),
    email_login      VARCHAR,
    nombre           TEXT,
    apellido         TEXT,
    rol              VARCHAR(10),
    tipo_servicio    VARCHAR(20),
    estado           VARCHAR(10)
) AS
$$
DECLARE
    v_bloqueado          BOOLEAN;
    v_minutos_restantes  INTEGER := 0;
    v_ok                 BOOLEAN;
    v_mensaje            TEXT;
    v_id                 VARCHAR(10);
    v_email_login        VARCHAR;
    v_nombre             TEXT;
    v_apellido           TEXT;
    v_rol                VARCHAR(10);
    v_tipo_servicio      VARCHAR(20);
    v_estado             VARCHAR(10);
    v_intento_registrado BOOLEAN;
    v_sesion_reservada   BOOLEAN;
BEGIN
    IF p_tipo IS NULL OR p_tipo NOT IN ('admin', 'empresa', 'artesano') THEN
        RETURN QUERY SELECT
            'TIPO_INVALIDO'::VARCHAR(20), FALSE, 'Tipo de cuenta inválido.'::TEXT,
            FALSE, 0, NULL::VARCHAR(10), NULL::VARCHAR, NULL::TEXT,
            NULL::TEXT, NULL::VARCHAR(10), NULL::VARCHAR(20), NULL::VARCHAR(10);
        RETURN;
    END IF;

    SELECT b.bloqueado, b.minutos_restantes
    INTO v_bloqueado, v_minutos_restantes
    FROM fn_verificar_bloqueo_seguridad('login', p_email) AS b;

    IF COALESCE(v_bloqueado, FALSE) THEN
        RETURN QUERY SELECT
            'BLOQUEADO'::VARCHAR(20), FALSE,
            ('Demasiados intentos fallidos. Intenta de nuevo en '
                || COALESCE(v_minutos_restantes, 0)::TEXT || ' minuto(s).')::TEXT,
            TRUE, COALESCE(v_minutos_restantes, 0), NULL::VARCHAR(10),
            NULL::VARCHAR, NULL::TEXT, NULL::TEXT, NULL::VARCHAR(10),
            NULL::VARCHAR(20), NULL::VARCHAR(10);
        RETURN;
    END IF;

    IF p_tipo = 'empresa' THEN
        SELECT l.ok, l.mensaje, l.id_empresa, l.email_login, l.nom_empresa,
               l.tipo_servicio
        INTO v_ok, v_mensaje, v_id, v_email_login, v_nombre, v_tipo_servicio
        FROM fn_login_empresa(p_email, p_hash) AS l;
         v_apellido := NULL;
        v_estado := NULL;
        v_rol := 'empresa';
    ELSIF p_tipo = 'admin' THEN
         SELECT l.ok, l.mensaje, l.id_persona, l.email_login,
             l.nom_persona, l.ape_persona, l.rol
         INTO v_ok, v_mensaje, v_id, v_email_login, v_nombre, v_apellido, v_rol
        FROM fn_login_admin(p_email, p_hash) AS l;
        v_tipo_servicio := NULL;
        v_estado := NULL;
    ELSE
        SELECT l.ok, l.mensaje, l.id_persona, l.email_login,
               l.nombre, l.apellido, l.estado
        INTO v_ok, v_mensaje, v_id, v_email_login, v_nombre, v_apellido, v_estado
        FROM fn_login_artesano(p_email, p_hash) AS l;
        v_rol := 'artesano';
        v_tipo_servicio := NULL;
    END IF;

    v_intento_registrado := fn_registrar_intento_seguridad(
        'login',
        p_email,
        p_ip,
        COALESCE(v_ok, FALSE)
    );
    IF NOT COALESCE(v_intento_registrado, FALSE) THEN
        RETURN QUERY SELECT
            'ERROR_INTENTO'::VARCHAR(20), FALSE,
            'No se pudo registrar el intento de acceso.'::TEXT,
            FALSE, 0, NULL::VARCHAR(10), NULL::VARCHAR, NULL::TEXT,
            NULL::TEXT, NULL::VARCHAR(10), NULL::VARCHAR(20), NULL::VARCHAR(10);
        RETURN;
    END IF;

    IF NOT COALESCE(v_ok, FALSE) THEN
        PERFORM fn_registrar_auditoria(
            NULL,
            'Login fallido',
            'Sesiones',
            CASE
                WHEN p_tipo = 'empresa' THEN 'Empresa: intento con correo ' || p_email
                WHEN p_tipo = 'artesano' THEN 'Artesano: intento con correo ' || p_email
                ELSE 'Administrador: intento con correo ' || p_email
            END,
            'advertencia'
        );

        SELECT b.bloqueado, b.minutos_restantes
        INTO v_bloqueado, v_minutos_restantes
        FROM fn_verificar_bloqueo_seguridad('login', p_email) AS b;
        IF COALESCE(v_bloqueado, FALSE) THEN
            RETURN QUERY SELECT
                'BLOQUEADO'::VARCHAR(20), FALSE,
                ('Demasiados intentos fallidos. Intenta de nuevo en '
                    || COALESCE(v_minutos_restantes, 0)::TEXT || ' minuto(s).')::TEXT,
                TRUE, COALESCE(v_minutos_restantes, 0), NULL::VARCHAR(10),
                NULL::VARCHAR, NULL::TEXT, NULL::TEXT, NULL::VARCHAR(10),
                NULL::VARCHAR(20), NULL::VARCHAR(10);
            RETURN;
        END IF;

        RETURN QUERY SELECT
            'CREDENCIALES'::VARCHAR(20), FALSE, v_mensaje,
            FALSE, 0, NULL::VARCHAR(10), NULL::VARCHAR, NULL::TEXT,
            NULL::TEXT, NULL::VARCHAR(10), NULL::VARCHAR(20), NULL::VARCHAR(10);
        RETURN;
    END IF;

    IF p_token_dispositivo_hash IS NULL OR p_id_sesion_hash IS NULL THEN
        RETURN QUERY SELECT
            'SESION_INVALIDA'::VARCHAR(20), FALSE,
            'No se pudo identificar este navegador. Vuelve a intentarlo.'::TEXT,
            FALSE, 0, NULL::VARCHAR(10), NULL::VARCHAR, NULL::TEXT,
            NULL::TEXT, NULL::VARCHAR(10), NULL::VARCHAR(20), NULL::VARCHAR(10);
        RETURN;
    END IF;

    DELETE FROM SESIONES_ACTIVAS
    WHERE TIPO_CUENTA = p_tipo
      AND ID_CUENTA = v_id
      AND FECHA_ULTIMA_ACTIVIDAD <= NOW() - INTERVAL '10 minutes';

    v_sesion_reservada := fn_reservar_sesion_activa(
        p_tipo, v_id, p_token_dispositivo_hash, p_id_sesion_hash
    );
    IF NOT COALESCE(v_sesion_reservada, FALSE) AND COALESCE(p_reemplazar_sesion, FALSE) THEN
        DELETE FROM SESIONES_ACTIVAS
        WHERE TIPO_CUENTA = p_tipo
          AND ID_CUENTA = v_id;

        v_sesion_reservada := fn_reservar_sesion_activa(
            p_tipo, v_id, p_token_dispositivo_hash, p_id_sesion_hash
        );
    END IF;
    IF NOT COALESCE(v_sesion_reservada, FALSE) THEN
        RETURN QUERY SELECT
            'SESION_ACTIVA'::VARCHAR(20), FALSE,
            'Esta cuenta tiene una sesión abierta en otro navegador.'::TEXT,
            FALSE, 0, v_id, v_email_login, v_nombre,
            v_apellido, v_rol, v_tipo_servicio, v_estado;
        RETURN;
    END IF;

    IF p_tipo = 'admin' THEN
        PERFORM fn_registrar_auditoria(
            v_id,
            'Inicio de sesión',
            'Sesiones',
            'Admin: ' || v_email_login,
            'info'
        );
    END IF;

    RETURN QUERY SELECT
        'OK'::VARCHAR(20), TRUE, v_mensaje, FALSE, 0, v_id,
        v_email_login, v_nombre, v_apellido, v_rol, v_tipo_servicio, v_estado;
END;
$$
LANGUAGE plpgsql;