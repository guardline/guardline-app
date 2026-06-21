const ELEVENLABS_API_KEY =
  'sk_5d4ad7d65e22253a633de53b54d0b0631330dd81d5548742';

export interface TranscriptResult {
  text: string;
  isFinal: boolean;
}

export interface STTStream {
  connect: () => void;
  sendAudio: (base64Chunk: string) => void;
  close: () => void;
}

export function createElevenLabsSTTStream(
  onTranscript: (result: TranscriptResult) => void,
  onError: (error: string) => void,
): STTStream {
  let ws: WebSocket | null = null;
  let isConnected = false;
  let sessionStarted = false;
  let chunkCount = 0;

  function connect() {
    const params = new URLSearchParams({
      model_id: 'scribe_v2_realtime',
    });

    const url = `wss://api.elevenlabs.io/v1/speech-to-text/realtime?${params.toString()}`;
    const WS = WebSocket as any;
    ws = new WS(url, [], {
      headers: { 'xi-api-key': ELEVENLABS_API_KEY },
    }) as WebSocket;

    ws.onopen = () => {
      isConnected = true;
    };

    ws.onmessage = (event: any) => {
      try {
        const data = JSON.parse(event.data as string);
        console.log(
          '[ElevenLabs-STT] message:',
          data.message_type,
          JSON.stringify(data),
        );
        switch (data.message_type) {
          case 'session_started':
            sessionStarted = true;
            break;
          case 'partial_transcript':
            if (data.transcript) {
              onTranscript({ text: data.transcript, isFinal: false });
            }
            break;
          case 'committed_transcript':
            if (data.transcript) {
              onTranscript({ text: data.transcript, isFinal: true });
            }
            break;
          case 'transcriber_error':
          case 'input_error':
            console.warn(
              '[ElevenLabs-STT] error:',
              data.error || data.message_type,
            );
            onError(data.error || data.message_type);
            break;
        }
      } catch {}
    };

    ws.onerror = () => {
      onError('ElevenLabs STT WebSocket error');
    };

    ws.onclose = () => {
      isConnected = false;
      sessionStarted = false;
    };
  }

  function sendAudio(base64Chunk: string) {
    if (!ws || !isConnected || !sessionStarted) return;
    chunkCount++;
    try {
      ws.send(
        JSON.stringify({
          message_type: 'input_audio_chunk',
          audio_base_64: base64Chunk,
          commit: chunkCount % 50 === 0,
          sample_rate: 16000,
        }),
      );
    } catch {}
  }

  function close() {
    if (ws) {
      try {
        ws.send(
          JSON.stringify({
            message_type: 'input_audio_chunk',
            audio_base_64: '',
            commit: true,
            sample_rate: 16000,
          }),
        );
      } catch {}
      ws.close();
      ws = null;
    }
    isConnected = false;
    sessionStarted = false;
  }

  return { connect, sendAudio, close };
}
