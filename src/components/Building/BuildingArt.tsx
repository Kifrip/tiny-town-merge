import type { ReactNode } from "react";
import type { CityId } from "../../game/types";
import { building } from "../../game/config/buildings";

function Windows({
  x,
  y,
  cols = 1,
  rows = 1,
  w = 6,
  h = 8,
  dx = 11,
  dy = 13,
  arch = false,
}: {
  x: number;
  y: number;
  cols?: number;
  rows?: number;
  w?: number;
  h?: number;
  dx?: number;
  dy?: number;
  arch?: boolean;
}) {
  return (
    <>
      {Array.from({ length: cols * rows }, (_, i) => {
        const a = x + (i % cols) * dx,
          b = y + Math.floor(i / cols) * dy;
        return (
          <g key={i}>
            <rect
              className="building-window"
              x={a}
              y={b}
              width={w}
              height={h}
              rx={arch ? w / 2 : 1}
              fill="var(--building-window, #598c9d)"
            />
            <path
              d={`M${a + 1} ${b + 2}h${w - 2}`}
              stroke="var(--building-glint, #d8f0e4)"
              strokeWidth="1"
              opacity=".75"
            />
          </g>
        );
      })}
    </>
  );
}
function Door({
  x,
  y,
  w = 9,
  h = 16,
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
}) {
  return (
    <>
      <path
        d={`M${x} ${y + h}v-${h - 4}q${w / 2}-${8} ${w} 0v${h - 4}Z`}
        fill="#365f59"
      />
      <circle cx={x + w - 2} cy={y + h / 2 + 2} r="1" fill="#efd38b" />
    </>
  );
}
function Box({
  x,
  y,
  w,
  h,
  d = 11,
  fill,
  roof,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  d?: number;
  fill: string;
  roof?: string;
}) {
  return (
    <>
      <path d={`M${x} ${y}l${d}-6h${w}l-${d} 6Z`} fill={roof || fill} />
      <rect x={x} y={y} width={w} height={h} rx="1" fill={fill} />
      <path d={`M${x + w} ${y}l${d}-6v${h}l-${d} 6Z`} fill={fill} />
      <path
        d={`M${x + w} ${y}l${d}-6v${h}l-${d} 6Z`}
        fill="#1c4b50"
        opacity=".22"
      />
    </>
  );
}
function Gable({
  x,
  y,
  w,
  rise,
  fill,
  wall,
}: {
  x: number;
  y: number;
  w: number;
  rise: number;
  fill: string;
  wall: string;
}) {
  return (
    <>
      <path
        d={`M${x} ${y} ${x + w / 2} ${y - rise} ${x + w} ${y}Z`}
        fill={wall}
      />
      <path
        d={`M${x + w / 2} ${y - rise}l11-6 ${w / 2 + 5} ${rise + 3}-11 6Z`}
        fill={fill}
      />
      <path
        d={`M${x - 5} ${y + 2} ${x + w / 2} ${y - rise - 3} ${x + w + 5} ${y + 2}l-4 5-${w / 2 + 1}-${rise - 1}-${w / 2 + 1} ${rise - 1}Z`}
        fill={fill}
      />
      <path
        d={`M${x - 1} ${y + 7} ${x + w / 2} ${y - rise + 5} ${x + w + 1} ${y + 7}`}
        fill="none"
        stroke="#fff1d3"
        strokeWidth="1.5"
        opacity=".65"
      />
    </>
  );
}
function Balcony({ x, y, w }: { x: number; y: number; w: number }) {
  return (
    <g fill="none" stroke="#f5ebd7" strokeWidth="2">
      <path d={`M${x} ${y}h${w}v6h-${w}Z`} />
      <path d={`M${x + w / 3} ${y}v6m${w / 3}-6v6`} />
    </g>
  );
}
function Solar({ x, y }: { x: number; y: number }) {
  return (
    <>
      <path d={`M${x} ${y}l25-7 12 10-25 7Z`} fill="#376a8b" />
      <path
        d={`M${x + 7} ${y - 2}l12 10m-4-12 12 10m-20-3 25-7`}
        stroke="#a5dce0"
        strokeWidth="1"
        fill="none"
      />
    </>
  );
}
function Dome({
  x,
  y,
  w,
  h,
  fill,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
}) {
  return (
    <>
      <path d={`M${x} ${y}a${w / 2} ${h} 0 0 1 ${w} 0Z`} fill={fill} />
      <path
        d={`M${x + w / 2} ${y - h}q-${w / 4} ${h / 2} 0 ${h}m0-${h}q${w / 4} ${h / 2} 0 ${h}`}
        stroke="#fff2ce"
        opacity=".45"
        strokeWidth="1.5"
        fill="none"
      />
    </>
  );
}
function Awning({
  x,
  y,
  w,
  roof,
}: {
  x: number;
  y: number;
  w: number;
  roof: string;
}) {
  return (
    <>
      {Array.from({ length: 6 }, (_, i) => (
        <path
          key={i}
          d={`M${x + (i * w) / 6} ${y}h${w / 6}l3 10q-${w / 12} 5-${w / 6} 0Z`}
          fill={i % 2 ? "#f8edc9" : roof}
        />
      ))}
      <path
        d={`M${x} ${y + 10}v15m${w} -15v15`}
        stroke="#f0d4a1"
        strokeWidth="2"
      />
    </>
  );
}

