package br.com.gestaorisco.api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.gestaorisco.api.model.Localidade;

public interface LocalidadeRepository extends JpaRepository<Localidade, Integer>{

    // Busca a cidade pelo código IBGE (o que o ViaCEP devolve).
    Optional<Localidade> findByCodigoIbge(String codigoIbge);

    // Cidades cobertas pelo SafeZone, em ordem alfabética.
    List<Localidade> findByAtendidaTrueOrderByNome();
}
