import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata = {
  title: 'SafeZone — Defesa & Emergência',
  description:
    'Painel de monitoramento de riscos climáticos: alertas de enchentes e deslizamentos, mapa de áreas de risco, abrigos próximos e acompanhamento de pedidos de socorro.',
}

export const viewport = {
  themeColor: '#0f3d3e',
  colorScheme: 'light',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
