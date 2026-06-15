import { Platform } from 'react-native'
import { Note } from '../types'
import { loadNotes, saveNotes } from './storage'

type Listener = (notes: Note[]) => void

let notes: Note[] = []
let loaded = false
let loadingPromise: Promise<Note[]> | null = null
let saveTimer: ReturnType<typeof setTimeout> | null = null
const listeners = new Set<Listener>()

function notify() {
  listeners.forEach((l) => l(notes))
}

export async function initStore(): Promise<Note[]> {
  if (loaded) return notes
  if (!loadingPromise) {
    loadingPromise = loadNotes().then((ns) => {
      notes = ns
      loaded = true
      notify()
      return notes
    })
  }
  return loadingPromise
}

export function getNotes(): Note[] {
  return notes
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function setNotes(next: Note[], immediate = false): void {
  notes = next
  notify()
  if (saveTimer) {
    clearTimeout(saveTimer)
    saveTimer = null
  }
  if (immediate) {
    saveNotes(notes)
  } else {
    saveTimer = setTimeout(() => {
      saveTimer = null
      saveNotes(notes)
    }, 600)
  }
}

export function flush(): void {
  if (saveTimer) {
    clearTimeout(saveTimer)
    saveTimer = null
    saveNotes(notes)
  }
}

if (Platform.OS === 'web' && typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    flush()
  })
}
