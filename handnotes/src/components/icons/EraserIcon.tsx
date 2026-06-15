import React from 'react'
import Svg, { Path } from 'react-native-svg'
import { IconProps } from './types'

export function EraserIcon({ size = 22, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 17l7-7 7 7-3 3H7z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <Path d="M7 20h13" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  )
}
