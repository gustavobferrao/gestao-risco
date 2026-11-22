package br.com.gestaorisco.api.service;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gestaorisco.api.dto.response.EventoClimaticoResponse;
import br.com.gestaorisco.api.repository.EventoClimaticoRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EventoClimaticoService {
    
    private final EventoClimaticoRepository repository;

    public List<EventoClimaticoResponse> listar(){
        return repository.findAll(Sort.by("nome")).stream()
        .map(EventoClimaticoResponse::from)
        .toList();
    }
}