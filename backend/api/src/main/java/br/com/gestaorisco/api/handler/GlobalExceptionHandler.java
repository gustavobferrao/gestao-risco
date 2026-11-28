package br.com.gestaorisco.api.handler;

import java.util.stream.Collectors;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.context.MessageSourceResolvable;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.ErrorResponse;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import br.com.gestaorisco.api.exception.AcessoNegadoException;
import br.com.gestaorisco.api.exception.CredenciaisInvalidasException;
import br.com.gestaorisco.api.exception.RecursoNaoEncontradoException;
import br.com.gestaorisco.api.exception.RegraNegocioException;
import br.com.gestaorisco.api.exception.ServicoExternoIndisponivelException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    ProblemDetail erroInesperado(Exception e){
        // Exceções web do Spring (405 método não suportado, 415 content-type, etc.) já trazem o
        // status correto; sem isto o handler genérico transformaria todas em 500.
        if (e instanceof ErrorResponse er) {
            return er.getBody();
        }
        return ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR,
            "Erro inesperado no servidor. Tente novamente.");
    }

    // 405: rota existe, mas não aceita o método usado; o cabeçalho Allow informa os métodos aceitos
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    ResponseEntity<ProblemDetail> metodoNaoSuportado(HttpRequestMethodNotSupportedException e){
        var pd = ProblemDetail.forStatusAndDetail(HttpStatus.METHOD_NOT_ALLOWED,
            "Método " + e.getMethod() + " não suportado para esta rota.");
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).headers(e.getHeaders()).body(pd);
    }

    // 415: Content-Type do corpo não aceito; o cabeçalho Accept informa os tipos aceitos
    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    ResponseEntity<ProblemDetail> tipoConteudoNaoSuportado(HttpMediaTypeNotSupportedException e){
        String recebido = e.getContentType() == null ? "ausente" : e.getContentType().toString();
        var pd = ProblemDetail.forStatusAndDetail(HttpStatus.UNSUPPORTED_MEDIA_TYPE,
            "Content-Type não suportado: " + recebido + ". Use application/json.");
        return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).headers(e.getHeaders()).body(pd);
    }

    // rota inexistente: o Spring lança NoResourceFoundException, que deve virar 404 (e não 500)
    @ExceptionHandler(NoResourceFoundException.class)
    ProblemDetail rotaInexistente(NoResourceFoundException e, HttpServletRequest req){
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND,
            "Rota não encontrada: " + req.getMethod() + " " + req.getRequestURI());
    }

    // Exceções de domínio carregam mensagens escritas para o usuário final: repassa a mensagem
    // da exceção e usa o texto genérico só quando ela vier vazia.
    private static String mensagemOuPadrao(RuntimeException e, String padrao) {
        String msg = e.getMessage();
        return (msg == null || msg.isBlank()) ? padrao : msg;
    }

    @ExceptionHandler (RecursoNaoEncontradoException.class)
    ProblemDetail naoEncontrado(RecursoNaoEncontradoException e){
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND,
            mensagemOuPadrao(e, "Recurso não encontrado.")
        );
    }


    @ExceptionHandler(RegraNegocioException.class)
    ProblemDetail regraInvalida(RegraNegocioException e){
        return ProblemDetail.forStatusAndDetail(HttpStatus.UNPROCESSABLE_CONTENT,
            mensagemOuPadrao(e, "Não foi possível realizar a operação, verifique as informações enviadas.")
        );
    }

    // 403 = usuário autenticado, mas sem permissão (não é problema de login).
    @ExceptionHandler (AcessoNegadoException.class)
    ProblemDetail acessoNegado(AcessoNegadoException e){
        return ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN,
            mensagemOuPadrao(e, "Você não tem permissão para realizar esta operação.")
        );
    }

    // ViaCEP (e futuramente INMET/Cemaden) fora do ar: 503, para a tela sugerir tentar de novo
    @ExceptionHandler(ServicoExternoIndisponivelException.class)
    ProblemDetail servicoExternoIndisponivel(ServicoExternoIndisponivelException e){
        return ProblemDetail.forStatusAndDetail(HttpStatus.SERVICE_UNAVAILABLE,
            mensagemOuPadrao(e, "Um serviço externo não respondeu. Tente novamente em instantes.")
        );
    }

    @ExceptionHandler (CredenciaisInvalidasException.class)
    ProblemDetail credenciaisInvalidas(CredenciaisInvalidasException e){
        return ProblemDetail.forStatusAndDetail(HttpStatus.UNAUTHORIZED,
            mensagemOuPadrao(e, "Credenciais inválidas, verifique seu login e senha.")
        );
    }

    @ExceptionHandler (MethodArgumentNotValidException.class)
    ProblemDetail validacao(MethodArgumentNotValidException e){
        var pd = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Dados inválidos");
        pd.setProperty("campos", e.getBindingResult().getFieldErrors().stream()
            .collect(Collectors.toMap(FieldError::getField,
                f -> String.valueOf(f.getDefaultMessage()), (a,b) -> a)));
        return pd;
}

    @ExceptionHandler(DataIntegrityViolationException.class)
    ProblemDetail integridade (DataIntegrityViolationException e){
        return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT,
            "Operação viola uma restrição do banco (duplicidade ou valor fora do permitido)"
        );
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    ProblemDetail corpoInvalido(HttpMessageNotReadableException e){
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST,
            "Corpo da requisição inválido ou mal informado."
        );
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    ProblemDetail tipoInvalido(MethodArgumentTypeMismatchException e){
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST,
            "Valor inválido para o parâmetro '%s' : %s".formatted(e.getName(), e.getValue()));
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    ProblemDetail parametroAusente(MissingServletRequestParameterException e){
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST,
            "Parâmetro obrigatório ausente: "+e.getParameterName()
        );
    }

    // sem isto, a falta do X-Usuario-Id cairia no handler genérico e viraria 500
    @ExceptionHandler(MissingRequestHeaderException.class)
    ProblemDetail cabecalhoAusente(MissingRequestHeaderException e){
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST,
            "Cabeçalho obrigatório ausente: "+e.getHeaderName()
        );
    }

    @ExceptionHandler(HandlerMethodValidationException.class)
    ProblemDetail parametroInvalido(HandlerMethodValidationException e){
        var pd = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Parâmetros inválidos");
        pd.setProperty("erros", e.getAllErrors().stream().map(MessageSourceResolvable::getDefaultMessage).toList());
        return pd;
    }
}
