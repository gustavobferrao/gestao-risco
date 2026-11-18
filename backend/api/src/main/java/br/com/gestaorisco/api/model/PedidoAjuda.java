package br.com.gestaorisco.api.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import br.com.gestaorisco.api.model.enums.StatusPedido;
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
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "pedido_ajuda")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class PedidoAjuda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pedido")
    @EqualsAndHashCode.Include
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fk_id_usuario", nullable = false)
    private Usuario usuario;

    /** Opcional: quem pede socorro pode estar fora de uma área cadastrada. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_id_area_risco")
    private AreaRisco areaRisco;

    @Column(name = "descricao", nullable = false, length = 1000)
    private String descricao;

    @Column(name = "data_hora_solicitacao", nullable = false)
    private LocalDateTime dataHoraSolicitacao;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 15)
    private StatusPedido status = StatusPedido.ABERTO;

    /** WGS84. Preenchida junto com longitude ou ambas nulas. */
    @Column(name = "latitude", precision = 9, scale = 6)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 9, scale = 6)
    private BigDecimal longitude;

    @PrePersist
    void prePersist() {
        if (dataHoraSolicitacao == null) {
            dataHoraSolicitacao = LocalDateTime.now();
        }
    }
}
