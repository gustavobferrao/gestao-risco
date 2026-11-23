package br.com.gestaorisco.api.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import br.com.gestaorisco.api.dto.request.OcorrenciaRequest;
import br.com.gestaorisco.api.dto.response.AreaRiscoDetalheResponse;
import br.com.gestaorisco.api.dto.response.AreaRiscoResumoResponse;
import br.com.gestaorisco.api.dto.response.HistoricoItemResponse;
import br.com.gestaorisco.api.model.enums.NivelRisco;
import br.com.gestaorisco.api.model.enums.Zona;
import br.com.gestaorisco.api.service.AreaRiscoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/areas-risco")
@RequiredArgsConstructor
public class AreaRiscoController {

    private final AreaRiscoService areaRiscoService;

    // nivel e zona chegam como enum: valor inválido vira 400 pelo GlobalExceptionHandler
    @GetMapping
    public List<AreaRiscoResumoResponse> listar(@RequestParam(required = false) Integer localidadeId,
                                                @RequestParam(required = false) NivelRisco nivel,
                                                @RequestParam(required = false) Zona zona) {
        return areaRiscoService.listar(localidadeId,
                nivel == null ? null : nivel.name(),
                zona == null ? null : zona.name());
    }

    @GetMapping("/{id}")
    public AreaRiscoDetalheResponse detalhar(@PathVariable Integer id) {
        return areaRiscoService.detalhar(id);
    }

    @GetMapping("/{id}/historico")
    public List<HistoricoItemResponse> historico(@PathVariable Integer id) {
        return areaRiscoService.historico(id);
    }

    // agente registra evento climático ocorrido na área; a área é sempre a do caminho
    @PostMapping("/{id}/ocorrencias")
    @ResponseStatus(HttpStatus.CREATED)
    public HistoricoItemResponse registrarOcorrencia(@PathVariable Integer id,
                                                     @RequestBody @Valid OcorrenciaRequest req,
                                                     @RequestHeader("X-Usuario-Id") Integer usuarioId) {
        return areaRiscoService.registrarOcorrencia(id, req, usuarioId);
    }
}
