import React from 'react'
import { View, Modal, TouchableOpacity, Text, StyleSheet } from 'react-native'
import { PaperSize, PAPER_SIZES } from '../types'

interface Props {
  visible: boolean
  current: PaperSize
  onSelect(size: PaperSize): void
  onClose(): void
}

const ORDER: PaperSize[] = ['free', 'a3', 'a4', 'a5', 'b5', 'letter']

export function PaperSizePicker({ visible, current, onSelect, onClose }: Props) {
  return (
    <Modal transparent visible={visible} onRequestClose={onClose} animationType="slide">
      <TouchableOpacity style={st.overlay} onPress={onClose} activeOpacity={1} />
      <View style={st.sheet}>
        <View style={st.handle} />
        <Text style={st.title}>紙のサイズ</Text>
        {ORDER.map(size => {
          const info = PAPER_SIZES[size]
          const on   = current === size
          const pw   = 26
          const ph   = size === 'free' ? pw : Math.round(pw * info.ratio)
          return (
            <TouchableOpacity
              key={size}
              style={[st.row, on && st.rowOn]}
              onPress={() => { onSelect(size); onClose() }}
              activeOpacity={0.75}
            >
              <View style={st.previewBox}>
                <View style={{
                  width: pw, height: ph,
                  backgroundColor: '#fff',
                  borderWidth: 1.5,
                  borderColor: on ? '#6c63ff' : '#555',
                  borderRadius: 2,
                }} />
              </View>
              <View style={st.info}>
                <Text style={[st.label, on && st.labelOn]}>{info.label}</Text>
                <Text style={st.desc}>{info.desc}</Text>
              </View>
              {on && <Text style={st.check}>✓</Text>}
            </TouchableOpacity>
          )
        })}
      </View>
    </Modal>
  )
}

const st = StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet:      { backgroundColor: '#1a1a2e', borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingHorizontal: 20, paddingBottom: 48, paddingTop: 12 },
  handle:     { width: 40, height: 4, borderRadius: 2, backgroundColor: '#444', alignSelf: 'center', marginBottom: 16 },
  title:      { color: '#fff', fontSize: 17, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  row:        { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, borderRadius: 12, marginBottom: 4, gap: 16 },
  rowOn:      { backgroundColor: '#252545' },
  previewBox: { width: 44, alignItems: 'center', justifyContent: 'center', minHeight: 44 },
  info:       { flex: 1 },
  label:      { color: '#ccc', fontSize: 15, fontWeight: '500' },
  labelOn:    { color: '#fff', fontWeight: '700' },
  desc:       { color: '#666', fontSize: 12, marginTop: 2 },
  check:      { color: '#6c63ff', fontSize: 20, fontWeight: '700' },
})
