/**
 * Testes do recibo e do resumo para a NFS-e.
 * Para rodar: npm test
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { escaparHTML, montarReciboHTML, montarTextoNFSe, numeroRecibo, valorPorExtenso } from '../src/utils/documentos.js';

const prestador = {
  nome: 'Elionay Matias',
  atividade: 'Eletricista',
  cnpj: '11222333000181',
  telefone: '(47) 99999-0000',
  cidade: 'Camboriú/SC',
  chave_pix: 'pix@exemplo.com',
};

const atendimento = {
  id: 7,
  cliente_nome: 'Maria Souza',
  descricao: 'Troca de chuveiro',
  valor: 150,
  valor_recebido: 150,
  forma_pagamento: 'Pix',
  data: '2026-10-29',
  hora: '14:30',
  logradouro: 'Rua Getúlio Vargas',
  numero: '120',
  bairro: 'Centro',
  cidade: 'Camboriú',
  uf: 'SC',
  observacoes_finais: 'Garantia de 90 dias',
};

test('numera o recibo com 6 dígitos', () => {
  assert.equal(numeroRecibo(7), '000007');
  assert.equal(numeroRecibo(1234), '001234');
});

test('escreve valores por extenso', () => {
  assert.equal(valorPorExtenso(1), 'um real');
  assert.equal(valorPorExtenso(100), 'cem reais');
  assert.equal(valorPorExtenso(150), 'cento e cinquenta reais');
  assert.equal(valorPorExtenso(150.5), 'cento e cinquenta reais e cinquenta centavos');
  assert.equal(valorPorExtenso(1000), 'mil reais');
  assert.equal(valorPorExtenso(1100), 'mil e cem reais');
  assert.equal(valorPorExtenso(1230), 'mil duzentos e trinta reais');
  assert.equal(valorPorExtenso(2015.01), 'dois mil e quinze reais e um centavo');
  assert.equal(valorPorExtenso(0.75), 'setenta e cinco centavos');
  assert.equal(valorPorExtenso(0), 'zero reais');
});

test('protege o recibo contra texto que quebraria o HTML', () => {
  assert.equal(escaparHTML('<b>"Zé" & cia</b>'), '&lt;b&gt;&quot;Zé&quot; &amp; cia&lt;/b&gt;');
});

test('monta o recibo de um serviço pago', () => {
  const html = montarReciboHTML(atendimento, prestador, new Date(2026, 9, 29));
  assert.match(html, /Recebi de/);
  assert.match(html, /Maria Souza/);
  assert.match(html, /cento e cinquenta reais/);
  assert.match(html, /pago via Pix/);
  assert.match(html, /Nº 000007/);
  assert.match(html, /11\.222\.333\/0001-81/);
  assert.doesNotMatch(html, /Chave Pix/, 'a chave Pix só aparece quando o pagamento está pendente');
});

test('monta o recibo de um serviço com pagamento pendente', () => {
  const html = montarReciboHTML({ ...atendimento, forma_pagamento: 'Pendente' }, prestador);
  assert.match(html, /Declaro que prestei/);
  assert.match(html, /pendente de pagamento/);
  assert.match(html, /pix@exemplo\.com/);
});

test('organiza os dados que vão para a NFS-e', () => {
  const texto = montarTextoNFSe(atendimento, prestador);
  assert.match(texto, /Tomador \(cliente\): Maria Souza/);
  assert.match(texto, /Data da prestação: 29\/10\/2026/);
  assert.match(texto, /Troca de chuveiro — Garantia de 90 dias/);
  assert.match(texto, /Recibo nº: 000007/);
});
