package br.com.gestaorisco.api.model;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import br.com.gestaorisco.api.model.enums.NivelRisco;
import br.com.gestaorisco.api.model.enums.Zona;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "area_risco")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class AreaRisco {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_area_risco")
    @EqualsAndHashCode.Include
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fk_id_localidade", nullable = false)
    private Localidade localidade;

    @Column(name = "nome", nullable = false, length = 150)
    private String nome;

    @Column(name = "populacao_afetada", nullable = false)
    private Integer populacaoAfetada = 0;

    @Column(name = "descricao", length = 500)
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(name = "zona", nullable = false, length = 10)
    private Zona zona;

    @Enumerated(EnumType.STRING)
    @Column(name = "nivel_risco", nullable = false, length = 10)
    private NivelRisco nivelRisco = NivelRisco.MEDIO;

    /** Ponto central da área (WGS84). Preenchida junto com longitude ou ambas nulas. */
    @Column(name = "latitude", precision = 9, scale = 6)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 9, scale = 6)
    private BigDecimal longitude;

    @OneToMany(mappedBy = "areaRisco", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EnderecoAreaRisco> enderecos = new ArrayList<>();

    public void adicionarEndereco(EnderecoAreaRisco endereco) {
        endereco.setAreaRisco(this);
        enderecos.add(endereco);
    }
}
