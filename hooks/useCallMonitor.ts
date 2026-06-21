import { useCallback, useState } from 'react';
import { NativeModules, Platform } from 'react-native';

export interface ScamAnalysis {
  verdict: 'safe' | 'suspicious' | 'scam';
  riskScore: number;
  redFlags: string[];
  explanation: string;
  whatToDo: string;
}

export function useCallMonitor() {
  const [isListening] = useState(false);
  const [scamResult] = useState<ScamAnalysis | null>(null);

  const dismissScam = useCallback(() => {
    if (Platform.OS === 'android') {
      try {
        NativeModules.AudioModule.hideScamOverlay();
      } catch {}
    }
  }, []);

  return { isListening, scamResult, dismissScam };
}
