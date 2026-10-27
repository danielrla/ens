package br.org.ens.mandato;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public record MandatoDto(
        String id,
        String casalId,
        String sceId,
        FuncaoMandato funcao,
        NivelInstancia nivelInstancia,
        String instanciaId,
        LocalDate dataInicio,
        LocalDate dataPrevistaTermino,
        String observacoes,
        String nomeResponsavel,
        String nomeInstancia,
        LocalDate dataEncerramentoEfetivo,
        StatusMandato status,
        AlertaMandato alerta,
        Integer diasParaTermino) {

    public static MandatoDto from(Mandato m, String nomeResponsavel, String nomeInstancia) {
        AlertaMandato alerta = AlertaMandato.calcular(m.getDataPrevistaTermino(), m.getStatus());
        Integer dias = null;
        if (m.getDataPrevistaTermino() != null) {
            dias = (int) ChronoUnit.DAYS.between(LocalDate.now(), m.getDataPrevistaTermino());
        }
        return new MandatoDto(
                m.getId(),
                m.getCasalId(),
                m.getSceId(),
                m.getFuncao(),
                m.getNivelInstancia(),
                m.getInstanciaId(),
                m.getDataInicio(),
                m.getDataPrevistaTermino(),
                m.getObservacoes(),
                nomeResponsavel,
                nomeInstancia,
                m.getDataEncerramentoEfetivo(),
                m.getStatus(),
                alerta,
                dias);
    }
}
