CREATE OR REPLACE FUNCTION fn_actualizar_coordenadas_municipio(
    p_id_ciudad CIUDADES.ID_CIUDAD%TYPE,
    p_latitud CIUDADES.LATITUD%TYPE,
    p_longitud CIUDADES.LONGITUD%TYPE,
    p_id_admin USUARIOS.ID_PERSONA%TYPE
)
RETURNS BOOLEAN AS
$$
DECLARE
    v_nombre CIUDADES.NOM_CIUDAD%TYPE;
    v_latitud_anterior CIUDADES.LATITUD%TYPE;
    v_longitud_anterior CIUDADES.LONGITUD%TYPE;
BEGIN
    IF p_id_ciudad IS NULL
       OR p_id_ciudad !~ '^68[0-9]{3,4}$'
       OR p_latitud IS NULL
       OR p_longitud IS NULL
       OR p_latitud NOT BETWEEN 5.5 AND 8.5
       OR p_longitud NOT BETWEEN -74.5 AND -72 THEN
        RETURN FALSE;
    END IF;

    SELECT NOM_CIUDAD, LATITUD, LONGITUD
    INTO v_nombre, v_latitud_anterior, v_longitud_anterior
    FROM CIUDADES
    WHERE ID_CIUDAD = p_id_ciudad
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    IF v_latitud_anterior IS NOT DISTINCT FROM p_latitud
       AND v_longitud_anterior IS NOT DISTINCT FROM p_longitud THEN
        RETURN TRUE;
    END IF;

    UPDATE CIUDADES
    SET LATITUD = p_latitud,
        LONGITUD = p_longitud
    WHERE ID_CIUDAD = p_id_ciudad;

    PERFORM fn_registrar_auditoria(
        p_id_admin,
        'Actualizar ubicación de municipio',
        'Contenido portada',
        'AUDIT_JSON:' || JSONB_BUILD_OBJECT(
            'detalle', 'Se actualizó la ubicación de ' || v_nombre || '.',
            'reg_anterior', JSONB_BUILD_OBJECT(
                'id_ciudad', p_id_ciudad,
                'latitud', v_latitud_anterior,
                'longitud', v_longitud_anterior
            ),
            'reg_nuevo', JSONB_BUILD_OBJECT(
                'id_ciudad', p_id_ciudad,
                'latitud', p_latitud,
                'longitud', p_longitud
            )
        )::TEXT,
        'info'
    );

    RETURN TRUE;
EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN
        RAISE NOTICE 'fn_actualizar_coordenadas_municipio - FK inválida: %', SQLERRM;
        RETURN FALSE;
    WHEN CHECK_VIOLATION THEN
        RAISE NOTICE 'fn_actualizar_coordenadas_municipio - Coordenadas inválidas: %', SQLERRM;
        RETURN FALSE;
    WHEN LOCK_NOT_AVAILABLE THEN
        RAISE NOTICE 'fn_actualizar_coordenadas_municipio - Fila bloqueada: %', SQLERRM;
        RETURN FALSE;
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_actualizar_coordenadas_municipio: %', SQLERRM;
        RETURN FALSE;
END;
$$
LANGUAGE plpgsql;
