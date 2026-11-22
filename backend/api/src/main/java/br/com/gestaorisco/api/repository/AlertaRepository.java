package br.com.gestaorisco.api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import br.com.gestaorisco.api.model.Alerta;
import br.com.gestaorisco.api.model.enums.StatusAlerta;
import br.com.gestaorisco.api.view.ContagemAlertasView;
import jakarta.persistence.LockModeType;

public interface AlertaRepository extends JpaRepository<Alerta, Integer>{

    // Filtra alertas por status e/ou área de risco (parâmetros nulos são ignorados), mais recentes primeiro.
    // Já traz orgao e areasRisco (fetch) para evitar N+1 no AlertaResponse.from.
    // O filtro por área fica no EXISTS, e não no join do fetch: assim a coleção areasRisco
    // vem completa, e não só com a área filtrada.
    @Query ("""
            select distinct a from Alerta a
                join fetch a.orgao
                left join fetch a.areasRisco
            where (:status is null or a.status = :status)
                and (:areaId is null or exists (
                    select 1 from Alerta a2 join a2.areasRisco ar2
                    where a2.id = a.id and ar2.id = :areaId))
            order by a.dataEmissao desc
            """)
    List<Alerta> filtrar(StatusAlerta status, Integer areaId);

    // Busca com SELECT ... FOR UPDATE: transações concorrentes sobre o mesmo alerta
    // esperam o commit da primeira e então leem o status já atualizado.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select a from Alerta a where a.id = :id")
    Optional<Alerta> findByIdParaAtualizar(Integer id);

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