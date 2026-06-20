export interface AlertEvent {
  id: string
  source: 'call' | 'text'
  riskScore: number
  flags: string[]
  snippet: string
  smsSent: boolean
  createdAt: string
}

export interface Contact {
  id: string
  name: string
  phone: string
  relationship: string
  emoji: string
}

const SEED_ALERTS: AlertEvent[] = [
  {
    id: 'seed-1',
    source: 'call',
    riskScore: 97,
    flags: ['IRS impersonation', 'Gift card demand', 'Arrest threat'],
    snippet: '"This is Officer Morgan with the IRS. There is a federal warrant for your arrest…"',
    smsSent: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'seed-2',
    source: 'text',
    riskScore: 88,
    flags: ['Amazon impersonation', 'Fake refund', 'Urgency'],
    snippet: '"Your Amazon account has been charged $399. Call immediately to cancel this order…"',
    smsSent: true,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
]

const SEED_CONTACTS: Contact[] = [
  { id: 'c1', name: 'Sarah', phone: '(480) 555-0192', relationship: 'Daughter', emoji: '👩' }
]

// Simple in-memory storage to survive screen renders
let alertsCache: AlertEvent[] = [...SEED_ALERTS]
let contactsCache: Contact[] = [...SEED_CONTACTS]

// Generate simple unique IDs without crypto module
function uuid(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function getAlerts(): AlertEvent[] {
  return alertsCache
}

export function addAlert(alert: Omit<AlertEvent, 'id' | 'createdAt'>): AlertEvent {
  const ev: AlertEvent = {
    ...alert,
    id: uuid(),
    createdAt: new Date().toISOString(),
  }
  alertsCache = [ev, ...alertsCache]
  return ev
}

export function getContacts(): Contact[] {
  return contactsCache
}

export function saveContacts(contacts: Contact[]): void {
  contactsCache = contacts
}

export function addContact(contact: Omit<Contact, 'id'>): Contact {
  const c: Contact = {
    ...contact,
    id: uuid(),
  }
  contactsCache = [...contactsCache, c]
  return c
}
