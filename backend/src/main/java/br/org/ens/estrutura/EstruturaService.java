package br.org.ens.estrutura;

import br.org.ens.equipe.EquipeRepository;
import java.util.ArrayList;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class EstruturaService {

    private final NoEstruturaRepository repository;
    private final EquipeRepository equipeRepository;

    public EstruturaService(NoEstruturaRepository repository, EquipeRepository equipeRepository) {
        this.repository = repository;
        this.equipeRepository = equipeRepository;
    }

    public List<NoEstrutura> listar(NivelEstrutura nivel, String paiId) {
        if (nivel == NivelEstrutura.EQUIPE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Equipes são consultadas em /equipes");
        }
        if (nivel == NivelEstrutura.SUPER_REGIAO) {
            return repository.findByNivelOrderByNome(nivel);
        }
        if (paiId == null || paiId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "paiId é obrigatório para o nível " + nivel);
        }
        return repository.findByNivelAndPaiIdOrderByNome(nivel, paiId);
    }

    public NoEstrutura obterPorId(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nó de estrutura não encontrado: " + id));
    }

    public NoEstrutura criar(NoEstruturaRequest request) {
        validarRegrasNivel(request.nivel(), request.paiId());
        NoEstrutura novo = new NoEstrutura(null, request.nome().trim(), request.nivel(),
                request.nivel() == NivelEstrutura.SUPER_REGIAO ? null : request.paiId());
        return repository.save(novo);
    }

    public NoEstrutura atualizar(String id, NoEstruturaRequest request) {
        NoEstrutura existente = obterPorId(id);
        NivelEstrutura nivel = request.nivel() != null ? request.nivel() : existente.nivel();
        String paiId = nivel == NivelEstrutura.SUPER_REGIAO ? null : request.paiId();

        if (paiId != null && !paiId.equals(existente.paiId())) {
            validarRegrasNivel(nivel, paiId);
        }

        NoEstrutura atualizado = new NoEstrutura(id, request.nome().trim(), nivel, paiId);
        return repository.save(atualizado);
    }

    public void excluir(String id) {
        NoEstrutura no = obterPorId(id);

        if (repository.existsByPaiId(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Não é possível excluir " + no.nome() + " pois existem instâncias subordinadas vinculadas a ela.");
        }

        boolean possuiEquipes = switch (no.nivel()) {
            case SETOR -> equipeRepository.existsBySetorId(id);
            case REGIAO -> equipeRepository.existsByRegiaoId(id);
            case PROVINCIA -> equipeRepository.existsByProvinciaId(id);
            case SUPER_REGIAO -> equipeRepository.existsBySuperRegiaoId(id);
            case EQUIPE -> false;
        };

        if (possuiEquipes) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Não é possível excluir " + no.nome() + " pois existem equipes vinculadas a esta instância.");
        }

        repository.deleteById(id);
    }

    public List<NoArvoreDto> obterArvore(String raizId, NivelEstrutura nivel) {
        if (raizId != null && !raizId.isBlank()) {
            NoEstrutura raiz = obterPorId(raizId);
            return List.of(montarArvoreRecursiva(raiz));
        }

        NivelEstrutura nivelRaiz = nivel != null ? nivel : NivelEstrutura.SUPER_REGIAO;
        List<NoEstrutura> raizes = repository.findByNivelOrderByNome(nivelRaiz);
        List<NoArvoreDto> resultado = new ArrayList<>();
        for (NoEstrutura r : raizes) {
            resultado.add(montarArvoreRecursiva(r));
        }
        return resultado;
    }

    private NoArvoreDto montarArvoreRecursiva(NoEstrutura no) {
        List<NoEstrutura> filhosNos = repository.findByPaiIdOrderByNome(no.id());
        List<NoArvoreDto> filhosDtos = new ArrayList<>();
        for (NoEstrutura filho : filhosNos) {
            filhosDtos.add(montarArvoreRecursiva(filho));
        }
        return new NoArvoreDto(no.id(), no.nome(), no.nivel(), no.paiId(), filhosDtos.size(), filhosDtos);
    }

    private void validarRegrasNivel(NivelEstrutura nivel, String paiId) {
        if (nivel == NivelEstrutura.EQUIPE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Equipes possuem coleção e gerenciamento próprios.");
        }
        if (nivel == NivelEstrutura.SUPER_REGIAO) {
            if (paiId != null && !paiId.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Super-Região não pode possuir instância superior.");
            }
            return;
        }

        if (paiId == null || paiId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Instância superior (paiId) é obrigatória para o nível " + nivel);
        }

        NoEstrutura pai = repository.findById(paiId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Instância superior informada não existe: " + paiId));

        if (pai.nivel() != nivel.pai()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Instância superior incompatível: nível " + nivel + " exige pai do tipo " + nivel.pai() + ", mas recebeu " + pai.nivel());
        }
    }
}
