import { StyleSheet } from 'react-native'

export const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0d0d1a' },

  hdr: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#1e1e30',
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: { color: '#fff', fontSize: 20, fontWeight: '700', letterSpacing: 0.5 },
  cnt: { color: '#555', fontSize: 13 },

  // サイドバー + メインの2ペイン
  body: { flex: 1, flexDirection: 'row' },

  // サイドバー（フォルダー一覧）
  sidebar: {
    width: 200,
    backgroundColor: '#111120',
    borderRightWidth: 1,
    borderRightColor: '#1e1e30',
    paddingTop: 8,
  },
  sidebarNarrow: { width: 56 },
  sideItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    borderRadius: 8, marginHorizontal: 6, marginBottom: 2,
  },
  sideItemOn: { backgroundColor: '#1e1e40' },
  sideLabel: { color: '#aaa', fontSize: 14, flex: 1 },
  sideLabelOn: { color: '#fff', fontWeight: '600' },
  sideCnt: { color: '#555', fontSize: 12 },
  sideAddBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    margin: 8, paddingVertical: 8, paddingHorizontal: 10,
    borderRadius: 8, borderWidth: 1, borderColor: '#2a2a4a',
    borderStyle: 'dashed',
  },
  sideAddTxt: { color: '#6c63ff', fontSize: 13 },

  // メインエリア
  main: { flex: 1 },
  newRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 10,
    gap: 8,
  },
  inp: {
    flex: 1, backgroundColor: '#1a1a2e', color: '#fff',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 14, borderWidth: 1, borderColor: '#2a2a40',
  },
  addBtn: {
    backgroundColor: '#6c63ff', borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  addTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyIco: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#1a1a2e', justifyContent: 'center', alignItems: 'center',
  },
  emptyMsg: { color: '#555', fontSize: 14, textAlign: 'center', lineHeight: 22 },

  list: { padding: 12, gap: 8 },
  card: {
    backgroundColor: '#1a1a2e', borderRadius: 12,
    flexDirection: 'row', alignItems: 'center',
    padding: 14, borderWidth: 1, borderColor: '#2a2a40',
  },
  cardBody: { flex: 1 },
  cardTitle: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 4 },
  cardMeta: { color: '#555', fontSize: 12 },
  del: { padding: 6 },
})
