package br.com.gestaorisco.api.serviceTest;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import br.com.gestaorisco.api.dto.request.AlertaRequest;
import br.com.gestaorisco.api.dto.response.AlertaResponse;
import br.com.gestaorisco.api.exception.AcessoNegadoException;
import br.com.gestaorisco.api.exception.RecursoNaoEncontradoException;
import br.com.gestaorisco.api.exception.RegraNegocioException;
import br.com.gestaorisco.api.model.Alerta;
import br.com.gestaorisco.api.model.AreaRisco;
import br.com.gestaorisco.api.model.OrgaoResponsavel;
import br.com.gestaorisco.api.model.Usuario;
import br.com.gestaorisco.api.model.enums.Perfil;
import br.com.gestaorisco.api.model.enums.Severidade;
import br.com.gestaorisco.api.model.enums.StatusAlerta;
import br.com.gestaorisco.api.repository.AlertaRepository;
import br.com.gestaorisco.api.repository.AreaRiscoRepository;
import br.com.gestaorisco.api.service.AlertaService;
import br.com.gestaorisco.api.service.UsuarioService;

@ExtendWith(MockitoExtension.class)
class AlertaServiceTest {

    @Mock AlertaRepository alertaRepository;
    @Mock AreaRiscoRepository areaRiscoRepository;
    @Mock UsuarioService usuarioService;

    @InjectMocks AlertaService service;

    @Captor ArgumentCaptor<Alerta> captor;

    private OrgaoResponsavel orgao(Integer id){
        OrgaoResponsavel o = new OrgaoResponsavel();
        o.setId(id);
        o.setNome("Órgão " + id);
        return o;
    }

    private Usuario agente(OrgaoResponsavel orgao){
        Usuario u = new Usuario();
        u.setId(1);
        u.setPerfil(Perfil.AGENTE);
        u.setOrgao(orgao);
        return u;
    }

    private AreaRisco area(Integer id, String nome){
        AreaRisco a = new AreaRisco();
        a.setId(id);
        a.setNome(nome);
        return a;
    }

    private Alerta alerta(StatusAlerta status, OrgaoResponsavel orgao){
        Alerta a = new Alerta();
        a.setId(10);
        a.setTipo("Chuva forte");
        a.setNivelSeveridade(Severidade.ALTO);
        a.setStatus(status);
        a.setDataEmissao(LocalDateTime.now());
        a.setOrgao(orgao);
        a.setAreasRisco(new HashSet<>(Set.of(area(5, "Morro A"))));
        return a;
    }

