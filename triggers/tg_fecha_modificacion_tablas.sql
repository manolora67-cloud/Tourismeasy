DROP TRIGGER IF EXISTS trg_empresas_fecha_modificacion ON EMPRESAS;
CREATE TRIGGER trg_empresas_fecha_modificacion
BEFORE UPDATE ON EMPRESAS
FOR EACH ROW
EXECUTE PROCEDURE fn_actualizar_fecha_modificacion();

DROP TRIGGER IF EXISTS trg_personas_ecommerce_fecha_modificacion ON PERSONAS_ECOMMERCE;
CREATE TRIGGER trg_personas_ecommerce_fecha_modificacion
BEFORE UPDATE ON PERSONAS_ECOMMERCE
FOR EACH ROW
EXECUTE PROCEDURE fn_actualizar_fecha_modificacion();

DROP TRIGGER IF EXISTS trg_transporte_fecha_modificacion ON TRANSPORTE;
CREATE TRIGGER trg_transporte_fecha_modificacion
BEFORE UPDATE ON TRANSPORTE
FOR EACH ROW
EXECUTE PROCEDURE fn_actualizar_fecha_modificacion();

DROP TRIGGER IF EXISTS trg_hospedaje_fecha_modificacion ON HOSPEDAJE;
CREATE TRIGGER trg_hospedaje_fecha_modificacion
BEFORE UPDATE ON HOSPEDAJE
FOR EACH ROW
EXECUTE PROCEDURE fn_actualizar_fecha_modificacion();

DROP TRIGGER IF EXISTS trg_planes_turisticos_fecha_modificacion ON PLANES_TURISTICOS;
CREATE TRIGGER trg_planes_turisticos_fecha_modificacion
BEFORE UPDATE ON PLANES_TURISTICOS
FOR EACH ROW
EXECUTE PROCEDURE fn_actualizar_fecha_modificacion();

DROP TRIGGER IF EXISTS trg_productos_artesanales_fecha_modificacion ON PRODUCTOS_ARTESANALES;
CREATE TRIGGER trg_productos_artesanales_fecha_modificacion
BEFORE UPDATE ON PRODUCTOS_ARTESANALES
FOR EACH ROW
EXECUTE PROCEDURE fn_actualizar_fecha_modificacion();