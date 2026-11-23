package br.com.gestaorisco.api.controller;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.assertj.MockMvcTester;

import br.com.gestaorisco.api.dto.response.PedidoAjudaResponse;
import br.com.gestaorisco.api.exception.AcessoNegadoException;
import br.com.gestaorisco.api.exception.RecursoNaoEncontradoException;
import br.com.gestaorisco.api.exception.RegraNegocioException;
import br.com.gestaorisco.api.model.enums.StatusPedido;
import br.com.gestaorisco.api.service.PedidoAjudaService;

@WebMvcTest(PedidoAjudaController.class)
class PedidoAjudaControllerTest {

    @Autowired MockMvcTester mvc;
    @MockitoBean PedidoAjudaService pedidoAjudaService;

    private static final String BODY_VALIDO = """
            {"descricao":"Água entrando em casa, preciso sair com duas crianças",
             "latitude":-23.704500,"longitude":-46.783200}
            """;

    private static final PedidoAjudaResponse PEDIDO = new PedidoAjudaResponse(
            15, "Água entrando em casa, preciso sair com duas crianças", StatusPedido.ABERTO,
            LocalDateTime.of(2026, 11, 23, 14, 0),
            new BigDecimal("-23.704500"), new BigDecimal("-46.783200"),
            1, "Morro do Socó", 7, "Maria Silva");

    // 1) caminho feliz: 201, status ABERTO e usuário do header repassado
    @Test
    void abrir_valido_retorna201() {
        when(pedidoAjudaService.abrir(any(), eq(7))).thenReturn(PEDIDO);

        var resposta = assertThat(mvc.post().uri("/api/pedidos-ajuda")
                .header("X-Usuario-Id", 7)
                .contentType(MediaType.APPLICATION_JSON)
                .content(BODY_VALIDO))
            .hasStatus(HttpStatus.CREATED)
            .bodyJson();
        resposta.extractingPath("$.id").isEqualTo(15);
        resposta.extractingPath("$.status").isEqualTo("ABERTO");
        resposta.extractingPath("$.areaRiscoNome").isEqualTo("Morro do Socó");
    }

