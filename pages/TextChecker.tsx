import React, { useState } from 'react'
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { analyzeScam, type ScamAnalysis } from '../lib/gemini'
import { addAlert } from '../lib/store'

const EXAMPLES = [
  { label: 'IRS warrant', text: 'This is the IRS. A federal warrant has been issued for your arrest due to unpaid taxes. To prevent immediate arrest, call 888-555-0199 and pay $2,400 in Google Play gift cards today.' },
  { label: 'Amazon charge', text: 'Your Amazon account has been charged $399.99 for an order you did not place. To cancel and receive a refund, call 1-800-555-0177 immediately.' },
  { label: 'Grandchild in jail', text: "Grandma, it's me, your grandson. I'm in jail and need bail money right away. Please don't tell Mom and Dad. Send $3,000 in gift cards." },
]

const VERDICT = {
  safe:       { color: '#22C55E', bg: 'rgba(34,197,94,0.10)',  border: 'rgba(34,197,94,0.25)',  label: 'Looks Safe',       icon: '✅' },
  suspicious: { color: '#F59E0B', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.25)', label: 'Be Careful',       icon: '⚠️' },
  scam:       { color: '#EF4444', bg: 'rgba(239,68,68,0.10)',  border: 'rgba(239,68,68,0.25)',  label: 'This Is a Scam',  icon: '🚨' },
}

