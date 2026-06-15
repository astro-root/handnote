import React from 'react'
import Svg, { Path } from 'react-native-svg'
import { IconProps } from './types'

export function AddPageIcon({ size = 22, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 3h8l4 4v14H6z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M14 3v4h4" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M12 11v6M9 14h6" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  )
}
