export async function lookupCep(cep, { signal } = {}) {
  const digits = String(cep || '').replace(/\D/g, '')
  if (!/^\d{8}$/.test(digits)) throw new Error('Informe um CEP com 8 dígitos.')

  const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`, { signal })
  if (!response.ok) throw new Error('Não foi possível consultar o CEP agora.')

  const data = await response.json()
  if (data.erro) return null

  return {
    logradouro: data.logradouro || '',
    bairro: data.bairro || '',
    cidade: data.localidade || '',
    estado: data.uf || '',
  }
}
