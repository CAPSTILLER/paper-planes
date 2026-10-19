import { useEffect, useRef, useState } from 'react'
import { bbox, reflect, area } from './fold.js'
import { Custom } from './custom.jsx'
import { FACES } from './art2.jsx'

const FRONT = '#ffffff', BACK = '#bfdcff'
const poly = (pts) => pts.map((p) => p.map((v) => v.toFixed(2)).join(',')).join(' ')
const centroid = (pts) => [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length]

function Layer({ L, hl, w }) {
  return (
    <g>
      <polygon points={poly(L.pts)} fill={L.face ? BACK : FRONT} stroke="#2b2d42" strokeWidth={w} strokeLinejoin="round" />
      {hl && <polygon points={poly(L.pts)} fill="#ffd43b" fillOpacity="0.55" stroke="none" />}
      {L.lines.map((ln, i) => <line key={i} x1={ln[0][0]} y1={ln[0][1]} x2={ln[1][0]} y2={ln[1][1]} stroke="#7a8ca8" strokeWidth={w * 0.6} />)}
    </g>
  )
}

export function Planform({ plane, size = 100 }) {
  if (plane.icon) return <span className="icon-emoji" style={{ fontSize: size * 0.7, width: size, height: size }} aria-hidden="true">{plane.icon}</span>
  const pf = plane.planform
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      {pf === 'ring' ? (<g><ellipse cx="50" cy="50" rx="34" ry="34" fill="none" stroke={plane.color} strokeWidth="12" /><ellipse cx="50" cy="50" rx="34" ry="34" fill="none" stroke="#2b2d42" strokeWidth="2" /></g>)
        : pf === 'canard' ? (<g><polygon points="50,4 88,94 50,88 12,94" fill={plane.color} stroke="#2b2d42" strokeWidth="2.5" strokeLinejoin="round" /><rect x="30" y="26" width="40" height="7" rx="2" fill="#fff" stroke="#2b2d42" strokeWidth="2" /></g>)
        : (<g><polygon points={poly(pf)} fill={plane.color} stroke="#2b2d42" strokeWidth="2.5" strokeLinejoin="round" /><line x1="50" y1={pf[0][1]} x2="50" y2="90" stroke="#2b2d42" strokeWidth="1.5" /></g>)}
    </svg>
  )
}

