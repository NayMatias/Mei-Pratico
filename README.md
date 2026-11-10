# MEI Prático

Aplicativo de celular para o MEI que presta serviço na casa do cliente (eletricista, diarista, manicure, encanador etc.).

Com ele o MEI consegue:

- cadastrar seus clientes (o endereço é preenchido pelo CEP);
- anotar os atendimentos do dia;
- ver os clientes no mapa e a rota até cada um;
- finalizar o serviço e gerar um recibo em PDF;
- copiar os dados para emitir a nota fiscal (NFS-e) no site do governo;
- ver quanto recebeu no mês.

Os dados ficam salvos no próprio celular, então o app funciona mesmo sem internet (só o mapa e a rota precisam de conexão).

Projeto de Extensão Universitária II do curso de Sistemas de Informação do IFC Campus Camboriú (2026.2).

- Aluno: Elionay Matias
- Professores: André Fabiano de Moraes e Filipe William Canello de Almeida

## Telas

![Telas do app](docs/diagramas/telas-1.png)

![Telas do app](docs/diagramas/telas-2.png)

## Como rodar o projeto

Você precisa de:

- [Node.js](https://nodejs.org) instalado no computador (versão LTS);
- o app **Expo Go** no celular, na versão compatível com o **SDK 54**.

> Atenção: o projeto usa o Expo SDK 54. Se o Expo Go do seu celular for de uma versão mais nova, o app pode não abrir. A atualização para a versão mais recente fica para depois da entrega da disciplina.

Passo a passo:

1. Baixe o projeto:

   ```
   git clone https://github.com/NayMatias/Mei-Pratico.git
   cd Mei-Pratico
   ```

2. Instale as dependências:

   ```
   npm install
   ```

3. Inicie o app:

   ```
   npx expo start
   ```

4. Abra o Expo Go no celular e leia o QR Code que aparece no terminal. O computador e o celular precisam estar no mesmo Wi-Fi.

Se o QR Code não conectar, pare com `Ctrl + C` e rode `npx expo start --tunnel`.

## Testes

Algumas regras do app (validação de CNPJ, datas, valor por extenso, montagem do recibo) têm testes que rodam no computador:

```
npm test
```

## Tecnologias

- React Native com Expo (SDK 54)
- SQLite para guardar os dados no celular
- OpenStreetMap para o mapa
- OSRM para calcular as rotas
- ViaCEP para buscar o endereço pelo CEP
- expo-print e expo-sharing para gerar e enviar o recibo

Todos gratuitos.

## Sobre a nota fiscal

O app não emite a NFS-e sozinho. Para isso seria preciso um certificado digital, que a maioria dos MEIs não tem. Então o app junta os dados do atendimento, copia tudo e abre o Emissor Nacional, onde o MEI entra com a conta gov.br e emite a nota.

## Pastas

| Pasta | O que tem |
|---|---|
| `src/screens` | As telas do app |
| `src/components` | Botões, campos e cartões usados nas telas |
| `src/database` | Banco de dados (SQLite) |
| `src/services` | Localização, CEP, rotas e recibo |
| `src/utils` | Formatação, validações e montagem do recibo |
| `tests` | Testes automáticos |
| `docs` | Relatórios, diagramas e roteiro de testes |

## Cronograma

| Período | Etapa | Situação |
|---|---|---|
| 03/08 a 17/08 | Configuração inicial | Concluído |
| 18/08 a 31/08 | Interface (parte 1) | Concluído |
| 01/09 a 14/09 | Interface (parte 2) | Concluído |
| 15/09 a 28/09 | Mapas | Concluído |
| 29/09 a 12/10 | Rotas | Concluído |
| 13/10 a 26/10 | Banco de dados | Concluído |
| 27/10 a 02/11 | Recibos e NFS-e | Concluído |
| 03/11 a 09/11 | Testes de integração | Em andamento |
| 10/11 a 20/11 | Testes com MEIs | Previsto |
| 21/11 a 25/11 | Ajustes finais | Previsto |
| 26/11 a 30/11 | Documentação e entrega | Previsto |

O que mudou em cada versão está no [CHANGELOG](CHANGELOG.md).

## Documentos

- [Relatório Final (Checkpoint 4)](docs/EX2_CheckPoint-4_ElionayMatias.pdf)
- [Relatórios anteriores](docs/)
- [Roteiro dos testes com MEIs](docs/roteiro-testes-campo.md)

## Créditos

Mapas © colaboradores do [OpenStreetMap](https://www.openstreetmap.org/copyright). Rotas: [OSRM](https://project-osrm.org). CEP: [ViaCEP](https://viacep.com.br).
