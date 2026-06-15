import React from 'react'
import Svg, { Path } from 'react-native-svg'
import { IconProps } from './types'

export function PenIcon({ size = 22, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 20l3-1L18 8l-3-3L4 16z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <Path d="M14 6l3 3" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  )
}
