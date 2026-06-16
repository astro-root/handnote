import React, { useState } from 'react'
import { View, Modal, TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert, Platform } from 'react-native'
import { Note } from '../types'
import { exportNoteToPdf, exportPageToPng } from '../utils/exportPdf'

interface Props {
  visible: boolean
  note: Note
  pageIdx: number
  onClose(): void
}

export function ExportMenu({ visible, note, pageIdx, onClose }: Props) {
  const [busy, setBusy] = useState<'pdf' | 'png' | null>(null)

  async function handlePdf() {
    setBusy('pdf')
    try {
      await exportNoteToPdf(note)
      onClose()
    } catch (e: any) {
      Alert.alert('エクスポート失敗', e?.message ?? '不明なエラーが発生しました')
    } finally {
      setBusy(null)
    }
  }

  async function handlePng() {
    setBusy('png')
    try {
      await exportPageToPng(note, pageIdx)
      onClose()
    } catch (e: any) {
      Alert.alert('エクスポート失敗', e?.message ?? '不明なエラーが発生しました')
    } finally {
      setBusy(null)
    }
  }

  return (
    <Modal transparent visible={visible} onRequestClose={onClose} animationType="slide">
      <TouchableOpacity style={st.overlay} onPress={onClose} activeOpacity={1} />
      <View style={st.sheet}>
        <View style={st.handle} />
        <Text style={st.title}>書き出し</Text>

        <TouchableOpacity style={st.row} onPress={handlePdf} disabled={busy !== null}>
          <View style={st.rowText}>
            <Text style={st.label}>PDFでエクスポート（全{note.pages.length}ページ）</Text>
            <Text style={st.desc}>すべてのページを1つのPDFファイルに書き出します</Text>
          </View>
          {busy === 'pdf' ? <ActivityIndicator color="#6c63ff" /> : <Text style={st.chev}>›</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={st.row} onPress={handlePng} disabled={busy !== null}>
          <View style={st.rowText}>
            <Text style={st.label}>このページをPNGで保存</Text>
            <Text style={st.desc}>現在表示中のページのみ画像として書き出します</Text>
          </View>
          {busy === 'png' ? <ActivityIndicator color="#6c63ff" /> : <Text style={st.chev}>›</Text>}
        </TouchableOpacity>

        {Platform.OS !== 'web' && (
          <Text style={st.note}>※ モバイル版のエクスポートは今後対応予定です</Text>
        )}
      </View>
    </Modal>
  )
}

const st = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    backgroundColor: '#1a1a2e', borderTopLeftRadius: 22, borderTopRightRadius: 22,
    paddingHorizontal: 20, paddingBottom: 48, paddingTop: 12,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#444', alignSelf: 'center', marginBottom: 16 },
  title: { color: '#fff', fontSize: 17, fontWeight: '700', textAlign: 'center', marginBottom: 14 },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12, marginBottom: 6,
    backgroundColor: '#222240',
  },
  rowText: { flex: 1, paddingRight: 10 },
  label: { color: '#fff', fontSize: 15, fontWeight: '600' },
  desc: { color: '#888', fontSize: 12, marginTop: 3 },
  chev: { color: '#666', fontSize: 22 },
  note: { color: '#777', fontSize: 12, textAlign: 'center', marginTop: 10 },
})
