package br.org.ens.reuniao;

import br.org.ens.casal.Casal;
import br.org.ens.casal.CasalDto;
import br.org.ens.casal.CasalRepository;
import br.org.ens.casal.CasalService;
import br.org.ens.casal.Endereco;
import br.org.ens.casal.StatusCasal;
import br.org.ens.equipe.EquipeRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ReuniaoService {

    private final ReuniaoRepository reuniaoRepository;
    private final EquipeRepository equipeRepository;
    private final CasalRepository casalRepository;
    private final CasalService casalService;

    public ReuniaoService(ReuniaoRepository reuniaoRepository,
                          EquipeRepository equipeRepository,
                          CasalRepository casalRepository,
                          CasalService casalService) {
        this.reuniaoRepository = reuniaoRepository;
        this.equipeRepository = equipeRepository;
        this.casalRepository = casalRepository;
        this.casalService = casalService;
    }

    public ReuniaoDto registrar(String equipeId, ReuniaoRequest request) {
        if (!equipeRepository.existsById(equipeId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Equipe não encontrada");
        }

        if (request.casalAnfitriaoId() != null && !request.casalAnfitriaoId().isBlank()) {
            Casal casal = casalRepository.findById(request.casalAnfitriaoId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Casal anfitrião informado não existe"));
            if (casal.getStatus() != StatusCasal.ATIVO) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Apenas casais com status ATIVO podem ser anfitriões de reuniões");
            }
        }

        Reuniao reuniao = new Reuniao();
        reuniao.setEquipeId(equipeId);
        reuniao.setData(request.data());
        reuniao.setHorario(request.horario());
        reuniao.setTipo(request.tipo() != null ? request.tipo() : TipoReuniao.FORMAL);
        reuniao.setCasalAnimadorId(request.casalAnimadorId());
        reuniao.setTema(request.tema());
        reuniao.setCasalAnfitriaoId(request.casalAnfitriaoId());
        reuniao.setLocalObservacao(request.localObservacao());
        reuniao.setScePresente(Boolean.TRUE.equals(request.scePresente()));
        reuniao.setPresencas(request.presencas() != null ? request.presencas() : new ArrayList<>());
        reuniao.setAnotacoesCre(request.anotacoesCre());
        reuniao.setFotos(request.fotos() != null ? request.fotos() : new ArrayList<>());

        Reuniao salva = reuniaoRepository.save(reuniao);
        return mapearDetalhe(salva);
    }

    public ReuniaoDto atualizar(String reuniaoId, ReuniaoRequest request) {
        Reuniao r = reuniaoRepository.findById(reuniaoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reunião não encontrada: " + reuniaoId));

        if (request.casalAnfitriaoId() != null && !request.casalAnfitriaoId().isBlank()) {
            Casal casal = casalRepository.findById(request.casalAnfitriaoId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Casal anfitrião informado não existe"));
            if (casal.getStatus() != StatusCasal.ATIVO) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Apenas casais com status ATIVO podem ser anfitriões de reuniões");
            }
        }

        r.setData(request.data());
        r.setHorario(request.horario());
        if (request.tipo() != null) {
            r.setTipo(request.tipo());
        }
        if (request.casalAnimadorId() != null) {
            r.setCasalAnimadorId(request.casalAnimadorId());
        }
        r.setTema(request.tema());
        r.setCasalAnfitriaoId(request.casalAnfitriaoId());
        r.setLocalObservacao(request.localObservacao());
        if (request.scePresente() != null) {
            r.setScePresente(request.scePresente());
        }
        if (request.presencas() != null) {
            r.setPresencas(request.presencas());
        }
        if (request.anotacoesCre() != null) {
            r.setAnotacoesCre(request.anotacoesCre());
        }
        if (request.fotos() != null) {
            r.setFotos(request.fotos());
        }

        Reuniao salva = reuniaoRepository.save(r);
        return mapearDetalhe(salva);
    }

    public ReuniaoDto registrarPresencas(String reuniaoId, RegistroPresencaRequest request) {
        Reuniao r = reuniaoRepository.findById(reuniaoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reunião não encontrada: " + reuniaoId));

        if (request.presencas() != null) {
            r.setPresencas(request.presencas());
        }
        if (request.scePresente() != null) {
            r.setScePresente(request.scePresente());
        }
        if (request.anotacoesCre() != null) {
            r.setAnotacoesCre(request.anotacoesCre());
        }
        if (request.fotos() != null) {
            r.setFotos(request.fotos());
        }

        Reuniao salva = reuniaoRepository.save(r);
        return mapearDetalhe(salva);
    }

    public List<ReuniaoDto> listarMinhaEquipe() {
        CasalDto perfil = casalService.obterPerfilLogado();
        if (perfil.equipeId() == null || perfil.equipeId().isBlank()) {
            return List.of();
        }
        return listarPorEquipe(perfil.equipeId());
    }

    public List<ReuniaoDto> listarPorEquipe(String equipeId) {
        if (!equipeRepository.existsById(equipeId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Equipe não encontrada");
        }

        List<Reuniao> reunioes = reuniaoRepository.findByEquipeIdOrderByDataDesc(equipeId);
        if (reunioes.isEmpty()) {
            return List.of();
        }

        return mapearLista(reunioes);
    }

    public List<ReuniaoDto> listarTodas(String equipeId) {
        if (equipeId != null && !equipeId.isBlank()) {
            return listarPorEquipe(equipeId);
        }
        List<Reuniao> reunioes = reuniaoRepository.findAll();
        reunioes.sort((a, b) -> {
            if (a.getData() == null) return 1;
            if (b.getData() == null) return -1;
            return b.getData().compareTo(a.getData());
        });
        return mapearLista(reunioes);
    }

    public ReuniaoDto obterPorId(String id) {
        Reuniao r = reuniaoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reunião não encontrada: " + id));
        return mapearDetalhe(r);
    }

    public void excluir(String id) {
        if (!reuniaoRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Reunião não encontrada: " + id);
        }
        reuniaoRepository.deleteById(id);
    }

    private List<ReuniaoDto> mapearLista(List<Reuniao> reunioes) {
        Set<String> casalIds = reunioes.stream()
                .flatMap(r -> java.util.stream.Stream.of(
                        r.getCasalAnfitriaoId(),
                        r.getCasalAnimadorId()
                ).filter(Objects::nonNull))
                .collect(Collectors.toSet());

        reunioes.forEach(r -> {
            r.getPresencas().stream()
                    .map(PresencaCasal::casalId)
                    .filter(Objects::nonNull)
                    .forEach(casalIds::add);
        });

        Map<String, Casal> casaisMap = casalRepository.findAllById(casalIds).stream()
                .collect(Collectors.toMap(Casal::getId, Function.identity()));

        return reunioes.stream()
                .map(r -> toDto(r, casaisMap))
                .toList();
    }

    private ReuniaoDto toDto(Reuniao r, Map<String, Casal> casaisMap) {
        String nomeAnfitriao = null;
        Endereco enderecoAnfitriao = null;

        if (r.getCasalAnfitriaoId() != null && casaisMap.containsKey(r.getCasalAnfitriaoId())) {
            Casal c = casaisMap.get(r.getCasalAnfitriaoId());
            nomeAnfitriao = c.getEsposo().nomeCompleto() + " e " + c.getEsposa().nomeCompleto();
            enderecoAnfitriao = c.getEndereco();
        }

        String nomeAnimador = null;
        if (r.getCasalAnimadorId() != null && casaisMap.containsKey(r.getCasalAnimadorId())) {
            Casal c = casaisMap.get(r.getCasalAnimadorId());
            nomeAnimador = c.getEsposo().nomeCompleto() + " e " + c.getEsposa().nomeCompleto();
        }

        int presentes = 0;
        int faltas = 0;
        int justificadas = 0;
        List<PresencaDetalheDto> presencasDtos = new ArrayList<>();

        for (PresencaCasal p : r.getPresencas()) {
            String nomeCasal = "Casal";
            if (casaisMap.containsKey(p.casalId())) {
                Casal c = casaisMap.get(p.casalId());
                nomeCasal = c.getEsposo().nomeCompleto() + " e " + c.getEsposa().nomeCompleto();
            }

            if (p.status() == StatusPresenca.PRESENTE) {
                presentes++;
            } else if (p.status() == StatusPresenca.FALTOU) {
                faltas++;
            } else if (p.status() == StatusPresenca.JUSTIFICOU) {
                justificadas++;
            }

            presencasDtos.add(new PresencaDetalheDto(p.casalId(), nomeCasal, p.status(), p.observacao()));
        }

        return new ReuniaoDto(
                r.getId(),
                r.getEquipeId(),
                r.getData(),
                r.getHorario(),
                r.getTipo() != null ? r.getTipo() : TipoReuniao.FORMAL,
                r.getCasalAnimadorId(),
                nomeAnimador,
                r.getTema(),
                r.getCasalAnfitriaoId(),
                nomeAnfitriao,
                enderecoAnfitriao,
                r.getLocalObservacao(),
                r.isScePresente(),
                presencasDtos,
                r.getAnotacoesCre(),
                r.getFotos(),
                presentes,
                faltas,
                justificadas
        );
    }

    private ReuniaoDto mapearDetalhe(Reuniao r) {
        Set<String> casalIds = new java.util.HashSet<>();
        if (r.getCasalAnfitriaoId() != null) casalIds.add(r.getCasalAnfitriaoId());
        if (r.getCasalAnimadorId() != null) casalIds.add(r.getCasalAnimadorId());
        r.getPresencas().stream().map(PresencaCasal::casalId).filter(Objects::nonNull).forEach(casalIds::add);

        Map<String, Casal> casaisMap = casalRepository.findAllById(casalIds).stream()
                .collect(Collectors.toMap(Casal::getId, Function.identity()));

        return toDto(r, casaisMap);
    }
}
