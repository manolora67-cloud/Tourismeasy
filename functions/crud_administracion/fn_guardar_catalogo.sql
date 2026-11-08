CREATE OR REPLACE FUNCTION fn_guardar_catalogo(
    p_tipo      TEXT,
    p_accion    TEXT,
    p_id        TEXT,
    p_codigo    TEXT,
    p_nombre    TEXT,
    p_activo    BOOLEAN,
    p_id_admin  AUDITORIA.ID_USUARIO%TYPE
)
RETURNS JSONB AS
$$
DECLARE
    v_nombre TEXT := NULLIF(BTRIM(p_nombre), '');
    v_codigo TEXT := NULLIF(BTRIM(p_codigo), '');
    v_id TEXT := NULLIF(BTRIM(p_id), '');
    v_old JSONB;
    v_new JSONB;
    v_id_plan INTEGER;
BEGIN
    IF p_tipo IS NULL OR p_accion IS NULL
       OR p_tipo NOT IN ('tipos_plan', 'tipos_hospedaje', 'categorias_artesania', 'servicios_hospedaje', 'clases_transporte')
       OR p_accion NOT IN ('create', 'update', 'toggle') THEN
        RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'status', 400, 'error', 'Tipo o acción de catálogo no válidos.');
    END IF;

    PERFORM PG_ADVISORY_XACT_LOCK(HASHTEXT('tourismeasy_catalogos'));

    IF p_accion <> 'toggle' AND (v_nombre IS NULL OR CHAR_LENGTH(v_nombre) < 2) THEN
        RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'status', 422, 'error', 'El nombre debe tener al menos 2 caracteres.');
    END IF;
    IF p_accion = 'toggle' AND p_activo IS NULL THEN
        RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'status', 422, 'error', 'El estado del catálogo no es válido.');
    END IF;

    IF p_tipo = 'tipos_plan' THEN
        IF p_accion <> 'toggle' AND CHAR_LENGTH(v_nombre) NOT BETWEEN 3 AND 28 THEN
            RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'status', 422, 'error', 'El tipo de plan debe tener entre 3 y 28 caracteres.');
        END IF;
        IF p_accion = 'create' THEN
            IF EXISTS (SELECT 1 FROM TIPOS_DE_PLAN_TURISTICO WHERE LOWER(NOM_TIPO_PLAN) = LOWER(v_nombre)) THEN
                RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'status', 409, 'error', 'Ya existe un tipo de plan con ese nombre.');
            END IF;
            SELECT COALESCE(MAX(ID_TIPO_PLAN), 0) + 1 INTO v_id_plan FROM TIPOS_DE_PLAN_TURISTICO;
            IF v_id_plan > 99 THEN
                RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'status', 409, 'error', 'Se alcanzó el límite de tipos de plan.');
            END IF;
            INSERT INTO TIPOS_DE_PLAN_TURISTICO (ID_TIPO_PLAN, NOM_TIPO_PLAN)
            VALUES (v_id_plan, v_nombre);
            v_id := v_id_plan::TEXT;
        ELSE
            IF v_id IS NULL OR v_id !~ '^[0-9]{1,2}$' THEN
                RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'status', 422, 'error', 'El identificador del tipo de plan no es válido.');
            END IF;
            SELECT JSONB_BUILD_OBJECT('id', ID_TIPO_PLAN::TEXT, 'nombre', NOM_TIPO_PLAN, 'activo', ACTIVO)
            INTO v_old FROM TIPOS_DE_PLAN_TURISTICO WHERE ID_TIPO_PLAN = v_id::INTEGER;
            IF NOT FOUND THEN
                RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'status', 404, 'error', 'No se encontró el tipo de plan.');
            END IF;
            IF p_accion = 'update' THEN
                IF EXISTS (SELECT 1 FROM TIPOS_DE_PLAN_TURISTICO WHERE LOWER(NOM_TIPO_PLAN) = LOWER(v_nombre) AND ID_TIPO_PLAN <> v_id::INTEGER) THEN
                    RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'status', 409, 'error', 'Ya existe un tipo de plan con ese nombre.');
                END IF;
                UPDATE TIPOS_DE_PLAN_TURISTICO SET NOM_TIPO_PLAN = v_nombre WHERE ID_TIPO_PLAN = v_id::INTEGER;
            ELSE
                UPDATE TIPOS_DE_PLAN_TURISTICO SET ACTIVO = p_activo WHERE ID_TIPO_PLAN = v_id::INTEGER;
            END IF;
        END IF;
        SELECT JSONB_BUILD_OBJECT('id', ID_TIPO_PLAN::TEXT, 'nombre', NOM_TIPO_PLAN, 'activo', ACTIVO)
        INTO v_new FROM TIPOS_DE_PLAN_TURISTICO WHERE ID_TIPO_PLAN = v_id::INTEGER;

    ELSIF p_tipo = 'tipos_hospedaje' THEN
        IF p_accion <> 'toggle' AND CHAR_LENGTH(v_nombre) NOT BETWEEN 2 AND 30 THEN
            RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'status', 422, 'error', 'El tipo de hospedaje debe tener entre 2 y 30 caracteres.');
        END IF;
        IF p_accion = 'create' THEN
            IF EXISTS (SELECT 1 FROM TIPOS_HOSPEDAJE WHERE LOWER(TIPO_HOSPEDAJE) = LOWER(v_nombre)) THEN
                RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'status', 409, 'error', 'Ya existe ese tipo de hospedaje.');
            END IF;
            INSERT INTO TIPOS_HOSPEDAJE (TIPO_HOSPEDAJE) VALUES (v_nombre);
            v_id := v_nombre;
        ELSE
            SELECT JSONB_BUILD_OBJECT('id', TIPO_HOSPEDAJE, 'nombre', TIPO_HOSPEDAJE, 'activo', ACTIVO)
            INTO v_old FROM TIPOS_HOSPEDAJE WHERE TIPO_HOSPEDAJE = v_id;
            IF NOT FOUND THEN
                RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'status', 404, 'error', 'No se encontró el tipo de hospedaje.');
            END IF;
            IF p_accion = 'update' THEN
                IF EXISTS (SELECT 1 FROM TIPOS_HOSPEDAJE WHERE LOWER(TIPO_HOSPEDAJE) = LOWER(v_nombre) AND TIPO_HOSPEDAJE <> v_id) THEN
                    RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'status', 409, 'error', 'Ya existe ese tipo de hospedaje.');
                END IF;
                UPDATE TIPOS_HOSPEDAJE SET TIPO_HOSPEDAJE = v_nombre WHERE TIPO_HOSPEDAJE = v_id;
                v_id := v_nombre;
            ELSE
                UPDATE TIPOS_HOSPEDAJE SET ACTIVO = p_activo WHERE TIPO_HOSPEDAJE = v_id;
            END IF;
        END IF;
        SELECT JSONB_BUILD_OBJECT('id', TIPO_HOSPEDAJE, 'nombre', TIPO_HOSPEDAJE, 'activo', ACTIVO)
        INTO v_new FROM TIPOS_HOSPEDAJE WHERE TIPO_HOSPEDAJE = v_id;

    ELSIF p_tipo = 'categorias_artesania' THEN
        IF p_accion <> 'toggle' AND CHAR_LENGTH(v_nombre) NOT BETWEEN 2 AND 50 THEN
            RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'status', 422, 'error', 'La categoría debe tener entre 2 y 50 caracteres.');
        END IF;
        IF p_accion = 'create' THEN
            v_codigo := LOWER(v_nombre);
            v_codigo := TRANSLATE(v_codigo, 'áéíóúüñ', 'aeiouun');
            v_codigo := BTRIM(REGEXP_REPLACE(v_codigo, '[^a-z0-9]+', '_', 'g'), '_');
            v_codigo := RTRIM(LEFT(v_codigo, 20), '_');
            IF CHAR_LENGTH(v_codigo) < 2 THEN
                RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'status', 422, 'error', 'No se pudo generar un código válido desde el nombre de la categoría.');
            END IF;
            IF EXISTS (SELECT 1 FROM CATEGORIAS_ARTESANIA WHERE CODIGO = v_codigo) THEN
                RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'status', 409, 'error', 'El nombre genera un código que ya está en uso. Prueba con un nombre más específico.');
            END IF;
            IF EXISTS (SELECT 1 FROM CATEGORIAS_ARTESANIA WHERE LOWER(NOMBRE_CATEGORIA) = LOWER(v_nombre)) THEN
                RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'status', 409, 'error', 'Ya existe una categoría con ese nombre.');
            END IF;
            INSERT INTO CATEGORIAS_ARTESANIA (CODIGO, NOMBRE_CATEGORIA) VALUES (v_codigo, v_nombre);
            v_id := v_codigo;
        ELSE
            SELECT JSONB_BUILD_OBJECT('id', CODIGO, 'codigo', CODIGO, 'nombre', NOMBRE_CATEGORIA, 'activo', ACTIVO)
            INTO v_old FROM CATEGORIAS_ARTESANIA WHERE CODIGO = v_id;
            IF NOT FOUND THEN
                RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'status', 404, 'error', 'No se encontró la categoría artesanal.');
            END IF;
            IF p_accion = 'update' THEN
                IF EXISTS (SELECT 1 FROM CATEGORIAS_ARTESANIA WHERE LOWER(NOMBRE_CATEGORIA) = LOWER(v_nombre) AND CODIGO <> v_id) THEN
                    RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'status', 409, 'error', 'Ya existe una categoría con ese nombre.');
                END IF;
                UPDATE CATEGORIAS_ARTESANIA SET NOMBRE_CATEGORIA = v_nombre WHERE CODIGO = v_id;
            ELSE
                UPDATE CATEGORIAS_ARTESANIA SET ACTIVO = p_activo WHERE CODIGO = v_id;
            END IF;
        END IF;
        SELECT JSONB_BUILD_OBJECT('id', CODIGO, 'codigo', CODIGO, 'nombre', NOMBRE_CATEGORIA, 'activo', ACTIVO)
        INTO v_new FROM CATEGORIAS_ARTESANIA WHERE CODIGO = v_id;

    ELSIF p_tipo = 'servicios_hospedaje' THEN
        IF p_accion <> 'toggle' AND CHAR_LENGTH(v_nombre) NOT BETWEEN 3 AND 100 THEN
            RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'status', 422, 'error', 'El servicio debe tener entre 3 y 100 caracteres.');
        END IF;
        IF p_accion = 'create' THEN
            IF EXISTS (SELECT 1 FROM SERVICIOS_HOSPEDAJE WHERE LOWER(NOMBRE_SERVICIO) = LOWER(v_nombre)) THEN
                RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'status', 409, 'error', 'Ya existe ese servicio de hospedaje.');
            END IF;
            INSERT INTO SERVICIOS_HOSPEDAJE (NOMBRE_SERVICIO) VALUES (v_nombre) RETURNING ID_SERVICIO::TEXT INTO v_id;
        ELSE
            IF v_id IS NULL OR v_id !~ '^[0-9]+$' THEN
                RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'status', 422, 'error', 'El identificador del servicio no es válido.');
            END IF;
            SELECT JSONB_BUILD_OBJECT('id', ID_SERVICIO::TEXT, 'nombre', NOMBRE_SERVICIO, 'activo', ACTIVO)
            INTO v_old FROM SERVICIOS_HOSPEDAJE WHERE ID_SERVICIO = v_id::NUMERIC;
            IF NOT FOUND THEN
                RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'status', 404, 'error', 'No se encontró el servicio de hospedaje.');
            END IF;
            IF p_accion = 'update' THEN
                IF EXISTS (SELECT 1 FROM SERVICIOS_HOSPEDAJE WHERE LOWER(NOMBRE_SERVICIO) = LOWER(v_nombre) AND ID_SERVICIO <> v_id::NUMERIC) THEN
                    RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'status', 409, 'error', 'Ya existe ese servicio de hospedaje.');
                END IF;
                UPDATE SERVICIOS_HOSPEDAJE SET NOMBRE_SERVICIO = v_nombre WHERE ID_SERVICIO = v_id::NUMERIC;
            ELSE
                UPDATE SERVICIOS_HOSPEDAJE SET ACTIVO = p_activo WHERE ID_SERVICIO = v_id::NUMERIC;
            END IF;
        END IF;
        SELECT JSONB_BUILD_OBJECT('id', ID_SERVICIO::TEXT, 'nombre', NOMBRE_SERVICIO, 'activo', ACTIVO)
        INTO v_new FROM SERVICIOS_HOSPEDAJE WHERE ID_SERVICIO = v_id::NUMERIC;

    ELSE
        IF p_accion <> 'toggle' AND CHAR_LENGTH(v_nombre) NOT BETWEEN 2 AND 100 THEN
            RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'status', 422, 'error', 'La clase debe tener entre 2 y 100 caracteres.');
        END IF;
        IF p_accion = 'create' THEN
            IF EXISTS (SELECT 1 FROM CLASE_SERVICIO_TRANSPORTE WHERE LOWER(NOMBRE_CLASE) = LOWER(v_nombre)) THEN
                RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'status', 409, 'error', 'Ya existe esa clase de transporte.');
            END IF;
            INSERT INTO CLASE_SERVICIO_TRANSPORTE (NOMBRE_CLASE) VALUES (v_nombre) RETURNING ID_CLASE::TEXT INTO v_id;
        ELSE
            IF v_id IS NULL OR v_id !~ '^[0-9]+$' THEN
                RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'status', 422, 'error', 'El identificador de la clase no es válido.');
            END IF;
            SELECT JSONB_BUILD_OBJECT('id', ID_CLASE::TEXT, 'nombre', NOMBRE_CLASE, 'activo', ACTIVO)
            INTO v_old FROM CLASE_SERVICIO_TRANSPORTE WHERE ID_CLASE = v_id::NUMERIC;
            IF NOT FOUND THEN
                RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'status', 404, 'error', 'No se encontró la clase de transporte.');
            END IF;
            IF p_accion = 'update' THEN
                IF EXISTS (SELECT 1 FROM CLASE_SERVICIO_TRANSPORTE WHERE LOWER(NOMBRE_CLASE) = LOWER(v_nombre) AND ID_CLASE <> v_id::NUMERIC) THEN
                    RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'status', 409, 'error', 'Ya existe esa clase de transporte.');
                END IF;
                UPDATE CLASE_SERVICIO_TRANSPORTE SET NOMBRE_CLASE = v_nombre WHERE ID_CLASE = v_id::NUMERIC;
            ELSE
                UPDATE CLASE_SERVICIO_TRANSPORTE SET ACTIVO = p_activo WHERE ID_CLASE = v_id::NUMERIC;
            END IF;
        END IF;
        SELECT JSONB_BUILD_OBJECT('id', ID_CLASE::TEXT, 'nombre', NOMBRE_CLASE, 'activo', ACTIVO)
        INTO v_new FROM CLASE_SERVICIO_TRANSPORTE WHERE ID_CLASE = v_id::NUMERIC;
    END IF;

    PERFORM fn_registrar_auditoria(
        p_id_admin,
        CASE p_accion WHEN 'create' THEN 'Crear catálogo' WHEN 'update' THEN 'Editar catálogo' ELSE 'Cambiar estado de catálogo' END,
        'Catálogos',
        'AUDIT_JSON:' || JSONB_BUILD_OBJECT(
            'detalle', p_tipo || ': ' || COALESCE(v_new->>'nombre', v_id),
            'reg_anterior', v_old,
            'reg_nuevo', v_new
        )::TEXT,
        'info'
    );
    RETURN JSONB_BUILD_OBJECT('ok', TRUE, 'data', v_new);
EXCEPTION
    WHEN UNIQUE_VIOLATION THEN
        RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'status', 409, 'error', 'Ya existe un elemento con esos datos.');
    WHEN FOREIGN_KEY_VIOLATION THEN
        RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'status', 422, 'error', 'El catálogo está asociado a datos existentes y no se puede actualizar.');
    WHEN CHECK_VIOLATION THEN
        RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'status', 422, 'error', 'El valor no cumple las reglas del catálogo.');
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_guardar_catalogo: %', SQLERRM;
        RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'status', 500, 'error', 'No se pudo guardar el catálogo.');
END;
$$
LANGUAGE plpgsql;
