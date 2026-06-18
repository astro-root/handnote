import React, { useRef, useState, useEffect } from 'react'
import { View, PanResponder, StyleSheet, TouchableOpacity } from 'react-native'
import Svg, {
  Path, Image as SvgImage, Line, Circle,
  Defs, Mask, Rect, G,
} from 'react-native-svg'
import { Stroke, NoteImage, Tool, PageBackground } from '../types'
import { genId } from '../storage/storage'
import { pts2path } from '../utils/svgPath'
import { TrashIcon } from './icons'

interface Props {
  strokes: Stroke[]
  images: NoteImage[]
  tool: Tool
  color: string
  strokeWidth: number
  background: PageBackground
  zoom: number
  pageId: string
  onAdd: (s: Stroke) => void
  onRemove: (ids: string[]) => void
  onRemoveImages: (ids: string[]) => void
  onMoveItems: (strokeIds: string[], imageIds: string[], dx: number, dy: number) => void
}

/* ── 背景レンダリング ─────────────────────────────────────── */
function mkBg(bg: PageBackground, W: number, H: number): React.ReactNode[] {
  if (W <= 0 || H <= 0) return []
  const RC = '#c8d4f0', GC = '#dde4f5', DC = '#b8c8e0', AC = '#b0a0e8'
  const out: React.ReactNode[] = []
  let k = 0

  if (bg === 'ruled' || bg === 'ruled-narrow' || bg === 'ruled-wide') {
    const gap = bg === 'ruled-narrow' ? 22 : bg === 'ruled-wide' ? 48 : 32
    for (let y = gap; y < H; y += gap)
      out.push(<Line key={k++} x1={0} y1={y} x2={W} y2={y} stroke={RC} strokeWidth={1} />)
    return out
  }

  if (bg === 'grid' || bg === 'grid-small' || bg === 'grid-large') {
    const gap = bg === 'grid-small' ? 16 : bg === 'grid-large' ? 40 : 24
    for (let y = gap; y < H; y += gap)
      out.push(<Line key={k++} x1={0} y1={y} x2={W} y2={y} stroke={GC} strokeWidth={1} />)
    for (let x = gap; x < W; x += gap)
      out.push(<Line key={k++} x1={x} y1={0} x2={x} y2={H} stroke={GC} strokeWidth={1} />)
    return out
  }

  if (bg === 'dotted') {
    const gap = 28
    for (let y = gap; y < H; y += gap)
      for (let x = gap; x < W; x += gap)
        out.push(<Circle key={k++} cx={x} cy={y} r={1.6} fill={DC} />)
    return out
  }

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

/* ── 選択ツール用ヘルパー ──────────────────────────────────── */
function strokeBBox(s: Stroke) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const p of s.points) {
    if (p.x < minX) minX = p.x
    if (p.x > maxX) maxX = p.x
    if (p.y < minY) minY = p.y
    if (p.y > maxY) maxY = p.y
  }
  return { minX, minY, maxX, maxY }
}

function strokeInRect(s: Stroke, x0: number, y0: number, x1: number, y1: number) {
  return s.points.some(p => p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1)
}

function imageInRect(img: NoteImage, x0: number, y0: number, x1: number, y1: number) {
  return img.x < x1 && img.x + img.width > x0 && img.y < y1 && img.y + img.height > y0
}

function strokeNearPoint(s: Stroke, px: number, py: number, tol: number) {
  return s.points.some(p => (p.x - px) ** 2 + (p.y - py) ** 2 <= tol * tol)
}

function imageContainsPoint(img: NoteImage, px: number, py: number) {
  return px >= img.x && px <= img.x + img.width && py >= img.y && py <= img.y + img.height
}

function selectionBBox(
  strokes: Stroke[], images: NoteImage[],
  selStrokeIds: Set<string>, selImageIds: Set<string>, pad = 12,
) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  let any = false
  for (const s of strokes) {
    if (!selStrokeIds.has(s.id)) continue
    const b = strokeBBox(s)
    if (b.minX === Infinity) continue
    any = true
    minX = Math.min(minX, b.minX); minY = Math.min(minY, b.minY)
    maxX = Math.max(maxX, b.maxX); maxY = Math.max(maxY, b.maxY)
  }
  for (const img of images) {
    if (!selImageIds.has(img.id)) continue
    any = true
    minX = Math.min(minX, img.x); minY = Math.min(minY, img.y)
    maxX = Math.max(maxX, img.x + img.width); maxY = Math.max(maxY, img.y + img.height)
  }
  if (!any) return null
  return { x: minX - pad, y: minY - pad, w: (maxX - minX) + pad * 2, h: (maxY - minY) + pad * 2 }
}

