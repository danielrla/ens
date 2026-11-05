package br.org.ens.email;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LogEnvioEmailRepository extends MongoRepository<LogEnvioEmail, String> {
    List<LogEnvioEmail> findTop50ByOrderByDataHoraDesc();
}

