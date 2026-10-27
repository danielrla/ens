package br.org.ens.mural;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MomentoMuralController {

    private final MomentoMuralService service;

    public MomentoMuralController(MomentoMuralService service) {
        this.service = service;
    }

    @GetMapping("/mural/meu-mural")
    public List<MomentoMuralDto> listarMeuMural() {
        return service.listarMinhaEquipe();
    }

    @PostMapping("/mural/meu-mural")
    @ResponseStatus(HttpStatus.CREATED)
    public MomentoMuralDto registrarMeuMural(@Valid @RequestBody MomentoMuralRequest request) {
        return service.registrarMinhaEquipe(request);
    }

    @GetMapping("/equipes/{equipeId}/mural")
    public List<MomentoMuralDto> listarPorEquipe(@PathVariable String equipeId) {
        return service.listarPorEquipe(equipeId);
    }

    @PostMapping("/equipes/{equipeId}/mural")
    @ResponseStatus(HttpStatus.CREATED)
    public MomentoMuralDto registrar(@PathVariable String equipeId, @Valid @RequestBody MomentoMuralRequest request) {
        return service.registrar(equipeId, request);
    }

    @PutMapping("/mural/{id}")
    public MomentoMuralDto atualizar(@PathVariable String id, @Valid @RequestBody MomentoMuralRequest request) {
        return service.atualizar(id, request);
    }

    @DeleteMapping("/mural/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable String id) {
        service.excluir(id);
    }
}
