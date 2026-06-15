import React from 'react'
import { ScrollView, TouchableOpacity, Text } from 'react-native'
import { s } from './PageTabs.styles'

interface Props {
  count: number
  current: number
  onSelect: (i: number) => void
}

export function PageTabs({ count, current, onSelect }: Props) {
  if (count <= 1) return null
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={s.tabs}
      contentContainerStyle={s.tabsCont}
    >
      {Array.from({ length: count }).map((_, i) => (
        <TouchableOpacity
          key={i}
          style={[s.tab, i === current ? s.tabOn : null]}
          onPress={() => onSelect(i)}
        >
          <Text style={[s.tabTxt, i === current ? s.tabTxtOn : null]}>{i + 1}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  )
}
