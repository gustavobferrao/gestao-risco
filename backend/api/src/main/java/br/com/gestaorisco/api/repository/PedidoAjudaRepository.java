package br.com.gestaorisco.api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.gestaorisco.api.model.PedidoAjuda;
import br.com.gestaorisco.api.model.enums.StatusPedido;

public interface PedidoAjudaRepository extends JpaRepository<PedidoAjuda, Integer> {

    // Lista os pedidos de um usuário, mais recentes primeiro.
    List<PedidoAjuda> findByUsuarioIdOrderByDataHoraSolicitacaoDesc(Integer usuarioId);

    // Lista os pedidos com o status informado, mais antigos primeiro (fila de atendimento).
    List<PedidoAjuda> findByStatusOrderByDataHoraSolicitacaoAsc(StatusPedido status);
}
