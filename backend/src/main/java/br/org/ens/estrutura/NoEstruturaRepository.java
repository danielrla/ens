package br.org.ens.estrutura;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface NoEstruturaRepository extends MongoRepository<NoEstrutura, String> {

    List<NoEstrutura> findByNivelOrderByNome(NivelEstrutura nivel);

    List<NoEstrutura> findByNivelAndPaiIdOrderByNome(NivelEstrutura nivel, String paiId);

    List<NoEstrutura> findByPaiIdOrderByNome(String paiId);

    boolean existsByPaiId(String paiId);

    java.util.Optional<NoEstrutura> findByNomeAndNivelAndPaiId(String nome, NivelEstrutura nivel, String paiId);

    java.util.Optional<NoEstrutura> findByNomeAndNivel(String nome, NivelEstrutura nivel);
}
