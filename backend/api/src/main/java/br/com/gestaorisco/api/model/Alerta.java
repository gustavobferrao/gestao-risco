package br.com.gestaorisco.api.model;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import br.com.gestaorisco.api.model.enums.Severidade;
import br.com.gestaorisco.api.model.enums.StatusAlerta;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "alerta")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Alerta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_alerta")
    @EqualsAndHashCode.Include
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fk_id_orgao", nullable = false)
    private OrgaoResponsavel orgao;

    /** Ex.: Chuva forte, Deslizamento. */
    @Column(name = "tipo", nullable = false, length = 60)
    private String tipo;

    @Enumerated(EnumType.STRING)
    @Column(name = "nivel_severidade", nullable = false, length = 10)
    private Severidade nivelSeveridade;

    @Column(name = "data_emissao", nullable = false)
    private LocalDateTime dataEmissao;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_alerta", nullable = false, length = 10)
    private StatusAlerta status = StatusAlerta.ATIVO;

    /** Tabela associativa alerta_area_risco (sem entidade própria). */
    @ManyToMany
    @JoinTable(
            name = "alerta_area_risco",
            joinColumns = @JoinColumn(name = "fk_id_alerta"),
            inverseJoinColumns = @JoinColumn(name = "fk_id_area_risco"))
    private Set<AreaRisco> areasRisco = new HashSet<>();

    @PrePersist
    void prePersist() {
        if (dataEmissao == null) {
            dataEmissao = LocalDateTime.now();
        }
    }
}
