import React, { useState, useCallback } from 'react'
import { SafeAreaView, View, Text, Alert, Platform, StatusBar, StyleSheet } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import * as ImagePicker from 'expo-image-picker'
import { makePage, genId } from '../storage/storage'
import { useNotes }         from '../hooks/useNotes'
import { PageSwiper }       from '../components/PageSwiper'
import { Toolbar }          from '../components/Toolbar'
import { PageTabs }         from '../components/PageTabs'
import { EditorHeader }     from '../components/EditorHeader'
import { PaperSizePicker }  from '../components/PaperSizePicker'
import { BackgroundPicker } from '../components/BackgroundPicker'
import { ExportMenu }       from '../components/ExportMenu'
import {
  Note, Tool, Stroke, NoteImage, TextBlock,
  PageBackground, PaperSize, Orientation, PAPER_SIZES,
} from '../types'

function confirmAsync(msg: string): Promise<boolean> {
  if (Platform.OS === 'web') return Promise.resolve(window.confirm(msg))
  return new Promise(r =>
    Alert.alert('確認', msg, [
      { text: 'キャンセル', style: 'cancel', onPress: () => r(false) },
      { text: 'OK', style: 'destructive', onPress: () => r(true) },
    ])
  )
}

export function EditorScreen({ route, navigation }: { route: any; navigation: any }) {
  const { noteId } = route.params as { noteId: string }
  const { notes, setNotes, flush } = useNotes()
  const note = notes.find(n => n.id === noteId) ?? null

  const [pageIdx,         setPageIdx]         = useState(0)
  const [tool,            setTool]            = useState<Tool>('pen')
  const [color,           setColor]           = useState('#000000')
  const [penW,            setPenW]            = useState(4)
  const [editTitle,       setEditTitle]       = useState(false)
  const [showPaperPicker, setShowPaperPicker] = useState(false)
  const [showBgPicker,    setShowBgPicker]    = useState(false)
  const [showExportMenu,  setShowExportMenu]  = useState(false)

  useFocusEffect(useCallback(() => () => flush(), [flush]))

  function patch(fn: (n: Note) => Note) {
    if (!note) return
    const next = { ...fn(note), updatedAt: Date.now() }
    setNotes(notes.map(n => n.id === next.id ? next : n))
  }

  const paperSize:  PaperSize      = note?.paperSize  ?? 'free'
  const orientation: Orientation   = note?.orientation ?? 'portrait'
  const background: PageBackground = note?.background  ?? 'blank'
  const sizeLabel   = PAPER_SIZES[paperSize].label
  const orientLabel = orientation === 'landscape' ? '横' : '縦'

  function onStroke(stroke: Stroke) {
    patch(n => {
      const pages = [...n.pages]
      pages[pageIdx] = { ...pages[pageIdx], strokes: [...pages[pageIdx].strokes, stroke] }
      return { ...n, pages }
    })
  }

  function onRemoveStrokes(ids: string[]) {
    patch(n => {
      const pages = [...n.pages]; const idSet = new Set(ids)
      pages[pageIdx] = { ...pages[pageIdx], strokes: pages[pageIdx].strokes.filter(s => !idSet.has(s.id)) }
      return { ...n, pages }
    })
  }

  function onRemoveImages(ids: string[]) {
    patch(n => {
      const pages = [...n.pages]; const idSet = new Set(ids)
      pages[pageIdx] = { ...pages[pageIdx], images: pages[pageIdx].images.filter(img => !idSet.has(img.id)) }
      return { ...n, pages }
    })
  }

  function onMoveItems(strokeIds: string[], imageIds: string[], dx: number, dy: number) {
    patch(n => {
      const pages = [...n.pages]
      const sIdSet = new Set(strokeIds), iIdSet = new Set(imageIds)
      const page = pages[pageIdx]
      pages[pageIdx] = {
        ...page,
        strokes: page.strokes.map(s => sIdSet.has(s.id) ? { ...s, points: s.points.map(p => ({ x: p.x + dx, y: p.y + dy })) } : s),
        images:  page.images.map(img => iIdSet.has(img.id) ? { ...img, x: img.x + dx, y: img.y + dy } : img),
      }
      return { ...n, pages }
    })
  }

  function onAddText(tb: TextBlock) {
    patch(n => {
      const pages = [...n.pages]
      pages[pageIdx] = { ...pages[pageIdx], texts: [...(pages[pageIdx].texts ?? []), tb] }
      return { ...n, pages }
    })
  }

  function onUpdateText(id: string, text: string) {
    patch(n => {
      const pages = [...n.pages]
      pages[pageIdx] = {
        ...pages[pageIdx],
        texts: (pages[pageIdx].texts ?? []).map(tb => tb.id === id ? { ...tb, text } : tb),
      }
      return { ...n, pages }
    })
  }

  function onRemoveTexts(ids: string[]) {
    patch(n => {
      const pages = [...n.pages]; const idSet = new Set(ids)
      pages[pageIdx] = { ...pages[pageIdx], texts: (pages[pageIdx].texts ?? []).filter(tb => !idSet.has(tb.id)) }
      return { ...n, pages }
    })
  }

  function onUndo() {
    patch(n => {
      const pages = [...n.pages]
      pages[pageIdx] = { ...pages[pageIdx], strokes: pages[pageIdx].strokes.slice(0, -1) }
      return { ...n, pages }
    })
  }

  async function onClear() {
    if (!await confirmAsync('このページの内容を削除しますか？')) return
    patch(n => {
      const pages = [...n.pages]
      pages[pageIdx] = { ...pages[pageIdx], strokes: [], images: [], texts: [] }
      return { ...n, pages }
    })
  }

  function onAddPage() {
    if (!note) return
    patch(n => ({ ...n, pages: [...n.pages, makePage()] }))
    setPageIdx(note.pages.length)
  }

  async function onDeletePage() {
    if (!note || note.pages.length <= 1) return
    if (!await confirmAsync('このページを削除しますか？')) return
    const pages = note.pages.filter((_, i) => i !== pageIdx)
    const next  = Math.min(pageIdx, pages.length - 1)
    patch(n => ({ ...n, pages }))
    setPageIdx(next)
  }

  function onOrientation() {
    patch(n => ({ ...n, orientation: (n.orientation ?? 'portrait') === 'portrait' ? 'landscape' : 'portrait' }))
  }

  async function onImage() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) { Alert.alert('権限が必要', 'フォトライブラリへのアクセスを許可してください'); return }
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 })
    if (!res.canceled && res.assets?.[0]) {
      const a = res.assets[0], w = 200
      const img: NoteImage = { id: genId(), uri: a.uri, x: 10, y: 10, width: w, height: w * (a.height && a.width ? a.height / a.width : 1) }
      patch(n => {
        const pages = [...n.pages]
        pages[pageIdx] = { ...pages[pageIdx], images: [...pages[pageIdx].images, img] }
        return { ...n, pages }
      })
    }
  }

  if (!note) {
    return <View style={st.center}><Text style={st.ldTxt}>読み込み中…</Text></View>
  }

  return (
    <SafeAreaView style={st.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0d0d1a" />
      <EditorHeader
        title={note.title}
        pageLabel={`${sizeLabel}${paperSize !== 'free' ? ` ${orientLabel}` : ''} · ${pageIdx + 1} / ${note.pages.length}`}
        editing={editTitle}
        onBack={() => navigation.goBack()}
        onTitleChange={t => patch(n => ({ ...n, title: t }))}
        onStartEdit={() => setEditTitle(true)}
        onEndEdit={() => setEditTitle(false)}
      />
      <PageTabs
        count={note.pages.length} current={pageIdx}
        onSelect={setPageIdx} onDelete={onDeletePage}
        onPrev={() => setPageIdx(i => Math.max(0, i - 1))}
        onNext={() => setPageIdx(i => Math.min(note.pages.length - 1, i + 1))}
      />
      <PageSwiper
        pages={note.pages} pageIdx={pageIdx}
        tool={tool} color={color} strokeWidth={penW}
        background={background} paperSize={paperSize} orientation={orientation}
        onAdd={onStroke} onRemove={onRemoveStrokes}
        onRemoveImages={onRemoveImages} onMoveItems={onMoveItems}
        onAddText={onAddText} onUpdateText={onUpdateText} onRemoveTexts={onRemoveTexts}
        onPageChange={setPageIdx}
      />
      <Toolbar
        tool={tool} color={color} width={penW}
        background={background} orientation={orientation}
        onTool={setTool} onColor={setColor} onWidth={setPenW}
        onUndo={onUndo} onClear={onClear} onImage={onImage} onAddPage={onAddPage}
        onBackground={() => setShowBgPicker(true)}
        onPaperSize={() => setShowPaperPicker(true)}
        onOrientation={onOrientation}
        onExport={() => setShowExportMenu(true)}
      />
      <PaperSizePicker
        visible={showPaperPicker} current={paperSize}
        onSelect={size => patch(n => ({ ...n, paperSize: size }))}
        onClose={() => setShowPaperPicker(false)}
      />
      <BackgroundPicker
        visible={showBgPicker} current={background}
        onSelect={bg => patch(n => ({ ...n, background: bg }))}
        onClose={() => setShowBgPicker(false)}
      />
      <ExportMenu
        visible={showExportMenu} note={note} pageIdx={pageIdx}
        onClose={() => setShowExportMenu(false)}
      />
    </SafeAreaView>
  )
}

const st = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#0d0d1a' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0d0d1a' },
  ldTxt:  { color: '#fff', fontSize: 16 },
})
