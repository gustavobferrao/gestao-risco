package br.com.gestaorisco.api.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import br.com.gestaorisco.api.dto.request.AlterarStatusPedidoRequest;
import br.com.gestaorisco.api.dto.request.PedidoAjudaRequest;
import br.com.gestaorisco.api.dto.response.PedidoAjudaResponse;
import br.com.gestaorisco.api.model.enums.StatusPedido;
import br.com.gestaorisco.api.service.PedidoAjudaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/pedidos-ajuda")
@RequiredArgsConstructor
public class PedidoAjudaController {

    private final PedidoAjudaService pedidoAjudaService;

    // ---- cidadão ----

    // área é opcional: sem areaRiscoId, o service tenta a mais próxima pelas coordenadas
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PedidoAjudaResponse abrir(@RequestBody @Valid PedidoAjudaRequest req,
                                     @RequestHeader("X-Usuario-Id") Integer usuarioId) {
        return pedidoAjudaService.abrir(req, usuarioId);
    }

    @GetMapping("/meus")
    public List<PedidoAjudaResponse> meus(@RequestHeader("X-Usuario-Id") Integer usuarioId) {
        return pedidoAjudaService.meus(usuarioId);
    }

    // ---- agente ----

    // sem status, o service usa ABERTO; status inexistente vira 400 pelo GlobalExceptionHandler
    @GetMapping
    public List<PedidoAjudaResponse> fila(@RequestParam(required = false) StatusPedido status,
                                          @RequestHeader("X-Usuario-Id") Integer usuarioId) {
        return pedidoAjudaService.fila(status, usuarioId);
    }

    // transições permitidas (ABERTO -> EM_ATENDIMENTO -> CONCLUIDO, ou CANCELADO) ficam no service
    @PatchMapping("/{id}/status")
    public PedidoAjudaResponse alterarStatus(@PathVariable Integer id,
                                             @RequestBody @Valid AlterarStatusPedidoRequest req,
                                             @RequestHeader("X-Usuario-Id") Integer usuarioId) {
        return pedidoAjudaService.alterarStatus(id, req.status(), usuarioId);
    }
}
