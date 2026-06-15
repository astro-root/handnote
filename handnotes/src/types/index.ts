export interface Point { x: number; y: number }
export type Tool = 'pen' | 'eraser' | 'eraser-pixel' | 'scroll'
export type PageBackground = 'blank' | 'ruled' | 'grid'
export type PaperSize = 'free' | 'a4' | 'a5' | 'b5' | 'letter'

export const PAPER_SIZES: Record<PaperSize, { label: string; ratio: number; desc: string }> = {
  free:   { label: 'フリー', ratio: 0,             desc: '制限なし' },
  a4:     { label: 'A4',     ratio: 297 / 210,     desc: '210 × 297 mm' },
  a5:     { label: 'A5',     ratio: 210 / 148,     desc: '148 × 210 mm' },
  b5:     { label: 'B5',     ratio: 250 / 176,     desc: '176 × 250 mm' },
  letter: { label: 'Letter', ratio: 279.4 / 215.9, desc: '216 × 279 mm' },
}

export interface Stroke {
  id: string; tool: Tool; color: string; width: number; points: Point[]
}
export interface NoteImage {
  id: string; uri: string; x: number; y: number; width: number; height: number
}
export interface Page {
  id: string; strokes: Stroke[]; images: NoteImage[]
}
export interface Note {
  id: string; title: string; createdAt: number; updatedAt: number
  background?: PageBackground; paperSize?: PaperSize; folderId?: string; pages: Page[]
}
export interface Folder {
  id: string; name: string; createdAt: number
}
