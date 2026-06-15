import React, { useState } from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { Canvas } from './Canvas'
import { Stroke, NoteImage, Tool, PageBackground, Page, PaperSize, PAPER_SIZES } from '../types'

interface Props {
  page: Page
  tool: Tool
  color: string
  strokeWidth: number
  background: PageBackground
  paperSize: PaperSize
  onAdd: (s: Stroke) => void
  onRemove: (ids: string[]) => void
}

const PAD = 20
const MAX_W = 860

export function PaperCanvas({ page, tool, color, strokeWidth, background, paperSize, onAdd, onRemove }: Props) {
  const [sz, setSz] = useState({ w: 0, h: 0 })
  const isFree = paperSize === 'free'
  const isScroll = tool === 'scroll'

  const paperW = Math.min(sz.w - PAD * 2, MAX_W)
  const paperH = isFree ? sz.h : paperW * PAPER_SIZES[paperSize].ratio

  // フリーモード: 白いキャンバスがそのまま全画面
  if (isFree) {
    return (
      <View
        style={st.root}
        onLayout={e => setSz({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
      >
        {sz.w > 0 && (
          <Canvas
            strokes={page.strokes} images={page.images}
            tool={tool} color={color} strokeWidth={strokeWidth}
            background={background} onAdd={onAdd} onRemove={onRemove}
          />
        )}
      </View>
    )
  }

  return (
    <View
      style={st.root}
      onLayout={e => setSz({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
    >
      <ScrollView
        scrollEnabled={isScroll}
        showsVerticalScrollIndicator={isScroll}
        contentContainerStyle={[
          st.scrollCont,
          { minHeight: sz.h, paddingVertical: PAD },
        ]}
        keyboardShouldPersistTaps="always"
      >
        {sz.w > 0 && paperW > 0 && (
          <View style={[st.paper, { width: paperW, height: paperH }]}>
            <Canvas
              strokes={page.strokes} images={page.images}
              tool={tool} color={color} strokeWidth={strokeWidth}
              background={background} onAdd={onAdd} onRemove={onRemove}
            />
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#b8bac8' },
  scrollCont: { alignItems: 'center' },
  paper: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 7,
  },
})
