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

@Entity
@Table(name = "orgao_responsavel")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class OrgaoResponsavel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_orgao")
    @EqualsAndHashCode.Include
    private Integer id;

    @Column(name = "nome", nullable = false, length = 150)
    private String nome;

    /** Somente dígitos (14). */
    @Column(name = "cnpj", nullable = false, unique = true, columnDefinition = "CHAR(14)")
    private String cnpj;

    /** Somente dígitos, com DDD. */
    @Column(name = "telefone", nullable = false, length = 15)
    private String telefone;
}
