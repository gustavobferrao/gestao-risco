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

import br.com.gestaorisco.api.dto.response.AreaRiscoDetalheResponse;
import br.com.gestaorisco.api.dto.response.AreaRiscoResumoResponse;
import br.com.gestaorisco.api.dto.response.HistoricoItemResponse;
import br.com.gestaorisco.api.dto.response.LocalidadeResponse;
import br.com.gestaorisco.api.exception.AcessoNegadoException;
import br.com.gestaorisco.api.exception.RecursoNaoEncontradoException;
import br.com.gestaorisco.api.model.enums.NivelRisco;
import br.com.gestaorisco.api.model.enums.Zona;
import br.com.gestaorisco.api.service.AreaRiscoService;

@WebMvcTest(AreaRiscoController.class)
class AreaRiscoControllerTest {

    @Autowired MockMvcTester mvc;
    @MockitoBean AreaRiscoService areaRiscoService;

    private static final AreaRiscoResumoResponse RESUMO = new AreaRiscoResumoResponse(
            1, "Morro do Socó", 1, "São Paulo", Zona.URBANA, NivelRisco.ALTO,
            new BigDecimal("-23.704500"), new BigDecimal("-46.783200"), 2L);

    // 1) caminho feliz da listagem, sem filtros
    @Test
    void listar_semFiltros_retorna200() {
        when(areaRiscoService.listar(null, null, null)).thenReturn(List.of(RESUMO));

        assertThat(mvc.get().uri("/api/areas-risco"))
            .hasStatus(HttpStatus.OK)
            .bodyJson().extractingPath("$[0].id").isEqualTo(1);
    }

    // 2) filtros chegam como enum e são repassados ao service como String
    @Test
    void listar_comFiltros_repassaParaService() {
        when(areaRiscoService.listar(1, NivelRisco.ALTO, Zona.URBANA)).thenReturn(List.of(RESUMO));

        assertThat(mvc.get().uri("/api/areas-risco?localidadeId=1&nivel=ALTO&zona=URBANA"))
            .hasStatus(HttpStatus.OK);

        verify(areaRiscoService).listar(1, NivelRisco.ALTO, Zona.URBANA);
    }

    // 3) enum inexistente: 400 e o service nem é chamado
    @Test
    void listar_nivelInvalido_retorna400() {
        assertThat(mvc.get().uri("/api/areas-risco?nivel=XYZ"))
            .hasStatus(HttpStatus.BAD_REQUEST);

        verifyNoInteractions(areaRiscoService);
    }

    // 4) detalhe de área existente
    @Test
    void detalhar_existente_retorna200() {
        var detalhe = new AreaRiscoDetalheResponse(1, "Morro do Socó", "Encosta com histórico de deslizamento",
                Zona.URBANA, NivelRisco.ALTO, 1200,
                new BigDecimal("-23.704500"), new BigDecimal("-46.783200"),
                new LocalidadeResponse(1, "São Paulo", 12000000, new BigDecimal("1521.11")),
                List.of(), List.of(), List.of());
        when(areaRiscoService.detalhar(1)).thenReturn(detalhe);

        var resposta = assertThat(mvc.get().uri("/api/areas-risco/1"))
            .hasStatus(HttpStatus.OK)
            .bodyJson();
        resposta.extractingPath("$.id").isEqualTo(1);
        resposta.extractingPath("$.nome").isEqualTo("Morro do Socó");
    }

    // 5) exceção do service vira 404 pelo GlobalExceptionHandler
    @Test
    void detalhar_inexistente_retorna404() {
        when(areaRiscoService.detalhar(99))
            .thenThrow(new RecursoNaoEncontradoException("Área de risco 99 não encontrada"));

        assertThat(mvc.get().uri("/api/areas-risco/99"))
            .hasStatus(HttpStatus.NOT_FOUND);
    }

