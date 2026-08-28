type IconProps = { className?: string };

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Microchip — Digital */
export function DiosChip({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <rect x="15" y="15" width="18" height="18" rx="2.2" {...stroke} />
      <rect x="19.5" y="19.5" width="9" height="9" rx="1" {...stroke} />
      <path d="M24 15V8M24 40v-7M15 24H8M40 24h-7" {...stroke} />
      <path d="M17.6 17.6 12 12M30.4 17.6 36 12M17.6 30.4 12 36M30.4 30.4 36 36" {...stroke} />
      <circle cx="24" cy="8" r="1.35" fill="currentColor" />
      <circle cx="24" cy="40" r="1.35" fill="currentColor" />
      <circle cx="8" cy="24" r="1.35" fill="currentColor" />
      <circle cx="40" cy="24" r="1.35" fill="currentColor" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
      <circle cx="36" cy="12" r="1.2" fill="currentColor" />
      <circle cx="12" cy="36" r="1.2" fill="currentColor" />
      <circle cx="36" cy="36" r="1.2" fill="currentColor" />
    </svg>
  );
}

/** Bombilla con filamento de circuito — Innovador */
export function DiosBulb({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path
        d="M16.5 20.5a7.5 7.5 0 1 1 11.4 6.4c-.9.6-1.4 1.6-1.4 2.7v1.2h-7.5v-1.2c0-1.1-.5-2.1-1.4-2.7a7.48 7.48 0 0 1-1.1-6.4Z"
        {...stroke}
      />
      <path d="M20.2 31.8h7.6M21.2 35h5.6" {...stroke} />
      <path d="M24 16.2v4.2M21.2 22.2h5.6" {...stroke} />
      <circle cx="24" cy="16.2" r="1.15" fill="currentColor" />
      <circle cx="21.2" cy="22.2" r="1.05" fill="currentColor" />
      <circle cx="26.8" cy="22.2" r="1.05" fill="currentColor" />
    </svg>
  );
}

/** Maletín en mira — Oferta pertinente */
export function DiosTarget({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <circle cx="24" cy="24" r="13.5" {...stroke} />
      <path d="M24 7.5V12M24 36v4.5M7.5 24H12M36 24h4.5" {...stroke} />
      <rect x="18.2" y="19.2" width="11.6" height="9.2" rx="1.2" {...stroke} />
      <path d="M21 19.2v-1.3a3 3 0 0 1 6 0v1.3" {...stroke} />
    </svg>
  );
}

/** Hoja en ciclo — Sostenibilidad */
export function DiosLeaf({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path
        d="M16 30c0-8.5 6.2-16.4 16.8-18.2-1 10.4-8.2 17.4-16.8 18.2Z"
        {...stroke}
      />
      <path d="M18.2 28.4c3.4-2.2 7.6-7.2 9.4-13.6" {...stroke} />
      <path d="M14.5 18.5c-3.2 3-4.4 7.2-3.2 11.2" {...stroke} />
      <path d="M11.6 26.2 14.8 29l-3.6.8" {...stroke} />
      <path d="M33.5 29.5c3.2-3 4.4-7.2 3.2-11.2" {...stroke} />
      <path d="M36.4 21.8 33.2 19l3.6-.8" {...stroke} />
    </svg>
  );
}
