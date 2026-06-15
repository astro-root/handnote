import React from 'react'
import Svg, { Path, Rect } from 'react-native-svg'
import { IconProps } from './types'

export function PixelEraserIcon({ size = 22, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 20H7L3 16l10-10 7 7-3.5 3.5"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Rect x={14} y={17} width={2} height={2} fill={color} opacity={0.5} />
      <Rect x={17} y={14} width={2} height={2} fill={color} opacity={0.5} />
      <Rect x={17} y={17} width={2} height={2} fill={color} />
    </Svg>
  )
}
