import { MeadowvilleArt } from "./MeadowvilleArt";
import { building } from "../../game/config/buildings";
import type { CityId } from "../../game/types";
export function BuildingArt({
  tier,
  city = "meadowville",
  silhouette = false,
}: {
  tier: number;
  city?: CityId;
  silhouette?: boolean;
}) {
  if (city === "meadowville")
    return <MeadowvilleArt tier={tier} silhouette={silhouette} />;
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
          className="building-window"
          fill={`var(--building-window, ${tier > 12 ? "#b5e9df" : "#5c9299"})`}
        />
        <path
          d={`M${x + (i % cols) * spacing} ${y + Math.floor(i / cols) * 11 + 2}h5.5`}
          stroke="var(--building-glint, #d6f5e5)"
          strokeWidth="1"
        />
      </g>
    ));
  return (
    <svg
      className={`building-art ${silhouette ? "silhouette" : ""}`}
      data-art={`${city}-${tier}`}
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
