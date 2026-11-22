package br.com.gestaorisco.api.service;

import br.com.gestaorisco.api.dto.request.AlertaRequest;
import br.com.gestaorisco.api.dto.response.AlertaResponse;
import br.com.gestaorisco.api.exception.AcessoNegadoException;
import br.com.gestaorisco.api.exception.RecursoNaoEncontradoException;
import br.com.gestaorisco.api.exception.RegraNegocioException;
import br.com.gestaorisco.api.model.Alerta;
import br.com.gestaorisco.api.model.AreaRisco;
import br.com.gestaorisco.api.model.Usuario;
import br.com.gestaorisco.api.model.enums.StatusAlerta;
import br.com.gestaorisco.api.repository.AlertaRepository;
import br.com.gestaorisco.api.repository.AreaRiscoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AlertaService {
    
    private final AlertaRepository alertaRepository;
    private final AreaRiscoRepository areaRiscoRepository;
    private final UsuarioService usuarioService;

    public List<AlertaResponse> listar(StatusAlerta status, Integer areaId) {
        return alertaRepository.filtrar(status, areaId).stream()
            .map(AlertaResponse::from)
            .toList();
    }

    @Transactional
    public AlertaResponse emitir(AlertaRequest req, Integer usuarioId) {
        Usuario agente = usuarioService.exigirAgente(usuarioId);

        List<AreaRisco> areas = areaRiscoRepository.findAllById(req.areasRiscoIds());
        if (areas.size() != req.areasRiscoIds().size()) {
            Set<Integer> encontradas = areas.stream().map(AreaRisco::getId).collect(Collectors.toSet());
            List<Integer> faltando = req.areasRiscoIds().stream()
                .filter(id -> !encontradas.contains(id))
                .sorted()
                .toList();
            throw new RegraNegocioException("Áreas de risco inexistentes: " + faltando);
        }

        Alerta alerta = new Alerta();
        alerta.setTipo(req.tipo());
        alerta.setNivelSeveridade(req.nivelSeveridade());
        alerta.setStatus(StatusAlerta.ATIVO);
        alerta.setDataEmissao(LocalDateTime.now());
        alerta.setOrgao(agente.getOrgao()); // nunca vem do request
        alerta.setAreasRisco(new HashSet<>(areas));

        return AlertaResponse.from(alertaRepository.save(alerta));
    }

    @Transactional
    public AlertaResponse alterarStatus(Integer id, StatusAlerta novo, Integer usuarioId) {
        Usuario agente = usuarioService.exigirAgente(usuarioId);
        // Lock pessimista: impede que duas alterações simultâneas vejam o alerta como ATIVO.
        Alerta alerta = alertaRepository.findByIdParaAtualizar(id)
            .orElseThrow(() -> new RecursoNaoEncontradoException("Alerta " + id + " não encontrado"));

        if (!Objects.equals(alerta.getOrgao().getId(), agente.getOrgao().getId())) {
            throw new AcessoNegadoException("Alerta pertence a outro órgão");
        }
        if (alerta.getStatus() != StatusAlerta.ATIVO) {
            throw new RegraNegocioException("Só é possível alterar alertas ATIVOS");
        }
        if (novo != StatusAlerta.ENCERRADO && novo != StatusAlerta.CANCELADO) {
            throw new RegraNegocioException("Novo status deve ser ENCERRADO ou CANCELADO");
        }

        alerta.setStatus(novo); // dirty check salva no commit
        return AlertaResponse.from(alerta);
    }
}
