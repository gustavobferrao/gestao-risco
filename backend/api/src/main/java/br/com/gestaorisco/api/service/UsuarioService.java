package br.com.gestaorisco.api.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gestaorisco.api.exception.AcessoNegadoException;
import br.com.gestaorisco.api.exception.RecursoNaoEncontradoException;
import br.com.gestaorisco.api.exception.RegraNegocioException;
import br.com.gestaorisco.api.model.Usuario;
import br.com.gestaorisco.api.model.enums.Perfil;
import br.com.gestaorisco.api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UsuarioService {
    
    private final UsuarioRepository usuarioRepository;

    public Usuario buscar(Integer id){
        return usuarioRepository.findById(id)
        .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário "+id+" não encontrado."));
    }

    // Retorna o usuário para o chamador ler getOrgao()
    public Usuario exigirAgente(Integer id){
        Usuario usuario = buscar(id);
        if(usuario.getPerfil() != Perfil.AGENTE)
            throw new AcessoNegadoException("Operação permitida apenas para agentes.");

        if(usuario.getOrgao() == null)
            throw new RegraNegocioException("Agente sem órgão vinculado.");

        return usuario;
    }
}