# Blueprint do MVP de Gestão de Áreas de Risco

Estrutura do projeto fullstack a partir do banco `gestao_riscos`: o que cada parte faz, o que o banco já suporta, o que precisa de ajuste e em que ordem construir para caber em um prazo curto.

- MySQL 8
- Java 21
- Spring Boot (Web, Data JPA, Validation)
- springdoc / Swagger UI
- Frontend SPA a definir
- Leaflet + OpenStreetMap

## 01Arquitetura

Três camadas, um único deploy de API. O mapa, a geolocalização e a rota ficam no navegador, o que tira da API todo o trabalho de cartografia.

A API só fala com o MySQL. Serviços de mapa e rota (linha tracejada) são chamados direto pelo navegador e não exigem chave de API no caso do OpenStreetMap.

## 02O que o banco já suporta

Cruzei as cinco funcionalidades que você descreveu com as tabelas do script. Uma funciona como está, duas pedem um ajuste pequeno e duas estão bloqueadas por falta de coluna.

| Funcionalidade | Tabelas | Situação | O que falta |
| --- | --- | --- | --- |
| Consultar áreas e seu nível de risco | `localidade` `area_risco` `endereco_area_risco` | ajuste | Não há coluna de nível de risco nem coordenada para pôr a área no mapa. |
| Histórico de acontecimentos da área | `evento_area_risco` `evento_climatico` `alerta_area_risco` | bloqueio | A chave primária `(evento, área)` impede registrar a segunda enchente na mesma área. Do jeito atual, não é um histórico. |
| Órgão emite alerta para áreas | `alerta` `alerta_area_risco` `orgao_responsavel` | ajuste | Os dados estão prontos. Falta saber quem está logado: `usuario` não tem perfil nem vínculo com órgão. |
| Abrigos próximos e rota | `abrigo` `gestao_abrigo` | bloqueio | `abrigo` só tem endereço em texto. Sem latitude e longitude não dá para calcular distância. |
| Solicitar socorro | `pedido_ajuda` `usuario` | pronto | Funciona. Sugestão: tornar a área opcional, porque quem pede ajuda pode estar fora de uma área cadastrada. |

## 03Modelo de dados com os ajustes

As 12 tabelas do seu script. Em laranja, o que o script de ajustes acrescenta: nível e coordenadas na área, coordenadas no abrigo, id próprio na ocorrência de evento, perfil e órgão no usuário.

O script abaixo aplica os cinco ajustes e preenche as novas colunas nos dados de teste. Não consegui executá-lo contra um MySQL neste ambiente, então rode em uma cópia primeiro. As coordenadas são aproximadas.

```
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
```

## 04Estrutura de pastas

Um repositório só, organizado por camada no backend. Para um MVP com cinco recursos, é o formato mais rápido de navegar e de explicar em uma apresentação.

```
gestao-riscos/
├── docker-compose.yml              # MySQL 8 local
├── database/
│   ├── 01_schema.sql               # seu DDL
│   ├── 02_seed.sql                 # seus dados de teste
│   └── 03_ajustes_mvp.sql          # ajustes da seção 03
├── backend/
│   ├── pom.xml
│   └── src/main/
│       ├── resources/application.yml
│       └── java/br/com/gestaoriscos/
│           ├── GestaoRiscosApplication.java
│           ├── config/             # CorsConfig, OpenApiConfig, (SecurityConfig)
│           ├── model/              # entidades JPA
│           │   └── enums/          # Zona, NivelRisco, Severidade, StatusAlerta, StatusPedido, Perfil
│           ├── repository/         # interfaces JpaRepository
│           ├── dto/                # records de entrada e saída
│           ├── service/            # AreaRisco, Alerta, Abrigo, PedidoAjuda, Auth
│           ├── controller/         # um por recurso
│           └── exception/          # GlobalExceptionHandler (@RestControllerAdvice)
└── frontend/
    └── src/
        ├── api/                    # cliente HTTP, um arquivo por recurso
        ├── pages/                  # uma por tela
        └── components/             # Mapa, CartaoArea, SeloSeveridade, LinhaDoTempo
```

