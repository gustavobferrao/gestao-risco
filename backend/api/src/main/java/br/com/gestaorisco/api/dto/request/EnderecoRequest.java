package br.com.gestaorisco.api.dto.request;

import java.math.BigDecimal;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Onde o usuário mora. Duas formas:
 * - endereço completo: cep (+ logradouro e bairro, que o ViaCEP pode completar);
 * - só a cidade: codigoIbge, sem cep.
 * A coordenada é opcional e vem do GPS do aparelho (latitude e longitude juntas).
 */
public record EnderecoRequest(

        @Pattern(regexp = "\\d{8}", message = "CEP deve conter somente os 8 dígitos")
        String cep,

        @Size(max = 150, message = "Rua deve ter no máximo 150 caracteres")
        String logradouro,

        @Size(max = 10, message = "Número deve ter no máximo 10 caracteres")
        String numero,

        @Size(max = 60, message = "Complemento deve ter no máximo 60 caracteres")
        String complemento,

        @Size(max = 100, message = "Bairro deve ter no máximo 100 caracteres")
        String bairro,

        /* Obrigatório quando não há CEP; com CEP, o código vem do ViaCEP. */
        @Pattern(regexp = "\\d{7}", message = "Código IBGE deve conter 7 dígitos")
        String codigoIbge,

        @DecimalMin(value = "-90.0", message = "Latitude fora da faixa")
        @DecimalMax(value = "90.0", message = "Latitude fora da faixa")
        BigDecimal latitude,

        @DecimalMin(value = "-180.0", message = "Longitude fora da faixa")
        @DecimalMax(value = "180.0", message = "Longitude fora da faixa")
        BigDecimal longitude,

        /* LGPD: sem o aceite, o endereço não é gravado. */
        @AssertTrue(message = "Autorize o uso do endereço para salvar")
        boolean consentimento) {
}
