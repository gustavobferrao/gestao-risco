package br.com.gestaorisco.api.view;

import java.math.BigDecimal;

public interface AbrigoProximoView {
    Integer getId();
    String getNome();
    Integer getVagasDisponiveis();
    String getTelefone();
    BigDecimal getLatitude();
    BigDecimal getLongitude();
    Double getDistanciaKm();
    String getLogradouro();
    String getBairro();
    String getCep();
    Integer getCapacidadeTotal();
}
