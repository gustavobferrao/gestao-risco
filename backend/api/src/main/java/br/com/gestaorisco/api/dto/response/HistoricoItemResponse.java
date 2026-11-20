package br.com.gestaorisco.api.dto.response;

import java.time.LocalDateTime;

import br.com.gestaorisco.api.model.OcorrenciaEvento;

/** Uma ocorrência de evento climático no histórico de uma área. */
public record HistoricoItemResponse(
        Integer id,
        Integer eventoId,
        String evento,
        String classificacao,
        LocalDateTime dataOcorrencia) {

    public static HistoricoItemResponse from(OcorrenciaEvento o) {
        return new HistoricoItemResponse(
                o.getId(),
                o.getEvento().getId(),
                o.getEvento().getNome(),
                o.getEvento().getClassificacao(),
                o.getDataOcorrencia());
    }
}
