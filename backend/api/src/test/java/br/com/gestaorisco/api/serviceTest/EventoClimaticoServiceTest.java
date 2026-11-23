package br.com.gestaorisco.api.serviceTest;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;

import br.com.gestaorisco.api.dto.response.EventoClimaticoResponse;
import br.com.gestaorisco.api.model.EventoClimatico;
import br.com.gestaorisco.api.repository.EventoClimaticoRepository;
import br.com.gestaorisco.api.service.EventoClimaticoService;

@ExtendWith(MockitoExtension.class)
class EventoClimaticoServiceTest {

    @Mock EventoClimaticoRepository repository;

    @InjectMocks EventoClimaticoService service;

    @Captor ArgumentCaptor<Sort> sortCaptor;

    private EventoClimatico evento(Integer id, String nome, String classificacao){
        EventoClimatico e = new EventoClimatico();
        e.setId(id);
        e.setNome(nome);
        e.setClassificacao(classificacao);
        return e;
    }

    // ===================== listar =====================

    // busca os eventos ordenados por nome em ordem crescente
    @Test
    void listar_ordenaPorNomeAsc(){
        when(repository.findAll(any(Sort.class))).thenReturn(List.of());

        service.listar();

        verify(repository).findAll(sortCaptor.capture());
        Sort.Order ordem = sortCaptor.getValue().getOrderFor("nome");
        assertThat(ordem).isNotNull();
        assertThat(ordem.isAscending()).isTrue();
    }

    // converte cada evento para response mantendo a ordem do repository
    @Test
    void listar_converteMantendoOrdem(){
        when(repository.findAll(Sort.by("nome"))).thenReturn(List.of(
            evento(2, "Deslizamento", "Geológico"),
            evento(1, "Enchente", "Hidrológico"),
            evento(3, "Vendaval", "Meteorológico")));

        List<EventoClimaticoResponse> resp = service.listar();

        assertThat(resp).extracting(EventoClimaticoResponse::nome)
            .containsExactly("Deslizamento", "Enchente", "Vendaval");
    }

    // todos os campos do evento são copiados para o response
    @Test
    void listar_copiaTodosOsCampos(){
        when(repository.findAll(Sort.by("nome")))
            .thenReturn(List.of(evento(1, "Enchente", "Hidrológico")));

        EventoClimaticoResponse r = service.listar().get(0);

        assertThat(r.id()).isEqualTo(1);
        assertThat(r.nome()).isEqualTo("Enchente");
        assertThat(r.classificacao()).isEqualTo("Hidrológico");
    }

    // nenhum evento cadastrado retorna lista vazia
    @Test
    void listar_semEventos_retornaVazio(){
        when(repository.findAll(Sort.by("nome"))).thenReturn(List.of());

        assertThat(service.listar()).isEmpty();
    }
}
