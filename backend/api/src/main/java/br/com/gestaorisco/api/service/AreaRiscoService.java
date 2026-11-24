package br.com.gestaorisco.api.service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gestaorisco.api.dto.request.OcorrenciaRequest;
import br.com.gestaorisco.api.dto.response.AlertaResponse;
import br.com.gestaorisco.api.dto.response.AreaRiscoDetalheResponse;
import br.com.gestaorisco.api.dto.response.AreaRiscoResumoResponse;
import br.com.gestaorisco.api.dto.response.HistoricoItemResponse;
import br.com.gestaorisco.api.exception.RecursoNaoEncontradoException;
import br.com.gestaorisco.api.model.Alerta;
import br.com.gestaorisco.api.model.AreaRisco;
import br.com.gestaorisco.api.model.EventoClimatico;
import br.com.gestaorisco.api.model.OcorrenciaEvento;
import br.com.gestaorisco.api.model.enums.NivelRisco;
import br.com.gestaorisco.api.model.enums.StatusAlerta;
import br.com.gestaorisco.api.model.enums.Zona;
import br.com.gestaorisco.api.repository.AlertaRepository;
import br.com.gestaorisco.api.repository.AreaRiscoRepository;
import br.com.gestaorisco.api.repository.EventoClimaticoRepository;
import br.com.gestaorisco.api.repository.OcorrenciaEventoRepository;
import br.com.gestaorisco.api.view.ContagemAlertasView;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AreaRiscoService {
    
    private final AreaRiscoRepository areaRiscoRepository;
    private final AlertaRepository alertaRepository;
    private final OcorrenciaEventoRepository ocorrenciaEventoRepository;
    private final EventoClimaticoRepository eventoClimaticoRepository;
    private final UsuarioService usuarioService;

    public List<AreaRiscoResumoResponse> listar(Integer localidadeId, NivelRisco nivel, Zona zona){
        Map<Integer, Long> ativosPorArea = alertaRepository.contarAtivosPorArea().stream()
            .collect(Collectors.toMap(ContagemAlertasView::getAreaId, ContagemAlertasView::getTotal));
        
        return areaRiscoRepository.filtrar(localidadeId, nivel, zona).stream()
            .map(a -> AreaRiscoResumoResponse.from(a, ativosPorArea.getOrDefault(a.getId(), 0L)))
            .toList();
    }

    public AreaRiscoDetalheResponse detalhar(Integer id){
        AreaRisco area = areaRiscoRepository.buscarDetalhe(id)
            .orElseThrow(() -> areaNaoEncontrada(id));
        List<AlertaResponse> alertasAtivos = alertaRepository.filtrar(StatusAlerta.ATIVO, id).stream()
            .map(AlertaResponse::from)
            .toList();
            
        List<HistoricoItemResponse> historico = ocorrenciaEventoRepository.buscarHistoricoDaArea(id).stream()
            .map(HistoricoItemResponse::from)
            .toList();

        return AreaRiscoDetalheResponse.from(area, alertasAtivos, historico);
    }

    public List<HistoricoItemResponse> historico(Integer id) {
        if (!areaRiscoRepository.existsById(id)) {
            throw areaNaoEncontrada(id);
        }
        Stream<HistoricoItemResponse> ocorrencias = ocorrenciaEventoRepository
            .buscarHistoricoDaArea(id).stream()
            .map(HistoricoItemResponse::from);

        Stream<HistoricoItemResponse> alertas = alertaRepository
            .findByAreasRiscoIdOrderByDataEmissaoDesc(id).stream()
            .map(this::alertaParaHistorico);

        return Stream.concat(ocorrencias, alertas)
            .sorted(Comparator.comparing(HistoricoItemResponse::dataOcorrencia).reversed())
            .toList();
    }


    @Transactional
    public HistoricoItemResponse registrarOcorrencia(Integer areaId, OcorrenciaRequest req, Integer usuarioId) {
        usuarioService.exigirAgente(usuarioId);

        AreaRisco area = areaRiscoRepository.findById(areaId)
            .orElseThrow(() -> areaNaoEncontrada(areaId));
        EventoClimatico evento = eventoClimaticoRepository.findById(req.eventoId())
            .orElseThrow(() -> new RecursoNaoEncontradoException(
                "Evento climático " + req.eventoId() + " não encontrado"));

        OcorrenciaEvento ocorrencia = new OcorrenciaEvento();
        ocorrencia.setAreaRisco(area);
        ocorrencia.setEvento(evento);
        ocorrencia.setDataOcorrencia(req.dataOcorrencia());

        return HistoricoItemResponse.from(ocorrenciaEventoRepository.save(ocorrencia));
    }

    private HistoricoItemResponse alertaParaHistorico(Alerta a){
        return new HistoricoItemResponse(
            a.getId(),
            null,
            a.getTipo(),
            a.getNivelSeveridade().name(),
            a.getDataEmissao()
            );
    }

    private RecursoNaoEncontradoException areaNaoEncontrada(Integer id) {
        return new RecursoNaoEncontradoException("Área de risco " + id + " não encontrada");
    }
}
