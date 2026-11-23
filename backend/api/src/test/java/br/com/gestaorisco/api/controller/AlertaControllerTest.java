package br.com.gestaorisco.api.controller;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.assertj.MockMvcTester;

import br.com.gestaorisco.api.dto.response.AlertaResponse;
import br.com.gestaorisco.api.exception.AcessoNegadoException;
import br.com.gestaorisco.api.exception.RecursoNaoEncontradoException;
import br.com.gestaorisco.api.exception.RegraNegocioException;
import br.com.gestaorisco.api.model.enums.Severidade;
import br.com.gestaorisco.api.model.enums.StatusAlerta;
import br.com.gestaorisco.api.service.AlertaService;

@WebMvcTest(AlertaController.class)
class AlertaControllerTest {
    
    @Autowired MockMvcTester mvc;
    @MockitoBean AlertaService alertaService;

    private static final String BODY_VALIDO = """
{"tipo": "Risco de deslizamento", "nivelSeveridade": "CRITICO", "areasRiscoIds": [1,3]}
            """;


// caminho feliz: status certo + corpo certo
@Test
void emitir_valido_retorna201(){
    var resposta = new AlertaResponse(10, "Risco de deslizamento",Severidade.CRITICO,
    StatusAlerta.ATIVO,LocalDateTime.of(2026, 11, 23, 10, 0), 1, "Defesa Civil", List.of());
    when(alertaService.emitir(any(), eq(1))).thenReturn(resposta);

    assertThat(mvc.post().uri("/api/alertas")
                .header("X-Usuario-Id", 1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(BODY_VALIDO))
            .hasStatus(HttpStatus.CREATED)
            .bodyJson().extractingPath("$.id").isEqualTo(10);
}

// 2) Validação do DTO: 400, e o service nem é chamado
    @Test
    void emitir_semTipo_retorna400() {
        assertThat(mvc.post().uri("/api/alertas")
                .header("X-Usuario-Id", 1)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"nivelSeveridade":"CRITICO","areasRiscoIds":[1]}
                    """))
            .hasStatus(HttpStatus.BAD_REQUEST)
            .bodyJson().extractingPath("$.campos.tipo").isEqualTo("Tipo é obrigatório");

        verifyNoInteractions(alertaService);
    }

    // 3) Exceção do service vira o status certo pelo GlobalExceptionHandler
    @Test
    void emitir_cidadao_retorna403() {
        when(alertaService.emitir(any(), eq(2)))
            .thenThrow(new AcessoNegadoException("Operação permitida apenas para agentes."));

        assertThat(mvc.post().uri("/api/alertas")
                .header("X-Usuario-Id", 2)
                .contentType(MediaType.APPLICATION_JSON)
                .content(BODY_VALIDO))
            .hasStatus(HttpStatus.FORBIDDEN);
    }

    // 4) Parâmetro de query inválido (enum que não existe)
    @Test
    void listar_statusInvalido_retorna400() {
        assertThat(mvc.get().uri("/api/alertas?status=XYZ"))
            .hasStatus(HttpStatus.BAD_REQUEST);
    }

    // ---- PATCH /api/alertas/{id}/status ----

    // 5) caminho feliz: encerra o alerta, id do path e status do corpo repassados
    @Test
    void alterarStatus_encerrar_retorna200() {
        var encerrado = new AlertaResponse(10, "Risco de deslizamento", Severidade.CRITICO,
            StatusAlerta.ENCERRADO, LocalDateTime.of(2026, 11, 23, 10, 0), 1, "Defesa Civil", List.of());
        when(alertaService.alterarStatus(10, StatusAlerta.ENCERRADO, 1)).thenReturn(encerrado);

        assertThat(mvc.patch().uri("/api/alertas/10/status")
                .header("X-Usuario-Id", 1)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"status":"ENCERRADO"}
                    """))
            .hasStatus(HttpStatus.OK)
            .bodyJson().extractingPath("$.status").isEqualTo("ENCERRADO");
    }

    // 6) corpo sem status: 400 pelo @NotNull, service nem é chamado
    @Test
    void alterarStatus_semStatus_retorna400() {
        assertThat(mvc.patch().uri("/api/alertas/10/status")
                .header("X-Usuario-Id", 1)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .hasStatus(HttpStatus.BAD_REQUEST)
            .bodyJson().extractingPath("$.campos.status").isEqualTo("Status é obrigatório");

        verifyNoInteractions(alertaService);
    }

    // 7) status que não existe no enum: JSON ilegível, 400
    @Test
    void alterarStatus_statusInexistente_retorna400() {
        assertThat(mvc.patch().uri("/api/alertas/10/status")
                .header("X-Usuario-Id", 1)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"status":"PAUSADO"}
                    """))
            .hasStatus(HttpStatus.BAD_REQUEST);

        verifyNoInteractions(alertaService);
    }

    // 8) alerta inexistente: 404
    @Test
    void alterarStatus_alertaInexistente_retorna404() {
        when(alertaService.alterarStatus(99, StatusAlerta.ENCERRADO, 1))
            .thenThrow(new RecursoNaoEncontradoException("Alerta 99 não encontrado"));

        assertThat(mvc.patch().uri("/api/alertas/99/status")
                .header("X-Usuario-Id", 1)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"status":"ENCERRADO"}
                    """))
            .hasStatus(HttpStatus.NOT_FOUND);
    }

    // 9) alerta de outro órgão: 403
    @Test
    void alterarStatus_outroOrgao_retorna403() {
        when(alertaService.alterarStatus(10, StatusAlerta.CANCELADO, 3))
            .thenThrow(new AcessoNegadoException("Alerta pertence a outro órgão"));

        assertThat(mvc.patch().uri("/api/alertas/10/status")
                .header("X-Usuario-Id", 3)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"status":"CANCELADO"}
                    """))
            .hasStatus(HttpStatus.FORBIDDEN);
    }

    // 10) transição inválida (ex.: voltar para ATIVO): regra de negócio, 422
    @Test
    void alterarStatus_transicaoInvalida_retorna422() {
        when(alertaService.alterarStatus(10, StatusAlerta.ATIVO, 1))
            .thenThrow(new RegraNegocioException("Novo status deve ser ENCERRADO ou CANCELADO"));

        assertThat(mvc.patch().uri("/api/alertas/10/status")
                .header("X-Usuario-Id", 1)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"status":"ATIVO"}
                    """))
            .hasStatus(HttpStatus.UNPROCESSABLE_CONTENT)
            .bodyJson().extractingPath("$.detail").isEqualTo("Novo status deve ser ENCERRADO ou CANCELADO");
    }
}
