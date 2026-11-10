# Histórico de versões

Cada versão corresponde a uma etapa do cronograma do projeto.

## v1.0.0 — Recibos e apoio à NFS-e (02/11/2026)
- Fim da etapa de armazenamento: histórico com filtro por cliente, resumo do mês separando o recebido do que falta receber, e toque no serviço para abrir o recibo.
- Tela de recibo que abre logo depois de finalizar o atendimento.
- Recibo em PDF com número, valor por extenso e assinatura, enviado pelo menu de compartilhar do celular (WhatsApp, e-mail...).
- Botão que copia os dados da nota e atalho para o Emissor Nacional da NFS-e (gov.br).
- Serviços "pendentes" podem ser marcados como pagos depois, direto no recibo.
- Nova tela "Meus dados": editar perfil, cidade e chave Pix (usados no recibo).
- Banco atualizado com migração automática (`PRAGMA user_version`), sem perder o que já estava salvo.
- 11 testes automáticos para as regras do app (`npm test`).

## v0.6.0 — Armazenamento de dados
- Banco SQLite local com as tabelas `prestador`, `clientes`, `servicos` e `atendimentos`.
- Cadastro, edição e exclusão de clientes.
- Busca de endereço pelo CEP (ViaCEP) e conversão do endereço em coordenadas.
- Histórico com atendimentos concluídos por mês e total recebido.

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
