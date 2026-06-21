import { Alert } from 'react-native'

const API_KEY = "sk_5d4ad7d65e22253a633de53b54d0b0631330dd81d5548742"
const VOICE_MALE = 'onwK4e9ZLuTAKqWW03F9'

export function stopSpeaking() {
  // No-op for visual alerts
}

export async function speak(text: string): Promise<void> {
  stopSpeaking()

  if (!API_KEY || API_KEY === 'your_elevenlabs_api_key_here') {
    Alert.alert('Voice Alert', text)
    return
  }

  // If ElevenLabs API Key is present, we can show a mock response or log the call
  // Since browser Audio is not available, we visually display it as a speech fallback
  Alert.alert('Voice Alert (ElevenLabs)', text)
}
