package br.com.gestaorisco.api.dto.response;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

import br.com.gestaorisco.api.model.Alerta;
import br.com.gestaorisco.api.model.AreaRisco;
import br.com.gestaorisco.api.model.enums.Severidade;
import br.com.gestaorisco.api.model.enums.StatusAlerta;

public record AlertaResponse(
        Integer id,
        String tipo,
        Severidade nivelSeveridade,
        StatusAlerta status,
        LocalDateTime dataEmissao,
        Integer orgaoId,
        String orgaoNome,
        List<AreaAfetada> areas) {

    public record AreaAfetada(Integer id, String nome) {

        static AreaAfetada from(AreaRisco a) {
            return new AreaAfetada(a.getId(), a.getNome());
        }
    }

    /** Acessa orgao e areasRisco (LAZY): chamar dentro da transação do service. */
    public static AlertaResponse from(Alerta a) {
        return new AlertaResponse(
                a.getId(),
                a.getTipo(),
                a.getNivelSeveridade(),
                a.getStatus(),
                a.getDataEmissao(),
                a.getOrgao().getId(),
                a.getOrgao().getNome(),
                a.getAreasRisco().stream()
                        .map(AreaAfetada::from)
                        .sorted(Comparator.comparing(AreaAfetada::nome))
                        .toList());
    }
}
