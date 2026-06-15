import { StyleSheet } from 'react-native'

export const s = StyleSheet.create({
  tabs: {
    maxHeight: 40,
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tabsCont: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4 },
  tab: {
    width: 32,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#2a2a3e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  tabOn: { backgroundColor: '#6c63ff' },
  tabTxt: { color: '#777', fontSize: 13, fontWeight: '600' },
  tabTxtOn: { color: '#fff' },
})
