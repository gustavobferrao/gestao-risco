package br.com.gestaorisco.api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import br.com.gestaorisco.api.model.AreaRisco;
import br.com.gestaorisco.api.model.enums.NivelRisco;
import br.com.gestaorisco.api.model.enums.Zona;

public interface AreaRiscoRepository extends JpaRepository<AreaRisco, Integer> {

    // Filtra áreas por localidade, nível de risco e zona (parâmetros nulos são ignorados), ordenadas por nome.
    @Query("""
    select a from AreaRisco a join fetch a.localidade
    where (:localidadeId is null or a.localidade.id = :localidadeId )
    and (:nivelRisco is null or a.nivelRisco = :nivelRisco)
    and (:zona is null or a.zona = :zona)
order by a.nome""")
    List<AreaRisco> filtrar(Integer localidadeId, NivelRisco nivelRisco, Zona zona);

    // Busca uma área pelo id já carregando localidade e endereços.
    @EntityGraph (attributePaths={"localidade", "enderecos"})
    @Query("select a from AreaRisco a where a.id = :id")
    Optional<AreaRisco> buscarDetalhe(Integer id);

    // Retorna o id da área mais próxima da coordenada informada, dentro do raio (km).
    @Query(nativeQuery = true, value ="""
            select a.id_area_risco
            from area_risco a
            where a.latitude is not null
            and a.longitude is not null
            and ST_Distance_Sphere(point(a.longitude, a.latitude), point(:lng, :lat))
                <= :raioKm * 1000
            order by ST_Distance_Sphere(point(a.longitude, a.latitude), point(:lng, :lat))
            limit 1
            """)
    Optional<Integer> maisProxima(double lat, double lng, double raioKm);
}
