import React from 'react'
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native'

interface Props {
  zoom: number
  onIn(): void
  onOut(): void
  onReset(): void
}

export function ZoomControls({ zoom, onIn, onOut, onReset }: Props) {
  const MIN = 0.5, MAX = 4
  return (
    <View style={st.wrap}>
      <TouchableOpacity onPress={onOut} disabled={zoom <= MIN} style={st.btn}>
        <Text style={[st.icon, zoom <= MIN && st.dim]}>－</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onReset} style={st.pctWrap}>
        <Text style={st.pct}>{Math.round(zoom * 100)}%</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onIn} disabled={zoom >= MAX} style={st.btn}>
        <Text style={[st.icon, zoom >= MAX && st.dim]}>＋</Text>
      </TouchableOpacity>
    </View>
  )
}

const st = StyleSheet.create({
  wrap: {
    position: 'absolute', bottom: 14, right: 14,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(10,10,25,0.72)',
    borderRadius: 20, paddingHorizontal: 4, paddingVertical: 2,
    gap: 0,
  },
  btn: { width: 34, height: 34, justifyContent: 'center', alignItems: 'center' },
  icon: { color: '#fff', fontSize: 20, fontWeight: '700', lineHeight: 24 },
  dim: { color: '#555' },
  pctWrap: { paddingHorizontal: 6 },
  pct: { color: '#aac', fontSize: 11, fontWeight: '600', minWidth: 36, textAlign: 'center' },
})
