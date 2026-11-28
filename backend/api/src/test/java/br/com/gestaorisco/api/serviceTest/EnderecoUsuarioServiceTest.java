package br.com.gestaorisco.api.serviceTest;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import br.com.gestaorisco.api.dto.request.EnderecoRequest;
import br.com.gestaorisco.api.dto.response.CepResponse;
import br.com.gestaorisco.api.dto.response.EnderecoUsuarioResponse;
import br.com.gestaorisco.api.exception.RecursoNaoEncontradoException;
import br.com.gestaorisco.api.exception.RegraNegocioException;
import br.com.gestaorisco.api.exception.ServicoExternoIndisponivelException;
import br.com.gestaorisco.api.integracao.EnderecoCep;
import br.com.gestaorisco.api.integracao.ViaCepClient;
import br.com.gestaorisco.api.model.Consentimento;
import br.com.gestaorisco.api.model.EnderecoUsuario;
import br.com.gestaorisco.api.model.Localidade;
import br.com.gestaorisco.api.model.Usuario;
import br.com.gestaorisco.api.model.enums.FinalidadeConsentimento;
import br.com.gestaorisco.api.model.enums.OrigemCoordenada;
import br.com.gestaorisco.api.repository.ConsentimentoRepository;
import br.com.gestaorisco.api.repository.EnderecoUsuarioRepository;
import br.com.gestaorisco.api.repository.LocalidadeRepository;
import br.com.gestaorisco.api.service.EnderecoUsuarioService;
import br.com.gestaorisco.api.service.UsuarioService;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class EnderecoUsuarioServiceTest {

    @Mock EnderecoUsuarioRepository enderecoRepository;
    @Mock ConsentimentoRepository consentimentoRepository;
    @Mock LocalidadeRepository localidadeRepository;
    @Mock UsuarioService usuarioService;
    @Mock ViaCepClient viaCep;

    @InjectMocks EnderecoUsuarioService service;

    @Captor ArgumentCaptor<EnderecoUsuario> enderecoCaptor;
    @Captor ArgumentCaptor<Consentimento> consentimentoCaptor;

    private static final String CEP_PETROPOLIS = "25620003";
    private static final String IBGE_PETROPOLIS = "3303906";
    private static final String IBGE_SANTOS = "3548500";

    private Usuario usuario;
    private Localidade petropolis;
    private Localidade santos;

    @BeforeEach
    void setUp() {
        usuario = new Usuario();
        usuario.setId(1);

        petropolis = localidade(8, "Petrópolis", "RJ", IBGE_PETROPOLIS, true);
        santos = localidade(2, "Santos", "SP", IBGE_SANTOS, false);

        when(usuarioService.buscar(1)).thenReturn(usuario);
        when(localidadeRepository.findByCodigoIbge(IBGE_PETROPOLIS)).thenReturn(Optional.of(petropolis));
        when(localidadeRepository.findByCodigoIbge(IBGE_SANTOS)).thenReturn(Optional.of(santos));
        when(localidadeRepository.findByAtendidaTrueOrderByNome()).thenReturn(List.of(petropolis));
        when(enderecoRepository.findByUsuarioId(1)).thenReturn(Optional.empty());
        when(enderecoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(consentimentoRepository.findByUsuarioIdAndFinalidadeAndRevogadoEmIsNull(1, FinalidadeConsentimento.ENDERECO))
            .thenReturn(List.of());
        when(viaCep.buscar(CEP_PETROPOLIS)).thenReturn(Optional.of(new EnderecoCep(
            CEP_PETROPOLIS, "Rua do Imperador", "Centro", "Petrópolis", "RJ", IBGE_PETROPOLIS)));
    }

    private static Localidade localidade(Integer id, String nome, String uf, String ibge, boolean atendida) {
        Localidade l = new Localidade();
        l.setId(id);
        l.setNome(nome);
        l.setUf(uf);
        l.setCodigoIbge(ibge);
        l.setAtendida(atendida);
        l.setLatitude(new BigDecimal("-22.507574"));
        l.setLongitude(new BigDecimal("-43.178536"));
        return l;
    }

    private static EnderecoRequest completo(String cep, String logradouro, String codigoIbge) {
        return new EnderecoRequest(cep, logradouro, "100", "apto 2", null, codigoIbge, null, null, true);
    }

    private static EnderecoRequest soCidade(String codigoIbge) {
        return new EnderecoRequest(null, null, null, null, null, codigoIbge, null, null, true);
    }

    // ===================== consultarCep =====================

    @Test
    void consultarCep_cidadeAtendida_marcaAtendida() {
        CepResponse r = service.consultarCep(CEP_PETROPOLIS);

        assertThat(r.cidade()).isEqualTo("Petrópolis");
        assertThat(r.codigoIbge()).isEqualTo(IBGE_PETROPOLIS);
        assertThat(r.atendida()).isTrue();
    }

    @Test
    void consultarCep_cidadeNaoAtendida_marcaNaoAtendida() {
        when(viaCep.buscar("11010000")).thenReturn(Optional.of(new EnderecoCep(
            "11010000", "Rua XV de Novembro", "Centro", "Santos", "SP", IBGE_SANTOS)));

        assertThat(service.consultarCep("11010000").atendida()).isFalse();
    }

    @Test
    void consultarCep_inexistente_lancaNaoEncontrado() {
        when(viaCep.buscar("99999999")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.consultarCep("99999999"))
            .isInstanceOf(RecursoNaoEncontradoException.class);
    }

    // ===================== salvar: endereço completo =====================

    // cidade vem do ViaCEP; o que o usuário digitou vale mais; bairro faltante vem do ViaCEP
    @Test
    void salvar_enderecoCompleto_usaCidadeDoCepEDadosDigitados() {
        EnderecoUsuarioResponse r = service.salvar(1, completo(CEP_PETROPOLIS, "Rua do Imperador, casa", null));

        verify(enderecoRepository).save(enderecoCaptor.capture());
        EnderecoUsuario salvo = enderecoCaptor.getValue();
        assertThat(salvo.getUsuario()).isSameAs(usuario);
        assertThat(salvo.getLocalidade()).isSameAs(petropolis);
        assertThat(salvo.getCep()).isEqualTo(CEP_PETROPOLIS);
        assertThat(salvo.getLogradouro()).isEqualTo("Rua do Imperador, casa");
        assertThat(salvo.getBairro()).isEqualTo("Centro");
        assertThat(salvo.getNumero()).isEqualTo("100");
        assertThat(salvo.getLatitude()).isNull();

        assertThat(r.cidade()).isEqualTo("Petrópolis");
        assertThat(r.codigoIbge()).isEqualTo(IBGE_PETROPOLIS);
        assertThat(r.cidadeLatitude()).isNotNull();
    }

    // a tela não manda a rua: o ViaCEP completa
    @Test
    void salvar_semRuaDigitada_usaRuaDoViaCep() {
        service.salvar(1, completo(CEP_PETROPOLIS, "  ", null));

        verify(enderecoRepository).save(enderecoCaptor.capture());
        assertThat(enderecoCaptor.getValue().getLogradouro()).isEqualTo("Rua do Imperador");
    }

    // CEP geral (sem rua no ViaCEP) e usuário não digitou a rua
    @Test
    void salvar_cepSemRuaEUsuarioSemRua_lancaRegraNegocio() {
        when(viaCep.buscar("25600000")).thenReturn(Optional.of(new EnderecoCep(
            "25600000", null, null, "Petrópolis", "RJ", IBGE_PETROPOLIS)));

        assertThatThrownBy(() -> service.salvar(1, completo("25600000", null, null)))
            .isInstanceOf(RegraNegocioException.class)
            .hasMessageContaining("rua");
        verify(enderecoRepository, never()).save(any());
    }

    // cidade fora das 6 atendidas: não salva e lista as atendidas na mensagem
    @Test
    void salvar_cidadeNaoAtendida_lancaRegraNegocioComCidadesAtendidas() {
        when(viaCep.buscar("11010000")).thenReturn(Optional.of(new EnderecoCep(
            "11010000", "Rua XV de Novembro", "Centro", "Santos", "SP", IBGE_SANTOS)));

        assertThatThrownBy(() -> service.salvar(1, completo("11010000", null, null)))
            .isInstanceOf(RegraNegocioException.class)
            .hasMessageContaining("Santos ainda não é atendida")
            .hasMessageContaining("Petrópolis (RJ)");
        verify(enderecoRepository, never()).save(any());
    }

    // código IBGE que nem existe na base também é "não atendida"
    @Test
    void salvar_codigoIbgeDesconhecido_lancaRegraNegocio() {
        when(localidadeRepository.findByCodigoIbge("5300108")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.salvar(1, soCidade("5300108")))
            .isInstanceOf(RegraNegocioException.class)
            .hasMessageContaining("ainda não é atendida");
    }

    @Test
    void salvar_cepInexistente_lancaRegraNegocio() {
        when(viaCep.buscar("99999999")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.salvar(1, completo("99999999", "Rua X", null)))
            .isInstanceOf(RegraNegocioException.class)
            .hasMessageContaining("não encontrado");
    }

    // ViaCEP fora do ar, mas a tela já tinha consultado o CEP e mandou o código IBGE
    @Test
    void salvar_viaCepForaComCodigoIbge_salvaComCodigoDaTela() {
        when(viaCep.buscar(CEP_PETROPOLIS)).thenThrow(new ServicoExternoIndisponivelException("fora", null));

        service.salvar(1, completo(CEP_PETROPOLIS, "Rua do Imperador", IBGE_PETROPOLIS));

        verify(enderecoRepository).save(enderecoCaptor.capture());
        assertThat(enderecoCaptor.getValue().getLocalidade()).isSameAs(petropolis);
    }

    // ViaCEP fora do ar e sem código IBGE: não há como saber a cidade, repassa o 503
    @Test
    void salvar_viaCepForaSemCodigoIbge_repassaIndisponivel() {
        when(viaCep.buscar(CEP_PETROPOLIS)).thenThrow(new ServicoExternoIndisponivelException("fora", null));

        assertThatThrownBy(() -> service.salvar(1, completo(CEP_PETROPOLIS, "Rua do Imperador", null)))
            .isInstanceOf(ServicoExternoIndisponivelException.class);
    }

    // ===================== salvar: só a cidade =====================

    @Test
    void salvar_soCidade_salvaSemCamposDeRua() {
        service.salvar(1, soCidade(IBGE_PETROPOLIS));

        verify(enderecoRepository).save(enderecoCaptor.capture());
        EnderecoUsuario salvo = enderecoCaptor.getValue();
        assertThat(salvo.getLocalidade()).isSameAs(petropolis);
        assertThat(salvo.getCep()).isNull();
        assertThat(salvo.getLogradouro()).isNull();
        assertThat(salvo.isSoCidade()).isTrue();
        verifyNoInteractions(viaCep);
    }

    @Test
    void salvar_semCepESemCidade_lancaRegraNegocio() {
        assertThatThrownBy(() -> service.salvar(1, soCidade(null)))
            .isInstanceOf(RegraNegocioException.class)
            .hasMessageContaining("CEP ou escolha");
    }

    // trocar de endereço completo para só a cidade limpa a rua antiga
    @Test
    void salvar_trocaParaSoCidade_limpaRuaAntiga() {
        EnderecoUsuario antigo = new EnderecoUsuario();
        antigo.setId(3);
        antigo.setCep(CEP_PETROPOLIS);
        antigo.setLogradouro("Rua do Imperador");
        antigo.setNumero("100");
        when(enderecoRepository.findByUsuarioId(1)).thenReturn(Optional.of(antigo));

        service.salvar(1, soCidade(IBGE_PETROPOLIS));

        verify(enderecoRepository).save(enderecoCaptor.capture());
        assertThat(enderecoCaptor.getValue()).isSameAs(antigo);
        assertThat(antigo.getCep()).isNull();
        assertThat(antigo.getLogradouro()).isNull();
        assertThat(antigo.getNumero()).isNull();
    }

    // ===================== coordenada =====================

    @Test
    void salvar_comGps_gravaPontoComOrigemGps() {
        EnderecoRequest req = new EnderecoRequest(CEP_PETROPOLIS, "Rua do Imperador", "100", null, null, null,
            new BigDecimal("-22.505"), new BigDecimal("-43.178"), true);

        service.salvar(1, req);

        verify(enderecoRepository).save(enderecoCaptor.capture());
        EnderecoUsuario salvo = enderecoCaptor.getValue();
        assertThat(salvo.getLatitude()).isEqualByComparingTo("-22.505");
        assertThat(salvo.getOrigemCoordenada()).isEqualTo(OrigemCoordenada.GPS);
    }

    // endereço novo sem ponto: o ponto do endereço antigo não pode ficar
    @Test
    void salvar_semGps_limpaPontoAntigo() {
        EnderecoUsuario antigo = new EnderecoUsuario();
        antigo.setLatitude(new BigDecimal("-23.5"));
        antigo.setLongitude(new BigDecimal("-46.6"));
        antigo.setOrigemCoordenada(OrigemCoordenada.GPS);
        when(enderecoRepository.findByUsuarioId(1)).thenReturn(Optional.of(antigo));

        service.salvar(1, completo(CEP_PETROPOLIS, "Rua do Imperador", null));

        assertThat(antigo.getLatitude()).isNull();
        assertThat(antigo.getOrigemCoordenada()).isNull();
    }

    @Test
    void salvar_soLatitude_lancaRegraNegocio() {
        EnderecoRequest req = new EnderecoRequest(null, null, null, null, null, IBGE_PETROPOLIS,
            new BigDecimal("-22.5"), null, true);

        assertThatThrownBy(() -> service.salvar(1, req))
            .isInstanceOf(RegraNegocioException.class)
            .hasMessageContaining("juntas");
    }

    // ===================== consentimento (LGPD) =====================

    @Test
    void salvar_semConsentimento_naoSalva() {
        EnderecoRequest req = new EnderecoRequest(null, null, null, null, null, IBGE_PETROPOLIS, null, null, false);

        assertThatThrownBy(() -> service.salvar(1, req))
            .isInstanceOf(RegraNegocioException.class)
            .hasMessageContaining("Autorize");
        verify(enderecoRepository, never()).save(any());
        verify(consentimentoRepository, never()).save(any());
    }

    @Test
    void salvar_primeiraVez_registraConsentimentoVigente() {
        service.salvar(1, soCidade(IBGE_PETROPOLIS));

        verify(consentimentoRepository).save(consentimentoCaptor.capture());
        Consentimento c = consentimentoCaptor.getValue();
        assertThat(c.getUsuario()).isSameAs(usuario);
        assertThat(c.getFinalidade()).isEqualTo(FinalidadeConsentimento.ENDERECO);
        assertThat(c.getVersaoTermo()).isEqualTo(Consentimento.VERSAO_TERMO_ATUAL);
        assertThat(c.getAceitoEm()).isNotNull();
        assertThat(c.getRevogadoEm()).isNull();
    }

    @Test
    void salvar_jaTemConsentimentoVigente_naoDuplica() {
        when(consentimentoRepository.findByUsuarioIdAndFinalidadeAndRevogadoEmIsNull(1, FinalidadeConsentimento.ENDERECO))
            .thenReturn(List.of(new Consentimento()));

        service.salvar(1, soCidade(IBGE_PETROPOLIS));

        verify(consentimentoRepository, never()).save(any());
    }

    // ===================== remover =====================

    @Test
    void remover_apagaEnderecoERevogaConsentimento() {
        EnderecoUsuario endereco = new EnderecoUsuario();
        Consentimento vigente = new Consentimento();
        when(enderecoRepository.findByUsuarioId(1)).thenReturn(Optional.of(endereco));
        when(consentimentoRepository.findByUsuarioIdAndFinalidadeAndRevogadoEmIsNull(1, FinalidadeConsentimento.ENDERECO))
            .thenReturn(List.of(vigente));

        service.remover(1);

        verify(enderecoRepository).delete(endereco);
        assertThat(vigente.getRevogadoEm()).isNotNull();
    }

    @Test
    void remover_semEndereco_naoFalha() {
        service.remover(1);

        verify(enderecoRepository, never()).delete(any());
    }

    @Test
    void buscar_usuarioInexistente_lancaNaoEncontrado() {
        when(usuarioService.buscar(99)).thenThrow(new RecursoNaoEncontradoException("Usuário 99 não encontrado."));

        assertThatThrownBy(() -> service.buscar(99)).isInstanceOf(RecursoNaoEncontradoException.class);
    }
}
