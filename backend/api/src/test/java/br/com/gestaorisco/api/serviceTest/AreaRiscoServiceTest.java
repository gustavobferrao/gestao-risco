package br.com.gestaorisco.api.serviceTest;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import br.com.gestaorisco.api.dto.request.OcorrenciaRequest;
import br.com.gestaorisco.api.dto.response.AreaRiscoDetalheResponse;
import br.com.gestaorisco.api.dto.response.AreaRiscoResumoResponse;
import br.com.gestaorisco.api.dto.response.HistoricoItemResponse;
import br.com.gestaorisco.api.exception.AcessoNegadoException;
import br.com.gestaorisco.api.exception.RecursoNaoEncontradoException;
import br.com.gestaorisco.api.model.Alerta;
import br.com.gestaorisco.api.model.AreaRisco;
import br.com.gestaorisco.api.model.EventoClimatico;
import br.com.gestaorisco.api.model.Localidade;
import br.com.gestaorisco.api.model.OcorrenciaEvento;
import br.com.gestaorisco.api.model.OrgaoResponsavel;
import br.com.gestaorisco.api.model.enums.NivelRisco;
import br.com.gestaorisco.api.model.enums.Severidade;
import br.com.gestaorisco.api.model.enums.StatusAlerta;
import br.com.gestaorisco.api.model.enums.Zona;
import br.com.gestaorisco.api.repository.AlertaRepository;
import br.com.gestaorisco.api.repository.AreaRiscoRepository;
import br.com.gestaorisco.api.repository.EventoClimaticoRepository;
import br.com.gestaorisco.api.repository.OcorrenciaEventoRepository;
import br.com.gestaorisco.api.service.AreaRiscoService;
import br.com.gestaorisco.api.service.UsuarioService;
import br.com.gestaorisco.api.view.ContagemAlertasView;

@ExtendWith(MockitoExtension.class)
class AreaRiscoServiceTest {

    @Mock AreaRiscoRepository areaRiscoRepository;
    @Mock AlertaRepository alertaRepository;
    @Mock OcorrenciaEventoRepository ocorrenciaEventoRepository;
    @Mock EventoClimaticoRepository eventoClimaticoRepository;
    @Mock UsuarioService usuarioService;

    @InjectMocks AreaRiscoService service;

    @Captor ArgumentCaptor<OcorrenciaEvento> captor;

    private static final LocalDateTime BASE = LocalDateTime.of(2026, 1, 10, 12, 0);

    private Localidade localidade(){
        Localidade l = new Localidade();
        l.setId(1);
        l.setNome("Centro");
        return l;
    }

    private AreaRisco area(Integer id){
        AreaRisco a = new AreaRisco();
        a.setId(id);
        a.setNome("Área " + id);
        a.setLocalidade(localidade());
        a.setZona(Zona.URBANA);
        a.setNivelRisco(NivelRisco.ALTO);
        return a;
    }

    private EventoClimatico evento(Integer id){
        EventoClimatico e = new EventoClimatico();
        e.setId(id);
        e.setNome("Enchente");
        e.setClassificacao("Hidrológico");
        return e;
    }

    private OcorrenciaEvento ocorrencia(Integer id, LocalDateTime data){
        OcorrenciaEvento o = new OcorrenciaEvento();
        o.setId(id);
        o.setEvento(evento(2));
        o.setAreaRisco(area(5));
        o.setDataOcorrencia(data);
        return o;
    }

    private Alerta alerta(Integer id, LocalDateTime data){
        OrgaoResponsavel orgao = new OrgaoResponsavel();
        orgao.setId(3);
        orgao.setNome("Defesa Civil");
        Alerta a = new Alerta();
        a.setId(id);
        a.setTipo("Chuva forte");
        a.setNivelSeveridade(Severidade.CRITICO);
        a.setStatus(StatusAlerta.ATIVO);
        a.setDataEmissao(data);
        a.setOrgao(orgao);
        a.setAreasRisco(new HashSet<>(Set.of(area(5))));
        return a;
    }

    private ContagemAlertasView contagem(Integer areaId, long total){
        return new ContagemAlertasView() {
            public Integer getAreaId() { return areaId; }
            public Long getTotal() { return total; }
        };
    }

    // ===================== listar =====================

    // repassa os filtros e junta a contagem de alertas ativos em cada área
    @Test
    void listar_juntaContagemDeAlertasAtivos(){
        when(alertaRepository.contarAtivosPorArea()).thenReturn(List.of(contagem(5, 3L)));
        when(areaRiscoRepository.filtrar(1, "ALTO", "URBANA")).thenReturn(List.of(area(5)));

        List<AreaRiscoResumoResponse> resp = service.listar(1, "ALTO", "URBANA");

        assertThat(resp).hasSize(1);
        assertThat(resp.get(0).id()).isEqualTo(5);
        assertThat(resp.get(0).localidadeNome()).isEqualTo("Centro");
        assertThat(resp.get(0).alertasAtivos()).isEqualTo(3L);
    }

