package br.com.gestaorisco.api.serviceTest;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import br.com.gestaorisco.api.dto.request.CadastroRequest;
import br.com.gestaorisco.api.dto.request.LoginRequest;
import br.com.gestaorisco.api.dto.response.UsuarioResponse;
import br.com.gestaorisco.api.exception.CredenciaisInvalidasException;
import br.com.gestaorisco.api.exception.RegraNegocioException;
import br.com.gestaorisco.api.model.OrgaoResponsavel;
import br.com.gestaorisco.api.model.Usuario;
import br.com.gestaorisco.api.model.enums.Perfil;
import br.com.gestaorisco.api.repository.UsuarioRepository;
import br.com.gestaorisco.api.service.AuthService;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock UsuarioRepository usuarioRepository;
    @Mock PasswordEncoder passwordEncoder;

    @InjectMocks AuthService service;

    @Captor ArgumentCaptor<Usuario> captor;

    private CadastroRequest cadastro(){
        return new CadastroRequest("Maria", "52998224725", "11987654321",
            "maria@email.com", "senhaForte123");
    }

    private Usuario usuarioSalvo(Perfil perfil, OrgaoResponsavel orgao){
        Usuario u = new Usuario();
        u.setId(1);
        u.setNome("Maria");
        u.setCpf("52998224725");
        u.setTelefone("11987654321");
        u.setEmail("maria@email.com");
        u.setSenhaHash("HASH");
        u.setPerfil(perfil);
        u.setOrgao(orgao);
        return u;
    }

    // ===================== cadastrar =====================

    // dados válidos: salva com os dados do request, senha em hash e perfil CIDADAO
    @Test
    void cadastrar_dadosValidos_salvaCidadaoComSenhaHash(){
        when(usuarioRepository.existsByEmail("maria@email.com")).thenReturn(false);
        when(usuarioRepository.existsByCpf("52998224725")).thenReturn(false);
        when(passwordEncoder.encode("senhaForte123")).thenReturn("HASH");
        when(usuarioRepository.save(any())).thenAnswer(inv -> {
            Usuario u = inv.getArgument(0);
            u.setId(1);
            return u;
        });

        UsuarioResponse resp = service.cadastrar(cadastro());

        verify(usuarioRepository).save(captor.capture());
        Usuario salvo = captor.getValue();
        assertThat(salvo.getNome()).isEqualTo("Maria");
        assertThat(salvo.getCpf()).isEqualTo("52998224725");
        assertThat(salvo.getTelefone()).isEqualTo("11987654321");
        assertThat(salvo.getEmail()).isEqualTo("maria@email.com");
        assertThat(salvo.getSenhaHash()).isEqualTo("HASH").isNotEqualTo("senhaForte123");
        assertThat(salvo.getPerfil()).isEqualTo(Perfil.CIDADAO);
        assertThat(salvo.getOrgao()).isNull();

        assertThat(resp.id()).isEqualTo(1);
        assertThat(resp.perfil()).isEqualTo(Perfil.CIDADAO);
        assertThat(resp.orgaoId()).isNull();
    }

    // e-mail já cadastrado lança regra de negócio, não checa CPF e nada é salvo
    @Test
    void cadastrar_emailDuplicado_lancaRegraNegocio(){
        when(usuarioRepository.existsByEmail("maria@email.com")).thenReturn(true);

        assertThatThrownBy(() -> service.cadastrar(cadastro()))
            .isInstanceOf(RegraNegocioException.class)
            .hasMessageContaining("E-mail já cadastrado");
        verify(usuarioRepository, never()).existsByCpf(any());
        verify(usuarioRepository, never()).save(any());
        verifyNoInteractions(passwordEncoder);
    }

    // CPF já cadastrado lança regra de negócio e nada é salvo
    @Test
    void cadastrar_cpfDuplicado_lancaRegraNegocio(){
        when(usuarioRepository.existsByEmail("maria@email.com")).thenReturn(false);
        when(usuarioRepository.existsByCpf("52998224725")).thenReturn(true);

        assertThatThrownBy(() -> service.cadastrar(cadastro()))
            .isInstanceOf(RegraNegocioException.class)
            .hasMessageContaining("CPF já cadastrado");
        verify(usuarioRepository, never()).save(any());
        verifyNoInteractions(passwordEncoder);
    }

    // ===================== login =====================

    // credenciais corretas retornam os dados públicos do usuário
    @Test
    void login_credenciaisCorretas_retornaUsuario(){
        when(usuarioRepository.findByEmail("maria@email.com"))
            .thenReturn(Optional.of(usuarioSalvo(Perfil.CIDADAO, null)));
        when(passwordEncoder.matches("senhaForte123", "HASH")).thenReturn(true);

        UsuarioResponse resp = service.login(new LoginRequest("maria@email.com", "senhaForte123"));

        assertThat(resp.id()).isEqualTo(1);
        assertThat(resp.email()).isEqualTo("maria@email.com");
        assertThat(resp.perfil()).isEqualTo(Perfil.CIDADAO);
    }

    // login de agente retorna também os dados do órgão
    @Test
    void login_agente_retornaOrgao(){
        OrgaoResponsavel orgao = new OrgaoResponsavel();
        orgao.setId(3);
        orgao.setNome("Defesa Civil");
        when(usuarioRepository.findByEmail("maria@email.com"))
            .thenReturn(Optional.of(usuarioSalvo(Perfil.AGENTE, orgao)));
        when(passwordEncoder.matches("senhaForte123", "HASH")).thenReturn(true);

        UsuarioResponse resp = service.login(new LoginRequest("maria@email.com", "senhaForte123"));

        assertThat(resp.perfil()).isEqualTo(Perfil.AGENTE);
        assertThat(resp.orgaoId()).isEqualTo(3);
        assertThat(resp.orgaoNome()).isEqualTo("Defesa Civil");
    }

    // e-mail inexistente lança credenciais inválidas sem checar senha
    @Test
    void login_emailInexistente_lancaCredenciaisInvalidas(){
        when(usuarioRepository.findByEmail("x@email.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.login(new LoginRequest("x@email.com", "qualquer")))
            .isInstanceOf(CredenciaisInvalidasException.class);
        verifyNoInteractions(passwordEncoder);
    }

    // senha errada lança credenciais inválidas
    @Test
    void login_senhaErrada_lancaCredenciaisInvalidas(){
        when(usuarioRepository.findByEmail("maria@email.com"))
            .thenReturn(Optional.of(usuarioSalvo(Perfil.CIDADAO, null)));
        when(passwordEncoder.matches("errada", "HASH")).thenReturn(false);

        assertThatThrownBy(() -> service.login(new LoginRequest("maria@email.com", "errada")))
            .isInstanceOf(CredenciaisInvalidasException.class);
    }

    // e-mail inexistente e senha errada geram a mesma mensagem (não revela qual falhou)
    @Test
    void login_emailOuSenhaErrados_mesmaMensagem(){
        when(usuarioRepository.findByEmail("x@email.com")).thenReturn(Optional.empty());
        when(usuarioRepository.findByEmail("maria@email.com"))
            .thenReturn(Optional.of(usuarioSalvo(Perfil.CIDADAO, null)));
        when(passwordEncoder.matches("errada", "HASH")).thenReturn(false);

        Throwable emailErrado = catchThrowable(() -> service.login(new LoginRequest("x@email.com", "errada")));
        Throwable senhaErrada = catchThrowable(() -> service.login(new LoginRequest("maria@email.com", "errada")));

        assertThat(emailErrado).isInstanceOf(CredenciaisInvalidasException.class);
        assertThat(senhaErrada).isInstanceOf(CredenciaisInvalidasException.class)
            .hasMessage(emailErrado.getMessage());
    }
}
