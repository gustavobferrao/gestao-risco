package br.com.gestaorisco.api.controller;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.assertj.MockMvcTester;

import br.com.gestaorisco.api.dto.response.LocalidadeResponse;
import br.com.gestaorisco.api.service.LocalidadeService;

@WebMvcTest(LocalidadeController.class)
class LocalidadeControllerTest {

    @Autowired MockMvcTester mvc;
    @MockitoBean LocalidadeService localidadeService;

    // 1) caminho feliz: devolve a lista na ordem que o service entregou
    @Test
    void listar_retorna200() {
        when(localidadeService.listar()).thenReturn(List.of(
                new LocalidadeResponse(2, "Guarujá", 320000, new BigDecimal("143.58"), "3518701", "SP", null, null, true),
                new LocalidadeResponse(1, "São Paulo", 12000000, new BigDecimal("1521.11"), "3550308", "SP", null, null, true)));

        var resposta = assertThat(mvc.get().uri("/api/localidades"))
            .hasStatus(HttpStatus.OK)
            .bodyJson();
        resposta.extractingPath("$.length()").isEqualTo(2);
        resposta.extractingPath("$[0].nome").isEqualTo("Guarujá");
        resposta.extractingPath("$[1].id").isEqualTo(1);
    }

    // 1b) ?atendidas=true usa a lista só das cidades cobertas pelo SafeZone
    @Test
    void listar_atendidas_usaListaDeAtendidas() {
        when(localidadeService.listarAtendidas()).thenReturn(List.of(
                new LocalidadeResponse(8, "Petrópolis", 278881, new BigDecimal("791.14"), "3303906", "RJ",
                        new BigDecimal("-22.507574"), new BigDecimal("-43.178536"), true)));

        var resposta = assertThat(mvc.get().uri("/api/localidades?atendidas=true"))
            .hasStatus(HttpStatus.OK)
            .bodyJson();
        resposta.extractingPath("$.length()").isEqualTo(1);
        resposta.extractingPath("$[0].codigoIbge").isEqualTo("3303906");
        resposta.extractingPath("$[0].atendida").isEqualTo(true);
        verify(localidadeService, never()).listar();
    }

    // 2) sem localidades cadastradas: 200 com lista vazia, não 404
    @Test
    void listar_vazio_retornaListaVazia() {
        when(localidadeService.listar()).thenReturn(List.of());

        assertThat(mvc.get().uri("/api/localidades"))
            .hasStatus(HttpStatus.OK)
            .bodyJson().extractingPath("$").asArray().isEmpty();
    }
}