    // área que não aparece na contagem recebe 0 alertas ativos
    @Test
    void listar_areaSemAlertas_recebeZero(){
        when(alertaRepository.contarAtivosPorArea()).thenReturn(List.of(contagem(5, 2L)));
        when(areaRiscoRepository.filtrar(null, null, null)).thenReturn(List.of(area(5), area(6)));

        List<AreaRiscoResumoResponse> resp = service.listar(null, null, null);

        assertThat(resp).extracting(AreaRiscoResumoResponse::id, AreaRiscoResumoResponse::alertasAtivos)
            .containsExactly(tuple(5, 2L), tuple(6, 0L));
    }

    // nenhuma área encontrada retorna lista vazia
    @Test
    void listar_semAreas_retornaVazio(){
        when(alertaRepository.contarAtivosPorArea()).thenReturn(List.of());
        when(areaRiscoRepository.filtrar(any(), any(), any())).thenReturn(List.of());

        assertThat(service.listar(null, null, null)).isEmpty();
    }

    // ===================== detalhar =====================

    // área existente traz dados, alertas ATIVOS da área e histórico de ocorrências
    @Test
    void detalhar_areaExistente_montaDetalhe(){
        when(areaRiscoRepository.buscarDetalhe(5)).thenReturn(Optional.of(area(5)));
        when(alertaRepository.filtrar(StatusAlerta.ATIVO, 5)).thenReturn(List.of(alerta(20, BASE)));
        when(ocorrenciaEventoRepository.buscarHistoricoDaArea(5))
            .thenReturn(List.of(ocorrencia(30, BASE.minusDays(1))));

        AreaRiscoDetalheResponse resp = service.detalhar(5);

        assertThat(resp.id()).isEqualTo(5);
        assertThat(resp.localidade().nome()).isEqualTo("Centro");
        assertThat(resp.alertasAtivos()).extracting(a -> a.id()).containsExactly(20);
        assertThat(resp.historico()).extracting(HistoricoItemResponse::id).containsExactly(30);
        verify(alertaRepository).filtrar(StatusAlerta.ATIVO, 5);
    }

