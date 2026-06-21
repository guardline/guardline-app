import React, { useState } from 'react'
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native'
import { pickAndSaveNotifyContact } from '../lib/pickNotifyContact'
import type { NotifyContact } from '../lib/store'

interface Props {
  onComplete: (contact: NotifyContact) => void
}

export default function SetupContact({ onComplete }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePick = async () => {
    setLoading(true)
    setError(null)
    try {
      const contact = await pickAndSaveNotifyContact()
      if (contact) {
        onComplete(contact)
      }
    } catch {
      setError('Could not open contacts. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.iconWrapper}>
          <Text style={styles.icon}>👨‍👩‍👧</Text>
        </View>

        <Text style={styles.title}>Who should we alert?</Text>
        <Text style={styles.desc}>
          Choose a trusted contact from your phone. During a scam demo, GuardLine will show their name when a fake alert is sent — no real SMS is sent.
        </Text>

        <TouchableOpacity
          onPress={handlePick}
          disabled={loading}
          style={[styles.pickBtn, loading ? styles.pickBtnDisabled : null]}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.pickBtnText}>Choose from contacts</Text>
          )}
        </TouchableOpacity>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0A0F1E',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  iconWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(29, 70, 204, 0.18)',
    borderColor: 'rgba(29, 70, 204, 0.3)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  desc: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  pickBtn: {
    backgroundColor: '#1D46CC',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 32,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  pickBtnDisabled: {
    opacity: 0.7,
  },
  pickBtnText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    marginTop: 16,
    textAlign: 'center',
  },
})
