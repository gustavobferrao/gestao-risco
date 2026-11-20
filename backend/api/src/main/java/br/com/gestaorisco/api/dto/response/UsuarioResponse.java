package br.com.gestaorisco.api.dto.response;

import br.com.gestaorisco.api.model.OrgaoResponsavel;
import br.com.gestaorisco.api.model.Usuario;
import br.com.gestaorisco.api.model.enums.Perfil;

/**
 * Dados públicos do usuário. Nunca inclui senhaHash nem CPF.
 * orgaoId e orgaoNome só vêm preenchidos para AGENTE.
 */
public record UsuarioResponse(
        Integer id,
        String nome,
        String email,
        String telefone,
        Perfil perfil,
        Integer orgaoId,
        String orgaoNome) {

    /** Acessa orgao (LAZY): chamar dentro da transação do service. */
    public static UsuarioResponse from(Usuario u) {
        OrgaoResponsavel orgao = u.getOrgao();
        return new UsuarioResponse(
                u.getId(),
                u.getNome(),
                u.getEmail(),
                u.getTelefone(),
                u.getPerfil(),
                orgao != null ? orgao.getId() : null,
                orgao != null ? orgao.getNome() : null);
    }
}
