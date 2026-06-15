import React from 'react'
import Svg, { Path, Circle } from 'react-native-svg'
import { IconProps } from './types'

export function ImageIcon({ size = 22, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 5h16v14H4z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Circle cx={9} cy={10} r={1.5} stroke={color} strokeWidth={1.8} />
      <Path
        d="M4 17l4.5-4.5 3 3 4-4 4.5 4.5"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}
