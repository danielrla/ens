package br.org.ens.equipe;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface EquipeRepository extends MongoRepository<Equipe, String> {

    List<Equipe> findBySetorIdAndStatusOrderByNumero(String setorId, StatusEquipe status);

    List<Equipe> findBySetorId(String setorId);

    boolean existsBySetorIdAndNumero(String setorId, Integer numero);

    boolean existsBySetorId(String setorId);

    boolean existsByRegiaoId(String regiaoId);

    boolean existsByProvinciaId(String provinciaId);

    boolean existsBySuperRegiaoId(String superRegiaoId);

    java.util.Optional<Equipe> findByNomeDevocao(String nomeDevocao);

    java.util.Optional<Equipe> findByNomeDevocaoAndSetorId(String nomeDevocao, String setorId);
}
