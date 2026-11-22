package br.com.gestaorisco.api.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gestaorisco.api.dto.response.AbrigoProximoResponse;
import br.com.gestaorisco.api.repository.AbrigoRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AbrigoService {
    
    private final static int LIMITE_PADRAO = 5;
    private final static int LIMITE_MAXIMO = 20;

    private final AbrigoRepository abrigoRepository;

    public List<AbrigoProximoResponse> proximos(double lat, double lng, Integer limite){

        int n = (limite == null) ? LIMITE_PADRAO : Math.max(1, Math.min(limite, LIMITE_MAXIMO));
        return abrigoRepository.proximos(lat, lng, n).stream()
            .map(AbrigoProximoResponse::from)
            .toList();
    }
}
