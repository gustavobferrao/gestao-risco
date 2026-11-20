package br.com.gestaorisco.api.dto.response;

import java.math.BigDecimal;

import br.com.gestaorisco.api.model.Abrigo;

/** Abrigo com a distância (km) até a coordenada consultada. */
public record AbrigoProximoResponse(
        Integer id,
        String nome,
        String telefone,
        String logradouro,
        String bairro,
        String cep,
        Integer capacidadeTotal,
        Integer vagasDisponiveis,
        BigDecimal latitude,
        BigDecimal longitude,
        double distanciaKm) {

    public static AbrigoProximoResponse from(Abrigo a, double distanciaKm) {
        return new AbrigoProximoResponse(
                a.getId(),
                a.getNome(),
                a.getTelefone(),
                a.getLogradouro(),
                a.getBairro(),
                a.getCep(),
                a.getCapacidadeTotal(),
                a.getVagasDisponiveis(),
                a.getLatitude(),
                a.getLongitude(),
                distanciaKm);
    }
}
