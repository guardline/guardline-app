import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Vibration,
  Linking,
  Alert,
} from 'react-native'
import RiskRing from '../components/RiskRing'
import { addAlert } from '../lib/store'

const SCRIPT = [
  {
    delay: 900,
    text: 'Hello, this is Officer Daniel Morgan with the IRS Criminal Investigation Division.',
    targetRisk: 12,
    flag: 'Impersonation of IRS' as const,
  },
  {
    delay: 5000,
    text: 'There is a federal warrant for your arrest due to unpaid taxes.',
    targetRisk: 38,
    flag: 'Threat of arrest' as const,
  },
  {
    delay: 10500,
    text: 'To avoid arrest today, you must pay $2,400 immediately.',
    targetRisk: 71,
    flag: 'Urgency / Isolation' as const,
  },
  {
    delay: 16000,
    text: 'Please go to the nearest Target and purchase Google Play gift cards.',
    targetRisk: 94,
    flag: 'Gift card payment' as const,
  },
  {
    delay: 22000,
    text: 'Do not hang up or speak to anyone. Stay on the line with me.',
    targetRisk: 99,
    flag: null,
  },
] as const

type Phase = 'idle' | 'calling' | 'ended'

interface Props {
  onBackToHome: () => void
}

export default function CallDemo({ onBackToHome }: Props) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [displayScore, setDisplayScore] = useState(0)
  const [completedLines, setCompletedLines] = useState<string[]>([])
  const [typingText, setTypingText] = useState('')
  const [redFlags, setRedFlags] = useState<string[]>([])
  const [scamDetected, setScamDetected] = useState(false)
  const [smsVisible, setSmsVisible] = useState(false)
  const [flashRed, setFlashRed] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  const scoreRef = useRef(0)
  const targetScoreRef = useRef(0)
  const rafRef = useRef<number>(0)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const typeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const transcriptScrollRef = useRef<ScrollView>(null)
  const scamTriggeredRef = useRef(false)
  const smsTriggeredRef = useRef(false)

  // Smooth score counter via rAF (or setInterval for RN compatibility if rAF runs differently on some platforms)
  useEffect(() => {
    const tick = () => {
      if (scoreRef.current < targetScoreRef.current) {
        const diff = targetScoreRef.current - scoreRef.current
        scoreRef.current += Math.max(1, Math.ceil(diff * 0.04))
        if (scoreRef.current > targetScoreRef.current) scoreRef.current = targetScoreRef.current
        setDisplayScore(scoreRef.current)
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  // Elapsed clock
  useEffect(() => {
    if (phase !== 'calling') return
    const id = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(id)
  }, [phase])

  const typeOut = useCallback((text: string, onDone: () => void) => {
    if (typeTimerRef.current) clearInterval(typeTimerRef.current)
    let i = 0
    setTypingText('')
    typeTimerRef.current = setInterval(() => {
      i++
      setTypingText(text.slice(0, i))
      if (i >= text.length) {
        if (typeTimerRef.current) clearInterval(typeTimerRef.current)
        onDone()
      }
    }, 26)
  }, [])

  const triggerScamDetected = useCallback(() => {
    if (scamTriggeredRef.current) return
    scamTriggeredRef.current = true
    setScamDetected(true)
    setFlashRed(true)
    setTimeout(() => setFlashRed(false), 700)

    try {
      Vibration.vibrate([150, 80, 150, 80, 300])
    } catch {}

    Alert.alert(
      '⚠️ SCAM DETECTED',
      'Warning! This call sounds like a scam. Please hang up immediately and contact family.',
      [{ text: 'Dismiss' }]
    )
  }, [])

  const triggerSmsSent = useCallback(() => {
    if (smsTriggeredRef.current) return
    smsTriggeredRef.current = true
    const t = setTimeout(() => {
      setSmsVisible(true)
      addAlert({
        source: 'call',
        riskScore: 94,
        flags: ['Impersonation of IRS', 'Threat of arrest', 'Gift card payment', 'Urgency / Isolation'],
        snippet: '"Hello, this is Officer Daniel Morgan with the IRS Criminal Investigation Division…"',
        smsSent: true,
      })
    }, 2200)
    timersRef.current.push(t)
  }, [])

  const startCall = useCallback(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    if (typeTimerRef.current) clearInterval(typeTimerRef.current)

    scoreRef.current = 0
    targetScoreRef.current = 0
    scamTriggeredRef.current = false
    smsTriggeredRef.current = false
    setDisplayScore(0)
    setCompletedLines([])
    setTypingText('')
    setRedFlags([])
    setScamDetected(false)
    setSmsVisible(false)
    setFlashRed(false)
    setElapsed(0)
    setPhase('calling')

    SCRIPT.forEach((item) => {
      const t = setTimeout(() => {
        targetScoreRef.current = item.targetRisk

        if (item.flag) {
          setRedFlags((prev) => (prev.includes(item.flag!) ? prev : [...prev, item.flag!]))
        }

        if (item.targetRisk >= 70) triggerScamDetected()
        if (item.targetRisk >= 90) triggerSmsSent()

        typeOut(item.text, () => {
          setCompletedLines((prev) => [...prev, item.text])
          setTypingText('')
        })
      }, item.delay)
      timersRef.current.push(t)
    })
  }, [typeOut, triggerScamDetected, triggerSmsSent])

  const endCall = useCallback(() => {
    timersRef.current.forEach(clearTimeout)
    if (typeTimerRef.current) clearInterval(typeTimerRef.current)
    setPhase('ended')
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout)
      if (typeTimerRef.current) clearInterval(typeTimerRef.current)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const fmtTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return (
    <SafeAreaView style={[styles.safe, flashRed ? styles.flashBg : null]}>
      {/* ── IDLE SCREEN ─────────────────────────────────────── */}
      {phase === 'idle' && (
        <View style={styles.idleContainer}>
          <Text style={styles.idleSubtitle}>Live Call Demo</Text>
          <Text style={styles.idleTitle}>Watch AI catch a scam</Text>
          <Text style={styles.idleDesc}>
            A scripted IRS scam call plays out. Watch the risk score climb and scam detection trigger in real time.
          </Text>

          {/* Preview Card */}
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <View style={styles.unknownBadge}>
                <Text style={styles.unknownText}>📵</Text>
              </View>
              <View>
                <Text style={styles.callerName}>Unknown Caller</Text>
                <Text style={styles.callerPhone}>(202) 555-0143</Text>
              </View>
            </View>
            <View style={styles.chipRow}>
              <View style={styles.redChip}>
                <Text style={styles.redChipText}>⚠️ IRS Tax Division</Text>
              </View>
              <View style={styles.redChip}>
                <Text style={styles.redChipText}>🔴 Unverified</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity onPress={startCall} style={styles.startBtn}>
            <Text style={styles.startBtnText}>🔴 Start Demo Call</Text>
          </TouchableOpacity>
          <Text style={styles.durationNote}>Duration: ~25 seconds.</Text>
        </View>
      )}

      {/* ── CALLING SCREEN ───────────────────────────────────── */}
      {phase === 'calling' && (
        <View style={styles.callingContainer}>
          {/* Top Banner Alert */}
          {scamDetected && (
            <View style={styles.alertBanner}>
              <Text style={styles.alertBannerEmoji}>⚠️</Text>
              <View style={styles.alertBannerTextWrapper}>
                <Text style={styles.alertBannerTitle}>SCAM DETECTED</Text>
                <Text style={styles.alertBannerDesc}>Hang up immediately — alerting family</Text>
              </View>
              <View style={styles.alertBannerScoreBadge}>
                <Text style={styles.alertBannerScoreText}>{displayScore}%</Text>
              </View>
            </View>
          )}

          {/* Caller Header Card */}
          <View style={styles.callerHeader}>
            <View style={styles.callerHeaderMain}>
              <View style={styles.callerHeaderAvatar}>
                <Text style={styles.callerHeaderAvatarEmoji}>📵</Text>
              </View>
              <View style={styles.callerHeaderTexts}>
                <Text style={styles.callerHeaderName}>Unknown — (202) 555-0143</Text>
                <Text style={styles.callerHeaderStatus}>Connected · {fmtTime(elapsed)}</Text>
              </View>
              <View style={styles.callerHeaderLabelBadge}>
                <Text style={styles.callerHeaderLabelText}>⚠️ IRS Tax Division</Text>
              </View>
            </View>
          </View>

          {/* Risk Ring + Red Flags row */}
          <View style={styles.riskRow}>
            <RiskRing score={displayScore} size={94} showLabel />
            <View style={styles.flagsListWrapper}>
              <Text style={styles.flagsListHeader}>Red Flags Detected</Text>
              <View style={styles.flagsCol}>
                {redFlags.map((flag) => (
                  <View key={flag} style={styles.flagBadge}>
                    <View style={styles.flagBadgeDot} />
                    <Text style={styles.flagBadgeText} numberOfLines={1}>{flag}</Text>
                  </View>
                ))}
                {redFlags.length === 0 && (
                  <Text style={styles.analyzingText}>Analyzing…</Text>
                )}
              </View>
            </View>
          </View>

          {/* Transcript Panel */}
          <View style={styles.transcriptWrapper}>
            <Text style={styles.transcriptLabel}>Live Transcript</Text>
            <ScrollView
              ref={transcriptScrollRef}
              style={styles.transcriptScroll}
              contentContainerStyle={styles.transcriptContent}
              onContentSizeChange={() => transcriptScrollRef.current?.scrollToEnd({ animated: true })}
            >
              {completedLines.map((line, idx) => (
                <View key={idx} style={styles.transcriptBubble}>
                  <Text style={styles.bubbleAuthor}>Caller</Text>
                  <Text style={styles.bubbleText}>{line}</Text>
                </View>
              ))}
              {typingText ? (
                <View style={[styles.transcriptBubble, styles.bubbleTyping]}>
                  <Text style={styles.bubbleAuthor}>Caller</Text>
                  <Text style={styles.bubbleText}>
                    {typingText}
                    <Text style={styles.typingDot}>|</Text>
                  </Text>
                </View>
              ) : null}
              {completedLines.length === 0 && !typingText && (
                <View style={styles.listeningRow}>
                  <View style={styles.listeningDot} />
                  <Text style={styles.listeningText}>Listening…</Text>
                </View>
              )}
            </ScrollView>
          </View>

          {/* Hang up or SMS Delivery Banner */}
          {smsVisible ? (
            <View style={styles.smsSlideUp}>
              <View style={styles.smsHeader}>
                <Text style={styles.smsTitle}>Alert sent to Sarah (daughter)</Text>
                <Text style={styles.smsCheck}>✓</Text>
              </View>
              <Text style={styles.smsBody}>
                "Mom may be on a scam call right now. AI confidence: 94%. Transcript attached. Please call her immediately."
              </Text>
              <Text style={styles.smsDeliveredNote}>SMS delivered · just now</Text>

              <TouchableOpacity onPress={endCall} style={styles.smsHangupBtn}>
                <Text style={styles.smsHangupText}>Hang Up — I'm Safe</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.actionBtnRow}>
              <TouchableOpacity onPress={endCall} style={styles.endBtn}>
                <Text style={styles.endBtnText}>End Call</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* ── ENDED SCREEN ─────────────────────────────────────── */}
      {phase === 'ended' && (
        <ScrollView contentContainerStyle={styles.endedContainer}>
          <View style={styles.endedStatusHeader}>
            <View style={styles.shieldWrapper}>
              <Text style={styles.shieldEmoji}>🛡️</Text>
            </View>
            <Text style={styles.endedTitle}>You stayed safe.</Text>
            <Text style={styles.endedDesc}>
              GuardLine detected the scam in {fmtTime(elapsed)} and alerted your family.
            </Text>
          </View>

          {/* Report section */}
          <View style={styles.reportBox}>
            <Text style={styles.reportHeader}>Report (202) 555-0143</Text>
            <Text style={styles.reportDesc}>Help protect others by reporting this fraud number.</Text>
            
            <View style={styles.linksCol}>
              <TouchableOpacity
                onPress={() => Linking.openURL('https://reportfraud.ftc.gov')}
                style={styles.linkCard}
              >
                <Text style={styles.linkIcon}>🏛️</Text>
                <View style={styles.linkContent}>
                  <Text style={styles.linkLabel}>Report to FTC</Text>
                  <Text style={styles.linkSub}>reportfraud.ftc.gov</Text>
                </View>
                <Text style={styles.linkChevron}>↗</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => Linking.openURL('https://safebrowsing.google.com/safebrowsing/report_phish/')}
                style={styles.linkCard}
              >
                <Text style={styles.linkIcon}>🛡️</Text>
                <View style={styles.linkContent}>
                  <Text style={styles.linkLabel}>Google Safe Browsing</Text>
                  <Text style={styles.linkSub}>Flag fraud site/number</Text>
                </View>
                <Text style={styles.linkChevron}>↗</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.endedActions}>
            <TouchableOpacity onPress={startCall} style={styles.retryBtn}>
              <Text style={styles.retryBtnText}>Run Demo Again</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onBackToHome} style={styles.backBtn}>
              <Text style={styles.backBtnText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0A0F1E',
  },
  flashBg: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  idleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  idleSubtitle: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  idleTitle: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  idleDesc: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  previewCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    width: '100%',
    maxWidth: 300,
    marginBottom: 24,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  unknownBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.25)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  unknownText: {
    fontSize: 18,
  },
  callerName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  callerPhone: {
    color: 'rgba(255, 255, 255, 0.35)',
    fontSize: 11,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  redChip: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.25)',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  redChipText: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: '600',
  },
  startBtn: {
    backgroundColor: '#DC2626',
    borderRadius: 20,
    paddingVertical: 18,
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  startBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  durationNote: {
    color: 'rgba(255, 255, 255, 0.25)',
    fontSize: 11,
  },
  callingContainer: {
    flex: 1,
    paddingTop: 10,
  },
  alertBanner: {
    backgroundColor: '#EF4444',
    borderRadius: 16,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#EF4444',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  alertBannerEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  alertBannerTextWrapper: {
    flex: 1,
  },
  alertBannerTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  alertBannerDesc: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    marginTop: 1,
  },
  alertBannerScoreBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  alertBannerScoreText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  callerHeader: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  callerHeaderMain: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(22, 32, 64, 0.8)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
  },
  callerHeaderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  callerHeaderAvatarEmoji: {
    fontSize: 18,
  },
  callerHeaderTexts: {
    flex: 1,
  },
  callerHeaderName: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  callerHeaderStatus: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    marginTop: 2,
  },
  callerHeaderLabelBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  callerHeaderLabelText: {
    color: '#EF4444',
    fontSize: 9,
    fontWeight: 'bold',
  },
  riskRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 16,
  },
  flagsListWrapper: {
    flex: 1,
  },
  flagsListHeader: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  flagsCol: {
    flexDirection: 'column',
    gap: 6,
  },
  flagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.25)',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  flagBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginRight: 6,
  },
  flagBadgeText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '500',
  },
  analyzingText: {
    color: 'rgba(255, 255, 255, 0.25)',
    fontSize: 12,
    fontStyle: 'italic',
  },
  transcriptWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  transcriptLabel: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  transcriptScroll: {
    flex: 1,
    backgroundColor: 'rgba(22, 32, 64, 0.4)',
    borderRadius: 20,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  transcriptContent: {
    paddingVertical: 12,
    gap: 8,
  },
  transcriptBubble: {
    backgroundColor: 'rgba(22, 32, 64, 0.5)',
    borderRadius: 14,
    padding: 10,
    alignSelf: 'stretch',
  },
  bubbleTyping: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  bubbleAuthor: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 9,
    fontWeight: '600',
    marginBottom: 2,
  },
  bubbleText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    lineHeight: 18,
  },
  typingDot: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  listeningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  listeningDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1D46CC',
    marginRight: 8,
  },
  listeningText: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 13,
    fontStyle: 'italic',
  },
  actionBtnRow: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  endBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endBtnText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
  smsSlideUp: {
    backgroundColor: '#162040',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
  },
  smsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  smsTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  smsCheck: {
    color: '#22C55E',
    fontSize: 18,
    fontWeight: 'bold',
  },
  smsBody: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  smsDeliveredNote: {
    color: '#22C55E',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  smsHangupBtn: {
    backgroundColor: '#1D46CC',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  smsHangupText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  endedContainer: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: 'stretch',
  },
  endedStatusHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  shieldWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(29, 70, 204, 0.18)',
    borderColor: 'rgba(29, 70, 204, 0.3)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  shieldEmoji: {
    fontSize: 40,
  },
  endedTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  endedDesc: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  reportBox: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    marginBottom: 30,
  },
  reportHeader: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  reportDesc: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 12,
    marginBottom: 16,
  },
  linksCol: {
    flexDirection: 'column',
    gap: 8,
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
  },
  linkIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  linkContent: {
    flex: 1,
  },
  linkLabel: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  linkSub: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    marginTop: 2,
  },
  linkChevron: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 16,
    fontWeight: 'bold',
  },
  endedActions: {
    flexDirection: 'column',
    gap: 10,
  },
  retryBtn: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  retryBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  backBtn: {
    backgroundColor: '#1D46CC',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  backBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
})
