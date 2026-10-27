package br.org.ens.sce;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public record SceRequest(
        @NotBlank(message = "Nome completo do sacerdote é obrigatório") String nomeCompleto,
        @NotNull(message = "Título é obrigatório") TituloSce titulo,
        String dioceseCongregacao,
        String paroquia,
        List<String> telefones,
        String email,
        String fotoUrl,
        LocalDate dataNascimento,
        LocalDate dataOrdenacaoConsagracao) {
}
