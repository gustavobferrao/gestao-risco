package br.com.gestaorisco.api.controller;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.assertj.MockMvcTester;

import br.com.gestaorisco.api.dto.response.CepResponse;
import br.com.gestaorisco.api.exception.RecursoNaoEncontradoException;
import br.com.gestaorisco.api.exception.ServicoExternoIndisponivelException;
import br.com.gestaorisco.api.service.EnderecoUsuarioService;

@WebMvcTest(CepController.class)
class CepControllerTest {

    @Autowired MockMvcTester mvc;
    @MockitoBean EnderecoUsuarioService enderecoUsuarioService;

    @Test
    void consultar_cepValido_retorna200() {
        when(enderecoUsuarioService.consultarCep("25620003")).thenReturn(
            new CepResponse("25620003", "Rua do Imperador", "Centro", "Petrópolis", "RJ", "3303906", true));

        var json = assertThat(mvc.get().uri("/api/cep/25620003"))
            .hasStatus(HttpStatus.OK)
            .bodyJson();
        json.extractingPath("$.cidade").isEqualTo("Petrópolis");
        json.extractingPath("$.atendida").isEqualTo(true);
    }

    // formato errado nem chega ao service
    @Test
    void consultar_formatoInvalido_retorna400() {
        assertThat(mvc.get().uri("/api/cep/2562")).hasStatus(HttpStatus.BAD_REQUEST);
        verifyNoInteractions(enderecoUsuarioService);
    }

    @Test
    void consultar_inexistente_retorna404() {
        when(enderecoUsuarioService.consultarCep("99999999"))
            .thenThrow(new RecursoNaoEncontradoException("CEP 99999999 não encontrado."));

        assertThat(mvc.get().uri("/api/cep/99999999")).hasStatus(HttpStatus.NOT_FOUND);
    }

    // ViaCEP fora do ar: 503 com mensagem para o usuário
    @Test
    void consultar_viaCepFora_retorna503() {
        when(enderecoUsuarioService.consultarCep("25620003"))
            .thenThrow(new ServicoExternoIndisponivelException("Não foi possível consultar o CEP agora.", null));

        assertThat(mvc.get().uri("/api/cep/25620003"))
            .hasStatus(HttpStatus.SERVICE_UNAVAILABLE)
            .bodyJson().extractingPath("$.detail").isEqualTo("Não foi possível consultar o CEP agora.");
    }
}
