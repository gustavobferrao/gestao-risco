-- =====================================================================
-- MODELO FÍSICO — GESTÃO DE ÁREAS DE RISCO, ALERTAS E ABRIGOS
-- SGBD alvo: MySQL 8.0.16+ (InnoDB, utf8mb4)
-- =====================================================================

DROP DATABASE IF EXISTS gestao_riscos;
CREATE DATABASE gestao_riscos DEFAULT CHARACTER SET utf8mb4 DEFAULT COLLATE utf8mb4_0900_ai_ci;
USE gestao_riscos;

-- =====================================================================
-- 1. TABELAS INDEPENDENTES
-- =====================================================================

-- LOCALIDADE
CREATE TABLE localidade (
    id_localidade INT NOT NULL AUTO_INCREMENT COMMENT 'Identificador único da localidade',
    nome VARCHAR(120) NOT NULL COMMENT 'Nome da localidade (município, distrito etc.)',
    populacao INT NOT NULL DEFAULT 0 COMMENT 'População total estimada',
    area DECIMAL(12,2) NOT NULL COMMENT 'Área territorial em km²',
    CONSTRAINT pk_localidade PRIMARY KEY (id_localidade),
    CONSTRAINT uq_localidade_nome UNIQUE (nome),
    CONSTRAINT ck_localidade_populacao CHECK (populacao >= 0),
    CONSTRAINT ck_localidade_area CHECK (area > 0)
) ENGINE = InnoDB COMMENT = 'Localidades geográficas que contêm áreas de risco';

-- ORGAO_RESPONSAVEL
CREATE TABLE orgao_responsavel (
    id_orgao INT NOT NULL AUTO_INCREMENT COMMENT 'Identificador único do órgão',
    nome VARCHAR(150) NOT NULL COMMENT 'Razão social / nome do órgão',
    cnpj CHAR(14) NOT NULL COMMENT 'CNPJ somente com dígitos (14)',
    telefone VARCHAR(15) NOT NULL COMMENT 'Telefone de contato (somente dígitos, com DDD)',
    CONSTRAINT pk_orgao_responsavel PRIMARY KEY (id_orgao),
    CONSTRAINT uq_orgao_cnpj UNIQUE (cnpj),
    CONSTRAINT ck_orgao_cnpj CHECK (REGEXP_LIKE(cnpj, '^[0-9]{14}$')),
    CONSTRAINT ck_orgao_telefone CHECK (REGEXP_LIKE(telefone, '^[0-9]{10,15}$'))
) ENGINE = InnoDB COMMENT = 'Órgãos que emitem alertas e gerenciam abrigos';

-- ABRIGO
CREATE TABLE abrigo (
    id_abrigo INT NOT NULL AUTO_INCREMENT COMMENT 'Identificador único do abrigo',
    nome VARCHAR(150) NOT NULL COMMENT 'Nome do abrigo',
    capacidade_total INT NOT NULL COMMENT 'Capacidade máxima de pessoas',
    vagas_disponiveis INT NOT NULL COMMENT 'Vagas livres no momento',
    telefone VARCHAR(15) NOT NULL COMMENT 'Telefone de contato (somente dígitos, com DDD)',
    logradouro VARCHAR(150) NOT NULL COMMENT 'Rua/avenida e número',
    bairro VARCHAR(100) NOT NULL COMMENT 'Bairro',
    cep CHAR(8) NOT NULL COMMENT 'CEP somente com dígitos (8)',
    CONSTRAINT pk_abrigo PRIMARY KEY (id_abrigo),
    CONSTRAINT ck_abrigo_capacidade CHECK (capacidade_total > 0),
    CONSTRAINT ck_abrigo_vagas CHECK (vagas_disponiveis BETWEEN 0 AND capacidade_total),
    CONSTRAINT ck_abrigo_telefone CHECK (REGEXP_LIKE(telefone, '^[0-9]{10,15}$')),
    CONSTRAINT ck_abrigo_cep CHECK (REGEXP_LIKE(cep, '^[0-9]{8}$'))
) ENGINE = InnoDB COMMENT = 'Abrigos disponíveis para acolhimento da população';

