package br.com.gestaorisco.api.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gestaorisco.api.dto.request.AlertaRequest;
import br.com.gestaorisco.api.dto.request.AlterarStatusRequest;
import br.com.gestaorisco.api.dto.response.AlertaResponse;
import br.com.gestaorisco.api.model.enums.StatusAlerta;
import br.com.gestaorisco.api.service.AlertaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;



@RestController
@RequestMapping("/api/alertas")
@RequiredArgsConstructor
public class AlertaController {
    
    private final AlertaService alertaService;

    @GetMapping
    public List<AlertaResponse> listar(@RequestParam(required = false) StatusAlerta status,
                                        @RequestParam(required = false) Integer areaId){
        return alertaService.listar(status, areaId);
    }
    
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AlertaResponse emitir(@RequestBody @Valid AlertaRequest req,
                                    @RequestHeader("X-Usuario-Id") Integer usuarioId){
        return alertaService.emitir(req, usuarioId);
    }

    @PatchMapping("/{id}/status")
    public AlertaResponse alterarStatus(@PathVariable Integer id,
                                        @RequestBody @Valid AlterarStatusRequest req,
                                        @RequestHeader("X-Usuario-Id") Integer usuarioId
    ){
        return alertaService.alterarStatus(id, req.status(), usuarioId);
    }
    
}
