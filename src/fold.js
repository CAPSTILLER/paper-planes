// Tiny flat-folding engine: paper = stack of convex polygon layers.
const EPS = 1e-6
const side = (p, a, b) => (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0])
export const reflect = (p, a, b) => {
  const dx = b[0] - a[0], dy = b[1] - a[1]
  const t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy)
  const fx = a[0] + t * dx, fy = a[1] + t * dy
  return [2 * fx - p[0], 2 * fy - p[1]]
}
const inter = (p, q, a, b) => {
  const sp = side(p, a, b), sq = side(q, a, b)
  const t = sp / (sp - sq)
  return [p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]
}
function clipPoly(pts, a, b, sign) {
  const out = []
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], q = pts[(i + 1) % pts.length]
    const sp = side(p, a, b) * sign, sq = side(q, a, b) * sign
    if (sp >= -EPS) out.push(p)
    if ((sp > EPS && sq < -EPS) || (sp < -EPS && sq > EPS)) out.push(inter(p, q, a, b))
  }
  return out
}
function clipSeg([p, q], a, b, sign) {
  const sp = side(p, a, b) * sign, sq = side(q, a, b) * sign
  if (sp < -EPS && sq < -EPS) return null
  if (sp >= -EPS && sq >= -EPS) return [p, q]
  const m = inter(p, q, a, b)
  return sp >= -EPS ? [p, m] : [m, q]
}
export const area = (pts) => {
  let s = 0
  for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; s += p[0] * q[1] - q[0] * p[1] }
  return Math.abs(s / 2)
}
// segment where an infinite line crosses a convex polygon
function lineInPoly(pts, a, b) {
  const hits = []
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], q = pts[(i + 1) % pts.length]
    const sp = side(p, a, b), sq = side(q, a, b)
    if (Math.abs(sp) < EPS) hits.push(p)
    if ((sp > EPS && sq < -EPS) || (sp < -EPS && sq > EPS)) hits.push(inter(p, q, a, b))
  }
  if (hits.length < 2) return null
  const dx = b[0] - a[0], dy = b[1] - a[1]
  hits.sort((u, v) => (u[0] * dx + u[1] * dy) - (v[0] * dx + v[1] * dy))
  const s = [hits[0], hits[hits.length - 1]]
  return Math.hypot(s[1][0] - s[0][0], s[1][1] - s[0][1]) > 0.01 ? s : null
}
export const sheet = (w, h) => ({ layers: [{ pts: [[0, 0], [w, 0], [w, h], [0, h]], face: 0, tags: [], lines: [] }] })

const affects = (L, op) => (!op.only || L.tags.includes(op.only)) && (!op.skip || !L.tags.includes(op.skip))

// Split state for a fold: returns {stay, moving} (moving not yet reflected) + result
export function doFold(state, op) {
  const { a, b, s } = op
  const sign = Math.sign(side(s, a, b))
  const stay = [], moving = []
  for (const L of state.layers) {
    if (!affects(L, op)) { stay.push(L); continue }
    const keep = clipPoly(L.pts, a, b, -sign), mov = clipPoly(L.pts, a, b, sign)
    const crease = lineInPoly(L.pts, a, b)
    const both = area(keep) > 0.05 && area(mov) > 0.05
    const cl = (sg) => L.lines.map((ln) => clipSeg(ln, a, b, sg)).filter(Boolean)
    if (area(keep) > 0.05) stay.push({ ...L, pts: keep, lines: [...cl(-sign), ...(both && crease ? [crease] : [])] })
    if (area(mov) > 0.05) moving.push({ ...L, pts: mov, lines: [...cl(sign), ...(both && crease ? [crease] : [])] })
  }
  const moved = moving.map((L) => ({
    pts: L.pts.map((p) => reflect(p, a, b)).reverse(),
    lines: L.lines.map((ln) => ln.map((p) => reflect(p, a, b))),
    face: 1 - L.face,
    tags: op.tag ? [...new Set([...L.tags, op.tag])] : L.tags,
  })).reverse()
  let result
  if (op.crease) {
    // fold and unfold: original layers with a crease added
    result = { layers: state.layers.map((L) => {
      if (!affects(L, op)) return L
      const c = lineInPoly(L.pts, a, b)
      return c ? { ...L, lines: [...L.lines, c] } : L
    }) }
  } else result = { layers: op.type === 'mountain' ? [...moved, ...stay] : [...stay, ...moved] }
  return { stay, moving, result }
}
export function doFlip(state, axis) {
  const m = (p) => [2 * axis - p[0], p[1]]
  return { layers: state.layers.map((L) => ({ ...L, pts: L.pts.map(m).reverse(), lines: L.lines.map((ln) => ln.map(m)), face: 1 - L.face })).reverse() }
}
export function bbox(layers) {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9
  for (const L of layers) for (const [x, y] of L.pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y) }
  return [x0, y0, x1, y1]
}
// Build all step states for a plane
export function buildSteps(plane) {
  let state = sheet(...(plane.paper || [85, 110]))
  return plane.steps.map((st) => {
    const op = st.op || { kind: 'custom' }
    const before = state
    let info = { before }
    if (op.kind === 'fold') {
      const f = doFold(state, op)
      info = { ...info, ...f }
      state = f.result
    } else if (op.kind === 'flip') {
      state = doFlip(state, op.axis)
    } else if (op.kind === 'sheet') {
      state = sheet(...op.size); info.before = state
    }
    info.after = state
    return { ...st, op, ...info }
  })
}