function Meadow({
  tier,
  wall,
  roof,
}: {
  tier: number;
  wall: string;
  roof: string;
}): ReactNode {
  switch (tier) {
    case 1:
      return (
        <>
          <Box x={36} y={79} w={40} h={28} fill={wall} />
          <Gable x={36} y={79} w={40} rise={23} fill={roof} wall={wall} />
          <Windows x={42} y={86} w={8} />
          <Door x={60} y={91} />
          <path d="M77 73V56h8v20" fill="#a97c61" />
          <path d="M33 109h50" stroke="#e5c589" strokeWidth="3" />
        </>
      );
    case 2:
      return (
        <>
          <Box x={27} y={78} w={57} h={29} fill={wall} />
          <Gable x={25} y={79} w={61} rise={35} fill={roof} wall={wall} />
          <path
            d="M30 86h51m-51 9h51m-51 9h51"
            stroke="#8d6249"
            opacity=".5"
            strokeWidth="2"
          />
          <Windows x={34} y={86} w={10} h={9} />
          <Windows x={69} y={86} w={9} />
          <Door x={52} y={91} />
          <path
            d="M22 109h69m-62-8v10m55-10v10"
            stroke="#e7c697"
            strokeWidth="3"
          />
          <path d="M73 57V39h10v25" fill="#916d5b" />
        </>
      );
    case 3:
      return (
        <>
          <Box x={42} y={55} w={33} h={53} fill={wall} />
          <path d="M39 57V48h7v-8h7V29h12v11h7v8h7v9Z" fill={roof} />
          <path d="M45 53V46h7v-8h10v8h7v7Z" fill={wall} />
          <Windows x={48} y={63} cols={2} rows={2} dx={14} />
          <Door x={54} y={92} />
          <path d="M38 109h43" stroke="#c1cdd0" strokeWidth="3" />
        </>
      );
    case 4:
      return (
        <>
          <Box x={22} y={76} w={46} h={31} fill={wall} roof={roof} />
          <Box x={59} y={58} w={28} h={49} fill={wall} roof={roof} />
          <path d="M17 75h55m-17-18h40" stroke={roof} strokeWidth="6" />
          <Windows x={28} y={83} cols={3} w={9} h={17} dx={12} />
          <Windows x={66} y={67} cols={2} rows={2} dx={12} />
          <Door x={68} y={92} />
          <path d="M18 109h36l-7 7H14Z" fill="#8fc5c1" />
          <path
            d="M25 61v14m21-14v14m-24-15h31m-25-4v8m10-8v8m10-8v8"
            stroke="#c3ae7a"
            strokeWidth="2"
          />
        </>
      );
    case 5:
      return (
        <>
          <Box x={24} y={65} w={63} h={42} fill={wall} />
          <path d="m18 66 14-24h52l18 20-15 9H24Z" fill={roof} />
          <path
            d="M35 45V31h8v15m34-1V31h8v16"
            fill="none"
            stroke="#91645b"
            strokeWidth="6"
          />
          <Windows x={32} y={74} cols={4} dx={14} />
          <Windows x={32} y={92} cols={4} dx={14} />
          <path d="M48 96V78h16v28" fill="#f7ead3" />
          <Door x={51} y={91} />
          <path d="M44 109h26" stroke="#d5b58f" strokeWidth="4" />
        </>
      );
    case 6:
      return (
        <>
          <Box x={36} y={68} w={50} h={39} fill={wall} />
          <Gable x={36} y={68} w={50} rise={25} fill={roof} wall={wall} />
          <Windows x={53} y={77} cols={2} dx={17} />
          <Windows x={54} y={95} cols={2} dx={17} />
          <path d="M20 61 34 54 47 61v45l-14 6-13-7Z" fill={wall} />
          <path d="M34 54 47 61v45l-14 6Z" fill={roof} opacity=".23" />
          <path d="m16 63 18-35 18 35-18 7Z" fill={roof} />
          <Windows x={27} y={73} rows={2} h={9} dy={15} />
          <Door x={59} y={94} />
          <circle cx="34" cy="30" r="3" fill="#ddbc6c" />
        </>
      );
    case 7:
      return (
        <>
          <Box x={19} y={73} w={77} h={34} fill={wall} />
          <Box x={40} y={55} w={34} h={52} fill={wall} />
          <Gable x={18} y={73} w={31} rise={20} fill={roof} wall={wall} />
          <Gable x={71} y={73} w={27} rise={20} fill={roof} wall={wall} />
          <Gable x={38} y={55} w={38} rise={27} fill={roof} wall={wall} />
          <Windows x={25} y={85} cols={2} dx={12} />
          <Windows x={78} y={85} cols={2} dx={12} />
          <Windows x={48} y={64} cols={2} dx={15} />
          <path d="m41 89 17-13 18 13Z" fill="#f9e3ac" />
          <path d="M44 90v19m27-19v19" stroke="#f9edce" strokeWidth="5" />
          <Door x={53} y={93} />
          <path d="M39 112h38" stroke="#d3bb91" strokeWidth="4" />
        </>
      );
    case 8:
      return (
        <>
          <Box x={28} y={44} w={59} h={64} fill={wall} roof={roof} />
          <Box x={21} y={68} w={16} h={40} fill={roof} />
          <path d="M24 43h68v7H24" fill={roof} />
          <Windows x={38} y={55} cols={4} rows={4} dx={12} dy={12} />
          <Balcony x={34} y={63} w={51} />
          <Balcony x={34} y={77} w={51} />
          <Balcony x={34} y={91} w={51} />
          <Door x={56} y={97} h={12} />
          <path d="M27 109h66" stroke="#c3a98d" strokeWidth="3" />
        </>
      );
    case 9:
      return (
        <>
          <Box x={21} y={54} w={25} h={53} fill={wall} roof={roof} />
          <Box x={75} y={45} w={22} h={62} fill={wall} roof={roof} />
          <Box x={44} y={77} w={32} h={30} fill={wall} />
          <Windows x={28} y={64} cols={2} rows={3} dx={11} />
          <Windows x={81} y={55} rows={4} />
          <Windows x={50} y={86} cols={2} w={8} dx={14} />
          <Door x={57} y={96} h={12} />
          <path d="M18 52h30m24-9h29m-59 33h34" stroke={roof} strokeWidth="6" />
          <path d="M44 107h33l-8 9H36Z" fill="#8fbb87" />
          <circle cx="56" cy="110" r="4" fill="#d8d6ba" />
        </>
      );
    case 10:
      return (
        <>
          <Box x={17} y={79} w={80} h={29} fill={wall} />
          <Gable x={15} y={79} w={84} rise={19} fill={roof} wall={wall} />
          <Box x={48} y={39} w={24} h={68} fill={wall} />
          <path d="M44 40 60 20 78 35 72 44Z" fill={roof} />
          <circle cx="60" cy="52" r="9" fill="#fff0bd" />
          <path d="M60 46v7l5 3" stroke="#54675b" strokeWidth="2" fill="none" />
          <Windows x={55} y={69} cols={1} rows={2} />
          <Awning x={20} y={86} w={29} roof={roof} />
          <Awning x={72} y={86} w={25} roof={roof} />
          <Door x={55} y={94} />
        </>
      );
    case 11:
      return (
        <>
          <Box x={20} y={65} w={77} h={43} fill={wall} />
          <path d="M17 67V51l25 12V47l25 13V43l32 17v9Z" fill={roof} />
          <path
            d="M22 54v8h14m11-12v10h14m11-13v12h17"
            stroke="#a6c9cb"
            strokeWidth="4"
            fill="none"
          />
          <Windows x={27} y={77} cols={5} w={9} h={22} dx={14} />
          <path d="M88 53V25h9v33" fill="#865a55" />
          <path d="M85 28h15" stroke={roof} strokeWidth="4" />
          <path d="M18 110h86" stroke="#9a806c" strokeWidth="3" />
        </>
      );
    case 12:
      return (
        <>
          <Box x={33} y={27} w={50} h={81} d={17} fill={wall} roof={roof} />
          <path d="m33 27 17-7 50 0-17 7Z" fill="#badde0" />
          <path d="M39 32h37v68H39Z" fill="#78b4c2" />
          {Array.from({ length: 6 }, (_, i) => (
            <path
              key={i}
              d={`M39 ${41 + i * 11}h37m7-5 17-7`}
              stroke="#daf3e8"
              strokeWidth="2"
              opacity=".7"
            />
          ))}
          <path
            d="M49 32v68m14-68v68m-24-1 37-54"
            stroke="#e5f6ec"
            strokeWidth="1.5"
            opacity=".7"
          />
          <Door x={54} y={94} w={12} />
        </>
      );
    case 13:
      return (
        <>
          <Box x={43} y={30} w={26} h={78} fill={wall} />
          <path d="M40 32 56 9 84 25 69 35Z" fill={roof} />
          <path d="M56 9V3" stroke="#d0ae62" strokeWidth="3" />
          <Box x={24} y={71} w={18} h={37} fill={roof} />
          <Box x={79} y={58} w={17} h={50} fill={wall} />
          <Windows x={49} y={41} cols={2} rows={5} dx={11} />
          <Windows x={29} y={81} rows={2} />
          <Windows x={84} y={69} rows={3} />
          <Door x={52} y={96} h={13} />
        </>
      );
    case 14:
      return (
        <>
          <Box x={21} y={36} w={25} h={72} fill={wall} roof={roof} />
          <Box x={75} y={21} w={24} h={87} fill={wall} roof={roof} />
          <Windows x={27} y={46} cols={2} rows={5} dx={10} dy={12} />
          <Windows x={81} y={32} cols={2} rows={6} dx={10} dy={12} />
          <path d="M43 61h35v16H43Z" fill={roof} />
          <Windows x={49} y={65} cols={3} w={5} h={8} dx={9} />
          <path d="M17 35h33m22-15h32" stroke="#d1e6b7" strokeWidth="4" />
          <path d="M17 111h87" stroke={roof} strokeWidth="5" />
        </>
      );
    case 15:
      return (
        <>
          <Box x={31} y={76} w={54} h={32} fill={wall} />
          <Box x={40} y={49} w={37} h={30} fill={wall} />
          <Box x={48} y={22} w={23} h={31} fill={wall} />
          <path
            d="m25 76 60-5 12 8-12 6H27Zm9-27 44-4 13 7-13 6H35Zm8-27L60 8l23 13-12 8H44Z"
            fill={roof}
          />
          <path d="M60 9V3" stroke="#e8c977" strokeWidth="3" />
          <Windows x={39} y={88} cols={4} dx={12} />
          <Windows x={47} y={60} cols={3} dx={10} />
          <Windows x={53} y={34} cols={2} dx={9} />
          <Door x={54} y={97} h={12} />
        </>
      );
    case 16:
      return (
        <>
          <Box x={23} y={67} w={22} h={41} fill={wall} />
          <Box x={78} y={62} w={20} h={46} fill={wall} />
          <path
            d="M28 70C28 7 95 7 95 65"
            stroke={roof}
            strokeWidth="17"
            fill="none"
          />
          <path
            d="M28 70C28 7 95 7 95 65"
            stroke="#f1d779"
            strokeWidth="3"
            fill="none"
          />
          <Windows x={29} y={77} rows={2} />
          <Windows x={84} y={72} rows={3} />
          <Box x={43} y={87} w={35} h={21} fill={wall} />
          <Solar x={42} y={86} />
          <Door x={56} y={97} h={12} />
        </>
      );
    case 17:
      return (
        <>
          <Box x={42} y={17} w={35} h={91} fill={wall} />
          <path
            d="m34 30 51-8 12 7-51 10Zm-7 26 58-10 14 8-58 11Zm4 29 54-10 15 8-54 12Z"
            fill={roof}
          />
          <Windows x={49} y={39} cols={2} rows={5} dx={14} />
          <path
            d="M39 31q-17 11 4 25t0 29q-15 8-3 22"
            fill="none"
            stroke="#77a867"
            strokeWidth="7"
          />
          <path d="M76 21 61 5 42 17" fill={roof} />
          <Door x={54} y={97} h={12} />
          <path d="M32 109h58" stroke="#e0d29e" strokeWidth="4" />
        </>
      );
    case 18:
      return (
        <>
          <Box x={25} y={73} w={68} h={35} fill={wall} />
          <path d="M22 76q36 13 77-3v-9H24Z" fill={roof} />
          <Dome x={25} y={66} w={70} h={37} fill={roof} />
          <path d="m58 46 25-23 13 9-27 23Z" fill="#d5bc78" />
          <path d="m82 24 9-9 14 10-10 9Z" fill="#7faaa9" />
          <Windows x={32} y={86} cols={5} w={7} dx={12} />
          <Door x={57} y={96} h={13} />
          <path d="M25 111h75" stroke="#c3b18b" strokeWidth="4" />
        </>
      );
    case 19:
      return (
        <>
          <path d="M16 104 35 37 52 105 35 115Z" fill={roof} />
          <path d="M35 37 41 100 52 105 35 115Z" fill="#163f48" opacity=".25" />
          <path d="M40 103 63 6 86 103 63 119Z" fill={wall} />
          <path d="M63 6v113l23-16Z" fill={roof} />
          <path d="M78 104 93 33 110 104 93 115Z" fill={wall} />
          <path d="M93 33v82l17-11Z" fill={roof} />
          <path
            d="m52 58 22 6m-27 16 34 5M26 78l16 5m44-10 16 5"
            stroke="#cce6b3"
            strokeWidth="3"
          />
          <path d="M21 108h83" stroke="#e5c76e" strokeWidth="5" />
          <Door x={58} y={98} h={14} />
        </>
      );
    default:
      return (
        <>
          <Box x={20} y={77} w={80} h={31} fill={wall} />
          <Box x={25} y={39} w={18} h={67} fill={wall} />
          <Box x={77} y={34} w={18} h={72} fill={wall} />
          <Box x={48} y={21} w={23} h={87} fill={wall} />
          <path
            d="m20 39 6-18 8 9 8-17 6 26Zm25-18 5-16 10 7 10-9 7 18Zm27 13 8-17 8 8 8-14 5 23Z"
            fill={roof}
          />
          <path d="M41 64h36v13H41" fill={roof} />
          <Windows x={29} y={49} rows={4} />
          <Windows x={82} y={45} rows={4} />
          <Windows x={54} y={32} cols={2} rows={5} dx={10} />
          <path d="M44 109V90q15-21 31 0v19" fill={roof} />
          <Door x={53} y={94} w={13} />
          <path d="M17 113h88" stroke="#dfc478" strokeWidth="5" />
        </>
      );
  }
}

