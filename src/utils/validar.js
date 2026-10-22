// Validações dos formulários

export function validarCNPJ(cnpj) {
  const n = String(cnpj).replace(/\D/g, '');
  if (n.length !== 14 || /^(\d)\1+$/.test(n)) return false;

  const calcular = (base) => {
    let pesos = base.length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const soma = base.split('').reduce((acc, dig, i) => acc + Number(dig) * pesos[i], 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const d1 = calcular(n.slice(0, 12));
  const d2 = calcular(n.slice(0, 12) + d1);
  return n.endsWith(`${d1}${d2}`);
}

export function validarTelefone(tel) {
  const n = String(tel).replace(/\D/g, '');
  return n.length === 10 || n.length === 11;
}

export function validarHora(hora) {
  const m = /^(\d{2}):(\d{2})$/.exec(String(hora));
  if (!m) return false;
  return Number(m[1]) < 24 && Number(m[2]) < 60;
}
