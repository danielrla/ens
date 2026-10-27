package br.org.ens.casal;

import br.org.ens.casal.movimentacao.MovimentacaoDto;
import br.org.ens.casal.movimentacao.MovimentacaoRequest;
import br.org.ens.comum.PageResponse;
import br.org.ens.mandato.MandatoDto;
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
@RequestMapping("/casais")
public class CasalController {

    private final CasalService service;

    public CasalController(CasalService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CasalDto criar(@Valid @RequestBody CasalRequest request) {
        return service.criar(request);
    }

    @GetMapping
    public PageResponse<CasalDto> listar(
            @RequestParam(required = false) String busca,
            @RequestParam(required = false) StatusCasal status,
            @RequestParam(required = false) String equipeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return service.listar(busca, status, equipeId, null, null, null, page, size);
    }

    @GetMapping("/perfil")
    public CasalDto obterPerfil() {
        return service.obterPerfilLogado();
    }

    @PutMapping("/perfil")
    public CasalDto atualizarPerfil(@Valid @RequestBody CasalRequest request) {
        return service.atualizarPerfilLogado(request);
    }

    @GetMapping("/{id}")
    public CasalDto obterPorId(@PathVariable String id) {
        return service.obterPorId(id);
    }

    @PutMapping("/{id}")
    public CasalDto atualizar(@PathVariable String id, @Valid @RequestBody CasalRequest request) {
        return service.atualizar(id, request);
    }

    @PostMapping("/{id}/inativar")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void inativar(@PathVariable String id, @Valid @RequestBody InativacaoRequest request) {
        service.inativar(id, request);
    }

    @PostMapping("/{id}/transferir")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void transferir(@PathVariable String id, @Valid @RequestBody TransferenciaRequest request) {
        service.transferir(id, request);
    }

    @PostMapping("/{id}/movimentacoes")
    @ResponseStatus(HttpStatus.CREATED)
    public MovimentacaoDto registrarMovimentacao(@PathVariable String id, @Valid @RequestBody MovimentacaoRequest request) {
        return service.registrarMovimentacao(id, request);
    }

    @GetMapping("/{id}/movimentacoes")
    public List<MovimentacaoDto> listarMovimentacoes(@PathVariable String id) {
        return service.listarMovimentacoes(id);
    }

    @GetMapping("/{id}/mandatos")
    public List<MandatoDto> listarMandatos(@PathVariable String id) {
        return service.listarMandatos(id);
    }
}
