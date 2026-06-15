import React, { useState } from 'react'
import {
  SafeAreaView, View, Text, TextInput, TouchableOpacity,
  FlatList, Alert, Platform, StatusBar,
} from 'react-native'
import { makeNote, makeFolder } from '../storage/storage'
import { useNotes } from '../hooks/useNotes'
import { useFolders } from '../hooks/useFolders'
import { NotebookIcon, EmptyIcon, TrashIcon, FolderIcon, FolderOpenIcon } from '../components/icons'
import { s } from './HomeScreen.styles'

function confirmAsync(msg: string): Promise<boolean> {
  if (Platform.OS === 'web') return Promise.resolve(window.confirm(msg))
  return new Promise(resolve =>
    Alert.alert('確認', msg, [
      { text: 'キャンセル', style: 'cancel', onPress: () => resolve(false) },
      { text: 'OK', style: 'destructive', onPress: () => resolve(true) },
    ])
  )
}

const ALL_ID = '__all__'
const UNCATEGORIZED_ID = '__none__'

export function HomeScreen({ navigation }: { navigation: any }) {
  const { notes, setNotes } = useNotes()
  const { folders, setFolders } = useFolders()
  const [selectedFolder, setSelectedFolder] = useState<string>(ALL_ID)
  const [noteInput, setNoteInput] = useState('')
  const [folderInput, setFolderInput] = useState('')
  const [showFolderInput, setShowFolderInput] = useState(false)

  // 表示するノートを絞り込む
  const visibleNotes = (() => {
    if (selectedFolder === ALL_ID) return notes
    if (selectedFolder === UNCATEGORIZED_ID) return notes.filter(n => !n.folderId)
    return notes.filter(n => n.folderId === selectedFolder)
  })()

  function onCreate() {
    const title = noteInput.trim() || `ノート ${new Date().toLocaleDateString('ja-JP')}`
    const folderId = selectedFolder === ALL_ID || selectedFolder === UNCATEGORIZED_ID
      ? undefined
      : selectedFolder
    const note = makeNote(title, folderId)
    setNotes([note, ...notes], true)
    setNoteInput('')
    navigation.navigate('Editor', { noteId: note.id })
  }

  function onCreateFolder() {
    const name = folderInput.trim()
    if (!name) return
    setFolders([...folders, makeFolder(name)], true)
    setFolderInput('')
    setShowFolderInput(false)
  }

  async function onDeleteFolder(id: string) {
    const ok = await confirmAsync('フォルダーを削除しますか？\n（中のノートは未分類に移動します）')
    if (!ok) return
    setFolders(folders.filter(f => f.id !== id), true)
    setNotes(notes.map(n => n.folderId === id ? { ...n, folderId: undefined } : n), true)
    if (selectedFolder === id) setSelectedFolder(ALL_ID)
  }

  async function onDeleteNote(id: string) {
    const ok = await confirmAsync('このノートを削除しますか？')
    if (!ok) return
    setNotes(notes.filter(n => n.id !== id), true)
  }

  function fmtDate(ts: number) {
    return new Date(ts).toLocaleDateString('ja-JP', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  }

  const uncategorizedCount = notes.filter(n => !n.folderId).length

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0d0d1a" />

      {/* ヘッダー */}
      <View style={s.hdr}>
        <View style={s.logoRow}>
          <NotebookIcon size={22} color="#6c63ff" />
          <Text style={s.logo}>HandNotes</Text>
        </View>
        <Text style={s.cnt}>{notes.length}件</Text>
      </View>

      <View style={s.body}>
        {/* サイドバー */}
        <View style={s.sidebar}>
          {/* すべて */}
          <TouchableOpacity
            style={[s.sideItem, selectedFolder === ALL_ID ? s.sideItemOn : null]}
            onPress={() => setSelectedFolder(ALL_ID)}
          >
            <NotebookIcon size={18} color={selectedFolder === ALL_ID ? '#6c63ff' : '#666'} />
            <Text style={[s.sideLabel, selectedFolder === ALL_ID ? s.sideLabelOn : null]}>すべて</Text>
            <Text style={s.sideCnt}>{notes.length}</Text>
          </TouchableOpacity>

          {/* 未分類 */}
          <TouchableOpacity
            style={[s.sideItem, selectedFolder === UNCATEGORIZED_ID ? s.sideItemOn : null]}
            onPress={() => setSelectedFolder(UNCATEGORIZED_ID)}
          >
            <FolderIcon size={18} color={selectedFolder === UNCATEGORIZED_ID ? '#6c63ff' : '#666'} />
            <Text style={[s.sideLabel, selectedFolder === UNCATEGORIZED_ID ? s.sideLabelOn : null]}>未分類</Text>
            <Text style={s.sideCnt}>{uncategorizedCount}</Text>
          </TouchableOpacity>

          {/* フォルダー一覧 */}
          {folders.map(f => {
            const cnt = notes.filter(n => n.folderId === f.id).length
            const isOn = selectedFolder === f.id
            return (
              <TouchableOpacity
                key={f.id}
                style={[s.sideItem, isOn ? s.sideItemOn : null]}
                onPress={() => setSelectedFolder(f.id)}
                onLongPress={() => onDeleteFolder(f.id)}
              >
                {isOn
                  ? <FolderOpenIcon size={18} color="#6c63ff" />
                  : <FolderIcon size={18} color="#666" />
                }
                <Text style={[s.sideLabel, isOn ? s.sideLabelOn : null]} numberOfLines={1}>{f.name}</Text>
                <Text style={s.sideCnt}>{cnt}</Text>
              </TouchableOpacity>
            )
          })}

          {/* フォルダー追加 */}
          {showFolderInput ? (
            <View style={{ paddingHorizontal: 8, paddingTop: 8, gap: 6 }}>
              <TextInput
                style={[s.inp, { fontSize: 13, paddingVertical: 7 }]}
                placeholder="フォルダー名"
                placeholderTextColor="#555"
                value={folderInput}
                onChangeText={setFolderInput}
                onSubmitEditing={onCreateFolder}
                autoFocus
                returnKeyType="done"
              />
              <TouchableOpacity style={s.addBtn} onPress={onCreateFolder}>
                <Text style={[s.addTxt, { fontSize: 13, textAlign: 'center' }]}>作成</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setShowFolderInput(false); setFolderInput('') }}>
                <Text style={{ color: '#555', fontSize: 12, textAlign: 'center', paddingBottom: 4 }}>キャンセル</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={s.sideAddBtn} onPress={() => setShowFolderInput(true)}>
              <Text style={{ color: '#6c63ff', fontSize: 18, lineHeight: 20 }}>＋</Text>
              <Text style={s.sideAddTxt}>フォルダー</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* メインエリア */}
        <View style={s.main}>
          {/* ノート作成バー */}
          <View style={s.newRow}>
            <TextInput
              style={s.inp}
              placeholder="新しいノートのタイトル…"
              placeholderTextColor="#555"
              value={noteInput}
              onChangeText={setNoteInput}
              onSubmitEditing={onCreate}
              returnKeyType="done"
            />
            <TouchableOpacity style={s.addBtn} onPress={onCreate}>
              <Text style={s.addTxt}>＋ 新規</Text>
            </TouchableOpacity>
          </View>

          {/* ノート一覧 */}
          {visibleNotes.length === 0 ? (
            <View style={s.empty}>
              <View style={s.emptyIco}>
                <EmptyIcon size={56} color="#555" />
              </View>
              <Text style={s.emptyMsg}>
                {selectedFolder === ALL_ID
                  ? 'ノートがまだありません\n上から作成できます'
                  : 'このフォルダーにノートがありません'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={visibleNotes}
              keyExtractor={n => n.id}
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
                      {item.folderId && folders.find(f => f.id === item.folderId)
                        ? `　📁 ${folders.find(f => f.id === item.folderId)!.name}`
                        : ''}
                    </Text>
                  </View>
                  <TouchableOpacity style={s.del} onPress={() => onDeleteNote(item.id)}>
                    <TrashIcon size={18} color="#777" />
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  )
}
