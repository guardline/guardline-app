import { useCallback, useEffect, useRef, useState } from 'react';
import { useAudioStream } from './useAudioStream';
import {
  createElevenLabsSTTStream,
  type STTStream,
} from '../lib/elevenlabs-stt';
import { analyzeCallTranscript, type ScamAnalysis } from '../lib/gemini';
import { addAlert } from '../lib/store';

const ANALYSIS_INTERVAL = 3000;
const MIN_TEXT_LENGTH = 20;

export function useCallMonitor() {
  const [isListening, setIsListening] = useState(false);
  const [scamResult, setScamResult] = useState<ScamAnalysis | null>(null);
  const transcriptRef = useRef('');
  const sttRef = useRef<STTStream | null>(null);
  const analysisTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const analyzingRef = useRef(false);

  const handleTranscript = useCallback(
    (result: { text: string; isFinal: boolean }) => {
      if (result.isFinal) {
        transcriptRef.current +=
          (transcriptRef.current ? ' ' : '') + result.text;
      }
    },
    [],
  );

  const handleSTTError = useCallback((_error: string) => {
    // silently handle
  }, []);

  const handleAudioChunk = useCallback((base64Chunk: string) => {
    sttRef.current?.sendAudio(base64Chunk);
  }, []);

  const { isListening: nativeListening } = useAudioStream(handleAudioChunk);

  useEffect(() => {
    setIsListening(nativeListening);
  }, [nativeListening]);

  useEffect(() => {
    if (isListening) {
      sttRef.current = createElevenLabsSTTStream(
        handleTranscript,
        handleSTTError,
      );
      sttRef.current.connect();
    } else {
      sttRef.current?.close();
      sttRef.current = null;
      transcriptRef.current = '';
    }
  }, [isListening, handleTranscript, handleSTTError]);

  // Periodically send accumulated transcript to Gemini
  useEffect(() => {
    if (!isListening) {
      if (analysisTimerRef.current) {
        clearInterval(analysisTimerRef.current);
        analysisTimerRef.current = null;
      }
      return;
    }

    analysisTimerRef.current = setInterval(async () => {
      if (analyzingRef.current) return;
      const text = transcriptRef.current.trim();
      if (text.length < MIN_TEXT_LENGTH) return;

      analyzingRef.current = true;
      try {
        const result = await analyzeCallTranscript(text);
        if (result.riskScore >= 70) {
          setScamResult(result);
          addAlert({
            source: 'call',
            riskScore: result.riskScore,
            flags: result.redFlags,
            snippet: `"${text.slice(0, 120)}${text.length > 120 ? '…' : ''}"`,
            smsSent: true,
          });
        }
      } catch {
        // Gemini API error — skip this cycle
      } finally {
        analyzingRef.current = false;
      }
    }, ANALYSIS_INTERVAL);

    return () => {
      if (analysisTimerRef.current) {
        clearInterval(analysisTimerRef.current);
        analysisTimerRef.current = null;
      }
    };
  }, [isListening]);

  const dismissScam = useCallback(() => {
    setScamResult(null);
  }, []);

  return { isListening, scamResult, dismissScam };
}
