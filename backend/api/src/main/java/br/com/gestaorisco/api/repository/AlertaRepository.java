package br.com.gestaorisco.api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import br.com.gestaorisco.api.model.Alerta;
import br.com.gestaorisco.api.model.enums.StatusAlerta;
import br.com.gestaorisco.api.view.ContagemAlertasView;

public interface AlertaRepository extends JpaRepository<Alerta, Integer>{

    // Filtra alertas por status e/ou área de risco (parâmetros nulos são ignorados), mais recentes primeiro.
    @Query ("""
            select distinct a from Alerta a left join a.areasRisco ar
            where (:status is null or a.status = :status)
                and (:areaId is null or ar.id = :areaId)
            order by a.dataEmissao desc
            """)
    List<Alerta> filtrar(StatusAlerta status, Integer areaId);

    // Lista os alertas de uma área de risco, mais recentes primeiro.
    List<Alerta> findByAreasRiscoIdOrderByDataEmissaoDesc(Integer areaId);

    // Conta os alertas ATIVOS agrupados por área de risco.
    @Query("""
            select ar.id as areaId, count(a) as total
            from Alerta a join a.areasRisco ar
            where a.status = br.com.gestaorisco.api.model.enums.StatusAlerta.ATIVO
            group by ar.id
            """)
    List<ContagemAlertasView> contarAtivosPorArea();


    
}