import { pickContact } from 'react-native-pick-contact'
import { setNotifyContact, type NotifyContact } from './store'

export async function pickAndSaveNotifyContact(): Promise<NotifyContact | null> {
  const picked = await pickContact()
  if (!picked) return null

  const contact: NotifyContact = {
    name: picked.name,
    phone: picked.phone,
  }
  await setNotifyContact(contact)
  return contact
}
