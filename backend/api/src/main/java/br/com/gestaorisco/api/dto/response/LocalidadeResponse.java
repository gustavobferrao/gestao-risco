package br.com.gestaorisco.api.dto.response;

import java.math.BigDecimal;

import br.com.gestaorisco.api.model.Localidade;

/** Área territorial em km². */
public record LocalidadeResponse(
        Integer id,
        String nome,
        Integer populacao,
        BigDecimal area) {

    public static LocalidadeResponse from(Localidade l) {
        return new LocalidadeResponse(l.getId(), l.getNome(), l.getPopulacao(), l.getArea());
    }
}
