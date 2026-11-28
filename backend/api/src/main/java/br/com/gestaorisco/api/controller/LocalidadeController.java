package br.com.gestaorisco.api.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.gestaorisco.api.dto.response.LocalidadeResponse;
import br.com.gestaorisco.api.service.LocalidadeService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/localidades")
@RequiredArgsConstructor
public class LocalidadeController {

    private final LocalidadeService localidadeService;

    // lista para o filtro de localidade do mapa (ordenada por nome no service).
    // ?atendidas=true devolve só as cidades cobertas pelo SafeZone.
    @GetMapping
    public List<LocalidadeResponse> listar(@RequestParam(required = false) Boolean atendidas) {
        return Boolean.TRUE.equals(atendidas) ? localidadeService.listarAtendidas() : localidadeService.listar();
    }
}
