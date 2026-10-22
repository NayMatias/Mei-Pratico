# Histórico de versões

## v0.6.0 — Armazenamento de dados (em andamento)
- Banco SQLite local com as tabelas `prestador`, `clientes`, `servicos` e `atendimentos`.
- Cadastro, edição e exclusão de clientes.
- Busca de endereço pelo CEP (ViaCEP) e conversão do endereço em coordenadas.
- Tela de histórico com atendimentos concluídos por mês e total recebido.
- Pendente: filtro por cliente e por período personalizado.

## v0.5.0 — Lógica de rotas
- Cálculo da rota entre a localização atual e o cliente usando o OSRM.
- Linha da rota no mapa com distância e tempo estimado.
- Atalhos para abrir a rota no Google Maps e no Waze.

## v0.4.0 — Integração de mapas
- Mapa com camada do OpenStreetMap.
- Pedido de permissão e captura da localização do celular.
- Pinos dos clientes com atendimento no dia.

## v0.3.0 — Interface (parte 2)
- Tela de registro de serviço com validação dos campos.
- Formulário de finalização do atendimento (valor cobrado e forma de pagamento).

## v0.2.0 — Interface (parte 1)
- Tela de boas-vindas com cadastro rápido do prestador.
- Menu principal com os atendimentos do dia.
- Fluxo de navegação entre as telas.

## v0.1.0 — Configuração inicial
- Projeto Expo criado, estrutura de pastas e dependências.
