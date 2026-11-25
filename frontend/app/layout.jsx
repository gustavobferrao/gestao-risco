import { Inter } from 'next/font/google'
import { AuthProvider } from '@/lib/auth-context'
import { PrefsProvider } from '@/lib/prefs-context'
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
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport = {
  themeColor: '#0B3D3C',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="font-sans antialiased">
        <PrefsProvider>
          <AuthProvider>{children}</AuthProvider>
        </PrefsProvider>
      </body>
    </html>
  )
}
