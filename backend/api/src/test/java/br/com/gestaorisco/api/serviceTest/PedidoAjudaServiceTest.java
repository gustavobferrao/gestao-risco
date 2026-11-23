package br.com.gestaorisco.api.serviceTest;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import br.com.gestaorisco.api.dto.request.PedidoAjudaRequest;
import br.com.gestaorisco.api.dto.response.PedidoAjudaResponse;
import br.com.gestaorisco.api.exception.AcessoNegadoException;
import br.com.gestaorisco.api.exception.RecursoNaoEncontradoException;
import br.com.gestaorisco.api.exception.RegraNegocioException;
import br.com.gestaorisco.api.model.AreaRisco;
import br.com.gestaorisco.api.model.PedidoAjuda;
import br.com.gestaorisco.api.model.Usuario;
import br.com.gestaorisco.api.model.enums.StatusPedido;
import br.com.gestaorisco.api.repository.AreaRiscoRepository;
import br.com.gestaorisco.api.repository.PedidoAjudaRepository;
import br.com.gestaorisco.api.service.PedidoAjudaService;
import br.com.gestaorisco.api.service.UsuarioService;

@ExtendWith(MockitoExtension.class)
class PedidoAjudaServiceTest {

    @Mock PedidoAjudaRepository pedidoAjudaRepository;
    @Mock AreaRiscoRepository areaRiscoRepository;
    @Mock UsuarioService usuarioService;

    @InjectMocks PedidoAjudaService service;

    @Captor ArgumentCaptor<PedidoAjuda> captor;

    private Usuario usuario(){
        Usuario u = new Usuario();
        u.setId(1);
        u.setNome("Maria");
        return u;
    }

    private PedidoAjuda pedido(StatusPedido status){
        PedidoAjuda p = new PedidoAjuda();
        p.setId(10);
        p.setUsuario(usuario());
        p.setStatus(status);
        return p;
    }

    private AreaRisco area(Integer id){
        AreaRisco a = new AreaRisco();
        a.setId(id);
        a.setNome("Área " + id);
        return a;
    }

