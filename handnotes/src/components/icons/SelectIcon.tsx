import React from 'react'
import Svg, { Rect, Circle } from 'react-native-svg'
import { IconProps } from './types'
export function SelectIcon({ size = 22, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={4} y={4} width={16} height={16} rx={2} stroke={color} strokeWidth={1.6} strokeDasharray="3.5,3" />
      <Circle cx={4} cy={4} r={1.6} fill={color} />
      <Circle cx={20} cy={4} r={1.6} fill={color} />
      <Circle cx={4} cy={20} r={1.6} fill={color} />
      <Circle cx={20} cy={20} r={1.6} fill={color} />
    </Svg>
  )
}
