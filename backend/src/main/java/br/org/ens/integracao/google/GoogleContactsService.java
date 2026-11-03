package br.org.ens.integracao.google;

import br.org.ens.casal.Casal;
import br.org.ens.casal.CasalRepository;
import br.org.ens.casal.Endereco;
import br.org.ens.casal.Pessoa;
import br.org.ens.casal.StatusCasal;
import br.org.ens.equipe.Equipe;
import br.org.ens.equipe.EquipeRepository;
import br.org.ens.integracao.google.dto.SincronizacaoResultadoDto;
import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.services.people.v1.PeopleService;
import com.google.api.services.people.v1.model.Address;
import com.google.api.services.people.v1.model.ContactGroup;
import com.google.api.services.people.v1.model.ContactGroupMembership;
import com.google.api.services.people.v1.model.CreateContactGroupRequest;
import com.google.api.services.people.v1.model.EmailAddress;
import com.google.api.services.people.v1.model.ListContactGroupsResponse;
import com.google.api.services.people.v1.model.Membership;
import com.google.api.services.people.v1.model.Name;
import com.google.api.services.people.v1.model.Person;
import com.google.api.services.people.v1.model.PhoneNumber;
import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class GoogleContactsService {

    private static final Logger log = LoggerFactory.getLogger(GoogleContactsService.class);
    private static final String APP_NAME = "ENS-Gestao";
    private static final String GRUPO_PADRAO = "ENS - Equipe";

    private final GoogleAuthService authService;
    private final CasalRepository casalRepository;
    private final EquipeRepository equipeRepository;

    public GoogleContactsService(
            GoogleAuthService authService,
            CasalRepository casalRepository,
            EquipeRepository equipeRepository) {
        this.authService = authService;
        this.casalRepository = casalRepository;
        this.equipeRepository = equipeRepository;
    }

    public SincronizacaoResultadoDto sincronizarContatos(String casalId, String equipeId) {
        ConexaoGoogle conexao = authService.buscarConexao(casalId)
                .orElseThrow(() -> new IllegalStateException("Conta Google não conectada."));

        GoogleCredential credential = authService.obterCredencialValida(casalId);

        PeopleService peopleService = new PeopleService.Builder(
                authService.getHttpTransport(),
                authService.getJsonFactory(),
                credential)
                .setApplicationName(APP_NAME)
                .build();

        try {
            String grupoResourceName = obterOuCriarGrupoEquipe(peopleService, conexao, equipeId);
            List<String> detalhes = new ArrayList<>();
            int totalSincronizados = 0;

            if (equipeId != null && !equipeId.isBlank()) {
                List<Casal> casais = casalRepository.findByEquipeId(equipeId).stream()
                        .filter(c -> c.getStatus() == StatusCasal.ATIVO)
                        .toList();

                for (Casal casal : casais) {
                    // Sincroniza esposo
                    if (casal.getEsposo() != null && casal.getEsposo().nomeCompleto() != null) {
                        Person personEsposo = montarPessoa(casal.getEsposo(), casal.getEndereco(), casal.getEsposa() != null ? casal.getEsposa().nomeCompleto() : "", grupoResourceName);
                        if (casal.getGoogleContactIdEsposo() != null && !casal.getGoogleContactIdEsposo().isBlank()) {
                            try {
                                peopleService.people().updateContact(casal.getGoogleContactIdEsposo(), personEsposo)
                                        .setUpdatePersonFields("names,emailAddresses,phoneNumbers,addresses,memberships")
                                        .execute();
                                detalhes.add("Contato de " + casal.getEsposo().nomeCompleto() + " atualizado.");
                            } catch (IOException e) {
                                Person criado = peopleService.people().createContact(personEsposo).execute();
                                casal.setGoogleContactIdEsposo(criado.getResourceName());
                                detalhes.add("Contato de " + casal.getEsposo().nomeCompleto() + " recriado.");
                            }
                        } else {
                            Person criado = peopleService.people().createContact(personEsposo).execute();
                            casal.setGoogleContactIdEsposo(criado.getResourceName());
                            detalhes.add("Contato de " + casal.getEsposo().nomeCompleto() + " inserido.");
                        }
                        totalSincronizados++;
                    }

                    // Sincroniza esposa
                    if (casal.getEsposa() != null && casal.getEsposa().nomeCompleto() != null) {
                        Person personEsposa = montarPessoa(casal.getEsposa(), casal.getEndereco(), casal.getEsposo() != null ? casal.getEsposo().nomeCompleto() : "", grupoResourceName);
                        if (casal.getGoogleContactIdEsposa() != null && !casal.getGoogleContactIdEsposa().isBlank()) {
                            try {
                                peopleService.people().updateContact(casal.getGoogleContactIdEsposa(), personEsposa)
                                        .setUpdatePersonFields("names,emailAddresses,phoneNumbers,addresses,memberships")
                                        .execute();
                                detalhes.add("Contato de " + casal.getEsposa().nomeCompleto() + " atualizado.");
                            } catch (IOException e) {
                                Person criado = peopleService.people().createContact(personEsposa).execute();
                                casal.setGoogleContactIdEsposa(criado.getResourceName());
                                detalhes.add("Contato de " + casal.getEsposa().nomeCompleto() + " recriado.");
                            }
                        } else {
                            Person criado = peopleService.people().createContact(personEsposa).execute();
                            casal.setGoogleContactIdEsposa(criado.getResourceName());
                            detalhes.add("Contato de " + casal.getEsposa().nomeCompleto() + " inserido.");
                        }
                        totalSincronizados++;
                    }

                    casalRepository.save(casal);
                }
            }

            conexao.setGrupoContatosResourceName(grupoResourceName);
            conexao.setUltimaSincronizacaoContatos(Instant.now());
            authService.atualizarConexao(conexao);

            return SincronizacaoResultadoDto.sucesso(
                    "Sincronização com Google Contatos concluída com sucesso.",
                    totalSincronizados,
                    detalhes
            );
        } catch (IOException e) {
            log.error("Erro ao sincronizar membros com o Google People API", e);
            return SincronizacaoResultadoDto.erro("Falha ao comunicar com a Google People API: " + e.getMessage(), List.of());
        }
    }

    private String obterOuCriarGrupoEquipe(PeopleService service, ConexaoGoogle conexao, String equipeId) throws IOException {
        String nomeGrupoDesejado = GRUPO_PADRAO;
        if (equipeId != null && !equipeId.isBlank()) {
            nomeGrupoDesejado = equipeRepository.findById(equipeId)
                    .map(eq -> "ENS - " + eq.getNomeDevocao())
                    .orElse(GRUPO_PADRAO);
        }

        if (conexao.getGrupoContatosResourceName() != null && !conexao.getGrupoContatosResourceName().isBlank()) {
            try {
                ContactGroup grupo = service.contactGroups().get(conexao.getGrupoContatosResourceName()).execute();
                if (grupo != null && grupo.getResourceName() != null) {
                    return grupo.getResourceName();
                }
            } catch (IOException e) {
                log.warn("Grupo de contatos anterior não encontrado ({}), criando ou buscando por nome.", conexao.getGrupoContatosResourceName());
            }
        }

        ListContactGroupsResponse response = service.contactGroups().list().execute();
        if (response.getContactGroups() != null) {
            for (ContactGroup g : response.getContactGroups()) {
                if (nomeGrupoDesejado.equalsIgnoreCase(g.getName()) || GRUPO_PADRAO.equalsIgnoreCase(g.getName())) {
                    return g.getResourceName();
                }
            }
        }

        ContactGroup novo = new ContactGroup();
        novo.setName(nomeGrupoDesejado);
        CreateContactGroupRequest request = new CreateContactGroupRequest().setContactGroup(novo);
        ContactGroup criado = service.contactGroups().create(request).execute();
        log.info("Marcador/Grupo criado no Google Contatos: {} ({})", criado.getName(), criado.getResourceName());
        return criado.getResourceName();
    }

    private Person montarPessoa(Pessoa pessoa, Endereco endereco, String nomeConjuge, String grupoResourceName) {
        Person person = new Person();

        // Nome
        Name name = new Name();
        name.setGivenName(pessoa.nomeCompleto());
        name.setDisplayName(pessoa.nomeCompleto() + " (ENS)");
        person.setNames(List.of(name));

        // E-mail
        if (pessoa.email() != null && !pessoa.email().isBlank()) {
            EmailAddress email = new EmailAddress();
            email.setValue(pessoa.email());
            email.setType("home");
            person.setEmailAddresses(List.of(email));
        }

        // Telefone
        if (pessoa.celular() != null && !pessoa.celular().isBlank()) {
            PhoneNumber phone = new PhoneNumber();
            phone.setValue(pessoa.celular());
            phone.setType("mobile");
            person.setPhoneNumbers(List.of(phone));
        }

        // Endereço
        if (endereco != null) {
            Address address = new Address();
            StringBuilder rua = new StringBuilder();
            if (endereco.logradouro() != null) rua.append(endereco.logradouro());
            if (endereco.numero() != null) rua.append(", ").append(endereco.numero());
            if (endereco.bairro() != null) rua.append(" - ").append(endereco.bairro());
            address.setStreetAddress(rua.toString());
            address.setCity(endereco.cidade());
            address.setRegion(endereco.uf());
            address.setPostalCode(endereco.cep());
            address.setType("home");
            person.setAddresses(List.of(address));
        }

        // Associação ao marcador/grupo da equipe
        if (grupoResourceName != null && !grupoResourceName.isBlank()) {
            Membership membership = new Membership();
            membership.setContactGroupMembership(new ContactGroupMembership().setContactGroupResourceName(grupoResourceName));
            person.setMemberships(List.of(membership));
        }

        return person;
    }
}
