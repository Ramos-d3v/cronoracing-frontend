const genders = new Set(['MASCULINO', 'FEMININO', 'OUTRO', 'PREFIRO_NAO_INFORMAR'])
const bloodTypes = new Set(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'NAO_SEI'])

export function onlyDigits(value) {
  return String(value || '').replace(/\D/g, '')
}

export function maskCpf(value) {
  const digits = onlyDigits(value).slice(0, 11)
  return digits.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export function isValidCpf(value) {
  const cpf = onlyDigits(value)
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false
  const digitAt = (length, initialWeight) => {
    const sum = [...cpf.slice(0, length)].reduce((total, digit, index) => total + Number(digit) * (initialWeight - index), 0)
    const remainder = (sum * 10) % 11
    return remainder === 10 ? 0 : remainder
  }
  return digitAt(9, 10) === Number(cpf[9]) && digitAt(10, 11) === Number(cpf[10])
}

export function maskCep(value, country = 'Brasil') {
  const clean = String(value || '').trim()
  if (!/^brasil$/i.test(country)) return clean.slice(0, 12)
  const digits = onlyDigits(clean).slice(0, 8)
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits
}

export function maskPhone(value) {
  const digits = onlyDigits(value).slice(0, 11)
  if (digits.length <= 2) return digits ? `(${digits}` : ''
  const area = digits.slice(0, 2)
  const number = digits.slice(2)
  if (number.length <= 4) return `(${area}) ${number}`
  return `(${area}) ${number.slice(0, number.length - 4)}-${number.slice(-4)}`
}

export function getBirthDateError(value, today = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return 'Informe uma data válida.'
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return 'Essa data não existe no calendário.'
  const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  if (date > currentDate) return 'A data de nascimento não pode ser futura.'
  let age = today.getFullYear() - year
  if (today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day)) age -= 1
  if (age < 12 || age > 120) return 'A idade deve estar entre 12 e 120 anos.'
  return ''
}

export function getPasswordRules(password = '') {
  return [
    { label: '8 caracteres', valid: password.length >= 8 },
    { label: 'uma letra maiúscula', valid: /[A-Z]/.test(password) },
    { label: 'uma letra minúscula', valid: /[a-z]/.test(password) },
    { label: 'um número', valid: /\d/.test(password) },
  ]
}

export function validateRegistration(form, confirmation) {
  const errors = {}
  const fullName = form.nome.trim()
  if (fullName.length < 3 || fullName.split(/\s+/).length < 2) errors.nome = 'Informe nome e sobrenome (mínimo 3 caracteres).'

  const birthDateError = getBirthDateError(form.data_nascimento)
  if (birthDateError) errors.data_nascimento = birthDateError

  if (form.is_estrangeiro) {
    if (form.documento_estrangeiro.replace(/[^\p{L}\d]/gu, '').length < 4) errors.documento_estrangeiro = 'Informe um documento com pelo menos 4 caracteres alfanuméricos.'
  } else if (!isValidCpf(form.cpf)) {
    errors.cpf = 'Informe um CPF válido.'
  }

  if (!genders.has(form.genero)) errors.genero = 'Selecione uma opção.'
  if (!bloodTypes.has(form.tipo_sanguineo)) errors.tipo_sanguineo = 'Selecione uma opção.'

  const brazil = /^brasil$/i.test(form.pais.trim())
  const postalCode = brazil ? onlyDigits(form.cep) : form.cep.trim()
  if (brazil ? postalCode.length !== 8 : !/^[\p{L}\d -]{3,12}$/u.test(postalCode)) errors.cep = 'Informe um CEP ou código postal válido.'

  for (const [field, label, maximum] of [
    ['logradouro', 'Logradouro', 180],
    ['numero', 'Número', 20],
    ['bairro', 'Bairro', 120],
    ['cidade', 'Cidade', 120],
    ['estado', 'Estado', 50],
    ['pais', 'País', 80],
    ['nome_contato_emergencia', 'Contato de emergência', 150],
  ]) {
    const value = form[field].trim()
    if (value.length < (field === 'nome_contato_emergencia' ? 3 : 1)) errors[field] = `${label} é obrigatório.`
    else if (value.length > maximum) errors[field] = `${label} deve ter até ${maximum} caracteres.`
  }

  const emergencyDigits = onlyDigits(form.numero_emergencia)
  if (emergencyDigits.length < 10 || emergencyDigits.length > 15) errors.numero_emergencia = 'Use de 10 a 15 dígitos, incluindo DDD e DDI.'
  if (form.complemento.trim().length > 100) errors.complemento = 'Use até 100 caracteres.'
  if (form.equipe.trim().length > 120) errors.equipe = 'Use até 120 caracteres.'

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) || form.email.trim().length > 180) errors.email = 'Informe um e-mail válido.'
  if (getPasswordRules(form.senha).some((rule) => !rule.valid)) errors.senha = 'A senha não atende aos requisitos mínimos.'
  if (confirmation !== form.senha) errors.confirmar_senha = 'As senhas não coincidem.'
  return errors
}
