export function tempoAtras(minutos) {
  if (minutos < 60) return `há ${minutos} min`
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `há ${horas} h`
  const dias = Math.floor(horas / 24)
  return dias === 1 ? 'há 1 dia' : `há ${dias} dias`
}

export function formatarDistancia(metros) {
  if (metros < 1000) return `${metros} m`
  return `${(metros / 1000).toString().replace('.', ',')} km`
}
