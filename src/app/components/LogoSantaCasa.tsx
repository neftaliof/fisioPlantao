import { useId } from "react";

interface LogoSantaCasaProps {
  /** variant controls the color scheme */
  variant?: "dark" | "light" | "color";
  /** size in px for the total width */
  size?: number;
  /** show only the emblem (trapezoid + figure), hide text */
  emblemaOnly?: boolean;
}

export function LogoSantaCasa({
  variant = "dark",
  size = 120,
  emblemaOnly = false,
}: LogoSantaCasaProps) {
  const gradId = useId().replace(/:/g, "");
  const gradId2 = `${gradId}-shine`;

  const isLight = variant === "light";
  const trapFill = isLight ? "#ffffff" : "#1a1a1a";
  const figureFill = isLight ? "#1a1a1a" : "#ffffff";
  const textColor = isLight ? "#ffffff" : "#1a1a1a";
  const subTextColor = isLight ? "rgba(255,255,255,0.75)" : "#555555";

  // Aspect ratio: emblema ≈ 1:0.8, total com texto ≈ 1:1.35
  const w = size;
  const emblemaH = size * 0.72;
  const totalH = emblemaOnly ? emblemaH : size * 1.35;

  return (
    <svg
      viewBox={`0 0 120 ${emblemaOnly ? 86 : 162}`}
      width={w}
      height={totalH}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Santa Casa Anápolis"
    >
      <defs>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cinzel:wght@400&display=swap');
        `}</style>
        <linearGradient
          id={gradId}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="35%" stopColor="#5eead4" />
          <stop offset="70%" stopColor="#99f6e4" />
          <stop offset="100%" stopColor="#e0f2fe" />
        </linearGradient>
        <linearGradient id={gradId2} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0d9488" />
          <stop offset="50%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#0e7490" />
        </linearGradient>
        <clipPath id="trap-clip">
          {/* Trapézio levemente inclinado, fiel ao original */}
          <polygon points="8,6 112,0 118,80 2,86" />
        </clipPath>
      </defs>

      {/* ── Trapézio / Emblema ── */}
      <polygon
        points="8,6 112,0 118,80 2,86"
        fill={trapFill}
      />

      {/* ── Figura do Santo (São Francisco / padroeiro) ── */}
      <g fill={figureFill} clipPath="url(#trap-clip)">
        {/* halo */}
        <circle cx="60" cy="14" r="7" fill="none" stroke={figureFill} strokeWidth="1.5" />

        {/* cabeça */}
        <ellipse cx="60" cy="14" rx="4.5" ry="5" />

        {/* corpo / hábito */}
        <path d="
          M52,22 Q60,19 68,22
          L74,60 Q66,65 60,65 Q54,65 46,60 Z
        " />

        {/* braço esquerdo estendido para cima (segurando pomba) */}
        <path d="M52,30 Q40,24 34,16 Q37,15 40,17 Q44,22 52,28 Z" />

        {/* braço direito levemente aberto */}
        <path d="M68,32 Q78,36 82,42 Q79,44 77,43 Q73,39 67,35 Z" />

        {/* pomba estilizada acima do braço esquerdo */}
        {/* corpo da pomba */}
        <ellipse cx="31" cy="13" rx="5" ry="3" transform="rotate(-20,31,13)" />
        {/* cabeça da pomba */}
        <circle cx="27" cy="10" r="2.2" />
        {/* asa */}
        <path d="M29,10 Q26,4 34,8 Q33,11 29,10 Z" />
        {/* cauda */}
        <path d="M36,14 Q40,12 40,16 Q38,16 36,14 Z" />

        {/* dobras do hábito */}
        <path d="M54,35 Q57,50 55,65" stroke={trapFill} strokeWidth="0.8" fill="none" opacity="0.4" />
        <path d="M63,34 Q66,49 65,65" stroke={trapFill} strokeWidth="0.8" fill="none" opacity="0.4" />

        {/* pés */}
        <ellipse cx="55" cy="65" rx="4" ry="2" />
        <ellipse cx="65" cy="65" rx="4" ry="2" />
      </g>

      {/* linha separadora fina abaixo do trapézio */}
      {!emblemaOnly && (
        <line x1="4" y1="90" x2="116" y2="90" stroke={subTextColor} strokeWidth="0.4" />
      )}

      {/* ── Tipografia ── */}
      {!emblemaOnly && (
        <>
          {/* "Santa Casa" em cursiva */}
          <text
            x="60"
            y="118"
            textAnchor="middle"
            fontFamily="'Great Vibes', cursive"
            fontSize="30"
            fill={textColor}
            letterSpacing="0.5"
          >
            Santa Casa
          </text>

          {/* "ANÁPOLIS" — degradê suave (sidebar clara: ouro → menta; escura: teal) */}
          <text
            x="60"
            y="136"
            textAnchor="middle"
            fontFamily="'Cinzel', serif"
            fontSize="10"
            fill={isLight ? `url(#${gradId})` : `url(#${gradId2})`}
            letterSpacing="4"
            fontWeight="600"
          >
            ANÁPOLIS
          </text>

          {/* linha fina decorativa */}
          <line x1="20" y1="141" x2="100" y2="141" stroke={subTextColor} strokeWidth="0.4" />

          {/* tag do sistema */}
          <text
            x="60"
            y="155"
            textAnchor="middle"
            fontFamily="'Cinzel', serif"
            fontSize="7"
            fill={isLight ? "rgba(255,255,255,0.55)" : "#888"}
            letterSpacing="2"
          >
            FISIOPLANTÃO
          </text>
        </>
      )}
    </svg>
  );
}
