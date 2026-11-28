-- =====================================================================
-- 05 - ENDEREÇO DO USUÁRIO E CIDADES ATENDIDAS (fase 1)
-- ---------------------------------------------------------------------
-- 1. LOCALIDADE ganha código IBGE, UF, ponto da sede e a marca "atendida"
--    (as 6 cidades do MVP). Entram Nova Friburgo e Teresópolis.
-- 2. ENDERECO_USUARIO: onde o usuário mora. Pode ser o endereço completo
--    (CEP, rua...) ou só a cidade, quando ele prefere não informar a rua.
-- 3. CONSENTIMENTO: registro LGPD do aceite para uso do endereço.
--
-- Fontes dos dados das cidades (consultadas em 27/11/2026):
--   população: IBGE, Censo 2022 (tabela 4709)
--   área: IBGE, malha municipal (metadados)
--   ponto da sede: OpenStreetMap (centro urbano do município)
-- Ranking das 6 cidades: Atlas Digital de Desastres 1991-2025, cidades com
-- mais mortes em desastres de chuva, enchente, deslizamento e vento.
--
-- Rode depois de Gestão_risco.sql, 03_ajustes_mvp.sql e 04_usuarios_teste.sql.
-- =====================================================================
USE gestao_riscos;

-- ---------------------------------------------------------------------
-- 1. LOCALIDADE
-- ---------------------------------------------------------------------
ALTER TABLE localidade
    ADD COLUMN codigo_ibge CHAR(7) NULL COMMENT 'Código IBGE do município (7 dígitos)',
    ADD COLUMN uf CHAR(2) NULL COMMENT 'Sigla da UF',
    ADD COLUMN latitude DECIMAL(9,6) NULL COMMENT 'Latitude da sede do município (WGS84)',
    ADD COLUMN longitude DECIMAL(9,6) NULL COMMENT 'Longitude da sede do município (WGS84)',
    ADD COLUMN atendida BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Cidade coberta pelo SafeZone no MVP',
    ADD CONSTRAINT uq_localidade_codigo_ibge UNIQUE (codigo_ibge),
    ADD CONSTRAINT ck_localidade_codigo_ibge CHECK (codigo_ibge IS NULL OR REGEXP_LIKE(codigo_ibge, '^[0-9]{7}$')),
    ADD CONSTRAINT ck_localidade_uf CHECK (uf IS NULL OR REGEXP_LIKE(uf, '^[A-Z]{2}$')),
    ADD CONSTRAINT ck_localidade_coordenadas CHECK ((latitude IS NULL) = (longitude IS NULL));

START TRANSACTION;

-- localidades que já existiam: código IBGE, UF, sede e dados do Censo 2022
UPDATE localidade SET codigo_ibge = '3550308', uf = 'SP', latitude = -23.550651, longitude = -46.633382, populacao = 11451999, area = 1521.20, atendida = TRUE  WHERE id_localidade = 1;  -- São Paulo
UPDATE localidade SET codigo_ibge = '3548500', uf = 'SP', latitude = -23.960945, longitude = -46.316632, populacao = 418608,   area = 281.03,  atendida = FALSE WHERE id_localidade = 2;  -- Santos
UPDATE localidade SET codigo_ibge = '3518701', uf = 'SP', latitude = -23.992777, longitude = -46.255833, populacao = 287634,   area = 144.79,  atendida = TRUE  WHERE id_localidade = 3;  -- Guarujá
UPDATE localidade SET codigo_ibge = '3550704', uf = 'SP', latitude = -23.802787, longitude = -45.407053, populacao = 81595,    area = 402.40,  atendida = TRUE  WHERE id_localidade = 4;  -- São Sebastião
UPDATE localidade SET codigo_ibge = '3555406', uf = 'SP', latitude = -23.433162, longitude = -45.083415, populacao = 92981,    area = 708.11,  atendida = FALSE WHERE id_localidade = 5;  -- Ubatuba
UPDATE localidade SET codigo_ibge = '3516408', uf = 'SP', latitude = -23.332804, longitude = -46.724446, populacao = 144849,   area = 132.78,  atendida = FALSE WHERE id_localidade = 6;  -- Franco da Rocha
UPDATE localidade SET codigo_ibge = '3513504', uf = 'SP', latitude = -23.884208, longitude = -46.421306, populacao = 112476,   area = 142.88,  atendida = FALSE WHERE id_localidade = 7;  -- Cubatão
UPDATE localidade SET codigo_ibge = '3303906', uf = 'RJ', latitude = -22.507574, longitude = -43.178536, populacao = 278881,   area = 791.14,  atendida = TRUE  WHERE id_localidade = 8;  -- Petrópolis
UPDATE localidade SET codigo_ibge = '4202404', uf = 'SC', latitude = -26.919557, longitude = -49.065803, populacao = 361261,   area = 518.62,  atendida = FALSE WHERE id_localidade = 9;  -- Blumenau
UPDATE localidade SET codigo_ibge = '4314902', uf = 'RS', latitude = -30.032500, longitude = -51.230377, populacao = 1332845,  area = 495.39,  atendida = FALSE WHERE id_localidade = 10; -- Porto Alegre

