import React from 'react';
import ListeningIndicator from './ListeningIndicator';
import ScamWarningOverlay from './ScamWarningOverlay';
import { useCallMonitor } from '../hooks/useCallMonitor';
import { getNotifyContact } from '../lib/store';
import { speak } from '../lib/elevenlabs';

interface Props {
  showListeningIndicator: boolean;
}

export default function CallMonitor({ showListeningIndicator }: Props) {
  const { isListening, scamResult, dismissScam } = useCallMonitor();

  const handleAlertFamily = () => {
    const contactName = getNotifyContact()?.name ?? 'your contact';
    speak(`Alert sent to ${contactName}. They have been notified.`).catch(
      () => {},
    );
  };

  return (
    <>
      {showListeningIndicator && <ListeningIndicator visible={isListening} />}
      <ScamWarningOverlay
        visible={!!scamResult}
        riskScore={scamResult?.riskScore ?? 0}
        flags={scamResult?.redFlags ?? []}
        onDismiss={dismissScam}
        onAlertFamily={handleAlertFamily}
      />
    </>
  );
}
