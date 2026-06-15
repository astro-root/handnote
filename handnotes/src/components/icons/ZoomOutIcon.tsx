import React from 'react'
import Svg, { Circle, Path } from 'react-native-svg'
import { IconProps } from './types'
export function ZoomOutIcon({ size = 22, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={10} cy={10} r={6.5} stroke={color} strokeWidth={1.8} />
      <Path d="M8 10h4M15 15l4 4" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  )
}