### Mapeamento JPA

- 11 entidades: as 9 tabelas com id, mais `GestaoAbrigo` e `OcorrenciaEvento` (a `evento_area_risco` com id próprio).
- `alerta_area_risco` não vira entidade: é um `@ManyToMany` dentro de `Alerta`.
- Colunas com CHECK de lista viram enum com `@Enumerated(EnumType.STRING)`.

### Configuração

- `spring.jpa.hibernate.ddl-auto=none`. O SQL é a fonte da verdade, o Hibernate não cria nem altera nada.
- Se preferir `validate`, as colunas `CHAR` (cpf, cnpj, cep) precisam de `columnDefinition` na entidade.
- CORS liberado para a origem do frontend em `CorsConfig`.

### Regras que ficam no service

- Só agente emite alerta, e sempre em nome do próprio órgão.
- Alerta nasce `ATIVO` com pelo menos uma área.
- Pedido sem área informada recebe a área cadastrada mais próxima, se houver uma a poucos km.
- Vagas nunca passam da capacidade (o CHECK do banco já barra, o service devolve um erro legível).

## 05Endpoints da API

Dezesseis rotas cobrem o fluxo inteiro. O Swagger UI do springdoc serve de documentação e de ferramenta de teste antes de o frontend existir.

| Método | Rota | O que faz | Quem usa |
| --- | --- | --- | --- |
| GET | `/api/areas-risco?localidadeId=&nivel=&zona=` | Lista áreas com nível de risco e quantidade de alertas ativos | público |
| GET | `/api/areas-risco/{id}` | Detalhe da área com endereços e alertas ativos | público |
| GET | `/api/areas-risco/{id}/historico` | Linha do tempo: eventos ocorridos e alertas emitidos, por data | público |
| GET | `/api/localidades` | Lista para o filtro de localidade | público |
| GET | `/api/eventos-climaticos` | Catálogo para os formulários do agente | público |
| GET | `/api/alertas?status=ATIVO&areaId=` | Alertas em vigor. O frontend consulta a cada 30 a 60 s | público |
| GET | `/api/abrigos/proximos?lat=&lng=&limite=5` | Abrigos com vaga, ordenados por distância | público |
| POST | `/api/auth/cadastro` | Cria cidadão, grava a senha com BCrypt | público |
| POST | `/api/auth/login` | Devolve usuário, perfil e órgão (e o token, quando houver JWT) | público |
| POST | `/api/pedidos-ajuda` | Abre pedido com descrição e coordenadas | cidadão |
| GET | `/api/pedidos-ajuda/meus` | Pedidos do usuário e a situação de cada um | cidadão |
| POST | `/api/alertas` | Emite alerta para uma ou mais áreas | agente |
| PATCH | `/api/alertas/{id}/status` | Encerra ou cancela alerta | agente |
| POST | `/api/areas-risco/{id}/ocorrencias` | Registra evento climático ocorrido na área | agente |
| GET | `/api/pedidos-ajuda?status=ABERTO` | Fila de pedidos para atendimento | agente |
| PATCH | `/api/pedidos-ajuda/{id}/status` | Move o pedido para em atendimento ou concluído | agente |

```
// POST /api/alertas
{ "tipo": "Risco de deslizamento", "nivelSeveridade": "CRITICO", "areasRiscoIds": [1, 3] }

// POST /api/pedidos-ajuda
{ "descricao": "Água subindo rápido na rua", "latitude": -23.330210, "longitude": -46.727780 }

// GET /api/abrigos/proximos?lat=-23.55&lng=-46.63  (um item da resposta)
{ "id": 2, "nome": "Abrigo Ginásio Municipal Central", "vagasDisponiveis": 350,
  "telefone": "1131000102", "latitude": -23.5505, "longitude": -46.6333, "distanciaKm": 0.4 }
```

## 06Telas do frontend

