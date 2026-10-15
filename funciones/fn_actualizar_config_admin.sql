CREATE OR REPLACE FUNCTION fn_actualizar_config_admin(
    p_id    USUARIOS.ID_PERSONA%TYPE,
    p_campo VARCHAR,
    p_valor BOOLEAN
)
RETURNS BOOLEAN AS
$$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM USUARIOS WHERE ID_PERSONA = p_id) THEN
        RETURN FALSE;
    END IF;

    IF p_campo NOT IN ('notif_reservas', 'notif_cancelaciones', 'notif_resenas', 'notif_boletin', 'tema_oscuro') THEN
        RETURN FALSE;
    END IF;

    INSERT INTO CONFIG_ADMIN (ID_USUARIO) VALUES (p_id)
    ON CONFLICT (ID_USUARIO) DO NOTHING;

    IF p_campo = 'notif_reservas' THEN
        UPDATE CONFIG_ADMIN SET NOTIF_NUEVAS_RESERVAS = p_valor, FECHA_ACTUALIZACION = NOW() WHERE ID_USUARIO = p_id;
    ELSIF p_campo = 'notif_cancelaciones' THEN
        UPDATE CONFIG_ADMIN SET NOTIF_CANCELACIONES = p_valor, FECHA_ACTUALIZACION = NOW() WHERE ID_USUARIO = p_id;
    ELSIF p_campo = 'notif_resenas' THEN
        UPDATE CONFIG_ADMIN SET NOTIF_NUEVAS_RESENAS = p_valor, FECHA_ACTUALIZACION = NOW() WHERE ID_USUARIO = p_id;
    ELSIF p_campo = 'notif_boletin' THEN
        UPDATE CONFIG_ADMIN SET NOTIF_BOLETIN_MENSUAL = p_valor, FECHA_ACTUALIZACION = NOW() WHERE ID_USUARIO = p_id;
    ELSIF p_campo = 'tema_oscuro' THEN
        UPDATE CONFIG_ADMIN SET TEMA_OSCURO = p_valor, FECHA_ACTUALIZACION = NOW() WHERE ID_USUARIO = p_id;
    END IF;

    RETURN TRUE;

EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN
        RAISE NOTICE 'fn_actualizar_config_admin - FK inválida: %', SQLERRM;
        RETURN FALSE;
    WHEN CHECK_VIOLATION THEN
        RAISE NOTICE 'fn_actualizar_config_admin - Check violado: %', SQLERRM;
        RETURN FALSE;
    WHEN LOCK_NOT_AVAILABLE THEN
        RAISE NOTICE 'fn_actualizar_config_admin - Fila bloqueada: %', SQLERRM;
        RETURN FALSE;
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_actualizar_config_admin: %', SQLERRM;
        RETURN FALSE;
END;
$$
LANGUAGE plpgsql;