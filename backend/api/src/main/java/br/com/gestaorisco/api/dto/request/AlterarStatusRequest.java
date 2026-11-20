package br.com.gestaorisco.api.dto.request;

import br.com.gestaorisco.api.model.enums.StatusAlerta;
import jakarta.validation.constraints.NotNull;

/** Alteração de status de um alerta. */
public record AlterarStatusRequest(

        @NotNull(message = "Status é obrigatório")
        StatusAlerta status) {
}
