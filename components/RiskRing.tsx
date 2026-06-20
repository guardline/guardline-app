import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

interface Props {
  score: number
  size?: number
  showLabel?: boolean
}

function riskColor(score: number) {
  if (score >= 70) return '#EF4444'
  if (score >= 40) return '#F59E0B'
  return '#22C55E'
}

function riskLabel(score: number) {
  if (score >= 70) return 'HIGH RISK'
  if (score >= 40) return 'SUSPICIOUS'
  if (score > 0) return 'LOW RISK'
  return 'SAFE'
}

export default function RiskRing({ score, size = 120, showLabel = true }: Props) {
  const color = riskColor(score)

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: color,
            shadowColor: color,
            shadowRadius: 10,
            shadowOpacity: 0.45,
            shadowOffset: { width: 0, height: 0 },
            elevation: 5,
          },
        ]}
      >
        <Text style={[styles.scoreText, { fontSize: size * 0.28, color }]}>
          {score}
        </Text>
        <Text style={[styles.maxText, { fontSize: size * 0.1 }]}>
          /100
        </Text>
      </View>

      {showLabel && (
        <Text style={[styles.label, { color }]}>
          {riskLabel(score)}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A0F1E',
  },
  scoreText: {
    fontWeight: 'bold',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  maxText: {
    color: 'rgba(255, 255, 255, 0.3)',
    marginTop: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    marginTop: 10,
  },
})
