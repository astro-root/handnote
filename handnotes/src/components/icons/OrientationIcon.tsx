import React from 'react'
import Svg, { Rect, Path } from 'react-native-svg'
import { IconProps } from './types'
export function OrientationIcon({ size = 22, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={4} width={10} height={14} rx={1.5} stroke={color} strokeWidth={1.8} />
      <Path d="M17 8l3 3-3 3M20 11H14" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}
