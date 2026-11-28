package br.com.gestaorisco.api.dto.response;

import br.com.gestaorisco.api.integracao.EnderecoCep;

/**
 * Endereço de um CEP, para preencher o formulário.
 * atendida = a cidade do CEP é coberta pelo SafeZone (senão o endereço não pode ser salvo).
 */
public record CepResponse(
        String cep,
        String logradouro,
        String bairro,
        String cidade,
        String uf,
        String codigoIbge,
        boolean atendida) {

    public static CepResponse from(EnderecoCep e, boolean atendida) {
        return new CepResponse(e.cep(), e.logradouro(), e.bairro(), e.cidade(), e.uf(), e.codigoIbge(), atendida);
    }
}
