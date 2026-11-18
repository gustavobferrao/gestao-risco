package br.com.gestaorisco.api.model;

import java.time.LocalDateTime;

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

/**
 * Ocorrência de um evento climático em uma área (tabela evento_area_risco).
 * Com id próprio, a mesma área pode registrar o mesmo evento várias vezes,
 * o que forma o histórico.
 */
@Entity
@Table(name = "evento_area_risco")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class OcorrenciaEvento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_ocorrencia")
    @EqualsAndHashCode.Include
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fk_id_evento", nullable = false)
    private EventoClimatico evento;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fk_id_area_risco", nullable = false)
    private AreaRisco areaRisco;

    @Column(name = "data_ocorrencia", nullable = false)
    private LocalDateTime dataOcorrencia;
}
