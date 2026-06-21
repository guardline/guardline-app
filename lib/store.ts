export interface AlertEvent {
  id: string;
  source: 'call' | 'text';
  riskScore: number;
  flags: string[];
  snippet: string;
  smsSent: boolean;
  createdAt: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  emoji: string;
}

/** Contact shown in demo alerts (picked via native contact picker). */
export interface NotifyContact {
  name: string;
  phone: string;
}

const NOTIFY_CONTACT_KEY = 'guardline_notify_contact';

const SEED_ALERTS: AlertEvent[] = [
  {
    id: 'seed-1',
    source: 'call',
    riskScore: 97,
    flags: ['IRS impersonation', 'Gift card demand', 'Arrest threat'],
    snippet:
      '"This is Officer Morgan with the IRS. There is a federal warrant for your arrest…"',
    smsSent: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'seed-2',
    source: 'text',
    riskScore: 88,
    flags: ['Amazon impersonation', 'Fake refund', 'Urgency'],
    snippet:
      '"Your Amazon account has been charged $399. Call immediately to cancel this order…"',
    smsSent: true,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

const SEED_CONTACTS: Contact[] = [];

export interface AppSettings {
  showListeningIndicator: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  showListeningIndicator: false,
};

let settingsCache: AppSettings = { ...DEFAULT_SETTINGS };

export function getSettings(): AppSettings {
  return { ...settingsCache };
}

export function updateSettings(partial: Partial<AppSettings>): AppSettings {
  settingsCache = { ...settingsCache, ...partial };
  return { ...settingsCache };
}

// Simple in-memory storage to survive screen renders
let alertsCache: AlertEvent[] = [...SEED_ALERTS];
let contactsCache: Contact[] = [...SEED_CONTACTS];
let notifyContactCache: NotifyContact | null = null;
let notifyContactLoaded = false;

// Generate simple unique IDs without crypto module
function uuid(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

export function getAlerts(): AlertEvent[] {
  return alertsCache;
}

export function addAlert(
  alert: Omit<AlertEvent, 'id' | 'createdAt'>,
): AlertEvent {
  const ev: AlertEvent = {
    ...alert,
    id: uuid(),
    createdAt: new Date().toISOString(),
  };
  alertsCache = [ev, ...alertsCache];
  return ev;
}

export function getContacts(): Contact[] {
  return contactsCache;
}

export function saveContacts(contacts: Contact[]): void {
  contactsCache = contacts;
}

export function addContact(contact: Omit<Contact, 'id'>): Contact {
  const c: Contact = {
    ...contact,
    id: uuid(),
  };
  contactsCache = [...contactsCache, c];
  return c;
}

export function getNotifyContact(): NotifyContact | null {
  return notifyContactCache;
}

export function hasNotifyContact(): boolean {
  return notifyContactCache !== null;
}

export async function loadNotifyContact(): Promise<NotifyContact | null> {
  if (notifyContactLoaded) return notifyContactCache;

  const AsyncStorage = (
    await import('@react-native-async-storage/async-storage')
  ).default;
  const raw = await AsyncStorage.getItem(NOTIFY_CONTACT_KEY);
  notifyContactLoaded = true;

  if (raw) {
    try {
      notifyContactCache = JSON.parse(raw) as NotifyContact;
    } catch {
      notifyContactCache = null;
    }
  }

  return notifyContactCache;
}

export async function setNotifyContact(contact: NotifyContact): Promise<void> {
  notifyContactCache = contact;
  notifyContactLoaded = true;

  const AsyncStorage = (
    await import('@react-native-async-storage/async-storage')
  ).default;
  await AsyncStorage.setItem(NOTIFY_CONTACT_KEY, JSON.stringify(contact));
}
