package br.com.gestaorisco.api.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import br.com.gestaorisco.api.model.enums.OrigemCoordenada;
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
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Onde o usuário mora. Pode ser o endereço completo (CEP + rua) ou só a cidade:
 * CEP e logradouro são preenchidos juntos ou ficam ambos nulos (CHECK no banco).
 */
@Entity
@Table(name = "endereco_usuario")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class EnderecoUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_endereco_usuario")
    @EqualsAndHashCode.Include
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fk_id_usuario", nullable = false, unique = true)
    private Usuario usuario;

    /** Sempre uma cidade atendida (regra validada no service). */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fk_id_localidade", nullable = false)
    private Localidade localidade;

    /** Somente dígitos (8). Nulo quando o usuário só informou a cidade. */
    @Column(name = "cep", columnDefinition = "CHAR(8)")
    private String cep;

    @Column(name = "logradouro", length = 150)
    private String logradouro;

    @Column(name = "numero", length = 10)
    private String numero;

    @Column(name = "complemento", length = 60)
    private String complemento;

    @Column(name = "bairro", length = 100)
    private String bairro;

    /** WGS84. Preenchida junto com longitude e origemCoordenada, ou todas nulas. */
    @Column(name = "latitude", precision = 9, scale = 6)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 9, scale = 6)
    private BigDecimal longitude;

    @Enumerated(EnumType.STRING)
    @Column(name = "origem_coordenada", length = 15)
    private OrigemCoordenada origemCoordenada;

    @Column(name = "atualizado_em", nullable = false)
    private LocalDateTime atualizadoEm;

    @PrePersist
    @PreUpdate
    void marcarAtualizacao() {
        atualizadoEm = LocalDateTime.now();
    }

    public boolean isSoCidade() {
        return cep == null;
    }
}
