DROP TRIGGER IF EXISTS trg_historico_plan_turistico ON PLANES_TURISTICOS;
CREATE TRIGGER trg_historico_plan_turistico
AFTER UPDATE OR DELETE ON PLANES_TURISTICOS
FOR EACH ROW
EXECUTE PROCEDURE fn_historico_plan_turistico();

DROP TRIGGER IF EXISTS trg_historico_usuario_ecommerce ON USUARIOS_ECOMMERCE;
CREATE TRIGGER trg_historico_usuario_ecommerce
AFTER UPDATE OR DELETE ON USUARIOS_ECOMMERCE
FOR EACH ROW
EXECUTE PROCEDURE fn_historico_usuario_ecommerce();

DROP TRIGGER IF EXISTS trg_historico_personas_ecommerce ON PERSONAS_ECOMMERCE;
CREATE TRIGGER trg_historico_personas_ecommerce
AFTER UPDATE OR DELETE ON PERSONAS_ECOMMERCE
FOR EACH ROW
EXECUTE PROCEDURE fn_historico_usuario_ecommerce();

DROP TRIGGER IF EXISTS trg_historico_hospedaje ON HOSPEDAJE;
CREATE TRIGGER trg_historico_hospedaje
AFTER UPDATE OR DELETE ON HOSPEDAJE
FOR EACH ROW
EXECUTE PROCEDURE fn_historico_hospedaje();

DROP TRIGGER IF EXISTS trg_historico_transporte ON TRANSPORTE;
CREATE TRIGGER trg_historico_transporte
BEFORE UPDATE OR DELETE ON TRANSPORTE
FOR EACH ROW
EXECUTE PROCEDURE fn_historico_transporte();

DROP TRIGGER IF EXISTS trg_historico_producto_artesanal ON PRODUCTOS_ARTESANALES;
CREATE TRIGGER trg_historico_producto_artesanal
AFTER UPDATE OR DELETE ON PRODUCTOS_ARTESANALES
FOR EACH ROW
EXECUTE PROCEDURE fn_historico_producto_artesanal();
