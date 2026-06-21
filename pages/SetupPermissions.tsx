import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  NativeModules,
  Platform,
} from 'react-native';
import {
  checkMicrophonePermission,
  requestMicrophonePermission,
} from '../hooks/useAudioStream';

const { AudioModule } = NativeModules;

const ANDROID = Platform.OS === 'android';

interface PermissionState {
  accessibility: boolean;
  microphone: boolean;
  overlay: boolean;
}

interface Props {
  onComplete: () => void;
}

export default function SetupPermissions({ onComplete }: Props) {
  const [perms, setPerms] = useState<PermissionState>({
    accessibility: false,
    microphone: false,
    overlay: false,
  });

  const checkAll = async () => {
    const mic = await checkMicrophonePermission();
    let overlay = false;
    let accessibility = false;
    if (AudioModule) {
      overlay = await AudioModule.hasOverlayPermission();
      accessibility = await AudioModule.hasAccessibilityEnabled();
    }
    setPerms({ accessibility, microphone: mic, overlay });
  };

  useEffect(() => {
    checkAll();
    const id = setInterval(checkAll, 1500);
    return () => clearInterval(id);
  }, []);

  const openAccessibilitySettings = () => {
    if (ANDROID && AudioModule) {
      AudioModule.openAccessibilitySettings();
    }
  };

  const openOverlaySettings = () => {
    if (ANDROID && AudioModule && Number(Platform.Version) >= 23) {
      AudioModule.openOverlaySettings();
    }
  };

  const handleRequestMic = async () => {
    const granted = await requestMicrophonePermission();
    setPerms(p => ({ ...p, microphone: granted }));
  };

  const allDone = perms.accessibility && perms.microphone && perms.overlay;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.iconWrapper}>
          <Text style={styles.icon}>🛡️</Text>
        </View>

        <Text style={styles.title}>Set up protection</Text>
        <Text style={styles.desc}>
          GuardLine needs a few permissions to monitor calls for scams.
        </Text>

        {/* Accessibility */}
        <View style={[styles.card, perms.accessibility && styles.cardDone]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardEmoji}>♿</Text>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Accessibility Service</Text>
              <Text style={styles.cardDesc}>
                Detects when you&apos;re on a call to start scam analysis.
              </Text>
            </View>
            {perms.accessibility ? (
              <Text style={styles.checkMark}>✓</Text>
            ) : null}
          </View>
          {!perms.accessibility && (
            <TouchableOpacity
              onPress={openAccessibilitySettings}
              style={styles.enableBtn}
            >
              <Text style={styles.enableBtnText}>
                Open Accessibility Settings
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Microphone */}
        <View style={[styles.card, perms.microphone && styles.cardDone]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardEmoji}>🎤</Text>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Microphone</Text>
              <Text style={styles.cardDesc}>
                Captures audio during calls to analyze for scam patterns.
              </Text>
            </View>
            {perms.microphone ? <Text style={styles.checkMark}>✓</Text> : null}
          </View>
          {!perms.microphone && (
            <TouchableOpacity
              onPress={handleRequestMic}
              style={styles.enableBtn}
            >
              <Text style={styles.enableBtnText}>Grant Microphone Access</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Overlay */}
        <View style={[styles.card, perms.overlay && styles.cardDone]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardEmoji}>🪟</Text>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Display Over Other Apps</Text>
              <Text style={styles.cardDesc}>
                Shows scam warnings as a popup over other apps.
              </Text>
            </View>
            {perms.overlay ? <Text style={styles.checkMark}>✓</Text> : null}
          </View>
          {!perms.overlay && (
            <TouchableOpacity
              onPress={openOverlaySettings}
              style={styles.enableBtn}
            >
              <Text style={styles.enableBtnText}>Grant Overlay Permission</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={onComplete}
          disabled={!allDone}
          style={[styles.continueBtn, !allDone && styles.continueBtnDisabled]}
        >
          <Text
            style={[
              styles.continueBtnText,
              !allDone && styles.continueBtnTextDisabled,
            ]}
          >
            {allDone ? 'Continue →' : 'Complete all permissions to continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0A0F1E',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 30,
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(29, 70, 204, 0.18)',
    borderColor: 'rgba(29, 70, 204, 0.3)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    alignSelf: 'center',
  },
  icon: {
    fontSize: 34,
  },
  title: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  desc: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  cardDone: {
    borderColor: 'rgba(34, 197, 94, 0.3)',
    backgroundColor: 'rgba(34, 197, 94, 0.06)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardEmoji: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  cardDesc: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 12,
    lineHeight: 16,
  },
  checkMark: {
    color: '#22C55E',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  enableBtn: {
    backgroundColor: 'rgba(29, 70, 204, 0.2)',
    borderColor: 'rgba(29, 70, 204, 0.4)',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  enableBtnText: {
    color: '#2E5CE8',
    fontSize: 14,
    fontWeight: 'bold',
  },
  continueBtn: {
    backgroundColor: '#1D46CC',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 'auto',
  },
  continueBtnDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  continueBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  continueBtnTextDisabled: {
    color: 'rgba(255, 255, 255, 0.25)',
  },
});
