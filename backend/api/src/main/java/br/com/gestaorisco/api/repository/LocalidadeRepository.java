package br.com.gestaorisco.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.gestaorisco.api.model.Localidade;

public interface LocalidadeRepository extends JpaRepository<Localidade, Integer>{
    
}
