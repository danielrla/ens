package br.org.ens.mandato;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MandatoRepository extends MongoRepository<Mandato, String> {

    List<Mandato> findByInstanciaIdAndFuncaoAndStatus(String instanciaId, FuncaoMandato funcao, StatusMandato status);

    List<Mandato> findByCasalId(String casalId);

    List<Mandato> findByStatus(StatusMandato status);
}
