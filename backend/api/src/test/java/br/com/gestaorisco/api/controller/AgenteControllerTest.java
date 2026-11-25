package br.com.gestaorisco.api.controller;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.assertj.MockMvcTester;

import br.com.gestaorisco.api.dto.response.UsuarioResponse;
import br.com.gestaorisco.api.exception.AcessoNegadoException;
import br.com.gestaorisco.api.exception.RegraNegocioException;
import br.com.gestaorisco.api.model.enums.Perfil;
import br.com.gestaorisco.api.service.AuthService;

@WebMvcTest(AgenteController.class)
class AgenteControllerTest {

    @Autowired MockMvcTester mvc;
    @MockitoBean AuthService authService;

    private static final String CADASTRO_VALIDO = """
            {"nome":"Paulo Agente","cpf":"52998224725","telefone":"11987654321",
             "email":"paulo@defesacivil.sp.gov.br","senha":"senhaForte123"}
            """;

    private static final UsuarioResponse AGENTE = new UsuarioResponse(
            20, "Paulo Agente", "paulo@defesacivil.sp.gov.br", "11987654321", Perfil.AGENTE, 1, "Defesa Civil");

    // 1) agente cadastra agente: 201, perfil AGENTE e órgão de quem cadastrou
    @Test
    void cadastrar_porAgente_retorna201() {
        when(authService.cadastrarAgente(any(), eq(1))).thenReturn(AGENTE);

        var resposta = assertThat(mvc.post().uri("/api/agentes")
                .header("X-Usuario-Id", 1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(CADASTRO_VALIDO))
            .hasStatus(HttpStatus.CREATED)
            .bodyJson();
        resposta.extractingPath("$.perfil").isEqualTo("AGENTE");
        resposta.extractingPath("$.orgaoId").isEqualTo(1);
    }

    // 2) cidadão tentando cadastrar agente: 403 pelo GlobalExceptionHandler
    @Test
    void cadastrar_porCidadao_retorna403() {
        when(authService.cadastrarAgente(any(), eq(7)))
            .thenThrow(new AcessoNegadoException("Operação permitida apenas para agentes."));

        assertThat(mvc.post().uri("/api/agentes")
                .header("X-Usuario-Id", 7)
                .contentType(MediaType.APPLICATION_JSON)
                .content(CADASTRO_VALIDO))
            .hasStatus(HttpStatus.FORBIDDEN)
            .bodyJson().extractingPath("$.detail").isEqualTo("Operação permitida apenas para agentes.");
    }

    // 3) sem o cabeçalho de usuário: 400, service nem é chamado
    @Test
    void cadastrar_semUsuario_retorna400() {
        assertThat(mvc.post().uri("/api/agentes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(CADASTRO_VALIDO))
            .hasStatus(HttpStatus.BAD_REQUEST)
            .bodyJson().extractingPath("$.detail").isEqualTo("Cabeçalho obrigatório ausente: X-Usuario-Id");

        verifyNoInteractions(authService);
    }

    // 4) mesma validação do cadastro público: CPF inválido, service nem é chamado
    @Test
    void cadastrar_cpfInvalido_retorna400() {
        assertThat(mvc.post().uri("/api/agentes")
                .header("X-Usuario-Id", 1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(CADASTRO_VALIDO.replace("52998224725", "12345678900")))
            .hasStatus(HttpStatus.BAD_REQUEST)
            .bodyJson().extractingPath("$.campos.cpf").isEqualTo("CPF inválido");

        verifyNoInteractions(authService);
    }

    // 5) e-mail já usado: 422
    @Test
    void cadastrar_emailDuplicado_retorna422() {
        when(authService.cadastrarAgente(any(), eq(1))).thenThrow(new RegraNegocioException("E-mail já cadastrado"));

        assertThat(mvc.post().uri("/api/agentes")
                .header("X-Usuario-Id", 1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(CADASTRO_VALIDO))
            .hasStatus(HttpStatus.UNPROCESSABLE_CONTENT)
            .bodyJson().extractingPath("$.detail").isEqualTo("E-mail já cadastrado");
    }
}
