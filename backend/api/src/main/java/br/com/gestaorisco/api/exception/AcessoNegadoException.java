package br.com.gestaorisco.api.exception;

public class AcessoNegadoException extends RuntimeException {
    public AcessoNegadoException() {
        super();
    }
    public AcessoNegadoException(String message) {
        super(message);
    }
}