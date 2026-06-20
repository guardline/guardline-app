import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated, Easing } from 'react-native'

interface Props {
  size?: number
  animate?: boolean
  alertMode?: boolean
}

const BRAND = '#1D46CC'
const ALERT = '#EF4444'

export default function ShieldLogo({ size = 80, animate = false, alertMode = false }: Props) {
  const color = alertMode ? ALERT : BRAND

  // Animation values for the 6 wave bars
  const anims = useRef([
    useRef(new Animated.Value(0.3)).current,
    useRef(new Animated.Value(0.3)).current,
    useRef(new Animated.Value(0.3)).current,
    useRef(new Animated.Value(0.3)).current,
    useRef(new Animated.Value(0.3)).current,
    useRef(new Animated.Value(0.3)).current,
  ]).current

  // Pulse ring animations
  const pulseVal1 = useRef(new Animated.Value(0)).current
  const pulseVal2 = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (animate) {
      // Animate the wave bars independently with staggered delays
      const loops = anims.map((anim, idx) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: 350 + idx * 80,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: false,
            }),
            Animated.timing(anim, {
              toValue: 0.25,
              duration: 350 + idx * 80,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: false,
            }),
          ])
        )
      })

      loops.forEach(l => l.start())

      // Pulse ring animations
      const startPulse = (pulse: Animated.Value, delay: number) => {
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
              Animated.timing(pulse, {
                toValue: 1,
                duration: 2000,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
              }),
            ]),
          ])
        ).start()
      }

      startPulse(pulseVal1, 0)
      startPulse(pulseVal2, 800)

      return () => {
        loops.forEach(l => l.stop())
        pulseVal1.stopAnimation()
        pulseVal2.stopAnimation()
      }
    }
  }, [animate])

  // Scale height mapping based on anim values
  const barHeights = [18, 30, 40, 40, 28, 16]
  const scaleRatio = size / 80

  return (
    <View style={[styles.container, { width: size, height: size * 1.15 }]}>
      {/* Pulse Rings */}
      {animate && !alertMode && (
        <>
          <Animated.View
            style={[
              styles.pulseRing,
              {
                width: size * 1.6,
                height: size * 1.6,
                borderRadius: size * 0.8,
                backgroundColor: 'rgba(29,70,204,0.18)',
                transform: [
                  {
                    scale: pulseVal1.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.6, 1.4],
                    }),
                  },
                ],
                opacity: pulseVal1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0],
                }),
              },
            ]}
          />
          <Animated.View
            style={[
              styles.pulseRing,
              {
                width: size * 1.6,
                height: size * 1.6,
                borderRadius: size * 0.8,
                backgroundColor: 'rgba(29,70,204,0.1)',
                transform: [
                  {
                    scale: pulseVal2.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.6, 1.4],
                    }),
                  },
                ],
                opacity: pulseVal2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0],
                }),
              },
            ]}
          />
        </>
      )}

      {/* Shield Body Layout */}
      <View
        style={[
          styles.shieldBody,
          {
            borderColor: color,
            backgroundColor: `${color}1F`,
            borderRadius: size * 0.28,
            shadowColor: color,
            shadowOpacity: animate ? 0.6 : 0.2,
            shadowRadius: animate ? 15 : 5,
            shadowOffset: { width: 0, height: 0 },
            elevation: animate ? 8 : 2,
          },
        ]}
      >
        {/* Waveform Bars */}
        <View style={styles.waveContainer}>
          {barHeights.map((maxH, idx) => {
            const h = maxH * scaleRatio
            return (
              <Animated.View
                key={idx}
                style={[
                  styles.bar,
                  {
                    width: 5 * scaleRatio,
                    backgroundColor: color,
                    height: animate
                      ? anims[idx].interpolate({
                          inputRange: [0, 1],
                          outputRange: [h * 0.25, h],
                        })
                      : h,
                  },
                ]}
              />
            );
          })}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
  },
  shieldBody: {
    width: '100%',
    height: '100%',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
  },
  bar: {
    marginHorizontal: 2.5,
    borderRadius: 3,
  },
})
