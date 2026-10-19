const K = '#2b2d42', ARW = '#d6336c'
const Arrow = ({ d, id }) => (<g><path d={d} fill="none" stroke={ARW} strokeWidth="3.5" strokeLinecap="round" markerEnd="url(#ah)" /></g>)
const Defs = () => (<defs><marker id="ah" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill={ARW} /></marker></defs>)
const Delta = ({ fill = '#fff' }) => (<g><polygon points="100,20 175,170 100,158 25,170" fill={fill} stroke={K} strokeWidth="3" strokeLinejoin="round" /><line x1="100" y1="20" x2="100" y2="158" stroke={K} strokeWidth="2" /><line x1="92" y1="28" x2="88" y2="160" stroke="#7a8ca8" strokeWidth="1.5" /><line x1="108" y1="28" x2="112" y2="160" stroke="#7a8ca8" strokeWidth="1.5" /></g>)

const art = {
  elevons: (p) => (<svg viewBox="0 0 200 200"><Defs /><Delta />
    <polygon points="140,163 175,170 172,160 145,154" fill="#ffd43b" stroke={K} strokeWidth="2" />
    <polygon points="60,163 25,170 28,160 55,154" fill="#ffd43b" stroke={K} strokeWidth="2" />
    <Arrow d="M160,185 Q170,172 165,150" /><Arrow d="M40,185 Q30,172 35,150" />
    <text x="100" y="196" textAnchor="middle" fontSize="12" fontWeight="700" fill={K}>bend back edges UP a little</text>
    <text x="100" y="12" textAnchor="middle" fontSize="12" fontWeight="700" fill={K}>seen from the top</text></svg>),
  curl: () => (<svg viewBox="0 0 200 200"><Defs />
    <path d="M30,60 Q100,40 170,60 L170,140 Q100,120 30,140 Z" fill="#fff" stroke={K} strokeWidth="3" />
    <path d="M30,60 Q100,40 170,60 L170,78 Q100,58 30,78 Z" fill="#bfdcff" stroke={K} strokeWidth="2" />
    <text x="100" y="72" textAnchor="middle" fontSize="11" fontWeight="700" fill={K}>thick band</text>
    <Arrow d="M30,150 Q100,190 165,150" /><Arrow d="M170,150 Q100,190 36,152" />
    <text x="100" y="30" textAnchor="middle" fontSize="13" fontWeight="700" fill={K}>curl the ends around</text></svg>),
  tuck: () => (<svg viewBox="0 0 200 200"><Defs />
    <ellipse cx="100" cy="70" rx="62" ry="20" fill="none" stroke={K} strokeWidth="3" />
    <path d="M38,70 L38,140 A62,20 0 0 0 162,140 L162,70" fill="#fff" stroke={K} strokeWidth="3" />
    <path d="M38,70 L38,88 A62,20 0 0 0 162,88 L162,70" fill="#bfdcff" stroke={K} strokeWidth="2" />
    <rect x="88" y="78" width="24" height="70" fill="#ffd43b" fillOpacity="0.6" />
    <text x="100" y="180" textAnchor="middle" fontSize="12" fontWeight="700" fill={K}>tuck one end inside the other (overlap 1 in)</text></svg>),
  throwtube: () => (<svg viewBox="0 0 200 200"><Defs />
    <g transform="rotate(-90 100 100)"><ellipse cx="70" cy="100" rx="18" ry="40" fill="#bfdcff" stroke={K} strokeWidth="3" />
    <path d="M70,60 L140,60 A18,40 0 0 1 140,140 L70,140" fill="#fff" stroke={K} strokeWidth="3" /><ellipse cx="70" cy="100" rx="18" ry="40" fill="none" stroke={K} strokeWidth="6" /></g>
    <Arrow d="M100,45 L100,12" />
    <text x="122" y="40" fontSize="12" fontWeight="700" fill={K}>band in front</text>
    <text x="100" y="190" textAnchor="middle" fontSize="12" fontWeight="700" fill={K}>gentle push forward</text></svg>),
  cut: () => (<svg viewBox="0 0 200 200"><Defs />
    <rect x="40" y="20" width="120" height="155" fill="#fff" stroke={K} strokeWidth="3" />
    {[58.75, 97.5, 136.25].map((y) => <line key={y} x1="40" y1={y} x2="160" y2={y} stroke="#7a8ca8" strokeWidth="2" />)}
    <line x1="100" y1="20" x2="100" y2="175" stroke="#7a8ca8" strokeWidth="2" />
    <rect x="40" y="20" width="60" height="38.75" fill="#ffd43b" fillOpacity="0.7" stroke={ARW} strokeWidth="3" strokeDasharray="6 4" />
    <text x="70" y="44" textAnchor="middle" fontSize="13" fontWeight="800" fill={K}>cut 1</text>
    <text x="100" y="193" textAnchor="middle" fontSize="12" fontWeight="700" fill={K}>✂ grown-up helps with scissors</text></svg>),
  tape: () => (<svg viewBox="0 0 200 200"><Defs /><Delta />
    <rect x="62" y="56" width="76" height="12" rx="3" fill="#e5dbff" stroke={K} strokeWidth="2.5" />
    <rect x="94" y="52" width="12" height="20" fill="#ffd43b" fillOpacity="0.8" stroke={K} strokeWidth="1" />
    <Arrow d="M178,40 Q160,52 142,60" />
    <text x="150" y="30" textAnchor="middle" fontSize="12" fontWeight="700" fill={K}>canard</text>
    <text x="40" y="45" textAnchor="middle" fontSize="11" fontWeight="700" fill={K}>2 in back</text>
    <line x1="60" y1="20" x2="60" y2="62" stroke={ARW} strokeWidth="2" /><text x="100" y="192" textAnchor="middle" fontSize="12" fontWeight="700" fill={K}>tape in the middle, seen from the top</text></svg>),
  trim: () => (<svg viewBox="0 0 200 200"><Defs /><Delta />
    <rect x="62" y="56" width="76" height="12" rx="3" fill="#e5dbff" stroke={K} strokeWidth="2.5" />
    <rect x="95" y="14" width="10" height="22" rx="5" fill="none" stroke="#868e96" strokeWidth="3" />
    <text x="135" y="28" fontSize="11" fontWeight="700" fill={K}>paper clip</text>
    <circle cx="100" cy="98" r="7" fill={ARW} /><text x="112" y="102" fontSize="11" fontWeight="700" fill={K}>balance point</text>
    <text x="100" y="192" textAnchor="middle" fontSize="12" fontWeight="700" fill={K}>balance it on one finger here</text></svg>),
}
import { ART2 } from './art2.jsx'
export function Custom({ name, plane }) { const f = art[name] || ART2[name]; return f ? f(plane) : null }
