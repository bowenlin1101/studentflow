import React from 'react'

// Flat illustrations for listings. Each draws into a 320×200 box on its own soft background.
const C = {
  navy: '#1d2150', brand: '#3f54e8', brandDark: '#2c3cb8', brandLight: '#c9d1ff',
  orange: '#ff8533', peach: '#ffd2b3', white: '#ffffff', paper: '#fbfbfe', line: '#d9ddf2',
  green: '#4bb37d', greenLight: '#bfe8d1', kraft: '#e3b98a', kraftDark: '#c9975f', grey: '#e8eaf3',
}
const BG = { blue: '#e9ecff', peach: '#ffece0', mint: '#e4f4ec', lilac: '#efe8ff', butter: '#fff3d1', sky: '#e2f1fb' }

const Shadow = ({ cx = 160, cy = 172, rx = 70 }) => <ellipse cx={cx} cy={cy} rx={rx} ry="7" fill={C.navy} opacity=".08" />

const ART = {
  l_hoodie: { bg: BG.lilac, el: (
    <g>
      <Shadow />
      <path d="M118 62 L140 50 Q160 66 180 50 L202 62 L238 118 L218 130 L200 100 L200 166 L120 166 L120 100 L102 130 L82 118 Z" fill={C.brand} />
      <path d="M140 50 Q160 30 180 50 Q160 74 140 50 Z" fill={C.brandDark} />
      <rect x="138" y="128" width="44" height="24" rx="6" fill={C.brandDark} />
      <path d="M153 64 v18 M167 64 v18" stroke={C.white} strokeWidth="2.5" strokeLinecap="round" />
      <rect x="208" y="104" width="16" height="7" rx="2" transform="rotate(-57 216 107)" fill={C.orange} />
    </g>) },
  l_stickers: { bg: BG.peach, el: (
    <g>
      <rect x="92" y="62" width="64" height="64" rx="16" fill={C.brand} transform="rotate(-10 124 94)" />
      <path d="M106 92c6-7 12-7 18 0s12 7 18 0" stroke={C.white} strokeWidth="5" fill="none" strokeLinecap="round" transform="rotate(-10 124 94)" />
      <path d="M106 106c6-7 12-7 18 0s12 7 18 0" stroke={C.orange} strokeWidth="5" fill="none" strokeLinecap="round" transform="rotate(-10 124 94)" />
      <circle cx="196" cy="86" r="30" fill={C.orange} />
      <path d="M196 70 l5 10 11 1.5 -8 7.5 2 11 -10 -5.5 -10 5.5 2 -11 -8 -7.5 11 -1.5 z" fill={C.white} />
      <rect x="150" y="116" width="70" height="34" rx="17" fill={C.navy} transform="rotate(6 185 133)" />
      <circle cx="168" cy="133" r="5" fill={C.orange} transform="rotate(6 185 133)" />
      <rect x="179" y="129" width="30" height="7" rx="3.5" fill={C.white} transform="rotate(6 185 133)" />
    </g>) },
  l_totes: { bg: BG.butter, el: (
    <g>
      <Shadow rx="80" />
      <path d="M182 74 q0 -28 22 -28 q22 0 22 28" stroke={C.kraftDark} strokeWidth="5" fill="none" />
      <rect x="168" y="72" width="72" height="94" rx="6" fill={C.kraft} />
      <path d="M110 74 q0 -30 26 -30 q26 0 26 30" stroke={C.navy} strokeWidth="5" fill="none" />
      <rect x="92" y="70" width="88" height="98" rx="6" fill={C.paper} stroke={C.line} strokeWidth="2" />
      <circle cx="136" cy="118" r="22" fill={C.orange} />
      <path d="M124 116c4-5 8-5 12 0s8 5 12 0" stroke={C.white} strokeWidth="4" fill="none" strokeLinecap="round" />
    </g>) },
  l_calc: { bg: BG.blue, el: (
    <g>
      <Shadow />
      <rect x="96" y="38" width="128" height="132" rx="8" fill={C.paper} stroke={C.line} strokeWidth="2" />
      <path d="M116 150 H206 M122 156 V58" stroke={C.navy} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M122 140 C140 140 150 70 168 70 S196 128 206 92" stroke={C.brand} strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="168" cy="70" r="5" fill={C.orange} />
      <g transform="rotate(35 230 120)"><rect x="222" y="70" width="14" height="92" rx="3" fill={C.orange} /><path d="M222 162 l7 16 l7 -16 z" fill={C.peach} /><rect x="222" y="70" width="14" height="10" fill={C.navy} /></g>
    </g>) },
  l_econ: { bg: BG.mint, el: (
    <g>
      <Shadow rx="80" />
      <rect x="92" y="138" width="136" height="26" rx="4" fill={C.navy} />
      <rect x="92" y="148" width="136" height="4" fill={C.white} opacity=".3" />
      <rect x="102" y="112" width="120" height="26" rx="4" fill={C.orange} />
      <rect x="96" y="56" width="104" height="56" rx="4" fill={C.brand} />
      <path d="M112 100 v-12 M124 100 v-20 M136 100 v-14 M148 100 v-28" stroke={C.white} strokeWidth="6" strokeLinecap="round" />
      <rect x="160" y="70" width="28" height="5" rx="2.5" fill={C.brandLight} /><rect x="160" y="82" width="20" height="5" rx="2.5" fill={C.brandLight} />
    </g>) },
  l_headshots: { bg: BG.sky, el: (
    <g>
      <Shadow />
      <rect x="96" y="66" width="128" height="92" rx="14" fill={C.navy} />
      <rect x="128" y="52" width="40" height="18" rx="5" fill={C.navy} />
      <circle cx="160" cy="112" r="32" fill={C.white} />
      <circle cx="160" cy="112" r="24" fill={C.brand} />
      <circle cx="160" cy="112" r="11" fill={C.navy} />
      <circle cx="152" cy="104" r="4" fill={C.white} opacity=".8" />
      <circle cx="204" cy="82" r="6" fill={C.orange} />
    </g>) },
  l_website: { bg: BG.lilac, el: (
    <g>
      <Shadow rx="85" />
      <rect x="76" y="40" width="168" height="124" rx="10" fill={C.paper} stroke={C.line} strokeWidth="2" />
      <path d="M76 60 H244" stroke={C.line} strokeWidth="2" />
      <circle cx="90" cy="50" r="3.5" fill={C.orange} /><circle cx="101" cy="50" r="3.5" fill={C.peach} /><circle cx="112" cy="50" r="3.5" fill={C.brandLight} />
      <rect x="90" y="72" width="140" height="40" rx="6" fill={C.brand} />
      <rect x="100" y="84" width="60" height="6" rx="3" fill={C.white} /><rect x="100" y="96" width="36" height="6" rx="3" fill={C.orange} />
      <rect x="90" y="122" width="42" height="30" rx="5" fill={C.grey} /><rect x="139" y="122" width="42" height="30" rx="5" fill={C.grey} /><rect x="188" y="122" width="42" height="30" rx="5" fill={C.grey} />
    </g>) },
  l_resume: { bg: BG.butter, el: (
    <g>
      <Shadow />
      <rect x="112" y="34" width="96" height="132" rx="8" fill={C.paper} stroke={C.line} strokeWidth="2" />
      <circle cx="136" cy="62" r="12" fill={C.brandLight} />
      <rect x="154" y="54" width="40" height="6" rx="3" fill={C.navy} /><rect x="154" y="66" width="28" height="5" rx="2.5" fill={C.line} />
      {[88, 100, 112, 132, 144].map((y, i) => <rect key={y} x="126" y={y} width={i % 2 ? 52 : 68} height="5" rx="2.5" fill={C.line} />)}
      <circle cx="206" cy="148" r="22" fill={C.orange} />
      <path d="M206 136 v20 M197 148 l9 9 9 -9" stroke={C.white} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>) },
  l_candles: { bg: BG.peach, el: (
    <g>
      <Shadow rx="75" />
      {[[112, 54, C.brandLight], [172, 44, C.peach]].map(([x, w, wax], i) => (
        <g key={i}>
          <rect x={x} y={i ? 92 : 104} width={w + 6} height={i ? 74 : 62} rx="10" fill={C.white} opacity=".9" stroke={C.line} strokeWidth="2" />
          <rect x={x + 5} y={i ? 104 : 114} width={w - 4} height={i ? 56 : 46} rx="6" fill={wax} />
          <rect x={x + 5} y={i ? 128 : 134} width={w - 4} height="14" fill={i ? C.navy : C.brand} />
          <path d={`M${x + (w + 6) / 2} ${i ? 104 : 114} v-8`} stroke={C.navy} strokeWidth="2" />
          <path d={`M${x + (w + 6) / 2} ${i ? 76 : 86} q8 10 0 18 q-8 -8 0 -18 z`} fill={C.orange} />
        </g>
      ))}
    </g>) },
  l_moving: { bg: BG.butter, el: (
    <g>
      <Shadow rx="85" />
      <rect x="84" y="104" width="76" height="62" rx="4" fill={C.kraft} />
      <rect x="164" y="112" width="70" height="54" rx="4" fill={C.kraftDark} />
      <rect x="104" y="54" width="68" height="50" rx="4" fill={C.kraftDark} />
      <path d="M84 120 H160 M122 104 v16 M164 126 H234 M199 112 v14 M104 68 H172 M138 54 v14" stroke={C.paper} strokeWidth="5" opacity=".7" />
      <path d="M190 72 h34 m-12 -12 l12 12 -12 12" stroke={C.brand} strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>) },
  l_mealprep: { bg: BG.mint, el: (
    <g>
      <Shadow rx="95" />
      {[78, 166].map((x, i) => (
        <g key={x}>
          <rect x={x} y={i ? 70 : 62} width="78" height="92" rx="12" fill={C.white} stroke={C.line} strokeWidth="2" />
          <rect x={x + 8} y={(i ? 70 : 62) + 8} width="62" height="40" rx="8" fill={i ? C.peach : C.greenLight} />
          <rect x={x + 8} y={(i ? 70 : 62) + 52} width="29" height="32" rx="8" fill={C.kraft} />
          <rect x={x + 41} y={(i ? 70 : 62) + 52} width="29" height="32" rx="8" fill={i ? C.greenLight : C.peach} />
          {[0, 1, 2].map((k) => <circle key={k} cx={x + 22 + k * 17} cy={(i ? 70 : 62) + 28} r="6" fill={i ? C.orange : C.green} />)}
        </g>
      ))}
    </g>) },
  l_minifridge: { bg: BG.sky, el: (
    <g>
      <Shadow rx="50" />
      <rect x="122" y="30" width="76" height="140" rx="12" fill={C.white} stroke={C.line} strokeWidth="2" />
      <path d="M122 76 H198" stroke={C.line} strokeWidth="2" />
      <rect x="182" y="46" width="6" height="20" rx="3" fill={C.navy} />
      <rect x="182" y="88" width="6" height="34" rx="3" fill={C.navy} />
      <circle cx="140" cy="96" r="7" fill={C.orange} /><rect x="134" y="110" width="22" height="8" rx="4" fill={C.brandLight} />
    </g>) },
}

