package br.com.gestaorisco.api.controller;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.assertj.MockMvcTester;

import br.com.gestaorisco.api.dto.request.EnderecoRequest;
import br.com.gestaorisco.api.dto.response.EnderecoUsuarioResponse;
import br.com.gestaorisco.api.exception.RegraNegocioException;
import br.com.gestaorisco.api.service.EnderecoUsuarioService;

@WebMvcTest(UsuarioController.class)
class UsuarioControllerTest {

    @Autowired MockMvcTester mvc;
    @MockitoBean EnderecoUsuarioService enderecoUsuarioService;

    private static final String BODY_COMPLETO = """
        {"cep":"25620003","logradouro":"Rua do Imperador","numero":"100","consentimento":true}
        """;

    private static EnderecoUsuarioResponse resposta() {
        return new EnderecoUsuarioResponse("25620003", "Rua do Imperador", "100", null, "Centro",
            8, "Petrópolis", "RJ", "3303906", null, null, null,
            new BigDecimal("-22.507574"), new BigDecimal("-43.178536"));
    }

    // ---- GET ----

    @Test
    void buscar_comEndereco_retorna200() {
        when(enderecoUsuarioService.buscar(1)).thenReturn(Optional.of(resposta()));

        var json = assertThat(mvc.get().uri("/api/usuarios/me/endereco").header("X-Usuario-Id", 1))
            .hasStatus(HttpStatus.OK)
            .bodyJson();
        json.extractingPath("$.cidade").isEqualTo("Petrópolis");
        json.extractingPath("$.codigoIbge").isEqualTo("3303906");
    }

    // usuário ainda sem endereço não é erro: 204
    @Test
    void buscar_semEndereco_retorna204() {
        when(enderecoUsuarioService.buscar(1)).thenReturn(Optional.empty());

        assertThat(mvc.get().uri("/api/usuarios/me/endereco").header("X-Usuario-Id", 1))
            .hasStatus(HttpStatus.NO_CONTENT);
    }

    @Test
    void buscar_semCabecalho_retorna400() {
        assertThat(mvc.get().uri("/api/usuarios/me/endereco")).hasStatus(HttpStatus.BAD_REQUEST);
    }

    // ---- PUT ----

    @Test
    void salvar_valido_retorna200ERepassaUsuario() {
        when(enderecoUsuarioService.salvar(eq(1), any(EnderecoRequest.class))).thenReturn(resposta());

        assertThat(mvc.put().uri("/api/usuarios/me/endereco")
                .header("X-Usuario-Id", 1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(BODY_COMPLETO))
            .hasStatus(HttpStatus.OK)
            .bodyJson().extractingPath("$.logradouro").isEqualTo("Rua do Imperador");
        verify(enderecoUsuarioService).salvar(eq(1), argThat((EnderecoRequest r) -> r.consentimento()));
    }

    // sem o aceite (LGPD): 400 do @AssertTrue, o service nem é chamado
    @Test
    void salvar_semConsentimento_retorna400() {
        var json = assertThat(mvc.put().uri("/api/usuarios/me/endereco")
                .header("X-Usuario-Id", 1)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"cep":"25620003","logradouro":"Rua do Imperador","consentimento":false}
                    """))
            .hasStatus(HttpStatus.BAD_REQUEST)
            .bodyJson();
        json.extractingPath("$.campos.consentimento").isEqualTo("Autorize o uso do endereço para salvar");
        verifyNoInteractions(enderecoUsuarioService);
    }

    @Test
    void salvar_cepInvalido_retorna400() {
        assertThat(mvc.put().uri("/api/usuarios/me/endereco")
                .header("X-Usuario-Id", 1)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"cep":"25620-003","consentimento":true}
                    """))
            .hasStatus(HttpStatus.BAD_REQUEST)
            .bodyJson().extractingPath("$.campos.cep").isEqualTo("CEP deve conter somente os 8 dígitos");
    }

    // cidade não atendida vem do service como regra de negócio: 422
    @Test
    void salvar_cidadeNaoAtendida_retorna422() {
        when(enderecoUsuarioService.salvar(eq(1), any()))
            .thenThrow(new RegraNegocioException("Santos ainda não é atendida pelo SafeZone."));

        assertThat(mvc.put().uri("/api/usuarios/me/endereco")
                .header("X-Usuario-Id", 1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(BODY_COMPLETO))
            .hasStatus(HttpStatus.UNPROCESSABLE_CONTENT)
            .bodyJson().extractingPath("$.detail").isEqualTo("Santos ainda não é atendida pelo SafeZone.");
    }

    // ---- DELETE ----

    @Test
    void remover_retorna204() {
        assertThat(mvc.delete().uri("/api/usuarios/me/endereco").header("X-Usuario-Id", 1))
            .hasStatus(HttpStatus.NO_CONTENT);
        verify(enderecoUsuarioService).remover(1);
    }
}
