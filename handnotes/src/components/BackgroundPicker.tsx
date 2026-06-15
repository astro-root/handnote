import React from 'react'
import { View, Modal, TouchableOpacity, Text, ScrollView, StyleSheet } from 'react-native'
import Svg, { Line, Circle, Path, Rect } from 'react-native-svg'
import { PageBackground, BACKGROUND_INFO } from '../types'

interface Props {
  visible: boolean
  current: PageBackground
  onSelect(bg: PageBackground): void
  onClose(): void
}

const ALL: PageBackground[] = [
  'blank', 'ruled', 'ruled-narrow', 'ruled-wide',
  'grid', 'grid-small', 'grid-large', 'dotted',
  'cornell', 'music', 'hex', 'isometric',
]

const PW = 56, PH = 42
const GC = '#8899cc', RC = '#8899cc', DC = '#6677aa', AC = '#9988cc'

function BgPreview({ bg }: { bg: PageBackground }) {
  const els: React.ReactNode[] = []
  let k = 0

  if (bg === 'ruled') {
    for (let y = 10; y < PH; y += 10)
      els.push(<Line key={k++} x1={2} y1={y} x2={PW-2} y2={y} stroke={RC} strokeWidth={1} />)
  } else if (bg === 'ruled-narrow') {
    for (let y = 7; y < PH; y += 7)
      els.push(<Line key={k++} x1={2} y1={y} x2={PW-2} y2={y} stroke={RC} strokeWidth={0.7} />)
  } else if (bg === 'ruled-wide') {
    for (let y = 14; y < PH; y += 14)
      els.push(<Line key={k++} x1={2} y1={y} x2={PW-2} y2={y} stroke={RC} strokeWidth={1} />)
  } else if (bg === 'grid') {
    for (let y = 10; y < PH; y += 10) els.push(<Line key={k++} x1={2} y1={y} x2={PW-2} y2={y} stroke={GC} strokeWidth={0.8} />)
    for (let x = 10; x < PW; x += 10) els.push(<Line key={k++} x1={x} y1={2} x2={x}    y2={PH-2} stroke={GC} strokeWidth={0.8} />)
  } else if (bg === 'grid-small') {
    for (let y = 7; y < PH; y += 7) els.push(<Line key={k++} x1={2} y1={y} x2={PW-2} y2={y} stroke={GC} strokeWidth={0.6} />)
    for (let x = 7; x < PW; x += 7) els.push(<Line key={k++} x1={x} y1={2} x2={x}    y2={PH-2} stroke={GC} strokeWidth={0.6} />)
  } else if (bg === 'grid-large') {
    for (let y = 14; y < PH; y += 14) els.push(<Line key={k++} x1={2} y1={y} x2={PW-2} y2={y} stroke={GC} strokeWidth={0.8} />)
    for (let x = 14; x < PW; x += 14) els.push(<Line key={k++} x1={x} y1={2} x2={x}    y2={PH-2} stroke={GC} strokeWidth={0.8} />)
  } else if (bg === 'dotted') {
    for (let y = 10; y < PH; y += 10)
      for (let x = 10; x < PW; x += 10)
        els.push(<Circle key={k++} cx={x} cy={y} r={1.4} fill={DC} />)
  } else if (bg === 'cornell') {
    const mx = Math.round(PW * 0.28)
    els.push(
      <Line key={k++} x1={mx} y1={10} x2={mx} y2={PH-6} stroke={AC} strokeWidth={1.2} />,
      <Line key={k++} x1={2}  y1={10} x2={PW-2} y2={10} stroke={AC} strokeWidth={1.2} />,
      <Line key={k++} x1={2}  y1={PH-6} x2={PW-2} y2={PH-6} stroke={AC} strokeWidth={1.2} />,
    )
    for (let y = 18; y < PH-6; y += 8)
      els.push(<Line key={k++} x1={2} y1={y} x2={PW-2} y2={y} stroke={RC} strokeWidth={0.8} />)
  } else if (bg === 'music') {
    const lg = 4
    els.push(...[0,1,2,3,4].map(i => <Line key={k++} x1={2} y1={8+i*lg} x2={PW-2} y2={8+i*lg} stroke={RC} strokeWidth={0.9} />))
    els.push(...[0,1,2,3,4].map(i => <Line key={k++} x1={2} y1={28+i*lg} x2={PW-2} y2={28+i*lg} stroke={RC} strokeWidth={0.9} />))
  } else if (bg === 'hex') {
    const r = 9
    const cs = r*1.5, rs = r*Math.sqrt(3)
    for (let col = 0; col*cs < PW+r; col++) {
      const cx = col*cs+r, sg = col%2!==0 ? rs/2 : 0
      for (let row = -1; row*rs+sg < PH+r; row++) {
        const cy = row*rs+sg
        const pts = Array.from({length:6},(_,i)=>{
          const a=(Math.PI/3)*i
          return `${(cx+r*Math.cos(a)).toFixed(1)},${(cy+r*Math.sin(a)).toFixed(1)}`
        })
        els.push(<Path key={k++} d={`M ${pts.join(' L ')} Z`} fill="none" stroke={GC} strokeWidth={0.7} />)
      }
    }
  } else if (bg === 'isometric') {
    const S3=Math.sqrt(3), gap=10, ds=gap*2
    for (let y=gap;y<PH;y+=gap) els.push(<Line key={k++} x1={0} y1={y} x2={PW} y2={y} stroke={GC} strokeWidth={0.5} />)
    for (let c=-20;c<PH+S3*PW+ds;c+=ds) {
      els.push(<Line key={k++} x1={0} y1={c} x2={PW} y2={c-S3*PW} stroke={GC} strokeWidth={0.5} />)
      els.push(<Line key={k++} x1={0} y1={c} x2={PW} y2={c+S3*PW} stroke={GC} strokeWidth={0.5} />)
    }
  }

  return (
    <Svg width={PW} height={PH} style={{ borderRadius: 4 }}>
      <Rect x={0} y={0} width={PW} height={PH} fill="#fff" />
      {els}
    </Svg>
  )
}

