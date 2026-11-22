package br.com.gestaorisco.api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import br.com.gestaorisco.api.model.OcorrenciaEvento;

public interface OcorrenciaEventoRepository extends JpaRepository<OcorrenciaEvento, Integer> {

    // Histórico de ocorrências de uma área, mais recentes primeiro (evento já carregado).
    @Query("""
            select o from OcorrenciaEvento o join fetch o.evento
            where o.areaRisco.id = :areaId
            order by o.dataOcorrencia desc
            """)
    List<OcorrenciaEvento> buscarHistoricoDaArea(Integer areaId);
}
