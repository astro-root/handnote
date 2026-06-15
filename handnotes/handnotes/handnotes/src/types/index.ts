export interface Point { x: number; y: number }
export type Tool = 'pen' | 'eraser'
export interface Stroke {
  id: string
  tool: Tool
  color: string
  width: number
  points: Point[]
}
export interface NoteImage {
  id: string
  uri: string
  x: number
  y: number
  width: number
  height: number
}
export interface Page {
  id: string
  strokes: Stroke[]
  images: NoteImage[]
}
export interface Note {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  pages: Page[]
}
