import Image from 'next/image'

export function SafeZoneLogo({ size = 40, className = '' }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ${className}`}
      style={{ width: size, height: size }}
    >
      <Image src="/safezone-logo.png" alt="" width={size} height={size} className="size-full object-contain p-0.5" priority />
    </span>
  )
}
