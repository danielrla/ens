package br.org.ens.usuario;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UsuarioRepository extends MongoRepository<Usuario, String> {

    Optional<Usuario> findByEmailIgnoreCase(String email);

    Optional<Usuario> findByTokenResetSenha(String tokenResetSenha);

    Optional<Usuario> findByCasalId(String casalId);

    Optional<Usuario> findBySceId(String sceId);

    List<Usuario> findByEquipeId(String equipeId);

    boolean existsByEmailIgnoreCase(String email);

    Page<Usuario> findByNomeContainingIgnoreCaseOrEmailContainingIgnoreCase(String nome, String email, Pageable pageable);
}
