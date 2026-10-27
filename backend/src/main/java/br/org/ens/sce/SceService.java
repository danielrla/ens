package br.org.ens.sce;

import br.org.ens.comum.PageResponse;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SceService {

    private final SceRepository sceRepository;

    public SceService(SceRepository sceRepository) {
        this.sceRepository = sceRepository;
    }

    public SceDto criar(SceRequest request) {
        Sce sce = new Sce();
        atualizarDados(sce, request);
        sce.setStatus("ATIVO");
        sce = sceRepository.save(sce);
        return SceDto.from(sce);
    }

    public SceDto atualizar(String id, SceRequest request) {
        Sce sce = buscarOuFalhar(id);
        atualizarDados(sce, request);
        sce = sceRepository.save(sce);
        return SceDto.from(sce);
    }

    public SceDto buscarPorId(String id) {
        return SceDto.from(buscarOuFalhar(id));
    }

    public PageResponse<SceDto> listar(String busca, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("nomeCompleto").ascending());
        Page<Sce> resultado;

        if (busca != null && !busca.isBlank()) {
            resultado = sceRepository.findByNomeCompletoContainingIgnoreCase(busca.trim(), pageRequest);
        } else {
            resultado = sceRepository.findAll(pageRequest);
        }

        return PageResponse.from(resultado.map(SceDto::from));
    }

    public List<SceDto> listarAtivos() {
        return sceRepository.findByStatus("ATIVO").stream()
                .map(SceDto::from)
                .toList();
    }

    public void inativar(String id) {
        Sce sce = buscarOuFalhar(id);
        sce.setStatus("INATIVO");
        sceRepository.save(sce);
    }

    private Sce buscarOuFalhar(String id) {
        return sceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sacerdote não encontrado"));
    }

    private void atualizarDados(Sce sce, SceRequest request) {
        sce.setNomeCompleto(request.nomeCompleto());
        sce.setTitulo(request.titulo());
        sce.setDioceseCongregacao(request.dioceseCongregacao());
        sce.setParoquia(request.paroquia());
        sce.setTelefones(request.telefones());
        sce.setEmail(request.email());
        sce.setFotoUrl(request.fotoUrl());
        sce.setDataNascimento(request.dataNascimento());
        sce.setDataOrdenacaoConsagracao(request.dataOrdenacaoConsagracao());
    }
}
