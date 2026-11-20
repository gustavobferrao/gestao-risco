package br.com.gestaorisco.api.exception;

public class RegraNegocioException extends RuntimeException {
    public RegraNegocioException() {
        super();
    }
    public RegraNegocioException(String message) {
        super(message);
    }
}
