import { useEffect, useState } from 'react'
import { Note } from '../types'
import { getNotes, initStore, subscribe, setNotes, flush } from '../storage/notesStore'

export function useNotes() {
  const [notes, setLocal] = useState<Note[]>(getNotes())

  useEffect(() => {
    initStore().then(setLocal)
    return subscribe(setLocal)
  }, [])

  return { notes, setNotes, flush }
}
