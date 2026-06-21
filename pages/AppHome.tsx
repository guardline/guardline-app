import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { getAlerts, type AlertEvent } from '../lib/store';

interface Props {
  onNavigateToCall: () => void;
  onNavigateToAlerts?: () => void;
}

export default function AppHome({
  onNavigateToCall,
  onNavigateToAlerts,
}: Props) {
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);

  useEffect(() => {
    setAlerts(getAlerts().slice(0, 3)); // Show top 3 recent alerts
  }, []);

  const formatTime = (iso: string) => {
    const ms = Date.now() - new Date(iso).getTime();
    const d = Math.floor(ms / 86400000);
    const h = Math.floor(ms / 3600000);
    const m = Math.floor(ms / 60000);
    if (d > 0) return `${d}d ago`;
    if (h > 0) return `${h}h ago`;
    if (m > 0) return `${m}m ago`;
    return 'just now';
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>GuardLine</Text>
          <Text style={styles.subtitle}>Scam protection</Text>
        </View>

        {/* Status card */}
        <View style={styles.statusCard}>
          <View style={styles.statusTextRow}>
            <View>
              <Text style={styles.statusLabel}>Current status</Text>
              <Text style={styles.statusVal}>Protected</Text>
            </View>
            <View style={styles.shieldBadge}>
              <Text style={styles.shieldBadgeIcon}>🛡️</Text>
            </View>
          </View>
        </View>

        {/* Try it out CTA */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Try it out</Text>
          <TouchableOpacity onPress={onNavigateToCall} style={styles.demoCard}>
            <View style={styles.demoIconWrapper}>
              <Text style={styles.demoIcon}>📞</Text>
            </View>
            <View style={styles.demoContent}>
              <Text style={styles.demoTitle}>Call Simulation</Text>
              <Text style={styles.demoDesc}>Test call protection</Text>
            </View>
            <Text style={styles.chevron}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Recent alerts */}
        <View style={styles.section}>
          <View style={styles.alertsHeaderRow}>
            <Text style={styles.sectionHeader}>Recent alerts</Text>
            {onNavigateToAlerts && (
              <TouchableOpacity onPress={onNavigateToAlerts}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.alertsList}>
            {alerts.map((item, idx) => (
              <View
                key={item.id}
                style={[
                  styles.alertRow,
                  idx === alerts.length - 1 ? styles.lastRow : null,
                ]}
              >
                <Text style={styles.alertIcon}>
                  {item.source === 'call' ? '📞' : '💬'}
                </Text>
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle} numberOfLines={1}>
                    {item.source === 'call'
                      ? 'Scam call blocked'
                      : 'Suspicious text flagged'}
                  </Text>
                  <Text style={styles.alertTime}>
                    {formatTime(item.createdAt)}
                  </Text>
                </View>
                <View style={styles.riskBadge}>
                  <Text style={styles.riskBadgeText}>{item.riskScore}</Text>
                </View>
              </View>
            ))}
            {alerts.length === 0 && (
              <Text style={styles.noAlertsText}>No recent alerts detected</Text>
            )}
          </View>
        </View>

        <Text style={styles.privacyNote}>
          🔒 Your data is never stored or shared
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0A0F1E',
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    flexGrow: 1,
  },
  header: {
    marginBottom: 24,
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
  statusCard: {
    backgroundColor: '#1D46CC',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 24,
  },
  statusTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 13,
    marginBottom: 2,
  },
  statusVal: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  shieldBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldBadgeIcon: {
    fontSize: 24,
  },
  section: {
    marginBottom: 24,
  },
  alertsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  viewAllText: {
    color: '#2E5CE8',
    fontSize: 13,
    fontWeight: '600',
  },
  sectionHeader: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  demoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 16,
  },
  demoIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(29, 70, 204, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  demoIcon: {
    fontSize: 22,
  },
  demoContent: {
    flex: 1,
  },
  demoTitle: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  demoDesc: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 13,
  },
  chevron: {
    color: 'rgba(255, 255, 255, 0.2)',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  alertsList: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 20,
    overflow: 'hidden',
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  alertIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  alertTime: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 11,
    marginTop: 2,
  },
  riskBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  riskBadgeText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: 'bold',
  },
  noAlertsText: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 20,
  },
  privacyNote: {
    color: 'rgba(255, 255, 255, 0.15)',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 'auto',
    paddingTop: 30,
  },
});
