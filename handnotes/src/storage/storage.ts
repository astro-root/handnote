import AsyncStorage from '@react-native-async-storage/async-storage'
import { Note, Page, Folder, PaperSize, Orientation } from '../types'

const NOTES_KEY   = 'handnotes_v1'
const FOLDERS_KEY = 'handnotes_folders_v1'

export const genId = (): string =>
  `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

export const makePage = (): Page => ({ id: genId(), strokes: [], images: [] })

export const makeNote = (
  title: string, folderId?: string,
  paperSize: PaperSize = 'a4',
  orientation: Orientation = 'portrait',
): Note => ({
  id: genId(), title,
  createdAt: Date.now(), updatedAt: Date.now(),
  background: 'blank', paperSize, orientation, folderId,
  pages: [makePage()],
})

export const makeFolder = (name: string): Folder => ({
  id: genId(), name, createdAt: Date.now(),
})

export const loadNotes = async (): Promise<Note[]> => {
  try { const r = await AsyncStorage.getItem(NOTES_KEY); return r ? JSON.parse(r) : [] }
  catch { return [] }
}
export const saveNotes = async (notes: Note[]): Promise<void> => {
  try { await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(notes)) }
  catch (e) { console.error('saveNotes', e) }
}
export const loadFolders = async (): Promise<Folder[]> => {
  try { const r = await AsyncStorage.getItem(FOLDERS_KEY); return r ? JSON.parse(r) : [] }
  catch { return [] }
}
export const saveFolders = async (folders: Folder[]): Promise<void> => {
  try { await AsyncStorage.setItem(FOLDERS_KEY, JSON.stringify(folders)) }
  catch (e) { console.error('saveFolders', e) }
}
