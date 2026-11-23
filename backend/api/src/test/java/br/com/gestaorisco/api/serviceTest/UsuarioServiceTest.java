package br.com.gestaorisco.api.serviceTest;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import br.com.gestaorisco.api.exception.AcessoNegadoException;
import br.com.gestaorisco.api.exception.RecursoNaoEncontradoException;
import br.com.gestaorisco.api.exception.RegraNegocioException;
import br.com.gestaorisco.api.model.OrgaoResponsavel;
import br.com.gestaorisco.api.model.Usuario;
import br.com.gestaorisco.api.model.enums.Perfil;
import br.com.gestaorisco.api.repository.UsuarioRepository;
import br.com.gestaorisco.api.service.UsuarioService;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {
    
    @Mock UsuarioRepository usuarioRepository;
    @InjectMocks UsuarioService service;

    private Usuario usuario(Perfil perfil, OrgaoResponsavel orgao){
        Usuario u = new Usuario();
        u.setId(1);
        u.setPerfil(perfil);
        u.setOrgao(orgao);
        return u;
    }

    // busca id existente e retorna usuario
    @Test
    void buscar_idExistente(){
        Usuario cidadao = usuario(Perfil.CIDADAO, null);
        when(usuarioRepository.findById(1)).thenReturn(Optional.of(cidadao));
        assertThat(service.buscar(1)).isSameAs(cidadao);
    }

    // busca id inexistente e lança recurso não encontrado
    @Test
    void buscar_idInexistente_lancaNaoEncontrado(){
        when(usuarioRepository.findById(99))
            .thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.buscar(99))
            .isInstanceOf(RecursoNaoEncontradoException.class);
    }

    // busca agente com pergil cidadao e lança acesso negado
    @Test
    void exigirAgente_cidadao_lancaAcessoNegado(){
        when(usuarioRepository.findById(1))
            .thenReturn(Optional.of(usuario(Perfil.CIDADAO, null)));

        assertThatThrownBy(() -> service.exigirAgente(1))
            .isInstanceOf(AcessoNegadoException.class);
    }

    // busca agente com orgao e retorna usuario
    @Test
    void exigirAgente_agenteComOrgao_retornaUsuario(){
        Usuario agente = usuario(Perfil.AGENTE, new OrgaoResponsavel());
        when(usuarioRepository.findById(1)).thenReturn(Optional.of(agente));

        assertThat(service.exigirAgente(1)).isSameAs(agente);
    }

    // busca agente sem orgao e lança regra de negocion violada
    @Test
    void exigirAgente_agenteSemOrgao_lancaRegraNegocio(){
        when(usuarioRepository.findById(1))
            .thenReturn(Optional.of(usuario(Perfil.AGENTE, null)));

        assertThatThrownBy(() -> service.exigirAgente(1))
            .isInstanceOf(RegraNegocioException.class)
            .hasMessageContaining("sem órgão vinculado.");
    }

    
}