function Coast({
  tier,
  wall,
  roof,
}: {
  tier: number;
  wall: string;
  roof: string;
}): ReactNode {
  switch (tier) {
    case 1:
      return (
        <>
          <path
            d="M31 95v15m49-15v15m-48-7h49"
            stroke="#9d7c55"
            strokeWidth="4"
          />
          <Box x={32} y={78} w={46} h={25} fill={wall} />
          <path d="M24 80q6-25 33-32 29 6 38 29L61 89Z" fill={roof} />
          <path
            d="m35 75 19-20m-7 25 13-25m1 27 4-26m10 23-6-23"
            stroke="#f1d394"
            strokeWidth="2"
          />
          <Windows x={38} y={87} w={10} />
          <Door x={58} y={88} h={16} />
          <path d="M26 110h62" stroke="#d6b583" strokeWidth="3" />
        </>
      );
    case 2:
      return (
        <>
          <Box x={29} y={70} w={52} h={37} fill={wall} roof={roof} />
          <path d="M25 71V58h13v6h38v-6h12v13Z" fill={roof} />
          <path d="M33 63V51q17-18 33 0v12" fill={wall} />
          <Windows x={39} y={78} w={10} h={14} arch />
          <Door x={61} y={90} />
          <path
            d="M83 83h14v7H83v7h14v7H83"
            fill="none"
            stroke="#eed7ac"
            strokeWidth="4"
          />
        </>
      );
    case 3:
      return (
        <>
          <path d="M31 101v12m52-12v12" stroke="#9e8760" strokeWidth="4" />
          <path d="M28 103 56 34l35 69Z" fill={wall} />
          <path d="m22 104 34-79 42 76-8 5-34-63-27 65Z" fill={roof} />
          <path d="m56 48 22 48H38Z" fill="#9bc6c7" />
          <path d="M56 62v40M42 87h29" stroke="#e7eed5" strokeWidth="3" />
          <Door x={52} y={90} h={15} />
          <path d="M23 109h72" stroke="#edcd9c" strokeWidth="5" />
        </>
      );
    case 4:
      return (
        <>
          <Box x={21} y={81} w={65} h={27} fill={wall} />
          <Box x={36} y={59} w={44} h={25} fill={wall} roof={roof} />
          <path d="M31 58h57v6H31" fill={roof} />
          <Windows x={44} y={68} cols={3} w={8} dx={12} />
          <Windows x={27} y={89} cols={4} w={10} h={12} dx={13} />
          <Balcony x={26} y={80} w={58} />
          <path d="M16 110h37l-7 8H11Z" fill="#62c9ce" />
          <path
            d="M48 51V38m-6 0h29m-13 0v14"
            stroke="#d8b97b"
            strokeWidth="2.5"
          />
        </>
      );
    case 5:
      return (
        <>
          <Box x={24} y={77} w={70} h={31} fill={wall} />
          <path
            d="M18 78q0-24 23-27Q60 21 77 51q25 0 25 24L63 86Z"
            fill={roof}
          />
          <path
            d="M41 51 62 80 77 51m-50 9 35 20 31-20"
            stroke="#f9dbbb"
            strokeWidth="2"
            fill="none"
          />
          <Windows x={32} y={87} cols={4} dx={16} w={8} h={13} arch />
          <Door x={58} y={93} />
        </>
      );
    case 6:
      return (
        <>
          <Box x={23} y={72} w={60} h={35} fill={wall} />
          <path d="m18 72 14-19h48l18 15-15 10H23Z" fill={roof} />
          <Box x={75} y={43} w={22} h={64} fill={wall} />
          <Dome x={72} y={43} w={29} h={19} fill={roof} />
          <Windows x={80} y={54} h={13} arch />
          <Windows x={30} y={82} cols={3} dx={17} w={10} h={15} arch />
          <Balcony x={27} y={96} w={49} />
          <Door x={81} y={93} />
        </>
      );
    case 7:
      return (
        <>
          <path d="M16 92q34 3 87-19l-9 33q-45 14-73 1Z" fill={wall} />
          <path d="m21 79 21-20h48l13 14q-42 17-87 19Z" fill={roof} />
          <path d="M32 66 48 46h34l10 13Z" fill={wall} />
          <Windows x={45} y={54} cols={3} w={8} dx={12} />
          <Windows x={31} y={93} cols={5} w={8} dx={13} />
          <path
            d="M64 46V24m0 2 21 9-21 4M24 85q44-3 72-16"
            stroke="#e6cf95"
            strokeWidth="2.5"
            fill="none"
          />
          <circle
            cx="91"
            cy="94"
            r="5"
            fill="none"
            stroke={roof}
            strokeWidth="3"
          />
        </>
      );
    case 8:
      return (
        <>
          <Box x={20} y={80} w={74} h={28} fill={wall} />
          <Box x={32} y={57} w={53} h={25} fill={wall} />
          <Box x={45} y={34} w={32} h={26} fill={wall} />
          <path
            d="M16 80h81m-68-23h59M42 34h39"
            stroke={roof}
            strokeWidth="5"
          />
          <Windows x={27} y={87} cols={5} w={8} dx={13} />
          <Windows x={39} y={65} cols={3} w={8} dx={14} />
          <Windows x={51} y={42} cols={2} w={8} dx={15} />
          <Balcony x={26} y={99} w={66} />
          <Balcony x={37} y={75} w={46} />
          <path d="M68 33V17l15 4-15 6" fill={roof} />
        </>
      );
    case 9:
      return (
        <>
          <Box x={20} y={61} w={27} h={46} fill={wall} />
          <Dome x={19} y={61} w={30} h={22} fill={roof} />
          <Box x={76} y={58} w={23} h={49} fill={wall} />
          <Dome x={74} y={58} w={28} h={20} fill={roof} />
          <Box x={45} y={84} w={31} h={23} fill={wall} />
          <Windows x={27} y={72} cols={2} rows={2} dx={11} h={10} arch />
          <Windows x={82} y={70} rows={2} h={11} arch />
          <Windows x={53} y={92} cols={2} w={8} dx={13} arch />
          <ellipse cx="59" cy="111" rx="13" ry="5" fill="#65b5bc" />
          <path d="M59 106v-6" stroke="#b4e8e1" strokeWidth="3" />
        </>
      );
    case 10:
      return (
        <>
          <Box x={18} y={82} w={78} h={26} fill={wall} />
          <Awning x={20} y={84} w={75} roof={roof} />
          <path d="M49 82 53 27h19l8 55Z" fill={wall} />
          <path d="M52 44h23v10H51m0 15h27v10H50" fill={roof} />
          <path d="M48 27h30v-9l-15-9-15 9Z" fill={roof} />
          <path d="M54 19h18v9H54" fill="#f4dc82" />
          <path d="M45 29h35" stroke="#ead5a6" strokeWidth="3" />
          <Windows x={58} y={32} w={7} h={8} />
        </>
      );
    case 11:
      return (
        <>
          <path
            d="M23 101v14m34-14v14m36-14v14"
            stroke="#9f865e"
            strokeWidth="4"
          />
          <Box x={20} y={71} w={37} h={33} fill={wall} />
          <Box x={60} y={60} w={35} h={44} fill={wall} />
          <Gable x={18} y={71} w={40} rise={25} fill={roof} wall={wall} />
          <Gable x={58} y={60} w={40} rise={31} fill={roof} wall={wall} />
          <Windows x={27} y={82} cols={2} w={9} h={15} dx={16} />
          <Windows x={67} y={73} cols={2} w={9} h={22} dx={16} />
          <path d="M16 109h85m-79-3 70-2" stroke="#c0a270" strokeWidth="3" />
        </>
      );
    case 12:
      return (
        <>
          <path d="M29 108Q27 55 82 13q-8 49 18 89l-33 16Z" fill={wall} />
          <path d="M82 13Q72 63 100 102l-33 16Z" fill={roof} />
          <path
            d="M34 93Q39 58 76 26M42 106Q48 65 79 22m-39 52 49 11m-37-29 30 8"
            stroke="#d6f1e9"
            strokeWidth="2"
            fill="none"
            opacity=".8"
          />
          <Box x={19} y={84} w={20} h={25} fill={wall} />
          <Windows x={24} y={91} w={8} h={11} />
          <Door x={57} y={99} h={12} />
        </>
      );
    case 13:
      return (
        <>
          <Box x={36} y={70} w={48} h={39} fill={wall} />
          <Box x={46} y={45} w={33} h={29} fill={wall} />
          <Box x={34} y={24} w={37} h={26} fill={wall} />
          <path d="M30 23h48v8H30m12 13h46v8H42m-10 17h60v8H32" fill={roof} />
          <Windows x={43} y={82} cols={3} rows={2} dx={14} />
          <Windows x={52} y={56} cols={2} dx={13} />
          <Windows x={41} y={34} cols={2} dx={15} />
          <path
            d="M26 110q-5-20 4-27m60 25q12-15 7-27"
            stroke="#df937d"
            strokeWidth="6"
            fill="none"
          />
        </>
      );
    case 14:
      return (
        <>
          <path d="M19 40q15-12 29 0v66q-14 10-29 0Z" fill={wall} />
          <Dome x={19} y={40} w={29} h={18} fill={roof} />
          <path d="M75 29q15-12 29 0v77q-14 10-29 0Z" fill={wall} />
          <Dome x={75} y={29} w={29} h={17} fill={roof} />
          <Windows x={25} y={51} cols={2} rows={4} dx={11} />
          <Windows x={81} y={40} cols={2} rows={5} dx={11} />
          <path d="M47 63h29v14H47Z" fill={roof} />
          <Windows x={52} y={67} cols={2} dx={12} />
          <path d="M18 111h88" stroke="#d9c78c" strokeWidth="4" />
        </>
      );
    case 15:
      return (
        <>
          <path d="M27 109Q54 75 69 5q25 39 16 74l14 29-33 10Z" fill={wall} />
          <path d="M69 5Q55 82 66 118l33-10-14-29Q94 44 69 5Z" fill={roof} />
          <path
            d="M43 92Q63 63 69 19m-26 68 41 7m-32-26 35 6m-27-28 26 6"
            stroke="#c2ece7"
            strokeWidth="2"
            fill="none"
          />
          <path d="M19 110h82" stroke="#e9cc8d" strokeWidth="4" />
          <Door x={55} y={99} h={12} />
        </>
      );
    case 16:
      return (
        <>
          <Box x={22} y={81} w={20} h={27} fill={wall} />
          <Box x={82} y={78} w={19} h={30} fill={wall} />
          <path d="M33 83 49 60m41 20L76 59" stroke={wall} strokeWidth="13" />
          <ellipse
            cx="62"
            cy="42"
            rx="32"
            ry="31"
            fill="none"
            stroke={roof}
            strokeWidth="13"
          />
          <ellipse
            cx="62"
            cy="42"
            rx="31"
            ry="30"
            fill="none"
            stroke="#f9e2a3"
            strokeWidth="2"
          />
          <Solar x={21} y={82} />
          <Solar x={69} y={80} />
          <path d="M48 109V91q14-11 27 0v18" fill={wall} />
          <Door x={57} y={97} h={12} />
        </>
      );
    case 17:
      return (
        <>
          <Box x={49} y={18} w={22} h={89} fill={roof} />
          <ellipse cx="60" cy="91" rx="41" ry="17" fill={wall} />
          <ellipse cx="60" cy="66" rx="34" ry="17" fill={wall} />
          <ellipse cx="60" cy="40" rx="25" ry="15" fill={wall} />
          <path
            d="M21 93q39 18 78-2M28 68q33 17 64-2M37 42q24 12 46-2"
            stroke={roof}
            strokeWidth="5"
            fill="none"
          />
          <Windows x={29} y={86} cols={5} w={7} dx={13} />
          <Windows x={38} y={61} cols={4} w={6} dx={12} />
          <Windows x={44} y={35} cols={3} w={6} dx={11} />
          <circle cx="60" cy="15" r="10" fill="#f5e9c4" />
        </>
      );
    case 18:
      return (
        <>
          <Box x={24} y={80} w={72} h={28} fill={wall} />
          <path
            d="M19 81Q14 44 41 38L60 12l21 26q29 7 21 43L60 67Z"
            fill={roof}
          />
          <path
            d="M41 38 60 67 81 38M60 12v55M25 56l35 11 35-12"
            stroke="#e5d9b1"
            strokeWidth="2"
            fill="none"
          />
          <circle cx="60" cy="46" r="13" fill="#cfdfda" />
          <path d="m54 42 17-13 8 8-17 13Z" fill="#d9b775" />
          <Windows x={32} y={88} cols={5} w={7} dx={13} />
          <Door x={57} y={98} h={12} />
        </>
      );
    case 19:
      return (
        <>
          <Box x={18} y={91} w={82} h={18} fill={roof} />
          <path d="M18 91Q11 57 30 40q31 5 29 51Z" fill={wall} />
          <path d="M38 91Q29 30 61 10q34 24 23 81Z" fill={wall} />
          <path d="M75 91q-1-50 29-65 15 35-6 65Z" fill={wall} />
          <path
            d="M30 40 49 91M61 10l5 81m38-65L86 91"
            stroke={roof}
            strokeWidth="4"
          />
          <path d="M28 91h64v14H28" fill="#67adb3" />
          <Windows x={34} y={95} cols={5} w={6} h={7} dx={12} />
          <path d="M13 113h94" stroke="#dfcc95" strokeWidth="4" />
        </>
      );
    default:
      return (
        <>
          <Box x={18} y={81} w={83} h={27} fill={wall} />
          <Box x={25} y={49} w={19} h={59} fill={wall} />
          <Box x={78} y={43} w={20} h={65} fill={wall} />
          <Box x={49} y={30} w={23} h={78} fill={wall} />
          <circle
            cx="63"
            cy="18"
            r="13"
            fill="none"
            stroke={roof}
            strokeWidth="5"
          />
          <path d="M20 49 34 28 50 49Zm52-6 16-22 16 22Z" fill={roof} />
          <path d="M43 65h35v15H43" fill={roof} />
          <Windows x={30} y={61} rows={3} />
          <Windows x={83} y={54} rows={4} />
          <Windows x={55} y={40} cols={2} rows={4} dx={10} />
          <path d="M44 110V92q17-18 33 0v18" fill={roof} />
          <Door x={55} y={98} w={12} h={13} />
          <path d="M15 114h92" stroke="#dfc77d" strokeWidth="5" />
        </>
      );
  }
}
export function BuildingArt({
  tier,
  city = "meadowville",
  silhouette = false,
}: {
  tier: number;
  city?: CityId;
  silhouette?: boolean;
}) {
  const b = building(city, tier);
  return (
    <svg
      className={`building-art ${silhouette ? "silhouette" : ""}`}
      data-art={`${city}-${tier}`}
      viewBox="0 0 120 124"
      aria-hidden="true"
    >
      <ellipse cx="61" cy="111" rx="46" ry="8" fill="#234c45" opacity=".17" />
      <g
        stroke="#28464122"
        strokeWidth=".7"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {city === "meadowville" ? (
          <Meadow tier={tier} wall={b.color} roof={b.roof} />
        ) : (
          <Coast tier={tier} wall={b.color} roof={b.roof} />
        )}
      </g>
    </svg>
  );
}
