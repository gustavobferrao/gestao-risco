package br.com.gestaorisco.api.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import br.com.gestaorisco.api.dto.request.CadastroRequest;
import br.com.gestaorisco.api.dto.response.UsuarioResponse;
import br.com.gestaorisco.api.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/agentes")
@RequiredArgsConstructor
public class AgenteController {

    private final AuthService authService;

    // só um agente cadastra outro; o novo agente herda o órgão de quem cadastrou.
    // mesmo corpo do cadastro público (nome, cpf, telefone, email, senha).
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioResponse cadastrar(@RequestBody @Valid CadastroRequest req,
                                     @RequestHeader("X-Usuario-Id") Integer usuarioId) {
        return authService.cadastrarAgente(req, usuarioId);
    }
}
