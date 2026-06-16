import { jsPDF } from 'jspdf'
import { Note, Page, PageBackground, PaperSize, Orientation, PAPER_SIZES } from '../types'

function safeFilename(name: string): string {
  return (name || 'note').trim().replace(/[\\/:*?"<>|]+/g, '_') || 'note'
}

/* ── 背景パターンをCanvas2Dに描画 ── */
function drawBackground(ctx: CanvasRenderingContext2D, bg: PageBackground, W: number, H: number) {
  const RC = '#c8d4f0', GC = '#dde4f5', DC = '#b8c8e0', AC = '#b0a0e8'
  ctx.save()
  ctx.lineWidth = 1

  if (bg === 'ruled' || bg === 'ruled-narrow' || bg === 'ruled-wide') {
    const gap = bg === 'ruled-narrow' ? 22 : bg === 'ruled-wide' ? 48 : 32
    ctx.strokeStyle = RC
    for (let y = gap; y < H; y += gap) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }
  } else if (bg === 'grid' || bg === 'grid-small' || bg === 'grid-large') {
    const gap = bg === 'grid-small' ? 16 : bg === 'grid-large' ? 40 : 24
    ctx.strokeStyle = GC
    for (let y = gap; y < H; y += gap) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }
    for (let x = gap; x < W; x += gap) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
  } else if (bg === 'dotted') {
    const gap = 28
    ctx.fillStyle = DC
    for (let y = gap; y < H; y += gap)
      for (let x = gap; x < W; x += gap) { ctx.beginPath(); ctx.arc(x, y, 1.6, 0, Math.PI * 2); ctx.fill() }
  } else if (bg === 'cornell') {
    const mx = Math.round(W * 0.25), hy = 56, fy = H - 44, rg = 30
    ctx.strokeStyle = RC
    for (let y = hy + rg; y < fy; y += rg) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }
    ctx.strokeStyle = AC; ctx.lineWidth = 1.5
    ;[[mx, hy, mx, fy], [0, hy, W, hy], [0, fy, W, fy]].forEach(([x1, y1, x2, y2]) => {
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
    })
  } else if (bg === 'music') {
    const lg = 9, sg = 46, top = 36
    ctx.strokeStyle = RC; ctx.lineWidth = 0.9
    let y = top
    while (y + lg * 4 < H) {
      for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(0, y + i * lg); ctx.lineTo(W, y + i * lg); ctx.stroke() }
      y += lg * 4 + sg
    }
  } else if (bg === 'hex') {
    const r = 26, cs = r * 1.5, rs = r * Math.sqrt(3)
    ctx.strokeStyle = GC; ctx.lineWidth = 0.8
    for (let col = -1; col * cs - r < W + r; col++) {
      const cx = col * cs + r, stagger = (((col % 2) + 2) % 2) !== 0 ? rs / 2 : 0
      for (let row = -1; row * rs + stagger - r < H + r; row++) {
        const cy = row * rs + stagger
        ctx.beginPath()
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI / 3) * i
          const px = cx + r * Math.cos(a), py = cy + r * Math.sin(a)
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py)
        }
        ctx.closePath(); ctx.stroke()
      }
    }
  } else if (bg === 'isometric') {
    const S3 = Math.sqrt(3), gap = 28, ds = gap * 2
    ctx.strokeStyle = GC; ctx.lineWidth = 0.6
    for (let y = gap; y < H; y += gap) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }
    const ext = Math.ceil(S3 * W / ds) * ds + ds
    for (let c = -ext; c < H + S3 * W + ds; c += ds) {
      ctx.beginPath(); ctx.moveTo(0, c); ctx.lineTo(W, c - S3 * W); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0, c); ctx.lineTo(W, c + S3 * W); ctx.stroke()
    }
  }
  ctx.restore()
}

/* ── 1本のストロークを滑らかに描画（オンスクリーン描画と同じ補間） ── */
function drawStroke(ctx: CanvasRenderingContext2D, points: { x: number; y: number }[], color: string, width: number) {
  if (points.length < 2) {
    if (points.length === 1) {
      ctx.beginPath(); ctx.fillStyle = color
      ctx.arc(points[0].x, points[0].y, width / 2, 0, Math.PI * 2); ctx.fill()
    }
    return
  }
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  for (let i = 1; i < points.length - 1; i++) {
    const mx = (points[i].x + points[i + 1].x) / 2
    const my = (points[i].y + points[i + 1].y) / 2
    ctx.quadraticCurveTo(points[i].x, points[i].y, mx, my)
  }
  const last = points[points.length - 1]
  ctx.lineTo(last.x, last.y)
  ctx.stroke()
}

