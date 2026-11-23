package br.com.gestaorisco.api.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import br.com.gestaorisco.api.dto.request.CadastroRequest;
import br.com.gestaorisco.api.dto.request.LoginRequest;
import br.com.gestaorisco.api.dto.response.UsuarioResponse;
import br.com.gestaorisco.api.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // perfil é sempre CIDADAO: definido no service, nunca vem do corpo
    @PostMapping("/cadastro")
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioResponse cadastrar(@RequestBody @Valid CadastroRequest req) {
        return authService.cadastrar(req);
    }

    // sem token por enquanto (etapa 5 do plano): devolve id, perfil e órgão
    @PostMapping("/login")
    public UsuarioResponse login(@RequestBody @Valid LoginRequest req) {
        return authService.login(req);
    }
}
