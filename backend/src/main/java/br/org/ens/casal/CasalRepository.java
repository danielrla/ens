package br.org.ens.casal;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CasalRepository extends MongoRepository<Casal, String> {

    List<Casal> findByEquipeId(String equipeId);

    long countByEquipeIdAndStatus(String equipeId, StatusCasal status);

    java.util.Optional<Casal> findByEsposoNomeCompletoOrEsposaNomeCompleto(String nomeEsposo, String nomeEsposa);

    java.util.Optional<Casal> findFirstByEsposoEmail(String email);
}
