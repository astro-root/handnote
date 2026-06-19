import React, { useRef, useEffect } from 'react'
import { View, PanResponder, StyleSheet, Platform } from 'react-native'
import { PaperCanvas }    from './PaperCanvas'
import { CurlHandle }     from './PageCurlOverlay'
import { Stroke, NoteImage, TextBlock, Tool, PageBackground, Page, PaperSize, Orientation } from '../types'

interface Props {
  pages: Page[]; pageIdx: number
  tool: Tool; color: string; strokeWidth: number
  background: PageBackground; paperSize: PaperSize; orientation: Orientation
  onAdd(s: Stroke): void
  onRemove(ids: string[]): void
  onRemoveImages(ids: string[]): void
  onMoveItems(strokeIds: string[], imageIds: string[], dx: number, dy: number): void
  onAddText(tb: TextBlock): void
  onUpdateText(id: string, text: string): void
  onRemoveTexts(ids: string[]): void
  onPageChange(idx: number): void
}

export function PageSwiper({
  pages, pageIdx, tool, color, strokeWidth, background, paperSize, orientation,
  onAdd, onRemove, onRemoveImages, onMoveItems,
  onAddText, onUpdateText, onRemoveTexts, onPageChange,
}: Props) {
  const pageIdxRef = useRef(pageIdx), pagesRef = useRef(pages), onPageChangeRef = useRef(onPageChange)
  const curlRef = useRef<CurlHandle>(null), flipping = useRef(false)

  useEffect(() => { pageIdxRef.current = pageIdx },        [pageIdx])
  useEffect(() => { pagesRef.current   = pages },          [pages])
  useEffect(() => { onPageChangeRef.current = onPageChange },[onPageChange])

  function flipTo(newIdx: number) {
    if (flipping.current) return
    flipping.current = true
    if (curlRef.current) {
      curlRef.current.flip(() => { onPageChangeRef.current(newIdx) }, () => { flipping.current = false })
    } else { onPageChangeRef.current(newIdx); flipping.current = false }
  }

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return
    const fn = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      const idx = pageIdxRef.current, len = pagesRef.current.length
      if (e.key === 'ArrowRight' && idx < len - 1) flipTo(idx + 1)
      if (e.key === 'ArrowLeft'  && idx > 0)       flipTo(idx - 1)
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [])

  const swipePR = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onStartShouldSetPanResponderCapture: () => false,
    onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 40 && Math.abs(gs.dx) > Math.abs(gs.dy) * 2,
    onMoveShouldSetPanResponderCapture: (_, gs) => Math.abs(gs.dx) > 40 && Math.abs(gs.dx) > Math.abs(gs.dy) * 2,
    onPanResponderRelease(_, gs) {
      const idx = pageIdxRef.current, len = pagesRef.current.length
      if (gs.dx < -55 && idx < len - 1) flipTo(idx + 1)
      else if (gs.dx > 55 && idx > 0)   flipTo(idx - 1)
    },
  })).current

  const page = pages[pageIdx]
  if (!page) return null

  return (
    <View style={st.root} {...swipePR.panHandlers}>
      <PaperCanvas
        page={page} tool={tool} color={color} strokeWidth={strokeWidth}
        background={background} paperSize={paperSize} orientation={orientation}
        curlRef={curlRef}
        onAdd={onAdd} onRemove={onRemove} onRemoveImages={onRemoveImages} onMoveItems={onMoveItems}
        onAddText={onAddText} onUpdateText={onUpdateText} onRemoveTexts={onRemoveTexts}
      />
    </View>
  )
}

const st = StyleSheet.create({ root: { flex: 1 } })
