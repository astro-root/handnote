import { StyleSheet } from 'react-native'

export const s = StyleSheet.create({
  hdr: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  back: { marginRight: 8, padding: 4 },
  titleBtn: { flex: 1 },
  titleInp: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: '#2a2a3e',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  titleTxt: { color: '#fff', fontSize: 16, fontWeight: '600' },
  pgBadge: { color: '#555', fontSize: 12, marginLeft: 8 },
})
