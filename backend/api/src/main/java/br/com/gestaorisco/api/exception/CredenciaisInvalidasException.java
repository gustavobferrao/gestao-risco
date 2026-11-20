package br.com.gestaorisco.api.exception;

public class CredenciaisInvalidasException extends RuntimeException {
    
    public CredenciaisInvalidasException() {
        super();
    }
    public CredenciaisInvalidasException(String message) {
        super(message);
    }
}
