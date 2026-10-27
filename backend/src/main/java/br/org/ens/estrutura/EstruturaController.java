package br.org.ens.estrutura;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoints de gestão e consulta da estrutura hierárquica territorial da ENS.
 */
@RestController
@RequestMapping("/estrutura")
public class EstruturaController {

    private final EstruturaService service;

    public EstruturaController(EstruturaService service) {
        this.service = service;
    }

    @GetMapping("/arvore")
    public List<NoArvoreDto> obterArvore(@RequestParam(required = false) String raizId,
                                        @RequestParam(required = false) NivelEstrutura nivel) {
        return service.obterArvore(raizId, nivel);
    }

    @GetMapping("/detalhe/{id}")
    public NoEstrutura obterPorId(@PathVariable String id) {
        return service.obterPorId(id);
    }

    @GetMapping("/{nivel}")
    public List<NoEstrutura> listar(@PathVariable NivelEstrutura nivel,
                                    @RequestParam(required = false) String paiId) {
        return service.listar(nivel, paiId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NoEstrutura criar(@Valid @RequestBody NoEstruturaRequest request) {
        return service.criar(request);
    }

    @PutMapping("/{id}")
    public NoEstrutura atualizar(@PathVariable String id, @Valid @RequestBody NoEstruturaRequest request) {
        return service.atualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable String id) {
        service.excluir(id);
    }
}
