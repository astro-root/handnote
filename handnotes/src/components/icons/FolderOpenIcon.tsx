import React from 'react'
import Svg, { Path } from 'react-native-svg'
import { IconProps } from './types'

export function FolderOpenIcon({ size = 22, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 6a2 2 0 012-2h4l2 2h8a2 2 0 012 2v1H2V6z"
        fill={color}
        opacity={0.3}
      />
      <Path
        d="M2 9h20l-2 9H4L2 9z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Path
        d="M2 6a2 2 0 012-2h4l2 2h8a2 2 0 012 2v1H2V6z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </Svg>
  )
}
