import React from 'react'
import Svg, { Path } from 'react-native-svg'
import { IconProps } from './types'

export function RuledIcon({ size = 22, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 4h16v16H4z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M4 9h16M4 13h16M4 17h16" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
    </Svg>
  )
}
