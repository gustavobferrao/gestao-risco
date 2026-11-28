package br.com.gestaorisco.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gestaorisco.api.dto.request.EnderecoRequest;
import br.com.gestaorisco.api.dto.response.EnderecoUsuarioResponse;
import br.com.gestaorisco.api.service.EnderecoUsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/usuarios/me")
@RequiredArgsConstructor
public class UsuarioController {

    private final EnderecoUsuarioService enderecoUsuarioService;

    // 200 com o endereço, ou 204 quando o usuário ainda não informou (não é erro)
    @GetMapping("/endereco")
    public ResponseEntity<EnderecoUsuarioResponse> endereco(@RequestHeader("X-Usuario-Id") Integer usuarioId) {
        return enderecoUsuarioService.buscar(usuarioId)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.noContent().build());
    }

    // cria ou troca (endereço completo ou só a cidade); exige o consentimento
    @PutMapping("/endereco")
    public EnderecoUsuarioResponse salvarEndereco(@RequestBody @Valid EnderecoRequest req,
                                                  @RequestHeader("X-Usuario-Id") Integer usuarioId) {
        return enderecoUsuarioService.salvar(usuarioId, req);
    }

    // apaga o endereço e revoga o consentimento (direito do titular, LGPD)
    @DeleteMapping("/endereco")
    public ResponseEntity<Void> removerEndereco(@RequestHeader("X-Usuario-Id") Integer usuarioId) {
        enderecoUsuarioService.remover(usuarioId);
        return ResponseEntity.noContent().build();
    }
}
