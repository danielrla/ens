package br.org.ens.mandato;

import br.org.ens.casal.Casal;
import br.org.ens.casal.CasalRepository;
import br.org.ens.comum.PageResponse;
import br.org.ens.equipe.Equipe;
import br.org.ens.equipe.EquipeRepository;
import br.org.ens.equipe.PapelVinculo;
import br.org.ens.equipe.Vinculo;
import br.org.ens.estrutura.NoEstrutura;
import br.org.ens.estrutura.NoEstruturaRepository;
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
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class MandatoService {

    private final MandatoRepository mandatoRepository;
    private final CasalRepository casalRepository;
    private final EquipeRepository equipeRepository;
    private final NoEstruturaRepository estruturaRepository;
    private final MongoTemplate mongoTemplate;

    public MandatoService(MandatoRepository mandatoRepository,
                          CasalRepository casalRepository,
                          EquipeRepository equipeRepository,
                          NoEstruturaRepository estruturaRepository,
                          MongoTemplate mongoTemplate) {
        this.mandatoRepository = mandatoRepository;
        this.casalRepository = casalRepository;
        this.equipeRepository = equipeRepository;
        this.estruturaRepository = estruturaRepository;
        this.mongoTemplate = mongoTemplate;
    }

    @Transactional
    public MandatoDto criar(MandatoRequest request) {
        if ((request.casalId() == null || request.casalId().isBlank()) &&
            (request.sceId() == null || request.sceId().isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mandato deve ter um Casal ou SCE responsável");
        }

        if (request.casalId() != null && !casalRepository.existsById(request.casalId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Casal responsável não encontrado");
        }

        validarInstancia(request.nivelInstancia(), request.instanciaId());

        LocalDate dataPrevista = request.dataPrevistaTermino();
        if (dataPrevista == null) {
            dataPrevista = request.dataInicio().plusYears(request.funcao().getPrazoEstatutarioAnos());
        }

        // Transição de mandato: encerra atomicamente o mandato anterior ativo para a mesma instância e função
        List<Mandato> anterioresVigentes = mandatoRepository.findByInstanciaIdAndFuncaoAndStatus(
                request.instanciaId(), request.funcao(), StatusMandato.VIGENTE);

        for (Mandato anterior : anterioresVigentes) {
            anterior.setStatus(StatusMandato.CONCLUIDO);
            anterior.setDataEncerramentoEfetivo(request.dataInicio());
            mandatoRepository.save(anterior);
        }

        Mandato novo = new Mandato(
                null,
                request.casalId(),
                request.sceId(),
                request.funcao(),
                request.nivelInstancia(),
                request.instanciaId(),
                request.dataInicio(),
                dataPrevista,
                null,
                StatusMandato.VIGENTE,
                request.observacoes());

        novo = mandatoRepository.save(novo);

        // Sincroniza vínculos da equipe caso o mandato seja de CRE
        if (request.funcao() == FuncaoMandato.CRE && request.nivelInstancia() == NivelInstancia.EQUIPE && request.casalId() != null) {
            equipeRepository.findById(request.instanciaId()).ifPresent(eq -> {
                boolean found = false;
                List<Vinculo> atualizados = new ArrayList<>();
                for (Vinculo v : eq.getVinculos()) {
                    if (v.casalId().equals(request.casalId())) {
                        atualizados.add(new Vinculo(v.casalId(), PapelVinculo.CRE, v.desde()));
                        found = true;
                    } else if (v.papel() == PapelVinculo.CRE) {
                        atualizados.add(new Vinculo(v.casalId(), PapelVinculo.MEMBRO, v.desde()));
                    } else {
                        atualizados.add(v);
                    }
                }
                if (!found) {
                    atualizados.add(new Vinculo(request.casalId(), PapelVinculo.CRE, request.dataInicio()));
                }
                eq.setVinculos(atualizados);
                equipeRepository.save(eq);
            });
        }

        return enrich(novo);
    }

    @Transactional
    public MandatoDto interromper(String id, InterrupcaoRequest request) {
        Mandato mandato = mandatoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mandato não encontrado"));

        if (mandato.getStatus() != StatusMandato.VIGENTE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Apenas mandatos vigentes podem ser interrompidos");
        }

        mandato.setStatus(StatusMandato.INTERROMPIDO_ANTECIPADAMENTE);
        mandato.setDataEncerramentoEfetivo(LocalDate.now());

        String obs = mandato.getObservacoes() != null && !mandato.getObservacoes().isBlank()
                ? mandato.getObservacoes() + "\n"
                : "";
        mandato.setObservacoes(obs + "Interrupção antecipada: " + request.motivo());

        Mandato salvo = mandatoRepository.save(mandato);

        if (salvo.getFuncao() == FuncaoMandato.CRE && salvo.getNivelInstancia() == NivelInstancia.EQUIPE && salvo.getCasalId() != null) {
            final String casalIdInterrompido = salvo.getCasalId();
            equipeRepository.findById(salvo.getInstanciaId()).ifPresent(eq -> {
                List<Vinculo> atualizados = eq.getVinculos().stream()
                        .map(v -> v.casalId().equals(casalIdInterrompido) && v.papel() == PapelVinculo.CRE
                                ? new Vinculo(v.casalId(), PapelVinculo.MEMBRO, v.desde())
                                : v)
                        .collect(Collectors.toCollection(ArrayList::new));
                eq.setVinculos(atualizados);
                equipeRepository.save(eq);
            });
        }

        return enrich(salvo);
    }

    public MandatoDto buscarPorId(String id) {
        Mandato mandato = mandatoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mandato não encontrado"));
        return enrich(mandato);
    }

    public List<MandatoDto> listarPorCasal(String casalId) {
        List<Mandato> mandatos = mandatoRepository.findByCasalId(casalId);
        return enrichBatch(mandatos);
    }

    public PrazoSugeridoDto calcularPrazoSugerido(FuncaoMandato funcao, LocalDate dataInicio) {
        if (funcao == null || dataInicio == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Função e data de início são obrigatórios");
        }
        return new PrazoSugeridoDto(dataInicio.plusYears(funcao.getPrazoEstatutarioAnos()));
    }

    public PageResponse<MandatoDto> listar(FuncaoMandato funcao,
                                          StatusMandato status,
                                          NivelInstancia nivelInstancia,
                                          String instanciaId,
                                          AlertaMandato alerta,
                                          int page,
                                          int size) {
        List<Criteria> criteriaList = new ArrayList<>();

        if (funcao != null) {
            criteriaList.add(Criteria.where("funcao").is(funcao));
        }
        if (status != null) {
            criteriaList.add(Criteria.where("status").is(status));
        }
        if (nivelInstancia != null) {
            criteriaList.add(Criteria.where("nivelInstancia").is(nivelInstancia));
        }
        if (instanciaId != null && !instanciaId.isBlank()) {
            criteriaList.add(Criteria.where("instanciaId").is(instanciaId));
        }

        Query query = new Query();
        if (!criteriaList.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
        }

        long total = mongoTemplate.count(query, Mandato.class);

        query.with(Sort.by(Sort.Direction.DESC, "dataInicio"));

        // Se houver filtro de alerta dinâmico, processamos a lista completa correspondente
        if (alerta != null) {
            List<Mandato> todos = mongoTemplate.find(query, Mandato.class);
            List<MandatoDto> filtrados = enrichBatch(todos).stream()
                    .filter(m -> m.alerta() == alerta)
                    .toList();

            int totalFiltrados = filtrados.size();
            int fromIndex = Math.min(page * size, totalFiltrados);
            int toIndex = Math.min(fromIndex + size, totalFiltrados);
            List<MandatoDto> paginados = filtrados.subList(fromIndex, toIndex);

            int totalPages = size == 0 ? 1 : (int) Math.ceil((double) totalFiltrados / size);
            return new PageResponse<>(page, size, totalFiltrados, totalPages, paginados);
        }

        query.with(PageRequest.of(page, size));
        List<Mandato> mandatos = mongoTemplate.find(query, Mandato.class);
        List<MandatoDto> content = enrichBatch(mandatos);

        int totalPages = size == 0 ? 1 : (int) Math.ceil((double) total / size);
        return new PageResponse<>(page, size, total, totalPages, content);
    }

    private void validarInstancia(NivelInstancia nivel, String instanciaId) {
        if (nivel == NivelInstancia.INTERNACIONAL) {
            return;
        }
        if (nivel == NivelInstancia.EQUIPE) {
            if (!equipeRepository.existsById(instanciaId)) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Equipe associada não encontrada");
            }
            return;
        }
        if (!estruturaRepository.existsById(instanciaId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Instância da estrutura não encontrada");
        }
    }

    private MandatoDto enrich(Mandato m) {
        String nomeResponsavel = resolverNomeResponsavel(m.getCasalId(), m.getSceId());
        String nomeInstancia = resolverNomeInstancia(m.getNivelInstancia(), m.getInstanciaId());
        return MandatoDto.from(m, nomeResponsavel, nomeInstancia);
    }

    private List<MandatoDto> enrichBatch(List<Mandato> mandatos) {
        if (mandatos.isEmpty()) {
            return List.of();
        }

        Set<String> casalIds = mandatos.stream()
                .map(Mandato::getCasalId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<String, Casal> casaisMap = casalRepository.findAllById(casalIds).stream()
                .collect(Collectors.toMap(Casal::getId, Function.identity()));

        Set<String> equipeIds = mandatos.stream()
                .filter(m -> m.getNivelInstancia() == NivelInstancia.EQUIPE)
                .map(Mandato::getInstanciaId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<String, Equipe> equipesMap = equipeRepository.findAllById(equipeIds).stream()
                .collect(Collectors.toMap(Equipe::getId, Function.identity()));

        Set<String> estruturaIds = mandatos.stream()
                .filter(m -> m.getNivelInstancia() != NivelInstancia.EQUIPE && m.getNivelInstancia() != NivelInstancia.INTERNACIONAL)
                .map(Mandato::getInstanciaId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<String, NoEstrutura> estruturasMap = estruturaRepository.findAllById(estruturaIds).stream()
                .collect(Collectors.toMap(NoEstrutura::id, Function.identity()));

        return mandatos.stream().map(m -> {
            String nomeResponsavel = "Não informado";
            if (m.getCasalId() != null && casaisMap.containsKey(m.getCasalId())) {
                Casal c = casaisMap.get(m.getCasalId());
                nomeResponsavel = c.getEsposo().nomeCompleto() + " e " + c.getEsposa().nomeCompleto();
            } else if (m.getSceId() != null) {
                nomeResponsavel = "SCE " + m.getSceId();
            }

            String nomeInstancia = "Não informada";
            if (m.getNivelInstancia() == NivelInstancia.INTERNACIONAL) {
                nomeInstancia = "Equipe Responsável Internacional (ERI)";
            } else if (m.getNivelInstancia() == NivelInstancia.EQUIPE && equipesMap.containsKey(m.getInstanciaId())) {
                Equipe eq = equipesMap.get(m.getInstanciaId());
                nomeInstancia = "Equipe " + eq.getNumero() + " (" + eq.getNomeDevocao() + ")";
            } else if (estruturasMap.containsKey(m.getInstanciaId())) {
                nomeInstancia = estruturasMap.get(m.getInstanciaId()).nome();
            }

            return MandatoDto.from(m, nomeResponsavel, nomeInstancia);
        }).toList();
    }

    private String resolverNomeResponsavel(String casalId, String sceId) {
        if (casalId != null) {
            return casalRepository.findById(casalId)
                    .map(c -> c.getEsposo().nomeCompleto() + " e " + c.getEsposa().nomeCompleto())
                    .orElse("Casal não localizado");
        }
        if (sceId != null) {
            return "SCE " + sceId;
        }
        return "Não informado";
    }

    private String resolverNomeInstancia(NivelInstancia nivel, String instanciaId) {
        if (nivel == NivelInstancia.INTERNACIONAL) {
            return "Equipe Responsável Internacional (ERI)";
        }
        if (nivel == NivelInstancia.EQUIPE) {
            return equipeRepository.findById(instanciaId)
                    .map(eq -> "Equipe " + eq.getNumero() + " (" + eq.getNomeDevocao() + ")")
                    .orElse("Equipe não localizada");
        }
        return estruturaRepository.findById(instanciaId)
                .map(NoEstrutura::nome)
                .orElse("Instância não localizada");
    }
}
