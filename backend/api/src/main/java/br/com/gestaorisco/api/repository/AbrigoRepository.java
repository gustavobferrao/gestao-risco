package br.com.gestaorisco.api.repository;
import br.com.gestaorisco.api.model.Abrigo;
import br.com.gestaorisco.api.view.AbrigoProximoView;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AbrigoRepository extends JpaRepository<Abrigo, Integer> {

    @Query(nativeQuery = true, value = """
        select a.id_abrigo as id, a.nome, a.telefone,
            a.logradouro, a.bairro, a.cep,
            a.capacidade_total as capacidadeTotal,
            a.vagas_disponiveis as vagasDisponiveis,
            a.latitude, a.longitude,
            round(ST_Distance_Sphere(point(a.longitude, a.latitude),
                                        point(:lng, :lat)) / 1000, 1) as distanciaKm
        from abrigo a
        where a.latitude is not null and a.longitude is not null
            and a.vagas_disponiveis > 0
        order by distanciaKm
        limit :limite""")
    List<AbrigoProximoView> proximos(double lat, double lng, int limite);
}
