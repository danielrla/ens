package br.org.ens.sce;

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
@RequestMapping("/sce")
public class SceController {

    private final SceService sceService;

    public SceController(SceService sceService) {
        this.sceService = sceService;
    }

    @GetMapping
    public PageResponse<SceDto> listar(
            @RequestParam(required = false) String busca,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return sceService.listar(busca, page, size);
    }

    @GetMapping("/ativos")
    public List<SceDto> listarAtivos() {
        return sceService.listarAtivos();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SceDto criar(@Valid @RequestBody SceRequest request) {
        return sceService.criar(request);
    }

    @GetMapping("/{id}")
    public SceDto buscarPorId(@PathVariable String id) {
        return sceService.buscarPorId(id);
    }

    @PutMapping("/{id}")
    public SceDto atualizar(@PathVariable String id, @Valid @RequestBody SceRequest request) {
        return sceService.atualizar(id, request);
    }

    @PostMapping("/{id}/inativar")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void inativar(@PathVariable String id) {
        sceService.inativar(id);
    }
}
