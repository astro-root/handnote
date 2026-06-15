import AsyncStorage from '@react-native-async-storage/async-storage'
import { Note, Page } from '../types'
 
const KEY = 'handnotes_v1'
 
export const genId = (): string =>
  `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
 
export const makePage = (): Page => ({ id: genId(), strokes: [], images: [] })
 
export const makeNote = (title: string): Note => ({
  id: genId(),
  title,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  pages: [makePage()],
})
 
export const loadNotes = async (): Promise<Note[]> => {
  try {
    const raw = await AsyncStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Note[]) : []
  } catch {
    return []
  }
}
 
export const saveNotes = async (notes: Note[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(notes))
  } catch (e) {
    console.error('saveNotes error', e)
  }
}
