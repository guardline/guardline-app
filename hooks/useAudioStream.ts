import { useEffect, useRef } from 'react';
import {
  NativeModules,
  NativeEventEmitter,
  PermissionsAndroid,
  Platform,
} from 'react-native';

const { AudioModule } = NativeModules;

type AudioChunkHandler = (base64Chunk: string) => void;

export function useAudioStream(onChunk: AudioChunkHandler) {
  const listenerRef = useRef<any>(null);
  const emitterRef = useRef<NativeEventEmitter | null>(null);

  useEffect(() => {
    if (!AudioModule) return;

    emitterRef.current = new NativeEventEmitter(AudioModule);
    listenerRef.current = emitterRef.current.addListener('audioChunk', onChunk);

    return () => {
      listenerRef.current?.remove();
    };
  }, [onChunk]);

  return { isAvailable: !!AudioModule };
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