export default function Diagram({ step, plane, autoplay }) {
  const op = step.op
  const [t, setT] = useState(0)
  const raf = useRef()
  const play = () => {
    cancelAnimationFrame(raf.current)
    const t0 = performance.now()
    const tick = (now) => { const k = Math.min(1, (now - t0) / 1400); setT(k); if (k < 1) raf.current = requestAnimationFrame(tick) }
    raf.current = requestAnimationFrame(tick)
  }
  useEffect(() => { setT(0); if (autoplay && op.kind === 'fold') { const id = setTimeout(play, 500); return () => clearTimeout(id) } }, [step])
  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  if (op.kind === 'done') {
    if (step.afterCustom && plane.craft && plane.craft !== 'planes') return <div className="diagram done"><span className="icon-emoji" style={{ fontSize: 150 }}>{plane.icon}</span><span className="guide-tag">Finished! (picture is a symbol)</span></div>
    if (!plane.craft || plane.craft === 'planes') return <div className="diagram done"><Planform plane={plane} size={240} /></div>
    const ls = step.before.layers, bb = bbox(ls), p = 8, w0 = Math.max(bb[2] - bb[0], bb[3] - bb[1]) / 260
    return (<div className="diagram done final"><svg viewBox={[bb[0] - p, bb[1] - p, bb[2] - bb[0] + 2 * p, bb[3] - bb[1] + 2 * p].join(' ')} role="img" aria-label="Finished model">
      {ls.map((L, i) => <Layer key={i} L={L} w={w0 * 1.3} />)}{plane.face && FACES[plane.face](bb)}</svg><span className="done-emoji">{plane.icon}</span></div>)
  }
  if (op.kind === 'custom') return <div className="diagram"><Custom name={op.svg} plane={plane} />{plane.craft && plane.craft !== 'planes' && <span className="guide-tag">Guide picture</span>}</div>

  const all = [...step.before.layers, ...step.after.layers]
  const [x0, y0, x1, y1] = bbox(all)
  const pad = 9
  const vb = [x0 - pad, y0 - pad, x1 - x0 + 2 * pad, y1 - y0 + 2 * pad]
  const sw = Math.max(vb[2], vb[3]) / 260

  if (op.kind === 'sheet') {
    return <div className="diagram"><svg viewBox={vb.join(' ')} role="img" aria-label="New sheet">{step.after.layers.map((L, i) => <Layer key={i} L={L} w={sw} />)}<text x={vb[0] + vb[2] / 2} y={vb[1] + vb[3] / 2} textAnchor="middle" fontSize={vb[3] / 9} fill="#9b30d9" fontWeight="800">NEW</text></svg></div>
  }
  if (op.kind === 'rotate') {
    const c = op.c, ang = op.deg * t
    return (<div className="diagram" onClick={play}><svg viewBox={vb.join(' ')} role="img" aria-label="Turn the paper">
      <g transform={`rotate(${ang} ${c[0]} ${c[1]})`}>{step.before.layers.map((L, i) => <Layer key={i} L={L} w={sw} />)}</g>
      {t === 0 && <path d={`M${c[0] - 30},${c[1] - 40} A50,50 0 0 1 ${c[0] + 40},${c[1] - 30}`} fill="none" stroke="#d6336c" strokeWidth={sw * 3} markerEnd="url(#rah)" />}
      <defs><marker id="rah" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#d6336c" /></marker></defs>
    </svg><PlayBtn onClick={play} /></div>)
  }
  if (op.kind === 'flip') {
    const cx = op.axis
    const sx = Math.cos(Math.PI * t)
    const layers = t < 0.5 ? step.before.layers : step.after.layers
    const s = t < 0.5 ? sx : -sx
    return (
      <div className="diagram" onClick={play}>
        <svg viewBox={vb.join(' ')} role="img" aria-label="Turn over">
          <g transform={`translate(${t < 0.5 ? cx : cx} 0) scale(${Math.max(0.02, Math.abs(s))} 1) translate(${-cx} 0)`}>
            {layers.map((L, i) => <Layer key={i} L={L} w={sw} />)}
          </g>
          {t === 0 && <FlipSymbol vb={vb} />}
        </svg>
        <PlayBtn onClick={play} />
      </div>
    )
  }
  // fold
  const { a, b } = op
  const movingSet = new Set(step.moving)
  // extend fold line across view
  const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy)
  const ux = dx / len, uy = dy / len, R = Math.hypot(vb[2], vb[3])
  // limit fold line to stuff being folded
  const proj = (p) => (p[0] - a[0]) * ux + (p[1] - a[1]) * uy
  let lo = 1e9, hi = -1e9
  const touched = op.crease ? step.before.layers : [...step.stay.filter((L) => step.moving.length), ...step.moving]
  for (const L of touched) for (const p of L.pts) { const dist = Math.abs((p[0] - a[0]) * uy - (p[1] - a[1]) * ux); if (dist < R) { lo = Math.min(lo, proj(p)); hi = Math.max(hi, proj(p)) } }
  lo -= 6; hi += 6
  const P1 = [a[0] + ux * lo, a[1] + uy * lo], P2 = [a[0] + ux * hi, a[1] + uy * hi]
  // arrow
  let A = 0, cx = 0, cy = 0
  for (const L of step.moving) { const ar = area(L.pts), c = centroid(L.pts); A += ar; cx += c[0] * ar; cy += c[1] * ar }
  if (op.crease || !A) { // crease: use side point area of before
    const c = op.s; cx = c[0]; cy = c[1]; A = 1
    cx = (cx + a[0] + ux * (lo + hi) / 2) / 2; cy = (cy + a[1] + uy * (lo + hi) / 2) / 2
  } else { cx /= A; cy /= A }
  const from = [cx, cy], to = reflect(from, a, b)
  const mid = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2]
  const dist = Math.hypot(to[0] - from[0], to[1] - from[1])
  const ctrl = [mid[0] + ux * dist * 0.45, mid[1] + uy * dist * 0.45]
  const mountain = op.type === 'mountain'
  const lineColor = mountain ? '#7048e8' : '#e8590c'
  const dash = mountain ? `${sw * 9} ${sw * 3} ${sw * 2} ${sw * 3}` : `${sw * 7} ${sw * 4}`

  // animation frame
  const k = op.crease ? (t < 0.5 ? t * 2 : 2 - t * 2) : t
  const lerp = (p) => { const r = reflect(p, a, b); return [p[0] + (r[0] - p[0]) * k, p[1] + (r[1] - p[1]) * k] }
  const anim = t > 0 && t < 1
  let content
  if (!anim && t >= 1 && !op.crease) {
    content = step.after.layers.map((L, i) => <Layer key={i} L={L} w={sw} />)
  } else if (anim) {
    const stay = op.crease ? [] : step.stay
    const mov = op.crease ? step.before.layers.map((L) => L) : step.moving
    const movDraw = (op.crease ? splitSide(step.before.layers, op) : mov).map((L, i) => <Layer key={'m' + i} L={{ ...L, pts: L.pts.map(lerp), lines: [], face: k > 0.5 ? 1 - L.face : L.face }} hl w={sw} />)
    const stayDraw = (op.crease ? splitSide(step.before.layers, op, true) : stay).map((L, i) => <Layer key={'s' + i} L={L} w={sw} />)
    content = mountain ? [...movDraw.reverse(), ...stayDraw] : [...stayDraw, ...(k > 0.5 ? movDraw.reverse() : movDraw)]
  } else {
    const showLayers = op.crease ? step.before.layers : step.before.layers
    content = (
      <>
        {step.stay.map((L, i) => null)}
        {showLayers.map((L, i) => <Layer key={i} L={L} w={sw} />)}
        {(op.crease ? splitSide(step.before.layers, op) : step.moving).map((L, i) => <polygon key={'h' + i} points={poly(L.pts)} fill="#ffd43b" fillOpacity={op.crease ? 0.35 : 0.5} />)}
      </>
    )
  }
  const head = (pt, prev, hollow) => {
    const ang = Math.atan2(pt[1] - prev[1], pt[0] - prev[0]), s = sw * 9
    const p1 = [pt[0] - s * Math.cos(ang - 0.45), pt[1] - s * Math.sin(ang - 0.45)]
    const p2 = [pt[0] - s * Math.cos(ang + 0.45), pt[1] - s * Math.sin(ang + 0.45)]
    return <polygon points={poly([pt, p1, p2])} fill={hollow ? '#fff' : '#d6336c'} stroke="#d6336c" strokeWidth={sw * 1.5} strokeLinejoin="round" />
  }
  return (
    <div className="diagram" onClick={play}>
      <svg viewBox={vb.join(' ')} role="img" aria-label={step.text}>
        {content}
        {t === 0 && (
          <g>
            <line x1={P1[0]} y1={P1[1]} x2={P2[0]} y2={P2[1]} stroke={lineColor} strokeWidth={sw * 2.4} strokeDasharray={dash} strokeLinecap="round" />
            <path d={`M${from} Q${ctrl} ${to}`} fill="none" stroke="#d6336c" strokeWidth={sw * 2.4} strokeLinecap="round" />
            {head(to, ctrl, mountain)}
            {op.crease && head(from, ctrl, false)}
          </g>
        )}
      </svg>
      <PlayBtn onClick={play} />
      <div className="legend">{mountain ? <span><i className="lg-m" /> fold <b>behind</b> (mountain)</span> : op.crease ? <span><i className="lg-v" /> fold, then open again</span> : <span><i className="lg-v" /> fold toward you (valley)</span>}<span><i className="lg-h" /> moves</span></div>
    </div>
  )
}
// for crease ops: split before layers by side
import { doFold } from './fold.js'
function splitSide(layers, op, stay) {
  const f = doFold({ layers }, { ...op, crease: false })
  return stay ? f.stay : f.moving
}
function PlayBtn({ onClick }) {
  return <button className="play" onClick={(e) => { e.stopPropagation(); onClick() }} aria-label="Show the fold">▶ Show me</button>
}
function FlipSymbol({ vb }) {
  const cx = vb[0] + vb[2] / 2, cy = vb[1] + vb[3] * 0.5, r = vb[2] * 0.22, s = vb[2] / 260
  return (
    <g stroke="#d6336c" strokeWidth={s * 3} fill="none" strokeLinecap="round">
      <path d={`M${cx - r},${cy} A${r},${r * 0.45} 0 0 1 ${cx + r},${cy}`} />
      <path d={`M${cx + r},${cy} A${r},${r * 0.45} 0 0 1 ${cx - r * 0.8},${cy + r * 0.25}`} strokeDasharray={`${s * 6} ${s * 4}`} />
      <polygon points={`${cx - r * 0.8 - s * 4},${cy + r * 0.25 - s * 9} ${cx - r * 0.8 - s * 10},${cy + r * 0.3} ${cx - r * 0.8 + s * 5},${cy + r * 0.32}`} fill="#d6336c" />
    </g>
  )
}
