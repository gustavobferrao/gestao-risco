package br.com.gestaorisco.api.service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
import lombok.RequiredArgsConstructor;

/**
 * Endereço do usuário: cadastro, troca e remoção (com o consentimento da LGPD).
 * Regra central: o endereço precisa estar numa cidade atendida pelo SafeZone.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EnderecoUsuarioService {

    private final EnderecoUsuarioRepository enderecoRepository;
    private final ConsentimentoRepository consentimentoRepository;
    private final LocalidadeRepository localidadeRepository;
    private final UsuarioService usuarioService;
    private final ViaCepClient viaCep;

    // ---- CEP ----

    /** Endereço do CEP para preencher o formulário; 404 se o CEP não existe. */
    public CepResponse consultarCep(String cep) {
        EnderecoCep e = viaCep.buscar(cep)
            .orElseThrow(() -> new RecursoNaoEncontradoException("CEP " + cep + " não encontrado."));
        boolean atendida = localidadeRepository.findByCodigoIbge(e.codigoIbge())
            .map(Localidade::isAtendida)
            .orElse(false);
        return CepResponse.from(e, atendida);
    }

    // ---- endereço do usuário ----

    /** Endereço do usuário, se ele informou. */
    public Optional<EnderecoUsuarioResponse> buscar(Integer usuarioId) {
        usuarioService.buscar(usuarioId); // 404 se o usuário não existe
        return enderecoRepository.findByUsuarioId(usuarioId).map(EnderecoUsuarioResponse::from);
    }

    /** Cria ou troca o endereço do usuário. */
    @Transactional
    public EnderecoUsuarioResponse salvar(Integer usuarioId, EnderecoRequest req) {
        return salvar(usuarioService.buscar(usuarioId), req);
    }

    /** Usado também pelo cadastro, que já tem o usuário recém-criado em mãos. */
    @Transactional
    public EnderecoUsuarioResponse salvar(Usuario usuario, EnderecoRequest req) {
        if (!req.consentimento())
            throw new RegraNegocioException("Autorize o uso do endereço para salvar.");
        if ((req.latitude() == null) != (req.longitude() == null))
            throw new RegraNegocioException("Informe latitude e longitude juntas.");

        EnderecoUsuario endereco = enderecoRepository.findByUsuarioId(usuario.getId())
            .orElseGet(EnderecoUsuario::new);
        endereco.setUsuario(usuario);

        if (vazio(req.cep())) {
            preencherSoCidade(endereco, req);
        } else {
            preencherEnderecoCompleto(endereco, req);
        }

        if (req.latitude() != null) {
            endereco.setLatitude(req.latitude());
            endereco.setLongitude(req.longitude());
            endereco.setOrigemCoordenada(OrigemCoordenada.GPS);
        } else {
            // endereço mudou e não veio ponto novo: o ponto antigo não vale mais
            endereco.setLatitude(null);
            endereco.setLongitude(null);
            endereco.setOrigemCoordenada(null);
        }

        EnderecoUsuario salvo = enderecoRepository.save(endereco);
        registrarConsentimento(usuario);
        return EnderecoUsuarioResponse.from(salvo);
    }

    /** Apaga o endereço e revoga o consentimento (direito do titular, LGPD). */
    @Transactional
    public void remover(Integer usuarioId) {
        usuarioService.buscar(usuarioId);
        enderecoRepository.findByUsuarioId(usuarioId).ifPresent(enderecoRepository::delete);
        LocalDateTime agora = LocalDateTime.now();
        consentimentoRepository
            .findByUsuarioIdAndFinalidadeAndRevogadoEmIsNull(usuarioId, FinalidadeConsentimento.ENDERECO)
            .forEach(c -> c.setRevogadoEm(agora));
    }

    // ---- regras ----

    private void preencherSoCidade(EnderecoUsuario endereco, EnderecoRequest req) {
        if (vazio(req.codigoIbge()))
            throw new RegraNegocioException("Informe o CEP ou escolha a sua cidade.");

        endereco.setLocalidade(cidadeAtendida(req.codigoIbge(), null));
        endereco.setCep(null);
        endereco.setLogradouro(null);
        endereco.setNumero(null);
        endereco.setComplemento(null);
        endereco.setBairro(null);
    }

    private void preencherEnderecoCompleto(EnderecoUsuario endereco, EnderecoRequest req) {
        EnderecoCep doCep = consultarCepParaSalvar(req);

        // a cidade vem do CEP (ViaCEP); o código enviado pela tela só vale se o ViaCEP cair
        String codigoIbge = doCep != null ? doCep.codigoIbge() : req.codigoIbge();
        String nomeCidade = doCep != null ? doCep.cidade() : null;
        endereco.setLocalidade(cidadeAtendida(codigoIbge, nomeCidade));

        // o que o usuário digitou vale mais; o ViaCEP completa o que faltou
        String logradouro = primeiroPreenchido(req.logradouro(), doCep == null ? null : doCep.logradouro());
        if (logradouro == null)
            throw new RegraNegocioException("Informe a rua do endereço.");

        endereco.setCep(req.cep());
        endereco.setLogradouro(logradouro);
        endereco.setNumero(textoOuNulo(req.numero()));
        endereco.setComplemento(textoOuNulo(req.complemento()));
        endereco.setBairro(primeiroPreenchido(req.bairro(), doCep == null ? null : doCep.bairro()));
    }

    /** null = ViaCEP fora do ar e a tela mandou o código IBGE (consultado antes) para seguir. */
    private EnderecoCep consultarCepParaSalvar(EnderecoRequest req) {
        try {
            return viaCep.buscar(req.cep())
                .orElseThrow(() -> new RegraNegocioException("CEP " + req.cep() + " não encontrado."));
        } catch (ServicoExternoIndisponivelException e) {
            if (vazio(req.codigoIbge()))
                throw e;
            return null;
        }
    }

    private Localidade cidadeAtendida(String codigoIbge, String nomeCidade) {
        return localidadeRepository.findByCodigoIbge(codigoIbge)
            .filter(Localidade::isAtendida)
            .orElseThrow(() -> new RegraNegocioException(
                (nomeCidade == null ? "Esta cidade" : nomeCidade)
                    + " ainda não é atendida pelo SafeZone. Cidades atendidas: " + nomesAtendidas() + "."));
    }

    private String nomesAtendidas() {
        return localidadeRepository.findByAtendidaTrueOrderByNome().stream()
            .map(l -> l.getUf() == null ? l.getNome() : l.getNome() + " (" + l.getUf() + ")")
            .collect(Collectors.joining(", "));
    }

    // um consentimento vigente por finalidade: salvar de novo não duplica o registro
    private void registrarConsentimento(Usuario usuario) {
        boolean vigente = !consentimentoRepository
            .findByUsuarioIdAndFinalidadeAndRevogadoEmIsNull(usuario.getId(), FinalidadeConsentimento.ENDERECO)
            .isEmpty();
        if (vigente)
            return;

        Consentimento c = new Consentimento();
        c.setUsuario(usuario);
        c.setFinalidade(FinalidadeConsentimento.ENDERECO);
        c.setVersaoTermo(Consentimento.VERSAO_TERMO_ATUAL);
        c.setAceitoEm(LocalDateTime.now());
        consentimentoRepository.save(c);
    }

    private static boolean vazio(String s) {
        return s == null || s.isBlank();
    }

    private static String textoOuNulo(String s) {
        return vazio(s) ? null : s.trim();
    }

    private static String primeiroPreenchido(String a, String b) {
        String x = textoOuNulo(a);
        return x != null ? x : textoOuNulo(b);
    }
}
