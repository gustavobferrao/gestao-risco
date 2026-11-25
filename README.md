# SafeZone: gestão de riscos climáticos

Aplicação web para gestão de riscos climáticos em áreas urbanas. A ideia central é que a população consiga **se precaver de catástrofes climáticas** (enchentes, alagamentos, deslizamentos) e que os órgãos responsáveis, como a Defesa Civil, consigam **avisar e atender** quem está em risco.

O projeto tem três partes:

| Parte | Pasta | Tecnologia |
|---|---|---|
| Banco de dados | [`database/`](database/) | MySQL 8 |
| API REST | [`backend/api/`](backend/api/) | Java 21 + Spring Boot 4 |
| Front-end | [`frontend/`](frontend/) | Next.js 16 + React 19 |

---

## Sumário

- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Como rodar localmente](#como-rodar-localmente)
- [Usuários de teste](#usuários-de-teste)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [API: endpoints](#api-endpoints)
- [Autenticação e perfis](#autenticação-e-perfis)
- [Testes](#testes)
- [Status do projeto](#status-do-projeto)
- [Solução de problemas](#solução-de-problemas)

---

## Funcionalidades

### Para o morador (perfil `CIDADAO`)

- **Visão geral** com os alertas ativos da região, o abrigo recomendado e o chamado em andamento.
- **Alerta crítico em tela cheia**: quando há um alerta crítico ativo, ele cobre a tela com a instrução e a rota até o abrigo. Depois de dispensado, o mesmo alerta não volta a aparecer.
- **Mapa de riscos** (Leaflet + OpenStreetMap) com áreas de risco, abrigos e a posição do usuário, com filtros por nível de risco e por status.
- **Detalhe da área de risco**: descrição, população afetada, endereços e alertas ativos.
- **Abrigos próximos**, calculados a partir da localização do navegador, com vagas, distância, tempo estimado a pé e link de rota no Google Maps.
- **Previsão IA** e card do **El Niño**, com link para notícias externas.
- **Cadastro e login.**

### Para o agente (perfil `AGENTE`, funciona como administrador)

- **Painel** com contadores de alertas ativos, pedidos de ajuda e abrigos com vaga.
- **Alertas**: lista de alertas emitidos e emissão de alerta para uma ou mais áreas.
- **Histórico** de ocorrências climáticas e alertas, com filtros por classificação do evento e por período. O detalhe de cada área mostra também o histórico de ocorrências dela.
- **Equipe**: um agente cadastra outros agentes, que entram automaticamente no **mesmo órgão** de quem cadastrou.

> Algumas telas ainda usam dados simulados. Veja [Status do projeto](#status-do-projeto).

---

## Arquitetura

```
┌───────────────────────┐   HTTP + JSON    ┌───────────────────────┐   JPA/JDBC   ┌───────────┐
│  Front-end (Next.js)  │ ───────────────▶ │  API (Spring Boot)    │ ───────────▶ │  MySQL 8  │
│  localhost:3000       │ ◀─────────────── │  localhost:8080       │ ◀─────────── │           │
└───────────┬───────────┘                  └───────────────────────┘              └───────────┘
            │
            │  direto do navegador, sem passar pela API
            ▼
   OpenStreetMap (mapa) · Google Maps (rota) · geolocalização do navegador
```

- O front **nunca** acessa o banco: ele fala só com a API.
- O mapa, a geolocalização e a rota ficam no navegador. A API só calcula distâncias (abrigos próximos) a partir das coordenadas.
- O blueprint original do MVP, com o modelo de dados e as decisões de projeto, está em [`backend/api/docs/structure.md`](backend/api/docs/structure.md).

### Stack

| Camada | Tecnologias |
|---|---|
| Banco | MySQL 8.0.16+ (InnoDB, utf8mb4) |
| API | Java 21, Spring Boot 4.1 (Web MVC, Data JPA, Validation), Lombok, BCrypt (`spring-security-crypto`), springdoc-openapi (Swagger UI) |
| Front | Next.js 16 (App Router), React 19, Tailwind CSS 4, Leaflet + react-leaflet, lucide-react |
| Ferramentas | Maven Wrapper (`mvnw`), pnpm, Postman |

---

## Estrutura do repositório

```
gestao-risco/
├── database/
│   ├── Gestão_risco.sql          # 1º: cria o banco gestao_riscos, as tabelas e os dados de teste
│   ├── 03_ajustes_mvp.sql        # 2º: ajustes do MVP (nível de risco, coordenadas, perfil do usuário…)
│   └── 04_usuarios_teste.sql     # 3º: senhas reais para um agente e um cidadão de teste (só dev)
│
├── backend/api/
│   ├── src/main/java/br/com/gestaorisco/api/
│   │   ├── controller/           # endpoints REST
│   │   ├── service/              # regras de negócio
│   │   ├── repository/           # acesso ao banco (Spring Data JPA)
│   │   ├── model/                # entidades JPA e enums
│   │   ├── dto/                  # request/response da API
│   │   ├── handler/              # tratamento global de erros (ProblemDetail)
│   │   └── config/               # CORS e BCrypt
│   ├── src/test/                 # testes de controllers e services
│   ├── postman/                  # coleção e ambiente do Postman
│   ├── docs/structure.md         # blueprint do MVP
│   └── .env.example              # modelo das variáveis do banco
│
└── frontend/
    ├── app/                      # layout e página (App Router)
    ├── components/               # telas e componentes (morador, agente, mapa, cadastro…)
    │   └── agent/                # telas exclusivas do agente
    ├── lib/
    │   ├── api/                  # cliente HTTP, serviços, adaptadores e hook useApi
    │   ├── auth-context.jsx      # sessão do usuário logado
    │   └── …                     # hooks e utilitários (localização, máscaras, tema…)
    └── .env.example              # modelo das variáveis do front
```

---

## Como rodar localmente

### Pré-requisitos

- **MySQL 8.0.16+**
- **Java 21** (JDK). O Maven não precisa ser instalado: o projeto usa o `mvnw`.
- **Node.js 20.9+** e **pnpm** (`npm install -g pnpm`)

### 1. Banco de dados

Rode os scripts **nesta ordem**, num cliente MySQL (Workbench, DBeaver ou linha de comando):

```bash
mysql -u root -p < "database/Gestão_risco.sql"
mysql -u root -p gestao_riscos < database/03_ajustes_mvp.sql
mysql -u root -p gestao_riscos < database/04_usuarios_teste.sql
```

> ⚠️ O primeiro script começa com `DROP DATABASE IF EXISTS gestao_riscos`: ele **apaga** o banco, se já existir. O `04_usuarios_teste.sql` é só para desenvolvimento e **não deve ser rodado em produção**.

### 2. API (Spring Boot)

```bash
cd backend/api
cp .env.example .env      # depois edite o .env com o usuário e a senha do seu MySQL
./mvnw spring-boot:run    # no Windows (cmd/PowerShell): mvnw.cmd spring-boot:run
```

A API sobe em **http://localhost:8080**. Para conferir:

- `GET http://localhost:8080/api/alertas` deve devolver um JSON com os alertas
- Swagger UI: **http://localhost:8080/swagger-ui.html**

> O `.env` é lido a partir da pasta onde a API é executada: de `backend/api` (mvnw) ou da raiz do repositório (IntelliJ). Os dois caminhos já estão configurados no `application.yaml`.

### 3. Front-end (Next.js)

Em outro terminal:

```bash
cd frontend
cp .env.example .env.local
pnpm install
pnpm dev
```

Abra **http://localhost:3000**.

> A API e o front são **processos separados**: subir um não sobe o outro. Deixe os dois terminais abertos.

---

## Usuários de teste

O script [`database/04_usuarios_teste.sql`](database/04_usuarios_teste.sql) define senhas reais para dois usuários do banco de teste. **Os e-mails e senhas estão no cabeçalho do próprio script.**

| Perfil | O que abre no login |
|---|---|
| Agente (Defesa Civil, órgão 1) | Painel do agente. É o "primeiro administrador", que pode cadastrar outros agentes na aba **Equipe** |
| Cidadão | Painel do morador |

Também dá para criar um morador novo pela tela **Criar conta**.

> Os demais usuários do script principal têm senhas fictícias e **não** conseguem fazer login.

---

## Variáveis de ambiente

### API: `backend/api/.env`

| Variável | Exemplo | Descrição |
|---|---|---|
| `DB_URL` | `jdbc:mysql://localhost:3306/gestao_riscos` | URL JDBC do banco |
| `DB_USERNAME` | `root` | Usuário do MySQL |
| `DB_PASSWORD` | *(sua senha)* | Senha do MySQL |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` | *Opcional.* Origens liberadas para o front, separadas por vírgula. O padrão é `http://localhost:3000` |

### Front: `frontend/.env.local`

| Variável | Exemplo | Descrição |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080` | URL base da API, sem barra no final |
| `NEXT_PUBLIC_MAP_TILES_URL` | `https://tile.openstreetmap.org/{z}/{x}/{y}.png` | *Opcional.* Servidor dos blocos do mapa. Em produção, use um provedor próprio: o servidor público do OSM não é para uso intenso |

> Nunca commite `.env` nem `.env.local`: os dois já estão no `.gitignore`.

---

## API: endpoints

Base: `http://localhost:8080`. Todas as respostas são JSON. Os erros seguem o padrão **ProblemDetail** (RFC 9457), com `status`, `detail` e, em erros de validação, `campos` (erros por campo).

**Usuário** indica que a rota exige o cabeçalho `X-Usuario-Id` (veja [Autenticação](#autenticação-e-perfis)).

| Método | Rota | Usuário | Descrição |
|---|---|---|---|
| `POST` | `/api/auth/cadastro` | — | Cadastro público (sempre cria `CIDADAO`) |
| `POST` | `/api/auth/login` | — | Login; devolve `id`, `nome`, `perfil`, `orgaoId` e `orgaoNome` |
| `POST` | `/api/agentes` | agente | Um agente cadastra outro agente (no mesmo órgão) |
| `GET` | `/api/alertas` | — | Lista alertas (filtros: `status`, `areaId`) |
| `POST` | `/api/alertas` | agente | Emite alerta para uma ou mais áreas |
| `PATCH` | `/api/alertas/{id}/status` | agente | Encerra ou cancela um alerta do próprio órgão |
| `GET` | `/api/areas-risco` | — | Lista áreas (filtros: `localidadeId`, `nivel`, `zona`) |
| `GET` | `/api/areas-risco/{id}` | — | Detalhe: endereços, alertas ativos e histórico |
| `GET` | `/api/areas-risco/{id}/historico` | — | Histórico de ocorrências da área |
| `POST` | `/api/areas-risco/{id}/ocorrencias` | agente | Registra uma ocorrência climática na área |
| `GET` | `/api/abrigos/proximos` | — | Abrigos mais próximos (`lat`, `lng`, `limite` opcional) |
| `GET` | `/api/localidades` | — | Lista localidades |
| `GET` | `/api/eventos-climaticos` | — | Catálogo de eventos climáticos |
| `POST` | `/api/pedidos-ajuda` | usuário | Cidadão abre um pedido de ajuda |
| `GET` | `/api/pedidos-ajuda/meus` | usuário | Pedidos do próprio usuário |
| `GET` | `/api/pedidos-ajuda` | agente | Fila de pedidos (filtro `status`; padrão `ABERTO`) |
| `PATCH` | `/api/pedidos-ajuda/{id}/status` | agente | Avança o pedido (`ABERTO` → `EM_ATENDIMENTO` → `CONCLUIDO`, ou `CANCELADO`) |

A coleção do Postman com exemplos de todas as rotas está em [`backend/api/postman/`](backend/api/postman/). Importe a coleção e o ambiente `local`.

---

## Autenticação e perfis

- O **perfil vem do banco**: no login, a API devolve `CIDADAO` ou `AGENTE`, e o front abre o painel correspondente.
- O **cadastro público** sempre cria cidadão. **Agentes** são cadastrados por outro agente (aba **Equipe**) e herdam o órgão dele. O primeiro agente vem do script `04_usuarios_teste.sql`.
- As senhas são guardadas com **BCrypt**.
- Hoje a API identifica o usuário pelo cabeçalho **`X-Usuario-Id`**, que o front envia automaticamente após o login. A sessão fica salva no navegador.

> ⚠️ **Limitação conhecida:** sem token, qualquer pessoa que conheça a API pode enviar outro `X-Usuario-Id`. Isso serve para desenvolvimento e MVP, mas **antes de publicar** é obrigatório implementar **JWT + Spring Security** (veja o roadmap). No front, a troca fica concentrada em `frontend/lib/api/client.js`.

---

## Testes

### API

```bash
cd backend/api
./mvnw test
```

Testes de controllers (`@WebMvcTest`) e de services (Mockito), cobrindo validações, códigos de status e regras de negócio.

### Front

```bash
cd frontend
pnpm build    # garante que o projeto compila
```

---

## Status do projeto

### ✅ Integrado à API

- Login, cadastro de morador, sessão e logout
- Cadastro de agentes pela aba Equipe
- Alertas (listagem, com atualização automática a cada 60 s)
- Áreas de risco, mapa real e detalhe da área
- Abrigos próximos pela localização do navegador
- Histórico de ocorrências do agente
- Lista de áreas no modal de novo alerta

### 🟡 Ainda simulado no front

| Funcionalidade | O que falta |
|---|---|
| Emitir e encerrar alerta | Ligar a `POST /api/alertas` e `PATCH /status`; hoje aparece com o selo "NÃO SALVO" |
| SOS e "Meu chamado" | Ligar a `POST /api/pedidos-ajuda` e `GET /meus` |
| Fila de pedidos do agente | Ligar a `GET /api/pedidos-ajuda` e `PATCH /status` |
| Lista e cadastro de abrigos do agente | A API ainda não tem endpoint para listar ou cadastrar abrigos |
| Previsão IA e El Niño | Não há endpoint; os textos são fixos |
| Pets nos abrigos e instrução do alerta | Não existem no banco nem na API |

### 🔜 Roadmap

1. Integrar as ações de escrita (alertas, SOS, fila de pedidos)
2. Autenticação com **JWT + Spring Security**
3. Endpoints de abrigos para o agente e `GET /api/ocorrencias` (histórico geral sem 1 + N requisições)
4. Provedor de mapas próprio para produção

---

## Solução de problemas

| Sintoma | Causa provável e solução |
|---|---|
| Front mostra "Não foi possível conectar ao servidor" | A API não está rodando ou `NEXT_PUBLIC_API_URL` está errada. Suba a API e confira o `.env.local` |
| Erro de **CORS** no console do navegador | O front está numa porta diferente de 3000. Rode na 3000 ou ajuste `CORS_ALLOWED_ORIGINS` na API |
| `pnpm dev` para logo na primeira execução com aviso de segurança do Next.js | É um aviso de atualização do Next. Rode o comando de novo; a solução definitiva é atualizar o Next.js |
| Login sempre responde "E-mail ou senha inválidos" | O `04_usuarios_teste.sql` não foi aplicado; os usuários do seed têm senhas fictícias |
| A API não sobe: erro de conexão com o banco | Confira o MySQL ligado e o `DB_URL`, o `DB_USERNAME` e o `DB_PASSWORD` no `backend/api/.env` |
| Abrigos calculados a partir do centro de São Paulo | O navegador negou a localização. Permita a localização para o site |
| O alerta crítico em tela cheia não aparece mais | Ele já foi dispensado nesse navegador. Para rever, apague a chave `safezone.alertasDispensados.<id do usuário>` no localStorage |
