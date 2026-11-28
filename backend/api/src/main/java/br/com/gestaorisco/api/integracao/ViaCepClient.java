package br.com.gestaorisco.api.integracao;

import java.net.ProxySelector;
import java.net.http.HttpClient;
import java.time.Duration;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import br.com.gestaorisco.api.exception.ServicoExternoIndisponivelException;

/**
 * Consulta de CEP no ViaCEP (gratuito, sem chave). O que importa aqui é o código IBGE
 * do município: é ele que liga o usuário à cidade, à previsão do INMET e ao Cemaden.
 */
@Component
public class ViaCepClient {

    private static final Duration TIMEOUT = Duration.ofSeconds(4);

    private final RestClient http;

    public ViaCepClient(@Value("${app.viacep.url:https://viacep.com.br/ws}") String baseUrl) {
        HttpClient cliente = HttpClient.newBuilder()
            .connectTimeout(TIMEOUT)
            .proxy(ProxySelector.getDefault())
            .build();
        JdkClientHttpRequestFactory fabrica = new JdkClientHttpRequestFactory(cliente);
        fabrica.setReadTimeout(TIMEOUT);
        this.http = RestClient.builder().baseUrl(baseUrl).requestFactory(fabrica).build();
    }

    /**
     * @param cep somente os 8 dígitos
     * @return vazio quando o CEP não existe
     * @throws ServicoExternoIndisponivelException quando o ViaCEP não responde
     */
    public Optional<EnderecoCep> buscar(String cep) {
        Resposta r;
        try {
            r = http.get().uri("/{cep}/json/", cep).retrieve().body(Resposta.class);
        } catch (RestClientException e) {
            throw new ServicoExternoIndisponivelException(
                "Não foi possível consultar o CEP agora. Tente novamente em instantes.", e);
        }
        // CEP inexistente: o ViaCEP responde 200 com {"erro": true} (ou "true", nas versões novas)
        if (r == null || "true".equalsIgnoreCase(r.erro()) || vazio(r.ibge()))
            return Optional.empty();

        return Optional.of(new EnderecoCep(
            r.cep() == null ? cep : r.cep().replaceAll("\\D", ""),
            textoOuNulo(r.logradouro()),
            textoOuNulo(r.bairro()),
            r.localidade(),
            r.uf(),
            r.ibge()));
    }

    private static boolean vazio(String s) {
        return s == null || s.isBlank();
    }

    // CEP geral de cidade pequena vem sem rua e bairro (strings vazias)
    private static String textoOuNulo(String s) {
        return vazio(s) ? null : s.trim();
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Resposta(String cep, String logradouro, String bairro, String localidade,
                    String uf, String ibge, String erro) {
    }
}
