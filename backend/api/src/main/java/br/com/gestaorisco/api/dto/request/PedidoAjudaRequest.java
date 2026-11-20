package br.com.gestaorisco.api.dto.request;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/**
 * Pedido de ajuda de um cidadão. O usuário vem do usuário autenticado.
 * A área de risco é opcional: se ausente e houver coordenadas, o service pode
 * buscar a área mais próxima (AreaRiscoRepository.maisProxima).
 */
public record PedidoAjudaRequest(

        @NotBlank(message = "Descrição é obrigatória")
        @Size(max = 1000, message = "Descrição deve ter no máximo 1000 caracteres")
        String descricao,

        @Positive
        Integer areaRiscoId,

        @DecimalMin(value = "-90.0", message = "Latitude deve estar entre -90 e 90")
        @DecimalMax(value = "90.0", message = "Latitude deve estar entre -90 e 90")
        @Digits(integer = 3, fraction = 6, message = "Latitude aceita no máximo 6 casas decimais")
        BigDecimal latitude,

        @DecimalMin(value = "-180.0", message = "Longitude deve estar entre -180 e 180")
        @DecimalMax(value = "180.0", message = "Longitude deve estar entre -180 e 180")
        @Digits(integer = 3, fraction = 6, message = "Longitude aceita no máximo 6 casas decimais")
        BigDecimal longitude) {

    /** Espelha a regra do banco: latitude e longitude vêm juntas ou ambas nulas. */
    @JsonIgnore
    @AssertTrue(message = "Latitude e longitude devem ser informadas juntas")
    public boolean isCoordenadasConsistentes() {
        return (latitude == null) == (longitude == null);
    }
}
