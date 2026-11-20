package br.com.gestaorisco.api.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import br.com.gestaorisco.api.model.AreaRisco;
import br.com.gestaorisco.api.model.PedidoAjuda;
import br.com.gestaorisco.api.model.enums.StatusPedido;

/** areaRiscoId e areaRiscoNome são nulos quando o pedido não está ligado a uma área. */
public record PedidoAjudaResponse(
        Integer id,
        String descricao,
        StatusPedido status,
        LocalDateTime dataHoraSolicitacao,
        BigDecimal latitude,
        BigDecimal longitude,
        Integer areaRiscoId,
        String areaRiscoNome,
        Integer usuarioId,
        String usuarioNome) {

    /** Acessa usuario e areaRisco (LAZY): chamar dentro da transação do service. */
    public static PedidoAjudaResponse from(PedidoAjuda p) {
        AreaRisco area = p.getAreaRisco();
        return new PedidoAjudaResponse(
                p.getId(),
                p.getDescricao(),
                p.getStatus(),
                p.getDataHoraSolicitacao(),
                p.getLatitude(),
                p.getLongitude(),
                area != null ? area.getId() : null,
                area != null ? area.getNome() : null,
                p.getUsuario().getId(),
                p.getUsuario().getNome());
    }
}
