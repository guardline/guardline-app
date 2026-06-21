import { useEffect, useRef, useState } from 'react';
import {
  NativeModules,
  NativeEventEmitter,
  PermissionsAndroid,
  Platform,
} from 'react-native';

const { AudioModule } = NativeModules;

type AudioChunkHandler = (base64Chunk: string) => void;

export function useAudioStream(onChunk: AudioChunkHandler) {
  const [isListening, setIsListening] = useState(false);
  const chunkListenerRef = useRef<any>(null);
  const stateListenerRef = useRef<any>(null);

  useEffect(() => {
    if (!AudioModule) return;

    const emitter = new NativeEventEmitter(AudioModule);

    chunkListenerRef.current = emitter.addListener('audioChunk', onChunk);
    stateListenerRef.current = emitter.addListener(
      'listeningState',
      (listening: boolean) => setIsListening(listening),
    );

    return () => {
      chunkListenerRef.current?.remove();
      stateListenerRef.current?.remove();
    };
  }, [onChunk]);

  return { isAvailable: !!AudioModule, isListening };
}

export async function requestMicrophonePermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        title: 'Microphone Permission',
        message:
          'GuardLine needs access to your microphone to analyze calls for scam content.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
}

export function checkMicrophonePermission(): Promise<boolean> {
  if (!AudioModule) return Promise.resolve(false);
  return AudioModule.hasAudioPermission();
}
