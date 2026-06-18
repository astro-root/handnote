import React from 'react'
import { View, TouchableOpacity, ScrollView } from 'react-native'
import { Tool, PageBackground, Orientation } from '../types'
import {
  PenIcon, EraserIcon, PixelEraserIcon, HandIcon,
  UndoIcon, TrashIcon, ImageIcon, AddPageIcon,
  RuledIcon, PageSizeIcon, OrientationIcon, ExportIcon, SelectIcon,
} from './icons'
import { COLORS, WIDTHS, s } from './Toolbar.styles'

interface Props {
  tool: Tool
  color: string
  width: number
  background: PageBackground
  orientation: Orientation
  onTool(t: Tool): void
  onColor(c: string): void
  onWidth(w: number): void
  onUndo(): void
  onClear(): void
  onImage(): void
  onAddPage(): void
  onBackground(): void
  onPaperSize(): void
  onOrientation(): void
  onExport(): void
}

const ON = '#ffffff', OFF = '#9a9ac0'

export function Toolbar({
  tool, color, width, background, orientation,
  onTool, onColor, onWidth,
  onUndo, onClear, onImage, onAddPage,
  onBackground, onPaperSize, onOrientation, onExport,
}: Props) {
  return (
    <View style={s.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row}>

        <Btn active={tool === 'pen'}          onPress={() => onTool('pen')}>
          <PenIcon          color={tool === 'pen'          ? ON : OFF} />
        </Btn>
        <Btn active={tool === 'eraser'}       onPress={() => onTool('eraser')}>
          <EraserIcon       color={tool === 'eraser'       ? ON : OFF} />
        </Btn>
        <Btn active={tool === 'eraser-pixel'} onPress={() => onTool('eraser-pixel')}>
          <PixelEraserIcon  color={tool === 'eraser-pixel' ? ON : OFF} />
        </Btn>
        <Btn active={tool === 'select'}       onPress={() => onTool('select')}>
          <SelectIcon       color={tool === 'select'       ? ON : OFF} />
        </Btn>
        <Btn active={tool === 'scroll'}       onPress={() => onTool('scroll')}>
          <HandIcon         color={tool === 'scroll'       ? ON : OFF} />
        </Btn>

        <Div />

        {WIDTHS.map(w => (
          <Btn key={w} active={width === w} onPress={() => onWidth(w)}>
            <View style={{
              width: Math.min(w + 6, 24), height: Math.min(w + 6, 24),
              borderRadius: 12, backgroundColor: '#fff',
            }} />
          </Btn>
        ))}

        <Div />

        {COLORS.map(c => (
          <TouchableOpacity
            key={c}
            onPress={() => onColor(c)}
            style={[s.dot, { backgroundColor: c },
              color === c ? s.dotSel : null,
              c === '#ffffff' ? s.dotBorder : null,
            ]}
          />
        ))}

        <Div />

        <Btn onPress={onUndo}><UndoIcon    color={OFF} /></Btn>
        <Btn onPress={onClear}><TrashIcon  color={OFF} /></Btn>
        <Btn onPress={onImage}><ImageIcon  color={OFF} /></Btn>
        <Btn onPress={onAddPage}><AddPageIcon color={OFF} /></Btn>

        <Div />

        <Btn active={background !== 'blank'} onPress={onBackground}>
          <RuledIcon color={background !== 'blank' ? ON : OFF} />
        </Btn>
        <Btn onPress={onPaperSize}>
          <PageSizeIcon color={OFF} />
        </Btn>
        <Btn active={orientation === 'landscape'} onPress={onOrientation}>
          <OrientationIcon color={orientation === 'landscape' ? ON : OFF} />
        </Btn>

        <Div />

        <Btn onPress={onExport}>
          <ExportIcon color={OFF} />
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
