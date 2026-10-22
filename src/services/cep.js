/**
 * Busca de endereço pelo CEP usando a API pública ViaCEP (https://viacep.com.br).
 */
export async function buscarCEP(cep) {
  const numeros = String(cep).replace(/\D/g, '');
  if (numeros.length !== 8) {
    throw new Error('O CEP precisa ter 8 números.');
  }

  const resposta = await fetch(`https://viacep.com.br/ws/${numeros}/json/`);
  if (!resposta.ok) {
    throw new Error('Não foi possível consultar o CEP agora. Verifique a internet.');
  }

  const dados = await resposta.json();
  if (dados.erro) {
    throw new Error('CEP não encontrado.');
  }

  return {
    logradouro: dados.logradouro || '',
    bairro: dados.bairro || '',
    cidade: dados.localidade || '',
    uf: dados.uf || '',
  };
}
