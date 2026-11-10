/**
 * Testes automáticos das regras do app (sem precisar de celular).
 * Para rodar: npm test
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  brParaISO,
  formatarDistancia,
  formatarDuracao,
  isoParaBR,
  lerValor,
  mascaraCEP,
  mascaraCNPJ,
  mascaraData,
  mascaraTelefone,
} from '../src/utils/formatar.js';
import { validarCNPJ, validarHora, validarTelefone } from '../src/utils/validar.js';

test('lê valores digitados do jeito brasileiro e com ponto', () => {
  assert.equal(lerValor('150,50'), 150.5);
  assert.equal(lerValor('150.50'), 150.5);
  assert.equal(lerValor('1.250,00'), 1250);
  assert.equal(lerValor('R$ 80'), 80);
  assert.ok(Number.isNaN(lerValor('')));
});

test('converte datas entre o formato brasileiro e o do banco', () => {
  assert.equal(brParaISO('22/10/2026'), '2026-10-22');
  assert.equal(isoParaBR('2026-10-22'), '22/10/2026');
  assert.equal(brParaISO('31/02/2026'), null, '31 de fevereiro não existe');
  assert.equal(brParaISO('2026-10-22'), null);
});

test('aplica as máscaras enquanto o usuário digita', () => {
  assert.equal(mascaraData('22102026'), '22/10/2026');
  assert.equal(mascaraCEP('88340000'), '88340-000');
  assert.equal(mascaraTelefone('47999990000'), '(47) 99999-0000');
  assert.equal(mascaraCNPJ('11222333000181'), '11.222.333/0001-81');
});

test('valida CNPJ, telefone e hora', () => {
  assert.equal(validarCNPJ('11.222.333/0001-81'), true);
  assert.equal(validarCNPJ('11.222.333/0001-82'), false);
  assert.equal(validarCNPJ('11.111.111/1111-11'), false);
  assert.equal(validarTelefone('(47) 99999-0000'), true);
  assert.equal(validarTelefone('9999-0000'), false);
  assert.equal(validarHora('14:30'), true);
  assert.equal(validarHora('25:00'), false);
});

test('mostra distância e tempo da rota de um jeito fácil de ler', () => {
  assert.equal(formatarDistancia(850), '850 m');
  assert.equal(formatarDistancia(3240), '3,2 km');
  assert.equal(formatarDuracao(720), '12 min');
  assert.equal(formatarDuracao(3900), '1 h 05 min');
});
