package br.org.ens.mural;

import br.org.ens.casal.CasalDto;
import br.org.ens.casal.CasalService;
import br.org.ens.equipe.EquipeRepository;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class MomentoMuralService {

    private final MomentoMuralRepository momentoMuralRepository;
    private final EquipeRepository equipeRepository;
    private final CasalService casalService;

    public MomentoMuralService(MomentoMuralRepository momentoMuralRepository,
                               EquipeRepository equipeRepository,
                               CasalService casalService) {
        this.momentoMuralRepository = momentoMuralRepository;
        this.equipeRepository = equipeRepository;
        this.casalService = casalService;
    }

    public List<MomentoMuralDto> listarMinhaEquipe() {
        CasalDto perfil = casalService.obterPerfilLogado();
        if (perfil.equipeId() == null || perfil.equipeId().isBlank()) {
            return List.of();
        }
        return listarPorEquipe(perfil.equipeId());
    }

    public MomentoMuralDto registrarMinhaEquipe(MomentoMuralRequest request) {
        CasalDto perfil = casalService.obterPerfilLogado();
        if (perfil.equipeId() == null || perfil.equipeId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O casal logado não possui equipe vinculada para registrar momentos no mural");
        }
        String autorNome = request.autorNome();
        if (autorNome == null || autorNome.isBlank()) {
            autorNome = perfil.nomeCasal();
        }
        String autorCasalId = request.autorCasalId();
        if (autorCasalId == null || autorCasalId.isBlank()) {
            autorCasalId = perfil.id();
        }

        MomentoMuralRequest requestComAutor = new MomentoMuralRequest(
                request.titulo(),
                request.data(),
                request.categoria(),
                request.descricao(),
                request.fotos(),
                autorCasalId,
                autorNome
        );

        return registrar(perfil.equipeId(), requestComAutor);
    }

    public List<MomentoMuralDto> listarPorEquipe(String equipeId) {
        if (!equipeRepository.existsById(equipeId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Equipe não encontrada: " + equipeId);
        }
        return momentoMuralRepository.findByEquipeIdOrderByDataDesc(equipeId).stream()
                .map(MomentoMuralDto::from)
                .toList();
    }

    public MomentoMuralDto registrar(String equipeId, MomentoMuralRequest request) {
        if (!equipeRepository.existsById(equipeId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Equipe não encontrada: " + equipeId);
        }

        MomentoMural momento = new MomentoMural();
        momento.setEquipeId(equipeId);
        momento.setTitulo(request.titulo().trim());
        momento.setData(request.data());
        momento.setCategoria(request.categoria() != null && !request.categoria().isBlank() ? request.categoria().trim() : "REUNIAO_MENSAL");
        momento.setDescricao(request.descricao() != null ? request.descricao().trim() : "");
        momento.setFotos(request.fotos() != null ? request.fotos() : new ArrayList<>());
        momento.setAutorCasalId(request.autorCasalId());
        momento.setAutorNome(request.autorNome());
        momento.setCriadoEm(LocalDateTime.now());

        MomentoMural salvo = momentoMuralRepository.save(momento);
        return MomentoMuralDto.from(salvo);
    }

    public MomentoMuralDto atualizar(String id, MomentoMuralRequest request) {
        MomentoMural momento = momentoMuralRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Momento não encontrado: " + id));

        momento.setTitulo(request.titulo().trim());
        momento.setData(request.data());
        if (request.categoria() != null && !request.categoria().isBlank()) {
            momento.setCategoria(request.categoria().trim());
        }
        momento.setDescricao(request.descricao() != null ? request.descricao().trim() : "");
        if (request.fotos() != null) {
            momento.setFotos(request.fotos());
        }
        if (request.autorNome() != null) {
            momento.setAutorNome(request.autorNome());
        }

        MomentoMural salvo = momentoMuralRepository.save(momento);
        return MomentoMuralDto.from(salvo);
    }

    public void excluir(String id) {
        if (!momentoMuralRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Momento não encontrado: " + id);
        }
        momentoMuralRepository.deleteById(id);
    }
}
