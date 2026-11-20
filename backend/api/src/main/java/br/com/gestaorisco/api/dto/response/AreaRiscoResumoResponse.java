package br.com.gestaorisco.api.dto.response;

import java.math.BigDecimal;

import br.com.gestaorisco.api.model.AreaRisco;
import br.com.gestaorisco.api.model.enums.NivelRisco;
import br.com.gestaorisco.api.model.enums.Zona;

/**
 * Item de listagem de áreas. alertasAtivos vem de
 * AlertaRepository.contarAtivosPorArea() (0 quando a área não aparece lá).
 */
public record AreaRiscoResumoResponse(
        Integer id,
        String nome,
        Integer localidadeId,
        String localidadeNome,
        Zona zona,
        NivelRisco nivelRisco,
        BigDecimal latitude,
        BigDecimal longitude,
        long alertasAtivos) {

    /** Espera a localidade já carregada (AreaRiscoRepository.filtrar faz join fetch). */
    public static AreaRiscoResumoResponse from(AreaRisco a, long alertasAtivos) {
        return new AreaRiscoResumoResponse(
                a.getId(),
                a.getNome(),
                a.getLocalidade().getId(),
                a.getLocalidade().getNome(),
                a.getZona(),
                a.getNivelRisco(),
                a.getLatitude(),
                a.getLongitude(),
                alertasAtivos);
    }
}