export default function TextChecker() {
  const [input, setInput] = useState('')
  const [isPhotoSelected, setIsPhotoSelected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScamAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [alerted, setAlerted] = useState(false)

  const handleSimulatedPhoto = () => {
    setInput('')
    setIsPhotoSelected(true)
    setResult(null)
    setError(null)
  }

  const analyze = async () => {
    setLoading(true)
    setResult(null)
    setError(null)
    setAlerted(false)
    try {
      let res: ScamAnalysis
      if (isPhotoSelected) {
        // Simulate screenshot analysis
        await new Promise<void>((resolve) => setTimeout(() => resolve(), 1800))
        res = {
          verdict: 'scam',
          riskScore: 93,
          redFlags: [
            'Government or brand impersonation',
            'Urgency and threat tactics',
            'Unusual payment method (gift cards / wire transfer)',
          ],
          explanation:
            'This message contains multiple hallmarks of a classic impersonation scam. Legitimate agencies never contact you by phone or text to demand immediate payment, and they never ask for gift cards.',
          whatToDo:
            'Hang up or ignore immediately. Do NOT call back. Tell a trusted family member. If it involves taxes, call the IRS directly at 1-800-829-1040.',
        }
      } else {
        res = await analyzeScam(input)
      }
      setResult(res)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const readAloud = () => {
    if (!result) return
    Alert.alert('AI Feedback', `${result.explanation}\n\n${result.whatToDo}`)
  }

  const alertFamily = () => {
    if (!result) return
    addAlert({
      source: 'text',
      riskScore: result.riskScore,
      flags: result.redFlags,
      snippet: isPhotoSelected ? '[Photo uploaded]' : `"${input.slice(0, 90)}${input.length > 90 ? '…' : ''}"`,
      smsSent: true
    })
    setAlerted(true)
  }

  const clearAll = () => {
    setInput('')
    setIsPhotoSelected(false)
    setResult(null)
    setError(null)
  }

  const canAnalyze = !loading && (input.trim().length > 0 || isPhotoSelected)
  const vc = result ? VERDICT[result.verdict] : null

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Title */}
        <View style={styles.header}>
          <Text style={styles.title}>Is This a Scam?</Text>
          <Text style={styles.subtitle}>Type a message or check a screenshot</Text>
        </View>

        {/* Examples */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Try an example</Text>
          <View style={styles.examplesContainer}>
            {EXAMPLES.map((ex) => (
              <TouchableOpacity
                key={ex.label}
                onPress={() => {
                  setInput(ex.text)
                  setIsPhotoSelected(false)
                  setResult(null)
                  setError(null)
                }}
                style={styles.exampleBtn}
              >
                <Text style={styles.exampleBtnText}>{ex.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Photo Upload Simulator */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Or check a photo</Text>
          {isPhotoSelected ? (
            <View style={styles.photoPreviewCard}>
              <Text style={styles.photoEmoji}>📸</Text>
              <Text style={styles.photoCardTitle}>Scam screenshot loaded</Text>
              <TouchableOpacity onPress={clearAll} style={styles.clearPhotoBtn}>
                <Text style={styles.clearPhotoBtnText}>✕ Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={handleSimulatedPhoto} style={styles.uploadBox}>
              <View style={styles.uploadIconWrapper}>
                <Text style={styles.uploadIcon}>📸</Text>
              </View>
              <View style={styles.uploadTexts}>
                <Text style={styles.uploadTitle}>Upload screenshot</Text>
                <Text style={styles.uploadDesc}>Select scam screenshot to analyze</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Text Input */}
        {!isPhotoSelected && (
          <View style={styles.section}>
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or type below</Text>
              <View style={styles.dividerLine} />
            </View>
            <View style={styles.inputWrapper}>
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Type or paste the message here…"
                placeholderTextColor="rgba(255,255,255,0.25)"
                multiline
                numberOfLines={4}
                style={[
                  styles.textarea,
                  {
                    borderColor: input ? 'rgba(29,70,204,0.6)' : 'rgba(255,255,255,0.1)',
                  },
                ]}
              />
              {input ? (
                <TouchableOpacity onPress={clearAll} style={styles.clearTextBtn}>
                  <Text style={styles.clearTextText}>✕</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        )}

        {/* Submit */}
        <TouchableOpacity
          onPress={analyze}
          disabled={!canAnalyze}
          style={[styles.submitBtn, !canAnalyze ? styles.disabledBtn : null]}
        >
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#FFF" size="small" style={styles.spinner} />
              <Text style={styles.submitBtnText}>Checking…</Text>
            </View>
          ) : (
            <Text style={styles.submitBtnText}>Check This →</Text>
          )}
        </TouchableOpacity>

        {error && <Text style={styles.errorText}>{error}</Text>}

        {/* Result UI */}
        {result && vc && (
          <View
            style={[
              styles.resultCard,
              {
                backgroundColor: vc.bg,
                borderColor: vc.border,
              },
            ]}
          >
            <View style={styles.resultHeader}>
              <Text style={styles.resultEmoji}>{vc.icon}</Text>
              <Text style={[styles.resultTitle, { color: vc.color }]}>
                {vc.label}
              </Text>
            </View>

            <View style={[styles.resultDivider, { backgroundColor: vc.border }]} />

            <View style={styles.resultSection}>
              <Text style={styles.explanationText}>{result.explanation}</Text>
            </View>

            {result.whatToDo ? (
              <View style={styles.resultSection}>
                <Text style={styles.resultSubHeader}>What to do</Text>
                <Text style={styles.whatToDoText}>{result.whatToDo}</Text>
              </View>
            ) : null}

            {result.redFlags.length > 0 ? (
              <View style={styles.resultSection}>
                <Text style={styles.resultSubHeader}>Warning signs</Text>
                <View style={styles.flagsList}>
                  {result.redFlags.map((flag) => (
                    <View key={flag} style={styles.flagRow}>
                      <View style={[styles.flagDot, { backgroundColor: vc.color }]} />
                      <Text style={styles.flagText}>{flag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            <View style={styles.resultButtonsRow}>
              <TouchableOpacity onPress={readAloud} style={styles.secondaryBtn}>
                <Text style={styles.secondaryBtnText}>🔊 Read to me</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={alertFamily}
                disabled={alerted}
                style={[styles.primaryBtn, alerted ? styles.alertedBtn : null]}
              >
                <Text style={[styles.primaryBtnText, alerted ? styles.alertedBtnText : null]}>
                  {alerted ? '✓ Sent' : 'Alert family'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0A0F1E',
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: 'bold',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 14,
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  examplesContainer: {
    flexDirection: 'column',
    gap: 8,
  },
  exampleBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  exampleBtnText: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 14,
    fontWeight: '500',
  },
  uploadBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 20,
    padding: 16,
  },
  uploadIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  uploadIcon: {
    fontSize: 22,
  },
  uploadTexts: {
    flex: 1,
  },
  uploadTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  uploadDesc: {
    color: 'rgba(255, 255, 255, 0.35)',
    fontSize: 12,
    marginTop: 2,
  },
  photoPreviewCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  photoEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  photoCardTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  clearPhotoBtn: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearPhotoBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  dividerText: {
    color: 'rgba(255, 255, 255, 0.25)',
    fontSize: 13,
    marginHorizontal: 12,
  },
  inputWrapper: {
    position: 'relative',
  },
  textarea: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: '#FFF',
    fontSize: 16,
    minHeight: 110,
    textAlignVertical: 'top',
  },
  clearTextBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
  },
  clearTextText: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitBtn: {
    backgroundColor: '#1D46CC',
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  disabledBtn: {
    opacity: 0.3,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spinner: {
    marginRight: 8,
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 16,
  },
  resultCard: {
    borderWidth: 1.5,
    borderRadius: 20,
    padding: 16,
    marginTop: 10,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultEmoji: {
    fontSize: 32,
    marginRight: 10,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  resultDivider: {
    height: 1,
    marginBottom: 12,
  },
  resultSection: {
    marginBottom: 14,
  },
  explanationText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 15,
    lineHeight: 22,
  },
  resultSubHeader: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  whatToDoText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 15,
    lineHeight: 22,
  },
  flagsList: {
    flexDirection: 'column',
    gap: 6,
  },
  flagRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  flagText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
  },
  resultButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '600',
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: 'rgba(29, 70, 204, 0.2)',
    borderColor: 'rgba(29, 70, 204, 0.4)',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#2E5CE8',
    fontSize: 14,
    fontWeight: '600',
  },
  alertedBtn: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  alertedBtnText: {
    color: '#22C55E',
  },
})
