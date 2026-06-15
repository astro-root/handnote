import React from 'react'
import Svg, { Path } from 'react-native-svg'
import { IconProps } from './types'

export function ChevronLeftIcon({ size = 24, color = '#6c63ff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 5l-7 7 7 7"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}
