package br.com.gestaorisco.api.dto.request;

import br.com.gestaorisco.api.model.enums.StatusPedido;
import jakarta.validation.constraints.NotNull;

/** Alteração de status de um pedido de ajuda. */
public record AlterarStatusPedidoRequest(

        @NotNull(message = "Status é obrigatório")
        StatusPedido status) {
}