-- USUARIO
CREATE TABLE usuario (
    id_usuario INT NOT NULL AUTO_INCREMENT COMMENT 'Identificador único do usuário',
    nome VARCHAR(150) NOT NULL COMMENT 'Nome completo',
    cpf CHAR(11) NOT NULL COMMENT 'CPF somente com dígitos (11)',
    telefone VARCHAR(15) NOT NULL COMMENT 'Telefone (somente dígitos, com DDD)',
    email VARCHAR(254) NOT NULL COMMENT 'E-mail de login/contato',
    senha_hash VARCHAR(255) NOT NULL COMMENT 'Hash da senha (bcrypt/argon2), nunca texto puro',
    CONSTRAINT pk_usuario PRIMARY KEY (id_usuario),
    CONSTRAINT uq_usuario_cpf UNIQUE (cpf),
    CONSTRAINT uq_usuario_email UNIQUE (email),
    CONSTRAINT ck_usuario_cpf CHECK (REGEXP_LIKE(cpf, '^[0-9]{11}$')),
    CONSTRAINT ck_usuario_telefone CHECK (REGEXP_LIKE(telefone, '^[0-9]{10,15}$')),
    CONSTRAINT ck_usuario_email CHECK (REGEXP_LIKE(email, '^[^@[:space:]]+@[^@[:space:]]+\\.[^@[:space:]]+$'))
) ENGINE = InnoDB COMMENT = 'Cidadãos cadastrados que podem solicitar ajuda';

-- EVENTO_CLIMATICO
CREATE TABLE evento_climatico (
    id_evento_climatico INT NOT NULL AUTO_INCREMENT COMMENT 'Identificador único do evento climático',
    nome VARCHAR(120) NOT NULL COMMENT 'Nome do evento (ex.: Enchente, Vendaval)',
    classificacao VARCHAR(60) NOT NULL COMMENT 'Classificação (ex.: Hidrológico, Geológico)',
    CONSTRAINT pk_evento_climatico PRIMARY KEY (id_evento_climatico),
    CONSTRAINT uq_evento_climatico_nome UNIQUE (nome)
) ENGINE = InnoDB COMMENT = 'Catálogo de tipos de eventos climáticos';

-- =====================================================================
-- 2. TABELAS DEPENDENTES (1:N)
-- =====================================================================

