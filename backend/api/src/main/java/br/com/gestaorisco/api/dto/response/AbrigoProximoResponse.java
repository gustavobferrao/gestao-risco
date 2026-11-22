package br.com.gestaorisco.api.dto.response;

import java.math.BigDecimal;

import br.com.gestaorisco.api.model.Abrigo;
import br.com.gestaorisco.api.view.AbrigoProximoView;

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

    public static AbrigoProximoResponse from(AbrigoProximoView v) {
        return new AbrigoProximoResponse(
                v.getId(),
                v.getNome(),
                v.getTelefone(),
                v.getLogradouro(),
                v.getBairro(),
                v.getCep(),
                v.getCapacidadeTotal(),
                v.getVagasDisponiveis(),
                v.getLatitude(),
                v.getLongitude(),
                v.getDistanciaKm());
    }
}
