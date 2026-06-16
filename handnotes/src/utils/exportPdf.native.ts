import { Note } from '../types'

export async function exportNoteToPdf(_note: Note, _onProgress?: (i: number, total: number) => void): Promise<void> {
  throw new Error('モバイル版のPDFエクスポートは未実装です。現在はWeb版（ブラウザ）でご利用ください。')
}

export async function exportPageToPng(_note: Note, _pageIdx: number): Promise<void> {
  throw new Error('モバイル版の画像エクスポートは未実装です。現在はWeb版（ブラウザ）でご利用ください。')
}
