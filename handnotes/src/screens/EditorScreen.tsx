import React, { useEffect, useState, useRef, useCallback } from 'react'
import {
  SafeAreaView, View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, StatusBar, ScrollView,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { loadNotes, saveNotes, makePage, genId } from '../storage/storage'
import { Canvas } from '../components/Canvas'
import { Toolbar } from '../components/Toolbar'
import { Note, Tool, Stroke, NoteImage } from '../types'
 
export function EditorScreen({ route, navigation }: { route: any; navigation: any }) {
  const { noteId } = route.params as { noteId: string }
  const [note, setNote] = useState<Note | null>(null)
  const [allNotes, setAllNotes] = useState<Note[]>([])
  const [pageIdx, setPageIdx] = useState(0)
  const [tool, setTool] = useState<Tool>('pen')
  const [color, setColor] = useState('#000000')
  const [penW, setPenW] = useState(4)
  const [editTitle, setEditTitle] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
 
  useEffect(() => {
    loadNotes().then((ns) => {
      setAllNotes(ns)
      setNote(ns.find((n) => n.id === noteId) ?? null)
    })
  }, [noteId])
 
  const persist = useCallback((notes: Note[]) => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => saveNotes(notes), 600)
  }, [])
 
  function patch(fn: (n: Note) => Note) {
    setNote((prev) => {
      if (!prev) return prev
      const next = { ...fn(prev), updatedAt: Date.now() }
      setAllNotes((all) => {
        const updated = all.map((n) => (n.id === next.id ? next : n))
        persist(updated)
        return updated
      })
      return next
    })
  }
 
  const page = note?.pages[pageIdx]
 
  function onStroke(s: Stroke) {
    patch((n) => {
      const pages = [...n.pages]
      pages[pageIdx] = { ...pages[pageIdx], strokes: [...pages[pageIdx].strokes, s] }
      return { ...n, pages }
    })
  }
 
  function onUndo() {
    patch((n) => {
      const pages = [...n.pages]
      pages[pageIdx] = { ...pages[pageIdx], strokes: pages[pageIdx].strokes.slice(0, -1) }
      return { ...n, pages }
    })
  }
 
  function onClear() {
    Alert.alert('クリア', 'このページの内容を削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: 'クリア',
        style: 'destructive',
        onPress: () =>
          patch((n) => {
            const pages = [...n.pages]
            pages[pageIdx] = { ...pages[pageIdx], strokes: [], images: [] }
            return { ...n, pages }
          }),
      },
    ])
  }
 
  function onAddPage() {
    if (!note) return
    const newPage = makePage()
    const pages = [...note.pages, newPage]
    const next = { ...note, pages, updatedAt: Date.now() }
    const updated = allNotes.map((n) => (n.id === next.id ? next : n))
    setNote(next)
    setAllNotes(updated)
    setPageIdx(pages.length - 1)
    persist(updated)
  }
 
  async function onImage() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) {
      Alert.alert('権限が必要', 'フォトライブラリへのアクセスを許可してください')
      return
    }
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 })
    if (!res.canceled && res.assets?.[0]) {
      const a = res.assets[0]
      const w = 200
      const ratio = a.height && a.width ? a.height / a.width : 1
      const img: NoteImage = { id: genId(), uri: a.uri, x: 10, y: 10, width: w, height: w * ratio }
      patch((n) => {
        const pages = [...n.pages]
        pages[pageIdx] = { ...pages[pageIdx], images: [...pages[pageIdx].images, img] }
        return { ...n, pages }
      })
    }
  }
 
  if (!note || !page) {
    return (
      <View style={s.center}>
        <Text style={s.ldTxt}>読み込み中…</Text>
      </View>
    )
  }
 
  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0d0d1a" />
      <View style={s.hdr}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
          <Text style={s.backTxt}>‹</Text>
        </TouchableOpacity>
        {editTitle ? (
          <TextInput
            autoFocus
            style={s.titleInp}
            value={note.title}
            onChangeText={(t) => patch((n) => ({ ...n, title: t }))}
            onBlur={() => setEditTitle(false)}
          />
        ) : (
          <TouchableOpacity style={s.titleBtn} onPress={() => setEditTitle(true)}>
            <Text style={s.titleTxt} numberOfLines={1}>{note.title}</Text>
          </TouchableOpacity>
        )}
        <Text style={s.pgBadge}>{pageIdx + 1}/{note.pages.length}</Text>
      </View>
      {note.pages.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.tabs}
          contentContainerStyle={s.tabsCont}
        >
          {note.pages.map((_, i) => (
            <TouchableOpacity
              key={i}
              style={[s.tab, i === pageIdx ? s.tabOn : null]}
              onPress={() => setPageIdx(i)}
            >
              <Text style={[s.tabTxt, i === pageIdx ? s.tabTxtOn : null]}>{i + 1}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      <Canvas
        strokes={page.strokes}
        images={page.images}
        tool={tool}
        color={color}
        strokeWidth={penW}
        onAdd={onStroke}
      />
      <Toolbar
        tool={tool}
        color={color}
        width={penW}
        onTool={setTool}
        onColor={setColor}
        onWidth={setPenW}
        onUndo={onUndo}
        onClear={onClear}
        onImage={onImage}
        onAddPage={onAddPage}
      />
    </SafeAreaView>
  )
}
 
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0d0d1a' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0d0d1a' },
  ldTxt: { color: '#fff', fontSize: 16 },
  hdr: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  back: { marginRight: 8, paddingHorizontal: 4 },
  backTxt: { color: '#6c63ff', fontSize: 22, fontWeight: '600' },
  titleBtn: { flex: 1 },
  titleInp: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: '#2a2a3e',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  titleTxt: { color: '#fff', fontSize: 16, fontWeight: '600' },
  pgBadge: { color: '#555', fontSize: 12, marginLeft: 8 },
  tabs: {
    maxHeight: 40,
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tabsCont: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4 },
  tab: {
    width: 32,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#2a2a3e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  tabOn: { backgroundColor: '#6c63ff' },
  tabTxt: { color: '#777', fontSize: 13, fontWeight: '600' },
  tabTxtOn: { color: '#fff' },
})
