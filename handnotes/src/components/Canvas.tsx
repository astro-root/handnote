import React, { useRef, useState, useEffect } from 'react'
import { View, PanResponder, StyleSheet, LayoutChangeEvent } from 'react-native'
import Svg, { Path, Image as SvgImage, Line, Circle } from 'react-native-svg'
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
  onAdd: (s: Stroke) => void
  onRemove: (ids: string[]) => void
}

const RULE_GAP = 32
const GRID_GAP = 24
const RULE_COLOR = '#c8d4f0'
const GRID_COLOR = '#dde4f5'

export function Canvas({
  strokes, images, tool, color, strokeWidth, background, onAdd, onRemove,
}: Props) {
  const cur = useRef<Stroke | null>(null)
  const [live, setLive] = useState<Stroke | null>(null)
  const [eraserPos, setEraserPos] = useState<{ x: number; y: number } | null>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  const toolRef = useRef(tool)
  const colorRef = useRef(color)
  const widthRef = useRef(strokeWidth)
  const onAddRef = useRef(onAdd)
  const onRemoveRef = useRef(onRemove)
  const strokesRef = useRef(strokes)

  useEffect(() => { toolRef.current = tool }, [tool])
  useEffect(() => { colorRef.current = color }, [color])
  useEffect(() => { widthRef.current = strokeWidth }, [strokeWidth])
  useEffect(() => { onAddRef.current = onAdd }, [onAdd])
  useEffect(() => { onRemoveRef.current = onRemove }, [onRemove])
  useEffect(() => { strokesRef.current = strokes }, [strokes])

  function onLayout(e: LayoutChangeEvent) {
    const { width, height } = e.nativeEvent.layout
    setSize({ width, height })
  }

  const pr = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant(e) {
        const { locationX: x, locationY: y } = e.nativeEvent
        if (toolRef.current === 'eraser') {
          setEraserPos({ x, y })
          const r = Math.max(widthRef.current * 4, 20)
          const hit = strokesRef.current
            .filter(s => s.points.some(p => (p.x - x) ** 2 + (p.y - y) ** 2 < r * r))
            .map(s => s.id)
          if (hit.length) onRemoveRef.current(hit)
          return
        }
        const s: Stroke = {
          id: genId(),
          tool: toolRef.current,
          color: colorRef.current,
          width: widthRef.current,
          points: [{ x, y }],
        }
        cur.current = s
        setLive({ ...s })
      },
      onPanResponderMove(e) {
        const { locationX: x, locationY: y } = e.nativeEvent
        if (toolRef.current === 'eraser') {
          setEraserPos({ x, y })
          const r = Math.max(widthRef.current * 4, 20)
          const hit = strokesRef.current
            .filter(s => s.points.some(p => (p.x - x) ** 2 + (p.y - y) ** 2 < r * r))
            .map(s => s.id)
          if (hit.length) onRemoveRef.current(hit)
          return
        }
        if (!cur.current) return
        cur.current.points.push({ x, y })
        setLive({ ...cur.current, points: [...cur.current.points] })
      },
      onPanResponderRelease() {
        if (toolRef.current === 'eraser') {
          setEraserPos(null)
          return
        }
        if (cur.current && cur.current.points.length) {
          onAddRef.current({ ...cur.current })
        }
        cur.current = null
        setLive(null)
      },
    })
  ).current

  // 背景線
  const bgLines: React.ReactNode[] = []
  if (size.width > 0 && size.height > 0) {
    if (background === 'ruled') {
      for (let y = RULE_GAP; y < size.height; y += RULE_GAP) {
        bgLines.push(<Line key={`h${y}`} x1={0} y1={y} x2={size.width} y2={y} stroke={RULE_COLOR} strokeWidth={1} />)
      }
    } else if (background === 'grid') {
      for (let y = GRID_GAP; y < size.height; y += GRID_GAP) {
        bgLines.push(<Line key={`h${y}`} x1={0} y1={y} x2={size.width} y2={y} stroke={GRID_COLOR} strokeWidth={1} />)
      }
      for (let x = GRID_GAP; x < size.width; x += GRID_GAP) {
        bgLines.push(<Line key={`v${x}`} x1={x} y1={0} x2={x} y2={size.height} stroke={GRID_COLOR} strokeWidth={1} />)
      }
    }
  }

  const eraserR = Math.max(strokeWidth * 4, 20)

  return (
    <View style={st.root} onLayout={onLayout}>
      {/* 単一SVG：罫線(最下) → 画像 → ストローク → 消しゴムカーソル(最上) */}
      <View style={StyleSheet.absoluteFill} {...pr.panHandlers}>
        <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
          {/* 背景レイヤー */}
          {bgLines}

          {/* 画像レイヤー */}
          {images.map((img) => (
            <SvgImage
              key={img.id}
              href={img.uri}
              x={img.x}
              y={img.y}
              width={img.width}
              height={img.height}
            />
          ))}

          {/* ストロークレイヤー */}
          {strokes.map((s) => (
            <Path
              key={s.id}
              d={pts2path(s.points)}
              stroke={s.color}
              strokeWidth={s.width}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          ))}
          {live && (
            <Path
              d={pts2path(live.points)}
              stroke={live.color}
              strokeWidth={live.width}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          )}

          {/* 消しゴムカーソル */}
          {eraserPos && (
            <Circle
              cx={eraserPos.x}
              cy={eraserPos.y}
              r={eraserR}
              fill="rgba(120,120,120,0.15)"
              stroke="#999"
              strokeWidth={1.5}
            />
          )}
        </Svg>
      </View>
    </View>
  )
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ffffff' },
})
