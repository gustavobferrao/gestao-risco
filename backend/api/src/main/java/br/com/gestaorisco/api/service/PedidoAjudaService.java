package br.com.gestaorisco.api.service;

import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gestaorisco.api.dto.request.PedidoAjudaRequest;
import br.com.gestaorisco.api.dto.response.PedidoAjudaResponse;
import br.com.gestaorisco.api.exception.RecursoNaoEncontradoException;
import br.com.gestaorisco.api.exception.RegraNegocioException;
import br.com.gestaorisco.api.model.AreaRisco;
import br.com.gestaorisco.api.model.PedidoAjuda;
import br.com.gestaorisco.api.model.Usuario;
import br.com.gestaorisco.api.model.enums.StatusPedido;
import br.com.gestaorisco.api.repository.AreaRiscoRepository;
import br.com.gestaorisco.api.repository.PedidoAjudaRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PedidoAjudaService {
    
    private static final double RAIO_KM = 5;

    private static final Map<StatusPedido, Set<StatusPedido>> TRANSICOES = new EnumMap<>(Map.of(
        StatusPedido.ABERTO, Set.of(StatusPedido.EM_ATENDIMENTO, StatusPedido.CANCELADO),
        StatusPedido.EM_ATENDIMENTO, Set.of(StatusPedido.CONCLUIDO, StatusPedido.CANCELADO),
        StatusPedido.CONCLUIDO, Set.of(),
        StatusPedido.CANCELADO, Set.of()
    ));

    private final PedidoAjudaRepository pedidoAjudaRepository;
    private final AreaRiscoRepository areaRiscoRepository;
    private final UsuarioService usuarioService;

    @Transactional
    public PedidoAjudaResponse abrir(PedidoAjudaRequest req, Integer usuarioId){
        Usuario usuario = usuarioService.buscar(usuarioId);

        PedidoAjuda pedido = new PedidoAjuda();
        pedido.setUsuario(usuario);
        pedido.setDescricao(req.descricao());
        pedido.setLatitude(req.latitude());
        pedido.setLongitude(req.longitude());
        pedido.setAreaRisco(resolverArea(req));
        pedido.setStatus(StatusPedido.ABERTO);
        pedido.setDataHoraSolicitacao(LocalDateTime.now());

        return PedidoAjudaResponse.from(pedidoAjudaRepository.save(pedido));
    }

    public List<PedidoAjudaResponse> meus(Integer usuarioId){
        return pedidoAjudaRepository.findByUsuarioIdOrderByDataHoraSolicitacaoDesc(usuarioId).stream()
            .map(PedidoAjudaResponse::from)
            .toList();
    }

    public List<PedidoAjudaResponse> fila(StatusPedido status, Integer usuarioId){
        usuarioService.exigirAgente(usuarioId);
        StatusPedido filtro = (status ==null) ? StatusPedido.ABERTO: status;
        return pedidoAjudaRepository.findByStatusOrderByDataHoraSolicitacaoAsc(filtro).stream()
            .map(PedidoAjudaResponse::from)
            .toList();
    }

    @Transactional
    public PedidoAjudaResponse alterarStatus(Integer id, StatusPedido novo, Integer usuarioId){
        usuarioService.exigirAgente(usuarioId);
        PedidoAjuda pedido = pedidoAjudaRepository.findById(id)
            .orElseThrow(() -> new RecursoNaoEncontradoException("Pedido "+ id+" não encontrado."));

        StatusPedido atual = pedido.getStatus();
        if(!TRANSICOES.getOrDefault(atual, Set.of()).contains(novo))
            throw new RegraNegocioException("Transição inválida: "+atual+" -> "+novo);

        pedido.setStatus(novo);
        return PedidoAjudaResponse.from(pedido);
    }

    private AreaRisco resolverArea(PedidoAjudaRequest req){
        if(req.areaRiscoId() != null)
            return areaRiscoRepository.findById(req.areaRiscoId())
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                    "Área risco "+req.areaRiscoId() + " não encontrada."
                ));
        
        if(req.latitude() != null && req.longitude() != null)
            return areaRiscoRepository
                .maisProxima(req.latitude().doubleValue(), req.longitude().doubleValue(), RAIO_KM)
                .flatMap(areaRiscoRepository::findById)
                .orElse(null);

        return null;
    }
}
