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
import br.com.gestaorisco.api.exception.CredenciaisInvalidasException;
import br.com.gestaorisco.api.exception.RegraNegocioException;
import br.com.gestaorisco.api.model.enums.Perfil;
import br.com.gestaorisco.api.service.AuthService;

@WebMvcTest(AuthController.class)
class AuthControllerTest {

    @Autowired MockMvcTester mvc;
    @MockitoBean AuthService authService;

    private static final String CADASTRO_VALIDO = """
            {"nome":"Maria Silva","cpf":"52998224725","telefone":"11987654321",
             "email":"maria@exemplo.com","senha":"senhaForte123"}
            """;

    private static final String LOGIN_VALIDO = """
            {"email":"maria@exemplo.com","senha":"senhaForte123"}
            """;

    private static final UsuarioResponse CIDADAO = new UsuarioResponse(
            7, "Maria Silva", "maria@exemplo.com", "11987654321", Perfil.CIDADAO, null, null);

    // 1) cadastro: caminho feliz, 201 e perfil CIDADAO
    @Test
    void cadastrar_valido_retorna201() {
        when(authService.cadastrar(any())).thenReturn(CIDADAO);

        var resposta = assertThat(mvc.post().uri("/api/auth/cadastro")
                .contentType(MediaType.APPLICATION_JSON)
                .content(CADASTRO_VALIDO))
            .hasStatus(HttpStatus.CREATED)
            .bodyJson();
        resposta.extractingPath("$.id").isEqualTo(7);
        resposta.extractingPath("$.perfil").isEqualTo("CIDADAO");
    }

    // 2) validação do DTO: CPF com dígito verificador errado, service nem é chamado
    @Test
    void cadastrar_cpfInvalido_retorna400() {
        assertThat(mvc.post().uri("/api/auth/cadastro")
                .contentType(MediaType.APPLICATION_JSON)
                .content(CADASTRO_VALIDO.replace("52998224725", "12345678900")))
            .hasStatus(HttpStatus.BAD_REQUEST)
            .bodyJson().extractingPath("$.campos.cpf").isEqualTo("CPF inválido");

        verifyNoInteractions(authService);
    }

    // 3) senha curta: 400 com a mensagem do @Size
    @Test
    void cadastrar_senhaCurta_retorna400() {
        assertThat(mvc.post().uri("/api/auth/cadastro")
                .contentType(MediaType.APPLICATION_JSON)
                .content(CADASTRO_VALIDO.replace("senhaForte123", "123")))
            .hasStatus(HttpStatus.BAD_REQUEST)
            .bodyJson().extractingPath("$.campos.senha").isEqualTo("Senha deve ter entre 8 e 72 caracteres");

        verifyNoInteractions(authService);
    }

    // 4) regra de negócio do service (e-mail duplicado) vira 422
    @Test
    void cadastrar_emailDuplicado_retorna422() {
        when(authService.cadastrar(any())).thenThrow(new RegraNegocioException("E-mail já cadastrado"));

        assertThat(mvc.post().uri("/api/auth/cadastro")
                .contentType(MediaType.APPLICATION_JSON)
                .content(CADASTRO_VALIDO))
            .hasStatus(HttpStatus.UNPROCESSABLE_CONTENT)
            .bodyJson().extractingPath("$.detail").isEqualTo("E-mail já cadastrado");
    }

    // 5) login: caminho feliz, 200 com os dados do usuário
    @Test
    void login_valido_retorna200() {
        when(authService.login(any())).thenReturn(CIDADAO);

        assertThat(mvc.post().uri("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(LOGIN_VALIDO))
            .hasStatus(HttpStatus.OK)
            .bodyJson().extractingPath("$.email").isEqualTo("maria@exemplo.com");
    }

    // 6) credenciais erradas viram 401 pelo GlobalExceptionHandler
    @Test
    void login_credenciaisInvalidas_retorna401() {
        when(authService.login(any())).thenThrow(new CredenciaisInvalidasException("E-mail ou senha inválidos"));

        assertThat(mvc.post().uri("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(LOGIN_VALIDO))
            .hasStatus(HttpStatus.UNAUTHORIZED)
            .bodyJson().extractingPath("$.detail").isEqualTo("E-mail ou senha inválidos");
    }

    // 7) login sem senha: 400, service nem é chamado
    @Test
    void login_semSenha_retorna400() {
        assertThat(mvc.post().uri("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"email":"maria@exemplo.com"}
                    """))
            .hasStatus(HttpStatus.BAD_REQUEST)
            .bodyJson().extractingPath("$.campos.senha").isEqualTo("Senha é obrigatória");

        verifyNoInteractions(authService);
    }
}
