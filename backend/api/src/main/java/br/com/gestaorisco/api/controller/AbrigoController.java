package br.com.gestaorisco.api.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.gestaorisco.api.dto.response.AbrigoProximoResponse;
import br.com.gestaorisco.api.service.AbrigoService;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/abrigos")
@RequiredArgsConstructor
public class AbrigoController {

    private final AbrigoService abrigoService;

    // lat/lng obrigatórios (ausente -> 400); fora da faixa WGS84 -> 400 pelo GlobalExceptionHandler.
    // limite é opcional: o service aplica o padrão (5) e o teto (20).
    @GetMapping("/proximos")
    public List<AbrigoProximoResponse> proximos(
            @RequestParam
            @DecimalMin(value = "-90", message = "Latitude deve estar entre -90 e 90")
            @DecimalMax(value = "90", message = "Latitude deve estar entre -90 e 90")
            double lat,
            @RequestParam
            @DecimalMin(value = "-180", message = "Longitude deve estar entre -180 e 180")
            @DecimalMax(value = "180", message = "Longitude deve estar entre -180 e 180")
            double lng,
            @RequestParam(required = false) Integer limite) {
        return abrigoService.proximos(lat, lng, limite);
    }
}
