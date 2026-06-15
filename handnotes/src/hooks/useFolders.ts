import { useEffect, useState } from 'react'
import { Folder } from '../types'
import { getFolders, initFoldersStore, subscribeFolders, setFolders } from '../storage/foldersStore'

export function useFolders() {
  const [folders, setLocal] = useState<Folder[]>(getFolders())

  useEffect(() => {
    initFoldersStore().then(setLocal)
    return subscribeFolders(setLocal)
  }, [])

  return { folders, setFolders }
}
