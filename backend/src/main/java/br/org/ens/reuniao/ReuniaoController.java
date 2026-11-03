package br.org.ens.reuniao;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ReuniaoController {

    private final ReuniaoService reuniaoService;

    public ReuniaoController(ReuniaoService reuniaoService) {
        this.reuniaoService = reuniaoService;
    }

    @PostMapping("/equipes/{equipeId}/reunioes")
    @ResponseStatus(HttpStatus.CREATED)
    public ReuniaoDto agendarNaEquipe(@PathVariable String equipeId, @Valid @RequestBody ReuniaoRequest request) {
        return reuniaoService.registrar(equipeId, request);
    }

    @GetMapping("/equipes/{equipeId}/reunioes")
    public List<ReuniaoDto> listarPorEquipe(@PathVariable String equipeId) {
        return reuniaoService.listarPorEquipe(equipeId);
    }

    @GetMapping("/reunioes/minha-equipe")
    public List<ReuniaoDto> listarMinhaEquipe() {
        return reuniaoService.listarMinhaEquipe();
    }

    @GetMapping("/reunioes")
    public List<ReuniaoDto> listarTodas(@RequestParam(required = false) String equipeId) {
        return reuniaoService.listarTodas(equipeId);
    }

    @GetMapping("/reunioes/{id}")
    public ReuniaoDto obterPorId(@PathVariable String id) {
        return reuniaoService.obterPorId(id);
    }

    @PutMapping("/reunioes/{id}")
    public ReuniaoDto atualizar(@PathVariable String id, @Valid @RequestBody ReuniaoRequest request) {
        return reuniaoService.atualizar(id, request);
    }

    @PutMapping("/reunioes/{id}/presencas")
    public ReuniaoDto registrarPresencas(@PathVariable String id, @RequestBody RegistroPresencaRequest request) {
        return reuniaoService.registrarPresencas(id, request);
    }

    @DeleteMapping("/reunioes/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable String id) {
        reuniaoService.excluir(id);
    }
}
