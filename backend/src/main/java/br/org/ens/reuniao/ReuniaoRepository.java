package br.org.ens.reuniao;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReuniaoRepository extends MongoRepository<Reuniao, String> {

    List<Reuniao> findByEquipeIdOrderByDataDesc(String equipeId);
}
