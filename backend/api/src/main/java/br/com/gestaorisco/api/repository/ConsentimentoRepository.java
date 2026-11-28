package br.com.gestaorisco.api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.gestaorisco.api.model.Consentimento;
import br.com.gestaorisco.api.model.enums.FinalidadeConsentimento;

public interface ConsentimentoRepository extends JpaRepository<Consentimento, Integer> {

    // Consentimentos ainda vigentes (não revogados) do usuário para a finalidade.
    List<Consentimento> findByUsuarioIdAndFinalidadeAndRevogadoEmIsNull(Integer usuarioId,
                                                                        FinalidadeConsentimento finalidade);
}
