package br.com.gestaorisco.api.model;

import br.com.gestaorisco.api.model.enums.Perfil;
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

@Entity
@Table(name = "usuario")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    @EqualsAndHashCode.Include
    private Integer id;

    @Column(name = "nome", nullable = false, length = 150)
    private String nome;

    /** Somente dígitos (11). */
    @Column(name = "cpf", nullable = false, unique = true, columnDefinition = "CHAR(11)")
    private String cpf;

    @Column(name = "telefone", nullable = false, length = 15)
    private String telefone;

    @Column(name = "email", nullable = false, unique = true, length = 254)
    private String email;

    /** Hash BCrypt. Nunca expor em DTO de saída. */
    @Column(name = "senha_hash", nullable = false, length = 255)
    private String senhaHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "perfil", nullable = false, length = 10)
    private Perfil perfil = Perfil.CIDADAO;

    /** Obrigatório quando o perfil é AGENTE (regra validada no service). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_id_orgao")
    private OrgaoResponsavel orgao;
}
