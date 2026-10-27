package br.org.ens.equipe;

import br.org.ens.casal.Casal;
import br.org.ens.casal.CasalRepository;
import br.org.ens.comum.PageResponse;
import br.org.ens.estrutura.NoEstrutura;
import br.org.ens.estrutura.NoEstruturaRepository;
import br.org.ens.sce.SceRepository;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import br.org.ens.mandato.FuncaoMandato;
import br.org.ens.mandato.Mandato;
import br.org.ens.mandato.MandatoRepository;
import br.org.ens.mandato.StatusMandato;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class EquipeService {

    private final EquipeRepository equipeRepository;
    private final CasalRepository casalRepository;
    private final NoEstruturaRepository estruturaRepository;
    private final SceRepository sceRepository;
    private final MandatoRepository mandatoRepository;
    private final MongoTemplate mongoTemplate;

    public EquipeService(EquipeRepository equipeRepository,
                         CasalRepository casalRepository,
                         NoEstruturaRepository estruturaRepository,
                         SceRepository sceRepository,
                         MandatoRepository mandatoRepository,
                         MongoTemplate mongoTemplate) {
        this.equipeRepository = equipeRepository;
        this.casalRepository = casalRepository;
        this.estruturaRepository = estruturaRepository;
        this.sceRepository = sceRepository;
        this.mandatoRepository = mandatoRepository;
        this.mongoTemplate = mongoTemplate;
    }

    public EquipeDetalheDto criar(EquipeRequest request) {
        Integer numero = request.numero();
        if (numero == null || numero <= 0) {
            numero = equipeRepository.findBySetorId(request.setorId()).stream()
                    .map(Equipe::getNumero)
                    .filter(Objects::nonNull)
                    .max(Integer::compareTo)
                    .orElse(0) + 1;
        } else if (equipeRepository.existsBySetorIdAndNumero(request.setorId(), numero)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Já existe uma equipe com o número " + numero + " neste setor");
        }

        Equipe equipe = new Equipe();
        equipe.setNumero(numero);
        equipe.setNomeDevocao(request.nomeDevocao());
        equipe.setSuperRegiaoId(request.superRegiaoId());
        equipe.setProvinciaId(request.provinciaId());
        equipe.setRegiaoId(request.regiaoId());
        equipe.setSetorId(request.setorId());

        boolean emPilotagem = Boolean.TRUE.equals(request.emPilotagem()) || request.status() == StatusEquipe.EM_PILOTAGEM;
        equipe.setStatus(emPilotagem ? StatusEquipe.EM_PILOTAGEM : (request.status() != null ? request.status() : StatusEquipe.ATIVA));
        equipe.setDataFundacao(request.dataFundacao());
        equipe.setDataInicioPilotagem(request.dataInicioPilotagem());
        equipe.setDataTerminoPilotagem(request.dataTerminoPilotagem());
        equipe.setCasalPilotoId(request.casalPilotoId());
        equipe.setSceId(request.sceId());
        equipe.setEstado(request.estado());
        equipe.setMunicipio(request.municipio());
        if (request.temasAnuais() != null && !request.temasAnuais().isEmpty()) {
            equipe.setTemasAnuais(request.temasAnuais());
        } else if (request.temaEstudoAno() != null && !request.temaEstudoAno().isBlank()) {
            equipe.setTemaEstudoAno(request.temaEstudoAno());
            equipe.setTemasAnuais(List.of(new TemaAno(LocalDate.now().getYear(), request.temaEstudoAno())));
        }

        Equipe salva = equipeRepository.save(equipe);
        if (request.casalResponsavelId() != null && !request.casalResponsavelId().isBlank()) {
            definirCasalResponsavel(salva, request.casalResponsavelId());
            salva = equipeRepository.save(salva);
        }
        return mapearDetalhe(salva);
    }

    public EquipeDetalheDto atualizar(String id, EquipeRequest request) {
        Equipe equipe = buscarOuFalhar(id);

        if (request.numero() != null && !Objects.equals(equipe.getNumero(), request.numero())
                && equipeRepository.existsBySetorIdAndNumero(request.setorId(), request.numero())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Já existe uma equipe com o número " + request.numero() + " neste setor");
        }

        if (request.numero() != null && request.numero() > 0) {
            equipe.setNumero(request.numero());
        }
        equipe.setNomeDevocao(request.nomeDevocao());
        equipe.setSuperRegiaoId(request.superRegiaoId());
        equipe.setProvinciaId(request.provinciaId());
        equipe.setRegiaoId(request.regiaoId());
        equipe.setSetorId(request.setorId());

        if (request.emPilotagem() != null) {
            equipe.setStatus(Boolean.TRUE.equals(request.emPilotagem()) ? StatusEquipe.EM_PILOTAGEM : (request.status() != null ? request.status() : StatusEquipe.ATIVA));
        } else if (request.status() != null) {
            equipe.setStatus(request.status());
        }

        equipe.setDataFundacao(request.dataFundacao());
        equipe.setDataInicioPilotagem(request.dataInicioPilotagem());
        equipe.setDataTerminoPilotagem(request.dataTerminoPilotagem());
        equipe.setCasalPilotoId(request.casalPilotoId());
        equipe.setSceId(request.sceId());
        equipe.setEstado(request.estado());
        equipe.setMunicipio(request.municipio());
        if (request.temasAnuais() != null) {
            equipe.setTemasAnuais(request.temasAnuais());
        } else if (request.temaEstudoAno() != null) {
            equipe.setTemaEstudoAno(request.temaEstudoAno());
        }

        if (request.casalResponsavelId() != null) {
            definirCasalResponsavel(equipe, request.casalResponsavelId());
        }

        Equipe salva = equipeRepository.save(equipe);
        return mapearDetalhe(salva);
    }

    public EquipeDetalheDto obterPorId(String id) {
        return mapearDetalhe(buscarOuFalhar(id));
    }

    public PageResponse<EquipeResumoDto> listar(String superRegiaoId,
                                                String provinciaId,
                                                String regiaoId,
                                                String setorId,
                                                String equipeId,
                                                StatusEquipe status,
                                                int page,
                                                int size) {
        Query query = new Query();
        List<Criteria> criteriaList = new ArrayList<>();

        if (equipeId != null && !equipeId.isBlank()) {
            criteriaList.add(Criteria.where("_id").is(equipeId));
        } else {
            if (setorId != null && !setorId.isBlank()) {
                criteriaList.add(Criteria.where("setorId").is(setorId));
            } else if (regiaoId != null && !regiaoId.isBlank()) {
                criteriaList.add(Criteria.where("regiaoId").is(regiaoId));
            } else if (provinciaId != null && !provinciaId.isBlank()) {
                criteriaList.add(Criteria.where("provinciaId").is(provinciaId));
            } else if (superRegiaoId != null && !superRegiaoId.isBlank()) {
                criteriaList.add(Criteria.where("superRegiaoId").is(superRegiaoId));
            }

            if (status != null) {
                criteriaList.add(Criteria.where("status").is(status));
            }
        }

        if (!criteriaList.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
        }

        long total = mongoTemplate.count(query, Equipe.class);

        query.with(Sort.by(Sort.Direction.ASC, "numero"));
        query.with(PageRequest.of(page, size));

        List<Equipe> equipes = mongoTemplate.find(query, Equipe.class);

        Map<String, NoEstrutura> estruturas = carregarEstruturasResumo(equipes);
        Map<String, Casal> casaisMap = carregarCasaisResumo(equipes);

        List<EquipeResumoDto> content = equipes.stream()
                .map(eq -> toResumoDto(eq, estruturas, casaisMap))
                .toList();

        int totalPages = size == 0 ? 1 : (int) Math.ceil((double) total / size);
        return new PageResponse<>(page, size, total, totalPages, content);
    }

    public EquipeDetalheDto inativar(String id) {
        Equipe equipe = buscarOuFalhar(id);
        equipe.setStatus(StatusEquipe.INATIVA);
        return mapearDetalhe(equipeRepository.save(equipe));
    }

    public void arquivar(String id) {
        inativar(id);
    }

    public EquipeDetalheDto atualizarVinculos(String id, List<VinculoRequest> vinculosRequest) {
        Equipe equipe = buscarOuFalhar(id);

        List<Vinculo> novosVinculos = new ArrayList<>();
        LocalDate hoje = LocalDate.now();

        for (VinculoRequest vr : vinculosRequest) {
            casalRepository.findById(vr.casalId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Casal não encontrado: " + vr.casalId()));

            LocalDate desde = equipe.getVinculos().stream()
                    .filter(v -> v.casalId().equals(vr.casalId()))
                    .findFirst()
                    .map(Vinculo::desde)
                    .orElse(hoje);

            novosVinculos.add(new Vinculo(vr.casalId(), vr.papel(), desde));
        }

        equipe.setVinculos(novosVinculos);
        Equipe salva = equipeRepository.save(equipe);

        novosVinculos.forEach(v -> casalRepository.findById(v.casalId()).ifPresent(c -> {
            c.setEquipeId(equipe.getId());
            casalRepository.save(c);
        }));

        return mapearDetalhe(salva);
    }

    private Equipe buscarOuFalhar(String id) {
        return equipeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Equipe não encontrada"));
    }

    private Map<String, NoEstrutura> carregarEstruturasResumo(List<Equipe> equipes) {
        Set<String> ids = equipes.stream()
                .flatMap(e -> java.util.stream.Stream.of(
                        e.getSuperRegiaoId(), e.getProvinciaId(), e.getRegiaoId(), e.getSetorId()))
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        return estruturaRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(NoEstrutura::id, Function.identity()));
    }

    private Map<String, Casal> carregarCasaisResumo(List<Equipe> equipes) {
        Set<String> casalIds = equipes.stream()
                .flatMap(e -> e.getVinculos().stream())
                .filter(v -> v.papel() == PapelVinculo.CRE)
                .map(Vinculo::casalId)
                .collect(Collectors.toSet());

        equipes.stream()
                .map(Equipe::getCasalPilotoId)
                .filter(Objects::nonNull)
                .forEach(casalIds::add);

        return casalRepository.findAllById(casalIds).stream()
                .collect(Collectors.toMap(Casal::getId, Function.identity()));
    }

    private record CreInfo(String casalId, String nomeCre) {}

    private CreInfo resolverCreVigente(Equipe eq, Map<String, Casal> casaisMap) {
        String creCasalId = eq.getVinculos().stream()
                .filter(v -> v.papel() == PapelVinculo.CRE)
                .map(Vinculo::casalId)
                .findFirst()
                .orElse(null);

        if (creCasalId != null) {
            Casal c = casaisMap != null ? casaisMap.get(creCasalId) : null;
            if (c == null) {
                c = casalRepository.findById(creCasalId).orElse(null);
            }
            if (c != null) {
                String nome = c.getEsposo().nomeCompleto() + " e " + c.getEsposa().nomeCompleto();
                return new CreInfo(creCasalId, nome);
            }
        }

        List<Mandato> mandatos = eq.getId() != null
                ? mandatoRepository.findByInstanciaIdAndFuncaoAndStatus(eq.getId(), FuncaoMandato.CRE, StatusMandato.VIGENTE)
                : List.of();

        if (mandatos.isEmpty() && eq.getNumero() != null) {
            mandatos = mandatoRepository.findByInstanciaIdAndFuncaoAndStatus(
                    String.valueOf(eq.getNumero()), FuncaoMandato.CRE, StatusMandato.VIGENTE);
        }

        if (mandatos.isEmpty() && eq.getVinculos() != null) {
            for (Vinculo v : eq.getVinculos()) {
                List<Mandato> mandatosCasal = mandatoRepository.findByCasalId(v.casalId()).stream()
                        .filter(m -> m.getFuncao() == FuncaoMandato.CRE && m.getStatus() == StatusMandato.VIGENTE)
                        .toList();
                if (!mandatosCasal.isEmpty()) {
                    mandatos = mandatosCasal;
                    break;
                }
            }
        }

        if (!mandatos.isEmpty() && mandatos.get(0).getCasalId() != null) {
            String cId = mandatos.get(0).getCasalId();
            Casal c = casaisMap != null ? casaisMap.get(cId) : null;
            if (c == null) {
                c = casalRepository.findById(cId).orElse(null);
            }
            if (c != null) {
                String nome = c.getEsposo().nomeCompleto() + " e " + c.getEsposa().nomeCompleto();
                return new CreInfo(cId, nome);
            }
        }

        return new CreInfo(null, null);
    }

    private EquipeResumoDto toResumoDto(Equipe eq, Map<String, NoEstrutura> estruturas, Map<String, Casal> casaisMap) {
        CreInfo creInfo = resolverCreVigente(eq, casaisMap);
        String nomeCre = creInfo.nomeCre();

        String nomePiloto = null;
        if (eq.getCasalPilotoId() != null && casaisMap.containsKey(eq.getCasalPilotoId())) {
            Casal cp = casaisMap.get(eq.getCasalPilotoId());
            nomePiloto = cp.getEsposo().nomeCompleto() + " e " + cp.getEsposa().nomeCompleto();
        }

        String nomeSce = null;
        if (eq.getSceId() != null) {
            nomeSce = sceRepository.findById(eq.getSceId())
                    .map(s -> s.getTitulo() + " " + s.getNomeCompleto())
                    .orElse(null);
        }

        return new EquipeResumoDto(
                eq.getId(),
                eq.getNumero(),
                eq.getNomeDevocao(),
                eq.getStatus(),
                eq.getStatus() == StatusEquipe.EM_PILOTAGEM,
                estruturas.get(eq.getSuperRegiaoId()),
                estruturas.get(eq.getProvinciaId()),
                estruturas.get(eq.getRegiaoId()),
                estruturas.get(eq.getSetorId()),
                nomeSce,
                nomeCre,
                eq.getCasalPilotoId(),
                nomePiloto,
                SituacaoMandato.VIGENTE_REGULAR,
                AlertaMandato.NENHUM,
                eq.getVinculos().size(),
                eq.getEstado(),
                eq.getMunicipio()
        );
    }

    private void definirCasalResponsavel(Equipe equipe, String casalResponsavelId) {
        if (casalResponsavelId == null || casalResponsavelId.isBlank()) {
            equipe.setVinculos(equipe.getVinculos().stream()
                    .map(v -> v.papel() == PapelVinculo.CRE
                            ? new Vinculo(v.casalId(), PapelVinculo.MEMBRO, v.desde())
                            : v)
                    .collect(Collectors.toCollection(ArrayList::new)));
            return;
        }

        Casal casal = casalRepository.findById(casalResponsavelId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Casal responsável não encontrado: " + casalResponsavelId));

        boolean found = false;
        List<Vinculo> atualizados = new ArrayList<>();
        for (Vinculo v : equipe.getVinculos()) {
            if (v.casalId().equals(casalResponsavelId)) {
                atualizados.add(new Vinculo(v.casalId(), PapelVinculo.CRE, v.desde()));
                found = true;
            } else if (v.papel() == PapelVinculo.CRE) {
                atualizados.add(new Vinculo(v.casalId(), PapelVinculo.MEMBRO, v.desde()));
            } else {
                atualizados.add(v);
            }
        }
        if (!found) {
            atualizados.add(new Vinculo(casalResponsavelId, PapelVinculo.CRE, LocalDate.now()));
            casal.setEquipeId(equipe.getId());
            casalRepository.save(casal);
        }
        equipe.setVinculos(atualizados);
    }

    private EquipeDetalheDto mapearDetalhe(Equipe eq) {
        NoEstrutura superRegiao = eq.getSuperRegiaoId() != null ? estruturaRepository.findById(eq.getSuperRegiaoId()).orElse(null) : null;
        NoEstrutura provincia = eq.getProvinciaId() != null ? estruturaRepository.findById(eq.getProvinciaId()).orElse(null) : null;
        NoEstrutura regiao = eq.getRegiaoId() != null ? estruturaRepository.findById(eq.getRegiaoId()).orElse(null) : null;
        NoEstrutura setor = eq.getSetorId() != null ? estruturaRepository.findById(eq.getSetorId()).orElse(null) : null;

        List<VinculoDto> vinculoDtos = new ArrayList<>();
        String nomeCre = null;
        String creCasalId = null;

        for (Vinculo v : eq.getVinculos()) {
            Casal casal = casalRepository.findById(v.casalId()).orElse(null);
            String nomeCasal = casal != null
                    ? casal.getEsposo().nomeCompleto() + " e " + casal.getEsposa().nomeCompleto()
                    : "Casal";

            if (v.papel() == PapelVinculo.CRE) {
                nomeCre = nomeCasal;
                creCasalId = v.casalId();
            }

            vinculoDtos.add(new VinculoDto(v.casalId(), nomeCasal, v.papel(), v.desde()));
        }

        if (nomeCre == null) {
            CreInfo info = resolverCreVigente(eq, null);
            nomeCre = info.nomeCre();
            creCasalId = info.casalId();
        }

        String nomePiloto = null;
        if (eq.getCasalPilotoId() != null) {
            nomePiloto = casalRepository.findById(eq.getCasalPilotoId())
                    .map(cp -> cp.getEsposo().nomeCompleto() + " e " + cp.getEsposa().nomeCompleto())
                    .orElse(null);
        }

        String nomeSce = null;
        if (eq.getSceId() != null) {
            nomeSce = sceRepository.findById(eq.getSceId())
                    .map(s -> s.getTitulo() + " " + s.getNomeCompleto())
                    .orElse(null);
        }

        return new EquipeDetalheDto(
                eq.getId(),
                eq.getNumero(),
                eq.getNomeDevocao(),
                eq.getStatus(),
                eq.getStatus() == StatusEquipe.EM_PILOTAGEM,
                superRegiao,
                provincia,
                regiao,
                setor,
                nomeSce,
                eq.getSceId(),
                nomeCre,
                creCasalId,
                eq.getCasalPilotoId(),
                nomePiloto,
                SituacaoMandato.VIGENTE_REGULAR,
                AlertaMandato.NENHUM,
                eq.getVinculos().size(),
                eq.getDataFundacao(),
                eq.getDataInicioPilotagem(),
                eq.getDataTerminoPilotagem(),
                vinculoDtos,
                eq.getEstado(),
                eq.getMunicipio(),
                eq.getTemaEstudoAno(),
                eq.getTemasAnuais()
        );
    }
}
