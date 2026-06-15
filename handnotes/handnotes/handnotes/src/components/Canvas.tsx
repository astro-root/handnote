import React, { useRef, useState, useEffect } from 'react'
import { View, PanResponder, StyleSheet } from 'react-native'
import Svg, { Path, Image as SvgImage } from 'react-native-svg'
import { Stroke, NoteImage, Tool } from '../types'
import { genId } from '../storage/storage'
import { pts2path } from '../utils/svgPath'

interface Props {
  strokes: Stroke[]
  images: NoteImage[]
  tool: Tool
  color: string
  strokeWidth: number
  onAdd: (s: Stroke) => void
}

export function Canvas({ strokes, images, tool, color, strokeWidth, onAdd }: Props) {
  const cur = useRef<Stroke | null>(null)
  const [live, setLive] = useState<Stroke | null>(null)
  const toolRef = useRef(tool)
  const colorRef = useRef(color)
  const widthRef = useRef(strokeWidth)
  const onAddRef = useRef(onAdd)

  useEffect(() => { toolRef.current = tool }, [tool])
  useEffect(() => { colorRef.current = color }, [color])
  useEffect(() => { widthRef.current = strokeWidth }, [strokeWidth])
  useEffect(() => { onAddRef.current = onAdd }, [onAdd])

  const pr = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant(e) {
        const { locationX: x, locationY: y } = e.nativeEvent
        const t = toolRef.current
        const s: Stroke = {
          id: genId(),
          tool: t,
          color: t === 'eraser' ? '#ffffff' : colorRef.current,
          width: t === 'eraser' ? Math.max(widthRef.current * 5, 24) : widthRef.current,
          points: [{ x, y }],
        }
        cur.current = s
        setLive({ ...s })
      },
      onPanResponderMove(e) {
        if (!cur.current) return
        const { locationX: x, locationY: y } = e.nativeEvent
        cur.current.points.push({ x, y })
        setLive({ ...cur.current, points: [...cur.current.points] })
      },
      onPanResponderRelease() {
        if (cur.current && cur.current.points.length) {
          onAddRef.current({ ...cur.current })
        }
        cur.current = null
        setLive(null)
      },
    })
  ).current

  return (
    <View style={st.root} {...pr.panHandlers}>
      <Svg style={StyleSheet.absoluteFill}>
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
      </Svg>
    </View>
  )
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ffffff' },
})
