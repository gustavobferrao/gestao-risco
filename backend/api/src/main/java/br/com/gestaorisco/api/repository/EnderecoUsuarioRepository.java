package br.com.gestaorisco.api.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import br.com.gestaorisco.api.model.EnderecoUsuario;

public interface EnderecoUsuarioRepository extends JpaRepository<EnderecoUsuario, Integer> {

    // Endereço do usuário já com a cidade carregada (a resposta usa nome, UF e sede).
    @EntityGraph(attributePaths = "localidade")
    Optional<EnderecoUsuario> findByUsuarioId(Integer usuarioId);
}
