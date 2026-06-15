import React from 'react'
import Svg, { Path } from 'react-native-svg'
import { IconProps } from './types'

export function NotebookIcon({ size = 22, color = '#6c63ff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 3h11a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Path d="M6 3v18" stroke={color} strokeWidth={1.8} />
      <Path d="M9.5 7.5h7M9.5 11.5h7M9.5 15.5h4" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  )
}
