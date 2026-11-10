CREATE OR REPLACE FUNCTION fn_sue_buscar_empresas(
    p_id_ciudad CIUDADES.ID_CIUDAD%TYPE,
    p_tipo_empresa EMPRESAS.TIPO_SERVICIO%TYPE
)
RETURNS JSONB
LANGUAGE sql
AS $$
    SELECT COALESCE(JSONB_AGG(JSONB_BUILD_OBJECT(
        'empresa', empresa.NOM_EMPRESA,
        'id_empresa', empresa.ID_EMPRESA,
        'servicio', empresa.TIPO_SERVICIO,
        'municipio', ciudad.NOM_CIUDAD,
        'departamento', departamento.NOM_DPTO,
        'correo', empresa.EMAIL_INSTITU_EMPRESA,
        'telefono', empresa.NUM_CONTACTO_EMPRESA
    ) ORDER BY empresa.NOM_EMPRESA, empresa.ID_EMPRESA), '[]'::JSONB)
    FROM EMPRESAS empresa
    JOIN USUARIOS_EMPRESA usuario
      ON usuario.ID_EMPRESA = empresa.ID_EMPRESA
     AND usuario.ESTADO = 'ACTIVO'
    JOIN CIUDADES ciudad ON ciudad.ID_CIUDAD = empresa.ID_CIUDAD
    JOIN DEPARTAMENTOS departamento ON departamento.ID_DPTO = ciudad.ID_DPTO
    WHERE (p_id_ciudad IS NULL OR empresa.ID_CIUDAD = p_id_ciudad)
      AND (p_tipo_empresa IS NULL OR empresa.TIPO_SERVICIO = p_tipo_empresa);
$$;
