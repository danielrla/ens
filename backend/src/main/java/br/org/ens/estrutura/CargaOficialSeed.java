package br.org.ens.estrutura;

import br.org.ens.casal.Casal;
import br.org.ens.casal.CasalRepository;
import br.org.ens.casal.Endereco;
import br.org.ens.casal.Filho;
import br.org.ens.casal.Pessoa;
import br.org.ens.casal.StatusCasal;
import br.org.ens.equipe.Equipe;
import br.org.ens.equipe.EquipeRepository;
import br.org.ens.equipe.PapelVinculo;
import br.org.ens.equipe.StatusEquipe;
import br.org.ens.equipe.Vinculo;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CargaOficialSeed {

    private static final Logger log = LoggerFactory.getLogger(CargaOficialSeed.class);

    @Bean
    ApplicationRunner executarCargaInicial(NoEstruturaRepository noRepository,
                                          EquipeRepository equipeRepository,
                                          CasalRepository casalRepository) {
        return args -> {
            log.info("Iniciando verificação e carga de dados oficiais da ENS...");

            // 1. Super-Região
            NoEstrutura superRegiao = noRepository.findByNomeAndNivel("Super-Região Brasil", NivelEstrutura.SUPER_REGIAO)
                    .orElseGet(() -> noRepository.save(new NoEstrutura(null, "Super-Região Brasil", NivelEstrutura.SUPER_REGIAO, null)));

            // 2. Mapeamento Territorial Nacional
            Map<String, Map<String, List<String>>> estruturaTerritorial = getMapeamentoTerritorial();

            for (Map.Entry<String, Map<String, List<String>>> provEntry : estruturaTerritorial.entrySet()) {
                String nomeProvincia = provEntry.getKey();
                NoEstrutura provincia = noRepository.findByNomeAndNivelAndPaiId(nomeProvincia, NivelEstrutura.PROVINCIA, superRegiao.id())
                        .orElseGet(() -> noRepository.save(new NoEstrutura(null, nomeProvincia, NivelEstrutura.PROVINCIA, superRegiao.id())));

                for (Map.Entry<String, List<String>> regEntry : provEntry.getValue().entrySet()) {
                    String nomeRegiao = regEntry.getKey();
                    NoEstrutura regiao = noRepository.findByNomeAndNivelAndPaiId(nomeRegiao, NivelEstrutura.REGIAO, provincia.id())
                            .orElseGet(() -> noRepository.save(new NoEstrutura(null, nomeRegiao, NivelEstrutura.REGIAO, provincia.id())));

                    for (String nomeSetor : regEntry.getValue()) {
                        noRepository.findByNomeAndNivelAndPaiId(nomeSetor, NivelEstrutura.SETOR, regiao.id())
                                .orElseGet(() -> noRepository.save(new NoEstrutura(null, nomeSetor, NivelEstrutura.SETOR, regiao.id())));
                    }
                }
            }

            // 3. Localização do Setor Cuiabá Norte para a Equipe NOSSA SENHORA APARECIDA
            NoEstrutura provCO = noRepository.findByNomeAndNivelAndPaiId("Província Centro-Oeste (PCO)", NivelEstrutura.PROVINCIA, superRegiao.id()).orElseThrow();
            NoEstrutura regMT = noRepository.findByNomeAndNivelAndPaiId("Região Mato Grosso (MT)", NivelEstrutura.REGIAO, provCO.id()).orElseThrow();
            NoEstrutura setorCuiabaNorte = noRepository.findByNomeAndNivelAndPaiId("Cuiabá Norte", NivelEstrutura.SETOR, regMT.id()).orElseThrow();

            // 4. Limpeza de dados mock de equipes e casais fictícios
            equipeRepository.findAll().stream()
                    .filter(eq -> !"NOSSA SENHORA APARECIDA".equalsIgnoreCase(eq.getNomeDevocao()))
                    .forEach(eq -> equipeRepository.deleteById(eq.getId()));

            casalRepository.findAll().stream()
                    .filter(c -> c.getEsposo() != null &&
                            ("João Silva".equalsIgnoreCase(c.getEsposo().nomeCompleto()) ||
                             "Carlos Eduardo Santos".equalsIgnoreCase(c.getEsposo().nomeCompleto())))
                    .forEach(c -> casalRepository.deleteById(c.getId()));

            // 5. Configuração e Atualização da Equipe NOSSA SENHORA APARECIDA
            Equipe equipeAparecida = equipeRepository.findByNomeDevocao("NOSSA SENHORA APARECIDA")
                    .orElseGet(Equipe::new);
            equipeAparecida.setNomeDevocao("NOSSA SENHORA APARECIDA");
            equipeAparecida.setNumero(1);
            equipeAparecida.setSuperRegiaoId(superRegiao.id());
            equipeAparecida.setProvinciaId(provCO.id());
            equipeAparecida.setRegiaoId(regMT.id());
            equipeAparecida.setSetorId(setorCuiabaNorte.id());
            equipeAparecida.setStatus(StatusEquipe.ATIVA);
            equipeAparecida.setMunicipio("Cuiabá");
            equipeAparecida.setEstado("MT");
            if (equipeAparecida.getDataFundacao() == null) {
                equipeAparecida.setDataFundacao(LocalDate.of(2015, 10, 12));
            }
            equipeAparecida = equipeRepository.save(equipeAparecida);

            // 6. Carga dos 7 Casais do Quadrante 2026
            carregarCasaisAparecida(casalRepository, equipeRepository, equipeAparecida);

            log.info("Carga oficial da ENS concluída com sucesso.");
        };
    }

    private void carregarCasaisAparecida(CasalRepository casalRepository, EquipeRepository equipeRepository, Equipe equipe) {
        List<CasalDef> casaisDefs = List.of(
                new CasalDef(
                        new Pessoa("Daniel Rios lima Amaral", null, "danielrla@gmail.com", "(65) 98141-3622", LocalDate.of(1983, 9, 1), null, null),
                        new Pessoa("Aline Freire Pereira Rios", null, "allinefreire@gmail.com", "(65) 99912-7380", LocalDate.of(1981, 12, 17), null, null),
                        LocalDate.of(2008, 7, 27), null, null,
                        new Endereco("Av. das Palmeiras", "295", "Condomínio Rio jangada", "Jardim imperial", "Cuiaba", "MT", "78075903", null, null),
                        List.of(
                                new Filho("Matheus", LocalDate.of(2009, 6, 3)),
                                new Filho("Julia", LocalDate.of(2015, 7, 13)),
                                new Filho("Rafael", LocalDate.of(2018, 3, 6))
                        )
                ),
                new CasalDef(
                        new Pessoa("NORBEY DE JESUS VILLANUEVA VELASQUEZ", null, "nvillanueva@ncsolucoesquimicas.com.br", "(65) 99290-2744", LocalDate.of(1985, 5, 31), null, null),
                        new Pessoa("CLAUDIA ANDREA LAVERDE PAREDES", null, "clanlapa@hotmail.com", "(65) 99275-6868", LocalDate.of(1975, 7, 2), null, null),
                        LocalDate.of(2012, 3, 31), "PARROQUIA DIVINO NIÑO JESUS - COLOMBIA", "No grupo por PDF",
                        new Endereco("Av. das Palmeiras, SN", "Casa 437", "Condominio Rio Cachoeirinha", "Jardim Imperial", "Cuiabá", "MT", "78075905", null, null),
                        List.of(
                                new Filho("CARLA ANDREA ORTIZ LAVERDE", LocalDate.of(1999, 7, 28)),
                                new Filho("MARIANA ORTIZ LAVERDE", LocalDate.of(2005, 9, 21)),
                                new Filho("LAURA SOFIA VILLANUEVA MORENO", LocalDate.of(2009, 4, 28))
                        )
                ),
                new CasalDef(
                        new Pessoa("Cleber Luis de Conto", null, "cleber@dismeq.com.br", "(65) 98405-8848", LocalDate.of(1976, 4, 9), null, null),
                        new Pessoa("Eliane Monica Paro de Conto", null, "elianeparo@gmail.com", "(65) 98127-0240", LocalDate.of(1974, 10, 14), null, null),
                        LocalDate.of(2010, 4, 19), null, "Sim",
                        new Endereco("Av. Senador Filinto Muller", null, "Ed Tucana, AP 1403", "Duque de Caxias II", "Cuiaba", "MT", "78043400", null, null),
                        List.of(
                                new Filho("Ana Luiza Paro Mattiuzo de Conto", LocalDate.of(1999, 11, 13)),
                                new Filho("João Gabriel Paro de Conto", LocalDate.of(2006, 5, 15))
                        )
                ),
                new CasalDef(
                        new Pessoa("ROBSON HOMEM MOREIRA DE CARVALHO", null, "diretor.comercial@luizao.com.br", "(65) 98114-3232", LocalDate.of(1982, 8, 6), null, null),
                        new Pessoa("FERNANDA SERRAGLIO BAUM DE CARVALHO", null, "fernanda_sbaum@hotmail.com", "(65) 99983-3849", LocalDate.of(1983, 2, 4), null, null),
                        LocalDate.of(2011, 4, 2), null, "SIM",
                        new Endereco("AVENIDA VEREADOR JULIANO DA COSTA MARQUES", "877", "APTO 1604 - TORRE D", "JARDIM ACLIMAÇÃO", "CUIABÁ", "MT", "78050253", null, null),
                        List.of(
                                new Filho("MARIANA SERRAGLIO DE CARVALHO", LocalDate.of(2015, 6, 10)),
                                new Filho("GIOVANA SERRAGLIO DE CARVALHO", LocalDate.of(2018, 3, 27)),
                                new Filho("MARIA FERNANDA SERRAGLIO DE CARVALHO", LocalDate.of(2023, 3, 6))
                        )
                ),
                new CasalDef(
                        new Pessoa("Gley Alves de Almeida Castro", null, "cel.gleyalves@gmail.com", "(65) 99609-3269", LocalDate.of(1969, 8, 15), null, null),
                        new Pessoa("Micheli Cristina Milan Castro", null, "micheli_cmc@yahoo.com.br", "(65) 99983-8393", LocalDate.of(1979, 2, 17), null, null),
                        LocalDate.of(2002, 1, 12), null, "sim",
                        new Endereco("Vila um, casa 02", null, "Setor Centro Norte", "Bairro Morada do Ouro", "Cuiabá", "MT", "78053424", null, null),
                        List.of(
                                new Filho("Gabrieli Milan Castro", LocalDate.of(2003, 3, 31)),
                                new Filho("Gustavo Milan Castro", LocalDate.of(2007, 9, 6)),
                                new Filho("Giovana Milan Castro", LocalDate.of(2014, 12, 21))
                        )
                ),
                new CasalDef(
                        new Pessoa("Giuliano Salina Belo", null, "gsbelo@hotmail.com", "(65) 98115-7876", LocalDate.of(1981, 2, 27), null, null),
                        new Pessoa("Rafaela Galeski Belo", null, "adv.rafaelagaleski@gmail.com", "(65) 99968-9925", LocalDate.of(1988, 1, 19), null, null),
                        LocalDate.of(2015, 10, 31), null, null,
                        new Endereco("Av. Engenheiro Itamar Marcondes Filho", "s/n", "Cond. Supremo Italia - Quadra 05 - lote 20", "Morada dos Nobres", "Cuiaba", "MT", "78068900", null, null),
                        List.of(
                                new Filho("Maria Antonella Galeski Belo", LocalDate.of(2018, 12, 20)),
                                new Filho("Lucca Galeski Belo", LocalDate.of(2020, 9, 28))
                        )
                ),
                new CasalDef(
                        new Pessoa("Luis Martins de Lima", null, "luismlima1511@gmail.com", "(65) 98148-7898", LocalDate.of(1964, 11, 15), null, null),
                        new Pessoa("Sandra Cristina Domingues Lima", null, "sandracdlima@gmail.com", "(65) 98125-2588", LocalDate.of(1970, 5, 8), null, null),
                        LocalDate.of(2008, 1, 11), null, null,
                        new Endereco("Ru 8 de abril", "300", "Edifício Essenza", "Jardim Kennedy", "Cuiaba", "MT", "78065040", null, null),
                        List.of(
                                new Filho("Lais Miranda Lima", LocalDate.of(1988, 7, 20)),
                                new Filho("Marina Gabriela Domingues de Oliveira", LocalDate.of(1995, 8, 22)),
                                new Filho("Ana Karolina Domingues de Lima", LocalDate.of(2000, 8, 8))
                        )
                )
        );

        List<Vinculo> vinculos = new ArrayList<>();

        for (CasalDef def : casaisDefs) {
            Casal casal = casalRepository.findByEsposoNomeCompletoOrEsposaNomeCompleto(def.esposo.nomeCompleto(), def.esposa.nomeCompleto())
                    .orElseGet(() -> {
                        Casal c = new Casal();
                        c.setEsposo(def.esposo);
                        c.setEsposa(def.esposa);
                        c.setDataMatrimonio(def.dataMatrimonio);
                        c.setParoquiaCasamento(def.paroquiaCasamento);
                        c.setRecebeCartaMensal(def.recebeCartaMensal);
                        c.setEndereco(def.endereco);
                        c.setFilhos(def.filhos);
                        c.setStatus(StatusCasal.ATIVO);
                        c.setEquipeId(equipe.getId());
                        return casalRepository.save(c);
                    });

            if (casal.getEquipeId() == null || !casal.getEquipeId().equals(equipe.getId())) {
                casal.setEquipeId(equipe.getId());
                casalRepository.save(casal);
            }

            vinculos.add(new Vinculo(casal.getId(), PapelVinculo.MEMBRO, def.dataMatrimonio));
        }

        equipe.setVinculos(vinculos);
        equipeRepository.save(equipe);
    }

    private record CasalDef(
            Pessoa esposo,
            Pessoa esposa,
            LocalDate dataMatrimonio,
            String paroquiaCasamento,
            String recebeCartaMensal,
            Endereco endereco,
            List<Filho> filhos
    ) {
    }

    private Map<String, Map<String, List<String>>> getMapeamentoTerritorial() {
        return Map.of(
                "Província Centro-Oeste (PCO)", Map.of(
                        "Região Mato Grosso (MT)", List.of("Cuiabá Norte", "Cuiabá Sul", "Várzea Grande", "Rondonópolis", "Sinop", "Tangará da Serra", "Primavera do Leste", "Sorriso"),
                        "Região Mato Grosso do Sul (MS)", List.of("Campo Grande A", "Campo Grande B", "Dourados", "Três Lagoas", "Corumbá", "Ponta Porã"),
                        "Região Goiás (GO)", List.of("Goiânia Centro", "Goiânia Sul", "Goiânia Leste", "Anápolis", "Rio Verde", "Itumbiara", "Jataí"),
                        "Região Distrito Federal (DF)", List.of("Brasília Asa Norte", "Brasília Asa Sul", "Taguatinga", "Ceilândia", "Sobradinho", "Águas Claras")
                ),
                "Província Leste (PL)", Map.of(
                        "Região Rio de Janeiro (RJ)", List.of("Rio Centro", "Rio Zona Sul", "Rio Zona Norte", "Niterói", "Petrópolis", "Volta Redonda", "Nova Friburgo", "Campos dos Goytacazes"),
                        "Região Minas Gerais Centro/Sul (MG)", List.of("Belo Horizonte (Lourdes, Mangabeiras, Pampulha)", "Contagem", "Juiz de Fora", "Pouso Alegre", "Varginha", "Poços de Caldas"),
                        "Região Minas Gerais Norte/Triângulo (MG)", List.of("Uberlândia", "Uberaba", "Montes Claros", "Governador Valadares", "Ipatinga"),
                        "Região Espírito Santo (ES)", List.of("Vitória", "Vila Velha", "Serra", "Colatina", "Cachoeiro de Itapemirim")
                ),
                "Província São Paulo (PSP)", Map.of(
                        "Região São Paulo Capital (SP)", List.of("Santana", "Ibirapuera", "Pinheiros", "Mooca", "Santo Amaro", "Tatuapé", "Belém", "Lapa"),
                        "Região Grande São Paulo e Litoral (SP)", List.of("Santo André", "São Bernardo do Campo", "Santos", "São Vicente", "Guarulhos", "Osasco", "Mogi das Cruzes"),
                        "Região Campinas e Circuito das Águas (SP)", List.of("Campinas Centro", "Campinas Taquaral", "Jundiaí", "Piracicaba", "Americana", "Bragança Paulista"),
                        "Região Interior Paulista (SP)", List.of("Ribeirão Preto", "São José do Rio Preto", "Bauru", "Sorocaba", "Marília", "Presidente Prudente", "São Carlos"),
                        "Região Vale do Paraíba (SP)", List.of("São José dos Campos", "Taubaté", "Guaratinguetá", "Aparecida")
                ),
                "Província Sul I (PS I)", Map.of(
                        "Região Paraná Sul (PR)", List.of("Curitiba Centro", "Curitiba Norte", "Curitiba Sul", "São José dos Pinhais", "Ponta Grossa", "Paranaguá", "Guarapuava"),
                        "Região Paraná Norte (PR)", List.of("Londrina Centro", "Londrina Norte", "Maringá", "Arapongas", "Apucarana", "Cornélio Procópio"),
                        "Região Paraná Oeste (PR)", List.of("Cascavel", "Foz do Iguaçu", "Toledo", "Umuarama", "Pato Branco", "Francisco Beltrão")
                ),
                "Província Sul II (PS II)", Map.of(
                        "Região Litoral e Capital (SC)", List.of("Florianópolis Centro", "Florianópolis Continente", "São José", "Itajaí", "Balneário Camboriú", "Tubarão", "Criciúma"),
                        "Região Vale do Itajaí e Norte (SC)", List.of("Blumenau", "Joinville Norte", "Joinville Sul", "Jaraguá do Sul", "Brusque"),
                        "Região Oeste Catarinense (SC)", List.of("Chapecó", "Joaçaba", "Concórdia", "Caçador", "Lages")
                ),
                "Província Sul III (PS III)", Map.of(
                        "Região Metropolitana e Litoral (RS)", List.of("Porto Alegre Centro", "Porto Alegre Zona Sul", "Canoas", "Novo Hamburgo", "São Leopoldo", "Osório"),
                        "Região Serra Gaúcha (RS)", List.of("Caxias do Sul", "Bento Gonçalves", "Farroupilha", "Gramado/Canela", "Vacaria"),
                        "Região Central e Missões (RS)", List.of("Santa Maria", "Passo Fundo", "Cruz Alta", "Santo Ângelo", "Ijuí", "Erechim"),
                        "Região Sul Gaúcho (RS)", List.of("Pelotas", "Rio Grande", "Bagé", "Uruguaiana", "Santana do Livramento")
                ),
                "Província Nordeste I (PNE I)", Map.of(
                        "Região Ceará (CE)", List.of("Fortaleza Centro", "Fortaleza Aldeota", "Fortaleza Sul", "Sobral", "Juazeiro do Norte", "Crato", "Iguatu"),
                        "Região Piauí (PI)", List.of("Teresina Centro", "Teresina Leste", "Parnaíba", "Picos", "Floriano"),
                        "Região Maranhão (MA)", List.of("São Luís Centro", "São Luís Renascença", "Imperatriz", "Caxias", "Bacabal")
                ),
                "Província Nordeste II (PNE II)", Map.of(
                        "Região Pernambuco (PE)", List.of("Recife Boa Viagem", "Recife Espinheiro", "Olinda", "Jaboatão dos Guararapes", "Caruaru", "Garanhuns", "Petrolina"),
                        "Região Paraíba (PB)", List.of("João Pessoa Centro", "João Pessoa Manaíra", "Campina Grande", "Patos", "Sousa"),
                        "Região Rio Grande do Norte (RN)", List.of("Natal Leste", "Natal Sul", "Mossoró", "Caicó"),
                        "Região Alagoas / Sergipe (AL/SE)", List.of("Maceió Ponta Verde", "Maceió Farol", "Arapiraca", "Aracaju Centro", "Aracaju Jardins", "Estância")
                ),
                "Província Norte (PN)", Map.of(
                        "Região Pará / Amapá (PA/AP)", List.of("Belém Centro", "Belém Nazaré", "Ananindeua", "Santarém", "Marabá", "Macapá"),
                        "Região Amazonas / Roraima (AM/RR)", List.of("Manaus Centro", "Manaus Adrianópolis", "Parintins", "Boa Vista"),
                        "Região Rondônia / Acre (RO/AC)", List.of("Porto Velho", "Ji-Paraná", "Ariquemes", "Cacoal", "Vilhena", "Rio Branco"),
                        "Região Tocantins (TO)", List.of("Palmas Centro", "Araguaína", "Gurupi", "Porto Nacional")
                )
        );
    }
}
