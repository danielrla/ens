package br.org.ens.casal;

import br.org.ens.casal.movimentacao.MovimentacaoCasal;
import br.org.ens.casal.movimentacao.MovimentacaoCasalRepository;
import br.org.ens.casal.movimentacao.MovimentacaoDto;
import br.org.ens.casal.movimentacao.MovimentacaoRequest;
import br.org.ens.casal.movimentacao.TipoMovimentacao;
import br.org.ens.comum.PageResponse;
import br.org.ens.equipe.Equipe;
import br.org.ens.equipe.EquipeRepository;
import br.org.ens.equipe.PapelVinculo;
import br.org.ens.equipe.Vinculo;
import br.org.ens.mandato.MandatoDto;
import br.org.ens.mandato.MandatoService;
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
import org.springframework.web.server.ResponseStatusException;

@Service
public class CasalService {

    private final CasalRepository casalRepository;
    private final EquipeRepository equipeRepository;
    private final MovimentacaoCasalRepository movimentacaoRepository;
    private final MandatoService mandatoService;
    private final MongoTemplate mongoTemplate;

    public CasalService(CasalRepository casalRepository,
                        EquipeRepository equipeRepository,
                        MovimentacaoCasalRepository movimentacaoRepository,
                        MandatoService mandatoService,
                        MongoTemplate mongoTemplate) {
        this.casalRepository = casalRepository;
        this.equipeRepository = equipeRepository;
        this.movimentacaoRepository = movimentacaoRepository;
        this.mandatoService = mandatoService;
        this.mongoTemplate = mongoTemplate;
    }

    public CasalDto criar(CasalRequest request) {
        Casal casal = new Casal();
        atualizarCampos(casal, request);

        Casal salvo = casalRepository.save(casal);

        if (salvo.getEquipeId() != null && !salvo.getEquipeId().isBlank()) {
            vincularNaEquipe(salvo.getEquipeId(), salvo.getId(), PapelVinculo.MEMBRO);
        }

        String nomeEquipe = resolverNomeEquipe(salvo.getEquipeId());
        return CasalDto.from(salvo, nomeEquipe);
    }

    public CasalDto atualizar(String id, CasalRequest request) {
        Casal casal = buscarOuFalhar(id);
        String equipeAnterior = casal.getEquipeId();

        atualizarCampos(casal, request);
        Casal salvo = casalRepository.save(casal);

        if (equipeAnterior != null && !equipeAnterior.equals(salvo.getEquipeId())) {
            desvincularDaEquipe(equipeAnterior, id);
            if (salvo.getEquipeId() != null && !salvo.getEquipeId().isBlank()) {
                vincularNaEquipe(salvo.getEquipeId(), id, PapelVinculo.MEMBRO);
            }
        }

        String nomeEquipe = resolverNomeEquipe(salvo.getEquipeId());
        return CasalDto.from(salvo, nomeEquipe);
    }

    public CasalDto obterPorId(String id) {
        Casal casal = buscarOuFalhar(id);
        String nomeEquipe = resolverNomeEquipe(casal.getEquipeId());
        return CasalDto.from(casal, nomeEquipe);
    }

    public CasalDto obterPerfilLogado() {
        Casal casal = casalRepository.findFirstByEsposoEmail("danielrla@gmail.com")
                .or(() -> casalRepository.findAll().stream().filter(c -> c.getStatus() == StatusCasal.ATIVO).findFirst())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nenhum perfil de casal ativo encontrado"));
        return CasalDto.from(casal, resolverNomeEquipe(casal.getEquipeId()));
    }

    public CasalDto atualizarPerfilLogado(CasalRequest request) {
        Casal casal = casalRepository.findFirstByEsposoEmail("danielrla@gmail.com")
                .or(() -> casalRepository.findAll().stream().filter(c -> c.getStatus() == StatusCasal.ATIVO).findFirst())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nenhum perfil de casal ativo encontrado"));
        return atualizar(casal.getId(), request);
    }

