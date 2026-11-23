package br.com.gestaorisco.api.handler;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.lang.reflect.Method;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.context.MessageSourceResolvable;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.core.MethodParameter;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.mock.http.MockHttpInputMessage;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import br.com.gestaorisco.api.exception.AcessoNegadoException;
import br.com.gestaorisco.api.exception.CredenciaisInvalidasException;
import br.com.gestaorisco.api.exception.RecursoNaoEncontradoException;
import br.com.gestaorisco.api.exception.RegraNegocioException;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    // Método fictício só para montar o MethodParameter exigido por algumas exceções do Spring
    @SuppressWarnings("unused")
    private void metodoFicticio(Integer id){}

    private MethodParameter parametro() throws NoSuchMethodException {
        Method m = getClass().getDeclaredMethod("metodoFicticio", Integer.class);
        return new MethodParameter(m, 0);
    }

    // ===================== Exception genérica =====================

    // erro inesperado vira 500 com mensagem genérica, sem vazar a mensagem interna
    @Test
    void erroInesperado_retorna500SemVazarMensagem(){
        ProblemDetail pd = handler.erroInesperado(new IllegalStateException("NPE em XPTO linha 42"));

        assertThat(pd.getStatus()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR.value());
        assertThat(pd.getDetail()).isEqualTo("Erro inesperado no servidor. Tente novamente.")
            .doesNotContain("XPTO");
    }

    // ===================== exceções de domínio =====================

    // recurso não encontrado vira 404 repassando a mensagem da exceção
    @Test
    void naoEncontrado_retorna404ComMensagem(){
        ProblemDetail pd = handler.naoEncontrado(new RecursoNaoEncontradoException("Alerta 10 não encontrado"));

        assertThat(pd.getStatus()).isEqualTo(404);
        assertThat(pd.getDetail()).isEqualTo("Alerta 10 não encontrado");
    }

    // recurso não encontrado sem mensagem (nula ou em branco) usa o texto padrão
    @ParameterizedTest
    @NullSource
    @ValueSource(strings = {"", "   "})
    void naoEncontrado_semMensagem_usaPadrao(String msg){
        ProblemDetail pd = handler.naoEncontrado(new RecursoNaoEncontradoException(msg));

        assertThat(pd.getStatus()).isEqualTo(404);
        assertThat(pd.getDetail()).isEqualTo("Recurso não encontrado.");
    }

    // regra de negócio vira 422 repassando a mensagem da exceção
    @Test
    void regraInvalida_retorna422ComMensagem(){
        ProblemDetail pd = handler.regraInvalida(new RegraNegocioException("CPF já cadastrado"));

        assertThat(pd.getStatus()).isEqualTo(HttpStatus.UNPROCESSABLE_CONTENT.value());
        assertThat(pd.getDetail()).isEqualTo("CPF já cadastrado");
    }

    // regra de negócio sem mensagem usa o texto padrão
    @Test
    void regraInvalida_semMensagem_usaPadrao(){
        ProblemDetail pd = handler.regraInvalida(new RegraNegocioException());

        assertThat(pd.getStatus()).isEqualTo(422);
        assertThat(pd.getDetail())
            .isEqualTo("Não foi possível realizar a operação, verifique as informações enviadas.");
    }

    // acesso negado vira 403 repassando a mensagem da exceção
    @Test
    void acessoNegado_retorna403ComMensagem(){
        ProblemDetail pd = handler.acessoNegado(new AcessoNegadoException("Alerta pertence a outro órgão"));

        assertThat(pd.getStatus()).isEqualTo(403);
        assertThat(pd.getDetail()).isEqualTo("Alerta pertence a outro órgão");
    }

    // acesso negado sem mensagem usa o texto padrão
    @Test
    void acessoNegado_semMensagem_usaPadrao(){
        ProblemDetail pd = handler.acessoNegado(new AcessoNegadoException());

        assertThat(pd.getStatus()).isEqualTo(403);
        assertThat(pd.getDetail()).isEqualTo("Você não tem permissão para realizar esta operação.");
    }

    // credenciais inválidas vira 401 repassando a mensagem da exceção
    @Test
    void credenciaisInvalidas_retorna401ComMensagem(){
        ProblemDetail pd = handler.credenciaisInvalidas(new CredenciaisInvalidasException("E-mail ou senha inválidos"));

        assertThat(pd.getStatus()).isEqualTo(401);
        assertThat(pd.getDetail()).isEqualTo("E-mail ou senha inválidos");
    }

    // credenciais inválidas sem mensagem usa o texto padrão
    @Test
    void credenciaisInvalidas_semMensagem_usaPadrao(){
        ProblemDetail pd = handler.credenciaisInvalidas(new CredenciaisInvalidasException());

        assertThat(pd.getStatus()).isEqualTo(401);
        assertThat(pd.getDetail()).isEqualTo("Credenciais inválidas, verifique seu login e senha.");
    }

    // ===================== validação do corpo (@Valid) =====================

    // erros de validação viram 400 com um mapa campo -> mensagem
    @Test
    void validacao_retorna400ComCamposEMensagens() throws Exception {
        var br = new BeanPropertyBindingResult(new Object(), "cadastroRequest");
        br.addError(new FieldError("cadastroRequest", "email", "E-mail inválido"));
        br.addError(new FieldError("cadastroRequest", "senha", "Senha deve ter entre 8 e 72 caracteres"));

        ProblemDetail pd = handler.validacao(new MethodArgumentNotValidException(parametro(), br));

        assertThat(pd.getStatus()).isEqualTo(400);
        assertThat(pd.getDetail()).isEqualTo("Dados inválidos");
        assertThat(campos(pd))
            .containsEntry("email", "E-mail inválido")
            .containsEntry("senha", "Senha deve ter entre 8 e 72 caracteres")
            .hasSize(2);
    }

    // campo com mais de um erro mantém só a primeira mensagem (sem lançar chave duplicada)
    @Test
    void validacao_campoComVariosErros_mantemPrimeiro() throws Exception {
        var br = new BeanPropertyBindingResult(new Object(), "cadastroRequest");
        br.addError(new FieldError("cadastroRequest", "cpf", "CPF é obrigatório"));
        br.addError(new FieldError("cadastroRequest", "cpf", "CPF inválido"));

        ProblemDetail pd = handler.validacao(new MethodArgumentNotValidException(parametro(), br));

        assertThat(campos(pd)).containsExactly(Map.entry("cpf", "CPF é obrigatório"));
    }

    @SuppressWarnings("unchecked")
    private Map<String, String> campos(ProblemDetail pd){
        assertThat(pd.getProperties()).containsKey("campos");
        return (Map<String, String>) pd.getProperties().get("campos");
    }

    // ===================== banco e requisição =====================

    // violação de integridade do banco vira 409 sem expor detalhes do SQL
    @Test
    void integridade_retorna409SemExporSql(){
        ProblemDetail pd = handler.integridade(
            new DataIntegrityViolationException("Duplicate entry 'x' for key 'usuario.uk_email'"));

        assertThat(pd.getStatus()).isEqualTo(409);
        assertThat(pd.getDetail()).doesNotContain("Duplicate entry", "uk_email");
    }

    // corpo ilegível (JSON malformado) vira 400 com mensagem genérica
    @Test
    void corpoInvalido_retorna400(){
        var e = new HttpMessageNotReadableException("JSON parse error", new MockHttpInputMessage(new byte[0]));

        ProblemDetail pd = handler.corpoInvalido(e);

        assertThat(pd.getStatus()).isEqualTo(400);
        assertThat(pd.getDetail()).isEqualTo("Corpo da requisição inválido ou mal informado.");
    }

    // tipo de parâmetro inválido vira 400 informando o nome e o valor recebido
    @Test
    void tipoInvalido_retorna400ComNomeEValor() throws Exception {
        var e = new MethodArgumentTypeMismatchException("abc", Integer.class, "id", parametro(), null);

        ProblemDetail pd = handler.tipoInvalido(e);

        assertThat(pd.getStatus()).isEqualTo(400);
        assertThat(pd.getDetail()).contains("'id'").contains("abc");
    }

    // parâmetro obrigatório ausente vira 400 informando o nome do parâmetro
    @Test
    void parametroAusente_retorna400ComNome(){
        var e = new MissingServletRequestParameterException("lat", "double");

        ProblemDetail pd = handler.parametroAusente(e);

        assertThat(pd.getStatus()).isEqualTo(400);
        assertThat(pd.getDetail()).isEqualTo("Parâmetro obrigatório ausente: lat");
    }

    // cabeçalho obrigatório ausente (ex.: X-Usuario-Id) vira 400 informando o nome
    @Test
    void cabecalhoAusente_retorna400ComNome() throws Exception {
        var e = new MissingRequestHeaderException("X-Usuario-Id", parametro());

        ProblemDetail pd = handler.cabecalhoAusente(e);

        assertThat(pd.getStatus()).isEqualTo(400);
        assertThat(pd.getDetail()).isEqualTo("Cabeçalho obrigatório ausente: X-Usuario-Id");
    }

    // validação de parâmetros do método vira 400 com a lista de mensagens de erro
    @Test
    void parametroInvalido_retorna400ComListaDeErros(){
        HandlerMethodValidationException e = mock(HandlerMethodValidationException.class);
        List<MessageSourceResolvable> erros = List.of(
            new DefaultMessageSourceResolvable(null, null, "limite deve ser positivo"),
            new DefaultMessageSourceResolvable(null, null, "lat deve estar entre -90 e 90"));
        doReturn(erros).when(e).getAllErrors();

        ProblemDetail pd = handler.parametroInvalido(e);

        assertThat(pd.getStatus()).isEqualTo(400);
        assertThat(pd.getDetail()).isEqualTo("Parâmetros inválidos");
        assertThat(pd.getProperties()).containsEntry("erros",
            List.of("limite deve ser positivo", "lat deve estar entre -90 e 90"));
    }
}
