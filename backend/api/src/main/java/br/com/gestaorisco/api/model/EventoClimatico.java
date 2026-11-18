package br.com.gestaorisco.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Catálogo de tipos de evento (Enchente, Vendaval...). */
@Entity
@Table(name = "evento_climatico")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class EventoClimatico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_evento_climatico")
    @EqualsAndHashCode.Include
    private Integer id;

    @Column(name = "nome", nullable = false, unique = true, length = 120)
    private String nome;

    /** Ex.: Hidrológico, Geológico. */
    @Column(name = "classificacao", nullable = false, length = 60)
    private String classificacao;
}
