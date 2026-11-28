package br.com.gestaorisco.api.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gestaorisco.api.dto.response.CepResponse;
import br.com.gestaorisco.api.service.EnderecoUsuarioService;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/cep")
@RequiredArgsConstructor
public class CepController {

    private final EnderecoUsuarioService enderecoUsuarioService;

    // público (usado no cadastro, antes do login). CEP inexistente -> 404; ViaCEP fora -> 503.
    @GetMapping("/{cep}")
    public CepResponse consultar(@PathVariable
                                 @Pattern(regexp = "\\d{8}", message = "CEP deve conter somente os 8 dígitos")
                                 String cep) {
        return enderecoUsuarioService.consultarCep(cep);
    }
}
