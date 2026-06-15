import React, { useState, useCallback } from 'react'
import {
  SafeAreaView, View, Text, TextInput, TouchableOpacity,
  FlatList, Alert, StatusBar,
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { loadNotes, saveNotes, makeNote } from '../storage/storage'
import { Note } from '../types'
import { NotebookIcon, EmptyIcon, TrashIcon } from '../components/icons'
import { s } from './HomeScreen.styles'

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
        <View style={s.logoRow}>
          <NotebookIcon size={22} color="#6c63ff" />
          <Text style={s.logo}>HandNotes</Text>
        </View>
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
          <View style={s.emptyIco}>
            <EmptyIcon size={56} color="#555" />
          </View>
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
                <TrashIcon size={18} color="#777" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  )
}
