package br.com.gestaorisco.api.model;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "localidade")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Localidade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_localidade")
    @EqualsAndHashCode.Include
    private Integer id;

    @Column(name = "nome", nullable = false, length = 120, unique = true)
    private String nome;

    @Column(name = "populacao", nullable = false)
    private Integer populacao = 0;

    /** Área territorial em km². */
    @Column(name = "area", nullable = false, precision = 12, scale = 2)
    private BigDecimal area;

    /** Código IBGE do município (7 dígitos): chave para cruzar com INMET, Cemaden, Atlas e ViaCEP. */
    @Column(name = "codigo_ibge", unique = true, columnDefinition = "CHAR(7)")
    private String codigoIbge;

    @Column(name = "uf", columnDefinition = "CHAR(2)")
    private String uf;

    /** Sede do município (WGS84): usada quando o usuário só informou a cidade. */
    @Column(name = "latitude", precision = 9, scale = 6)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 9, scale = 6)
    private BigDecimal longitude;

    /** Cidade coberta pelo SafeZone no MVP. */
    @Column(name = "atendida", nullable = false, columnDefinition = "BOOLEAN")
    private boolean atendida;
}
