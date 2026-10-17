CREATE OR REPLACE FUNCTION fn_guardar_contenido_portada(
    p_destino JSONB,
    p_id_admin CONTENIDO_PORTADA.MODIFICADO_POR%TYPE,
    p_auditar CONTENIDO_PORTADA.PUBLICADO%TYPE DEFAULT TRUE
)
RETURNS CONTENIDO_PORTADA.PUBLICADO%TYPE AS
$$
DECLARE
    v_clave CONTENIDO_PORTADA.CLAVE%TYPE;
    v_imagen CONTENIDO_PORTADA.IMAGEN%TYPE;
    v_alt CONTENIDO_PORTADA.TEXTO_ALT%TYPE;
    v_insignia CONTENIDO_PORTADA.INSIGNIA%TYPE;
    v_titulo CONTENIDO_PORTADA.TITULO%TYPE;
    v_descripcion CONTENIDO_PORTADA.DESCRIPCION%TYPE;
    v_articulo CONTENIDO_PORTADA.ARTICULO%TYPE;
    v_articulo_entrada JSONB;
    v_datos JSONB := '[]'::JSONB;
    v_secciones JSONB := '[]'::JSONB;
    v_item JSONB;
    v_orden CONTENIDO_PORTADA.ORDEN%TYPE;
    v_publicado CONTENIDO_PORTADA.PUBLICADO%TYPE;
    v_video TEXT;
    v_texto TEXT;
    v_titulo_item TEXT;
    v_valor TEXT;
