package br.org.ens.sce;

import java.time.LocalDate;
import java.util.List;

public record SceDto(
        String id,
        String nomeCompleto,
        TituloSce titulo,
        String dioceseCongregacao,
        String paroquia,
        List<String> telefones,
        String email,
        String fotoUrl,
        LocalDate dataNascimento,
        LocalDate dataOrdenacaoConsagracao,
        String status) {

    public static SceDto from(Sce s) {
        return new SceDto(
                s.getId(),
                s.getNomeCompleto(),
                s.getTitulo(),
                s.getDioceseCongregacao(),
                s.getParoquia(),
                s.getTelefones(),
                s.getEmail(),
                s.getFotoUrl(),
                s.getDataNascimento(),
                s.getDataOrdenacaoConsagracao(),
                s.getStatus());
    }
}
