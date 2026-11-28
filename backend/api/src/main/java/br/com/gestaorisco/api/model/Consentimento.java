package br.com.gestaorisco.api.model;

import java.time.LocalDateTime;

import br.com.gestaorisco.api.model.enums.FinalidadeConsentimento;
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
import jakarta.persistence.Table;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Registro de consentimento (LGPD). Revogar não apaga o registro:
 * preenche revogadoEm, para provar quando o consentimento valeu.
 */
@Entity
@Table(name = "consentimento")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Consentimento {

    /** Versão do texto que o usuário aceitou. Mudou o texto, muda a versão. */
    public static final String VERSAO_TERMO_ATUAL = "2026-11";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_consentimento")
    @EqualsAndHashCode.Include
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fk_id_usuario", nullable = false)
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    @Column(name = "finalidade", nullable = false, length = 20)
    private FinalidadeConsentimento finalidade;

    @Column(name = "versao_termo", nullable = false, length = 20)
    private String versaoTermo;

    @Column(name = "aceito_em", nullable = false)
    private LocalDateTime aceitoEm;

    /** Nulo enquanto o consentimento vale. */
    @Column(name = "revogado_em")
    private LocalDateTime revogadoEm;
}
