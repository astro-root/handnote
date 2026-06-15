import { Point } from '../types'

export function pts2path(pts: Point[]): string {
  if (!pts.length) return ''
  if (pts.length === 1) return `M${pts[0].x} ${pts[0].y}l.01 0`
  let d = `M${pts[0].x} ${pts[0].y}`
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i].x + pts[i + 1].x) / 2
    const my = (pts[i].y + pts[i + 1].y) / 2
    d += ` Q${pts[i].x} ${pts[i].y} ${mx} ${my}`
  }
  const lp = pts[pts.length - 1]
  return `${d} L${lp.x} ${lp.y}`
}
