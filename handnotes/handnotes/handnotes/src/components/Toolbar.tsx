import React from 'react'
import { View, TouchableOpacity, ScrollView } from 'react-native'
import { Tool } from '../types'
import {
  PenIcon, EraserIcon, UndoIcon, TrashIcon, ImageIcon, AddPageIcon,
} from './icons'
import { COLORS, WIDTHS, s } from './Toolbar.styles'

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

const ACTIVE = '#ffffff'
const INACTIVE = '#9a9ac0'

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
          <PenIcon color={tool === 'pen' ? ACTIVE : INACTIVE} />
        </Btn>
        <Btn active={tool === 'eraser'} onPress={() => onTool('eraser')}>
          <EraserIcon color={tool === 'eraser' ? ACTIVE : INACTIVE} />
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
        <Btn onPress={onUndo}><UndoIcon color={INACTIVE} /></Btn>
        <Btn onPress={onClear}><TrashIcon color={INACTIVE} /></Btn>
        <Btn onPress={onImage}><ImageIcon color={INACTIVE} /></Btn>
        <Btn onPress={onAddPage}><AddPageIcon color={INACTIVE} /></Btn>
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
