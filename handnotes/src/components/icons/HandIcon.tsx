import React from 'react'
import Svg, { Path } from 'react-native-svg'
import { IconProps } from './types'
export function HandIcon({ size = 22, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 11V5.5a1.5 1.5 0 013 0V9m0 0V4a1.5 1.5 0 013 0v5m0 0V5.5a1.5 1.5 0 013 0V15
           c0 2.8-1.8 5-5 5h-1.5C9 20 7 18 7 15v-3a1.5 1.5 0 013 0v1"
        stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
      />
    </Svg>
  )
}
