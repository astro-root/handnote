import React from 'react'
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native'
import { Tool } from '../types'

const COLORS = [
  '#000000', '#434343', '#888888', '#ffffff',
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899',
]
const WIDTHS = [2, 4, 8, 14, 22]

interface Props {
  tool: Tool
  color: string
  width: number
  onTool(t: Tool): void
  onColor(c: string): void
  onWidth(w: number): void
  onUndo(): void
  onClear(): void
  onImage(): void
  onAddPage(): void
}

export function Toolbar({
  tool, color, width,
  onTool, onColor, onWidth,
  onUndo, onClear, onImage, onAddPage,
}: Props) {
  return (
    <View style={s.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.row}
      >
        <Btn active={tool === 'pen'} onPress={() => onTool('pen')}>
          <Text style={s.ico}>✏️</Text>
        </Btn>
        <Btn active={tool === 'eraser'} onPress={() => onTool('eraser')}>
          <Text style={s.ico}>⬜</Text>
        </Btn>
        <Div />
        {WIDTHS.map((w) => (
          <Btn key={w} active={width === w} onPress={() => onWidth(w)}>
            <View style={{
              width: Math.min(w + 6, 24),
              height: Math.min(w + 6, 24),
              borderRadius: 12,
              backgroundColor: '#fff',
            }} />
          </Btn>
        ))}
        <Div />
        {COLORS.map((c) => (
          <TouchableOpacity
            key={c}
            onPress={() => onColor(c)}
            style={[
              s.dot,
              { backgroundColor: c },
              color === c ? s.dotSel : null,
              c === '#ffffff' ? s.dotBorder : null,
            ]}
          />
        ))}
        <Div />
        <Btn onPress={onUndo}><Text style={s.ico}>↩️</Text></Btn>
        <Btn onPress={onClear}><Text style={s.ico}>🗑️</Text></Btn>
        <Btn onPress={onImage}><Text style={s.ico}>🖼️</Text></Btn>
        <Btn onPress={onAddPage}><Text style={s.ico}>📄＋</Text></Btn>
      </ScrollView>
    </View>
  )
}

function Btn({
  active, onPress, children,
}: {
  active?: boolean
  onPress(): void
  children: React.ReactNode
}) {
  return (
    <TouchableOpacity style={[s.btn, active ? s.btnOn : null]} onPress={onPress}>
      {children}
    </TouchableOpacity>
  )
}

function Div() { return <View style={s.div} /> }

const s = StyleSheet.create({
  wrap: {
    backgroundColor: '#1a1a2e',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4 },
  btn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  btnOn: { backgroundColor: '#4c4f8a' },
  ico: { fontSize: 18 },
  div: { width: 1, height: 28, backgroundColor: '#444', marginHorizontal: 4 },
  dot: { width: 26, height: 26, borderRadius: 13, marginHorizontal: 3 },
  dotSel: { borderWidth: 3, borderColor: '#fff' },
  dotBorder: { borderWidth: 1, borderColor: '#555' },
})
