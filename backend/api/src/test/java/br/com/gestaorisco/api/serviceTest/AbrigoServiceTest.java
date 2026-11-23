package br.com.gestaorisco.api.serviceTest;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import br.com.gestaorisco.api.dto.response.AbrigoProximoResponse;
import br.com.gestaorisco.api.repository.AbrigoRepository;
import br.com.gestaorisco.api.service.AbrigoService;
import br.com.gestaorisco.api.view.AbrigoProximoView;

@ExtendWith(MockitoExtension.class)
class AbrigoServiceTest {

    @Mock AbrigoRepository abrigoRepository;

    @InjectMocks AbrigoService service;

    private AbrigoProximoView view(Integer id, double distanciaKm){
        return new AbrigoProximoView() {
            public Integer getId() { return id; }
            public String getNome() { return "Abrigo " + id; }
            public Integer getVagasDisponiveis() { return 40; }
            public String getTelefone() { return "1133334444"; }
            public BigDecimal getLatitude() { return new BigDecimal("-23.55"); }
            public BigDecimal getLongitude() { return new BigDecimal("-46.63"); }
            public Double getDistanciaKm() { return distanciaKm; }
            public String getLogradouro() { return "Rua A"; }
            public String getBairro() { return "Centro"; }
            public String getCep() { return "01000000"; }
            public Integer getCapacidadeTotal() { return 100; }
        };
    }

    // ===================== proximos =====================

    // limite nulo usa o padrão de 5 abrigos
    @Test
    void proximos_limiteNulo_usaPadrao5(){
        when(abrigoRepository.proximos(-23.5, -46.6, 5)).thenReturn(List.of());

        service.proximos(-23.5, -46.6, null);

        verify(abrigoRepository).proximos(-23.5, -46.6, 5);
    }

    // limite é ajustado para ficar entre 1 e 20 antes de ir ao repository
    @ParameterizedTest(name = "limite {0} -> {1}")
    @CsvSource({
        "-5,  1",
        "0,   1",
        "1,   1",
        "10,  10",
        "20,  20",
        "21,  20",
        "100, 20"
    })
    void proximos_limiteAjustadoEntre1e20(int informado, int esperado){
        when(abrigoRepository.proximos(anyDouble(), anyDouble(), anyInt())).thenReturn(List.of());

        service.proximos(-23.5, -46.6, informado);

        verify(abrigoRepository).proximos(-23.5, -46.6, esperado);
    }

    // coordenadas são repassadas ao repository sem alteração
    @Test
    void proximos_repassaCoordenadas(){
        when(abrigoRepository.proximos(anyDouble(), anyDouble(), anyInt())).thenReturn(List.of());

        service.proximos(-22.9068, -43.1729, 3);

        verify(abrigoRepository).proximos(-22.9068, -43.1729, 3);
    }

    // converte cada resultado para response mantendo a ordem do repository (mais próximo primeiro)
    @Test
    void proximos_converteMantendoOrdem(){
        when(abrigoRepository.proximos(-23.5, -46.6, 5))
            .thenReturn(List.of(view(1, 0.8), view(2, 2.5), view(3, 4.1)));

        List<AbrigoProximoResponse> resp = service.proximos(-23.5, -46.6, null);

        assertThat(resp).extracting(AbrigoProximoResponse::id, AbrigoProximoResponse::distanciaKm)
            .containsExactly(tuple(1, 0.8), tuple(2, 2.5), tuple(3, 4.1));
    }

    // todos os campos da view são copiados para o response
    @Test
    void proximos_copiaTodosOsCampos(){
        when(abrigoRepository.proximos(-23.5, -46.6, 5)).thenReturn(List.of(view(7, 1.2)));

        AbrigoProximoResponse r = service.proximos(-23.5, -46.6, null).get(0);

        assertThat(r.id()).isEqualTo(7);
        assertThat(r.nome()).isEqualTo("Abrigo 7");
        assertThat(r.telefone()).isEqualTo("1133334444");
        assertThat(r.logradouro()).isEqualTo("Rua A");
        assertThat(r.bairro()).isEqualTo("Centro");
        assertThat(r.cep()).isEqualTo("01000000");
        assertThat(r.capacidadeTotal()).isEqualTo(100);
        assertThat(r.vagasDisponiveis()).isEqualTo(40);
        assertThat(r.latitude()).isEqualByComparingTo("-23.55");
        assertThat(r.longitude()).isEqualByComparingTo("-46.63");
        assertThat(r.distanciaKm()).isEqualTo(1.2);
    }

    // nenhum abrigo encontrado retorna lista vazia
    @Test
    void proximos_semAbrigos_retornaVazio(){
        when(abrigoRepository.proximos(anyDouble(), anyDouble(), anyInt())).thenReturn(List.of());

        assertThat(service.proximos(-23.5, -46.6, 5)).isEmpty();
    }
}
