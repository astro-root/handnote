import React, { useRef, useEffect } from 'react'
import { View, Animated, PanResponder, StyleSheet, Platform } from 'react-native'
import { PaperCanvas } from './PaperCanvas'
import { Stroke, NoteImage, Tool, PageBackground, Page, PaperSize } from '../types'

interface Props {
  pages: Page[]
  pageIdx: number
  tool: Tool
  color: string
  strokeWidth: number
  background: PageBackground
  paperSize: PaperSize
  onAdd: (s: Stroke) => void
  onRemove: (ids: string[]) => void
  onPageChange: (idx: number) => void
}

export function PageSwiper({
  pages, pageIdx, tool, color, strokeWidth, background, paperSize,
  onAdd, onRemove, onPageChange,
}: Props) {
  const slideAnim = useRef(new Animated.Value(0)).current
  const prevIdxRef = useRef(pageIdx)
  const pageIdxRef = useRef(pageIdx)
  const pagesRef = useRef(pages)
  const onPageChangeRef = useRef(onPageChange)
  const widthRef = useRef(0)
  const skipNextAnim = useRef(false)

  useEffect(() => { pageIdxRef.current = pageIdx }, [pageIdx])
  useEffect(() => { pagesRef.current = pages }, [pages])
  useEffect(() => { onPageChangeRef.current = onPageChange }, [onPageChange])

  // キーボード ← → (Web)
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      const idx = pageIdxRef.current
      const len = pagesRef.current.length
      if (e.key === 'ArrowRight' && idx < len - 1) onPageChangeRef.current(idx + 1)
      if (e.key === 'ArrowLeft'  && idx > 0)       onPageChangeRef.current(idx - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // タブ・キーボードによる外部変更時のスライドアニメーション
  useEffect(() => {
    const prev = prevIdxRef.current
    if (prev === pageIdx) return
    prevIdxRef.current = pageIdx
    if (skipNextAnim.current) { skipNextAnim.current = false; return }
    const w = widthRef.current
    if (w === 0) return
    const dir = pageIdx > prev ? 1 : -1
    slideAnim.setValue(-dir * w)
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 210, friction: 26 }).start()
  }, [pageIdx])

  const swipePR = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.vx) > 0.5 && Math.abs(gs.dx) > Math.abs(gs.dy) * 2.5 && Math.abs(gs.dx) > 50,
      onMoveShouldSetPanResponderCapture: (_, gs) =>
        Math.abs(gs.vx) > 0.5 && Math.abs(gs.dx) > Math.abs(gs.dy) * 2.5 && Math.abs(gs.dx) > 50,

      onPanResponderMove: (_, gs) => {
        const idx = pageIdxRef.current
        const len = pagesRef.current.length
        if ((gs.dx > 0 && idx === 0) || (gs.dx < 0 && idx === len - 1)) {
          slideAnim.setValue(gs.dx * 0.12)
        } else {
          slideAnim.setValue(gs.dx)
        }
      },

      onPanResponderRelease: (_, gs) => {
        const idx = pageIdxRef.current
        const len = pagesRef.current.length
        const w = widthRef.current
        const threshold = Math.min(w * 0.28, 100)
        if (gs.dx < -threshold && idx < len - 1) {
          skipNextAnim.current = true
          Animated.timing(slideAnim, { toValue: -w, duration: 190, useNativeDriver: true }).start(() => {
            onPageChangeRef.current(idx + 1)
            slideAnim.setValue(0)
          })
        } else if (gs.dx > threshold && idx > 0) {
          skipNextAnim.current = true
          Animated.timing(slideAnim, { toValue: w, duration: 190, useNativeDriver: true }).start(() => {
            onPageChangeRef.current(idx - 1)
            slideAnim.setValue(0)
          })
        } else {
          Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 300, friction: 20 }).start()
        }
      },

      onPanResponderTerminate: () => {
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true }).start()
      },
    })
  ).current

  const page = pages[pageIdx]
  if (!page) return null

  return (
    <View
      style={st.root}
      onLayout={e => { widthRef.current = e.nativeEvent.layout.width }}
      {...swipePR.panHandlers}
    >
      <Animated.View style={[st.inner, { transform: [{ translateX: slideAnim }] }]}>
        <PaperCanvas
          page={page}
          tool={tool}
          color={color}
          strokeWidth={strokeWidth}
          background={background}
          paperSize={paperSize}
          onAdd={onAdd}
          onRemove={onRemove}
        />
      </Animated.View>
    </View>
  )
}

const st = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },
  inner: { flex: 1 },
})
