import React from 'react'
import Svg, { Rect, Line, Path } from 'react-native-svg'
import { IconProps } from './types'
export function PageSizeIcon({ size = 22, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={2} width={13} height={17} rx={1.5} stroke={color} strokeWidth={1.8} />
      <Line x1={6} y1={7}  x2={13} y2={7}  stroke={color} strokeWidth={1.3} strokeLinecap="round" />
      <Line x1={6} y1={10} x2={13} y2={10} stroke={color} strokeWidth={1.3} strokeLinecap="round" />
      <Line x1={6} y1={13} x2={10} y2={13} stroke={color} strokeWidth={1.3} strokeLinecap="round" />
      <Path d="M14 20l3 3 3-3M20 17l-3-3-3 3"
        stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}
