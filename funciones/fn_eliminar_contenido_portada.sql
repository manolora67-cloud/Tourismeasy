CREATE OR REPLACE FUNCTION fn_eliminar_contenido_portada(
    p_clave    CONTENIDO_PORTADA.CLAVE%TYPE,
    p_id_admin CONTENIDO_PORTADA.MODIFICADO_POR%TYPE
)
RETURNS CONTENIDO_PORTADA.PUBLICADO%TYPE AS
$$
DECLARE
    v_eliminado CONTENIDO_PORTADA.PUBLICADO%TYPE := FALSE;
BEGIN
    DELETE FROM CONTENIDO_PORTADA WHERE CLAVE = p_clave;
    v_eliminado := FOUND;

    IF v_eliminado THEN
        PERFORM fn_registrar_auditoria(
            p_id_admin,
            'Eliminar destino',
            'Contenido portada',
            'Se eliminó el destino de portada ' || p_clave,
            'info'
        );
    END IF;

    RETURN v_eliminado;
EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN
        RAISE NOTICE 'fn_eliminar_contenido_portada - FK inválida: %', SQLERRM;
        RETURN FALSE;
    WHEN CHECK_VIOLATION THEN
        RAISE NOTICE 'fn_eliminar_contenido_portada - Check violado: %', SQLERRM;
        RETURN FALSE;
    WHEN LOCK_NOT_AVAILABLE THEN
        RAISE NOTICE 'fn_eliminar_contenido_portada - Fila bloqueada: %', SQLERRM;
        RETURN FALSE;
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_eliminar_contenido_portada: %', SQLERRM;
        RETURN FALSE;
END;
$$
LANGUAGE plpgsql;