-- AREA_RISCO (LOCALIDADE 1 : N AREA_RISCO)
CREATE TABLE area_risco (
    id_area_risco INT NOT NULL AUTO_INCREMENT COMMENT 'Identificador único da área de risco',
    fk_id_localidade INT NOT NULL COMMENT 'Localidade à qual a área pertence',
    nome VARCHAR(150) NOT NULL COMMENT 'Nome da área de risco',
    populacao_afetada INT NOT NULL DEFAULT 0 COMMENT 'Número estimado de pessoas expostas',
    descricao VARCHAR(500) NULL COMMENT 'Descrição do risco da área',
    zona VARCHAR(10) NOT NULL COMMENT 'Zona da área: URBANA ou RURAL',
    CONSTRAINT pk_area_risco PRIMARY KEY (id_area_risco),
    CONSTRAINT uq_area_risco_nome_local UNIQUE (fk_id_localidade, nome),
    CONSTRAINT ck_area_risco_populacao CHECK (populacao_afetada >= 0),
    CONSTRAINT ck_area_risco_zona CHECK (zona IN ('URBANA', 'RURAL')),
    CONSTRAINT fk_area_risco_localidade FOREIGN KEY (fk_id_localidade)
        REFERENCES localidade (id_localidade) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB COMMENT = 'Áreas mapeadas como de risco dentro de uma localidade';

-- ENDERECO_AREA_RISCO (atributo multivalorado de AREA_RISCO)
CREATE TABLE endereco_area_risco (
    id_endereco INT NOT NULL AUTO_INCREMENT COMMENT 'Identificador único do endereço',
    fk_id_area_risco INT NOT NULL COMMENT 'Área de risco à qual o endereço pertence',
    logradouro VARCHAR(150) NOT NULL COMMENT 'Rua/avenida',
    bairro VARCHAR(100) NOT NULL COMMENT 'Bairro',
    numero VARCHAR(10) NULL COMMENT 'Número (texto: aceita S/N, 12A etc.)',
    cep CHAR(8) NOT NULL COMMENT 'CEP somente com dígitos (8)',
    CONSTRAINT pk_endereco_area_risco PRIMARY KEY (id_endereco),
    CONSTRAINT ck_endereco_cep CHECK (REGEXP_LIKE(cep, '^[0-9]{8}$')),
    CONSTRAINT fk_endereco_area_risco FOREIGN KEY (fk_id_area_risco)
        REFERENCES area_risco (id_area_risco) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB COMMENT = 'Endereços que compõem uma área de risco';

-- ALERTA (ORGAO_RESPONSAVEL 1 : N ALERTA)
CREATE TABLE alerta (
    id_alerta INT NOT NULL AUTO_INCREMENT COMMENT 'Identificador único do alerta',
    fk_id_orgao INT NOT NULL COMMENT 'Órgão emissor do alerta',
    tipo VARCHAR(60) NOT NULL COMMENT 'Tipo do alerta (ex.: Chuva forte, Deslizamento)',
    nivel_severidade VARCHAR(10) NOT NULL COMMENT 'Severidade: BAIXO, MEDIO, ALTO, CRITICO',
    data_emissao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Data/hora de emissão',
    status_alerta VARCHAR(10) NOT NULL DEFAULT 'ATIVO' COMMENT 'Situação: ATIVO, ENCERRADO, CANCELADO',
    CONSTRAINT pk_alerta PRIMARY KEY (id_alerta),
    CONSTRAINT ck_alerta_severidade CHECK (nivel_severidade IN ('BAIXO', 'MEDIO', 'ALTO', 'CRITICO')),
    CONSTRAINT ck_alerta_status CHECK (status_alerta IN ('ATIVO', 'ENCERRADO', 'CANCELADO')),
    CONSTRAINT fk_alerta_orgao FOREIGN KEY (fk_id_orgao)
        REFERENCES orgao_responsavel (id_orgao) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB COMMENT = 'Alertas emitidos pelos órgãos responsáveis';

-- PEDIDO_AJUDA (USUARIO 1 : N PEDIDO; AREA_RISCO 1 : N PEDIDO)
CREATE TABLE pedido_ajuda (
    id_pedido INT NOT NULL AUTO_INCREMENT COMMENT 'Identificador único do pedido',
    fk_id_usuario INT NOT NULL COMMENT 'Usuário solicitante',
    fk_id_area_risco INT NOT NULL COMMENT 'Área de risco de origem do pedido',
    descricao VARCHAR(1000) NOT NULL COMMENT 'Descrição da situação / ajuda necessária',
    data_hora_solicitacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Data/hora de abertura',
    status VARCHAR(15) NOT NULL DEFAULT 'ABERTO' COMMENT 'Situação: ABERTO, EM_ATENDIMENTO, CONCLUIDO, CANCELADO',
    latitude DECIMAL(9,6) NULL COMMENT 'Latitude (graus decimais, WGS84)',
    longitude DECIMAL(9,6) NULL COMMENT 'Longitude (graus decimais, WGS84)',
    CONSTRAINT pk_pedido_ajuda PRIMARY KEY (id_pedido),
    CONSTRAINT ck_pedido_status CHECK (status IN ('ABERTO', 'EM_ATENDIMENTO', 'CONCLUIDO', 'CANCELADO')),
    CONSTRAINT ck_pedido_latitude CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
    CONSTRAINT ck_pedido_longitude CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180),
    CONSTRAINT ck_pedido_coordenadas CHECK ((latitude IS NULL) = (longitude IS NULL)),
    CONSTRAINT fk_pedido_usuario FOREIGN KEY (fk_id_usuario)
        REFERENCES usuario (id_usuario) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_pedido_area_risco FOREIGN KEY (fk_id_area_risco)
        REFERENCES area_risco (id_area_risco) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB COMMENT = 'Pedidos de ajuda abertos por usuários em áreas de risco';

-- =====================================================================
-- 3. TABELAS ASSOCIATIVAS (N:N)
-- =====================================================================

-- ALERTA_AREA_RISCO (ALERTA N : N AREA_RISCO)
CREATE TABLE alerta_area_risco (
    fk_id_alerta INT NOT NULL COMMENT 'Alerta emitido',
    fk_id_area_risco INT NOT NULL COMMENT 'Área de risco destinatária do alerta',
    CONSTRAINT pk_alerta_area_risco PRIMARY KEY (fk_id_alerta, fk_id_area_risco),
    CONSTRAINT fk_aar_alerta FOREIGN KEY (fk_id_alerta)
        REFERENCES alerta (id_alerta) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_aar_area_risco FOREIGN KEY (fk_id_area_risco)
        REFERENCES area_risco (id_area_risco) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB COMMENT = 'Associação N:N entre alertas e áreas de risco';

-- GESTAO_ABRIGO (ORGAO_RESPONSAVEL N : N ABRIGO)
CREATE TABLE gestao_abrigo (
    fk_id_orgao INT NOT NULL COMMENT 'Órgão gestor',
    fk_id_abrigo INT NOT NULL COMMENT 'Abrigo gerenciado',
    data_inicio_gestao DATE NOT NULL DEFAULT (CURRENT_DATE) COMMENT 'Data de início da gestão',
    CONSTRAINT pk_gestao_abrigo PRIMARY KEY (fk_id_orgao, fk_id_abrigo),
    CONSTRAINT fk_gestao_orgao FOREIGN KEY (fk_id_orgao)
        REFERENCES orgao_responsavel (id_orgao) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_gestao_abrigo FOREIGN KEY (fk_id_abrigo)
        REFERENCES abrigo (id_abrigo) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB COMMENT = 'Associação N:N entre órgãos e abrigos que gerenciam';

-- EVENTO_AREA_RISCO (EVENTO_CLIMATICO N : N AREA_RISCO)
CREATE TABLE evento_area_risco (
    fk_id_evento INT NOT NULL COMMENT 'Evento climático ocorrido',
    fk_id_area_risco INT NOT NULL COMMENT 'Área de risco afetada',
    data_ocorrencia DATETIME NOT NULL COMMENT 'Data/hora da ocorrência na área',
    CONSTRAINT pk_evento_area_risco PRIMARY KEY (fk_id_evento, fk_id_area_risco),
    CONSTRAINT fk_ear_evento FOREIGN KEY (fk_id_evento)
        REFERENCES evento_climatico (id_evento_climatico) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_ear_area_risco FOREIGN KEY (fk_id_area_risco)
        REFERENCES area_risco (id_area_risco) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB COMMENT = 'Associação N:N entre eventos climáticos e áreas afetadas';

-- =====================================================================
-- 4. ÍNDICES DE APOIO
-- =====================================================================
CREATE INDEX ix_endereco_area_risco ON endereco_area_risco (fk_id_area_risco);
CREATE INDEX ix_endereco_cep ON endereco_area_risco (cep);
CREATE INDEX ix_alerta_orgao ON alerta (fk_id_orgao);
CREATE INDEX ix_alerta_status_data ON alerta (status_alerta, data_emissao);
CREATE INDEX ix_aar_area_risco ON alerta_area_risco (fk_id_area_risco);
CREATE INDEX ix_gestao_abrigo ON gestao_abrigo (fk_id_abrigo);
CREATE INDEX ix_ear_area_risco ON evento_area_risco (fk_id_area_risco);
CREATE INDEX ix_ear_data_ocorrencia ON evento_area_risco (data_ocorrencia);
CREATE INDEX ix_pedido_usuario ON pedido_ajuda (fk_id_usuario);
CREATE INDEX ix_pedido_area_risco ON pedido_ajuda (fk_id_area_risco);
CREATE INDEX ix_pedido_status_data ON pedido_ajuda (status, data_hora_solicitacao);

-- =====================================================================
-- MOCK DE DADOS PARA TESTE — gestao_riscos
-- SGBD alvo: MySQL 8.0.16+
-- Pré-requisito: executar antes o ddl_gestao_riscos.sql
-- Observação: todos os nomes, CPFs, CNPJs, e-mails e telefones são
-- FICTÍCIOS e servem apenas para testes.
-- =====================================================================

USE gestao_riscos;

START TRANSACTION;

-- =====================================================================
-- 1. TABELAS INDEPENDENTES
-- =====================================================================

-- LOCALIDADE
INSERT INTO localidade (id_localidade, nome, populacao, area) VALUES
    (1, 'São Paulo', 11451999, 1521.20),
    (2, 'Santos', 418608, 281.03),
    (3, 'Guarujá', 287634, 144.79),
    (4, 'São Sebastião', 81595, 400.39),
    (5, 'Ubatuba', 92819, 708.11),
    (6, 'Franco da Rocha', 144849, 132.78),
    (7, 'Cubatão', 112476, 142.88),
    (8, 'Petrópolis', 278881, 791.14),
    (9, 'Blumenau', 361261, 518.62),
    (10, 'Porto Alegre', 1332845, 495.39);

-- ORGAO_RESPONSAVEL
INSERT INTO orgao_responsavel (id_orgao, nome, cnpj, telefone) VALUES
    (1, 'Defesa Civil Municipal de São Paulo', '10000000000101', '1131110001'),
    (2, 'Defesa Civil Municipal de Santos', '10000000000202', '1332220002'),
    (3, 'Defesa Civil Municipal do Guarujá', '10000000000303', '1333330003'),
    (4, 'Defesa Civil Municipal de São Sebastião', '10000000000404', '1238440004'),
    (5, 'Defesa Civil Municipal de Ubatuba', '10000000000505', '1238550005'),
    (6, 'Coordenadoria Estadual de Defesa Civil', '10000000000606', '1136660006'),
    (7, 'Corpo de Bombeiros — Comando Regional', '10000000000707', '1137770007'),
    (8, 'Secretaria Municipal de Assistência Social', '10000000000808', '1138880008'),
    (9, 'Centro de Monitoramento de Desastres', '10000000000909', '1239990009'),
    (10, 'Cruz Solidária — Organização Social', '10000000001010', '1131010010');

-- ABRIGO   (vagas_disponiveis sempre entre 0 e capacidade_total)
INSERT INTO abrigo (id_abrigo, nome, capacidade_total, vagas_disponiveis, telefone, logradouro, bairro, cep) VALUES
    (1, 'Abrigo Escola Estadual Prof. Almeida', 200, 145, '1131000101', 'Rua das Acácias, 120', 'Jardim Ângela', '04960000'),
    (2, 'Abrigo Ginásio Municipal Central', 350, 350, '1131000102', 'Av. Brasil, 1500', 'Centro', '01001000'),
    (3, 'Abrigo Paróquia São José', 80, 12, '1332000103', 'Rua Marquês, 45', 'Morro São Bento', '11085000'),
    (4, 'Abrigo CEU Vila Nova', 250, 230, '1131000104', 'Rua Tupi, 300', 'Vila Nova', '02850000'),
    (5, 'Abrigo Clube Atlético Litoral', 150, 0, '1333000105', 'Av. Atlântica, 900', 'Enseada', '11440000'),
    (6, 'Abrigo Escola Municipal Beira-Mar', 120, 60, '1238000106', 'Rua do Porto, 77', 'Barra do Sahy', '11600000'),
    (7, 'Abrigo Centro Comunitário Itaguá', 100, 95, '1238000107', 'Rua das Ondas, 210', 'Itaguá', '11680000'),
    (8, 'Abrigo Ginásio Poliesportivo Norte', 300, 210, '1144000108', 'Av. Liberdade, 2000', 'Vila Rosalina', '07850000'),
    (9, 'Abrigo Igreja Batista Esperança', 60, 40, '1334000109', 'Rua Ipiranga, 88', 'Vila Natal', '11530000'),
    (10, 'Abrigo SESC Temporário', 400, 380, '1131000110', 'Rua Voluntários, 555', 'Bela Vista', '01310100');

-- USUARIO   (senha_hash: hashes bcrypt fictícios)
INSERT INTO usuario (id_usuario, nome, cpf, telefone, email, senha_hash) VALUES
    (1, 'Ana Beatriz Souza', '11111111101', '11987650001', 'ana.souza@example.com', '$2b$12$abcdefghijklmnopqrstuv0000000000000000000000000000001'),
    (2, 'Bruno Henrique Lima', '11111111202', '11987650002', 'bruno.lima@example.com', '$2b$12$abcdefghijklmnopqrstuv0000000000000000000000000000002'),
    (3, 'Carla Mendes Ribeiro', '11111111303', '13987650003', 'carla.ribeiro@example.com', '$2b$12$abcdefghijklmnopqrstuv0000000000000000000000000000003'),
    (4, 'Diego Fernandes Alves', '11111111404', '13987650004', 'diego.alves@example.com', '$2b$12$abcdefghijklmnopqrstuv0000000000000000000000000000004'),
    (5, 'Eduarda Castro Nunes', '11111111505', '12987650005', 'eduarda.nunes@example.com', '$2b$12$abcdefghijklmnopqrstuv0000000000000000000000000000005'),
    (6, 'Felipe Rocha Martins', '11111111606', '12987650006', 'felipe.martins@example.com', '$2b$12$abcdefghijklmnopqrstuv0000000000000000000000000000006'),
    (7, 'Gabriela Pinto Duarte', '11111111707', '11987650007', 'gabriela.duarte@example.com', '$2b$12$abcdefghijklmnopqrstuv0000000000000000000000000000007'),
    (8, 'Henrique Barros Costa', '11111111808', '13987650008', 'henrique.costa@example.com', '$2b$12$abcdefghijklmnopqrstuv0000000000000000000000000000008'),
    (9, 'Isabela Teixeira Gomes', '11111111909', '24987650009', 'isabela.gomes@example.com', '$2b$12$abcdefghijklmnopqrstuv0000000000000000000000000000009'),
    (10, 'João Pedro Carvalho', '11111112000', '47987650010', 'joao.carvalho@example.com', '$2b$12$abcdefghijklmnopqrstuv0000000000000000000000000000010');

-- EVENTO_CLIMATICO
INSERT INTO evento_climatico (id_evento_climatico, nome, classificacao) VALUES
    (1, 'Enchente', 'Hidrológico'),
    (2, 'Alagamento', 'Hidrológico'),
    (3, 'Inundação', 'Hidrológico'),
    (4, 'Deslizamento de terra', 'Geológico'),
    (5, 'Erosão costeira', 'Geológico'),
    (6, 'Vendaval', 'Meteorológico'),
    (7, 'Granizo', 'Meteorológico'),
    (8, 'Tempestade severa', 'Meteorológico'),
    (9, 'Onda de calor', 'Climatológico'),
    (10, 'Estiagem', 'Climatológico');

-- =====================================================================
-- 2. TABELAS DEPENDENTES (1:N)
-- =====================================================================

-- AREA_RISCO
INSERT INTO area_risco (id_area_risco, fk_id_localidade, nome, populacao_afetada, descricao, zona) VALUES
    (1, 1, 'Encosta do Jardim Ângela', 4200, 'Encosta com ocupação irregular e histórico de deslizamentos.', 'URBANA'),
    (2, 1, 'Várzea do Rio Tietê — Trecho Leste', 8500, 'Área de várzea sujeita a transbordamento do rio.', 'URBANA'),
    (3, 2, 'Morro São Bento', 3100, 'Morro com moradias em área de alta declividade.', 'URBANA'),
    (4, 3, 'Morro do Engenho', 2700, 'Encosta com solo instável após chuvas prolongadas.', 'URBANA'),
    (5, 4, 'Barra do Sahy', 1800, 'Vila próxima à serra, atingida por fluxo de detritos.', 'URBANA'),
    (6, 5, 'Sertão do Ubatumirim', 650, 'Comunidade rural às margens de rio de serra.', 'RURAL'),
    (7, 6, 'Parque Vitória', 1500, 'Bairro em fundo de vale com risco de alagamento.', 'URBANA'),
    (8, 7, 'Vila Esperança', 2300, 'Ocupação em área de mangue sujeita a inundação por maré.', 'URBANA'),
    (9, 8, 'Alto da Serra', 5200, 'Região serrana com encostas íngremes e alta pluviosidade.', 'URBANA'),
    (10, 9, 'Vale do Itajaí — Margem Norte', 900, 'Área rural ribeirinha sujeita a cheias do rio Itajaí-Açu.', 'RURAL');

-- ENDERECO_AREA_RISCO
INSERT INTO endereco_area_risco (id_endereco, fk_id_area_risco, logradouro, bairro, numero, cep) VALUES
    (1, 1, 'Rua Laguna dos Patos', 'Jardim Ângela', '150', '04960010'),
    (2, 1, 'Viela da Encosta', 'Jardim Ângela', 'S/N', '04960020'),
    (3, 2, 'Rua Ribeirão Claro', 'São Miguel', '34', '08010100'),
    (4, 3, 'Rua Morro São Bento', 'Morro São Bento', '210', '11085010'),
    (5, 4, 'Estrada do Engenho', 'Morro do Engenho', '12A', '11430000'),
    (6, 5, 'Rua da Cachoeira', 'Barra do Sahy', '88', '11600010'),
    (7, 6, 'Estrada do Ubatumirim', 'Ubatumirim', NULL, '11680500'),
    (8, 7, 'Rua das Palmeiras', 'Parque Vitória', '410', '07850100'),
    (9, 8, 'Rua do Mangue', 'Vila Esperança', '19', '11530100'),
    (10, 9, 'Rua Teresa', 'Alto da Serra', '1020', '25685000');

-- ALERTA
INSERT INTO alerta (id_alerta, fk_id_orgao, tipo, nivel_severidade, data_emissao, status_alerta) VALUES
    (1, 1, 'Chuva forte', 'ALTO', '2026-01-12 14:30:00', 'ENCERRADO'),
    (2, 1, 'Risco de deslizamento', 'CRITICO', '2026-01-12 18:05:00', 'ENCERRADO'),
    (3, 2, 'Risco de deslizamento', 'ALTO', '2026-02-03 09:15:00', 'ENCERRADO'),
    (4, 3, 'Ressaca e maré alta', 'MEDIO', '2026-03-20 06:40:00', 'CANCELADO'),
    (5, 4, 'Fluxo de detritos', 'CRITICO', '2026-02-18 23:50:00', 'ENCERRADO'),
    (6, 5, 'Cheia de rio', 'ALTO', '2026-10-18 16:20:00', 'ATIVO'),
    (7, 6, 'Vendaval', 'MEDIO', '2026-10-19 11:00:00', 'ATIVO'),
    (8, 9, 'Tempestade severa', 'ALTO', '2026-10-20 08:10:00', 'ATIVO'),
    (9, 6, 'Onda de calor', 'BAIXO', '2026-09-05 10:00:00', 'ENCERRADO'),
    (10, 1, 'Alagamento', 'MEDIO', '2026-10-20 13:45:00', 'ATIVO');

-- PEDIDO_AJUDA   (latitude/longitude ambas preenchidas ou ambas NULL)
INSERT INTO pedido_ajuda (id_pedido, fk_id_usuario, fk_id_area_risco, descricao, data_hora_solicitacao, status, latitude, longitude) VALUES
    (1, 1, 1, 'Rachaduras surgiram na parede da casa após a chuva.', '2026-01-12 19:10:00', 'CONCLUIDO', -23.704512, -46.783210),
    (2, 2, 2, 'Água invadiu a casa, preciso retirar idosa acamada.', '2026-01-12 20:45:00', 'CONCLUIDO', -23.498120, -46.444870),
    (3, 3, 3, 'Barranco cedeu no quintal, família quer ir para abrigo.', '2026-02-03 10:30:00', 'CONCLUIDO', -23.931560, -46.338900),
    (4, 4, 4, 'Lama bloqueando a única saída da rua.', '2026-02-04 07:20:00', 'CANCELADO', NULL, NULL),
    (5, 5, 5, 'Família ilhada no segundo andar, com duas crianças.', '2026-02-19 00:15:00', 'CONCLUIDO', -23.773010, -45.678420),
    (6, 6, 6, 'Ponte da estrada foi levada pela correnteza.', '2026-10-18 17:05:00', 'EM_ATENDIMENTO', -23.358640, -44.893120),
    (7, 7, 7, 'Água subindo rápido na rua, pedimos orientação.', '2026-10-19 12:30:00', 'EM_ATENDIMENTO', -23.330210, -46.727780),
    (8, 8, 8, 'Telhado arrancado pelo vento, chovendo dentro de casa.', '2026-10-20 08:40:00', 'ABERTO', -23.884300, -46.425610),
    (9, 9, 9, 'Pedras rolando da encosta atrás da casa.', '2026-10-20 09:05:00', 'ABERTO', -22.509870, -43.183450),
    (10, 10, 10, 'Rio chegou ao quintal, preciso de transporte para animais.', '2026-10-20 14:00:00', 'ABERTO', NULL, NULL);

-- =====================================================================
-- 3. TABELAS ASSOCIATIVAS (N:N)
-- =====================================================================

-- ALERTA_AREA_RISCO
INSERT INTO alerta_area_risco (fk_id_alerta, fk_id_area_risco) VALUES
    (1, 1),
    (1, 2),
    (2, 1),
    (3, 3),
    (4, 4),
    (5, 5),
    (6, 6),
    (7, 7),
    (8, 8),
    (10, 2);

-- GESTAO_ABRIGO
INSERT INTO gestao_abrigo (fk_id_orgao, fk_id_abrigo, data_inicio_gestao) VALUES
    (1, 1, '2025-11-01'),
    (1, 2, '2025-11-01'),
    (8, 2, '2026-01-13'),
    (2, 3, '2026-02-03'),
    (1, 4, '2026-01-12'),
    (3, 5, '2026-03-20'),
    (4, 6, '2026-02-19'),
    (5, 7, '2026-10-18'),
    (6, 8, '2026-10-19'),
    (10, 10, '2026-10-20');

-- EVENTO_AREA_RISCO
INSERT INTO evento_area_risco (fk_id_evento, fk_id_area_risco, data_ocorrencia) VALUES
    (4, 1, '2026-01-12 17:40:00'),
    (1, 2, '2026-01-12 19:30:00'),
    (4, 3, '2026-02-03 08:50:00'),
    (5, 4, '2026-03-20 05:30:00'),
    (4, 5, '2026-02-18 23:30:00'),
    (3, 6, '2026-10-18 15:00:00'),
    (2, 7, '2026-10-19 11:45:00'),
    (6, 8, '2026-10-20 07:55:00'),
    (8, 9, '2026-10-20 08:30:00'),
    (1, 10, '2026-10-20 12:20:00');

COMMIT;

-- =====================================================================
-- 4. CONFERÊNCIA RÁPIDA — deve retornar 10 em todas as linhas
-- =====================================================================
SELECT 'localidade' AS tabela, COUNT(*) AS qtd FROM localidade
UNION ALL SELECT 'orgao_responsavel', COUNT(*) FROM orgao_responsavel
UNION ALL SELECT 'abrigo', COUNT(*) FROM abrigo
UNION ALL SELECT 'usuario', COUNT(*) FROM usuario
UNION ALL SELECT 'evento_climatico', COUNT(*) FROM evento_climatico
UNION ALL SELECT 'area_risco', COUNT(*) FROM area_risco
UNION ALL SELECT 'endereco_area_risco', COUNT(*) FROM endereco_area_risco
UNION ALL SELECT 'alerta', COUNT(*) FROM alerta
UNION ALL SELECT 'pedido_ajuda', COUNT(*) FROM pedido_ajuda
UNION ALL SELECT 'alerta_area_risco', COUNT(*) FROM alerta_area_risco
UNION ALL SELECT 'gestao_abrigo', COUNT(*) FROM gestao_abrigo
UNION ALL SELECT 'evento_area_risco', COUNT(*) FROM evento_area_risco;

SELECT
    l.nome AS localidade,
    ar.nome AS area_risco,
    ar.zona,
    CONCAT(e.logradouro, ', ', COALESCE(e.numero, 'S/N'), ' - ', e.bairro, ' - CEP ', e.cep) AS endereco_area,
    ec.nome AS evento_climatico,
    ear.data_ocorrencia,
    a.tipo AS alerta,
    a.nivel_severidade,
    a.status_alerta,
    pa.id_pedido,
    pa.descricao AS pedido_ajuda,
    pa.status AS status_pedido,
    pa.data_hora_solicitacao,
    u.nome AS usuario,
    u.telefone AS telefone_usuario,
    o.nome AS orgao_responsavel,
    ab.nome AS abrigo,
    ab.vagas_disponiveis,
    ga.data_inicio_gestao
FROM localidade l
INNER JOIN area_risco ar ON ar.fk_id_localidade = l.id_localidade
INNER JOIN endereco_area_risco e ON e.fk_id_area_risco = ar.id_area_risco
INNER JOIN evento_area_risco ear ON ear.fk_id_area_risco = ar.id_area_risco
INNER JOIN evento_climatico ec ON ec.id_evento_climatico = ear.fk_id_evento
INNER JOIN alerta_area_risco aar ON aar.fk_id_area_risco = ar.id_area_risco
INNER JOIN alerta a ON a.id_alerta = aar.fk_id_alerta
INNER JOIN pedido_ajuda pa ON pa.fk_id_area_risco = ar.id_area_risco
INNER JOIN usuario u ON u.id_usuario = pa.fk_id_usuario
INNER JOIN orgao_responsavel o ON o.id_orgao = a.fk_id_orgao
INNER JOIN gestao_abrigo ga ON ga.fk_id_orgao = o.id_orgao
INNER JOIN abrigo ab ON ab.id_abrigo = ga.fk_id_abrigo
ORDER BY l.nome, ar.nome, endereco_area, pa.id_pedido, a.id_alerta, ab.nome;

