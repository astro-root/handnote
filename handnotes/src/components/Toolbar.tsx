import React from 'react'
import { View, TouchableOpacity, ScrollView } from 'react-native'
import { Tool, PageBackground } from '../types'
import {
  PenIcon, EraserIcon, PixelEraserIcon, UndoIcon, TrashIcon,
  ImageIcon, AddPageIcon, RuledIcon,
} from './icons'
import { COLORS, WIDTHS, s } from './Toolbar.styles'

interface Props {
  tool: Tool
  color: string
  width: number
  background: PageBackground
  onTool(t: Tool): void
  onColor(c: string): void
  onWidth(w: number): void
  onUndo(): void
  onClear(): void
  onImage(): void
  onAddPage(): void
  onBackground(): void
}

const ON = '#ffffff'
const OFF = '#9a9ac0'

export function Toolbar({
  tool, color, width, background,
  onTool, onColor, onWidth,
  onUndo, onClear, onImage, onAddPage, onBackground,
}: Props) {
  return (
    <View style={s.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row}>

        {/* ペン */}
        <Btn active={tool === 'pen'} onPress={() => onTool('pen')}>
          <PenIcon color={tool === 'pen' ? ON : OFF} />
        </Btn>

        {/* オブジェクト消しゴム */}
        <Btn active={tool === 'eraser'} onPress={() => onTool('eraser')}>
          <EraserIcon color={tool === 'eraser' ? ON : OFF} />
        </Btn>

        {/* ピクセル消しゴム */}
        <Btn active={tool === 'eraser-pixel'} onPress={() => onTool('eraser-pixel')}>
          <PixelEraserIcon color={tool === 'eraser-pixel' ? ON : OFF} />
        </Btn>

        <Div />

        {/* 太さ */}
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

        {/* カラー */}
        {COLORS.map((c) => (
          <TouchableOpacity
            key={c}
            onPress={() => onColor(c)}
            style={[s.dot, { backgroundColor: c }, color === c ? s.dotSel : null, c === '#ffffff' ? s.dotBorder : null]}
          />
        ))}

        <Div />

        <Btn onPress={onUndo}><UndoIcon color={OFF} /></Btn>
        <Btn onPress={onClear}><TrashIcon color={OFF} /></Btn>
        <Btn onPress={onImage}><ImageIcon color={OFF} /></Btn>
        <Btn onPress={onAddPage}><AddPageIcon color={OFF} /></Btn>

        <Div />

        <Btn active={background !== 'blank'} onPress={onBackground}>
          <RuledIcon color={background !== 'blank' ? ON : OFF} />
        </Btn>

      </ScrollView>
    </View>
  )
}

function Btn({ active, onPress, children }: { active?: boolean; onPress(): void; children: React.ReactNode }) {
  return (
    <TouchableOpacity style={[s.btn, active ? s.btnOn : null]} onPress={onPress}>
      {children}
    </TouchableOpacity>
  )
}

function Div() { return <View style={s.div} /> }
