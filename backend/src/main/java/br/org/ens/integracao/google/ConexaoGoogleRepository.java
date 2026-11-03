package br.org.ens.integracao.google;

import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ConexaoGoogleRepository extends MongoRepository<ConexaoGoogle, String> {

    Optional<ConexaoGoogle> findByCasalId(String casalId);

    void deleteByCasalId(String casalId);
}