/* ── ページをCanvasに描画してPNG dataURLへ ── */
async function renderPageWeb(page: Page, background: PageBackground, W: number, H: number): Promise<string> {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, W, H)
  drawBackground(ctx, background, W, H)

  // インクと画像は別レイヤーに描き、ピクセル消しゴムで「destination-out」で切り抜く
  const inkCanvas = document.createElement('canvas')
  inkCanvas.width = W
  inkCanvas.height = H
  const ictx = inkCanvas.getContext('2d')!

  for (const img of page.images) {
    await new Promise<void>(resolve => {
      const el = new Image()
      el.onload = () => { ictx.drawImage(el, img.x, img.y, img.width, img.height); resolve() }
      el.onerror = () => resolve()
      el.src = img.uri
    })
  }

  for (const s of page.strokes) {
    if (s.tool === 'eraser-pixel') continue
    drawStroke(ictx, s.points, s.color, s.width)
  }

  ictx.globalCompositeOperation = 'destination-out'
  for (const s of page.strokes) {
    if (s.tool !== 'eraser-pixel') continue
    drawStroke(ictx, s.points, '#000000', s.width)
  }
  ictx.globalCompositeOperation = 'source-over'

  ctx.drawImage(inkCanvas, 0, 0)
  return canvas.toDataURL('image/png')
}

const DPI = 150
const mm2px = (mm: number) => Math.round((mm / 25.4) * DPI)

function pageDimensions(note: Note, page: Page) {
  const paperSize: PaperSize = note.paperSize ?? 'free'
  const orientation: Orientation = note.orientation ?? 'portrait'

  if (paperSize === 'free') {
    // ストローク・画像のバウンディングボックスから推定。空ページはA4既定。
    let maxX = 0, maxY = 0
    page.strokes.forEach(s => s.points.forEach(p => {
      maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y)
    }))
    page.images.forEach(img => {
      maxX = Math.max(maxX, img.x + img.width); maxY = Math.max(maxY, img.y + img.height)
    })
    const pxW = Math.max(Math.ceil(maxX + 40), 794)
    const pxH = Math.max(Math.ceil(maxY + 40), 1123)
    return { pxW, pxH, mmW: (pxW / 96) * 25.4, mmH: (pxH / 96) * 25.4 }
  }

  const info = PAPER_SIZES[paperSize]
  let mmW = info.mmWidth, mmH = info.mmWidth * info.ratio
  if (orientation === 'landscape') { const t = mmW; mmW = mmH; mmH = t }
  return { pxW: mm2px(mmW), pxH: mm2px(mmH), mmW, mmH }
}

/* ── ノート全体をPDF化してダウンロード ── */
export async function exportNoteToPdf(note: Note, onProgress?: (i: number, total: number) => void) {
  let doc: jsPDF | null = null

  for (let i = 0; i < note.pages.length; i++) {
    const page = note.pages[i]
    const { pxW, pxH, mmW, mmH } = pageDimensions(note, page)
    const dataUrl = await renderPageWeb(page, note.background ?? 'blank', pxW, pxH)

    if (!doc) doc = new jsPDF({ unit: 'mm', format: [mmW, mmH] })
    else doc.addPage([mmW, mmH])

    doc.addImage(dataUrl, 'PNG', 0, 0, mmW, mmH)
    onProgress?.(i + 1, note.pages.length)
  }

  doc!.save(`${safeFilename(note.title)}.pdf`)
}

/* ── 現在のページのみPNGで保存 ── */
export async function exportPageToPng(note: Note, pageIdx: number) {
  const page = note.pages[pageIdx]
  const { pxW, pxH } = pageDimensions(note, page)
  const dataUrl = await renderPageWeb(page, note.background ?? 'blank', pxW, pxH)

  const a = document.createElement('a')
  a.href = dataUrl
  a.download = `${safeFilename(note.title)}_p${pageIdx + 1}.png`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
