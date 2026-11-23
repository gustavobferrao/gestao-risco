package br.com.gestaorisco.api.controller;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.assertj.MockMvcTester;

import br.com.gestaorisco.api.dto.response.EventoClimaticoResponse;
import br.com.gestaorisco.api.service.EventoClimaticoService;

@WebMvcTest(EventoClimaticoController.class)
class EventoClimaticoControllerTest {

    @Autowired MockMvcTester mvc;
    @MockitoBean EventoClimaticoService eventoClimaticoService;

    // 1) caminho feliz: devolve o catálogo na ordem que o service entregou
    @Test
    void listar_retorna200() {
        when(eventoClimaticoService.listar()).thenReturn(List.of(
                new EventoClimaticoResponse(2, "Enchente", "Hidrológico"),
                new EventoClimaticoResponse(1, "Vendaval", "Meteorológico")));

        var resposta = assertThat(mvc.get().uri("/api/eventos-climaticos"))
            .hasStatus(HttpStatus.OK)
            .bodyJson();
        resposta.extractingPath("$.length()").isEqualTo(2);
        resposta.extractingPath("$[0].nome").isEqualTo("Enchente");
        resposta.extractingPath("$[1].classificacao").isEqualTo("Meteorológico");
    }

    // 2) catálogo vazio: 200 com lista vazia, não 404
    @Test
    void listar_vazio_retornaListaVazia() {
        when(eventoClimaticoService.listar()).thenReturn(List.of());

        assertThat(mvc.get().uri("/api/eventos-climaticos"))
            .hasStatus(HttpStatus.OK)
            .bodyJson().extractingPath("$").asArray().isEmpty();
    }
}
