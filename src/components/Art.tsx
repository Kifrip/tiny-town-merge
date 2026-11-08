import { building } from "../game/config/buildings";
import type { CityId } from "../game/types";
export function BuildingArt({
  tier,
  city = "meadowville",
  silhouette = false,
}: {
  tier: number;
  city?: CityId;
  silhouette?: boolean;
}) {
  const b = building(city, tier),
    tropical = city === "sunshore",
    h =
      tier < 4
        ? 35
        : tier < 7
          ? 43
          : tier < 10
            ? 53
            : tier < 13
              ? 63
              : tier < 16
                ? 78
                : tier < 19
                  ? 86
                  : 92;
  const roof = b.roof,
    wall = b.color;
  const windows = (
    x: number,
    y: number,
    cols: number,
    rows: number,
    spacing = 10,
  ) =>
    Array.from({ length: cols * rows }, (_, i) => (
      <g key={`${x}-${i}`}>
        <rect
          x={x + (i % cols) * spacing}
          y={y + Math.floor(i / cols) * 11}
          width="5.5"
          height="7"
          rx="1"
          fill={tier > 12 ? "#b5e9df" : "#5c9299"}
        />
        <path
          d={`M${x + (i % cols) * spacing} ${y + Math.floor(i / cols) * 11 + 2}h5.5`}
          stroke="#d6f5e5"
          strokeWidth="1"
        />
      </g>
    ));
  return (
    <svg
      className={`building-art ${silhouette ? "silhouette" : ""}`}
      viewBox="0 0 120 124"
      aria-hidden="true"
    >
      <ellipse
        cx="60"
        cy="109"
        rx={tier > 8 ? 44 : 36}
        ry="9"
        fill="#365d4d"
        opacity=".15"
      />
      {tier <= 6 ? (
        <>
          {tier >= 4 && (
            <>
              <path d="M20 76 40 66 46 78v29H20" fill={wall} />
              <path d="m16 76 23-21 19 19-12 9-9-14-15 13" fill={roof} />
              {windows(25, 85, 2, 1)}
            </>
          )}
          <path
            d={`M${tier < 3 ? 33 : 40} ${109 - h} 70 ${100 - h} 94 ${111 - h}v${h - 3}L70 116l-${tier < 3 ? 37 : 30}-10Z`}
            fill={wall}
          />
          <path
            d={`M70 ${100 - h} 94 ${111 - h}v${h - 3}L70 116Z`}
            fill={roof}
            opacity=".25"
          />
          <path
            d={`M${tier < 3 ? 26 : 33} ${111 - h} 53 ${82 - h} 75 ${89 - h} 101 ${111 - h} 75 ${123 - h} 53 ${101 - h} ${tier < 3 ? 33 : 40} ${117 - h}Z`}
            fill={roof}
          />
          <path
            d={`m53 ${82 - h} 22 7 26 22-26 12-22-22Z`}
            fill="#fff"
            opacity=".14"
          />
          <path d={`M42 ${104 - h}v-15l9-3v12`} fill="#9b725a" />
          {windows(tier < 3 ? 42 : 48, 112 - h, 2, tier >= 3 ? 2 : 1, 14)}
          <path d="M60 96q6-4 10 0v18l-10-3" fill="#547c72" />
          {tier === 2 && (
            <path
              d="M32 101h22v5H32m3-9v9m15-9v9"
              stroke="#f5e9cd"
              strokeWidth="3"
            />
          )}
          {tier === 3 && <circle cx="62" cy="75" r="5" fill="#e7bb68" />}
          {tier === 5 && (
            <>
              <path d="M76 61V39l13 5v24Z" fill={wall} />
              <path d="m72 41 13-16 12 23-10 7Z" fill={roof} />
            </>
          )}
          {tier === 6 && (
            <>
              <path d="M28 76V50l17-6 10 9v28Z" fill={wall} />
              <path d="m24 51 17-18 19 21-16 6Z" fill={roof} />
              {windows(34, 57, 1, 2)}
            </>
          )}
        </>
      ) : (
        <>
          {tier >= 10 && (
            <>
              <path d="M18 86 45 76 69 87v23l-27 9-24-10Z" fill={wall} />
              {windows(25, 91, 3, 2)}
            </>
          )}
          <path
            d={`M${tier % 3 === 0 ? 36 : 40} ${110 - h} 69 ${100 - h} 96 ${112 - h}v${h - 3}L69 118  ${tier % 3 === 0 ? 36 : 40} 107Z`}
            fill={wall}
          />
          <path
            d={`M69 ${100 - h} 96 ${112 - h}v${h - 3}l-27 9Z`}
            fill={roof}
            opacity=".5"
          />
          <path
            d={`M${tier % 3 === 0 ? 32 : 36} ${110 - h} 68 ${97 - h} 100 ${111 - h} 69 ${124 - h}Z`}
            fill={roof}
          />
          {windows(46, 124 - h, 2, Math.max(2, Math.floor((h - 16) / 11)), 12)}
          {windows(76, 130 - h, 2, Math.max(2, Math.floor((h - 22) / 11)), 9)}
          {tier % 3 === 1 && (
            <>
              <path d={`M27 95V${130 - h}l15-5v79Z`} fill={wall} />
              {windows(31, 140 - h, 1, Math.max(1, Math.floor((h - 35) / 11)))}
            </>
          )}
          {tier % 3 === 2 && (
            <path d={`M55 ${105 - h}v-12l14-5 14 6v12l-14 6Z`} fill={wall} />
          )}
          {tier >= 13 && (
            <>
              <path
                d={`M68 ${103 - h}V${83 - h}`}
                stroke={roof}
                strokeWidth="3"
              />
              <circle cx="68" cy={83 - h} r="3" fill="#e7b957" />
            </>
          )}
          {tier >= 16 && (
            <>
              <path
                d={`M34 ${150 - h}Q64 ${90 - h} 103 ${140 - h}`}
                stroke="#92cbb7"
                strokeWidth="5"
                fill="none"
              />
              <path
                d={`M38 ${157 - h} 94 ${140 - h}`}
                stroke="#f4d779"
                strokeWidth="3"
              />
            </>
          )}
          {tier >= 19 && (
            <>
              <path d="M19 109V64l11-6 10 9v42" fill={roof} />
              {windows(24, 72, 1, 3)}
              <path d="M95 106V62l10 7v36" fill={roof} />
              <path
                d="M39 27 51 9 61 21 71 4 83 23 90 14 96 35 68 43Z"
                fill="#e6bb63"
              />
            </>
          )}
        </>
      )}
      <path
        d="M17 112q4-10 11 0m58 2q5-12 13-2"
        stroke={tropical ? "#4b9c82" : "#79a45f"}
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      {tropical && tier < 13 && (
        <>
          <path
            d="M17 107q6-16 2-31"
            stroke="#b68e60"
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M19 78Q7 62 5 79q7-7 14-1m0 0q12-18 20-2-13-4-20 2m0-1q-2-17-10-13"
            stroke="#469378"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}
export function CrateArt() {
  return (
    <svg className="crate-art" viewBox="0 0 120 124" aria-hidden="true">
      <ellipse cx="60" cy="107" rx="35" ry="9" fill="#365d4d" opacity=".16" />
      <path d="m25 61 35-15 35 15v39l-35 15-35-15Z" fill="#d7a866" />
      <path d="m60 76 35-15v39l-35 15Z" fill="#bb854c" />
      <path d="m25 61 35-15 35 15-35 15Z" fill="#f0cb8a" />
      <path d="m48 51 35 15v39l-11 5V71L37 56Z" fill="#f6e2b1" />
      <path d="M34 78v15l14 6V84Z" fill="#f5d9a3" />
      <path
        d="m37 88 4-5 4 8m-4-8v10"
        stroke="#a37b4b"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="m55 36 5-10 5 10m-5-10v13"
        stroke="#fff9e7"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="m30 45-6-6m65 6 6-6"
        stroke="#fff9e7"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
export function Tree({ palm = false }: { palm?: boolean }) {
  return (
    <svg viewBox="0 0 60 90" aria-hidden="true">
      {palm ? (
        <>
          <path
            d="M25 83q15-40 5-52"
            stroke="#b58e62"
            strokeWidth="7"
            fill="none"
          />
          <path
            d="M31 34Q3 4 4 42q14-16 27-8m0 0Q47 1 59 38q-18-15-28-4m0 0Q17 6 19 8"
            stroke="#4e9273"
            strokeWidth="9"
            strokeLinecap="round"
            fill="none"
          />
        </>
      ) : (
        <>
          <path d="M29 50v33" stroke="#a68760" strokeWidth="7" />
          <ellipse cx="29" cy="37" rx="24" ry="29" fill="#6a9d68" />
          <ellipse cx="23" cy="30" rx="19" ry="24" fill="#80af70" />
          <ellipse cx="20" cy="22" rx="11" ry="13" fill="#92bb7c" />
        </>
      )}
    </svg>
  );
}
export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    coin: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M14 8h-3a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4h-3m2-10v12" />
      </>
    ),
    shop: (
      <>
        <path d="M4 10v10h16V10M3 4h18l1 6H2l1-6Zm6 16v-7h6v7" />
      </>
    ),
    upgrade: (
      <>
        <path d="m5 14 7-8 7 8M12 6v15M4 3h16" />
      </>
    ),
    trophy: (
      <>
        <path d="M7 3h10v6a5 5 0 0 1-10 0V3Zm0 2H3v3a4 4 0 0 0 5 4m9-7h4v3a4 4 0 0 1-5 4m-4 2v7m-5 0h10" />
      </>
    ),
    book: (
      <>
        <path d="M12 6Q6 2 2 5v15q5-3 10 0 5-3 10 0V5q-4-3-10 1v14" />
      </>
    ),
    gear: (
      <>
        <path d="m9 3-1 3-3 1-2 4 2 2 1 4 4 1 2 3 3-2 4-2v-4l2-3-3-3-3-1-1-3Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    bolt: <path d="m13 2-9 12h7l-1 8 10-13h-8l1-7Z" />,
    leaf: (
      <>
        <path d="M4 20Q-1 4 21 3q0 21-16 15M4 20 16 8" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="3" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3" />
      </>
    ),
    sound: (
      <>
        <path d="m3 9 4 0 5-5v16l-5-5H3V9Zm13-3q8 6 0 12m-1-8q3 2 0 4" />
      </>
    ),
    check: <path d="m5 12 5 5L20 6" />,
    recycle: (
      <>
        <path d="m9 4 3-2 5 8m1-5-1 5-5-1M21 13v5H9m4 3-4-3 4-3M6 19l-4-3 5-9m-5 3 5-3 2 5" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.leaf}
    </svg>
  );
}
