package br.com.gestaorisco.api.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gestaorisco.api.dto.response.EventoClimaticoResponse;
import br.com.gestaorisco.api.service.EventoClimaticoService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/eventos-climaticos")
@RequiredArgsConstructor
public class EventoClimaticoController {

    private final EventoClimaticoService eventoClimaticoService;

    // catálogo para o formulário de ocorrência do agente (ordenado por nome no service)
    @GetMapping
    public List<EventoClimaticoResponse> listar() {
        return eventoClimaticoService.listar();
    }
}
