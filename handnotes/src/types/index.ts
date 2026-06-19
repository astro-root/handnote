export interface Point { x: number; y: number }
export type Tool = 'pen' | 'eraser' | 'eraser-pixel' | 'scroll' | 'select' | 'text'

export type PageBackground =
  | 'blank' | 'ruled' | 'ruled-narrow' | 'ruled-wide'
  | 'grid'  | 'grid-small' | 'grid-large'
  | 'dotted' | 'cornell' | 'music' | 'hex' | 'isometric'

export type PaperSize  = 'free' | 'a3' | 'a4' | 'a5' | 'b5' | 'letter'
export type Orientation = 'portrait' | 'landscape'

export const PAPER_SIZES: Record<PaperSize, { label: string; ratio: number; mmWidth: number; desc: string }> = {
  free:   { label: 'フリー', ratio: 0,            mmWidth: 0,     desc: '制限なし' },
  a3:     { label: 'A3',     ratio: 420 / 297,    mmWidth: 297,   desc: '297 × 420 mm' },
  a4:     { label: 'A4',     ratio: 297 / 210,    mmWidth: 210,   desc: '210 × 297 mm' },
  a5:     { label: 'A5',     ratio: 210 / 148,    mmWidth: 148,   desc: '148 × 210 mm' },
  b5:     { label: 'B5',     ratio: 250 / 176,    mmWidth: 176,   desc: '176 × 250 mm' },
  letter: { label: 'Letter', ratio: 279.4/215.9,  mmWidth: 215.9, desc: '216 × 279 mm' },
}

export const BACKGROUND_INFO: Record<PageBackground, { label: string }> = {
  blank:          { label: '無地' },
  ruled:          { label: '横罫（中）' },
  'ruled-narrow': { label: '横罫（細）' },
  'ruled-wide':   { label: '横罫（太）' },
  grid:           { label: '方眼（中）' },
  'grid-small':   { label: '方眼（小）' },
  'grid-large':   { label: '方眼（大）' },
  dotted:         { label: 'ドット' },
  cornell:        { label: 'コーネル式' },
  music:          { label: '五線譜' },
  hex:            { label: '六角形' },
  isometric:      { label: '等角投影' },
}

export interface Stroke    { id: string; tool: Tool; color: string; width: number; points: Point[] }
export interface NoteImage { id: string; uri: string; x: number; y: number; width: number; height: number }
export interface TextBlock { id: string; x: number; y: number; text: string; color: string; fontSize: number }
export interface Page      { id: string; strokes: Stroke[]; images: NoteImage[]; texts: TextBlock[] }
export interface Note {
  id: string; title: string; createdAt: number; updatedAt: number
  background?: PageBackground; paperSize?: PaperSize; orientation?: Orientation
  folderId?: string; pages: Page[]
}
export interface Folder { id: string; name: string; createdAt: number }