    public PageResponse<CasalDto> listar(String busca,
                                         StatusCasal status,
                                         String equipeId,
                                         String setorId,
                                         String regiaoId,
                                         String provinciaId,
                                         int page,
                                         int size) {
        Query query = new Query();
        List<Criteria> criteriaList = new ArrayList<>();

        if (busca != null && !busca.isBlank()) {
            String termo = busca.trim();
            criteriaList.add(new Criteria().orOperator(
                    Criteria.where("esposo.nomeCompleto").regex(termo, "i"),
                    Criteria.where("esposa.nomeCompleto").regex(termo, "i"),
                    Criteria.where("esposo.celular").regex(termo, "i"),
                    Criteria.where("esposa.celular").regex(termo, "i")
            ));
        }

        if (status != null) {
            criteriaList.add(Criteria.where("status").is(status));
        }

        if (equipeId != null && !equipeId.isBlank()) {
            criteriaList.add(Criteria.where("equipeId").is(equipeId));
        } else if (setorId != null && !setorId.isBlank()) {
            List<String> equipeIds = equipeRepository.findBySetorIdAndStatusOrderByNumero(setorId, null)
                    .stream().map(Equipe::getId).toList();
            criteriaList.add(Criteria.where("equipeId").in(equipeIds));
        }

        if (!criteriaList.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
        }

        long total = mongoTemplate.count(query, Casal.class);

        query.with(Sort.by(Sort.Direction.ASC, "esposo.nomeCompleto"));
        int pageNumber = Math.max(page, 0);
        int pageSize = size > 0 ? size : 20;
        query.with(PageRequest.of(pageNumber, pageSize));

        List<Casal> casais = mongoTemplate.find(query, Casal.class);
        Set<String> equipeIds = casais.stream()
                .map(Casal::getEquipeId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<String, String> nomesEquipes = equipeRepository.findAllById(equipeIds).stream()
                .collect(Collectors.toMap(Equipe::getId, eq -> "Equipe " + eq.getNumero() + " (" + eq.getNomeDevocao() + ")"));

        List<CasalDto> itens = casais.stream()
                .map(c -> CasalDto.from(c, c.getEquipeId() != null ? nomesEquipes.get(c.getEquipeId()) : null))
                .toList();

        int totalPages = (int) Math.ceil((double) total / pageSize);
        return new PageResponse<>(pageNumber, pageSize, total, totalPages, itens);
    }

    public void inativar(String id, InativacaoRequest request) {
        Casal casal = buscarOuFalhar(id);
        String equipeOrigem = casal.getEquipeId();
        casal.setStatus(StatusCasal.INATIVO);
        casal.setMotivoInativacao(request.motivo());

        if (casal.getEquipeId() != null) {
            desvincularDaEquipe(casal.getEquipeId(), id);
        }

        casalRepository.save(casal);

        MovimentacaoCasal mov = new MovimentacaoCasal(
                null, id, TipoMovimentacao.SAIDA_VOLUNTARIA, equipeOrigem, null,
                LocalDate.now(), request.motivo(), "Saída/Inativação registrada"
        );
        movimentacaoRepository.save(mov);
    }

    public void transferir(String id, TransferenciaRequest request) {
        Casal casal = buscarOuFalhar(id);
        String equipeOrigem = casal.getEquipeId();

        equipeRepository.findById(request.equipeDestinoId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Equipe destino não encontrada"));

        if (equipeOrigem != null) {
            desvincularDaEquipe(equipeOrigem, id);
        }

        casal.setEquipeId(request.equipeDestinoId());
        casalRepository.save(casal);

        PapelVinculo papel = request.papel() != null ? request.papel() : PapelVinculo.MEMBRO;
        vincularNaEquipe(request.equipeDestinoId(), id, papel);

        String motivo = (request.motivo() != null && !request.motivo().isBlank())
                ? request.motivo()
                : "Transferência de equipe";

        MovimentacaoCasal mov = new MovimentacaoCasal(
                null, id, TipoMovimentacao.TRANSFERENCIA, equipeOrigem, request.equipeDestinoId(),
                request.dataEfetiva() != null ? request.dataEfetiva() : LocalDate.now(),
                motivo, "Transferido como " + papel
        );
        movimentacaoRepository.save(mov);
    }

    public MovimentacaoDto registrarMovimentacao(String id, MovimentacaoRequest request) {
        Casal casal = buscarOuFalhar(id);
        String equipeOrigem = casal.getEquipeId();

        if (request.tipo() == TipoMovimentacao.TRANSFERENCIA || request.tipo() == TipoMovimentacao.REMANEJAMENTO) {
            if (request.equipeDestinoId() == null || request.equipeDestinoId().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Equipe destino é obrigatória para transferência ou remanejamento");
            }
            if (equipeOrigem != null) {
                desvincularDaEquipe(equipeOrigem, id);
            }
            casal.setEquipeId(request.equipeDestinoId());
            vincularNaEquipe(request.equipeDestinoId(), id, PapelVinculo.MEMBRO);
            casalRepository.save(casal);
        } else if (request.tipo() == TipoMovimentacao.SAIDA_VOLUNTARIA || request.tipo() == TipoMovimentacao.SAIDA) {
            casal.setStatus(StatusCasal.INATIVO);
            casal.setMotivoInativacao(request.motivo());
            if (equipeOrigem != null) {
                desvincularDaEquipe(equipeOrigem, id);
            }
            casalRepository.save(casal);
        } else if (request.tipo() == TipoMovimentacao.LICENCA) {
            casal.setStatus(StatusCasal.LICENCIADO);
            casalRepository.save(casal);
        } else if (request.tipo() == TipoMovimentacao.RETORNO) {
            casal.setStatus(StatusCasal.ATIVO);
            casalRepository.save(casal);
        } else if (request.tipo() == TipoMovimentacao.FALECIMENTO) {
            casal.setStatus(StatusCasal.VIUVO);
            casalRepository.save(casal);
        }

        MovimentacaoCasal mov = new MovimentacaoCasal(
                null, id, request.tipo(), equipeOrigem, request.equipeDestinoId(),
                request.data() != null ? request.data() : LocalDate.now(),
                request.motivo(), request.observacoes()
        );
        mov = movimentacaoRepository.save(mov);

        return mapearMovimentacaoDto(mov);
    }

    public List<MovimentacaoDto> listarMovimentacoes(String casalId) {
        List<MovimentacaoCasal> lista = movimentacaoRepository.findByCasalIdOrderByDataDesc(casalId);
        if (lista.isEmpty()) {
            return List.of();
        }

        Set<String> equipeIds = lista.stream()
                .flatMap(m -> java.util.stream.Stream.of(m.getEquipeOrigemId(), m.getEquipeDestinoId()))
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<String, Equipe> equipesMap = equipeRepository.findAllById(equipeIds).stream()
                .collect(Collectors.toMap(Equipe::getId, Function.identity()));

        return lista.stream().map(m -> {
            String nomeOrigem = m.getEquipeOrigemId() != null && equipesMap.containsKey(m.getEquipeOrigemId())
                    ? "Equipe " + equipesMap.get(m.getEquipeOrigemId()).getNumero() + " (" + equipesMap.get(m.getEquipeOrigemId()).getNomeDevocao() + ")"
                    : null;
            String nomeDestino = m.getEquipeDestinoId() != null && equipesMap.containsKey(m.getEquipeDestinoId())
                    ? "Equipe " + equipesMap.get(m.getEquipeDestinoId()).getNumero() + " (" + equipesMap.get(m.getEquipeDestinoId()).getNomeDevocao() + ")"
                    : null;
            return MovimentacaoDto.from(m, nomeOrigem, nomeDestino);
        }).toList();
    }

    public List<MandatoDto> listarMandatos(String casalId) {
        return mandatoService.listarPorCasal(casalId);
    }

    private MovimentacaoDto mapearMovimentacaoDto(MovimentacaoCasal m) {
        String nomeOrigem = m.getEquipeOrigemId() != null
                ? equipeRepository.findById(m.getEquipeOrigemId()).map(e -> "Equipe " + e.getNumero() + " (" + e.getNomeDevocao() + ")").orElse(null)
                : null;
        String nomeDestino = m.getEquipeDestinoId() != null
                ? equipeRepository.findById(m.getEquipeDestinoId()).map(e -> "Equipe " + e.getNumero() + " (" + e.getNomeDevocao() + ")").orElse(null)
                : null;
        return MovimentacaoDto.from(m, nomeOrigem, nomeDestino);
    }

    private Casal buscarOuFalhar(String id) {
        return casalRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Casal não encontrado"));
    }

    private void atualizarCampos(Casal casal, CasalRequest request) {
        casal.setEsposo(request.esposo());
        casal.setEsposa(request.esposa());
        casal.setDataMatrimonio(request.dataMatrimonio());
        casal.setParoquiaCasamento(request.paroquiaCasamento());
        casal.setRecebeCartaMensal(request.recebeCartaMensal());
        casal.setEndereco(request.endereco());

        // Se houver falecimento registrado, atualiza para VIUVO automaticamente
        boolean conjugeFalecido = (request.esposo() != null && request.esposo().isFalecido())
                || (request.esposa() != null && request.esposa().isFalecido());

        if (conjugeFalecido && (request.status() == null || request.status() == StatusCasal.ATIVO)) {
            casal.setStatus(StatusCasal.VIUVO);
        } else if (request.status() != null) {
            casal.setStatus(request.status());
        }

        casal.setEquipeId(request.equipeId());
        casal.setFotoUrl(request.fotoUrl());
        if (request.filhos() != null) {
            casal.setFilhos(request.filhos());
        }
    }

    private void vincularNaEquipe(String equipeId, String casalId, PapelVinculo papel) {
        equipeRepository.findById(equipeId).ifPresent(equipe -> {
            boolean jaExiste = equipe.getVinculos().stream()
                    .anyMatch(v -> casalId.equals(v.casalId()));
            if (!jaExiste) {
                equipe.getVinculos().add(new Vinculo(casalId, papel, LocalDate.now()));
                equipeRepository.save(equipe);
            }
        });
    }

    private void desvincularDaEquipe(String equipeId, String casalId) {
        equipeRepository.findById(equipeId).ifPresent(equipe -> {
            boolean removido = equipe.getVinculos().removeIf(v -> casalId.equals(v.casalId()));
            if (removido) {
                equipeRepository.save(equipe);
            }
        });
    }

    private String resolverNomeEquipe(String equipeId) {
        if (equipeId == null || equipeId.isBlank()) {
            return null;
        }
        return equipeRepository.findById(equipeId)
                .map(eq -> "Equipe " + eq.getNumero() + " (" + eq.getNomeDevocao() + ")")
                .orElse(null);
    }
}