// Topic covers for guides, webinars and recordings
const TOPIC = {
  validate: { bg: BG.butter, el: (
    <g>
      <Shadow rx="55" />
      <circle cx="160" cy="88" r="42" fill={C.white} stroke={C.line} strokeWidth="2" />
      <circle cx="160" cy="88" r="30" fill={C.peach} />
      <path d="M150 96 q10 -26 20 0" stroke={C.orange} strokeWidth="4" fill="none" strokeLinecap="round" />
      <rect x="142" y="128" width="36" height="12" rx="4" fill={C.navy} /><rect x="146" y="142" width="28" height="10" rx="4" fill={C.navy} />
      <circle cx="202" cy="58" r="17" fill={C.green} /><path d="M194 58 l6 6 10 -11" stroke={C.white} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M104 60 l-10 -6 M100 88 h-12 M104 116 l-10 6" stroke={C.orange} strokeWidth="4" strokeLinecap="round" />
    </g>) },
  launch: { bg: BG.blue, el: (
    <g>
      <circle cx="96" cy="50" r="3" fill={C.brand} /><circle cx="236" cy="70" r="4" fill={C.orange} /><circle cx="214" cy="40" r="2.5" fill={C.navy} /><circle cx="110" cy="150" r="3" fill={C.orange} />
      <g transform="rotate(40 160 100)">
        <path d="M160 30 q26 26 22 86 h-44 q-4 -60 22 -86 z" fill={C.white} stroke={C.line} strokeWidth="2" />
        <circle cx="160" cy="76" r="11" fill={C.brand} /><circle cx="160" cy="76" r="5" fill={C.brandLight} />
        <path d="M138 100 l-16 22 h18 z M182 100 l16 22 h-18 z" fill={C.navy} />
        <path d="M148 118 q12 40 24 0 z" fill={C.orange} />
      </g>
    </g>) },
  finance: { bg: BG.mint, el: (
    <g>
      <Shadow rx="80" />
      {[0, 1, 2, 3].map((i) => <ellipse key={i} cx="118" cy={160 - i * 12} rx="30" ry="9" fill={i % 2 ? C.orange : C.peach} stroke={C.white} strokeWidth="2" />)}
      <rect x="168" y="118" width="18" height="50" rx="4" fill={C.brandLight} />
      <rect x="192" y="96" width="18" height="72" rx="4" fill={C.brand} />
      <rect x="216" y="70" width="18" height="98" rx="4" fill={C.navy} />
      <path d="M164 92 L194 70 L212 80 L240 50" stroke={C.green} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M228 50 h12 v12" stroke={C.green} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>) },
  legal: { bg: BG.lilac, el: (
    <g>
      <Shadow rx="65" />
      <rect x="110" y="34" width="92" height="128" rx="8" fill={C.paper} stroke={C.line} strokeWidth="2" />
      {[56, 70, 84, 98, 112].map((y, i) => <rect key={y} x="124" y={y} width={i === 0 ? 50 : i % 2 ? 64 : 56} height="5" rx="2.5" fill={i === 0 ? C.navy : C.line} />)}
      <path d="M124 140 q10 -10 20 0 t20 0" stroke={C.brand} strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="204" cy="138" r="22" fill={C.orange} />
      <circle cx="204" cy="138" r="13" fill="none" stroke={C.white} strokeWidth="3" />
      <path d="M194 156 l-6 20 10 -5 6 8 4 -18 M214 156 l6 20 -10 -5" fill={C.orange} />
    </g>) },
  marketing: { bg: BG.peach, el: (
    <g>
      <Shadow rx="70" />
      <path d="M104 86 L184 52 V148 L104 114 Z" fill={C.brand} />
      <rect x="86" y="84" width="22" height="32" rx="6" fill={C.navy} />
      <path d="M112 116 l8 34 h16 l-6 -28" fill={C.navy} />
      <rect x="180" y="48" width="12" height="104" rx="6" fill={C.brandDark} />
      <path d="M208 82 q10 18 0 36 M222 70 q18 30 0 60" stroke={C.orange} strokeWidth="5" fill="none" strokeLinecap="round" />
    </g>) },
  product: { bg: BG.sky, el: (
    <g>
      <Shadow rx="50" />
      <rect x="124" y="26" width="72" height="144" rx="14" fill={C.navy} />
      <rect x="130" y="38" width="60" height="120" rx="6" fill={C.paper} />
      <rect x="136" y="46" width="48" height="26" rx="5" fill={C.brand} />
      <rect x="136" y="78" width="22" height="22" rx="5" fill={C.peach} /><rect x="162" y="78" width="22" height="22" rx="5" fill={C.brandLight} />
      <rect x="136" y="106" width="48" height="6" rx="3" fill={C.line} /><rect x="136" y="117" width="34" height="6" rx="3" fill={C.line} />
      <rect x="136" y="134" width="48" height="14" rx="7" fill={C.orange} />
      <circle cx="222" cy="64" r="14" fill={C.white} stroke={C.line} strokeWidth="2" /><path d="M216 64 l5 5 8 -9" stroke={C.green} strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>) },
  handoff: { bg: BG.mint, el: (
    <g>
      <Shadow rx="60" />
      <path d="M160 152 C130 112 120 96 120 76 a40 40 0 0 1 80 0 c0 20 -10 36 -40 76 z" fill={C.brand} />
      <circle cx="160" cy="76" r="16" fill={C.white} />
      <rect x="196" y="48" width="64" height="30" rx="10" fill={C.navy} />
      <text x="228" y="69" textAnchor="middle" fontFamily="ui-monospace, monospace" fontWeight="700" fontSize="15" letterSpacing="2" fill={C.white}>K7QM</text>
      <rect x="62" y="96" width="64" height="30" rx="10" fill={C.orange} />
      <text x="94" y="117" textAnchor="middle" fontFamily="ui-monospace, monospace" fontWeight="700" fontSize="15" letterSpacing="2" fill={C.white}>R2XD</text>
    </g>) },
  tax: { bg: BG.sky, el: (
    <g>
      <Shadow rx="55" />
      <rect x="120" y="32" width="80" height="128" rx="12" fill={C.navy} />
      <rect x="130" y="44" width="60" height="26" rx="5" fill={C.greenLight} />
      <text x="184" y="63" textAnchor="end" fontFamily="Outfit, sans-serif" fontWeight="700" fontSize="16" fill={C.navy}>13%</text>
      {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <rect key={r + '' + c} x={130 + c * 21} y={80 + r * 22} width="17" height="17" rx="4" fill={r === 2 && c === 2 ? C.orange : C.brandLight} />))}
      <circle cx="222" cy="58" r="16" fill={C.orange} /><text x="222" y="64" textAnchor="middle" fontFamily="Outfit, sans-serif" fontWeight="700" fontSize="16" fill={C.white}>%</text>
    </g>) },
  pricing: { bg: BG.butter, el: (
    <g>
      <Shadow rx="70" />
      <g transform="rotate(-18 160 100)">
        <path d="M110 64 H200 L232 100 L200 136 H110 Q100 136 100 126 V74 Q100 64 110 64 Z" fill={C.orange} />
        <circle cx="208" cy="100" r="7" fill={C.butter || '#fff3d1'} />
        <text x="150" y="114" textAnchor="middle" fontFamily="Outfit, sans-serif" fontWeight="700" fontSize="40" fill={C.white}>$45</text>
      </g>
      <path d="M220 72 q22 -30 40 -10" stroke={C.navy} strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>) },
}

export function TopicImage({ topic, className = '', label = '', children }) {
  const a = TOPIC[topic] || TOPIC.launch
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: a.bg }}>
      <svg viewBox="0 0 320 200" className="block h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label={label}>{a.el}</svg>
      {children}
    </div>
  )
}

// Category fallbacks for listings students create in the demo
const CAT = {
  Merch: 'l_hoodie', Tutoring: 'l_calc', Textbooks: 'l_econ', Creative: 'l_headshots', Tech: 'l_website',
  Home: 'l_candles', Services: 'l_moving', Food: 'l_mealprep',
}

export function ListingImage({ listing, className = '', rounded = 'rounded-2xl' }) {
  const a = ART[listing.id] || ART[CAT[listing.category]] || ART.l_stickers
  return (
    <div className={`overflow-hidden ${rounded} ${className}`} style={{ background: a.bg }}>
      <svg viewBox="0 0 320 200" className="block h-full w-full" preserveAspectRatio="xMidYMid slice" role="img" aria-label={listing.title}>
        {a.el}
      </svg>
    </div>
  )
}