/* ── Canvas コンポーネント ──────────────────────────────────── */
export function Canvas({
  strokes, images, tool, color, strokeWidth, background, zoom, pageId,
  onAdd, onRemove, onRemoveImages, onMoveItems,
}: Props) {
  const cur = useRef<Stroke | null>(null)
  const [live, setLive] = useState<Stroke | null>(null)
  const [eraserPos, setEraserPos] = useState<{ x: number; y: number } | null>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  const [selStrokeIds, setSelStrokeIds] = useState<Set<string>>(new Set())
  const [selImageIds,  setSelImageIds]  = useState<Set<string>>(new Set())
  const [marquee,      setMarquee]      = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const [moveDelta,    setMoveDelta]    = useState<{ dx: number; dy: number } | null>(null)

  const toolRef     = useRef(tool)
  const colorRef    = useRef(color)
  const widthRef    = useRef(strokeWidth)
  const onAddRef    = useRef(onAdd)
  const onRemoveRef = useRef(onRemove)
  const onRemoveImagesRef = useRef(onRemoveImages)
  const onMoveItemsRef    = useRef(onMoveItems)
  const strokesRef  = useRef(strokes)
  const imagesRef   = useRef(images)
  const zoomRef     = useRef(zoom)
  const selStrokeIdsRef = useRef(selStrokeIds)
  const selImageIdsRef  = useRef(selImageIds)

  useEffect(() => { toolRef.current     = tool },        [tool])
  useEffect(() => { colorRef.current    = color },       [color])
  useEffect(() => { widthRef.current    = strokeWidth }, [strokeWidth])
  useEffect(() => { onAddRef.current    = onAdd },       [onAdd])
  useEffect(() => { onRemoveRef.current = onRemove },    [onRemove])
  useEffect(() => { onRemoveImagesRef.current = onRemoveImages }, [onRemoveImages])
  useEffect(() => { onMoveItemsRef.current    = onMoveItems    }, [onMoveItems])
  useEffect(() => { strokesRef.current  = strokes },     [strokes])
  useEffect(() => { imagesRef.current   = images },      [images])
  useEffect(() => { zoomRef.current     = zoom },        [zoom])
  useEffect(() => { selStrokeIdsRef.current = selStrokeIds }, [selStrokeIds])
  useEffect(() => { selImageIdsRef.current  = selImageIds  }, [selImageIds])

  /* ページ切替で選択状態をリセット */
  const prevPageId = useRef(pageId)
  useEffect(() => {
    if (prevPageId.current !== pageId) {
      prevPageId.current = pageId
      setSelStrokeIds(new Set())
      setSelImageIds(new Set())
      setMarquee(null)
      setMoveDelta(null)
    }
  }, [pageId])

  /* select 以外のツールに切り替えたら選択解除 */
  useEffect(() => {
    if (tool !== 'select') {
      setSelStrokeIds(new Set())
      setSelImageIds(new Set())
      setMarquee(null)
      setMoveDelta(null)
    }
  }, [tool])

  const isDrawing = () => toolRef.current !== 'scroll'

  /* ジェスチャー中だけ使う一時参照 */
  const gestureMode  = useRef<'none' | 'marquee' | 'move'>('none')
  const moveStart    = useRef({ x: 0, y: 0 })
  const marqueeStart = useRef({ x: 0, y: 0 })

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

        if (t === 'select') {
          const bbox = selectionBBox(strokesRef.current, imagesRef.current, selStrokeIdsRef.current, selImageIdsRef.current)
          const inside = bbox && lx >= bbox.x && lx <= bbox.x + bbox.w && ly >= bbox.y && ly <= bbox.y + bbox.h
          if (inside) {
            gestureMode.current = 'move'
            moveStart.current = { x: lx, y: ly }
            setMoveDelta({ dx: 0, dy: 0 })
          } else {
            gestureMode.current = 'marquee'
            marqueeStart.current = { x: lx, y: ly }
            setMarquee({ x: lx, y: ly, w: 0, h: 0 })
          }
          return
        }

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

        if (t === 'select') {
          if (gestureMode.current === 'move') {
            setMoveDelta({ dx: lx - moveStart.current.x, dy: ly - moveStart.current.y })
          } else if (gestureMode.current === 'marquee') {
            const sx = marqueeStart.current.x, sy = marqueeStart.current.y
            setMarquee({ x: Math.min(sx, lx), y: Math.min(sy, ly), w: Math.abs(lx - sx), h: Math.abs(ly - sy) })
          }
          return
        }

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

      onPanResponderRelease(e) {
        const t = toolRef.current

        if (t === 'select') {
          const z  = zoomRef.current
          const lx = e.nativeEvent.locationX / z
          const ly = e.nativeEvent.locationY / z

          if (gestureMode.current === 'move') {
            const dx = lx - moveStart.current.x
            const dy = ly - moveStart.current.y
            gestureMode.current = 'none'
            setMoveDelta(null)
            if (dx !== 0 || dy !== 0) {
              onMoveItemsRef.current(
                Array.from(selStrokeIdsRef.current),
                Array.from(selImageIdsRef.current),
                dx, dy,
              )
            }
            return
          }

          if (gestureMode.current === 'marquee') {
            const sx = marqueeStart.current.x, sy = marqueeStart.current.y
            const x0 = Math.min(sx, lx), x1 = Math.max(sx, lx)
            const y0 = Math.min(sy, ly), y1 = Math.max(sy, ly)
            const w = x1 - x0, h = y1 - y0
            gestureMode.current = 'none'
            setMarquee(null)

            if (w < 6 && h < 6) {
              const tol = 14
              const hitStroke = [...strokesRef.current].reverse().find(
                s => s.tool !== 'eraser-pixel' && strokeNearPoint(s, lx, ly, tol)
              )
              const hitImage = !hitStroke
                ? [...imagesRef.current].reverse().find(img => imageContainsPoint(img, lx, ly))
                : undefined
              if (hitStroke) {
                setSelStrokeIds(new Set([hitStroke.id]))
                setSelImageIds(new Set())
              } else if (hitImage) {
                setSelStrokeIds(new Set())
                setSelImageIds(new Set([hitImage.id]))
              } else {
                setSelStrokeIds(new Set())
                setSelImageIds(new Set())
              }
            } else {
              const hitStrokeIds = strokesRef.current
                .filter(s => s.tool !== 'eraser-pixel' && strokeInRect(s, x0, y0, x1, y1))
                .map(s => s.id)
              const hitImageIds = imagesRef.current
                .filter(img => imageInRect(img, x0, y0, x1, y1))
                .map(img => img.id)
              setSelStrokeIds(new Set(hitStrokeIds))
              setSelImageIds(new Set(hitImageIds))
            }
            return
          }
          return
        }

        if (t === 'eraser') { setEraserPos(null); return }
        if (!isDrawing()) return
        if (cur.current?.points.length) onAddRef.current({ ...cur.current })
        cur.current = null; setLive(null)
      },

      onPanResponderTerminate() {
        cur.current = null; setLive(null); setEraserPos(null)
        gestureMode.current = 'none'
        setMarquee(null)
        setMoveDelta(null)
      },
    })
  ).current

  const logW = size.width  > 0 && zoom > 0 ? size.width  / zoom : size.width
  const logH = size.height > 0 && zoom > 0 ? size.height / zoom : size.height
  const eraserR = Math.max(strokeWidth * 4, 20)

  const inkStrokes         = strokes.filter(s => s.tool !== 'eraser-pixel')
  const pixelEraserStrokes = strokes.filter(s => s.tool === 'eraser-pixel')
  const liveIsPixel        = live?.tool === 'eraser-pixel'

  const hasSelection  = selStrokeIds.size > 0 || selImageIds.size > 0
  const normalStrokes = hasSelection ? inkStrokes.filter(s => !selStrokeIds.has(s.id)) : inkStrokes
  const movingStrokes = hasSelection ? inkStrokes.filter(s => selStrokeIds.has(s.id))  : []
  const normalImages  = hasSelection ? images.filter(img => !selImageIds.has(img.id)) : images
  const movingImages  = hasSelection ? images.filter(img => selImageIds.has(img.id))  : []

  const dx = moveDelta?.dx ?? 0
  const dy = moveDelta?.dy ?? 0

  const liveBBox = hasSelection
    ? selectionBBox(strokes, images, selStrokeIds, selImageIds)
    : null

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
                {normalImages.map(img => (
                  <SvgImage key={img.id} href={img.uri}
                    x={img.x} y={img.y} width={img.width} height={img.height} />
                ))}
                {normalStrokes.map(s => (
                  <Path key={s.id} d={pts2path(s.points)} stroke={s.color}
                    strokeWidth={s.width} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                ))}

                {hasSelection && (
                  <G transform={`translate(${dx}, ${dy})`}>
                    {movingImages.map(img => (
                      <SvgImage key={img.id} href={img.uri}
                        x={img.x} y={img.y} width={img.width} height={img.height} />
                    ))}
                    {movingStrokes.map(s => (
                      <Path key={s.id} d={pts2path(s.points)} stroke={s.color}
                        strokeWidth={s.width} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    ))}
                  </G>
                )}

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

          {marquee && (
            <Rect x={marquee.x} y={marquee.y} width={marquee.w} height={marquee.h}
              fill="rgba(108,99,255,0.12)" stroke="#6c63ff" strokeWidth={1.2} strokeDasharray="6,4" />
          )}

          {!marquee && liveBBox && (
            <Rect
              x={liveBBox.x + dx} y={liveBBox.y + dy}
              width={liveBBox.w} height={liveBBox.h}
              fill="none" stroke="#6c63ff" strokeWidth={1.4} strokeDasharray="6,4"
            />
          )}
        </Svg>
      </View>

      {tool === 'select' && liveBBox && !moveDelta && (
        <View
          style={[
            st.selToolbar,
            {
              left: Math.max(4, (liveBBox.x + liveBBox.w) * zoom - 36),
              top:  Math.max(4, liveBBox.y * zoom - 44),
            },
          ]}
        >
          <TouchableOpacity
            style={st.selDeleteBtn}
            onPress={() => {
              const sIds = Array.from(selStrokeIds)
              const iIds = Array.from(selImageIds)
              if (sIds.length) onRemove(sIds)
              if (iIds.length) onRemoveImages(iIds)
              setSelStrokeIds(new Set())
              setSelImageIds(new Set())
            }}
          >
            <TrashIcon size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ffffff' },
  selToolbar: { position: 'absolute' },
  selDeleteBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(220,60,60,0.92)',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4,
  },
})
