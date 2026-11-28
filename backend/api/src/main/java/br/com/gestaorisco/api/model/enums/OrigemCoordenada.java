package br.com.gestaorisco.api.model.enums;

/** De onde veio a coordenada do endereço do usuário. */
public enum OrigemCoordenada {
    /** O próprio usuário compartilhou a localização do aparelho. */
    GPS,
    /** Calculada a partir do endereço (fase 3, Google Geocoding). */
    GEOCODIFICADO
}
