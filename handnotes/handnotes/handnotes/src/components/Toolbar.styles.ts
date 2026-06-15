import { StyleSheet } from 'react-native'

export const COLORS = [
  '#000000', '#434343', '#888888', '#ffffff',
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899',
]

export const WIDTHS = [2, 4, 8, 14, 22]

export const s = StyleSheet.create({
  wrap: {
    backgroundColor: '#1a1a2e',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4 },
  btn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  btnOn: { backgroundColor: '#4c4f8a' },
  div: { width: 1, height: 28, backgroundColor: '#444', marginHorizontal: 4 },
  dot: { width: 26, height: 26, borderRadius: 13, marginHorizontal: 3 },
  dotSel: { borderWidth: 3, borderColor: '#fff' },
  dotBorder: { borderWidth: 1, borderColor: '#555' },
})
