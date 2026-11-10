/**
 * Montagem do recibo e do resumo para a NFS-e — etapa 7 do cronograma.
 *
 * Aqui ficam só funções "puras" (recebem dados e devolvem texto), sem nada
 * do React Native. Assim dá para testar no computador com `npm test`.
 */
import { enderecoCompleto, formatarMoeda, isoParaBR, mascaraCNPJ } from './formatar.js';

/** Número do recibo a partir do id do atendimento: 7 -> "000007" */
export function numeroRecibo(id) {
  return String(id).padStart(6, '0');
}

/** Evita que um texto digitado pelo usuário quebre o HTML do recibo. */
export function escaparHTML(texto) {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ---------------- Valor por extenso ---------------- */

const UNIDADES = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
const DEZ_A_DEZENOVE = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
const DEZENAS = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
const CENTENAS = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

/** Escreve por extenso um número de 0 a 999. */
function ateMil(n) {
  if (n === 0) return '';
  if (n === 100) return 'cem';
  const partes = [];
  const c = Math.floor(n / 100);
  const resto = n % 100;
  if (c > 0) partes.push(CENTENAS[c]);
  if (resto >= 10 && resto < 20) {
    partes.push(DEZ_A_DEZENOVE[resto - 10]);
  } else {
    const d = Math.floor(resto / 10);
    const u = resto % 10;
    if (d > 0) partes.push(DEZENAS[d]);
    if (u > 0) partes.push(UNIDADES[u]);
  }
  return partes.join(' e ');
}

/** Escreve um número inteiro de 0 a 999.999 por extenso. */
function inteiroPorExtenso(n) {
  if (n === 0) return 'zero';
  const milhares = Math.floor(n / 1000);
  const resto = n % 1000;
  const partes = [];
  if (milhares > 0) partes.push(milhares === 1 ? 'mil' : `${ateMil(milhares)} mil`);
  if (resto > 0) {
    // "mil e cem", "mil e vinte", mas "mil duzentos e trinta"
    const usaE = milhares > 0 && (resto < 100 || resto % 100 === 0);
    partes.push(usaE ? `e ${ateMil(resto)}` : ateMil(resto));
  }
  return partes.join(' ');
}

/**
 * 150.5 -> "cento e cinquenta reais e cinquenta centavos"
 * Atende valores até R$ 999.999,99, mais do que suficiente para um MEI.
 */
export function valorPorExtenso(valor) {
  const centavosTotais = Math.round((Number(valor) || 0) * 100);
  const reais = Math.floor(centavosTotais / 100);
  const centavos = centavosTotais % 100;

  if (reais > 999999) return formatarMoeda(valor);

  const partes = [];
  if (reais > 0) partes.push(`${inteiroPorExtenso(reais)} ${reais === 1 ? 'real' : 'reais'}`);
  if (centavos > 0) partes.push(`${ateMil(centavos)} ${centavos === 1 ? 'centavo' : 'centavos'}`);
  if (partes.length === 0) return 'zero reais';
  return partes.join(' e ');
}

/* ---------------- Recibo ---------------- */

/**
 * HTML do recibo, que vira PDF pelo expo-print.
 * atendimento: linha vinda de buscarAtendimento() (já com dados do cliente)
 * prestador:   linha vinda de buscarPrestador()
 */
export function montarReciboHTML(atendimento, prestador, emitidoEm = new Date()) {
  const valor = atendimento.valor_recebido ?? atendimento.valor;
  const pendente = atendimento.forma_pagamento === 'Pendente';
  const e = escaparHTML;

  const dadosPrestador = [
    prestador?.cnpj ? `CNPJ ${e(mascaraCNPJ(prestador.cnpj))}` : null,
    prestador?.telefone ? e(prestador.telefone) : null,
    prestador?.cidade ? e(prestador.cidade) : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const local = prestador?.cidade || atendimento.cidade || '';
  const dataEmissao = emitidoEm.toLocaleDateString('pt-BR');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<style>
  body { font-family: Arial, Helvetica, sans-serif; color: #1F2933; margin: 32px; }
  .topo { border-bottom: 3px solid #2E7D32; padding-bottom: 12px; display: flex; justify-content: space-between; align-items: flex-end; }
  h1 { color: #2E7D32; font-size: 28px; margin: 0; }
  .numero { font-size: 14px; color: #6B7280; text-align: right; }
  .valor { font-size: 26px; font-weight: bold; color: #1B5E20; margin-top: 4px; }
  .texto { font-size: 16px; line-height: 1.7; margin: 28px 0; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px; }
  td { padding: 8px 6px; border-bottom: 1px solid #D9DED9; vertical-align: top; }
  td:first-child { color: #6B7280; width: 32%; }
  .pendente { background: #FFF8E1; border: 1px solid #F9A825; padding: 10px; border-radius: 6px; font-size: 14px; }
  .assinatura { margin-top: 64px; text-align: center; font-size: 14px; }
  .linha { border-top: 1px solid #1F2933; width: 60%; margin: 0 auto 6px; }
  .rodape { margin-top: 40px; font-size: 11px; color: #6B7280; text-align: center; }
</style>
</head>
<body>
  <div class="topo">
    <div>
      <h1>RECIBO</h1>
      <div style="font-size:14px;margin-top:6px">${e(prestador?.nome)}${prestador?.atividade ? ` — ${e(prestador.atividade)}` : ''}</div>
      ${dadosPrestador ? `<div style="font-size:12px;color:#6B7280">${dadosPrestador}</div>` : ''}
    </div>
    <div class="numero">Nº ${numeroRecibo(atendimento.id)}<div class="valor">${formatarMoeda(valor)}</div></div>
  </div>

  <p class="texto">
    ${pendente ? 'Declaro que prestei' : 'Recebi de'} <strong>${e(atendimento.cliente_nome)}</strong>
    ${pendente ? 'o serviço abaixo, no valor de' : 'a importância de'}
    <strong>${formatarMoeda(valor)}</strong> (${e(valorPorExtenso(valor))}),
    ${pendente ? 'que ainda está pendente de pagamento.' : `referente ao serviço descrito abaixo, pago via ${e(atendimento.forma_pagamento)}.`}
  </p>

  <table>
    <tr><td>Serviço</td><td>${e(atendimento.descricao)}</td></tr>
    <tr><td>Data do atendimento</td><td>${isoParaBR(atendimento.data)}${atendimento.hora ? ` às ${e(atendimento.hora)}` : ''}</td></tr>
    <tr><td>Endereço</td><td>${e(enderecoCompleto(atendimento)) || '—'}</td></tr>
    ${atendimento.observacoes_finais ? `<tr><td>Observações</td><td>${e(atendimento.observacoes_finais)}</td></tr>` : ''}
    ${prestador?.chave_pix && pendente ? `<tr><td>Chave Pix</td><td>${e(prestador.chave_pix)}</td></tr>` : ''}
  </table>

  ${pendente ? '<div class="pendente">Pagamento pendente. Este documento serve como comprovante do serviço prestado.</div>' : ''}

  <div class="assinatura">
    ${local ? `${e(local)}, ` : ''}${dataEmissao}
    <div style="height:48px"></div>
    <div class="linha"></div>
    ${e(prestador?.nome)}
  </div>

  <div class="rodape">
    Recibo gerado pelo aplicativo MEI Prático. Este recibo não substitui a Nota Fiscal de Serviço Eletrônica (NFS-e).
  </div>
</body>
</html>`;
}

/* ---------------- Apoio à NFS-e ---------------- */

/**
 * Texto com os dados que o MEI precisa digitar no Emissor Nacional da NFS-e.
 * O app não emite a nota sozinho: para isso seria preciso certificado digital
 * ICP-Brasil, que a maioria dos MEIs não tem. Então ele organiza os dados e
 * abre o emissor oficial, onde o MEI entra com a conta gov.br.
 */
export function montarTextoNFSe(atendimento, prestador) {
  const valor = atendimento.valor_recebido ?? atendimento.valor;
  const linhas = [
    'DADOS PARA A NFS-e',
    '',
    `Prestador: ${prestador?.nome ?? ''}${prestador?.cnpj ? ` (CNPJ ${mascaraCNPJ(prestador.cnpj)})` : ''}`,
    `Tomador (cliente): ${atendimento.cliente_nome}`,
    `Endereço do tomador: ${enderecoCompleto(atendimento) || 'não informado'}`,
    `Data da prestação: ${isoParaBR(atendimento.data)}`,
    `Descrição do serviço: ${atendimento.descricao}${atendimento.observacoes_finais ? ` — ${atendimento.observacoes_finais}` : ''}`,
    `Valor do serviço: ${formatarMoeda(valor)}`,
    `Recibo nº: ${numeroRecibo(atendimento.id)}`,
  ];
  return linhas.join('\n');
}

/** Endereço oficial do Emissor Nacional da NFS-e (acesso com gov.br). */
export const URL_EMISSOR_NACIONAL = 'https://www.nfse.gov.br/EmissorNacional';