    // 2) validação do DTO: descrição ausente, service nem é chamado
    @Test
    void abrir_semDescricao_retorna400() {
        assertThat(mvc.post().uri("/api/pedidos-ajuda")
                .header("X-Usuario-Id", 7)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"latitude":-23.7045,"longitude":-46.7832}
                    """))
            .hasStatus(HttpStatus.BAD_REQUEST)
            .bodyJson().extractingPath("$.campos.descricao").isEqualTo("Descrição é obrigatória");

        verifyNoInteractions(pedidoAjudaService);
    }

    // 3) validação de classe (@AssertTrue): latitude sem longitude
    @Test
    void abrir_latitudeSemLongitude_retorna400() {
        assertThat(mvc.post().uri("/api/pedidos-ajuda")
                .header("X-Usuario-Id", 7)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"descricao":"Preciso de ajuda","latitude":-23.7045}
                    """))
            .hasStatus(HttpStatus.BAD_REQUEST)
            .bodyJson().extractingPath("$.campos.coordenadasConsistentes")
                .isEqualTo("Latitude e longitude devem ser informadas juntas");

        verifyNoInteractions(pedidoAjudaService);
    }

    // 4) área informada que não existe: exceção do service vira 404
    @Test
    void abrir_areaInexistente_retorna404() {
        when(pedidoAjudaService.abrir(any(), eq(7)))
            .thenThrow(new RecursoNaoEncontradoException("Área risco 99 não encontrada."));

        assertThat(mvc.post().uri("/api/pedidos-ajuda")
                .header("X-Usuario-Id", 7)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"descricao":"Preciso de ajuda","areaRiscoId":99}
                    """))
            .hasStatus(HttpStatus.NOT_FOUND);
    }

    // 5) meus pedidos: lista do usuário do header
    @Test
    void meus_retorna200() {
        when(pedidoAjudaService.meus(7)).thenReturn(List.of(PEDIDO));

        var resposta = assertThat(mvc.get().uri("/api/pedidos-ajuda/meus")
                .header("X-Usuario-Id", 7))
            .hasStatus(HttpStatus.OK)
            .bodyJson();
        resposta.extractingPath("$.length()").isEqualTo(1);
        resposta.extractingPath("$[0].usuarioId").isEqualTo(7);
    }

    // 6) usuário sem pedidos: 200 com lista vazia
    @Test
    void meus_semPedidos_retornaListaVazia() {
        when(pedidoAjudaService.meus(8)).thenReturn(List.of());

        assertThat(mvc.get().uri("/api/pedidos-ajuda/meus")
                .header("X-Usuario-Id", 8))
            .hasStatus(HttpStatus.OK)
            .bodyJson().extractingPath("$").asArray().isEmpty();
    }

    // 6b) sem o header X-Usuario-Id: 400 informando o header, service nem é chamado
    @Test
    void meus_semHeaderUsuario_retorna400() {
        assertThat(mvc.get().uri("/api/pedidos-ajuda/meus"))
            .hasStatus(HttpStatus.BAD_REQUEST)
            .bodyJson().extractingPath("$.detail").isEqualTo("Cabeçalho obrigatório ausente: X-Usuario-Id");

        verifyNoInteractions(pedidoAjudaService);
    }

    // ---- agente: GET /api/pedidos-ajuda?status= ----

    // 7) fila sem filtro: status chega null (o service aplica ABERTO)
    @Test
    void fila_semStatus_repassaNull() {
        when(pedidoAjudaService.fila(null, 1)).thenReturn(List.of(PEDIDO));

        assertThat(mvc.get().uri("/api/pedidos-ajuda")
                .header("X-Usuario-Id", 1))
            .hasStatus(HttpStatus.OK)
            .bodyJson().extractingPath("$[0].id").isEqualTo(15);

        verify(pedidoAjudaService).fila(null, 1);
    }

    // 8) fila filtrada por status
    @Test
    void fila_comStatus_repassaParaService() {
        when(pedidoAjudaService.fila(StatusPedido.EM_ATENDIMENTO, 1)).thenReturn(List.of());

        assertThat(mvc.get().uri("/api/pedidos-ajuda?status=EM_ATENDIMENTO")
                .header("X-Usuario-Id", 1))
            .hasStatus(HttpStatus.OK);

        verify(pedidoAjudaService).fila(StatusPedido.EM_ATENDIMENTO, 1);
    }

    // 9) status inexistente na query: 400, service nem é chamado
    @Test
    void fila_statusInvalido_retorna400() {
        assertThat(mvc.get().uri("/api/pedidos-ajuda?status=XYZ")
                .header("X-Usuario-Id", 1))
            .hasStatus(HttpStatus.BAD_REQUEST);

        verifyNoInteractions(pedidoAjudaService);
    }

    // 10) cidadão tentando ver a fila: 403
    @Test
    void fila_cidadao_retorna403() {
        when(pedidoAjudaService.fila(null, 7))
            .thenThrow(new AcessoNegadoException("Operação permitida apenas para agentes."));

        assertThat(mvc.get().uri("/api/pedidos-ajuda")
                .header("X-Usuario-Id", 7))
            .hasStatus(HttpStatus.FORBIDDEN);
    }

    // ---- agente: PATCH /api/pedidos-ajuda/{id}/status ----

    // 11) caminho feliz: ABERTO -> EM_ATENDIMENTO
    @Test
    void alterarStatus_emAtendimento_retorna200() {
        var emAtendimento = new PedidoAjudaResponse(
                15, PEDIDO.descricao(), StatusPedido.EM_ATENDIMENTO, PEDIDO.dataHoraSolicitacao(),
                PEDIDO.latitude(), PEDIDO.longitude(), 1, "Morro do Socó", 7, "Maria Silva");
        when(pedidoAjudaService.alterarStatus(15, StatusPedido.EM_ATENDIMENTO, 1)).thenReturn(emAtendimento);

        assertThat(mvc.patch().uri("/api/pedidos-ajuda/15/status")
                .header("X-Usuario-Id", 1)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"status":"EM_ATENDIMENTO"}
                    """))
            .hasStatus(HttpStatus.OK)
            .bodyJson().extractingPath("$.status").isEqualTo("EM_ATENDIMENTO");
    }

    // 12) corpo sem status: 400 pelo @NotNull
    @Test
    void alterarStatus_semStatus_retorna400() {
        assertThat(mvc.patch().uri("/api/pedidos-ajuda/15/status")
                .header("X-Usuario-Id", 1)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .hasStatus(HttpStatus.BAD_REQUEST)
            .bodyJson().extractingPath("$.campos.status").isEqualTo("Status é obrigatório");

        verifyNoInteractions(pedidoAjudaService);
    }

    // 13) pedido inexistente: 404
    @Test
    void alterarStatus_pedidoInexistente_retorna404() {
        when(pedidoAjudaService.alterarStatus(99, StatusPedido.CONCLUIDO, 1))
            .thenThrow(new RecursoNaoEncontradoException("Pedido 99 não encontrado."));

        assertThat(mvc.patch().uri("/api/pedidos-ajuda/99/status")
                .header("X-Usuario-Id", 1)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"status":"CONCLUIDO"}
                    """))
            .hasStatus(HttpStatus.NOT_FOUND);
    }

    // 14) transição inválida (ABERTO -> CONCLUIDO pulando atendimento): 422
    @Test
    void alterarStatus_transicaoInvalida_retorna422() {
        when(pedidoAjudaService.alterarStatus(15, StatusPedido.CONCLUIDO, 1))
            .thenThrow(new RegraNegocioException("Transição inválida: ABERTO -> CONCLUIDO"));

        assertThat(mvc.patch().uri("/api/pedidos-ajuda/15/status")
                .header("X-Usuario-Id", 1)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"status":"CONCLUIDO"}
                    """))
            .hasStatus(HttpStatus.UNPROCESSABLE_CONTENT)
            .bodyJson().extractingPath("$.detail").isEqualTo("Transição inválida: ABERTO -> CONCLUIDO");
    }

    // 15) cidadão tentando alterar status: 403
    @Test
    void alterarStatus_cidadao_retorna403() {
        when(pedidoAjudaService.alterarStatus(15, StatusPedido.CANCELADO, 7))
            .thenThrow(new AcessoNegadoException("Operação permitida apenas para agentes."));

        assertThat(mvc.patch().uri("/api/pedidos-ajuda/15/status")
                .header("X-Usuario-Id", 7)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"status":"CANCELADO"}
                    """))
            .hasStatus(HttpStatus.FORBIDDEN);
    }
}
