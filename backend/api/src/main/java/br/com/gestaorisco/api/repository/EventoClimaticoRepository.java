package br.com.gestaorisco.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.gestaorisco.api.model.EventoClimatico;

public interface EventoClimaticoRepository extends JpaRepository<EventoClimatico, Integer> {
    
}