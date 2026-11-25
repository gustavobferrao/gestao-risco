export function googleMapsRotaUrl({ coords, endereco }) {
  const destino = coords ? `${coords.lat},${coords.lng}` : endereco
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destino ?? '')}&travelmode=walking`
}
