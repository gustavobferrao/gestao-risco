package br.com.gestaorisco.api.dto.request;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;

/**
 * Registro de ocorrência de um evento climático em uma área de risco.
 * A área vem do caminho (POST /api/areas-risco/{id}/ocorrencias), não do corpo.
 */
public record OcorrenciaRequest(

        @NotNull(message = "Evento climático é obrigatório")
        @Positive
        Integer eventoId,

        @NotNull(message = "Data da ocorrência é obrigatória")
        @PastOrPresent(message = "Data da ocorrência não pode estar no futuro")
        LocalDateTime dataOcorrencia) {
}
