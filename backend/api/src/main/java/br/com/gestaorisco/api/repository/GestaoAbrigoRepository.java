package br.com.gestaorisco.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.gestaorisco.api.model.GestaoAbrigo;
import br.com.gestaorisco.api.model.GestaoAbrigoId;

public interface GestaoAbrigoRepository extends JpaRepository<GestaoAbrigo, GestaoAbrigoId>{
    
}
