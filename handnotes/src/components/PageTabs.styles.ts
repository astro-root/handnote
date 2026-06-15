import { StyleSheet } from 'react-native'

export const s = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingHorizontal: 4,
  },
  tabs: { flex: 1 },
  tabsCont: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  tab: {
    minWidth: 32,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#2a2a3e',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
    paddingHorizontal: 6,
  },
  tabOn: { backgroundColor: '#6c63ff' },
  tabTxt: { color: '#777', fontSize: 13, fontWeight: '600' },
  tabTxtOn: { color: '#fff' },
  ctrlBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctrlDisabled: { opacity: 0.3 },
  sep: {
    width: 1,
    height: 20,
    backgroundColor: '#333',
    marginHorizontal: 4,
  },
})
