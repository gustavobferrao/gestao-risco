package br.com.gestaorisco.api.exception;

public class RecursoNaoEncontradoException extends RuntimeException {
    public RecursoNaoEncontradoException() {
        super();
    }
    public RecursoNaoEncontradoException(String message) {
        super(message);
    }

    
}