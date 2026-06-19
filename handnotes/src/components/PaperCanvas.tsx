import React, { useState } from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { Canvas }            from './Canvas'
import { ZoomControls }      from './ZoomControls'
import { PageCurlOverlay, CurlHandle } from './PageCurlOverlay'
import {
  Stroke, NoteImage, TextBlock, Tool, PageBackground,
  Page, PaperSize, Orientation, PAPER_SIZES,
} from '../types'

interface Props {
  page: Page
  tool: Tool; color: string; strokeWidth: number
  background: PageBackground; paperSize: PaperSize; orientation: Orientation
  curlRef?: React.RefObject<CurlHandle>
  onAdd(s: Stroke): void
  onRemove(ids: string[]): void
  onRemoveImages(ids: string[]): void
  onMoveItems(strokeIds: string[], imageIds: string[], dx: number, dy: number): void
  onAddText(tb: TextBlock): void
  onUpdateText(id: string, text: string): void
  onRemoveTexts(ids: string[]): void
}

const PAD = 20, MAX_W = 900, MIN_Z = 0.5, MAX_Z = 4, STEP = 0.25

export function PaperCanvas({
  page, tool, color, strokeWidth, background, paperSize, orientation, curlRef,
  onAdd, onRemove, onRemoveImages, onMoveItems,
  onAddText, onUpdateText, onRemoveTexts,
}: Props) {
  const [sz,   setSz]   = useState({ w: 0, h: 0 })
  const [zoom, setZoom] = useState(1)

  const zoomIn    = () => setZoom(z => +(Math.min(MAX_Z, z + STEP)).toFixed(2))
  const zoomOut   = () => setZoom(z => +(Math.max(MIN_Z, z - STEP)).toFixed(2))
  const zoomReset = () => setZoom(1)

  const isFree = paperSize === 'free', isScroll = tool === 'scroll'
  const baseW = Math.min(sz.w - PAD * 2, MAX_W)
  const ratio = PAPER_SIZES[paperSize]?.ratio ?? 0
  const effRatio = orientation === 'landscape' ? 1 / ratio : ratio
  const paperW = isFree ? sz.w : baseW
  const paperH = isFree ? sz.h : baseW * effRatio
  const canvasW = paperW * zoom, canvasH = paperH * zoom

  const canvasProps = {
    strokes: page.strokes, images: page.images, texts: page.texts ?? [],
    tool, color, strokeWidth, background, zoom, pageId: page.id,
    onAdd, onRemove, onRemoveImages, onMoveItems,
    onAddText, onUpdateText, onRemoveTexts,
  }

  if (isFree) {
    return (
      <View style={st.root} onLayout={e => setSz({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
        {sz.w > 0 && (
          <>
            <View style={StyleSheet.absoluteFill}><Canvas {...canvasProps} /></View>
            <ZoomControls zoom={zoom} onIn={zoomIn} onOut={zoomOut} onReset={zoomReset} />
          </>
        )}
      </View>
    )
  }

  return (
    <View style={st.root} onLayout={e => setSz({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      <ScrollView
        scrollEnabled={isScroll || zoom > 1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[st.scrollCont, { minHeight: sz.h, paddingVertical: PAD }]}
        keyboardShouldPersistTaps="always"
      >
        {sz.w > 0 && paperW > 0 && (
          <View style={[st.paper, { width: canvasW, height: canvasH }]}>
            <Canvas {...canvasProps} />
            <PageCurlOverlay ref={curlRef} paperWidth={canvasW} paperHeight={canvasH} />
          </View>
        )}
      </ScrollView>
      <ZoomControls zoom={zoom} onIn={zoomIn} onOut={zoomOut} onReset={zoomReset} />
    </View>
  )
}

const st = StyleSheet.create({
  root:       { flex: 1, backgroundColor: '#b8bac8' },
  scrollCont: { alignItems: 'center' },
  paper: {
    backgroundColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24, shadowRadius: 16, elevation: 8,
  },
})
