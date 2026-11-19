package br.com.gestaorisco.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.gestaorisco.api.model.OcorrenciaEvento;

public  interface OcorrenciaEventoRepository extends JpaRepository<OcorrenciaEvento, Integer>{
    
}
