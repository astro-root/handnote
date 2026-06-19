import React from 'react'
import Svg, { Path } from 'react-native-svg'
import { IconProps } from './types'
export function TextIcon({ size = 22, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 7V5h16v2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 5v14" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M8 19h8" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  )
}
