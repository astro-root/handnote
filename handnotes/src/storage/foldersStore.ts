import { Folder } from '../types'
import { loadFolders, saveFolders } from './storage'

type Listener = (folders: Folder[]) => void

let folders: Folder[] = []
let loaded = false
let loadingPromise: Promise<Folder[]> | null = null
let saveTimer: ReturnType<typeof setTimeout> | null = null
const listeners = new Set<Listener>()

function notify() { listeners.forEach(l => l(folders)) }

export async function initFoldersStore(): Promise<Folder[]> {
  if (loaded) return folders
  if (!loadingPromise) {
    loadingPromise = loadFolders().then(fs => {
      folders = fs; loaded = true; notify(); return folders
    })
  }
  return loadingPromise
}

export function getFolders(): Folder[] { return folders }

export function subscribeFolders(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function setFolders(next: Folder[], immediate = false): void {
  folders = next
  notify()
  if (saveTimer) { clearTimeout(saveTimer); saveTimer = null }
  if (immediate) {
    saveFolders(folders)
  } else {
    saveTimer = setTimeout(() => { saveTimer = null; saveFolders(folders) }, 600)
  }
}
