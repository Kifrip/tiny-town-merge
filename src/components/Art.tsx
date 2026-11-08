export { BuildingArt } from "./Building/BuildingArt";
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
    moon: <path d="M20 14A9 9 0 0 1 10 3a9 9 0 1 0 10 11Z" />,
    monitor: (
      <>
        <rect x="3" y="4" width="18" height="13" rx="2" />
        <path d="M8 21h8m-4-4v4" />
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
