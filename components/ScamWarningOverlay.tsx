import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Vibration,
} from 'react-native';

interface Props {
  visible: boolean;
  riskScore: number;
  flags: string[];
  onDismiss: () => void;
  onAlertFamily: () => void;
}

export default function ScamWarningOverlay({
  visible,
  riskScore,
  flags,
  onDismiss,
  onAlertFamily,
}: Props) {
  React.useEffect(() => {
    if (visible) {
      try {
        Vibration.vibrate([150, 80, 150, 80, 300]);
      } catch {}
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.emoji}>🚨</Text>
          <Text style={styles.title}>SCAM DETECTED</Text>

          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Risk Score</Text>
            <Text style={styles.scoreValue}>{riskScore}%</Text>
          </View>

          {flags.length > 0 && (
            <View style={styles.flagsContainer}>
              {flags.map(f => (
                <View key={f} style={styles.flagBadge}>
                  <Text style={styles.flagIcon}>⚠️</Text>
                  <Text style={styles.flagText}>{f}</Text>
                </View>
              ))}
            </View>
          )}

          <Text style={styles.advice}>
            Hang up immediately. This call shows clear signs of a scam.
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity onPress={onAlertFamily} style={styles.alertBtn}>
              <Text style={styles.alertBtnText}>Alert Family</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onDismiss} style={styles.dismissBtn}>
              <Text style={styles.dismissBtnText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#EF4444',
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    color: '#EF4444',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    width: '100%',
    marginBottom: 16,
  },
  scoreLabel: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
    fontWeight: '600',
  },
  scoreValue: {
    color: '#EF4444',
    fontSize: 20,
    fontWeight: 'bold',
  },
  flagsContainer: {
    width: '100%',
    marginBottom: 16,
    gap: 8,
  },
  flagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  flagIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  flagText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  advice: {
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  actions: {
    width: '100%',
    gap: 10,
  },
  alertBtn: {
    backgroundColor: '#DC2626',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  alertBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dismissBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  dismissBtnText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontWeight: '600',
  },
});
