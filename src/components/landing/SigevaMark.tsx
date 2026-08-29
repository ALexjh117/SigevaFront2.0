import logoColor from "../../assets/Sigeva logo.svg";
import logoWhite from "../../assets/Sigeva white.svg";
import "./SigevaMark.css";

type MarkProps = {
  className?: string;
  size?: number;
};

/** Hexágono verde del mockup de la app. */
export function SigevaMark({ className, size = 28 }: MarkProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={className}
      aria-hidden
    >
      <polygon
        points="24,2.2 44.2,13.7 44.2,34.3 24,45.8 3.8,34.3 3.8,13.7"
        fill="#39A900"
      />
      <path
        d="M16.2 24.2c0-5.35 4.05-9.05 9.35-9.05 2.7 0 5.05.95 6.7 2.55l-2.85 2.7c-.95-.9-2.25-1.45-3.85-1.45-3.15 0-5.35 2.25-5.35 5.25s2.2 5.25 5.35 5.25c1.6 0 2.9-.55 3.85-1.45l2.85 2.7c-1.65 1.6-4 2.55-6.7 2.55-5.3 0-9.35-3.7-9.35-9.05Z"
        fill="#fff"
      />
    </svg>
  );
}

type WordmarkProps = {
  inverted?: boolean;
  className?: string;
};

export function SigevaWordmark({ inverted = false, className }: WordmarkProps) {
  return (
    <img
      src={inverted ? logoWhite : logoColor}
      alt="SIGEVA"
      className={`lp-logo-sigeva${className ? ` ${className}` : ""}`}
    />
  );
}

const LETTERS = ["S", "I", "G", "E", "V", "A"] as const;

type NameProps = {
  as?: "span" | "em";
  className?: string;
};

export function SigevaName({ as: Tag = "span", className }: NameProps) {
  return (
    <Tag className={`lp-name${className ? ` ${className}` : ""}`} aria-label="SIGEVA">
      {LETTERS.map((letra) => (
        <span key={letra} aria-hidden="true">
          {letra}
        </span>
      ))}
    </Tag>
  );
}
