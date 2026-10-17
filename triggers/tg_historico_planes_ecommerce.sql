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