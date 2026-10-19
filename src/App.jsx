import { useEffect, useMemo, useRef, useState } from 'react'
import { PLANES as P0, SECTIONS as S0 } from './planes.js'
import { ORIGAMI } from './origami.js'
import { DOLLAR } from './dollar.js'
const PLANES = [...P0.map((p) => ({ craft: 'planes', ...p })), ...ORIGAMI, ...DOLLAR]
const mk = (craft, pre, color) => [
  { craft, id: pre + 'beginner', name: 'Beginner', emoji: '🟢', color: '#2fb344', blurb: '5 easy models. Start here!' },
  { craft, id: pre + 'pro', name: 'Pro', emoji: '🔵', color: '#2563eb', blurb: '4 trickier models.' },
  { craft, id: pre + 'master', name: 'Master', emoji: '🟣', color: '#9b30d9', blurb: '1 big challenge.' },
]
const SECTIONS = [...S0, ...mk('origami', 'o-'), ...mk('dollar', 'd-')]
const CRAFTS = [
  { id: 'planes', name: 'Paper Planes', emoji: '✈️', color: '#4dabf7', grad: 'linear-gradient(160deg,#4dabf7,#9775fa)', blurb: 'Fold 10 planes and learn the science of flight!', paper: 'Printer paper (US Letter or A4)' },
  { id: 'origami', name: 'Origami', emoji: '🦢', color: '#f06595', grad: 'linear-gradient(160deg,#f783ac,#ff922b)', blurb: 'Fold animals, flowers and boxes from a square.', paper: 'Square paper (origami paper, or make a square from printer paper)' },
  { id: 'dollar', name: 'Dollar Bill Origami', emoji: '💵', color: '#2f9e44', grad: 'linear-gradient(160deg,#40c057,#20c997)', blurb: 'Turn a $1 bill into rings, shirts, hearts and more.', paper: 'A $1 bill or a printable practice bill' },
]
const craftOf = (id) => CRAFTS.find((c) => c.id === id) || CRAFTS[0]
import { buildSteps } from './fold.js'
import Diagram, { Planform } from './Diagram.jsx'

const KEY = 'paperplanes.v1'
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || { built: {}, done: {} } } catch { return { built: {}, done: {} } } }
function useProgress() {
  const [p, setP] = useState(load)
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(p)) }, [p])
  return [p, setP]
}
function useRoute() {
  const [h, setH] = useState(location.hash.slice(1) || '/')
  useEffect(() => { const f = () => { setH(location.hash.slice(1) || '/'); window.scrollTo(0, 0) }; addEventListener('hashchange', f); return () => removeEventListener('hashchange', f) }, [])
  return h.split('/').filter(Boolean)
}
const go = (path) => { location.hash = path }
const stepsCache = {}
const stepsOf = (pl) => (stepsCache[pl.id] ||= buildSteps(pl))
const Stars = ({ n }) => <span className="stars" aria-label={`${n} of 5 difficulty`}>{'★'.repeat(n)}{'☆'.repeat(5 - n)}</span>
const unit = (pl) => (pl.craft === 'dollar' ? 'bill' : pl.craft === 'origami' ? 'square' : 'sheet')
const Badges = ({ pl }) => (<div className="badges"><span className="badge">⏱ {pl.time}</span><span className="badge">{pl.craft === 'dollar' ? '💵' : '📄'} {pl.sheets} {unit(pl)}{pl.sheets > 1 ? 's' : ''}</span><span className="badge"><Stars n={pl.stars} /></span></div>)

export default function App() {
  const r = useRoute()
  const [prog, setProg] = useProgress()
  let page
  if (r[0] === 'c') page = <CraftHome craft={craftOf(r[1])} prog={prog} />
  else if (r[0] === 'practice') page = <Practice />
  else if (r[0] === 's') page = <Section id={r[1]} prog={prog} />
  else if (r[0] === 'p') {
    const pl = PLANES.find((x) => x.id === r[1])
    if (!pl) page = <Chooser prog={prog} />
    else if (r[2] === 'step') page = <Steps pl={pl} n={+r[3] || 0} prog={prog} setProg={setProg} />
    else if (r[2] === 'science') page = <Science pl={pl} />
    else if (r[2] === 'print') page = <Print pl={pl} />
    else page = <Plane pl={pl} prog={prog} />
  } else if (r[0] === 'all') page = <AllDiagrams only={r[1]} />
  else page = <Chooser prog={prog} />
  return <div className="app">{page}</div>
}

function Top({ back, title, color }) {
  return (<header className="top" style={{ background: color }}>
    {back ? <button className="back" onClick={() => go(back)} aria-label="Back">←</button> : <span className="logo">✈️</span>}
    <h1>{title}</h1>
  </header>)
}

