package br.com.gestaorisco.api.serviceTest;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;

import br.com.gestaorisco.api.dto.response.LocalidadeResponse;
import br.com.gestaorisco.api.model.Localidade;
import br.com.gestaorisco.api.repository.LocalidadeRepository;
import br.com.gestaorisco.api.service.LocalidadeService;

@ExtendWith(MockitoExtension.class)
class LocalidadeServiceTest {

    @Mock LocalidadeRepository repository;

    @InjectMocks LocalidadeService service;

    @Captor ArgumentCaptor<Sort> sortCaptor;

    private Localidade localidade(Integer id, String nome){
        Localidade l = new Localidade();
        l.setId(id);
        l.setNome(nome);
        l.setPopulacao(12000);
        l.setArea(new BigDecimal("35.70"));
        return l;
    }

    // ===================== listar =====================

    // busca as localidades ordenadas por nome em ordem crescente
    @Test
    void listar_ordenaPorNomeAsc(){
        when(repository.findAll(any(Sort.class))).thenReturn(List.of());

        service.listar();

        verify(repository).findAll(sortCaptor.capture());
        Sort.Order ordem = sortCaptor.getValue().getOrderFor("nome");
        assertThat(ordem).isNotNull();
        assertThat(ordem.isAscending()).isTrue();
    }

    // converte cada localidade para response mantendo a ordem do repository
    @Test
    void listar_converteMantendoOrdem(){
        when(repository.findAll(Sort.by("nome")))
            .thenReturn(List.of(localidade(2, "Centro"), localidade(1, "Vila Nova")));

        List<LocalidadeResponse> resp = service.listar();

        assertThat(resp).extracting(LocalidadeResponse::nome).containsExactly("Centro", "Vila Nova");
    }

    // todos os campos da localidade são copiados para o response
    @Test
    void listar_copiaTodosOsCampos(){
        when(repository.findAll(Sort.by("nome"))).thenReturn(List.of(localidade(1, "Centro")));

        LocalidadeResponse r = service.listar().get(0);

        assertThat(r.id()).isEqualTo(1);
        assertThat(r.nome()).isEqualTo("Centro");
        assertThat(r.populacao()).isEqualTo(12000);
        assertThat(r.area()).isEqualByComparingTo("35.70");
    }

    // nenhuma localidade cadastrada retorna lista vazia
    @Test
    void listar_semLocalidades_retornaVazio(){
        when(repository.findAll(Sort.by("nome"))).thenReturn(List.of());

        assertThat(service.listar()).isEmpty();
    }
}
