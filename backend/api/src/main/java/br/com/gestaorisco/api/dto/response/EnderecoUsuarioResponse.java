package br.com.gestaorisco.api.dto.response;

import java.math.BigDecimal;

import br.com.gestaorisco.api.model.EnderecoUsuario;
import br.com.gestaorisco.api.model.Localidade;
import br.com.gestaorisco.api.model.enums.OrigemCoordenada;

/**
 * Endereço do usuário. Campos de rua vêm nulos quando ele só informou a cidade.
 * latitude/longitude: ponto do endereço, se houver (GPS); cidadeLatitude/cidadeLongitude:
 * sede da cidade, usada pelo app como posição quando o endereço não tem ponto.
 */
public record EnderecoUsuarioResponse(
        String cep,
        String logradouro,
        String numero,
        String complemento,
        String bairro,
        Integer localidadeId,
        String cidade,
        String uf,
        String codigoIbge,
        BigDecimal latitude,
        BigDecimal longitude,
        OrigemCoordenada origemCoordenada,
        BigDecimal cidadeLatitude,
        BigDecimal cidadeLongitude) {

    /** Acessa localidade (LAZY): chamar dentro da transação do service. */
    public static EnderecoUsuarioResponse from(EnderecoUsuario e) {
        Localidade l = e.getLocalidade();
        return new EnderecoUsuarioResponse(
                e.getCep(), e.getLogradouro(), e.getNumero(), e.getComplemento(), e.getBairro(),
                l.getId(), l.getNome(), l.getUf(), l.getCodigoIbge(),
                e.getLatitude(), e.getLongitude(), e.getOrigemCoordenada(),
                l.getLatitude(), l.getLongitude());
    }
}
