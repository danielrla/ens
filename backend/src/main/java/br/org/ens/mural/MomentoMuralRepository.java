package br.org.ens.mural;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MomentoMuralRepository extends MongoRepository<MomentoMural, String> {

    List<MomentoMural> findByEquipeIdOrderByDataDesc(String equipeId);

    void deleteByEquipeId(String equipeId);
}