-- cidades novas do MVP
INSERT INTO localidade (nome, populacao, area, codigo_ibge, uf, latitude, longitude, atendida) VALUES
    ('Nova Friburgo', 189939, 935.43, '3303401', 'RJ', -22.280000, -42.532530, TRUE),
    ('Teresópolis',   165123, 773.34, '3305802', 'RJ', -22.416458, -42.975194, TRUE);

COMMIT;

-- ---------------------------------------------------------------------
-- 2. ENDERECO_USUARIO (USUARIO 1 : 0..1 ENDERECO_USUARIO)
-- ---------------------------------------------------------------------
-- Endereço completo (CEP + rua) ou só a cidade: CEP e logradouro andam juntos.
-- A coordenada é opcional: vem do GPS no cadastro (fase 1) ou da
-- geocodificação do endereço (fase 3).
CREATE TABLE endereco_usuario (
    id_endereco_usuario INT NOT NULL AUTO_INCREMENT COMMENT 'Identificador único do endereço',
    fk_id_usuario INT NOT NULL COMMENT 'Dono do endereço',
    fk_id_localidade INT NOT NULL COMMENT 'Cidade (sempre uma cidade atendida)',
    cep CHAR(8) NULL COMMENT 'CEP somente com dígitos (8); NULL quando só a cidade foi informada',
    logradouro VARCHAR(150) NULL COMMENT 'Rua/avenida',
    numero VARCHAR(10) NULL COMMENT 'Número (texto: aceita S/N, 12A etc.)',
    complemento VARCHAR(60) NULL COMMENT 'Complemento',
    bairro VARCHAR(100) NULL COMMENT 'Bairro',
    latitude DECIMAL(9,6) NULL COMMENT 'Latitude do endereço (WGS84)',
    longitude DECIMAL(9,6) NULL COMMENT 'Longitude do endereço (WGS84)',
    origem_coordenada VARCHAR(15) NULL COMMENT 'GPS ou GEOCODIFICADO',
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Última alteração',
    CONSTRAINT pk_endereco_usuario PRIMARY KEY (id_endereco_usuario),
    CONSTRAINT uq_endereco_usuario_usuario UNIQUE (fk_id_usuario),
    CONSTRAINT ck_endereco_usuario_cep CHECK (cep IS NULL OR REGEXP_LIKE(cep, '^[0-9]{8}$')),
    CONSTRAINT ck_endereco_usuario_completo CHECK ((cep IS NULL) = (logradouro IS NULL)),
    CONSTRAINT ck_endereco_usuario_coordenadas CHECK ((latitude IS NULL) = (longitude IS NULL)),
    CONSTRAINT ck_endereco_usuario_origem CHECK ((latitude IS NULL) = (origem_coordenada IS NULL)),
    CONSTRAINT ck_endereco_usuario_origem_valor CHECK (origem_coordenada IS NULL OR origem_coordenada IN ('GPS', 'GEOCODIFICADO')),
    CONSTRAINT fk_endereco_usuario_usuario FOREIGN KEY (fk_id_usuario)
        REFERENCES usuario (id_usuario) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_endereco_usuario_localidade FOREIGN KEY (fk_id_localidade)
        REFERENCES localidade (id_localidade) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB COMMENT = 'Onde o usuário mora: endereço completo ou só a cidade';

-- ---------------------------------------------------------------------
-- 3. CONSENTIMENTO (LGPD)
-- ---------------------------------------------------------------------
-- Um registro por aceite. Revogar não apaga: preenche revogado_em,
-- para provar quando o consentimento valeu.
CREATE TABLE consentimento (
    id_consentimento INT NOT NULL AUTO_INCREMENT COMMENT 'Identificador único do consentimento',
    fk_id_usuario INT NOT NULL COMMENT 'Titular dos dados',
    finalidade VARCHAR(20) NOT NULL COMMENT 'Para que o dado é usado: ENDERECO',
    versao_termo VARCHAR(20) NOT NULL COMMENT 'Versão do texto aceito',
    aceito_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Quando o usuário aceitou',
    revogado_em DATETIME NULL COMMENT 'Quando o usuário revogou (NULL = vigente)',
    CONSTRAINT pk_consentimento PRIMARY KEY (id_consentimento),
    CONSTRAINT ck_consentimento_finalidade CHECK (finalidade IN ('ENDERECO')),
    CONSTRAINT ck_consentimento_datas CHECK (revogado_em IS NULL OR revogado_em >= aceito_em),
    CONSTRAINT fk_consentimento_usuario FOREIGN KEY (fk_id_usuario)
        REFERENCES usuario (id_usuario) ON UPDATE CASCADE ON DELETE CASCADE,
    INDEX ix_consentimento_usuario (fk_id_usuario, finalidade)
) ENGINE = InnoDB COMMENT = 'Registro de consentimentos (LGPD)';

-- ---------------------------------------------------------------------
-- CONFERÊNCIA
-- ---------------------------------------------------------------------
SELECT nome, uf, codigo_ibge, atendida FROM localidade ORDER BY atendida DESC, nome;
