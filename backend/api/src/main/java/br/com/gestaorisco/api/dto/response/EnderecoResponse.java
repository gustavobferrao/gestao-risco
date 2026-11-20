package br.com.gestaorisco.api.dto.response;

import br.com.gestaorisco.api.model.EnderecoAreaRisco;

public record EnderecoResponse(
        Integer id,
        String logradouro,
        String numero,
        String bairro,
        String cep) {

    public static EnderecoResponse from(EnderecoAreaRisco e) {
        return new EnderecoResponse(e.getId(), e.getLogradouro(), e.getNumero(), e.getBairro(), e.getCep());
    }
}
