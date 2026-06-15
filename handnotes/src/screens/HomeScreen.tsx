import React, { useState, useCallback } from 'react'
import {
  SafeAreaView, View, Text, TextInput, TouchableOpacity,
  FlatList, Alert, StyleSheet, StatusBar,
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { loadNotes, saveNotes, makeNote } from '../storage/storage'
import { Note } from '../types'
 
export function HomeScreen({ navigation }: { navigation: any }) {
  const [notes, setNotes] = useState<Note[]>([])
  const [input, setInput] = useState('')
 
  useFocusEffect(
    useCallback(() => {
      loadNotes().then(setNotes)
    }, [])
  )
 
  async function onCreate() {
    const title = input.trim() || `ノート ${new Date().toLocaleDateString('ja-JP')}`
    const note = makeNote(title)
    const next = [note, ...notes]
    await saveNotes(next)
    setNotes(next)
    setInput('')
    navigation.navigate('Editor', { noteId: note.id })
  }
 
  function onDelete(id: string) {
    Alert.alert('削除', 'このノートを削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: async () => {
          const next = notes.filter((n) => n.id !== id)
          await saveNotes(next)
          setNotes(next)
        },
      },
    ])
  }
 
  function fmtDate(ts: number) {
    return new Date(ts).toLocaleDateString('ja-JP', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  }
 
  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0d0d1a" />
      <View style={s.hdr}>
        <Text style={s.logo}>📓 HandNotes</Text>
        <Text style={s.cnt}>{notes.length}件</Text>
      </View>
      <View style={s.newRow}>
        <TextInput
          style={s.inp}
          placeholder="新しいノートのタイトル…"
          placeholderTextColor="#555"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={onCreate}
          returnKeyType="done"
        />
        <TouchableOpacity style={s.addBtn} onPress={onCreate}>
          <Text style={s.addTxt}>＋ 新規</Text>
        </TouchableOpacity>
      </View>
      {notes.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyIco}>✍️</Text>
          <Text style={s.emptyMsg}>{'ノートがまだありません\n上から作成できます'}</Text>
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(n) => n.id}
          contentContainerStyle={s.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={s.card}
              onPress={() => navigation.navigate('Editor', { noteId: item.id })}
              activeOpacity={0.7}
            >
              <View style={s.cardBody}>
                <Text style={s.cardTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={s.cardMeta}>
                  {fmtDate(item.updatedAt)}　{item.pages.length}ページ
                </Text>
              </View>
              <TouchableOpacity style={s.del} onPress={() => onDelete(item.id)}>
                <Text style={s.delIco}>🗑️</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  )
}
 
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0d0d1a' },
  hdr: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  logo: { color: '#fff', fontSize: 24, fontWeight: '800', flex: 1 },
  cnt: { color: '#555', fontSize: 13 },
  newRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  inp: {
    flex: 1,
    backgroundColor: '#1e1e2e',
    color: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#333',
    marginRight: 8,
  },
  addBtn: {
    backgroundColor: '#6c63ff',
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  addTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
  list: { paddingVertical: 8, paddingHorizontal: 12 },
  card: {
    backgroundColor: '#1e1e2e',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  cardBody: { flex: 1 },
  cardTitle: { color: '#fff', fontSize: 15, fontWeight: '600' },
  cardMeta: { color: '#555', fontSize: 12, marginTop: 3 },
  del: { padding: 6 },
  delIco: { fontSize: 18 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIco: { fontSize: 52, marginBottom: 12 },
  emptyMsg: { color: '#555', fontSize: 15, textAlign: 'center', lineHeight: 22 },
})
