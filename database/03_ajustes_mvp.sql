-- =====================================================================
-- AJUSTES PARA O MVP — gestao_riscos
-- Executar depois do schema e dos dados de teste originais.
-- Coordenadas abaixo são APROXIMADAS e servem apenas para testes.
-- =====================================================================
USE gestao_riscos;

-- 1. AREA_RISCO: nível de risco (consulta "baixo/alto") e ponto central (mapa)
ALTER TABLE area_risco
    ADD COLUMN nivel_risco VARCHAR(10) NOT NULL DEFAULT 'MEDIO' COMMENT 'Classificação da área: BAIXO, MEDIO, ALTO',
    ADD COLUMN latitude DECIMAL(9,6) NULL COMMENT 'Latitude do ponto central (WGS84)',
    ADD COLUMN longitude DECIMAL(9,6) NULL COMMENT 'Longitude do ponto central (WGS84)',
    ADD CONSTRAINT ck_area_risco_nivel CHECK (nivel_risco IN ('BAIXO', 'MEDIO', 'ALTO')),
    ADD CONSTRAINT ck_area_risco_coordenadas CHECK ((latitude IS NULL) = (longitude IS NULL));

-- 2. ABRIGO: coordenadas (sem elas não existe "abrigo mais próximo")
ALTER TABLE abrigo
    ADD COLUMN latitude DECIMAL(9,6) NULL COMMENT 'Latitude (WGS84)',
    ADD COLUMN longitude DECIMAL(9,6) NULL COMMENT 'Longitude (WGS84)',
    ADD CONSTRAINT ck_abrigo_coordenadas CHECK ((latitude IS NULL) = (longitude IS NULL));

-- 3. EVENTO_AREA_RISCO: a PK (evento, área) impede registrar a segunda
--    enchente na mesma área. Com id próprio, a tabela vira um histórico.
ALTER TABLE evento_area_risco
    DROP PRIMARY KEY,
    ADD COLUMN id_ocorrencia INT NOT NULL AUTO_INCREMENT FIRST,
    ADD CONSTRAINT pk_evento_area_risco PRIMARY KEY (id_ocorrencia),
    ADD INDEX ix_ear_evento (fk_id_evento);

-- 4. USUARIO: perfil e vínculo com órgão (quem pode emitir alerta)
--    Regra "AGENTE precisa ter órgão" fica no service: o MySQL não aceita
--    CHECK sobre coluna de FK com ação referencial.
ALTER TABLE usuario
    ADD COLUMN perfil VARCHAR(10) NOT NULL DEFAULT 'CIDADAO' COMMENT 'CIDADAO ou AGENTE',
    ADD COLUMN fk_id_orgao INT NULL COMMENT 'Órgão do agente (NULL para cidadão)',
    ADD CONSTRAINT ck_usuario_perfil CHECK (perfil IN ('CIDADAO', 'AGENTE')),
    ADD CONSTRAINT fk_usuario_orgao FOREIGN KEY (fk_id_orgao)
        REFERENCES orgao_responsavel (id_orgao) ON UPDATE CASCADE ON DELETE RESTRICT;

-- 5. PEDIDO_AJUDA: quem pede socorro pode estar fora de uma área cadastrada
ALTER TABLE pedido_ajuda
    MODIFY fk_id_area_risco INT NULL COMMENT 'Área de risco de origem (NULL se fora de área cadastrada)';

-- ---------------------------------------------------------------------
-- DADOS DE TESTE PARA AS NOVAS COLUNAS
-- ---------------------------------------------------------------------
START TRANSACTION;

UPDATE area_risco SET nivel_risco = 'ALTO',  latitude = -23.704500, longitude = -46.783200 WHERE id_area_risco = 1;
UPDATE area_risco SET nivel_risco = 'MEDIO', latitude = -23.498100, longitude = -46.444900 WHERE id_area_risco = 2;
UPDATE area_risco SET nivel_risco = 'ALTO',  latitude = -23.931600, longitude = -46.338900 WHERE id_area_risco = 3;
UPDATE area_risco SET nivel_risco = 'MEDIO', latitude = -23.980000, longitude = -46.260000 WHERE id_area_risco = 4;
UPDATE area_risco SET nivel_risco = 'ALTO',  latitude = -23.773000, longitude = -45.678400 WHERE id_area_risco = 5;
UPDATE area_risco SET nivel_risco = 'BAIXO', latitude = -23.358600, longitude = -44.893100 WHERE id_area_risco = 6;
UPDATE area_risco SET nivel_risco = 'MEDIO', latitude = -23.330200, longitude = -46.727800 WHERE id_area_risco = 7;
UPDATE area_risco SET nivel_risco = 'MEDIO', latitude = -23.884300, longitude = -46.425600 WHERE id_area_risco = 8;
UPDATE area_risco SET nivel_risco = 'ALTO',  latitude = -22.509900, longitude = -43.183500 WHERE id_area_risco = 9;
UPDATE area_risco SET nivel_risco = 'BAIXO', latitude = -26.900000, longitude = -49.070000 WHERE id_area_risco = 10;

UPDATE abrigo SET latitude = -23.700000, longitude = -46.775000 WHERE id_abrigo = 1;
UPDATE abrigo SET latitude = -23.550500, longitude = -46.633300 WHERE id_abrigo = 2;
UPDATE abrigo SET latitude = -23.936000, longitude = -46.335000 WHERE id_abrigo = 3;
UPDATE abrigo SET latitude = -23.470000, longitude = -46.700000 WHERE id_abrigo = 4;
UPDATE abrigo SET latitude = -23.985000, longitude = -46.225000 WHERE id_abrigo = 5;
UPDATE abrigo SET latitude = -23.776000, longitude = -45.690000 WHERE id_abrigo = 6;
UPDATE abrigo SET latitude = -23.452000, longitude = -45.068000 WHERE id_abrigo = 7;
UPDATE abrigo SET latitude = -23.325000, longitude = -46.730000 WHERE id_abrigo = 8;
UPDATE abrigo SET latitude = -23.890000, longitude = -46.420000 WHERE id_abrigo = 9;
UPDATE abrigo SET latitude = -23.561000, longitude = -46.656000 WHERE id_abrigo = 10;

-- Um agente de teste, vinculado à Defesa Civil de São Paulo
UPDATE usuario SET perfil = 'AGENTE', fk_id_orgao = 1 WHERE id_usuario = 1;

COMMIT;

-- ---------------------------------------------------------------------
-- CONSULTA DE REFERÊNCIA: abrigos com vaga mais próximos de um ponto
-- (vira uma @Query nativa no AbrigoRepository)
-- ---------------------------------------------------------------------
SELECT a.id_abrigo, a.nome, a.vagas_disponiveis,
       ROUND(ST_Distance_Sphere(POINT(a.longitude, a.latitude),
                                POINT(-46.633300, -23.550500)) / 1000, 1) AS distancia_km
FROM abrigo a
WHERE a.latitude IS NOT NULL
  AND a.vagas_disponiveis > 0
ORDER BY distancia_km
LIMIT 5;
