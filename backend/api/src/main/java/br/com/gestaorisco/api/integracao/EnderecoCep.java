package br.com.gestaorisco.api.integracao;

/** Endereço que um CEP representa, já normalizado (sem campos vazios). */
public record EnderecoCep(
        String cep,
        String logradouro,
        String bairro,
        String cidade,
        String uf,
        String codigoIbge) {
}
