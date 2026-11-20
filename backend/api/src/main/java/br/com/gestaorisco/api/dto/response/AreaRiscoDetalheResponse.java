package br.com.gestaorisco.api.dto.response;

import java.math.BigDecimal;
import java.util.List;

import br.com.gestaorisco.api.model.AreaRisco;
import br.com.gestaorisco.api.model.enums.NivelRisco;
import br.com.gestaorisco.api.model.enums.Zona;

/** Detalhe de uma área: dados completos, endereços e histórico de ocorrências. */
public record AreaRiscoDetalheResponse(
        Integer id,
        String nome,
        String descricao,
        Zona zona,
        NivelRisco nivelRisco,
        Integer populacaoAfetada,
        BigDecimal latitude,
        BigDecimal longitude,
        LocalidadeResponse localidade,
        List<EnderecoResponse> enderecos,
        List<HistoricoItemResponse> historico) {

    /** Espera localidade e endereços já carregados (AreaRiscoRepository.buscarDetalhe). */
    public static AreaRiscoDetalheResponse from(AreaRisco a, List<HistoricoItemResponse> historico) {
        return new AreaRiscoDetalheResponse(
                a.getId(),
                a.getNome(),
                a.getDescricao(),
                a.getZona(),
                a.getNivelRisco(),
                a.getPopulacaoAfetada(),
                a.getLatitude(),
                a.getLongitude(),
                LocalidadeResponse.from(a.getLocalidade()),
                a.getEnderecos().stream().map(EnderecoResponse::from).toList(),
                List.copyOf(historico));
    }
}
