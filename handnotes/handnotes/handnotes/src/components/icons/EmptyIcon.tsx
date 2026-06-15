import React from 'react'
import Svg, { Path } from 'react-native-svg'
import { IconProps } from './types'

export function EmptyIcon({ size = 56, color = '#555' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 18l3-1L17 8l-3-3L5 14z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <Path d="M14 6l3 3" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  )
}
