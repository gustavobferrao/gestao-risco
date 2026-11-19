package br.com.gestaorisco.api.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.gestaorisco.api.model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    // Busca usuário pelo e-mail.
    Optional<Usuario> findByEmail(String email);

    // Verifica se já existe usuário com o e-mail informado.
    boolean existsByEmail(String email);

    // Verifica se já existe usuário com o CPF informado.
    boolean existsByCpf(String cpf);
}
