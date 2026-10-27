package br.org.ens.reuniao;

import java.util.List;

public record RegistroPresencaRequest(
        List<PresencaCasal> presencas,
        Boolean scePresente,
        String anotacoesCre,
        List<String> fotos) {
}
