import React, { useRef, useState, useEffect } from 'react'
import { View, PanResponder, StyleSheet } from 'react-native'
import Svg, {
  Path, Image as SvgImage, Line, Circle,
  Defs, Mask, Rect, G,
} from 'react-native-svg'
import { Stroke, NoteImage, Tool, PageBackground } from '../types'
import { genId } from '../storage/storage'
import { pts2path } from '../utils/svgPath'

interface Props {
  strokes: Stroke[]
  images: NoteImage[]
  tool: Tool
  color: string
  strokeWidth: number
  background: PageBackground
  zoom: number
  onAdd: (s: Stroke) => void
  onRemove: (ids: string[]) => void
}

/* ── 背景レンダリング ─────────────────────────────────────── */
function mkBg(bg: PageBackground, W: number, H: number): React.ReactNode[] {
  if (W <= 0 || H <= 0) return []
  const RC = '#c8d4f0', GC = '#dde4f5', DC = '#b8c8e0', AC = '#b0a0e8'
  const out: React.ReactNode[] = []
  let k = 0

  /* 横罫 */
  if (bg === 'ruled' || bg === 'ruled-narrow' || bg === 'ruled-wide') {
    const gap = bg === 'ruled-narrow' ? 22 : bg === 'ruled-wide' ? 48 : 32
    for (let y = gap; y < H; y += gap)
      out.push(<Line key={k++} x1={0} y1={y} x2={W} y2={y} stroke={RC} strokeWidth={1} />)
    return out
  }

  /* 方眼 */
  if (bg === 'grid' || bg === 'grid-small' || bg === 'grid-large') {
    const gap = bg === 'grid-small' ? 16 : bg === 'grid-large' ? 40 : 24
    for (let y = gap; y < H; y += gap)
      out.push(<Line key={k++} x1={0} y1={y} x2={W} y2={y} stroke={GC} strokeWidth={1} />)
    for (let x = gap; x < W; x += gap)
      out.push(<Line key={k++} x1={x} y1={0} x2={x} y2={H} stroke={GC} strokeWidth={1} />)
    return out
  }

  /* ドット */
  if (bg === 'dotted') {
    const gap = 28
    for (let y = gap; y < H; y += gap)
      for (let x = gap; x < W; x += gap)
        out.push(<Circle key={k++} cx={x} cy={y} r={1.6} fill={DC} />)
    return out
  }

  /* コーネル式 */
  if (bg === 'cornell') {
    const mx = Math.round(W * 0.25)
    const hy = 56, fy = H - 44, rg = 30
    for (let y = hy + rg; y < fy; y += rg)
      out.push(<Line key={k++} x1={0} y1={y} x2={W} y2={y} stroke={RC} strokeWidth={1} />)
    out.push(
      <Line key={k++} x1={mx} y1={hy} x2={mx} y2={fy} stroke={AC} strokeWidth={1.5} />,
      <Line key={k++} x1={0}  y1={hy} x2={W}  y2={hy} stroke={AC} strokeWidth={1.5} />,
      <Line key={k++} x1={0}  y1={fy} x2={W}  y2={fy} stroke={AC} strokeWidth={1.5} />,
    )
    return out
  }

  /* 五線譜 */
  if (bg === 'music') {
    const lg = 9, sg = 46, top = 36
    let y = top
    while (y + lg * 4 < H) {
      for (let i = 0; i < 5; i++)
        out.push(<Line key={k++} x1={0} y1={y + i * lg} x2={W} y2={y + i * lg} stroke={RC} strokeWidth={0.9} />)
      y += lg * 4 + sg
    }
    return out
  }

  /* 六角形 (flat-top, r=26) */
  if (bg === 'hex') {
    const r = 26, cs = r * 1.5, rs = r * Math.sqrt(3)
    for (let col = -1; col * cs - r < W + r; col++) {
      const cx = col * cs + r
      const stagger = (((col % 2) + 2) % 2) !== 0 ? rs / 2 : 0
      for (let row = -1; row * rs + stagger - r < H + r; row++) {
        const cy = row * rs + stagger
        const pts = Array.from({ length: 6 }, (_, i) => {
          const a = (Math.PI / 3) * i
          return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`
        })
        out.push(<Path key={k++} d={`M ${pts.join(' L ')} Z`} fill="none" stroke={GC} strokeWidth={0.8} />)
      }
    }
    return out
  }

  /* 等角投影 (isometric) */
  if (bg === 'isometric') {
    const S3 = Math.sqrt(3), gap = 28, ds = gap * 2
    for (let y = gap; y < H; y += gap)
      out.push(<Line key={k++} x1={0} y1={y} x2={W} y2={y} stroke={GC} strokeWidth={0.6} />)
    const ext = Math.ceil(S3 * W / ds) * ds + ds
    for (let c = -ext; c < H + S3 * W + ds; c += ds) {
      out.push(<Line key={k++} x1={0} y1={c} x2={W} y2={c - S3 * W} stroke={GC} strokeWidth={0.6} />)
      out.push(<Line key={k++} x1={0} y1={c} x2={W} y2={c + S3 * W} stroke={GC} strokeWidth={0.6} />)
    }
    return out
  }

  return []
}

/* ── Canvas コンポーネント ──────────────────────────────────── */
export function Canvas({
  strokes, images, tool, color, strokeWidth, background, zoom, onAdd, onRemove,
}: Props) {
  const cur = useRef<Stroke | null>(null)
  const [live, setLive] = useState<Stroke | null>(null)
  const [eraserPos, setEraserPos] = useState<{ x: number; y: number } | null>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  const toolRef     = useRef(tool)
  const colorRef    = useRef(color)
  const widthRef    = useRef(strokeWidth)
  const onAddRef    = useRef(onAdd)
  const onRemoveRef = useRef(onRemove)
  const strokesRef  = useRef(strokes)
  const zoomRef     = useRef(zoom)

  useEffect(() => { toolRef.current     = tool },        [tool])
  useEffect(() => { colorRef.current    = color },       [color])
  useEffect(() => { widthRef.current    = strokeWidth }, [strokeWidth])
  useEffect(() => { onAddRef.current    = onAdd },       [onAdd])
  useEffect(() => { onRemoveRef.current = onRemove },    [onRemove])
  useEffect(() => { strokesRef.current  = strokes },     [strokes])
  useEffect(() => { zoomRef.current     = zoom },        [zoom])

  const isDrawing = () => toolRef.current !== 'scroll'

  const pr = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isDrawing(),
      onMoveShouldSetPanResponder:  () => isDrawing(),

      onPanResponderGrant(e) {
        if (!isDrawing()) return
        const z  = zoomRef.current
        const lx = e.nativeEvent.locationX / z
        const ly = e.nativeEvent.locationY / z
        const t  = toolRef.current

        if (t === 'eraser') {
          setEraserPos({ x: lx, y: ly })
          const r = Math.max(widthRef.current * 4, 20)
          const hit = strokesRef.current
            .filter(s => s.tool !== 'eraser-pixel' &&
              s.points.some(p => (p.x - lx) ** 2 + (p.y - ly) ** 2 < r * r))
            .map(s => s.id)
          if (hit.length) onRemoveRef.current(hit)
          return
        }

        const s: Stroke = {
          id: genId(), tool: t,
          color: t === 'eraser-pixel' ? '#000' : colorRef.current,
          width: t === 'eraser-pixel' ? Math.max(widthRef.current * 5, 24) : widthRef.current,
          points: [{ x: lx, y: ly }],
        }
        cur.current = s
        setLive({ ...s })
      },

      onPanResponderMove(e) {
        if (!isDrawing()) return
        const z  = zoomRef.current
        const lx = e.nativeEvent.locationX / z
        const ly = e.nativeEvent.locationY / z
        const t  = toolRef.current

        if (t === 'eraser') {
          setEraserPos({ x: lx, y: ly })
          const r = Math.max(widthRef.current * 4, 20)
          const hit = strokesRef.current
            .filter(s => s.tool !== 'eraser-pixel' &&
              s.points.some(p => (p.x - lx) ** 2 + (p.y - ly) ** 2 < r * r))
            .map(s => s.id)
          if (hit.length) onRemoveRef.current(hit)
          return
        }

        if (!cur.current) return
        cur.current.points.push({ x: lx, y: ly })
        setLive({ ...cur.current, points: [...cur.current.points] })
      },

      onPanResponderRelease() {
        if (toolRef.current === 'eraser') { setEraserPos(null); return }
        if (!isDrawing()) return
        if (cur.current?.points.length) onAddRef.current({ ...cur.current })
        cur.current = null; setLive(null)
      },

      onPanResponderTerminate() {
        cur.current = null; setLive(null); setEraserPos(null)
      },
    })
  ).current

  const logW = size.width  > 0 && zoom > 0 ? size.width  / zoom : size.width
  const logH = size.height > 0 && zoom > 0 ? size.height / zoom : size.height
  const eraserR = Math.max(strokeWidth * 4, 20)

  const inkStrokes        = strokes.filter(s => s.tool !== 'eraser-pixel')
  const pixelEraserStrokes= strokes.filter(s => s.tool === 'eraser-pixel')
  const liveIsPixel       = live?.tool === 'eraser-pixel'

  return (
    <View
      style={st.root}
      onLayout={e => {
        const { width, height } = e.nativeEvent.layout
        setSize({ width, height })
      }}
    >
      <View style={StyleSheet.absoluteFill} {...pr.panHandlers}>
        <Svg
          width={size.width}
          height={size.height}
          viewBox={`0 0 ${logW} ${logH}`}
          style={StyleSheet.absoluteFill}
        >
          {/* 背景パターン */}
          {mkBg(background, logW, logH)}

          {size.width > 0 && (
            <>
              <Defs>
                <Mask id="inkMask">
                  <Rect x={0} y={0} width={logW} height={logH} fill="white" />
                  {pixelEraserStrokes.map(s => (
                    <Path key={s.id} d={pts2path(s.points)} stroke="black"
                      strokeWidth={s.width} strokeLinecap="round" fill="none" />
                  ))}
                  {liveIsPixel && live && (
                    <Path d={pts2path(live.points)} stroke="black"
                      strokeWidth={live.width} strokeLinecap="round" fill="none" />
                  )}
                </Mask>
              </Defs>
              <G mask="url(#inkMask)">
                {images.map(img => (
                  <SvgImage key={img.id} href={img.uri}
                    x={img.x} y={img.y} width={img.width} height={img.height} />
                ))}
                {inkStrokes.map(s => (
                  <Path key={s.id} d={pts2path(s.points)} stroke={s.color}
                    strokeWidth={s.width} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                ))}
                {!liveIsPixel && live && (
                  <Path d={pts2path(live.points)} stroke={live.color}
                    strokeWidth={live.width} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                )}
              </G>
            </>
          )}

          {eraserPos && (
            <Circle cx={eraserPos.x} cy={eraserPos.y} r={eraserR}
              fill="rgba(120,120,120,0.15)" stroke="#999" strokeWidth={1.5} />
          )}
        </Svg>
      </View>
    </View>
  )
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ffffff' },
})
