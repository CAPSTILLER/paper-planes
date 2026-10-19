export const V = (a, b, s, o = {}) => ({ kind: 'fold', type: 'valley', a, b, s, ...o })
export const M = (a, b, s, o = {}) => ({ kind: 'fold', type: 'mountain', a, b, s, ...o })
export const CR = (a, b, s, o = {}) => ({ kind: 'fold', type: 'valley', a, b, s, crease: true, ...o })
export const FLIP = (axis) => ({ kind: 'flip', axis })
export const ROT = (deg, c) => ({ kind: 'rotate', deg, c })
export const DONE = { kind: 'done' }
export const CUSTOM = (svg) => ({ kind: 'custom', svg })
// Guide picture (illustrative, not computed by the fold engine)
export const G = (draw = {}, set) => ({ kind: 'guide', draw, set })
export const foldTo = (p, q, o = {}) => {
  const m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]
  const d = [q[0] - p[0], q[1] - p[1]]
  return V(m, [m[0] - d[1], m[1] + d[0]], p, o)
}
