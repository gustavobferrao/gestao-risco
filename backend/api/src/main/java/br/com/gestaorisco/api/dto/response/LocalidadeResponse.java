package br.com.gestaorisco.api.dto.response;

import java.math.BigDecimal;

import br.com.gestaorisco.api.model.Localidade;

/**
 * Área territorial em km². latitude/longitude = sede do município.
 * atendida = cidade coberta pelo SafeZone no MVP.
 */
public record LocalidadeResponse(
        Integer id,
        String nome,
        Integer populacao,
        BigDecimal area,
        String codigoIbge,
        String uf,
        BigDecimal latitude,
        BigDecimal longitude,
        boolean atendida) {

    public static LocalidadeResponse from(Localidade l) {
        return new LocalidadeResponse(l.getId(), l.getNome(), l.getPopulacao(), l.getArea(),
                l.getCodigoIbge(), l.getUf(), l.getLatitude(), l.getLongitude(), l.isAtendida());
    }
}
