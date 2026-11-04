# Instruções para Importação de Dados do ENS

Este diretório contém a exportação completa dos dados do banco `ens` do MongoDB em dois formatos:

1. **Dump Binário BSON (`ens_dump.archive.gz`)**: Formato nativo e recomendado. Preserva tipos estritos do BSON (como ObjectIds, ISODate e números inteiros/decimais) com compressão gzip.
2. **Arquivos JSON (`json/*.json`)**: Formato legível e estruturado por coleção, indicado para MongoDB Compass ou integrações externas.

---

## 1. Importação com Dump Nativo (`mongorestore`)

### Opção A: Restaurar em container Docker local
Copie o arquivo para dentro do container ou execute o comando diretamente via `docker exec`:

```bash
# Se o container local chamar 'ens-mongo':
docker cp export/ens_dump.archive.gz ens-mongo:/tmp/ens_dump.archive.gz

# Restauração com substituição limpa (--drop):
docker exec ens-mongo mongorestore --gzip --archive=/tmp/ens_dump.archive.gz --drop --nsInclude="ens.*"

# Limpeza do arquivo temporário dentro do container:
docker exec ens-mongo rm -f /tmp/ens_dump.archive.gz
```

### Opção B: Restaurar em instância remota ou MongoDB Atlas
Utilize a ferramenta oficial `mongorestore` informando a URI de conexão do seu cluster:

```bash
mongorestore --uri="mongodb+srv://<usuario>:<senha>@<cluster>.mongodb.net" --gzip --archive=export/ens_dump.archive.gz --nsInclude="ens.*" --drop
```

---

## 2. Importação dos Arquivos JSON (`mongoimport`)

Caso prefira importar cada coleção individualmente via linha de comando:

```bash
COLLECOES=("estrutura" "casais" "equipes" "mandatos" "reunioes" "sacerdotes" "mural_momentos" "movimentacoes_casal")

for col in "${COLLECOES[@]}"; do
  mongoimport --uri="mongodb://localhost:27017/ens" \
              --collection="$col" \
              --file="export/json/$col.json" \
              --jsonArray \
              --drop
done
```

---

## 3. Importação Gráfica via MongoDB Compass

1. Abra o MongoDB Compass e conecte-se ao banco de destino.
2. Crie ou selecione o banco de dados `ens`.
3. Para cada coleção (`estrutura`, `casais`, `equipes`, `mandatos`, `reunioes`, `sacerdotes`, `mural_momentos`, `movimentacoes_casal`):
   - Abra a coleção (ou crie-a com o botão *Create collection*).
   - Clique em **Add Data** -> **Import JSON or CSV file**.
   - Selecione o respectivo arquivo em `export/json/<colecao>.json`.
   - Clique no botão **Import**.

---

## 4. Relação de Coleções Exportadas

| Coleção | Registros | Arquivo |
|---|---|---|
| `estrutura` | 244 | `export/json/estrutura.json` |
| `casais` | 7 | `export/json/casais.json` |
| `equipes` | 1 | `export/json/equipes.json` |
| `mandatos` | 1 | `export/json/mandatos.json` |
| `reunioes` | 1 | `export/json/reunioes.json` |
| `sacerdotes` | 1 | `export/json/sacerdotes.json` |
| `mural_momentos` | 1 | `export/json/mural_momentos.json` |
| `movimentacoes_casal` | 1 | `export/json/movimentacoes_casal.json` |
