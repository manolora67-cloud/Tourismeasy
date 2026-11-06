CREATE OR REPLACE FUNCTION fn_inicializar_contenido_portada(
    p_destinos JSONB,
    p_articulos JSONB,
    p_id_admin USUARIOS.ID_PERSONA%TYPE
)
RETURNS CONTENIDO_PORTADA.PUBLICADO%TYPE AS
$$
DECLARE
    v_destino RECORD;
    v_articulo JSONB;
    v_registro JSONB;
    v_clave CONTENIDO_PORTADA.CLAVE%TYPE;
    v_orden CONTENIDO_PORTADA.ORDEN%TYPE := 0;
    v_cargado ESTADO_INICIAL_PORTADA.DEFAULTS_CARGADOS%TYPE;
BEGIN
    IF JSONB_TYPEOF(p_destinos) <> 'array' OR JSONB_TYPEOF(p_articulos) <> 'array' THEN
        RETURN FALSE;
    END IF;

    v_cargado := fn_estado_inicial_portada(TRUE);
    IF v_cargado IS NULL THEN
        RETURN FALSE;
    END IF;
    IF v_cargado THEN
        RETURN TRUE;
    END IF;

    FOR v_destino IN SELECT item FROM JSONB_ARRAY_ELEMENTS(p_destinos) AS d(item) LOOP
        v_orden := v_orden + 1;
        v_clave := v_destino.item->>'key';
        SELECT a.item INTO v_articulo
        FROM JSONB_ARRAY_ELEMENTS(p_articulos) AS a(item)
        WHERE a.item->>'key' = v_clave
        LIMIT 1;

        v_registro := v_destino.item || JSONB_BUILD_OBJECT(
            'orden', v_orden,
            'publicado', TRUE,
            'article', COALESCE(v_articulo, '{}'::JSONB)
        );

        IF NOT fn_guardar_contenido_portada(v_registro, p_id_admin, FALSE) THEN
            RETURN FALSE;
        END IF;
    END LOOP;

    IF NOT fn_marcar_portada_inicializada() THEN
        RETURN FALSE;
    END IF;
    RETURN TRUE;
EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN
        RAISE NOTICE 'fn_inicializar_contenido_portada - FK inválida: %', SQLERRM;
        RETURN FALSE;
    WHEN CHECK_VIOLATION THEN
        RAISE NOTICE 'fn_inicializar_contenido_portada - Check violado: %', SQLERRM;
        RETURN FALSE;
    WHEN LOCK_NOT_AVAILABLE THEN
        RAISE NOTICE 'fn_inicializar_contenido_portada - Fila bloqueada: %', SQLERRM;
        RETURN FALSE;
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_inicializar_contenido_portada: %', SQLERRM;
        RETURN FALSE;
END;
$$
LANGUAGE plpgsql;
