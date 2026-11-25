-- =====================================================================
-- 04 - SENHAS REAIS PARA USUÁRIOS DE TESTE (somente desenvolvimento)
-- ---------------------------------------------------------------------
-- Os usuários do script principal têm senha_hash fictício (não é BCrypt
-- de nenhuma senha), então ninguém consegue fazer login com eles.
-- Este script SÓ troca a senha de dois usuários; não muda perfil nem órgão.
--
--   AGENTE (administrador; virou agente no 03_ajustes_mvp.sql, órgão 1)
--     e-mail: ana.souza@example.com
--     senha:  Agente@Teste2026
--
--   CIDADÃO
--     e-mail: carla.ribeiro@example.com
--     senha:  Cidadao@Teste2026
--
-- O agente é o "primeiro administrador": depois de entrar, ele cadastra
-- outros agentes pela aba Equipe do painel (POST /api/agentes).
--
-- NÃO rode em produção. Rode depois de Gestão_risco.sql e 03_ajustes_mvp.sql.
-- =====================================================================

START TRANSACTION;

-- hashes BCrypt (custo 10) gerados com o mesmo BCryptPasswordEncoder da API
UPDATE usuario
   SET senha_hash = '$2a$10$iA6rtyQ9MzDNEaw7OcuD/uKgcT8wPLVvmdifb4AMYjNAGocNy2z6m'
 WHERE id_usuario = 1;

UPDATE usuario
   SET senha_hash = '$2a$10$G127.CVkZu67Rd9qbWInMeug7cict5QyhxSLRmfwmZdn.shoAtE6a'
 WHERE id_usuario = 3;

COMMIT;

-- conferência: o 1 deve ser AGENTE com órgão; o 3, CIDADAO sem órgão
SELECT id_usuario, email, perfil, fk_id_orgao FROM usuario WHERE id_usuario IN (1, 3);
