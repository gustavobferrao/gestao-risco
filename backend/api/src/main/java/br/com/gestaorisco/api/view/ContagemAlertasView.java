package br.com.gestaorisco.api.view;

import br.com.gestaorisco.api.repository.AlertaRepository;

/**
 * Projeção usada por {@link AlertaRepository#contarAtivosPorArea()}.
 * Os nomes dos getters correspondem aos aliases da query ("areaId" e "total").
 */
public interface ContagemAlertasView {

    Integer getAreaId();

    Long getTotal();
}