    // 6) histórico da área
    @Test
    void historico_retorna200() {
        var item = new HistoricoItemResponse(5, 2, "Enchente", "Hidrológico",
                LocalDateTime.of(2026, 1, 15, 8, 30));
        when(areaRiscoService.historico(1)).thenReturn(List.of(item));

        assertThat(mvc.get().uri("/api/areas-risco/1/historico"))
            .hasStatus(HttpStatus.OK)
            .bodyJson().extractingPath("$[0].evento").isEqualTo("Enchente");
    }

    // ---- agente: POST /api/areas-risco/{id}/ocorrencias ----

    private static final String OCORRENCIA_VALIDA = """
            {"eventoId":2,"dataOcorrencia":"2026-01-15T08:30:00"}
            """;

    // 7) caminho feliz: 201, área do path e usuário do header repassados
    @Test
    void registrarOcorrencia_valida_retorna201() {
        var item = new HistoricoItemResponse(40, 2, "Enchente", "Hidrológico",
                LocalDateTime.of(2026, 1, 15, 8, 30));
        when(areaRiscoService.registrarOcorrencia(eq(5), any(), eq(1))).thenReturn(item);

        var resposta = assertThat(mvc.post().uri("/api/areas-risco/5/ocorrencias")
                .header("X-Usuario-Id", 1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(OCORRENCIA_VALIDA))
            .hasStatus(HttpStatus.CREATED)
            .bodyJson();
        resposta.extractingPath("$.id").isEqualTo(40);
        resposta.extractingPath("$.evento").isEqualTo("Enchente");
    }

    // 8) validação do DTO: sem evento, service nem é chamado
    @Test
    void registrarOcorrencia_semEvento_retorna400() {
        assertThat(mvc.post().uri("/api/areas-risco/5/ocorrencias")
                .header("X-Usuario-Id", 1)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"dataOcorrencia":"2026-01-15T08:30:00"}
                    """))
            .hasStatus(HttpStatus.BAD_REQUEST)
            .bodyJson().extractingPath("$.campos.eventoId").isEqualTo("Evento climático é obrigatório");

        verifyNoInteractions(areaRiscoService);
    }

    // 9) data no futuro: 400 pelo @PastOrPresent
    @Test
    void registrarOcorrencia_dataFutura_retorna400() {
        assertThat(mvc.post().uri("/api/areas-risco/5/ocorrencias")
                .header("X-Usuario-Id", 1)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"eventoId":2,"dataOcorrencia":"2999-01-01T00:00:00"}
                    """))
            .hasStatus(HttpStatus.BAD_REQUEST)
            .bodyJson().extractingPath("$.campos.dataOcorrencia")
                .isEqualTo("Data da ocorrência não pode estar no futuro");

        verifyNoInteractions(areaRiscoService);
    }

    // 10) cidadão tentando registrar: 403
    @Test
    void registrarOcorrencia_cidadao_retorna403() {
        when(areaRiscoService.registrarOcorrencia(eq(5), any(), eq(7)))
            .thenThrow(new AcessoNegadoException("Operação permitida apenas para agentes."));

        assertThat(mvc.post().uri("/api/areas-risco/5/ocorrencias")
                .header("X-Usuario-Id", 7)
                .contentType(MediaType.APPLICATION_JSON)
                .content(OCORRENCIA_VALIDA))
            .hasStatus(HttpStatus.FORBIDDEN);
    }

    // 11) área ou evento inexistente: 404
    @Test
    void registrarOcorrencia_areaInexistente_retorna404() {
        when(areaRiscoService.registrarOcorrencia(eq(99), any(), eq(1)))
            .thenThrow(new RecursoNaoEncontradoException("Área de risco 99 não encontrada"));

        assertThat(mvc.post().uri("/api/areas-risco/99/ocorrencias")
                .header("X-Usuario-Id", 1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(OCORRENCIA_VALIDA))
            .hasStatus(HttpStatus.NOT_FOUND);
    }
}