function Chooser({ prog }) {
  return (<>
    <header className="hero"><div className="hero-plane">🎨</div><h1>Paper Art Academy</h1><p>Pick a craft to start folding!</p></header>
    <main className="wrap">
      {CRAFTS.map((c) => {
        const list = PLANES.filter((p) => p.craft === c.id), n = list.filter((p) => prog.built[p.id]).length
        return (<button key={c.id} className="craft-card" style={{ '--c': c.color, background: c.grad }} onClick={() => go(`/c/${c.id}`)}>
          <span className="cc-emoji">{c.emoji}</span><span className="cc-body"><b>{c.name}</b><small>{c.blurb}</small><small className="cc-prog">🏅 {n}/10 built</small></span></button>)
      })}
      <div className="safety">⚠️ <b>Safety first:</b> never throw planes at people, faces or animals. Ask a grown-up before using scissors.</div>
    </main>
  </>)
}

function CraftHome({ craft, prog }) {
  const all = PLANES.filter((p) => p.craft === craft.id)
  const built = all.filter((p) => prog.built[p.id]).length
  return (<>
    <header className="hero" style={{ background: craft.grad }}>
      <button className="back hero-back" onClick={() => go('/')} aria-label="Back to crafts">←</button>
      <div className="hero-plane">{craft.emoji}</div>
      <h1>{craft.name}</h1>
      <p>{craft.blurb}</p>
      <div className="meter"><div style={{ width: `${built * 10}%` }} /></div>
      <p className="meter-txt">🏅 {built} of 10 built</p>
    </header>
    <main className="wrap">
      {SECTIONS.filter((s) => s.craft === craft.id).map((s) => {
        const list = all.filter((p) => p.section === s.id)
        const n = list.filter((p) => prog.built[p.id]).length
        return (<button key={s.id} className="section-card" style={{ '--c': s.color }} onClick={() => go(`/s/${s.id}`)}>
          <span className="sc-emoji">{s.emoji}</span>
          <span className="sc-body"><b>{s.name}</b><small>{s.blurb}</small><small className="sc-prog">{n}/{list.length} built</small></span>
          <span className="sc-planes">{list.slice(0, 3).map((p) => <Planform key={p.id} plane={p} size={34} />)}</span>
        </button>)
      })}
      {craft.id === 'planes' && <div className="safety">⚠️ <b>Safety first:</b> never throw planes at people, faces or animals. Fly in open spaces, and pick up your planes when you're done.</div>}
      {craft.id === 'origami' && <div className="safety">✂️ No square paper? Every model starts with how to make a square from printer paper. Ask a grown-up to help with scissors.</div>}
      {craft.id === 'dollar' && <><div className="safety">💵 Folding real money is fine! You can unfold it and spend it. Just don't tear, cut or write on bills.</div><button className="big-btn" style={{ marginTop: 14 }} onClick={() => go('/practice')}>🖨 Print practice bills</button></>}
      <div className="paper-note">📄 Paper: {craft.paper}</div>
    </main>
  </>)
}

function Section({ id, prog }) {
  const s = SECTIONS.find((x) => x.id === id) || SECTIONS[0]
  const list = PLANES.filter((p) => p.section === s.id)
  return (<>
    <Top back={`/c/${s.craft}`} title={`${craftOf(s.craft).emoji} ${s.name}`} color={s.color} />
    <main className="wrap">
      <p className="lead">{s.blurb}</p>
      {list.map((p, i) => (
        <button key={p.id} className="plane-card" style={{ '--c': p.color }} onClick={() => go(`/p/${p.id}`)}>
          <span className="pc-art"><Planform plane={p} size={72} /></span>
          <span className="pc-body"><b>{i + 1}. {p.name} {prog.built[p.id] && <span className="built">🏅 Built!</span>}</b><small>Good at: {p.goodAt}</small><Badges pl={p} /></span>
        </button>
      ))}
    </main>
  </>)
}

function Plane({ pl, prog }) {
  const s = SECTIONS.find((x) => x.id === pl.section)
  const steps = stepsOf(pl)
  const done = (prog.done[pl.id] || []).length
  return (<>
    <Top back={`/s/${pl.section}`} title={pl.name} color={pl.color} />
    <main className="wrap">
      <div className="plane-hero" style={{ '--c': pl.color }}><Planform plane={pl} size={150} /><div><span className="pill" style={{ background: s.color }}>{s.name}</span><p className="good">Good at: <b>{pl.goodAt}</b></p><Badges pl={pl} />{prog.built[pl.id] && <p className="built big">🏅 You built this!</p>}</div></div>
      <button className="big-btn" onClick={() => go(`/p/${pl.id}/step/0`)}>📐 {done ? `Keep folding (${done}/${steps.length})` : `Start folding (${steps.length} steps)`}</button>
      <button className="big-btn sci" onClick={() => go(`/p/${pl.id}/science`)}>🔬 {pl.craft === 'planes' ? 'The science' : 'Science & Math'}</button>
      <section className="card"><h2>🎯 {pl.craft === 'planes' ? 'Flying tips' : 'Folding tips'}</h2><ul>{pl.tips.map((t) => <li key={t}>{t}</li>)}</ul></section>
      <section className="card"><h2>🛠 Fix it!</h2>{pl.trouble.map(([a, b]) => <p key={a}><b>{a}?</b> {b}</p>)}</section>
      <button className="small-btn" onClick={() => go(`/p/${pl.id}/print`)}>🖨 Printable steps</button>
    </main>
  </>)
}

function Steps({ pl, n, prog, setProg }) {
  const steps = stepsOf(pl)
  n = Math.max(0, Math.min(n, steps.length - 1))
  const st = steps[n]
  const done = new Set(prog.done[pl.id] || [])
  const toggle = (val) => setProg((p) => { const d = new Set(p.done[pl.id] || []); val ? d.add(n) : d.delete(n); return { ...p, done: { ...p.done, [pl.id]: [...d] } } })
  const next = () => { toggle(true); if (n < steps.length - 1) go(`/p/${pl.id}/step/${n + 1}`) }
  const back = () => n > 0 && go(`/p/${pl.id}/step/${n - 1}`)
  const finish = () => { setProg((p) => ({ ...p, built: { ...p.built, [pl.id]: true }, done: { ...p.done, [pl.id]: steps.map((_, i) => i) } })); go(`/p/${pl.id}`) }
  const tx = useRef(null)
  const onTS = (e) => { tx.current = [e.touches[0].clientX, e.touches[0].clientY] }
  const onTE = (e) => { if (!tx.current) return; const dx = e.changedTouches[0].clientX - tx.current[0], dy = e.changedTouches[0].clientY - tx.current[1]; tx.current = null; if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) dx < 0 ? next() : back() }
  useEffect(() => { const k = (e) => { if (e.key === 'ArrowRight') next(); if (e.key === 'ArrowLeft') back() }; addEventListener('keydown', k); return () => removeEventListener('keydown', k) })
  const last = n === steps.length - 1
  return (<>
    <Top back={`/p/${pl.id}`} title={pl.name} color={pl.color} />
    <main className="wrap steps" onTouchStart={onTS} onTouchEnd={onTE}>
      <div className="dots">{steps.map((_, i) => <button key={i} className={`dot ${i === n ? 'on' : ''} ${done.has(i) ? 'ok' : ''}`} onClick={() => go(`/p/${pl.id}/step/${i}`)} aria-label={`Step ${i + 1}`} />)}</div>
      <p className="stepno">Step {n + 1} of {steps.length}</p>
      <Diagram step={st} plane={pl} autoplay={false} key={pl.id + n} />
      <p className="steptext">{st.text}</p>
      {st.tip && <p className="tip">💡 {st.tip}</p>}
      <label className="check"><input type="checkbox" checked={done.has(n)} onChange={(e) => toggle(e.target.checked)} /> I did this step</label>
      <div className="nav">
        <button className="nav-btn" onClick={back} disabled={n === 0}>← Back</button>
        {last ? <button className="nav-btn go" onClick={finish}>🏅 I built it!</button> : <button className="nav-btn go" onClick={next}>Next →</button>}
      </div>
      <p className="swipe">Swipe left or right to change steps. Tap the picture to see the fold move.</p>
    </main>
  </>)
}

function Science({ pl }) {
  const s = pl.science
  if (pl.craft !== 'planes') return (<>
    <Top back={`/p/${pl.id}`} title={`🔬 ${pl.name}`} color={pl.color} />
    <main className="wrap">
      <section className="card bigidea"><h2>💡 Big idea</h2><p>{s.bigIdea}</p></section>
      <section className="card"><h2>📐 Shape math</h2><p>{s.math}</p></section>
      <section className="card"><h2>🤔 Why the folds work</h2><p>{s.why}</p></section>
      {s.history && <section className="card"><h2>🌏 History & culture</h2><p>{s.history}</p></section>}
      {s.money && <section className="card"><h2>💵 How money is made</h2><p>{s.money}</p></section>}
      <section className="card"><h2>📖 Science words</h2>{s.words.map(([w, d]) => <p key={w}><b>{w}:</b> {d}</p>)}</section>
      <section className="card"><h2>🚀 Real-world folding</h2>{s.real.map(([w, d]) => <p key={w}><b>{w}:</b> {d}</p>)}</section>
      <section className="card exp"><h2>🧪 Try this experiment</h2><p>{s.experiment}</p></section>
    </main>
  </>)
  return (<>
    <Top back={`/p/${pl.id}`} title={`🔬 ${pl.name}`} color={pl.color} />
    <main className="wrap">
      <section className="card bigidea"><h2>💡 Big idea</h2><p>{s.bigIdea}</p></section>
      <Forces />
      <section className="card"><h2>🌬 How it flies</h2><p>{s.how}</p></section>
      <section className="card"><h2>🏆 Why it's useful</h2><p>{s.useful}</p></section>
      <section className="card"><h2>📖 Science words</h2>{s.words.map(([w, d]) => <p key={w}><b>{w}:</b> {d}</p>)}</section>
      <section className="card"><h2>🛩 Real airplanes that do this</h2>{s.real.map(([w, d]) => <p key={w}><b>{w}:</b> {d}</p>)}</section>
      <section className="card exp"><h2>🧪 Try this experiment</h2><p>{s.experiment}</p></section>
    </main>
  </>)
}

function Forces() {
  return (<section className="card"><h2>The 4 forces of flight</h2>
    <svg viewBox="0 0 300 170" className="forces" role="img" aria-label="Lift up, gravity down, thrust forward, drag back">
      <defs><marker id="fa" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0L10,5L0,10z" fill="context-stroke" /></marker></defs>
      <polygon points="110,85 200,78 210,85 200,92" fill="#fff" stroke="#2b2d42" strokeWidth="3" /><polygon points="140,85 175,55 185,57 165,85 185,113 175,115" fill="#bfdcff" stroke="#2b2d42" strokeWidth="2.5" />
      <path d="M160,50 V12" stroke="#2fb344" strokeWidth="6" markerEnd="url(#fa)" /><text x="168" y="22" fill="#2fb344" fontWeight="800" fontSize="15">LIFT</text>
      <path d="M160,120 V158" stroke="#e03131" strokeWidth="6" markerEnd="url(#fa)" /><text x="168" y="160" fill="#e03131" fontWeight="800" fontSize="15">GRAVITY</text>
      <path d="M215,85 H270" stroke="#2563eb" strokeWidth="6" markerEnd="url(#fa)" /><text x="226" y="72" fill="#2563eb" fontWeight="800" fontSize="15">THRUST</text>
      <path d="M105,85 H45" stroke="#f08c00" strokeWidth="6" markerEnd="url(#fa)" /><text x="40" y="72" fill="#f08c00" fontWeight="800" fontSize="15">DRAG</text>
    </svg>
    <p className="small">Your arm gives the thrust. Then the plane glides, trading height for speed.</p></section>)
}

function Print({ pl }) {
  const steps = stepsOf(pl)
  return (<>
    <Top back={`/p/${pl.id}`} title={`🖨 ${pl.name}`} color={pl.color} />
    <main className="wrap print">
      <button className="big-btn noprint" onClick={() => print()}>🖨 Print</button>
      <h2 className="onlyprint">{pl.name}: Paper Art Academy</h2>
      <div className="print-grid">{steps.map((st, i) => (<div key={i} className="print-step"><Diagram step={st} plane={pl} /><p><b>{i + 1}.</b> {st.text}</p></div>))}</div>
    </main>
  </>)
}

function AllDiagrams({ only }) {
  return (<main className="all">{PLANES.filter((p) => !only || p.id === only || p.craft === only).map((pl) => (<div key={pl.id}><h2>{pl.name}</h2><div className="all-grid">{stepsOf(pl).map((st, i) => (<div key={i} className="print-step"><Diagram step={st} plane={pl} /><p><b>{i + 1}.</b> {st.text}</p></div>))}</div></div>))}</main>)
}

function Practice() {
  return (<>
    <Top back="/c/dollar" title="🖨 Practice bills" color="#2f9e44" />
    <main className="wrap practice">
      <p className="noprint">Print at <b>100% / Actual size</b> (not "fit to page"). Each rectangle is 6.14 × 2.61 inches, the size of a real bill. Cut them out and practice!</p>
      <button className="big-btn noprint" onClick={() => print()}>🖨 Print</button>
      <div className="bills">{[0, 1, 2].map((i) => <div key={i} className="pbill">Practice paper</div>)}</div>
    </main>
  </>)
}
