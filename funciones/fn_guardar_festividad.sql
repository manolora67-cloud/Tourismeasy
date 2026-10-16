CREATE OR REPLACE FUNCTION fn_guardar_festividad(
    p_accion VARCHAR,
    p_id_actual FESTIVIDADES_SANTANDER.ID_FESTIVIDAD%TYPE,
    p_festividad JSONB,
    p_id_admin USUARIOS.ID_PERSONA%TYPE
)
RETURNS JSONB AS
$$
DECLARE
    v_id FESTIVIDADES_SANTANDER.ID_FESTIVIDAD%TYPE;
    v_fecha FESTIVIDADES_SANTANDER.FECHA_CLAVE%TYPE;
    v_subtitulo FESTIVIDADES_SANTANDER.SUBTITULO%TYPE;
    v_titulo FESTIVIDADES_SANTANDER.TITULO%TYPE;
    v_frase FESTIVIDADES_SANTANDER.FRASE%TYPE;
    v_emoji FESTIVIDADES_SANTANDER.EMOJI%TYPE;
    v_color_1 FESTIVIDADES_SANTANDER.COLOR_1%TYPE;
    v_color_2 FESTIVIDADES_SANTANDER.COLOR_2%TYPE;
    v_color_3 FESTIVIDADES_SANTANDER.COLOR_3%TYPE;
    v_bg_card FESTIVIDADES_SANTANDER.BG_CARD%TYPE;
    v_tipo FESTIVIDADES_SANTANDER.TIPO%TYPE;
    v_id_ciudad FESTIVIDADES_SANTANDER.ID_CIUDAD%TYPE;