    // área inexistente lança recurso não encontrado e não busca alertas nem histórico
    @Test
    void detalhar_areaInexistente_lancaNaoEncontrado(){
        when(areaRiscoRepository.buscarDetalhe(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.detalhar(99))
            .isInstanceOf(RecursoNaoEncontradoException.class)
            .hasMessageContaining("99");
        verifyNoInteractions(alertaRepository, ocorrenciaEventoRepository);
    }

    // ===================== historico =====================

    // junta ocorrências e alertas da área, do mais recente para o mais antigo
    @Test
    void historico_juntaOcorrenciasEAlertasOrdenadosPorDataDesc(){
        when(areaRiscoRepository.existsById(5)).thenReturn(true);
        when(ocorrenciaEventoRepository.buscarHistoricoDaArea(5)).thenReturn(List.of(
            ocorrencia(30, BASE.minusDays(1)),
            ocorrencia(31, BASE.minusDays(5))));
        when(alertaRepository.findByAreasRiscoIdOrderByDataEmissaoDesc(5)).thenReturn(List.of(
            alerta(20, BASE),
            alerta(21, BASE.minusDays(3))));

        List<HistoricoItemResponse> resp = service.historico(5);

        assertThat(resp).extracting(HistoricoItemResponse::id).containsExactly(20, 30, 21, 31);
    }

    // alerta no histórico vira item sem eventoId, com tipo como evento e severidade como classificação
    @Test
    void historico_alertaConvertidoParaItem(){
        when(areaRiscoRepository.existsById(5)).thenReturn(true);
        when(ocorrenciaEventoRepository.buscarHistoricoDaArea(5)).thenReturn(List.of());
        when(alertaRepository.findByAreasRiscoIdOrderByDataEmissaoDesc(5)).thenReturn(List.of(alerta(20, BASE)));

        HistoricoItemResponse item = service.historico(5).get(0);

        assertThat(item.id()).isEqualTo(20);
        assertThat(item.eventoId()).isNull();
        assertThat(item.evento()).isEqualTo("Chuva forte");
        assertThat(item.classificacao()).isEqualTo("CRITICO");
        assertThat(item.dataOcorrencia()).isEqualTo(BASE);
    }

    // ocorrência no histórico mantém os dados do evento climático
    @Test
    void historico_ocorrenciaMantemDadosDoEvento(){
        when(areaRiscoRepository.existsById(5)).thenReturn(true);
        when(ocorrenciaEventoRepository.buscarHistoricoDaArea(5)).thenReturn(List.of(ocorrencia(30, BASE)));
        when(alertaRepository.findByAreasRiscoIdOrderByDataEmissaoDesc(5)).thenReturn(List.of());

        HistoricoItemResponse item = service.historico(5).get(0);

        assertThat(item.eventoId()).isEqualTo(2);
        assertThat(item.evento()).isEqualTo("Enchente");
        assertThat(item.classificacao()).isEqualTo("Hidrológico");
    }

    // área sem ocorrências nem alertas retorna lista vazia
    @Test
    void historico_semRegistros_retornaVazio(){
        when(areaRiscoRepository.existsById(5)).thenReturn(true);
        when(ocorrenciaEventoRepository.buscarHistoricoDaArea(5)).thenReturn(List.of());
        when(alertaRepository.findByAreasRiscoIdOrderByDataEmissaoDesc(5)).thenReturn(List.of());

        assertThat(service.historico(5)).isEmpty();
    }

    // área inexistente lança recurso não encontrado e não consulta ocorrências nem alertas
    @Test
    void historico_areaInexistente_lancaNaoEncontrado(){
        when(areaRiscoRepository.existsById(99)).thenReturn(false);

        assertThatThrownBy(() -> service.historico(99))
            .isInstanceOf(RecursoNaoEncontradoException.class)
            .hasMessageContaining("99");
        verifyNoInteractions(ocorrenciaEventoRepository, alertaRepository);
    }

    // ===================== registrarOcorrencia =====================

    // dados válidos: salva a ocorrência com área, evento e data informados
    @Test
    void registrarOcorrencia_dadosValidos_salvaOcorrencia(){
        var req = new OcorrenciaRequest(2, BASE);
        when(areaRiscoRepository.findById(5)).thenReturn(Optional.of(area(5)));
        when(eventoClimaticoRepository.findById(2)).thenReturn(Optional.of(evento(2)));
        when(ocorrenciaEventoRepository.save(any())).thenAnswer(inv -> {
            OcorrenciaEvento o = inv.getArgument(0);
            o.setId(40);
            return o;
        });

        HistoricoItemResponse resp = service.registrarOcorrencia(5, req, 1);

        verify(usuarioService).exigirAgente(1);
        verify(ocorrenciaEventoRepository).save(captor.capture());
        OcorrenciaEvento salva = captor.getValue();
        assertThat(salva.getAreaRisco().getId()).isEqualTo(5);
        assertThat(salva.getEvento().getId()).isEqualTo(2);
        assertThat(salva.getDataOcorrencia()).isEqualTo(BASE);

        assertThat(resp.id()).isEqualTo(40);
        assertThat(resp.evento()).isEqualTo("Enchente");
    }

    // quem não é agente não registra e nada é consultado
    @Test
    void registrarOcorrencia_naoAgente_lancaAcessoNegado(){
        var req = new OcorrenciaRequest(2, BASE);
        when(usuarioService.exigirAgente(1)).thenThrow(new AcessoNegadoException("Apenas agentes"));

        assertThatThrownBy(() -> service.registrarOcorrencia(5, req, 1))
            .isInstanceOf(AcessoNegadoException.class);
        verifyNoInteractions(areaRiscoRepository, eventoClimaticoRepository, ocorrenciaEventoRepository);
    }

    // área inexistente lança recurso não encontrado e nada é salvo
    @Test
    void registrarOcorrencia_areaInexistente_lancaNaoEncontrado(){
        var req = new OcorrenciaRequest(2, BASE);
        when(areaRiscoRepository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.registrarOcorrencia(99, req, 1))
            .isInstanceOf(RecursoNaoEncontradoException.class)
            .hasMessageContaining("Área de risco 99");
        verifyNoInteractions(eventoClimaticoRepository, ocorrenciaEventoRepository);
    }

    // evento climático inexistente lança recurso não encontrado e nada é salvo
    @Test
    void registrarOcorrencia_eventoInexistente_lancaNaoEncontrado(){
        var req = new OcorrenciaRequest(99, BASE);
        when(areaRiscoRepository.findById(5)).thenReturn(Optional.of(area(5)));
        when(eventoClimaticoRepository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.registrarOcorrencia(5, req, 1))
            .isInstanceOf(RecursoNaoEncontradoException.class)
            .hasMessageContaining("Evento climático 99");
        verifyNoInteractions(ocorrenciaEventoRepository);
    }
}
