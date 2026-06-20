import React from 'react'
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native'
import ShieldLogo from '../components/ShieldLogo'

interface Props {
  onOpenApp: () => void
}

const features = [
  {
    icon: '📞',
    title: 'Live Call Shield',
    desc: 'GuardLine listens in real time, scoring every call as it happens and alerting you before you make a mistake.',
  },
  {
    icon: '💬',
    title: 'Text Scam Checker',
    desc: 'Paste text, upload a screenshot, or drop an image. AI breaks down every red flag in plain English.',
  },
  {
    icon: '👨‍👩‍👧',
    title: 'Family Alerts',
    desc: "When a scam is detected, all your trusted contacts get an instant alert — so your family always has your back.",
  },
]

const steps = [
  { num: '1', title: 'GuardLine listens', desc: 'Runs quietly in the background during calls and texts.' },
  { num: '2', title: 'AI detects threats', desc: 'Scores risk in real time with reasons explained clearly.' },
  { num: '3', title: 'Family is alerted', desc: 'Sends an instant SMS to your loved ones if a scam is found.' },
]

export default function Landing({ onOpenApp }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header/Nav */}
        <View style={styles.nav}>
          <View style={styles.logoRow}>
            <ShieldLogo size={24} />
            <Text style={styles.brandText}>GuardLine</Text>
          </View>
          <TouchableOpacity onPress={onOpenApp} style={styles.navBtn}>
            <Text style={styles.navBtnText}>Open App</Text>
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.logoWrapper}>
            <ShieldLogo size={90} animate />
          </View>
          <Text style={styles.heroTitle}>
            Scams hang up.{'\n'}
            <Text style={styles.blueText}>Family stays close.</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            GuardLine uses AI to detect scam patterns on every call, text, and screenshot — and silently alerts your family when something's wrong.
          </Text>

          <TouchableOpacity onPress={onOpenApp} style={styles.ctaButton}>
            <Text style={styles.ctaButtonText}>Open GuardLine →</Text>
          </TouchableOpacity>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Everything your family needs</Text>
          {features.map((f, idx) => (
            <View key={idx} style={styles.featureCard}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* How it works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How it works</Text>
          {steps.map((s, idx) => (
            <View key={idx} style={styles.stepRow}>
              <View style={styles.stepNumCircle}>
                <Text style={styles.stepNumText}>{s.num}</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{s.title}</Text>
                <Text style={styles.stepDesc}>{s.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Testimonial */}
        <View style={styles.testimonialCard}>
          <Text style={styles.testimonialIcon}>🔑</Text>
          <Text style={styles.testimonialQuote}>
            "Mom almost lost $3,000 to an IRS phone scam. GuardLine caught it in 14 seconds and texted me before she even had a chance to drive to the store. I cried with relief."
          </Text>
          <Text style={styles.testimonialAuthor}>
            — Sarah M., daughter of GuardLine user in Phoenix, AZ
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLogoRow}>
            <ShieldLogo size={18} />
            <Text style={styles.footerBrand}>GuardLine</Text>
          </View>
          <Text style={styles.footerDesc}>
            AI that listens for scams, so they don't.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0A0F1E',
  },
  scroll: {
    paddingBottom: 40,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  navBtn: {
    backgroundColor: 'rgba(29,70,204,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(29,70,204,0.4)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  navBtnText: {
    color: '#2E5CE8',
    fontSize: 14,
    fontWeight: '600',
  },
  hero: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  logoWrapper: {
    marginBottom: 20,
  },
  heroTitle: {
    color: '#FFF',
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 42,
    marginBottom: 15,
  },
  blueText: {
    color: '#2E5CE8',
  },
  heroSubtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  ctaButton: {
    backgroundColor: '#1D46CC',
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 16,
    shadowColor: '#1D46CC',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 8,
  },
  ctaButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: '#162040',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  featureDesc: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 13,
    lineHeight: 18,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  stepNumCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1D46CC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepNumText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  stepDesc: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 13,
  },
  testimonialCard: {
    marginHorizontal: 20,
    borderColor: 'rgba(29, 70, 204, 0.25)',
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
    backgroundColor: 'rgba(29, 70, 204, 0.05)',
    alignItems: 'center',
    marginBottom: 40,
  },
  testimonialIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  testimonialQuote: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  testimonialAuthor: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 30,
    marginHorizontal: 20,
  },
  footerLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  footerBrand: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  footerDesc: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 12,
  },
})
