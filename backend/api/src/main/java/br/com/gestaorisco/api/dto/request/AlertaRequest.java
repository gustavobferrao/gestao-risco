package br.com.gestaorisco.api.dto.request;

import java.util.Set;

import br.com.gestaorisco.api.model.enums.Severidade;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/**
 * Emissão de alerta por um agente. O órgão emissor vem do agente autenticado
 * (Usuario.orgao), não do corpo da requisição. Status inicial é ATIVO.
 */
public record AlertaRequest(

        @NotBlank(message = "Tipo é obrigatório")
        @Size(max = 60, message = "Tipo deve ter no máximo 60 caracteres")
        String tipo,

        @NotNull(message = "Nível de severidade é obrigatório")
        Severidade nivelSeveridade,

        @NotEmpty(message = "Informe ao menos uma área de risco")
        Set<@NotNull @Positive Integer> areasRiscoIds) {
}