BEGIN
    IF p_destino IS NULL OR JSONB_TYPEOF(p_destino) <> 'object' THEN
        RETURN FALSE;
    END IF;

    v_clave := LOWER(BTRIM(p_destino->>'key'));
    v_imagen := BTRIM(p_destino->>'img');
    v_alt := BTRIM(p_destino->>'alt');
    v_insignia := NULLIF(BTRIM(p_destino->>'badge'), '');
    v_titulo := BTRIM(p_destino->>'titulo');
    v_descripcion := BTRIM(p_destino->>'desc');

     IF v_clave IS NULL OR v_clave !~ '^[a-z0-9-]{2,50}$'
         OR v_titulo IS NULL OR v_titulo = '' OR LENGTH(v_titulo) > 150
         OR v_imagen IS NULL OR v_imagen = ''
         OR v_alt IS NULL OR v_alt = '' OR LENGTH(v_alt) > 200
         OR v_descripcion IS NULL OR v_descripcion = '' OR LENGTH(v_descripcion) > 3000
       OR LENGTH(COALESCE(v_insignia, '')) > 80 THEN
        RETURN FALSE;
    END IF;

    IF NOT (v_imagen ~* '^https://[^[:space:]]+$'
        OR v_imagen ~ '^(img|audio-video)/[^[:cntrl:]<>''?#]+$') THEN
        RETURN FALSE;
    END IF;

    v_articulo_entrada := COALESCE(p_destino->'article', '{}'::JSONB);
    IF JSONB_TYPEOF(v_articulo_entrada) <> 'object' THEN
        RETURN FALSE;
    END IF;

    v_video := COALESCE(NULLIF(BTRIM(v_articulo_entrada->>'video'), ''), '');
    IF v_video <> '' AND NOT (v_video ~* '^https://[^[:space:]]+$'
        OR v_video ~ '^(img|audio-video)/[^[:cntrl:]<>''?#]+$') THEN
        RETURN FALSE;
    END IF;

    v_titulo_item := COALESCE(NULLIF(BTRIM(v_articulo_entrada->>'titulo'), ''), v_titulo);
    v_texto := COALESCE(BTRIM(v_articulo_entrada->>'subtitulo'), '');
    IF LENGTH(v_titulo_item) > 150 OR LENGTH(v_texto) > 250
       OR LENGTH(COALESCE(v_articulo_entrada->>'badge', '')) > 80
       OR LENGTH(COALESCE(v_articulo_entrada->>'intro', '')) > 8000
       OR LENGTH(COALESCE(v_articulo_entrada->>'ctaTexto', '')) > 250 THEN
        RETURN FALSE;
    END IF;

    IF v_articulo_entrada ? 'datos' AND JSONB_TYPEOF(v_articulo_entrada->'datos') <> 'array' THEN
        RETURN FALSE;
    END IF;
    IF JSONB_ARRAY_LENGTH(COALESCE(v_articulo_entrada->'datos', '[]'::JSONB)) > 12 THEN
        RETURN FALSE;
    END IF;
    FOR v_item IN SELECT VALUE FROM JSONB_ARRAY_ELEMENTS(COALESCE(v_articulo_entrada->'datos', '[]'::JSONB)) LOOP
        v_texto := BTRIM(v_item->>'label');
        v_valor := BTRIM(v_item->>'val');
        IF JSONB_TYPEOF(v_item) <> 'object' OR v_texto IS NULL OR v_texto = ''
           OR v_valor IS NULL OR v_valor = '' OR LENGTH(v_texto) > 100 OR LENGTH(v_valor) > 200 THEN
            RETURN FALSE;
        END IF;
        v_datos := v_datos || JSONB_BUILD_ARRAY(JSONB_BUILD_OBJECT('label', v_texto, 'val', v_valor));
    END LOOP;

    IF v_articulo_entrada ? 'secciones' AND JSONB_TYPEOF(v_articulo_entrada->'secciones') <> 'array' THEN
        RETURN FALSE;
    END IF;
    IF JSONB_ARRAY_LENGTH(COALESCE(v_articulo_entrada->'secciones', '[]'::JSONB)) > 20 THEN
        RETURN FALSE;
    END IF;
    FOR v_item IN SELECT VALUE FROM JSONB_ARRAY_ELEMENTS(COALESCE(v_articulo_entrada->'secciones', '[]'::JSONB)) LOOP
        v_titulo_item := BTRIM(v_item->>'titulo');
        v_texto := BTRIM(v_item->>'texto');
        IF JSONB_TYPEOF(v_item) <> 'object' OR v_titulo_item IS NULL OR v_titulo_item = ''
           OR v_texto IS NULL OR v_texto = '' OR LENGTH(v_titulo_item) > 150 OR LENGTH(v_texto) > 5000 THEN
            RETURN FALSE;
        END IF;
        v_secciones := v_secciones || JSONB_BUILD_ARRAY(JSONB_BUILD_OBJECT('titulo', v_titulo_item, 'texto', v_texto));
    END LOOP;

    v_articulo := JSONB_BUILD_OBJECT(
        'video', v_video,
        'badge', COALESCE(NULLIF(BTRIM(v_articulo_entrada->>'badge'), ''), ''),
        'titulo', COALESCE(NULLIF(BTRIM(v_articulo_entrada->>'titulo'), ''), v_titulo),
        'subtitulo', COALESCE(BTRIM(v_articulo_entrada->>'subtitulo'), ''),
        'datos', v_datos,
        'intro', COALESCE(BTRIM(v_articulo_entrada->>'intro'), ''),
        'secciones', v_secciones,
        'ctaTexto', COALESCE(BTRIM(v_articulo_entrada->>'ctaTexto'), '')
    );
    v_orden := GREATEST(0, LEAST(9999, COALESCE((p_destino->>'orden')::INTEGER, 0)));
    v_publicado := COALESCE((p_destino->>'publicado')::BOOLEAN, TRUE);

    INSERT INTO CONTENIDO_PORTADA (
        CLAVE, IMAGEN, TEXTO_ALT, INSIGNIA, TITULO, DESCRIPCION,
        ARTICULO, ORDEN, PUBLICADO, MODIFICADO_POR, FECHA_ACTUALIZACION
    ) VALUES (
        v_clave, v_imagen, v_alt, v_insignia, v_titulo, v_descripcion,
        v_articulo, v_orden, v_publicado, p_id_admin, NOW()
    )
    ON CONFLICT (CLAVE) DO UPDATE SET
        IMAGEN = EXCLUDED.IMAGEN,
        TEXTO_ALT = EXCLUDED.TEXTO_ALT,
        INSIGNIA = EXCLUDED.INSIGNIA,
        TITULO = EXCLUDED.TITULO,
        DESCRIPCION = EXCLUDED.DESCRIPCION,
        ARTICULO = EXCLUDED.ARTICULO,
        ORDEN = EXCLUDED.ORDEN,
        PUBLICADO = EXCLUDED.PUBLICADO,
        MODIFICADO_POR = EXCLUDED.MODIFICADO_POR,
        FECHA_ACTUALIZACION = NOW();

    IF p_auditar THEN
        PERFORM fn_registrar_auditoria(
            p_id_admin,
            'Guardar destino',
            'Contenido portada',
            'Se guardó el destino de portada ' || v_clave,
            'info'
        );
    END IF;
    RETURN TRUE;
EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN
        RAISE NOTICE 'fn_guardar_contenido_portada - FK inválida: %', SQLERRM;
        RETURN FALSE;
    WHEN CHECK_VIOLATION THEN
        RAISE NOTICE 'fn_guardar_contenido_portada - Check violado: %', SQLERRM;
        RETURN FALSE;
    WHEN LOCK_NOT_AVAILABLE THEN
        RAISE NOTICE 'fn_guardar_contenido_portada - Fila bloqueada: %', SQLERRM;
        RETURN FALSE;
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_guardar_contenido_portada: %', SQLERRM;
        RETURN FALSE;
END;
$$
LANGUAGE plpgsql;
