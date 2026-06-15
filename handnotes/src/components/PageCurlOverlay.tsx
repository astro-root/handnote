import React, {
  useState, useRef, useEffect,
  forwardRef, useImperativeHandle,
} from 'react'
import { Animated, View, StyleSheet } from 'react-native'
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg'

export interface CurlHandle {
  flip(onMid: () => void, onDone?: () => void): void
}

interface Props { paperWidth: number; paperHeight: number }

export const PageCurlOverlay = forwardRef<CurlHandle, Props>(
  ({ paperWidth: W, paperHeight: H }, ref) => {
    const MIN    = 44
    const [fold, setFold] = useState(MIN)
    const anim   = useRef(new Animated.Value(0)).current
    const maxRef = useRef(0)

    useEffect(() => { maxRef.current = Math.hypot(W, H) * 0.70 }, [W, H])

    useEffect(() => {
      const id = anim.addListener(({ value }) => {
        setFold(MIN + value * Math.max(0, maxRef.current - MIN))
      })
      return () => anim.removeListener(id)
    }, [anim])

    useImperativeHandle(ref, () => ({
      flip(onMid: () => void, onDone?: () => void) {
        anim.setValue(0)
        Animated.timing(anim, { toValue: 1, duration: 220, useNativeDriver: false }).start(() => {
          onMid()
          Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: false }).start(() => onDone?.())
        })
      },
    }), [anim])

    if (!W || !H) return null

    const s  = fold
    const bs = s * 0.80
    /* めくれ三角（右下→左上）*/
    const mainPath = `M ${W} ${H} L ${W - s} ${H} L ${W} ${H - s} Z`
    /* 裏面（薄いグラデ）*/
    const backPath = `M ${W - s} ${H} L ${W - bs} ${H - (s - bs)} L ${W} ${H - s} Z`

    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="curlShadow" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="rgba(0,0,0,0.22)" />
              <Stop offset="1" stopColor="rgba(0,0,0,0)" />
            </LinearGradient>
            <LinearGradient id="curlBack" x1="1" y1="1" x2="0" y2="0">
              <Stop offset="0" stopColor="#b8b8cc" />
              <Stop offset="0.6" stopColor="#dcdcec" />
              <Stop offset="1" stopColor="#f0f0f8" />
            </LinearGradient>
          </Defs>
          <Path d={mainPath} fill="url(#curlShadow)" />
          <Path d={backPath} fill="url(#curlBack)" />
        </Svg>
      </View>
    )
  }
)
