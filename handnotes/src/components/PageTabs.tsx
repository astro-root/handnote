import React from 'react'
import { View, ScrollView, TouchableOpacity, Text } from 'react-native'
import { ChevronLeftIcon, ChevronRightIcon, TrashIcon } from './icons'
import { s } from './PageTabs.styles'

interface Props {
  count: number
  current: number
  onSelect: (i: number) => void
  onDelete: () => void
  onPrev: () => void
  onNext: () => void
}

export function PageTabs({ count, current, onSelect, onDelete, onPrev, onNext }: Props) {
  return (
    <View style={s.wrap}>
      <TouchableOpacity
        style={[s.ctrlBtn, current === 0 ? s.ctrlDisabled : null]}
        onPress={onPrev}
        disabled={current === 0}
      >
        <ChevronLeftIcon size={18} color={current === 0 ? '#444' : '#9a9ac0'} />
      </TouchableOpacity>

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

      <TouchableOpacity
        style={[s.ctrlBtn, current === count - 1 ? s.ctrlDisabled : null]}
        onPress={onNext}
        disabled={current === count - 1}
      >
        <ChevronRightIcon size={18} color={current === count - 1 ? '#444' : '#9a9ac0'} />
      </TouchableOpacity>

      <View style={s.sep} />

      <TouchableOpacity
        style={[s.ctrlBtn, count <= 1 ? s.ctrlDisabled : null]}
        onPress={onDelete}
        disabled={count <= 1}
      >
        <TrashIcon size={16} color={count <= 1 ? '#444' : '#ff6b6b'} />
      </TouchableOpacity>
    </View>
  )
}