    // Faz o save devolver o próprio objeto recebido, como se o banco tivesse salvo
    private void saveDevolveArgumento(){
        when(alertaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
    }

    // ===================== listar =====================

    // repassa os filtros ao repository e converte os alertas para response
    @Test
    void listar_repassaFiltrosEConverte(){
        when(alertaRepository.filtrar(StatusAlerta.ATIVO, 5))
            .thenReturn(List.of(alerta(StatusAlerta.ATIVO, orgao(1))));

        List<AlertaResponse> resp = service.listar(StatusAlerta.ATIVO, 5);

        assertThat(resp).hasSize(1);
        assertThat(resp.get(0).status()).isEqualTo(StatusAlerta.ATIVO);
        assertThat(resp.get(0).orgaoId()).isEqualTo(1);
        verify(alertaRepository).filtrar(StatusAlerta.ATIVO, 5);
    }

    // filtros nulos são repassados como nulos (sem filtro) ao repository
    @Test
    void listar_semFiltros_repassaNulos(){
        when(alertaRepository.filtrar(null, null)).thenReturn(List.of());

        assertThat(service.listar(null, null)).isEmpty();
        verify(alertaRepository).filtrar(null, null);
    }

    // listar é público: não exige agente
    @Test
    void listar_naoConsultaUsuario(){
        when(alertaRepository.filtrar(any(), any())).thenReturn(List.of());

        service.listar(StatusAlerta.ENCERRADO, null);

        verifyNoInteractions(usuarioService);
    }

    // ===================== emitir =====================

    // emite alerta ATIVO com órgão do agente, data de emissão e as áreas informadas
    @Test
    void emitir_dadosValidos_salvaAlertaAtivo(){
        OrgaoResponsavel orgao = orgao(3);
        Set<Integer> ids = Set.of(5, 7);
        var req = new AlertaRequest("Chuva forte", Severidade.CRITICO, ids);
        when(usuarioService.exigirAgente(1)).thenReturn(agente(orgao));
        when(areaRiscoRepository.findAllById(ids))
            .thenReturn(List.of(area(7, "Vila B"), area(5, "Morro A")));
        saveDevolveArgumento();

        AlertaResponse resp = service.emitir(req, 1);

        verify(alertaRepository).save(captor.capture());
        Alerta salvo = captor.getValue();
        assertThat(salvo.getStatus()).isEqualTo(StatusAlerta.ATIVO);
        assertThat(salvo.getTipo()).isEqualTo("Chuva forte");
        assertThat(salvo.getNivelSeveridade()).isEqualTo(Severidade.CRITICO);
        assertThat(salvo.getDataEmissao()).isNotNull();
        assertThat(salvo.getOrgao()).isSameAs(orgao);
        assertThat(salvo.getAreasRisco()).extracting(AreaRisco::getId).containsExactlyInAnyOrder(5, 7);

        assertThat(resp.orgaoId()).isEqualTo(3);
        assertThat(resp.orgaoNome()).isEqualTo("Órgão 3");
    }

    // response devolve as áreas afetadas ordenadas por nome
    @Test
    void emitir_responseOrdenaAreasPorNome(){
        Set<Integer> ids = Set.of(1, 2, 3);
        var req = new AlertaRequest("Deslizamento", Severidade.ALTO, ids);
        when(usuarioService.exigirAgente(1)).thenReturn(agente(orgao(3)));
        when(areaRiscoRepository.findAllById(ids))
            .thenReturn(List.of(area(1, "Vila C"), area(2, "Alto A"), area(3, "Morro B")));
        saveDevolveArgumento();

        AlertaResponse resp = service.emitir(req, 1);

        assertThat(resp.areas()).extracting(AlertaResponse.AreaAfetada::nome)
            .containsExactly("Alto A", "Morro B", "Vila C");
    }

    // áreas inexistentes lançam regra de negócio listando os ids faltantes em ordem e nada é salvo
    @Test
    void emitir_areasInexistentes_lancaRegraNegocioComIdsFaltantes(){
        Set<Integer> ids = new LinkedHashSet<>(List.of(9, 5, 3));
        var req = new AlertaRequest("Chuva forte", Severidade.MEDIO, ids);
        when(usuarioService.exigirAgente(1)).thenReturn(agente(orgao(3)));
        when(areaRiscoRepository.findAllById(ids)).thenReturn(List.of(area(5, "Morro A")));

        assertThatThrownBy(() -> service.emitir(req, 1))
            .isInstanceOf(RegraNegocioException.class)
            .hasMessageContaining("[3, 9]");
        verify(alertaRepository, never()).save(any());
    }

    // quem não é agente não emite alerta e nenhuma área é consultada
    @Test
    void emitir_naoAgente_lancaAcessoNegado(){
        var req = new AlertaRequest("Chuva forte", Severidade.BAIXO, Set.of(5));
        when(usuarioService.exigirAgente(1)).thenThrow(new AcessoNegadoException("Apenas agentes"));

        assertThatThrownBy(() -> service.emitir(req, 1))
            .isInstanceOf(AcessoNegadoException.class);
        verifyNoInteractions(areaRiscoRepository, alertaRepository);
    }

    // ===================== alterarStatus =====================

    // alerta ATIVO do mesmo órgão pode ir para ENCERRADO ou CANCELADO
    @ParameterizedTest(name = "ATIVO -> {0}")
    @EnumSource(value = StatusAlerta.class, names = {"ENCERRADO", "CANCELADO"})
    void alterarStatus_ativoParaFinal_altera(StatusAlerta novo){
        OrgaoResponsavel orgao = orgao(3);
        Alerta a = alerta(StatusAlerta.ATIVO, orgao);
        when(usuarioService.exigirAgente(1)).thenReturn(agente(orgao));
        when(alertaRepository.findByIdParaAtualizar(10)).thenReturn(Optional.of(a));

        AlertaResponse resp = service.alterarStatus(10, novo, 1);

        assertThat(resp.status()).isEqualTo(novo);
        assertThat(a.getStatus()).isEqualTo(novo);
    }

    // alteração usa a busca com lock e confia no dirty check (sem save explícito)
    @Test
    void alterarStatus_usaBuscaComLockESemSave(){
        OrgaoResponsavel orgao = orgao(3);
        when(usuarioService.exigirAgente(1)).thenReturn(agente(orgao));
        when(alertaRepository.findByIdParaAtualizar(10))
            .thenReturn(Optional.of(alerta(StatusAlerta.ATIVO, orgao)));

        service.alterarStatus(10, StatusAlerta.ENCERRADO, 1);

        verify(alertaRepository).findByIdParaAtualizar(10);
        verify(alertaRepository, never()).findById(any());
        verify(alertaRepository, never()).save(any());
    }

    // alerta que já não está ATIVO não pode ser alterado e mantém o status
    @ParameterizedTest(name = "{0} não pode ser alterado")
    @EnumSource(value = StatusAlerta.class, names = {"ENCERRADO", "CANCELADO"})
    void alterarStatus_alertaNaoAtivo_lancaRegraNegocio(StatusAlerta atual){
        OrgaoResponsavel orgao = orgao(3);
        Alerta a = alerta(atual, orgao);
        when(usuarioService.exigirAgente(1)).thenReturn(agente(orgao));
        when(alertaRepository.findByIdParaAtualizar(10)).thenReturn(Optional.of(a));

        assertThatThrownBy(() -> service.alterarStatus(10, StatusAlerta.CANCELADO, 1))
            .isInstanceOf(RegraNegocioException.class)
            .hasMessageContaining("ATIVOS");
        assertThat(a.getStatus()).isEqualTo(atual);
    }

    // novo status ATIVO é inválido e o alerta permanece ATIVO
    @Test
    void alterarStatus_novoStatusAtivo_lancaRegraNegocio(){
        OrgaoResponsavel orgao = orgao(3);
        Alerta a = alerta(StatusAlerta.ATIVO, orgao);
        when(usuarioService.exigirAgente(1)).thenReturn(agente(orgao));
        when(alertaRepository.findByIdParaAtualizar(10)).thenReturn(Optional.of(a));

        assertThatThrownBy(() -> service.alterarStatus(10, StatusAlerta.ATIVO, 1))
            .isInstanceOf(RegraNegocioException.class)
            .hasMessageContaining("ENCERRADO ou CANCELADO");
        assertThat(a.getStatus()).isEqualTo(StatusAlerta.ATIVO);
    }

    // agente de outro órgão não altera o alerta e o status é mantido
    @Test
    void alterarStatus_outroOrgao_lancaAcessoNegado(){
        Alerta a = alerta(StatusAlerta.ATIVO, orgao(3));
        when(usuarioService.exigirAgente(1)).thenReturn(agente(orgao(4)));
        when(alertaRepository.findByIdParaAtualizar(10)).thenReturn(Optional.of(a));

        assertThatThrownBy(() -> service.alterarStatus(10, StatusAlerta.ENCERRADO, 1))
            .isInstanceOf(AcessoNegadoException.class);
        assertThat(a.getStatus()).isEqualTo(StatusAlerta.ATIVO);
    }

    // órgãos comparados por id, não por referência: instâncias diferentes com mesmo id passam
    @Test
    void alterarStatus_mesmoOrgaoInstanciaDiferente_altera(){
        Alerta a = alerta(StatusAlerta.ATIVO, orgao(3));
        when(usuarioService.exigirAgente(1)).thenReturn(agente(orgao(3)));
        when(alertaRepository.findByIdParaAtualizar(10)).thenReturn(Optional.of(a));

        assertThat(service.alterarStatus(10, StatusAlerta.CANCELADO, 1).status())
            .isEqualTo(StatusAlerta.CANCELADO);
    }

    // alerta inexistente lança recurso não encontrado
    @Test
    void alterarStatus_alertaInexistente_lancaNaoEncontrado(){
        when(usuarioService.exigirAgente(1)).thenReturn(agente(orgao(3)));
        when(alertaRepository.findByIdParaAtualizar(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.alterarStatus(99, StatusAlerta.ENCERRADO, 1))
            .isInstanceOf(RecursoNaoEncontradoException.class)
            .hasMessageContaining("99");
    }

    // quem não é agente não altera e o alerta nem é buscado
    @Test
    void alterarStatus_naoAgente_lancaAcessoNegado(){
        when(usuarioService.exigirAgente(1)).thenThrow(new AcessoNegadoException("Apenas agentes"));

        assertThatThrownBy(() -> service.alterarStatus(10, StatusAlerta.ENCERRADO, 1))
            .isInstanceOf(AcessoNegadoException.class);
        verifyNoInteractions(alertaRepository);
    }
}