BEGIN
    IF p_accion IS NULL OR p_accion NOT IN ('create', 'update')
       OR p_festividad IS NULL OR JSONB_TYPEOF(p_festividad) <> 'object' THEN
        RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'status', 400, 'error', 'Acción o datos de festividad no válidos.');
    END IF;

    v_id := LOWER(BTRIM(p_festividad->>'id'));
    v_fecha := BTRIM(p_festividad->>'fecha_clave');
    v_subtitulo := BTRIM(p_festividad->>'subtitulo');
    v_titulo := BTRIM(p_festividad->>'titulo');
    v_frase := BTRIM(p_festividad->>'frase');
    v_emoji := BTRIM(p_festividad->>'emoji');
    v_color_1 := UPPER(BTRIM(p_festividad->>'color_1'));
    v_color_2 := UPPER(BTRIM(p_festividad->>'color_2'));
    v_color_3 := UPPER(BTRIM(p_festividad->>'color_3'));
    v_bg_card := UPPER(BTRIM(p_festividad->>'bg_card'));
    v_tipo := UPPER(BTRIM(p_festividad->>'tipo'));
    v_id_ciudad := NULLIF(BTRIM(p_festividad->>'id_ciudad'), '');

    IF v_id IS NULL OR v_id !~ '^[a-z0-9_-]{3,40}$'
       OR v_subtitulo IS NULL OR CHAR_LENGTH(v_subtitulo) NOT BETWEEN 3 AND 80
       OR v_titulo IS NULL OR CHAR_LENGTH(v_titulo) NOT BETWEEN 3 AND 120
       OR v_frase IS NULL OR CHAR_LENGTH(v_frase) NOT BETWEEN 5 AND 200
       OR v_emoji IS NULL OR CHAR_LENGTH(v_emoji) NOT BETWEEN 1 AND 10
       OR v_tipo IS NULL OR v_tipo NOT IN ('REGIONAL', 'NACIONAL')
       OR v_color_1 IS NULL OR v_color_1 !~ '^#[0-9A-F]{6}$'
       OR v_color_2 IS NULL OR v_color_2 !~ '^#[0-9A-F]{6}$'
       OR v_color_3 IS NULL OR v_color_3 !~ '^#[0-9A-F]{6}$'
       OR v_bg_card IS NULL OR v_bg_card !~ '^#[0-9A-F]{6}$' THEN
        RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'status', 422, 'error', 'Revisa los campos y límites de longitud de la festividad.');
    END IF;

    IF v_fecha IS NULL OR v_fecha !~ '^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$' THEN
        RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'status', 422, 'error', 'La fecha debe tener el formato MM-DD.');
    END IF;
    BEGIN
        PERFORM MAKE_DATE(2000, SUBSTRING(v_fecha FROM 1 FOR 2)::INTEGER, SUBSTRING(v_fecha FROM 4 FOR 2)::INTEGER);
    EXCEPTION WHEN DATETIME_FIELD_OVERFLOW THEN
        RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'status', 422, 'error', 'La fecha no es válida.');
    END;

    IF v_id_ciudad IS NOT NULL THEN
        IF v_id_ciudad !~ '^[0-9]{5,6}$' OR NOT EXISTS (
            SELECT 1 FROM CIUDADES c WHERE c.ID_CIUDAD = v_id_ciudad
        ) THEN
            RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'status', 422, 'error', 'El código de ciudad no existe o no es válido.');
        END IF;
    END IF;

    IF p_accion = 'update' THEN
        IF p_id_actual IS NULL OR p_id_actual !~ '^[a-z0-9_-]{3,40}$' OR p_id_actual <> v_id THEN
            RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'status', 422, 'error', 'No se puede cambiar el identificador de una festividad existente.');
        END IF;
        IF NOT EXISTS (
            SELECT 1 FROM FESTIVIDADES_SANTANDER f WHERE f.ID_FESTIVIDAD = p_id_actual
        ) THEN
            RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'status', 404, 'error', 'No se encontró esa festividad.');
        END IF;
    END IF;

    IF EXISTS (
        SELECT 1 FROM FESTIVIDADES_SANTANDER f
        WHERE f.FECHA_CLAVE = v_fecha AND f.ID_FESTIVIDAD <> v_id
    ) THEN
        RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'status', 409, 'error', 'Ya hay una festividad registrada para esa fecha.');
    END IF;

    IF p_accion = 'create' THEN
        INSERT INTO FESTIVIDADES_SANTANDER (
            ID_FESTIVIDAD, FECHA_CLAVE, SUBTITULO, TITULO, FRASE, EMOJI,
            COLOR_1, COLOR_2, COLOR_3, BG_CARD, TIPO, ID_CIUDAD
        ) VALUES (
            v_id, v_fecha, v_subtitulo, v_titulo, v_frase, v_emoji,
            v_color_1, v_color_2, v_color_3, v_bg_card, v_tipo, v_id_ciudad
        );
    ELSE
        UPDATE FESTIVIDADES_SANTANDER
        SET FECHA_CLAVE = v_fecha, SUBTITULO = v_subtitulo, TITULO = v_titulo,
            FRASE = v_frase, EMOJI = v_emoji, COLOR_1 = v_color_1,
            COLOR_2 = v_color_2, COLOR_3 = v_color_3, BG_CARD = v_bg_card,
            TIPO = v_tipo, ID_CIUDAD = v_id_ciudad
        WHERE ID_FESTIVIDAD = p_id_actual;
    END IF;

    PERFORM fn_registrar_auditoria(
        p_id_admin,
        CASE WHEN p_accion = 'create' THEN 'Crear festividad' ELSE 'Editar festividad' END,
        'Festividades',
        v_titulo || ' (' || v_fecha || ')',
        'info'
    );
    RETURN JSONB_BUILD_OBJECT('ok', TRUE);
EXCEPTION
    WHEN UNIQUE_VIOLATION THEN
        RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'status', 409, 'error', 'Ya existe una festividad con ese identificador o fecha.');
    WHEN FOREIGN_KEY_VIOLATION THEN
        RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'status', 422, 'error', 'La ciudad asociada no existe.');
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_guardar_festividad: %', SQLERRM;
        RETURN JSONB_BUILD_OBJECT('ok', FALSE, 'status', 500, 'error', 'No se pudo guardar la festividad.');
END;
$$
LANGUAGE plpgsql;