    // Faz o save devolver o próprio objeto recebido, como se o banco tivesse salvo
    private void saveDevolveArgumento(){
        when(pedidoAjudaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
    }

    // ===================== alterarStatus =====================

    @ParameterizedTest(name = "{0} -> {1} deve ser válido? {2}")
    @CsvSource({
        "ABERTO,         EM_ATENDIMENTO, true",
        "ABERTO,         CANCELADO,      true",
        "ABERTO,         CONCLUIDO,      false",
        "EM_ATENDIMENTO, CONCLUIDO,      true",
        "EM_ATENDIMENTO, CANCELADO,      true",
        "EM_ATENDIMENTO, ABERTO,         false",
        "CONCLUIDO,      ABERTO,         false",
        "CONCLUIDO,      CANCELADO,      false",
        "CANCELADO,      ABERTO,         false",
        "CANCELADO,      EM_ATENDIMENTO, false"
    })
    void alterarStatus_respeitaTransicoes(StatusPedido atual, StatusPedido novo, boolean valido){
        PedidoAjuda p = pedido(atual);
        when(pedidoAjudaRepository.findById(10)).thenReturn(Optional.of(p));

        if (valido){
            assertThat(service.alterarStatus(10, novo, 1).status()).isEqualTo(novo);
        } else{
            assertThatThrownBy(() -> service.alterarStatus(10, novo, 1))
                .isInstanceOf(RegraNegocioException.class);
            assertThat(p.getStatus()).isEqualTo(atual);
        }
    }

    // pedido inexistente lança recurso não encontrado
    @Test
    void alterarStatus_pedidoInexistente_lancaNaoEncontrado(){
        when(pedidoAjudaRepository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.alterarStatus(99, StatusPedido.CANCELADO, 1))
            .isInstanceOf(RecursoNaoEncontradoException.class);
    }

    // quem não é agente não consegue alterar e o pedido nem é buscado
    @Test
    void alterarStatus_naoAgente_lancaAcessoNegado(){
        when(usuarioService.exigirAgente(1)).thenThrow(new AcessoNegadoException("Apenas agentes"));

        assertThatThrownBy(() -> service.alterarStatus(10, StatusPedido.CANCELADO, 1))
            .isInstanceOf(AcessoNegadoException.class);
        verifyNoInteractions(pedidoAjudaRepository);
    }

    // ===================== abrir =====================

    // com areaRiscoId informado usa essa área e não busca a mais próxima
    @Test
    void abrir_comAreaId_usaAreaInformada(){
        var req = new PedidoAjudaRequest("Alagamento", 5, null, null);
        when(usuarioService.buscar(1)).thenReturn(usuario());
        when(areaRiscoRepository.findById(5)).thenReturn(Optional.of(area(5)));
        saveDevolveArgumento();

        PedidoAjudaResponse resp = service.abrir(req, 1);

        verify(pedidoAjudaRepository).save(captor.capture());
        PedidoAjuda salvo = captor.getValue();
        assertThat(salvo.getStatus()).isEqualTo(StatusPedido.ABERTO);
        assertThat(salvo.getDataHoraSolicitacao()).isNotNull();
        assertThat(salvo.getDescricao()).isEqualTo("Alagamento");
        assertThat(salvo.getUsuario().getId()).isEqualTo(1);
        assertThat(resp.areaRiscoId()).isEqualTo(5);
        verify(areaRiscoRepository, never()).maisProxima(anyDouble(), anyDouble(), anyDouble());
    }

    // areaRiscoId que não existe lança recurso não encontrado e nada é salvo
    @Test
    void abrir_areaIdInexistente_lancaNaoEncontrado(){
        var req = new PedidoAjudaRequest("Alagamento", 99, null, null);
        when(usuarioService.buscar(1)).thenReturn(usuario());
        when(areaRiscoRepository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.abrir(req, 1))
            .isInstanceOf(RecursoNaoEncontradoException.class);
        verify(pedidoAjudaRepository, never()).save(any());
    }

    // só coordenadas: busca a área mais próxima num raio de 5 km
    @Test
    void abrir_soCoordenadas_usaAreaMaisProxima(){
        var req = new PedidoAjudaRequest("Deslizamento", null,
            new BigDecimal("-23.5"), new BigDecimal("-46.6"));
        when(usuarioService.buscar(1)).thenReturn(usuario());
        when(areaRiscoRepository.maisProxima(-23.5, -46.6, 5.0)).thenReturn(Optional.of(7));
        when(areaRiscoRepository.findById(7)).thenReturn(Optional.of(area(7)));
        saveDevolveArgumento();

        PedidoAjudaResponse resp = service.abrir(req, 1);

        assertThat(resp.areaRiscoId()).isEqualTo(7);
        assertThat(resp.latitude()).isEqualByComparingTo("-23.5");
        assertThat(resp.longitude()).isEqualByComparingTo("-46.6");
        verify(areaRiscoRepository).maisProxima(-23.5, -46.6, 5.0);
    }

    // só coordenadas e nenhuma área no raio: pedido é salvo sem área
    @Test
    void abrir_soCoordenadas_semAreaNoRaio_salvaSemArea(){
        var req = new PedidoAjudaRequest("Deslizamento", null,
            new BigDecimal("-23.5"), new BigDecimal("-46.6"));
        when(usuarioService.buscar(1)).thenReturn(usuario());
        when(areaRiscoRepository.maisProxima(-23.5, -46.6, 5.0)).thenReturn(Optional.empty());
        saveDevolveArgumento();

        PedidoAjudaResponse resp = service.abrir(req, 1);

        assertThat(resp.areaRiscoId()).isNull();
        assertThat(resp.areaRiscoNome()).isNull();
        verify(pedidoAjudaRepository).save(any());
        verify(areaRiscoRepository, never()).findById(any());
    }

    // sem área e sem coordenadas: não consulta áreas e salva sem área
    @Test
    void abrir_semAreaESemCoordenadas_salvaSemArea(){
        var req = new PedidoAjudaRequest("Preciso de ajuda", null, null, null);
        when(usuarioService.buscar(1)).thenReturn(usuario());
        saveDevolveArgumento();

        PedidoAjudaResponse resp = service.abrir(req, 1);

        assertThat(resp.areaRiscoId()).isNull();
        verifyNoInteractions(areaRiscoRepository);
    }

    // usuário inexistente lança recurso não encontrado e nada é salvo
    @Test
    void abrir_usuarioInexistente_lancaNaoEncontrado(){
        var req = new PedidoAjudaRequest("Alagamento", null, null, null);
        when(usuarioService.buscar(99)).thenThrow(new RecursoNaoEncontradoException("Usuário 99 não encontrado."));

        assertThatThrownBy(() -> service.abrir(req, 99))
            .isInstanceOf(RecursoNaoEncontradoException.class);
        verifyNoInteractions(pedidoAjudaRepository);
    }

    // ===================== fila =====================

    // status nulo usa ABERTO como padrão
    @Test
    void fila_statusNulo_usaAberto(){
        when(pedidoAjudaRepository.findByStatusOrderByDataHoraSolicitacaoAsc(StatusPedido.ABERTO))
            .thenReturn(List.of(pedido(StatusPedido.ABERTO)));

        List<PedidoAjudaResponse> resp = service.fila(null, 1);

        assertThat(resp).hasSize(1);
        verify(pedidoAjudaRepository).findByStatusOrderByDataHoraSolicitacaoAsc(StatusPedido.ABERTO);
    }

    // status informado é repassado ao repository
    @Test
    void fila_statusInformado_repassaFiltro(){
        when(pedidoAjudaRepository.findByStatusOrderByDataHoraSolicitacaoAsc(StatusPedido.EM_ATENDIMENTO))
            .thenReturn(List.of(pedido(StatusPedido.EM_ATENDIMENTO), pedido(StatusPedido.EM_ATENDIMENTO)));

        List<PedidoAjudaResponse> resp = service.fila(StatusPedido.EM_ATENDIMENTO, 1);

        assertThat(resp).hasSize(2)
            .allMatch(p -> p.status() == StatusPedido.EM_ATENDIMENTO);
    }

    // quem não é agente não vê a fila
    @Test
    void fila_naoAgente_lancaAcessoNegado(){
        when(usuarioService.exigirAgente(1)).thenThrow(new AcessoNegadoException("Apenas agentes"));

        assertThatThrownBy(() -> service.fila(null, 1))
            .isInstanceOf(AcessoNegadoException.class);
        verifyNoInteractions(pedidoAjudaRepository);
    }

    // ===================== meus =====================

    // retorna os pedidos do usuário convertidos para response
    @Test
    void meus_retornaPedidosDoUsuario(){
        when(pedidoAjudaRepository.findByUsuarioIdOrderByDataHoraSolicitacaoDesc(1))
            .thenReturn(List.of(pedido(StatusPedido.ABERTO), pedido(StatusPedido.CONCLUIDO)));

        List<PedidoAjudaResponse> resp = service.meus(1);

        assertThat(resp).extracting(PedidoAjudaResponse::status)
            .containsExactly(StatusPedido.ABERTO, StatusPedido.CONCLUIDO);
        assertThat(resp).allMatch(p -> p.usuarioId().equals(1));
    }

    // usuário sem pedidos recebe lista vazia
    @Test
    void meus_semPedidos_retornaListaVazia(){
        when(pedidoAjudaRepository.findByUsuarioIdOrderByDataHoraSolicitacaoDesc(1)).thenReturn(List.of());

        assertThat(service.meus(1)).isEmpty();
    }
}
