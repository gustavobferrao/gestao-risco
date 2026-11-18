package br.com.gestaorisco.api.model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Associação N:N entre órgão e abrigo, com a data de início da gestão. */
@Entity
@Table(name = "gestao_abrigo")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class GestaoAbrigo {

    @EmbeddedId
    @EqualsAndHashCode.Include
    private GestaoAbrigoId id = new GestaoAbrigoId();

    @MapsId("orgaoId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fk_id_orgao")
    private OrgaoResponsavel orgao;

    @MapsId("abrigoId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fk_id_abrigo")
    private Abrigo abrigo;

    @Column(name = "data_inicio_gestao", nullable = false)
    private LocalDate dataInicioGestao;

    public GestaoAbrigo(OrgaoResponsavel orgao, Abrigo abrigo) {
        this.orgao = orgao;
        this.abrigo = abrigo;
    }

    @PrePersist
    void prePersist() {
        if (dataInicioGestao == null) {
            dataInicioGestao = LocalDate.now();
        }
    }
}
