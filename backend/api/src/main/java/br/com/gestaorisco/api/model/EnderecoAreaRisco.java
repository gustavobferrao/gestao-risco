package br.com.gestaorisco.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "endereco_area_risco")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class EnderecoAreaRisco {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_endereco")
    @EqualsAndHashCode.Include
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fk_id_area_risco", nullable = false)
    private AreaRisco areaRisco;

    @Column(name = "logradouro", nullable = false, length = 150)
    private String logradouro;

    @Column(name = "bairro", nullable = false, length = 100)
    private String bairro;

    /** Texto: aceita S/N, 12A etc. */
    @Column(name = "numero", length = 10)
    private String numero;

    @Column(name = "cep", nullable = false, columnDefinition = "CHAR(8)")
    private String cep;
}
