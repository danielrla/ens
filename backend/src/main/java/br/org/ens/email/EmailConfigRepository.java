package br.org.ens.email;

import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmailConfigRepository extends MongoRepository<EmailConfig, String> {
    Optional<EmailConfig> findFirstByOrderByIdAsc();
}

