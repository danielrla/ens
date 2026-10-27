package br.org.ens.casal.movimentacao;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MovimentacaoCasalRepository extends MongoRepository<MovimentacaoCasal, String> {

    List<MovimentacaoCasal> findByCasalIdOrderByDataDesc(String casalId);
}