export function BackgroundPicker({ visible, current, onSelect, onClose }: Props) {
  return (
    <Modal transparent visible={visible} onRequestClose={onClose} animationType="slide">
      <TouchableOpacity style={st.overlay} onPress={onClose} activeOpacity={1} />
      <View style={st.sheet}>
        <View style={st.handle} />
        <Text style={st.title}>背景・罫線の種類</Text>
        <ScrollView contentContainerStyle={st.grid}>
          {ALL.map(bg => {
            const on = current === bg
            return (
              <TouchableOpacity
                key={bg}
                style={[st.cell, on && st.cellOn]}
                onPress={() => { onSelect(bg); onClose() }}
                activeOpacity={0.75}
              >
                <View style={[st.preview, on && st.previewOn]}>
                  <BgPreview bg={bg} />
                </View>
                <Text style={[st.label, on && st.labelOn]}>
                  {BACKGROUND_INFO[bg].label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>
    </Modal>
  )
}

const st = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    backgroundColor: '#1a1a2e', borderTopLeftRadius: 22, borderTopRightRadius: 22,
    paddingHorizontal: 16, paddingBottom: 48, paddingTop: 12, maxHeight: '70%',
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#444', alignSelf: 'center', marginBottom: 14 },
  title:  { color: '#fff', fontSize: 16, fontWeight: '700', textAlign: 'center', marginBottom: 14 },
  grid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', paddingBottom: 8 },
  cell:   { alignItems: 'center', gap: 6, padding: 6, borderRadius: 10 },
  cellOn: { backgroundColor: '#252545' },
  preview:  { borderRadius: 6, overflow: 'hidden', borderWidth: 2, borderColor: '#2a2a40' },
  previewOn:{ borderColor: '#6c63ff' },
  label:    { color: '#888', fontSize: 10, textAlign: 'center' },
  labelOn:  { color: '#fff', fontWeight: '700' },
})
