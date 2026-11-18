package br.com.gestaorisco.api.model;

import java.math.BigDecimal;

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

@Entity
@Table(name = "abrigo")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Abrigo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_abrigo")
    @EqualsAndHashCode.Include
    private Integer id;

    @Column(name = "nome", nullable = false, length = 150)
    private String nome;

    @Column(name = "capacidade_total", nullable = false)
    private Integer capacidadeTotal;

    /** Sempre entre 0 e {@link #capacidadeTotal} (CHECK no banco). */
    @Column(name = "vagas_disponiveis", nullable = false)
    private Integer vagasDisponiveis;

    @Column(name = "telefone", nullable = false, length = 15)
    private String telefone;

    @Column(name = "logradouro", nullable = false, length = 150)
    private String logradouro;

    @Column(name = "bairro", nullable = false, length = 100)
    private String bairro;

    @Column(name = "cep", nullable = false, columnDefinition = "CHAR(8)")
    private String cep;

    /** WGS84. Preenchida junto com longitude ou ambas nulas. */
    @Column(name = "latitude", precision = 9, scale = 6)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 9, scale = 6)
    private BigDecimal longitude;
}
