package br.com.gestaorisco.api.service;

import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gestaorisco.api.dto.request.CadastroRequest;
import br.com.gestaorisco.api.dto.request.LoginRequest;
import br.com.gestaorisco.api.dto.response.UsuarioResponse;
import br.com.gestaorisco.api.exception.CredenciaisInvalidasException;
import br.com.gestaorisco.api.exception.RegraNegocioException;
import br.com.gestaorisco.api.model.Usuario;
import br.com.gestaorisco.api.model.enums.Perfil;
import br.com.gestaorisco.api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {
    
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UsuarioResponse cadastrar(CadastroRequest req) {
        if (usuarioRepository.existsByEmail(req.email()))
            throw new RegraNegocioException("E-mail já cadastrado");
        
        if (usuarioRepository.existsByCpf(req.cpf()))
            throw new RegraNegocioException("CPF já cadastrado");
        

        Usuario usuario = new Usuario();
        usuario.setNome(req.nome());
        usuario.setCpf(req.cpf());
        usuario.setTelefone(req.telefone());
        usuario.setEmail(req.email());
        usuario.setSenhaHash(passwordEncoder.encode(req.senha()));
        usuario.setPerfil(Perfil.CIDADAO); // sempre; nunca vem do request

        return UsuarioResponse.from(usuarioRepository.save(usuario));
    }

    public UsuarioResponse login(LoginRequest req) {
        // Mesma mensagem para e-mail ou senha errados: não revela qual falhou
        return usuarioRepository.findByEmail(req.email())
            .filter(u -> passwordEncoder.matches(req.senha(), u.getSenhaHash()))
            .map(UsuarioResponse::from)
            .orElseThrow(() -> new CredenciaisInvalidasException("E-mail ou senha inválidos"));
    }
}
