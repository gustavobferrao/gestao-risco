package br.com.gestaorisco.api.dto.response;

import br.com.gestaorisco.api.model.EventoClimatico;

public record EventoClimaticoResponse(
        Integer id,
        String nome,
        String classificacao) {

    public static EventoClimaticoResponse from(EventoClimatico e) {
        return new EventoClimaticoResponse(e.getId(), e.getNome(), e.getClassificacao());
    }
}
