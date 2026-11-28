package br.com.gestaorisco.api.exception;

/** Um serviço de terceiros (ViaCEP, INMET...) não respondeu: vira 503. */
public class ServicoExternoIndisponivelException extends RuntimeException {
    public ServicoExternoIndisponivelException(String message, Throwable cause) {
        super(message, cause);
    }
}
