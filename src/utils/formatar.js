// Funções de formatação usadas nas telas

export function formatarMoeda(valor) {
  const numero = Number(valor) || 0;
  return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** Converte "150,50" ou "150.50" em 150.5 */
export function lerValor(texto) {
  if (texto === null || texto === undefined) return NaN;
  let limpo = String(texto).replace(/[^\d,.]/g, '');
  // Com vírgula: padrão brasileiro (1.250,50). Sem vírgula: aceita ponto decimal (150.50).
  if (limpo.includes(',')) limpo = limpo.replace(/\./g, '').replace(',', '.');
  return parseFloat(limpo);
}

/** Data de hoje no formato do banco: AAAA-MM-DD */
export function hojeISO() {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

/** "2026-10-22" -> "22/10/2026" */
export function isoParaBR(iso) {
  if (!iso) return '';
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
}

/** "22/10/2026" -> "2026-10-22" (retorna null se inválida) */
export function brParaISO(br) {
  const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(br).trim());
  if (!partes) return null;
  const [, d, m, a] = partes;
  const data = new Date(Number(a), Number(m) - 1, Number(d));
  if (data.getMonth() !== Number(m) - 1 || data.getDate() !== Number(d)) return null;
  return `${a}-${m}-${d}`;
}

/** Aplica a máscara de data enquanto o usuário digita */
export function mascaraData(texto) {
  const n = texto.replace(/\D/g, '').slice(0, 8);
  if (n.length <= 2) return n;
  if (n.length <= 4) return `${n.slice(0, 2)}/${n.slice(2)}`;
  return `${n.slice(0, 2)}/${n.slice(2, 4)}/${n.slice(4)}`;
}

export function mascaraHora(texto) {
  const n = texto.replace(/\D/g, '').slice(0, 4);
  if (n.length <= 2) return n;
  return `${n.slice(0, 2)}:${n.slice(2)}`;
}

export function mascaraCEP(texto) {
  const n = texto.replace(/\D/g, '').slice(0, 8);
  return n.length > 5 ? `${n.slice(0, 5)}-${n.slice(5)}` : n;
}

export function mascaraTelefone(texto) {
  const n = texto.replace(/\D/g, '').slice(0, 11);
  if (n.length <= 2) return n;
  if (n.length <= 7) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
  return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
}

export function mascaraCNPJ(texto) {
  const n = texto.replace(/\D/g, '').slice(0, 14);
  return n
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

/** Distância em metros -> "3,2 km" ou "850 m" */
export function formatarDistancia(metros) {
  if (metros >= 1000) return `${(metros / 1000).toFixed(1).replace('.', ',')} km`;
  return `${Math.round(metros)} m`;
}

/** Duração em segundos -> "1 h 05 min" ou "12 min" */
export function formatarDuracao(segundos) {
  const minutos = Math.round(segundos / 60);
  if (minutos < 60) return `${minutos} min`;
  const h = Math.floor(minutos / 60);
  const m = String(minutos % 60).padStart(2, '0');
  return `${h} h ${m} min`;
}

export function enderecoCompleto(c) {
  if (!c) return '';
  const partes = [
    [c.logradouro, c.numero].filter(Boolean).join(', '),
    c.bairro,
    [c.cidade, c.uf].filter(Boolean).join('/'),
  ].filter(Boolean);
  return partes.join(' - ');
}
