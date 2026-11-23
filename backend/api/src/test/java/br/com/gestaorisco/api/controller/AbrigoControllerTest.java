package br.com.gestaorisco.api.controller;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.assertj.MockMvcTester;

import br.com.gestaorisco.api.dto.response.AbrigoProximoResponse;
import br.com.gestaorisco.api.service.AbrigoService;

@WebMvcTest(AbrigoController.class)
class AbrigoControllerTest {

    @Autowired MockMvcTester mvc;
    @MockitoBean AbrigoService abrigoService;

    private static final AbrigoProximoResponse ABRIGO = new AbrigoProximoResponse(
            2, "Ginásio Municipal", "(11) 3333-0000", "Rua das Flores, 100", "Centro", "01000-000",
            200, 45, new BigDecimal("-23.550500"), new BigDecimal("-46.633300"), 1.2);

    // 1) caminho feliz: coordenadas repassadas e limite ausente chega como null
    @Test
    void proximos_valido_retorna200() {
        when(abrigoService.proximos(-23.55, -46.63, null)).thenReturn(List.of(ABRIGO));

        var resposta = assertThat(mvc.get().uri("/api/abrigos/proximos?lat=-23.55&lng=-46.63"))
            .hasStatus(HttpStatus.OK)
            .bodyJson();
        resposta.extractingPath("$[0].id").isEqualTo(2);
        resposta.extractingPath("$[0].distanciaKm").isEqualTo(1.2);
    }

    // 2) limite informado é repassado ao service (quem aplica o teto é o service)
    @Test
    void proximos_comLimite_repassaParaService() {
        when(abrigoService.proximos(anyDouble(), anyDouble(), eq(3))).thenReturn(List.of(ABRIGO));

        assertThat(mvc.get().uri("/api/abrigos/proximos?lat=-23.55&lng=-46.63&limite=3"))
            .hasStatus(HttpStatus.OK);

        verify(abrigoService).proximos(-23.55, -46.63, 3);
    }

    // 3) parâmetro obrigatório ausente: 400 e o service nem é chamado
    @Test
    void proximos_semLat_retorna400() {
        assertThat(mvc.get().uri("/api/abrigos/proximos?lng=-46.63"))
            .hasStatus(HttpStatus.BAD_REQUEST)
            .bodyJson().extractingPath("$.detail").isEqualTo("Parâmetro obrigatório ausente: lat");

        verifyNoInteractions(abrigoService);
    }

    // 4) coordenada fora da faixa WGS84: 400 com a mensagem da validação
    @Test
    void proximos_latForaDaFaixa_retorna400() {
        assertThat(mvc.get().uri("/api/abrigos/proximos?lat=95&lng=-46.63"))
            .hasStatus(HttpStatus.BAD_REQUEST)
            .bodyJson().extractingPath("$.erros[0]").isEqualTo("Latitude deve estar entre -90 e 90");

        verifyNoInteractions(abrigoService);
    }

    // 5) valor não numérico: 400 por conversão de tipo
    @Test
    void proximos_lngNaoNumerica_retorna400() {
        assertThat(mvc.get().uri("/api/abrigos/proximos?lat=-23.55&lng=abc"))
            .hasStatus(HttpStatus.BAD_REQUEST);

        verifyNoInteractions(abrigoService);
    }
}
