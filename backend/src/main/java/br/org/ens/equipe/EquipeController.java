package br.org.ens.equipe;

import br.org.ens.comum.PageResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/equipes")
public class EquipeController {

    private final EquipeService service;

    public EquipeController(EquipeService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EquipeDetalheDto criar(@Valid @RequestBody EquipeRequest request) {
        return service.criar(request);
    }

    @GetMapping
    public PageResponse<EquipeResumoDto> listar(
            @RequestParam(required = false) String superRegiaoId,
            @RequestParam(required = false) String provinciaId,
            @RequestParam(required = false) String regiaoId,
            @RequestParam(required = false) String setorId,
            @RequestParam(required = false) String equipeId,
            @RequestParam(required = false) StatusEquipe status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return service.listar(superRegiaoId, provinciaId, regiaoId, setorId, equipeId, status, page, size);
    }

    @GetMapping("/{id}")
    public EquipeDetalheDto obterPorId(@PathVariable String id) {
        return service.obterPorId(id);
    }

    @PutMapping("/{id}")
    public EquipeDetalheDto atualizar(@PathVariable String id, @Valid @RequestBody EquipeRequest request) {
        return service.atualizar(id, request);
    }

    @PostMapping("/{id}/arquivar")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void arquivar(@PathVariable String id) {
        service.arquivar(id);
    }

    @PutMapping("/{id}/vinculos")
    public EquipeDetalheDto atualizarVinculos(
            @PathVariable String id,
            @Valid @RequestBody List<VinculoRequest> vinculos) {
        return service.atualizarVinculos(id, vinculos);
    }
}
