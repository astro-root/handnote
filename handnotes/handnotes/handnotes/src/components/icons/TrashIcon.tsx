import React from 'react'
import Svg, { Path } from 'react-native-svg'
import { IconProps } from './types'

export function TrashIcon({ size = 22, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 7h16" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M9 7V4h6v3" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M6 7l1 13h10l1-13" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M10 11v6M14 11v6" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  )
}
