import React from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import { ChevronLeftIcon } from './icons'
import { s } from './EditorHeader.styles'

interface Props {
  title: string
  pageLabel: string
  editing: boolean
  onBack: () => void
  onTitleChange: (t: string) => void
  onStartEdit: () => void
  onEndEdit: () => void
}

export function EditorHeader({
  title, pageLabel, editing,
  onBack, onTitleChange, onStartEdit, onEndEdit,
}: Props) {
  return (
    <View style={s.hdr}>
      <TouchableOpacity onPress={onBack} style={s.back}>
        <ChevronLeftIcon size={24} color="#6c63ff" />
      </TouchableOpacity>
      {editing ? (
        <TextInput
          autoFocus
          style={s.titleInp}
          value={title}
          onChangeText={onTitleChange}
          onBlur={onEndEdit}
        />
      ) : (
        <TouchableOpacity style={s.titleBtn} onPress={onStartEdit}>
          <Text style={s.titleTxt} numberOfLines={1}>{title}</Text>
        </TouchableOpacity>
      )}
      <Text style={s.pgBadge}>{pageLabel}</Text>
    </View>
  )
}
