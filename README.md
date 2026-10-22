# MEI Prático

Aplicativo de gestão e geolocalização para Microempreendedores Individuais (MEI) que prestam serviços na casa dos clientes.

Projeto de Extensão Universitária II — Bacharelado em Sistemas de Informação, Instituto Federal Catarinense (Campus Camboriú), 2026.2.

- **Aluno:** Elionay Matias
- **Professor:** André Fabiano de Moraes e Filipe William Canello de Almeida

## O problema

Eletricistas, encanadores, diaristas, cabeleireiras e manicures que atendem em domicílio perdem tempo procurando endereços, anotando serviços no papel e reunindo os dados na hora de cobrar ou emitir nota fiscal.

## O que o app faz

| Função | Situação |
|---|---|
| Cadastro rápido do prestador (nome, CNPJ, atividade) | ✅ Pronto |
| Menu principal com os atendimentos do dia | ✅ Pronto |
| Registro de serviço (cliente, serviço, valor, data, hora) | ✅ Pronto |
| Finalização do atendimento (valor cobrado e forma de pagamento) | ✅ Pronto |
| Mapa com a localização atual e os clientes do dia | ✅ Pronto |
| Rota até o cliente com distância e tempo, atalho para Google Maps e Waze | ✅ Pronto |
| Cadastro de clientes com busca de endereço pelo CEP | ✅ Pronto |
| Banco de dados no celular (funciona sem internet) | 🔄 Em andamento |
| Histórico de serviços com total recebido no mês | 🔄 Em andamento |
| Recibo digital em PDF | ⏳ Próxima etapa |
| Atalho com os dados prontos para a NFS-e no Emissor Nacional (gov.br) | ⏳ Próxima etapa |

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Aplicativo | React Native + Expo |
| Navegação | React Navigation (native stack) |
| Mapas | react-native-maps com camada do OpenStreetMap |
| Localização | expo-location |
| Rotas | OSRM (Open Source Routing Machine) |
| Endereços | ViaCEP + geocodificação do próprio celular |
| Dados locais | SQLite (expo-sqlite) |

## Como rodar no seu celular

**Você vai precisar de:** [Node.js](https://nodejs.org) (versão LTS) instalado no computador e o app **Expo Go** no celular (Play Store ou App Store).

```bash
# 1. Baixe o projeto
git clone https://github.com/SEU-USUARIO/mei-pratico.git
cd mei-pratico

# 2. Instale as dependências
npm install

# 3. Ajuste as versões para a sua versão do Expo
npx expo install --fix

# 4. Inicie o projeto
npx expo start
```

Leia o QR Code que aparece no terminal com o Expo Go (no Android) ou com a câmera (no iPhone). Computador e celular precisam estar na mesma rede Wi-Fi.

> Se o Expo Go disser que a versão do projeto não é compatível, rode `npx expo install expo@latest --fix` e depois `npx expo start` de novo.

## Estrutura do projeto

```
mei-pratico/
├── App.js                    # ponto de entrada: prepara o banco e a navegação
├── app.json                  # configurações do Expo (nome, permissões)
├── src/
│   ├── components/           # Botao, Campo, Cartao, MapaBase
│   ├── database/db.js        # tabelas e consultas SQLite
│   ├── navigation/           # fluxo de telas
│   ├── screens/              # telas do aplicativo
│   ├── services/             # localização, CEP e rotas
│   ├── theme/cores.js        # cores dos protótipos
│   └── utils/                # formatação e validações
└── docs/                     # relatórios dos checkpoints
```

## Cronograma

| Período | Etapa | Situação |
|---|---|---|
| 03/08 a 17/08 | Configuração inicial | ✅ Concluído |
| 18/08 a 31/08 | Interface (parte 1) | ✅ Concluído |
| 01/09 a 14/09 | Interface (parte 2) | ✅ Concluído |
| 15/09 a 28/09 | Integração de mapas | ✅ Concluído |
| 29/09 a 12/10 | Lógica de rotas | ✅ Concluído |
| 13/10 a 26/10 | Armazenamento de dados | 🔄 Em andamento |
| 27/10 a 09/11 | Recibos e apoio à NFS-e | ⏳ Previsto |
| 10/11 a 19/11 | Testes de integração | ⏳ Previsto |
| 20/11 a 30/11 | Testes em campo | ⏳ Previsto |
| 01/12 a 07/12 | Refinamento de interface | ⏳ Previsto |
| 08/12 a 12/12 | Documentação e entrega | ⏳ Previsto |

## Documentação

Os relatórios do projeto estão na pasta [`docs/`](docs/).

## Créditos de dados

Mapas © colaboradores do [OpenStreetMap](https://www.openstreetmap.org/copyright). Rotas calculadas pelo [OSRM](https://project-osrm.org). Endereços via [ViaCEP](https://viacep.com.br).
