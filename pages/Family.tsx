import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
} from 'react-native';
import {
  getAlerts,
  getContacts,
  saveContacts,
  getSettings,
  updateSettings,
  type AlertEvent,
  type Contact,
  type NotifyContact,
  type AppSettings,
} from '../lib/store';
import { pickAndSaveNotifyContact } from '../lib/pickNotifyContact';

const EMOJIS = ['👩', '👨', '👴', '👵', '🧑', '👧', '👦', '🧒'];

interface Props {
  notifyContact: NotifyContact;
  onNotifyContactChange: (contact: NotifyContact) => void;
  onSettingsChange?: (settings: AppSettings) => void;
}

export default function Family({
  notifyContact,
  onNotifyContactChange,
  onSettingsChange,
}: Props) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    name: '',
    phone: '',
    relationship: '',
    emoji: '👩',
  });
  const [pickingContact, setPickingContact] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(getSettings());

  const toggleListeningIndicator = (val: boolean) => {
    const updated = updateSettings({ showListeningIndicator: val });
    setSettings(updated);
    onSettingsChange?.(updated);
  };

  const loadData = () => {
    setContacts(getContacts());
    setAlerts(getAlerts());
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAdd = () => {
    setDraft({ name: '', phone: '', relationship: '', emoji: '👩' });
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (c: Contact) => {
    setDraft(c);
    setEditId(c.id);
    setShowForm(true);
  };

  const saveForm = () => {
    if (!draft.name.trim()) return;
    let updated: Contact[];
    if (editId) {
      updated = contacts.map(c => (c.id === editId ? { ...c, ...draft } : c));
    } else {
      const newContact: Contact = {
        ...draft,
        id: Math.random().toString(36).substring(2, 11),
      };
      updated = [...contacts, newContact];
    }
    setContacts(updated);
    saveContacts(updated);
    setShowForm(false);
  };

  const deleteContact = (id: string) => {
    const updated = contacts.filter(c => c.id !== id);
    setContacts(updated);
    saveContacts(updated);
  };

  const changeAlertContact = async () => {
    setPickingContact(true);
    try {
      const contact = await pickAndSaveNotifyContact();
      if (contact) onNotifyContactChange(contact);
    } finally {
      setPickingContact(false);
    }
  };

  const timeAgo = (iso: string) => {
    const ms = Date.now() - new Date(iso).getTime();
    const d = Math.floor(ms / 86400000);
    const h = Math.floor(ms / 3600000);
    const m = Math.floor(ms / 60000);
    return d > 0
      ? `${d}d ago`
      : h > 0
      ? `${h}h ago`
      : m > 0
      ? `${m}m ago`
      : 'just now';
  };

  const riskStyle = (score: number) => {
    if (score >= 70) return { bg: 'rgba(239,68,68,0.12)', color: '#EF4444' };
    if (score >= 40) return { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B' };
    return { bg: 'rgba(34,197,94,0.12)', color: '#22C55E' };
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Family</Text>
            <Text style={styles.subtitle}>Contacts & alert history</Text>
          </View>
          <TouchableOpacity onPress={openAdd} style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* Alert contact settings */}
        <View style={styles.settingsCard}>
          <Text style={styles.settingsTitle}>Alert contact</Text>
          <Text style={styles.settingsDesc}>
            Shown in alerts when a scam is detected.
          </Text>
          <View style={styles.settingsContactRow}>
            <View style={styles.settingsAvatar}>
              <Text style={styles.settingsAvatarText}>📱</Text>
            </View>
            <View style={styles.settingsContactInfo}>
              <Text style={styles.settingsContactName}>
                {notifyContact.name}
              </Text>
              {notifyContact.phone ? (
                <Text style={styles.settingsContactPhone}>
                  {notifyContact.phone}
                </Text>
              ) : null}
            </View>
            <TouchableOpacity
              onPress={changeAlertContact}
              disabled={pickingContact}
              style={[
                styles.changeBtn,
                pickingContact ? styles.changeBtnDisabled : null,
              ]}
            >
              <Text style={styles.changeBtnText}>
                {pickingContact ? '…' : 'Change'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Listening indicator toggle */}
        <View style={styles.settingsCard}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleContent}>
              <Text style={styles.settingsTitle}>Listening indicator</Text>
              <Text style={styles.settingsDesc}>
                Show a small &ldquo;Listening&rdquo; badge during active call
                monitoring.
              </Text>
            </View>
            <Switch
              value={settings.showListeningIndicator}
              onValueChange={toggleListeningIndicator}
              trackColor={{
                false: 'rgba(255,255,255,0.15)',
                true: 'rgba(29,70,204,0.5)',
              }}
              thumbColor={settings.showListeningIndicator ? '#2E5CE8' : '#888'}
            />
          </View>
        </View>

        {/* Add/Edit form */}
        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>
              {editId ? 'Edit contact' : 'New contact'}
            </Text>

            {/* Emoji picker */}
            <View style={styles.emojiRow}>
              {EMOJIS.map(e => (
                <TouchableOpacity
                  key={e}
                  onPress={() => setDraft(d => ({ ...d, emoji: e }))}
                  style={[
                    styles.emojiBtn,
                    draft.emoji === e ? styles.emojiBtnActive : null,
                  ]}
                >
                  <Text style={styles.emojiText}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Fields */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Name</Text>
              <TextInput
                value={draft.name}
                onChangeText={val => setDraft(d => ({ ...d, name: val }))}
                placeholder="Sarah"
                placeholderTextColor="rgba(255,255,255,0.2)"
                style={styles.input}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Phone</Text>
              <TextInput
                value={draft.phone}
                onChangeText={val => setDraft(d => ({ ...d, phone: val }))}
                placeholder="(480) 555-0192"
                placeholderTextColor="rgba(255,255,255,0.2)"
                style={styles.input}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Relationship</Text>
              <TextInput
                value={draft.relationship}
                onChangeText={val =>
                  setDraft(d => ({ ...d, relationship: val }))
                }
                placeholder="Daughter"
                placeholderTextColor="rgba(255,255,255,0.2)"
                style={styles.input}
              />
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity
                onPress={() => setShowForm(false)}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={saveForm}
                disabled={!draft.name.trim()}
                style={[
                  styles.saveBtn,
                  !draft.name.trim() ? styles.saveBtnDisabled : null,
                ]}
              >
                <Text style={styles.saveBtnText}>
                  {editId ? 'Save' : 'Add contact'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Contacts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>
            Trusted Contacts ({contacts.length})
          </Text>
          <View style={styles.contactsList}>
            {contacts.map(c => (
              <View key={c.id} style={styles.contactCard}>
                <View style={styles.contactAvatar}>
                  <Text style={styles.contactAvatarText}>{c.emoji}</Text>
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{c.name}</Text>
                  <Text style={styles.contactPhone}>{c.phone}</Text>
                  <View style={styles.relationshipBadge}>
                    <Text style={styles.relationshipText}>
                      {c.relationship}
                    </Text>
                  </View>
                </View>
                <View style={styles.contactActions}>
                  <TouchableOpacity
                    onPress={() => openEdit(c)}
                    style={styles.actionIconButton}
                  >
                    <Text style={styles.actionIcon}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => deleteContact(c.id)}
                    style={styles.actionIconButton}
                  >
                    <Text style={styles.actionIcon}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            {contacts.length === 0 && (
              <Text style={styles.emptyText}>
                No contacts yet. Tap + Add above.
              </Text>
            )}
          </View>
        </View>

        {/* Alerts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>
            Alert History ({alerts.length})
          </Text>
          <View style={styles.alertsList}>
            {alerts.map(a => {
              const rs = riskStyle(a.riskScore);
              return (
                <View key={a.id} style={styles.alertCard}>
                  <Text style={styles.alertSourceIcon}>
                    {a.source === 'call' ? '📞' : '💬'}
                  </Text>
                  <View style={styles.alertCardContent}>
                    <View style={styles.alertMetaRow}>
                      <Text style={styles.alertMetaText}>
                        {a.source === 'call' ? 'Phone call' : 'Text'} ·{' '}
                        {timeAgo(a.createdAt)}
                      </Text>
                      {a.smsSent && (
                        <Text style={styles.smsSentTag}>SMS sent ✓</Text>
                      )}
                    </View>
                    <Text style={styles.snippetText} numberOfLines={2}>
                      {a.snippet}
                    </Text>
                    <View style={styles.flagsRow}>
                      <View
                        style={[styles.riskTag, { backgroundColor: rs.bg }]}
                      >
                        <Text style={[styles.riskTagText, { color: rs.color }]}>
                          Risk {a.riskScore}
                        </Text>
                      </View>
                      {a.flags.slice(0, 2).map(f => (
                        <View key={f} style={styles.flagTag}>
                          <Text style={styles.flagTagText}>{f}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              );
            })}
            {alerts.length === 0 && (
              <Text style={styles.emptyText}>No alerts generated yet.</Text>
            )}
          </View>
        </View>
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
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  addBtn: {
    backgroundColor: '#1D46CC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  settingsCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  settingsTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  settingsDesc: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 14,
  },
  settingsContactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(29,70,204,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingsAvatarText: {
    fontSize: 20,
  },
  settingsContactInfo: {
    flex: 1,
  },
  settingsContactName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingsContactPhone: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    marginTop: 2,
  },
  changeBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  changeBtnDisabled: {
    opacity: 0.5,
  },
  changeBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  formTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  emojiBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  emojiBtnActive: {
    borderColor: '#1D46CC',
    borderWidth: 2,
    backgroundColor: 'rgba(29,70,204,0.25)',
  },
  emojiText: {
    fontSize: 18,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  fieldLabel: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFF',
    fontSize: 15,
  },
  formActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 15,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#1D46CC',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  contactsList: {
    flexDirection: 'column',
    gap: 8,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.09)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
  },
  contactAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(29,70,204,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactAvatarText: {
    fontSize: 22,
  },
  contactInfo: {
    flex: 1,
    alignItems: 'flex-start',
  },
  contactName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactPhone: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    marginTop: 2,
    marginBottom: 4,
  },
  relationshipBadge: {
    backgroundColor: 'rgba(29,70,204,0.18)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  relationshipText: {
    color: '#2E5CE8',
    fontSize: 11,
    fontWeight: '500',
  },
  contactActions: {
    flexDirection: 'row',
    gap: 6,
  },
  actionIconButton: {
    padding: 6,
  },
  actionIcon: {
    fontSize: 16,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 20,
  },
  alertsList: {
    flexDirection: 'column',
    gap: 8,
  },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
  },
  alertSourceIcon: {
    fontSize: 20,
    marginRight: 10,
    marginTop: 2,
  },
  alertCardContent: {
    flex: 1,
  },
  alertMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  alertMetaText: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    fontWeight: '500',
  },
  smsSentTag: {
    color: '#22C55E',
    fontSize: 11,
    fontWeight: 'bold',
  },
  snippetText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 8,
  },
  flagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  riskTag: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  riskTagText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  flagTag: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  flagTagText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleContent: {
    flex: 1,
    marginRight: 16,
  },
});
