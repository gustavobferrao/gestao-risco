package br.com.gestaorisco.api.model;

import java.io.Serializable;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Chave composta de gestao_abrigo: (órgão, abrigo). */
@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class GestaoAbrigoId implements Serializable {

    @Column(name = "fk_id_orgao")
    private Integer orgaoId;

    @Column(name = "fk_id_abrigo")
    private Integer abrigoId;
}
