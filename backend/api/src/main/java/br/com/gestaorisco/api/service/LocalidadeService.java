package br.com.gestaorisco.api.service;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gestaorisco.api.dto.response.LocalidadeResponse;
import br.com.gestaorisco.api.repository.LocalidadeRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LocalidadeService {
    
    private final LocalidadeRepository repository;

    public List<LocalidadeResponse> listar(){
        return repository.findAll(Sort.by("nome")).stream()
        .map(LocalidadeResponse::from)
        .toList();
    }

    // só as cidades cobertas pelo SafeZone (escolha de cidade no cadastro e no mapa)
    public List<LocalidadeResponse> listarAtendidas(){
        return repository.findByAtendidaTrueOrderByNome().stream()
        .map(LocalidadeResponse::from)
        .toList();
    }
}