A divisão vale para qualquer tecnologia. Se ainda não houver preferência, React com Vite e react-leaflet é o caminho com mais exemplos prontos para mapa. Angular atende igual se a equipe já conhece.

### Cidadão

- **Mapa de áreas**: marcadores coloridos pelo nível de risco, faixa no topo quando há alerta ativo.
- **Detalhe da área**: descrição, endereços, alertas em vigor e linha do tempo do histórico.
- **Abrigos próximos**: pede a localização, lista por distância com vagas, botão de rota.
- **Pedir socorro**: descrição curta, localização capturada automaticamente, um toque para enviar.
- **Meus pedidos**: situação de cada solicitação.

### Agente do órgão

- **Emitir alerta**: tipo, severidade, seleção de áreas.
- **Alertas do órgão**: encerrar ou cancelar.
- **Fila de pedidos**: abertos primeiro, com ponto no mapa e telefone do solicitante.
- **Registrar ocorrência**: evento, área, data e hora.

### Rota até o abrigo

Mais simples: um link que abre o Google Maps com origem e destino preenchidos, sem chave de API.

`google.com/maps/dir/?api=1&origin=LAT,LNG&destination=LAT,LNG`

Mais completo: desenhar a rota no próprio Leaflet com o servidor público de demonstração do OSRM. Serve para apresentação, não para produção.

### Severidade na interface

BAIXOMEDIOALTOCRITICO

## 07Ordem de construção

Cada etapa termina com algo demonstrável. Se o prazo apertar, as três primeiras já formam um MVP.

1. **Banco e leitura**Aplicar os ajustes, criar o projeto no Spring Initializr, mapear entidades e entregar os GET de áreas, histórico e alertas. Testar pelo Swagger.
2. **Ações**Abrigos próximos, abrir pedido de ajuda, emitir e encerrar alerta. Login simples que devolve o perfil, sem token.
3. **Frontend do cidadão**Mapa, detalhe com histórico, abrigos com link de rota, pedir socorro.
4. **Painel do agente**Emitir alerta, fila de pedidos, registrar ocorrência.
5. **Acabamento**JWT com Spring Security, rota desenhada no mapa, Docker Compose com API e banco.

## 08Observações e ideias

### Sobre o script atual

- Separe em `01_schema.sql` e `02_seed.sql`. O comentário do seed já cita um arquivo de DDL separado.
- `DROP DATABASE` no topo é prático no protótipo e perigoso depois que houver dados reais.
- O SELECT final junta pedidos, alertas e abrigos sem relação entre si, então multiplica linhas. Serve como demonstração de JOIN, não como base de endpoint.
- Os índices só de coluna de FK são dispensáveis: o InnoDB já cria um para cada FK.

### Decisões para alinhar

- **Envio de alertas**: no MVP o app consulta alertas ativos periodicamente. Notificação de verdade (push, SMS, e-mail) fica para depois.
- **Autenticação**: login sem token entrega rápido, mas qualquer um chama a API como agente. Aceitável em demonstração, não em uso real.
- **Nível de risco**: coluna fixa na área é o mais simples. Alternativa é calcular a partir dos alertas ativos e da frequência de eventos.

### Depois do MVP

- Área como polígono (`GEOMETRY` com índice espacial) para saber se o usuário está dentro dela.
- Check-in no abrigo em vez de contador de vagas editado à mão.
- Órgão atendente e histórico de status no pedido de ajuda.
- Alertas alimentados por fontes oficiais como INMET e CEMADEN.
- Flyway para versionar o banco, PWA para funcionar com sinal ruim.

Gerado a partir de Gest_o_risco.sql. Os ajustes de banco são propostas e não foram executados em um MySQL.

# Full path of requests:
JSON body ──► AlertaRequest ──@Valid──► Controller ──► AlertaService.emitir()
                                                          │ builds Alerta entity
                                                          │ save()
                                                          ▼
JSON reply ◄── AlertaResponse ◄── AlertaResponse.from(alerta)