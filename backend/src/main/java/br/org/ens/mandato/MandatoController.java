package br.org.ens.mandato;

import br.org.ens.comum.PageResponse;
import jakarta.validation.Valid;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/mandatos")
public class MandatoController {

    private final MandatoService mandatoService;

    public MandatoController(MandatoService mandatoService) {
        this.mandatoService = mandatoService;
    }

    @GetMapping
    public PageResponse<MandatoDto> listar(
            @RequestParam(required = false) FuncaoMandato funcao,
            @RequestParam(required = false) StatusMandato status,
            @RequestParam(required = false) NivelInstancia nivelInstancia,
            @RequestParam(required = false) String instanciaId,
            @RequestParam(required = false) AlertaMandato alerta,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return mandatoService.listar(funcao, status, nivelInstancia, instanciaId, alerta, page, size);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MandatoDto criar(@Valid @RequestBody MandatoRequest request) {
        return mandatoService.criar(request);
    }

    @GetMapping("/prazo-sugerido")
    public PrazoSugeridoDto obterPrazoSugerido(
            @RequestParam FuncaoMandato funcao,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio) {
        return mandatoService.calcularPrazoSugerido(funcao, dataInicio);
    }

    @GetMapping("/{id}")
    public MandatoDto buscarPorId(@PathVariable String id) {
        return mandatoService.buscarPorId(id);
    }

    @PostMapping("/{id}/interromper")
    public MandatoDto interromper(@PathVariable String id, @Valid @RequestBody InterrupcaoRequest request) {
        return mandatoService.interromper(id, request);
    }
}
