import { StyleSheet } from 'react-native'

export const COLORS = [
  '#000000', '#3d3d3d', '#808080', '#c0c0c0',
  '#ff3b30', '#ff9500', '#ffcc00', '#34c759',
  '#007aff', '#5856d6', '#af52de', '#ff2d55',
  '#8b4513', '#ffffff',
]

export const WIDTHS = [2, 4, 8, 14]

export const s = StyleSheet.create({
  wrap: {
    backgroundColor: '#0d0d1a',
    borderTopWidth: 1,
    borderTopColor: '#1e1e30',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 2,
    gap: 2,
  },
  btn: {
    width: 38, height: 38, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center',
  },
  btnOn: { backgroundColor: '#2a2a4a' },
  dot: {
    width: 24, height: 24, borderRadius: 12,
    marginHorizontal: 2,
  },
  dotSel: {
    borderWidth: 3, borderColor: '#fff',
    width: 28, height: 28, borderRadius: 14,
  },
  dotBorder: { borderWidth: 1, borderColor: '#555' },
  div: {
    width: 1, height: 22,
    backgroundColor: '#2a2a40', marginHorizontal: 4,
  },
})
