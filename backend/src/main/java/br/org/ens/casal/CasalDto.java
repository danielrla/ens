package br.org.ens.casal;

import java.time.LocalDate;
import java.util.List;

public record CasalDto(
        String id,
        Pessoa esposo,
        Pessoa esposa,
        LocalDate dataMatrimonio,
        String paroquiaCasamento,
        String recebeCartaMensal,
        Endereco endereco,
        StatusCasal status,
        String equipeId,
        String nomeEquipe,
        String fotoUrl,
        String motivoInativacao,
        List<Filho> filhos) {

    public static CasalDto from(Casal c) {
        return from(c, null);
    }

    public static CasalDto from(Casal c, String nomeEquipe) {
        return new CasalDto(
                c.getId(),
                c.getEsposo(),
                c.getEsposa(),
                c.getDataMatrimonio(),
                c.getParoquiaCasamento(),
                c.getRecebeCartaMensal(),
                c.getEndereco(),
                c.getStatus(),
                c.getEquipeId(),
                nomeEquipe,
                c.getFotoUrl(),
                c.getMotivoInativacao(),
                c.getFilhos());
    }

    public String nomeCasal() {
        String n1 = esposo != null && esposo.nomeCompleto() != null ? esposo.nomeCompleto() : "";
        String n2 = esposa != null && esposa.nomeCompleto() != null ? esposa.nomeCompleto() : "";
        if (!n1.isBlank() && !n2.isBlank()) {
            return n1 + " & " + n2;
        }
        return !n1.isBlank() ? n1 : n2;
    }
}
