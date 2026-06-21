const DEEPGRAM_API_KEY = '882e0a6586ebb87b298b0d65fc84507c96ee1f1b';

export interface DeepgramTranscript {
  text: string;
  isFinal: boolean;
}

export interface DeepgramStream {
  connect: () => void;
  sendAudio: (base64Chunk: string) => void;
  close: () => void;
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const bytes: number[] = [];
  let i = 0;
  base64 = base64.replace(/[^A-Za-z0-9+/=]/g, '');
  while (i < base64.length) {
    const enc1 = chars.indexOf(base64[i++]);
    const enc2 = chars.indexOf(base64[i++]);
    const enc3 = chars.indexOf(base64[i++]);
    const enc4 = chars.indexOf(base64[i++]);
    const chr1 = (enc1 << 2) | (enc2 >> 4);
    const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    const chr3 = ((enc3 & 3) << 6) | enc4;
    bytes.push(chr1);
    if (enc3 !== -1) bytes.push(chr2);
    if (enc4 !== -1) bytes.push(chr3);
  }
  return new Uint8Array(bytes).buffer;
}

export function createDeepgramStream(
  onTranscript: (result: DeepgramTranscript) => void,
  onError: (error: string) => void,
): DeepgramStream {
  let ws: WebSocket | null = null;
  let isConnected = false;

  function connect() {
    const params = new URLSearchParams({
      access_token: DEEPGRAM_API_KEY,
      encoding: 'linear16',
      sample_rate: '16000',
      channels: '1',
      interim_results: 'true',
      endpointing: '500',
    });

    ws = new WebSocket(`wss://api.deepgram.com/v1/listen?${params.toString()}`);

    ws.onopen = () => {
      isConnected = true;
    };

    ws.onmessage = (event: WebSocketMessageEvent) => {
      try {
        const data = JSON.parse(event.data as string);
        if (data.type === 'Results') {
          const alt = data.channel?.alternatives?.[0];
          if (alt?.transcript) {
            onTranscript({ text: alt.transcript, isFinal: data.is_final });
          }
        }
      } catch {}
    };

    ws.onerror = () => {
      onError('Deepgram WebSocket error');
    };

    ws.onclose = () => {
      isConnected = false;
    };
  }

  function sendAudio(base64Chunk: string) {
    if (!ws || !isConnected) return;
    try {
      ws.send(base64ToArrayBuffer(base64Chunk));
    } catch {}
  }

  function close() {
    if (ws) {
      ws.close();
      ws = null;
    }
    isConnected = false;
  }

  return { connect, sendAudio, close };
}
