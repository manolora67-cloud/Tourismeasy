CREATE OR REPLACE FUNCTION fn_limpiar_resenas_mes_anterior()
RETURNS TABLE (
    ok       BOOLEAN,
    borradas INTEGER,
    mensaje  TEXT
) AS
$$
DECLARE
    v_ultima      CONTROL_LIMPIEZA_RESENAS.ULTIMA_LIMPIEZA%TYPE;
    v_mes_actual  DATE := date_trunc('month', CURRENT_DATE);
    v_inicio_prev DATE;
    v_fin_prev    DATE;
    v_borradas    INTEGER := 0;
BEGIN
    SELECT ULTIMA_LIMPIEZA INTO v_ultima FROM CONTROL_LIMPIEZA_RESENAS LIMIT 1;

    -- Si ya se limpió este mes, no hace nada (evita repetir el DELETE
    -- en cada carga de la página)
    IF v_ultima IS NULL OR date_trunc('month', v_ultima) < v_mes_actual THEN
        v_inicio_prev := v_mes_actual - INTERVAL '1 month';
        v_fin_prev    := v_mes_actual; -- exclusivo (ej: del 1 jul al 1 ago)

        -- LIKES_RESENAS tiene ON DELETE CASCADE hacia RESENAS_PLATAFORMA,
        -- así que solo hace falta borrar aquí y los likes se van solos.
        DELETE FROM RESENAS_PLATAFORMA
        WHERE FECHA_CREACION >= v_inicio_prev
          AND FECHA_CREACION < v_fin_prev;

        GET DIAGNOSTICS v_borradas = ROW_COUNT;

        -- Auto-reparable: si no había fila de control (ej. por un
        -- reset de esquema en el servidor compartido), la crea en
        -- vez de depender de que alguien haya corrido el INSERT inicial.
        IF v_ultima IS NULL THEN
            INSERT INTO CONTROL_LIMPIEZA_RESENAS (ULTIMA_LIMPIEZA) VALUES (CURRENT_DATE);
        ELSE
            UPDATE CONTROL_LIMPIEZA_RESENAS SET ULTIMA_LIMPIEZA = CURRENT_DATE;
        END IF;

        RETURN QUERY SELECT TRUE, v_borradas,
            ('Limpieza ejecutada: ' || v_borradas || ' reseña(s) borrada(s).')::TEXT;
    ELSE
        RETURN QUERY SELECT FALSE, 0, 'La limpieza de este mes ya se había ejecutado.'::TEXT;
    END IF;

EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN
        RAISE NOTICE 'fn_limpiar_resenas_mes_anterior - FK inválida: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 0, 'No se pudo completar la limpieza por una restricción de datos.'::TEXT;
    WHEN CHECK_VIOLATION THEN
        RAISE NOTICE 'fn_limpiar_resenas_mes_anterior - Check violado: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 0, 'No se pudo completar la limpieza por un dato inválido.'::TEXT;
    WHEN LOCK_NOT_AVAILABLE THEN
        RAISE NOTICE 'fn_limpiar_resenas_mes_anterior - Fila bloqueada: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 0, 'La tabla está siendo usada, intenta de nuevo.'::TEXT;
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_limpiar_resenas_mes_anterior: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 0, ('Error al limpiar reseñas: ' || SQLERRM)::TEXT;
END;
$$
LANGUAGE plpgsql;