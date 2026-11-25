export const onlyDigits = (valor = '') => valor.replace(/\D/g, '')

export function maskCpf(valor) {
  const d = onlyDigits(valor).slice(0, 11)
  return d
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2')
}

export function maskCnpj(valor) {
  const d = onlyDigits(valor).slice(0, 14)
  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

export function maskTelefone(valor) {
  const d = onlyDigits(valor).slice(0, 11)
  if (d.length <= 10) {
    return d.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2')
  }
  return d.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2')
}

export function maskCep(valor) {
  return onlyDigits(valor).slice(0, 8).replace(/^(\d{5})(\d)/, '$1-$2')
}

export function cpfValido(valor) {
  const d = onlyDigits(valor)
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false
  const digito = (base) => {
    const soma = base.split('').reduce((acc, n, i) => acc + Number(n) * (base.length + 1 - i), 0)
    const resto = (soma * 10) % 11
    return resto === 10 ? 0 : resto
  }
  return digito(d.slice(0, 9)) === Number(d[9]) && digito(d.slice(0, 10)) === Number(d[10])
}

export const cnpjValido = (valor) => onlyDigits(valor).length === 14
export const telefoneValido = (valor) => [10, 11].includes(onlyDigits(valor).length)
export const emailValido = (valor) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor.trim())

export function forcaSenha(senha) {
  let pontos = 0
  if (senha.length >= 8) pontos += 1
  if (senha.length >= 12) pontos += 1
  if (/[a-z]/.test(senha) && /[A-Z]/.test(senha)) pontos += 1
  if (/\d/.test(senha)) pontos += 1
  if (/[^A-Za-z0-9]/.test(senha)) pontos += 1
  const nivel = Math.min(4, Math.max(senha ? 1 : 0, pontos - (senha.length < 8 ? 1 : 0)))
  const rotulos = ['', 'Fraca', 'Razoável', 'Boa', 'Forte']
  return { nivel, rotulo: rotulos[nivel] }
}
